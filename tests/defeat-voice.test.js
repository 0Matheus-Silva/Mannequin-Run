import test from 'node:test';
import assert from 'node:assert/strict';
import {chooseDefeatVoice,DEFEAT_VOICES} from '../src/game/DefeatVoice.js';

test('sorteio inicial dá a cada fala a mesma chance e três falas são de haja paciência',()=>{
 assert.deepEqual([0,.25,.5,.75].map(value=>chooseDefeatVoice(null,()=>value)),DEFEAT_VOICES);
 assert.equal(DEFEAT_VOICES.filter(name=>name!=='nexus-derrota-1').length,3);
});
test('sorteio seguinte nunca repete a última gravação e alcança todas as demais',()=>{
 for(const previous of DEFEAT_VOICES){
  const results=[0,1/3,2/3].map(value=>chooseDefeatVoice(previous,()=>value));
  assert.equal(new Set(results).size,3);assert.ok(!results.includes(previous));
 }
});
