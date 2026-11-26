import test from 'node:test';import assert from 'node:assert/strict';
import {AudioEngine} from '../src/audio/AudioEngine.js';
test('falas alternam e evitam sobreposição entre ocorrências próximas',()=>{
 const audio=new AudioEngine();audio.context={currentTime:10,state:'running'};audio.awardBuffers.set('nexus-cratera-1',{duration:3});audio.awardBuffers.set('nexus-cratera-2',{duration:3});audio.awardBuffers.set('nexus-vitoria-1',{duration:2});const clips=[];audio.awardClip=name=>{clips.push(name);return true;};
 assert.equal(audio.playNexusCue('cratera'),true);assert.equal(audio.playNexusCue('cratera'),false);audio.context.currentTime=16;assert.equal(audio.playNexusCue('cratera'),true);assert.deepEqual(clips,['nexus-cratera-1','nexus-cratera-2']);audio.enabled=false;assert.equal(audio.playNexusCue('vitoria'),false);
});

test('avisos de setor aguardam a fala anterior terminar',()=>{
 const a=new AudioEngine();a.context={currentTime:10,state:'running'};a.playing=true;a.musicEnabled=false;const clips=[];a.awardClip=name=>{clips.push(name);return true;};a.awardBuffers.set('nexus-servidor',{duration:5});a.awardBuffers.set('nexus-setor-5',{duration:3});
 assert.ok(a.queueNexusLine('nexus-servidor'));assert.ok(a.queueNexusLine('nexus-setor-5'));assert.deepEqual(clips,['nexus-servidor']);a.context.currentTime=17.9;a.update();assert.deepEqual(clips,['nexus-servidor']);a.context.currentTime=18;a.update();assert.deepEqual(clips,['nexus-servidor','nexus-setor-5']);
});

test('reações atrasadas são descartadas e anúncio de setor tem prioridade',()=>{
 const a=new AudioEngine();a.context={currentTime:10,state:'running'};a.playing=true;const clips=[];a.awardClip=name=>{clips.push(name);return true;};
 for(const name of ['nexus-servidor','nexus-setor-5','nexus-lava','nexus-quase-1'])a.awardBuffers.set(name,{duration:2});
 assert.ok(a.queueNexusLine('nexus-servidor'));assert.equal(a.queueNexusLine('nexus-lava'),false);assert.ok(a.queueNexusLine('nexus-setor-5'));assert.equal(a.queueNexusLine('nexus-servidor'),false);assert.equal(a.playNexusCue('quase'),false);
 a.context.currentTime=15;a.flushNexusQueue();assert.deepEqual(clips,['nexus-servidor','nexus-setor-5']);a.context.currentTime=20;a.flushNexusQueue();assert.deepEqual(clips,['nexus-servidor','nexus-setor-5']);
});

test('derrota aguarda três segundos após o fim da fala e toca mesmo após o jogo parar',()=>{
 const a=new AudioEngine();a.context={currentTime:10,state:'running'};a.playing=true;const clips=[];a.awardClip=name=>{clips.push(name);return true;};
 a.awardBuffers.set('nexus-servidor',{duration:5});a.awardBuffers.set('nexus-derrota-vitor',{duration:2});
 a.queueNexusLine('nexus-servidor');a.queueNexusLine('nexus-derrota-vitor');a.playing=false;
 a.context.currentTime=17.99;a.update();assert.deepEqual(clips,['nexus-servidor']);
 a.context.currentTime=18;a.update();assert.deepEqual(clips,['nexus-servidor','nexus-derrota-vitor']);
});

test('uma frase toca no máximo duas vezes e nunca duas vezes no mesmo cenário',()=>{
 const a=new AudioEngine();a.context={currentTime:10,state:'running'};a.playing=true;a.awardClip=()=>true;
 a.awardBuffers.set('nexus-quase-1',{duration:1});a.awardBuffers.set('nexus-quase-2',{duration:1});
 assert.equal(a.playNexusCue('quase'),true);a.context.currentTime=15;
 assert.equal(a.playNexusCue('quase'),true);a.context.currentTime=20;
 assert.equal(a.playNexusCue('quase'),false);
 a.sector=1;assert.equal(a.playNexusCue('quase'),true);a.context.currentTime=25;
 assert.equal(a.playNexusCue('quase'),true);a.context.currentTime=30;
 a.sector=2;assert.equal(a.playNexusCue('quase'),false);
 a.resetNexusHistory();assert.equal(a.playNexusCue('quase'),true);
});
