import { SECTORS } from '../environments/Sectors.js';
import { MUSIC_TRACKS } from '../audio/MusicLibrary.js';
import { STORY_CHAPTERS } from '../game/Chapters.js';
import { CREDITS_DURATION } from '../story/Credits.js';

export class UI {
  constructor() {
    this.stage = document.querySelector('#stage');
    this.resize = () => {
      this.mobile=matchMedia('(max-width:700px), (max-width:1100px) and (max-height:500px), (pointer:coarse) and (max-width:1100px)').matches;
      document.documentElement.classList.toggle('mobile',this.mobile);
      const scale = Math.min(innerWidth / 1920, innerHeight / 1080);
      // The fixed logical canvas never reflows; the complete composition scales.
      this.stage.style.transform = this.mobile?'none':`translate(-50%, -50%) scale(${scale})`;
      // Modal dialogs enter the browser top layer and do not inherit the stage transform.
      for(const dialog of document.querySelectorAll('dialog')) dialog.style.transform=this.mobile?'none':`scale(${scale})`;
      this.game?.resizeView();
    };
    addEventListener('resize', this.resize);
    addEventListener('orientationchange', () => setTimeout(this.resize, 150));
    window.visualViewport?.addEventListener('resize', this.resize);
    this.resize();
    this.nodes = Object.fromEntries(['menu','specimen','hud','pause-panel','over-panel','score','distance','items','best','menu-best','final-score','final-distance','final-items','final-best','storage-note'].map(id => [id, document.getElementById(id)]));
    this.lastHud = '';
    document.querySelector('#help-open').onclick = () => document.querySelector('#help').showModal();
    document.querySelector('#help-close').onclick = () => document.querySelector('#help').close();
    document.querySelector('#fullscreen').onclick = async () => {
      try {
        const viewport = document.querySelector('#viewport');
        if (document.fullscreenElement || document.webkitFullscreenElement) {
          await (document.exitFullscreen?.() ?? document.webkitExitFullscreen?.());
        } else {
          const request = viewport.requestFullscreen || viewport.webkitRequestFullscreen;
          if (!request) throw new Error('fullscreen unavailable');
          await request.call(viewport);
        }
        this.resize();
      } catch { this.status('TELA CHEIA INDISPONÍVEL. NO IPHONE, USE ADICIONAR À TELA DE INÍCIO.'); }
    };
    document.addEventListener('fullscreenchange', () => {
      document.querySelector('#fullscreen').textContent = (document.fullscreenElement || document.webkitFullscreenElement) ? '⛶ SAIR DA TELA CHEIA' : '⛶ TELA CHEIA';
      this.resize();
    });
    document.addEventListener('webkitfullscreenchange', this.resize);
  }

