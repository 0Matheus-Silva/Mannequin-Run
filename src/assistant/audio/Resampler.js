export class PCMResampler{
  constructor(rate,target=16000){this.step=rate/target;this.samples=[];this.cursor=0;}
  push(input){this.samples.push(...input);const output=[];while(this.cursor+1<this.samples.length){const i=Math.floor(this.cursor),f=this.cursor-i;const sample=this.samples[i]*(1-f)+this.samples[i+1]*f;output.push(Math.round(Math.max(-1,Math.min(1,sample))*32767));this.cursor+=this.step;}const consumed=Math.min(Math.floor(this.cursor),Math.max(0,this.samples.length-1));this.samples.splice(0,consumed);this.cursor-=consumed;return new Int16Array(output);}
}
