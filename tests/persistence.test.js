import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { run,player } from '../server/database/validation.js';
import { summarize } from '../src/players/LocalStore.js';
const make=()=>({id:randomUUID(),playerId:randomUUID(),mode:'story',practice:false,resumed:false,score:6000,distance:600,startDistance:0,items:0,duration:40,revision:1,result:'checkpoint',checkpoint:600});
test('validation rejects invalid score, checkpoint, identifiers and non-finite values',()=>{
  const v=make();assert.equal(run(v).checkpoint,600);
  for(const change of [{score:9000},{checkpoint:1200},{distance:NaN},{id:'x'},{items:-1},{duration:'40'},{result:'completed'}])assert.throws(()=>run({...v,...change}));
});
test('profile names allow duplicates with different UUIDs and reject control characters',()=>{
  const a=player({id:randomUUID(),name:'  Visitante  '}),b=player({id:randomUUID(),name:'Visitante'});assert.equal(a.name,b.name);assert.notEqual(a.id,b.id);assert.throws(()=>player({id:randomUUID(),name:'x\ny'}));
});
test('local profile aggregate isolates visitors, excludes practice and preserves checkpoints',()=>{
  const a=make(),b={...make(),score:100000,distance:10000,mode:'infinite',result:'crashed'},practice={...a,id:randomUUID(),practice:true,score:24000,distance:2400,result:'completed',checkpoint:0};
  const p=summarize({id:a.playerId,name:'A'},[a,b,practice]);assert.equal(p.last_checkpoint,600);assert.equal(p.best_score,0);assert.equal(p.max_distance,600);assert.equal(p.story_completed,false);
  const done={...a,result:'crashed',checkpoint:0};assert.equal(summarize(p,[done]).best_score,6000);
});
