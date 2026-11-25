import { AssistantSession } from './Session.js';
import { ASSISTANT_CONFIG } from './Config.js';
const labels={idle:'AGUARDANDO VISITANTE',connecting:'CONECTANDO',ready:'PODE PERGUNTAR',permission:'PERMISSÃO DO MICROFONE',listening:'MICROFONE ATIVO',thinking:'PENSANDO',speaking:'FALANDO',error:'CONEXÃO INDISPONÍVEL'};
export class AssistantUI{
  constructor(music=null){
    this.panel=document.querySelector('#assistant-panel');this.list=document.querySelector('#assistant-history');this.session=new AssistantSession(this,{music});this.bind();this.status('idle');
    addEventListener('pagehide',()=>this.session.dispose());document.addEventListener('visibilitychange',()=>{if(document.hidden){this.session.microphone.stop();this.session.provider?.endAudio?.();this.session.interrupt();this.mic(false);}});
  }
  bind(){
    document.querySelector('#assistant-open').onclick=()=>this.expand();document.querySelector('#assistant-minimize').onclick=()=>this.minimize();
    document.querySelector('#assistant-start').onclick=()=>this.session.start(this.kind(),this.consent());
    document.querySelector('#assistant-present').onclick=()=>this.session.present();
    document.querySelector('#assistant-mic').onclick=()=>this.session.toggleMic();document.querySelector('#assistant-stop').onclick=()=>this.session.interrupt();
    document.querySelector('#assistant-end').onclick=()=>this.session.end();
    document.querySelector('#assistant-form').onsubmit=event=>{event.preventDefault();const input=document.querySelector('#assistant-input');const text=input.value;input.value='';void this.session.send(text);};
    document.querySelector('#assistant-volume').oninput=event=>this.session.voice.setVolume(event.target.value);
    document.querySelector('#assistant-provider').onchange=()=>{this.session.end();this.mode(this.kind());};this.mode('demo');
  }
  kind(){return document.querySelector('#assistant-provider').value;}
  consent(){return document.querySelector('#assistant-consent').checked;}
  expand(){this.panel.hidden=false;document.querySelector('#stage').classList.add('assistant-visible');document.querySelector('#assistant-open').hidden=true;document.querySelector('#assistant-open').setAttribute('aria-expanded','true');}
  minimize(){this.session.microphone.stop();this.session.provider?.endAudio?.();this.session.interrupt();this.mic(false);this.panel.hidden=true;document.querySelector('#stage').classList.remove('assistant-visible');const button=document.querySelector('#assistant-open');button.hidden=false;button.setAttribute('aria-expanded','false');button.focus();}
  mode(kind){document.querySelector('#assistant-disclosure').textContent=kind==='demo'?'DEMONSTRAÇÃO LOCAL · respostas roteirizadas, sem IA. Voz local de contingência; não é a voz Gemini.':'GEMINI LIVE · '+ASSISTANT_CONFIG.voice+' · áudio e texto serão processados externamente pelo Google. Conexão depende de configuração da equipe.';document.querySelector('#assistant-external').hidden=kind!=='live';}
  status(state,note=''){this.panel.dataset.state=state;document.querySelector('#assistant-state').textContent=labels[state]??state;document.querySelector('#assistant-note').textContent=note;document.querySelector('#assistant-input').disabled=!this.session?.active;document.querySelector('#assistant-send').disabled=!this.session?.active;document.querySelector('#assistant-start').disabled=state==='connecting';document.querySelector('#assistant-mic').disabled=state==='permission';}
  mic(active){const button=document.querySelector('#assistant-mic');button.setAttribute('aria-pressed',String(active));button.textContent=active?'● MICROFONE ATIVO':'○ ATIVAR MICROFONE';}
  history(messages){this.list.replaceChildren();for(const message of messages){const entry=document.createElement('div');entry.className='assistant-message '+message.role;const author=document.createElement('b');author.textContent=message.role==='user'?'VISITANTE':'NEXUS';const text=document.createElement('p');text.textContent=message.text;entry.append(author,text);this.list.append(entry);}this.list.scrollTop=this.list.scrollHeight;}
  presentation(){document.querySelector('#assistant-present').textContent='REPETIR APRESENTAÇÃO';}
}
