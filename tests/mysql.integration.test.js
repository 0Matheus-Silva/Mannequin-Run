import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { createPool } from '../server/database/config.js';
import { Store,snapshot } from '../server/database/store.js';
test('MySQL transactional lifecycle, duplicates, checkpoints, ranking, restart and cascading deletion',async()=>{
  let pool=createPool(),store=new Store(pool);const a=randomUUID(),b=randomUUID(),r=randomUUID(),practice=randomUUID();
  try{
    await store.createPlayer({id:a,name:'QA visitante '+a.slice(0,8)});await store.createPlayer({id:b,name:'QA visitante '+a.slice(0,8)});
    assert.equal((await store.players('QA visitante '+a.slice(0,8))).length,2);
    const event={id:r,playerId:a,mode:'story',practice:false,resumed:false,score:6000,distance:600,startDistance:0,items:0,duration:40,revision:1,result:'checkpoint',checkpoint:600};
    await store.saveRun(event);await store.saveRun(event);assert.equal((await store.profile(a)).history.length,1);assert.equal((await store.profile(a)).last_checkpoint,600);
    await assert.rejects(()=>store.saveRun({...event,playerId:b,revision:2}),/outro perfil/);
    await store.saveRun({...event,revision:2,result:'crashed',checkpoint:0,distance:650,score:6500,duration:43});
    await store.saveRun({...event,revision:3,result:'running',checkpoint:0});const profile=await store.profile(a);assert.equal(profile.best_score,6500);assert.equal(profile.run_count,1);assert.equal(profile.history[0].result,'crashed');assert.equal(profile.checkpoints[0].distance,600);
    await store.saveRun({...event,id:practice,practice:true,checkpoint:0,result:'completed',revision:1,distance:2400,score:24000,duration:160});assert.equal((await store.profile(a)).best_score,6500);
    assert.ok((await store.ranking('story')).some(row=>row.player_id===a));assert.ok(!(await store.ranking('infinite')).some(row=>row.player_id===a));
    assert.equal((await store.players("' OR 1=1 --")).length,0);
    const backup=await snapshot(pool);assert.ok(backup.tables.players.some(p=>p.id===a));assert.ok(!JSON.stringify(backup).includes('MYSQL_PASSWORD'));
    await pool.end();pool=createPool();store=new Store(pool);assert.equal((await store.profile(a)).best_score,6500);
    const [priv]=await pool.query('SHOW GRANTS FOR CURRENT_USER()');assert.ok(!priv.flatMap(row=>Object.values(row)).join(' ').includes('ALL PRIVILEGES'));
    await store.saveRun({...event,id:randomUUID(),resumed:true,revision:1,result:'completed',checkpoint:0,distance:2400,items:10,score:24750,duration:160});
    const complete=await store.profile(a);assert.equal(complete.story_completed,1);assert.equal(complete.best_story,24750);assert.equal(complete.history.find(r=>r.result==='completed'&&!r.practice).sector,3);assert.ok(complete.achievements.some(x=>x.code==='story_complete'));
    await store.deletePlayer(a);const [[count]]=await pool.execute('SELECT COUNT(*) AS total FROM runs WHERE player_id=?',[a]);assert.equal(count.total,0);
  }finally{await store.deletePlayer(a);await store.deletePlayer(b);await pool.end();}
});
