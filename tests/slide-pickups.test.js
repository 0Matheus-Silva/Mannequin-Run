import test from 'node:test';
import assert from 'node:assert/strict';
import {canCollect,overlapsPlayer} from '../src/obstacles/Collision.js';
test('slide collects ordinary components without widening lane or jump requirements',()=>{
 const player={x:0,y:0,height:.8};
 for(const height of [1.205,1.25,1.295])assert.ok(canCollect(player,0,-2,2,height,'free'));
 assert.ok(canCollect(player,0,-1,1,.45,'slide'));
 assert.equal(canCollect(player,2.7,-1,1,1.25,'free'),false);
 assert.equal(canCollect(player,0,-1,1,3.15,'jump'),false);
 assert.equal(canCollect(player,0,-4,-2,1.25,'free'),false);
 assert.equal(canCollect({...player,height:2.65},0,-1,1,.45,'slide'),false);
 assert.equal(overlapsPlayer(player,{type:'slide',x:0},-1,1),false);
});