  bind(game) {
    this.game=game;
    const chapters=document.querySelector('#chapters'),chapterSelect=document.querySelector('#story-chapter');
    for(const chapter of STORY_CHAPTERS){const option=document.createElement('option');option.value=chapter.id;option.textContent=chapter.name;chapterSelect.append(option);}chapterSelect.value='campaign';
    document.querySelector('#chapters-open').onclick=()=>{if(game.state==='menu')chapters.showModal();};
    document.querySelector('#chapters-close').onclick=()=>chapters.close();
    document.querySelector('#chapter-start').onclick=()=>{chapters.close();game.launchChapter(chapterSelect.value);};
    document.querySelector('#credits-replay').onclick=()=>game.finale?.replayCredits();
    const credits=document.querySelector('#credits-enabled');credits.checked=game.settings.credits;credits.onchange=()=>{game.settings.credits=credits.checked;game.settings.save();};
    document.querySelector('#play').onclick = () => game.beginRun();
    document.querySelector('#pause-button').onclick = () => game.pause();
    document.querySelector('#resume').onclick = () => { game.resume(); document.activeElement?.blur(); };
    for (const node of document.querySelectorAll('[data-restart]')) node.onclick = () => game.startRun();
    for (const node of document.querySelectorAll('[data-menu]')) node.onclick = () => game.setState('menu');
    for(const node of document.querySelectorAll('[data-mode]'))node.onclick=()=>game.chooseMode(node.dataset.mode);
    this.mode(game.settings.mode);
    const music=document.querySelector('#music-enabled'),musicVolume=document.querySelector('#music-volume'),effectsVolume=document.querySelector('#effects-volume'),track=document.querySelector('#music-track');
    music.checked=game.audio.musicEnabled;musicVolume.value=game.audio.musicVolume;effectsVolume.value=game.audio.effectsVolume;
    for(const entry of MUSIC_TRACKS){const option=document.createElement('option');option.value=entry.id;option.textContent=entry.name;track.append(option);}track.value=game.audio.track;
    music.onchange=()=>{game.audio.setMusicEnabled(music.checked);game.settings.music=music.checked;game.settings.save();if(music.checked)void game.audio.unlock();};
    musicVolume.oninput=()=>{game.audio.setMusicVolume(Number(musicVolume.value));game.settings.musicVolume=game.audio.musicVolume;game.settings.save();};
    effectsVolume.oninput=()=>{game.audio.setEffectsVolume(Number(effectsVolume.value));game.settings.effectsVolume=game.audio.effectsVolume;game.settings.save();};
    track.onchange=()=>{game.audio.selectTrack(track.value);if(!track.value.startsWith('local-')){game.settings.track=track.value;game.settings.save();}void game.audio.unlock();};
    document.querySelector('#local-music').onchange=event=>{
      const added=game.audio.addLocalFiles(event.target.files);for(const entry of added){const option=document.createElement('option');option.value=entry.id;option.textContent=entry.name;track.append(option);}
      document.querySelector('#local-music-note').textContent=added.length?'Faixas locais disponíveis nesta sessão. Nenhum arquivo é enviado.':'Nenhum áudio compatível selecionado.';
      if(added.length){track.value=added[0].id;track.dispatchEvent(new Event('change'));}event.target.value='';
    };
    const audioButton=document.querySelector('#audio-button');
    const audioCheck=document.querySelector('#audio-enabled');
    const volume=document.querySelector('#volume');
    const quality=document.querySelector('#quality');
    const syncAudio=()=>{
      audioButton.textContent=game.audio.enabled?'♪ ÁUDIO LIGADO':'♪ ÁUDIO DESLIGADO';
      audioButton.setAttribute('aria-pressed',String(game.audio.enabled));
      audioCheck.checked=game.audio.enabled;
    };
    const changeAudio=enabled=>{
      game.audio.setEnabled(enabled);game.settings.audio=enabled;game.settings.save();syncAudio();
      if(enabled)void game.audio.unlock();
    };
    syncAudio();volume.value=game.settings.volume;quality.value=game.settings.quality;
    audioButton.onclick=()=>changeAudio(!game.audio.enabled);
    audioCheck.onchange=()=>changeAudio(audioCheck.checked);
    volume.oninput=()=>{game.audio.setVolume(Number(volume.value));game.settings.volume=game.audio.volume;game.settings.save();};
    quality.onchange=()=>game.setQuality(quality.value);
    document.querySelector('#settings-open').onclick=()=>{
      if(['playing','starting','ending','falling','victory'].includes(game.state))game.pause();
      document.querySelector('#settings').showModal();
    };
    document.querySelector('#settings-close').onclick=()=>document.querySelector('#settings').close();
  }

  setState(state, session) {
    if(!['ending','victory'].includes(state)){document.querySelector('#credits-roll').hidden=true;document.querySelector('#award-win').hidden=true;}
    this.state = state;
    this.nodes.menu.hidden = state !== 'menu';
    this.nodes.specimen.hidden = state !== 'menu';
    this.nodes.hud.hidden = state === 'menu'||state==='starting';
    document.querySelector('#victory-panel').hidden=state!=='victory';
    document.querySelector('#ending-caption').hidden=!['ending','victory'].includes(state);
    if(['ending','victory'].includes(state))this.nodes.hud.hidden=true;
    if(state==='paused'&&['ending','victory'].includes(this.game.resumeState))this.nodes.hud.hidden=true;
    this.nodes['pause-panel'].hidden = state !== 'paused';
    this.nodes['over-panel'].hidden = state !== 'gameover';
    this.stage.classList.toggle('in-game', state !== 'menu');
    this.stage.classList.toggle('cinematic',state==='starting');
    document.querySelector('#pause-button').disabled=state==='falling';
    document.querySelector('#play').disabled=state==='starting';
    if(state!=='playing')document.querySelector('#sector-toast').classList.remove('show');
    if (state === 'gameover') {
      this.nodes['final-score'].textContent = session.score.toLocaleString('pt-BR');
      this.nodes['final-distance'].textContent = Math.floor(session.distance) + ' m';
      this.nodes['final-items'].textContent = session.items;
      this.nodes['final-best'].textContent = session.records.best.toLocaleString('pt-BR');
    }
    this.status({ menu:'SISTEMAS ONLINE / AGUARDANDO ATIVAÇÃO', starting:'ATIVAÇÃO DA UNIDADE / PREPARANDO FUGA', playing:'PROTOCOLO DE FUGA ATIVO', paused:'SIMULAÇÃO EM PAUSA', falling:'UNIDADE EM QUEDA',ending:'JORNADA CONCLUÍDA / UniFECAF',victory:'EXPOTECH 2026 / PRIMEIRO LUGAR',gameover:'SINAL DA UNIDADE PERDIDO' }[state]);
    this.update(session);
  }

