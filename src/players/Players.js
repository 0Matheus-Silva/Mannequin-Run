import { LocalStore,summarize } from './LocalStore.js';
export class Players {
  constructor(game,assistant) {
    this.game=game;this.assistant=assistant;this.current=null;this.activeRun=null;this.tail=Promise.resolve();this.apiConfig=null;this.pendingStart=null;this.flushing=false;
    this.dialog=document.querySelector('#players-dialog');this.status=document.querySelector('#players-status');
    this.ready=this.initialize();
    for(const type of ['runstart','runfinish','checkpoint','statechange','beforerunreset'])game.events.addEventListener(type,e=>this.onGame(type,e.detail));
    addEventListener('online',()=>this.flush());
    document.addEventListener('visibilitychange',()=>{if(document.hidden)this.capture('running');});
    this.timer=setInterval(()=>{if(this.game.state==='playing')this.capture('running');void this.flush();},15000);
    this.bind();
  }
  async initialize(){try{this.local=await new LocalStore().open();this.note('Perfis locais prontos.');await this.flush();}catch{this.note('Armazenamento indisponível. Jogue como visitante sem salvar.');}}
  note(text){this.status.textContent=text;document.querySelector('#profile-status').textContent=text;}
  bind(){
    document.querySelector('#play').onclick=()=>this.requestStart(()=>this.game.beginRun());
    document.querySelector('#chapter-start').onclick=()=>{const id=document.querySelector('#story-chapter').value;document.querySelector('#chapters').close();this.requestStart(()=>this.game.launchChapter(id));};
    document.querySelector('#profiles-open').onclick=()=>this.open();
    document.querySelector('#player-search').oninput=()=>{clearTimeout(this.searchTimer);this.searchTimer=setTimeout(()=>this.search(),180);};
    document.querySelector('#player-new').onclick=()=>this.create();
    document.querySelector('#player-play').onclick=()=>{this.dialog.close();const start=this.pendingStart||(()=>this.game.beginRun());this.pendingStart=null;start();};
    document.querySelector('#player-resume').onclick=()=>this.resume();
    document.querySelector('#player-guest').onclick=async()=>{await this.endVisitor();this.dialog.close();const start=this.pendingStart||(()=>this.game.beginRun());this.pendingStart=null;start();};
    document.querySelector('#player-close').onclick=()=>{this.dialog.close();this.pendingStart=null;};
    document.querySelector('#player-end-session').onclick=()=>this.endVisitor();
    document.querySelector('#player-delete').onclick=()=>this.deleteCurrent();
    document.querySelector('#ranking-mode').onchange=()=>this.ranking();
    document.querySelector('#players-export').onclick=()=>this.export();
  }
  async requestStart(start){await this.ready;this.pendingStart=start;await this.open();document.querySelector('#player-search').focus();}
  async open(){if(['playing','starting','ending','falling','victory'].includes(this.game.state))this.game.pause();if(!this.dialog.open)this.dialog.showModal();await this.ready;await this.search();await this.ranking();}
  async api(path,{method='GET',body}={}){
    if(!this.apiConfig){const r=await fetch('/api/local/config',{cache:'no-store'});if(!r.ok)throw Error('Backend local indisponível');this.apiConfig=await r.json();}
    const r=await fetch(path,{method,headers:{'Content-Type':'application/json','X-Local-CSRF':this.apiConfig.csrf},body:body===undefined?undefined:JSON.stringify(body),signal:AbortSignal.timeout(6000)});
    if(!r.ok){if(r.status===403)this.apiConfig=null;throw Error(r.status===503?'MySQL indisponível; salvamento pendente.':'Não foi possível concluir a operação local ('+r.status+').');}return r.json();
  }
  async create(){
    await this.ready;const name=document.querySelector('#player-search').value.trim().normalize('NFC');if(!name||name.length>48||/[\x00-\x1f\x7f]/.test(name)){this.note('Digite um nome ou apelido de até 48 caracteres.');return;}
    if(!this.local){this.note('Sem armazenamento. Use visitante sem salvar.');return;}
    const p={id:crypto.randomUUID(),name,created_at:new Date().toISOString(),last_active_at:new Date().toISOString()};
    await this.local.write([{store:'profiles',value:p},{store:'outbox',value:{id:'player:'+p.id,kind:'player',payload:p,queuedAt:Date.now()}}]);await this.select(p);await this.search();void this.flush();
  }
  async search(){
    if(!this.local)return;const q=document.querySelector('#player-search').value.trim(),list=document.querySelector('#player-list');
    let profiles=(await this.local.all('profiles')).filter(p=>p.name.toLocaleLowerCase().includes(q.toLocaleLowerCase())||p.id===q);
    try{const remote=await this.api('/api/players?q='+encodeURIComponent(q));for(const p of remote){const cached=await this.local.get('profiles',p.id);await this.local.put('profiles',{...cached,...p});}profiles=[...new Map([...profiles,...remote].map(p=>[p.id,p])).values()];}catch{}
    list.replaceChildren();for(const p of profiles.sort((a,b)=>String(b.last_active_at).localeCompare(String(a.last_active_at))).slice(0,50)){const button=document.createElement('button');button.type='button';button.textContent=p.name+' · '+p.id.slice(0,8)+' · '+new Date(p.last_active_at).toLocaleString('pt-BR');button.onclick=()=>this.select(p);list.append(button);}
    if(!profiles.length)list.textContent='Nenhum perfil encontrado. Crie um novo jogador.';
  }
  async select(p){
    if(this.current?.id!==p.id){await this.finishPending();this.assistant?.session.end();const consent=document.querySelector('#assistant-consent');if(consent)consent.checked=false;}
    let profile=p;try{profile=await this.api('/api/players/'+p.id);await this.local.put('profiles',profile);}catch{}
    this.current=summarize(profile,await this.local.all('runs'));this.useRecord();
    document.querySelector('#player-play').disabled=false;document.querySelector('#player-delete').disabled=false;
    document.querySelector('#player-resume').disabled=!this.current.checkpoints?.length||Boolean(this.current.story_completed);
    document.querySelector('#profile-name').textContent=this.current.name+' · '+this.current.id.slice(0,8);this.renderProfile();
  }
  useRecord(){const current=this.current;this.game.records={best:current?.best_score||0,persistent:Boolean(this.local),save:score=>{this.game.records.best=Math.max(this.game.records.best,Math.floor(score));}};this.game.session.records=this.game.records;this.game.ui.lastHud='';this.game.ui.update(this.game.session);}
  renderProfile(){const p=this.current;if(!p)return;const history=document.querySelector('#player-history');history.replaceChildren();const summary=document.createElement('p');summary.textContent=p.name+' · Recorde '+(p.best_score||0)+' · Maior distância '+Math.floor(p.max_distance||0)+' m · História '+Math.floor((p.story_distance||0)/24)+'%';history.append(summary);void this.historyRows(p,history);}
  async historyRows(p,container){const local=(await this.local.all('runs')).filter(r=>r.playerId===p.id);const rows=[...new Map([...(p.history||[]),...local].map(r=>[r.id,r])).values()].sort((a,b)=>String(b.createdAt||b.created_at).localeCompare(String(a.createdAt||a.created_at)));if(this.current?.id!==p.id)return;const count=document.createElement('p');count.textContent=rows.filter(r=>['crashed','completed'].includes(r.result)).length+' partidas concluídas no histórico (até 100 do servidor).';container.append(count);for(const row of rows.slice(0,20)){const entry=document.createElement('p');entry.textContent=[row.mode==='story'?'História':'Infinito',row.score+' pontos',Math.floor(row.distance)+' m',({running:'Em andamento',checkpoint:'Checkpoint salvo',crashed:'Fim de jogo',completed:'Concluída',abandoned:'Interrompida'})[row.result],new Date(row.createdAt||row.created_at).toLocaleString('pt-BR')].join(' · ');container.append(entry);}}
  async resume(){const checkpoint=this.current?.checkpoints?.[0];if(!checkpoint)return;this.dialog.close();this.pendingStart=null;this.game.setState('menu');this.game.chooseMode('story');const chapters={600:'city',1200:'industry',1800:'contamination',2300:'arrival'};this.game.startRun(chapters[checkpoint.distance],checkpoint);}
  onGame(type,detail){
    if(type==='beforerunreset')this.capture('abandoned');
    if(type==='runstart'){
      if(this.activeRun)this.capture('abandoned');
      this.activeRun=this.current?{id:crypto.randomUUID(),playerId:this.current.id,revision:0,createdAt:new Date().toISOString()}:null;this.capture('running');
    }
    if(type==='checkpoint')this.capture('checkpoint',detail.distance);
    if(type==='runfinish')this.capture(detail.result);
    if(type==='statechange'){if(detail.state==='paused')this.capture('running');if(detail.state==='menu'&&this.activeRun)this.capture('abandoned');}
  }
  capture(result,checkpoint=0){
    if(!this.activeRun||!this.local)return;const s=this.game.session,r=this.activeRun;
    const row={...r,revision:++r.revision,mode:s.mode,practice:s.practice,resumed:Boolean(s.resumed),startDistance:s.startDistance,score:s.score,distance:s.distance,items:s.items,duration:s.time,result,checkpoint};
    if(['crashed','completed','abandoned'].includes(result))this.activeRun=null;
    this.tail=this.tail.then(async()=>{await this.local.write([{store:'runs',value:row},{store:'outbox',value:{id:row.id+':'+row.revision,kind:'run',payload:row,queuedAt:Date.now()}}]);if(this.current?.id===row.playerId){this.current=summarize(this.current,await this.local.all('runs'));await this.local.put('profiles',this.current);}this.note('Partida salva neste navegador; sincronizando com MySQL.');}).then(()=>{void this.flush();}).catch(()=>this.note('Não foi possível salvar no navegador. Evite fechar a página.'));return this.tail;
  }
  async flush(){
    if(!this.local||this.flushing)return;this.flushing=true;let completed=false;
    try{const health=await fetch('/api/local/config',{cache:'no-store',signal:AbortSignal.timeout(5000)});if(!health.ok)throw Error();this.apiConfig=await health.json();if(!this.apiConfig.ready)throw Error();const queue=(await this.local.all('outbox')).sort((a,b)=>a.queuedAt-b.queuedAt||(a.kind==='player'?-1:b.kind==='player'?1:a.payload.revision-b.payload.revision));
      for(const op of queue){await this.api(op.kind==='player'?'/api/players':'/api/runs',{method:'POST',body:op.payload});await this.local.write([{store:'outbox',delete:true,id:op.id}]);}
      completed=true;this.note('Salvo no MySQL local.');
    }catch{this.note('Salvo neste navegador · sincronização MySQL pendente.');}finally{this.flushing=false;}
    if(completed&&(await this.local.all('outbox')).length)void this.flush();
  }
  async finishPending(){this.capture('abandoned');await this.tail;}
  async endVisitor(){await this.finishPending();this.current=null;this.activeRun=null;this.assistant?.session.end();document.querySelector('#assistant-consent').checked=false;this.game.setState('menu');this.useRecord();document.querySelector('#profile-name').textContent='Nenhum jogador selecionado';document.querySelector('#player-history').replaceChildren();for(const id of ['player-play','player-resume','player-delete'])document.getElementById(id).disabled=true;this.note('Pronto para o próximo visitante.');}
  async ranking(){const mode=document.querySelector('#ranking-mode').value,container=document.querySelector('#player-ranking');container.replaceChildren();try{const rows=await this.api('/api/ranking?mode='+mode);for(const [i,r]of rows.entries()){const item=document.createElement('p');item.textContent=(i+1)+'. '+r.name+' · '+r.player_id.slice(0,8)+' · '+r.score+' pontos · '+Math.floor(r.distance)+' m';container.append(item);}if(!rows.length)container.textContent='Ainda não há resultados concluídos.';}catch{container.textContent='Ranking MySQL indisponível; partidas locais continuam salvas.';}}
  async deleteCurrent(){if(!this.current)return;if(!confirm('Excluir definitivamente este perfil e todas as partidas?'))return;const id=this.current.id;try{await this.finishPending();await this.flush();if((await this.local.all('outbox')).some(o=>o.payload.playerId===id||o.payload.id===id))throw Error();await this.api('/api/players/'+id,{method:'DELETE'});const ops=[{store:'profiles',delete:true,id},...(await this.local.all('runs')).filter(r=>r.playerId===id).map(r=>({store:'runs',delete:true,id:r.id}))];await this.local.write(ops);await this.endVisitor();await this.search();await this.ranking();}catch{this.note('Exclusão requer MySQL disponível e sincronização concluída.');}}
  async export(){try{await this.flush();const data=await this.api('/api/results/export',{method:'POST',body:{}}),url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'})),link=document.createElement('a');link.href=url;link.download='mannequin-resultados.json';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}catch{this.note('Exportação requer MySQL disponível. Use o backup local pelo inicializador.');}}
}
