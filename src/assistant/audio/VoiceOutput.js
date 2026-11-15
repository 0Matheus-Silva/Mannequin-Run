export const decodePCM=base64=>{const bytes=Uint8Array.from(atob(base64),c=>c.charCodeAt(0)),view=new DataView(bytes.buffer),out=new Float32Array(Math.floor(bytes.length/2));for(let i=0;i<out.length;i++)out[i]=view.getInt16(i*2,true)/32768;return out;};
export function speechChunks(text){const chunks=[];let current='';for(const word of String(text).split(/\s+/).filter(Boolean)){if(current&&current.length+word.length>180){chunks.push(current);current='';}current+=(current?' ':'')+word;}if(current)chunks.push(current);return chunks;}
export class VoiceOutput{
  constructor(onState=()=>{}){this.onState=onState;this.volume=.65;this.nodes=new Set();this.generation=0;}
  async unlock(){this.context??=new AudioContext();this.gain??=this.context.createGain();this.gain.gain.value=this.volume;if(!this.connected){this.gain.connect(this.context.destination);this.connected=true;}await this.context.resume();}
  setVolume(value){this.volume=Math.max(0,Math.min(1,Number(value)));if(this.gain)this.gain.gain.value=this.volume;if(this.audio)this.audio.volume=this.volume;if(this.utterance)this.utterance.volume=this.volume;}
  enqueue(base64,rate=24000){
    if(!this.context)return;const samples=decodePCM(base64);if(!samples.length)return;
    if(this.context.state==='suspended')void this.context.resume().catch(()=>{});
    if((this.nextTime??0)-this.context.currentTime>60)throw Error('Fila de áudio excedeu um minuto. Interrompa a fala e tente novamente.');
    const buffer=this.context.createBuffer(1,samples.length,rate);buffer.copyToChannel(samples,0);const source=this.context.createBufferSource();source.buffer=buffer;source.connect(this.gain);
    this.nextTime=Math.max(this.context.currentTime+.015,this.nextTime??0);this.nodes.add(source);this.onState(true);source.start(this.nextTime);this.nextTime+=buffer.duration;
    source.onended=()=>{source.disconnect();this.nodes.delete(source);if(!this.nodes.size)this.onState(false);};
  }
  speakLocal(text){
    this.stop();const voice=globalThis.speechSynthesis?.getVoices().find(v=>v.localService&&v.lang.toLowerCase().startsWith('pt'));
    if(!voice)return false;
    const chunks=speechChunks(text),generation=this.generation;
    const next=index=>{if(generation!==this.generation)return;if(index>=chunks.length){this.utterance=null;this.onState(false);return;}const utterance=new SpeechSynthesisUtterance(chunks[index]);this.utterance=utterance;utterance.voice=voice;utterance.lang='pt-BR';utterance.volume=this.volume;utterance.rate=1.04;utterance.onstart=()=>{if(generation===this.generation)this.onState(true);};utterance.onend=()=>next(index+1);utterance.onerror=()=>{if(generation===this.generation){this.utterance=null;this.onState(false);}};speechSynthesis.speak(utterance);};next(0);return true;
  }
  async presentation(){this.stop();this.audio=new Audio('./assets/assistant/presentation.wav');this.audio.volume=this.volume;this.audio.onended=()=>this.onState(false);await this.audio.play();this.onState(true);}
  stop(){this.generation++;for(const node of this.nodes){node.onended=null;try{node.stop();}catch{}node.disconnect();}this.nodes.clear();this.nextTime=0;this.audio?.pause();if(this.audio)this.audio.currentTime=0;this.audio=null;if(this.utterance){globalThis.speechSynthesis?.cancel();this.utterance=null;}this.onState(false);}
  dispose(){this.stop();void this.context?.close().catch(()=>{});this.context=null;this.gain=null;this.connected=false;}
}