  update(session) {
    const values = [session.score, Math.floor(session.distance), session.items, session.records.best];
    const key = values.join('|')+'|'+session.records.persistent+'|'+session.finalSectorComplete;
    if (key === this.lastHud) return;
    this.lastHud = key;
    this.nodes.score.textContent = values[0].toLocaleString('pt-BR');
    this.nodes.distance.textContent = values[1] + ' m';
    this.nodes.items.textContent = values[2];
    this.nodes.best.textContent = values[3].toLocaleString('pt-BR');
    this.nodes['menu-best'].textContent = values[3].toLocaleString('pt-BR');
    this.nodes['storage-note'].hidden = session.records.persistent;
    document.querySelector('#speed').textContent=(session.speed*3.6).toFixed(0)+' km/h';
    document.querySelector('#sector-progress').style.width=(session.mode==='story'&&session.finalSectorComplete?100:session.distance%600/600*100)+'%';
  }

  collect() {
    const node=document.querySelector('#items');node.classList.remove('collected');void node.offsetWidth;node.classList.add('collected');
  }
  mode(mode){
    for(const node of document.querySelectorAll('[data-mode]'))node.setAttribute('aria-pressed',String(node.dataset.mode===mode));
    document.querySelector('#mode-description').textContent=mode==='story'?'Cinco setores. Um lugar para voltar. UniFECAF / EXPOTECH 2026.':'Corrida sem fim. Cinco ambientes. Um novo recorde.';
  }
  ending(phase,time){
    document.querySelector('#ending-caption').hidden=time>=22;
    document.querySelector('#sector-label').textContent=['podium','trophy','victory'].includes(phase)?'CERIMÔNIA — EXPOTECH 2026':'DESTINO — UniFECAF';
    document.querySelector('#ending-caption').textContent={arrival:'Um lugar para voltar. UniFECAF.',interior:'Toda jornada deixa uma história.',podium:'EXPOTECH 2026 · Um encontro de criadores.',trophy:'Primeiro lugar. A máquina que continuou.',victory:''}[phase];
  }
  credits(time,enabled){
    const visible=enabled&&time>=0&&time<CREDITS_DURATION;
    document.querySelector('#credits-roll').hidden=!visible;
    if(visible)document.querySelector('#credits-content').style.transform='translateY('+(620-time*140)+'px)';
  }
  hit(){const node=document.querySelector('#hit-flash');node.classList.remove('show');void node.offsetWidth;node.classList.add('show');}

  sector(index, announce) {
    const sector = SECTORS[index];
    document.querySelector('#sector-label').textContent = 'SETOR '+String(index+1).padStart(2,'0')+' — '+sector.name;
    const toast=document.querySelector('#sector-toast');
    toast.classList.remove('show');
    if(!announce)return;
    document.querySelector('#sector-number').textContent='NEXUS RUN // SETOR '+String(index+1).padStart(2,'0');
    document.querySelector('#sector-name').textContent=sector.name;
    document.querySelector('#sector-subtitle').textContent=sector.subtitle;
    void toast.offsetWidth;
    toast.classList.add('show');
  }

  status(message) { document.querySelector('#status').textContent = message; }

  error(message) {
    document.querySelector('#error').hidden = false;
    document.querySelector('#error-message').textContent = message;
    document.querySelector('#play').disabled = true;
    this.status('FALHA NA INICIALIZAÇÃO');
  }
}
