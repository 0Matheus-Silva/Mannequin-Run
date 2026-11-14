export class Microphone{
  constructor({mediaDevices=navigator.mediaDevices,Context=globalThis.AudioContext}={}){this.devices=mediaDevices;this.Context=Context;this.active=false;this.generation=0;}
  async start(onPCM,onActivity=()=>{}){
    const generation=++this.generation;
    if(!this.devices?.getUserMedia||!this.Context)throw Error('Microfone indisponível. Use localhost em um navegador compatível.');
    const stream=await this.devices.getUserMedia({audio:{channelCount:1,echoCancellation:true,noiseSuppression:true,autoGainControl:true},video:false});
    if(generation!==this.generation){stream.getTracks().forEach(t=>t.stop());return;}
    this.stream=stream;
    try{
      this.context=new this.Context();await this.context.resume();await this.context.audioWorklet.addModule(new URL('./capture-worklet.js',import.meta.url));
      if(generation!==this.generation){this.stop();return;}
      this.source=this.context.createMediaStreamSource(stream);this.node=new AudioWorkletNode(this.context,'mannequin-capture');
      this.node.port.onmessage=event=>{if(!this.active)return;const pcm=new Int16Array(event.data);let sum=0;for(const value of pcm)sum+=value*value;const rms=Math.sqrt(sum/pcm.length)/32768;if(rms>.035)onActivity();onPCM(pcm);};
      this.silent=this.context.createGain();this.silent.gain.value=0;this.source.connect(this.node);this.node.connect(this.silent);this.silent.connect(this.context.destination);this.active=true;
    }catch(error){this.stop();throw error;}
  }
  stop(){this.generation++;this.active=false;this.stream?.getTracks().forEach(t=>t.stop());this.source?.disconnect();this.node?.disconnect();this.silent?.disconnect();void this.context?.close().catch(()=>{});this.stream=null;this.context=null;}
}
