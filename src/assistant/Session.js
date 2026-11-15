import { DemoProvider } from './DemoProvider.js';
import { GeminiProvider } from './GeminiProvider.js';
import { Microphone } from './audio/Microphone.js';
import { VoiceOutput } from './audio/VoiceOutput.js';
import { ASSISTANT_CONFIG } from './Config.js';

export class AssistantSession{
  constructor(ui,{microphone,voice,providerFactory}={}){
    this.ui=ui;this.history=[];this.active=false;this.epoch=0;this.state='idle';this.microphone=microphone??new Microphone();this.voice=voice??new VoiceOutput(speaking=>{this.speaking=speaking;if(this.active)this.status(speaking?'speaking':this.microphone.active?'listening':'ready');});this.providerFactory=providerFactory??((kind)=>kind==='live'?new GeminiProvider(event=>this.event(event)):new DemoProvider(this.knowledge,this.personality));
  }
  async load(){const responses=await Promise.all(['knowledge','personality'].map(name=>fetch('./assets/assistant/'+name+'.json')));if(responses.some(r=>!r.ok))throw Error('Base local do personagem indisponível.');[this.knowledge,this.personality]=await Promise.all(responses.map(r=>r.json()));}
  status(state,note=''){this.state=state;this.ui.status(state,note);}
  message(role,text,append=false){if(append&&this.history.at(-1)?.role===role)this.history.at(-1).text=(this.history.at(-1).text+text).slice(0,6000);else this.history.push({role,text:String(text).slice(0,6000)});if(this.history.length>ASSISTANT_CONFIG.maxMessages)this.history.splice(0,this.history.length-ASSISTANT_CONFIG.maxMessages);this.ui.history(this.history);}
  async start(kind='demo',consent=false){
    this.end(false);const epoch=this.epoch;this.kind=kind;this.status('connecting');
    try{
      if(!this.knowledge)await this.load();if(epoch!==this.epoch)return;
      if(kind==='live'&&!consent)throw Error('Leia e aceite o aviso de processamento externo antes de iniciar Gemini. Isso não substitui a revisão do público pela equipe.');
      const provider=this.provider=this.providerFactory(kind);if(kind==='live')await this.voice.unlock();
      if(epoch!==this.epoch)return;
      const greeting=await provider.connect();if(epoch!==this.epoch){provider.close();return;}
      this.active=true;this.status('ready');this.ui.mode(kind);if(greeting){this.message('assistant',greeting);this.voice.speakLocal(greeting);}
    }catch(error){if(epoch===this.epoch)this.fail(error.message);}
  }
  async send(text){
    const clean=text.trim().slice(0,ASSISTANT_CONFIG.maxInput);if(!clean||!this.active)return;const epoch=this.epoch;this.interrupt();this.ignoreAudio=false;this.message('user',clean);this.status('thinking');
    try{const answer=await this.provider.reply(clean);if(epoch!==this.epoch)return;if(answer){this.message('assistant',answer);this.status('ready');this.voice.speakLocal(answer);}}catch(error){this.fail(error.message);}
  }
  async present(){if(!this.active)await this.start(this.ui.kind(),this.ui.consent());if(!this.active)return;this.interrupt();this.ui.presentation();
    if(this.kind==='live'){await this.send('Apresente o projeto completo Manequim Run: mencione uma única vez, no começo ou no final, que foi desenvolvido em conjunto por Matheus, Pedro e Victor. Não separe quem fez cada etapa. Explique em ordem manequim físico, hardware, VM, jogo e chatbot, distinguindo recursos físicos dos virtuais. Cubra as cinco etapas com clareza e concisão e termine convidando perguntas.');return;}
    this.message('assistant',this.knowledge.presentation);try{await this.voice.presentation();}catch{this.status('ready','Áudio local indisponível. A apresentação está transcrita acima.');}
  }
  async toggleMic(){
    if(!this.active){this.status('idle','Inicie uma conversa antes de ativar o microfone.');return;}
    if(this.microphone.active){this.microphone.stop();this.provider.endAudio?.();this.ui.mic(false);this.status('ready');return;}
    this.status('permission');
    try{await this.microphone.start(pcm=>{if(this.kind==='live')this.provider?.audio?.(pcm);},()=>{});if(this.active){this.ui.mic(this.microphone.active);this.status('listening',this.kind==='demo'?'Teste de microfone local: sem transcrição nem envio de áudio. Pergunte por texto.':'Microfone ativo: áudio enviado à Gemini durante esta sessão.');}}
    catch(error){this.ui.mic(false);this.status('ready',error.name==='NotAllowedError'?'Permissão de microfone negada. Você pode continuar por texto.':error.message);}
  }
  interrupt(){this.ignoreAudio=true;this.voice.stop();if(this.active)this.status(this.microphone.active?'listening':'ready');}
  event(event){if(!this.active)return;if(event.type==='audio'&&!this.ignoreAudio)this.voice.enqueue(event.data);if(event.type==='interrupt'){this.interrupt();this.ignoreAudio=false;}if(event.type==='transcript'){this.message(event.role,event.text,this.transcriptRole===event.role);this.transcriptRole=event.role;}if(event.type==='turn'){this.transcriptRole=null;this.ignoreAudio=false;if(!this.speaking)this.status(this.microphone.active?'listening':'ready');}if(event.type==='error')this.fail(event.text);}
  fail(text){this.active=false;this.epoch++;this.microphone.stop();this.voice.stop();this.provider?.close();this.ui.mic(false);this.status('error',text);}
  end(clear=true){this.epoch++;this.active=false;this.transcriptRole=null;this.ignoreAudio=false;this.provider?.close();this.provider=null;this.microphone.stop();this.voice.stop();this.ui.mic(false);if(clear){this.history=[];this.ui.history(this.history);}this.status('idle','Sessão encerrada. Microfone desligado.');}
  dispose(){this.end();this.voice.dispose();}
}
