import test from 'node:test';
import assert from 'node:assert/strict';
import {VoiceOutput,speechChunks} from '../src/assistant/audio/VoiceOutput.js';

test('presentation audio can arrive over a minute ahead without cutting playback, with a finite bound',()=>{
 const output=new VoiceOutput();let scheduled=0;
 output.context={currentTime:0,state:'running',createBuffer:(_channels,length,rate)=>({duration:length/rate,copyToChannel(){}}),createBufferSource:()=>({connect(){},disconnect(){},start(){scheduled++;},stop(){}})};
 output.gain={};const pcm=btoa('\0'.repeat(48000));
 for(let i=0;i<90;i++)output.enqueue(pcm);
 assert.equal(scheduled,90);assert.equal(output.nodes.size,90);
 assert.ok(output.nextTime>90);
 assert.throws(()=>{for(let i=0;i<100;i++)output.enqueue(pcm);},/três minutos/);
 output.stop();assert.equal(output.nodes.size,0);
});
test('local speech is divided without losing words or splitting decimal specifications',()=>{
 const text=('Processador de 3.00 GHz e memória de 32 GB. ').repeat(20),chunks=speechChunks(text);
 assert.ok(chunks.length>1);assert.ok(chunks.every(c=>c.length<=180));assert.equal(chunks.join(' '),text.trim());assert.ok(chunks.some(c=>c.includes('3.00')));
});
test('local speech continues chunk by chunk and stale completion cannot restart interrupted speech',()=>{
 const original=globalThis.speechSynthesis,Utterance=globalThis.SpeechSynthesisUtterance,spoken=[];
 globalThis.speechSynthesis={getVoices:()=>[{localService:true,lang:'pt-BR'}],speak:u=>spoken.push(u),cancel(){}};
 globalThis.SpeechSynthesisUtterance=class{constructor(text){this.text=text;}};
 try{const output=new VoiceOutput(),text='Apresentação completa. '.repeat(40);assert.equal(output.speakLocal(text),true);while(spoken.at(-1)?.onend&&output.utterance)spoken.at(-1).onend();assert.equal(spoken.map(u=>u.text).join(' '),text.trim());
  output.speakLocal(text);const last=spoken.at(-1),count=spoken.length;output.stop();last.onend();assert.equal(spoken.length,count);
 }finally{globalThis.speechSynthesis=original;globalThis.SpeechSynthesisUtterance=Utterance;}
});
