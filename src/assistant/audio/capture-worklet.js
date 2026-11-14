import { PCMResampler } from './Resampler.js';
class Capture extends AudioWorkletProcessor{
  constructor(){super();this.resampler=new PCMResampler(sampleRate);this.pending=[];}
  process(inputs){const channel=inputs[0]?.[0];if(channel){const pcm=this.resampler.push(channel);for(const s of pcm)this.pending.push(s);while(this.pending.length>=1024){const block=new Int16Array(this.pending.splice(0,1024));this.port.postMessage(block.buffer,[block.buffer]);}}return true;}
}
registerProcessor('mannequin-capture',Capture);
