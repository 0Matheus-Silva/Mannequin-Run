import test from 'node:test';
import assert from 'node:assert/strict';
import {createChasmPattern,overlapsPlayer} from '../src/obstacles/Collision.js';
import {PlayerController} from '../src/player/PlayerController.js';
test('cratera preserva faixa livre e posiciona obstáculo e itens sobre o chão',()=>{
 for(const side of [-1,1])for(const value of [0,.99])for(const index of [0,1]){
  const p=createChasmPattern(index,side,()=>value);
  assert.notEqual(p.safeLane,side);assert.equal(p.obstacles.length,1);assert.notEqual(p.obstacles[0].lane,side);assert.notEqual(p.obstacles[0].lane,p.safeLane);
  assert.ok(['jump','slide'].includes(p.obstacles[0].type));assert.ok(p.collectibles.every(c=>c.lane===p.obstacles[0].lane&&c.action===p.obstacles[0].type));
 }
});
test('obstáculo baixo da cidade aceita salto e deslize mas colide em pé',()=>{
 const obstacle={type:'slide',sector:1,x:0},standing={x:0,y:0,height:2.65},sliding={x:0,y:0,height:.8};
 assert.ok(overlapsPlayer(standing,obstacle,-1,1));assert.equal(overlapsPlayer(sliding,obstacle,-1,1),false);
 const runner=new PlayerController();runner.jump();for(let i=0;i<52;i++)runner.update(1/120);
 assert.equal(overlapsPlayer(runner,obstacle,-1,1),false);
 assert.equal(overlapsPlayer(runner,{...obstacle,sector:2},-1,1),true);
});
