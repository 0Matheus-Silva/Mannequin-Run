import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { writeFile, mkdir } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { createPool,root } from '../server/database/config.js';
import { Store,snapshot } from '../server/database/store.js';
test('JSON backup restores a complete profile transactionally without overwriting existing players',async t=>{
 const pool=createPool(),store=new Store(pool),id=randomUUID();
 try{
  const [[{total}]]=await pool.query('SELECT COUNT(*) AS total FROM players');
  if(total){t.skip('Restauração automática testada apenas com banco vazio; visitantes existentes são preservados.');return;}
  await store.createPlayer({id,name:'QA backup '+id.slice(0,8)});
  await store.saveRun({id:randomUUID(),playerId:id,mode:'infinite',practice:false,resumed:false,score:1000,distance:100,startDistance:0,items:0,duration:8,revision:1,result:'crashed'});
  const data=await snapshot(pool);await mkdir(root+'.tmp-qa',{recursive:true});const filename=root+'.tmp-qa/backup-roundtrip.json';await writeFile(filename,JSON.stringify(data));
  await assert.rejects(()=>promisify(execFile)(process.execPath,['tools/database.js','restore',filename],{cwd:root}));
  await store.deletePlayer(id);
  await promisify(execFile)(process.execPath,['tools/database.js','restore',filename],{cwd:root});
  const p=await store.profile(id);assert.equal(p.best_score,1000);assert.equal(p.history.length,1);assert.equal(p.achievements[0].code,'first_run');
 }finally{await store.deletePlayer(id);await pool.end();}
});
