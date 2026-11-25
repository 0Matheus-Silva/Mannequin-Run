import test from 'node:test';
import assert from 'node:assert/strict';
import {chasmSideFor,chasmContains,chasmIntersects} from '../src/environments/Chasm.js';
import {fatalCollision} from '../src/obstacles/Collision.js';
test('chasm removes one outer lane across two adjoining segments, preserving the other two',()=>{
 for(const index of [2,7]){
  const side=chasmSideFor(index,1),segment={userData:{sector:1,chasmSide:side},position:{z:8}};
  assert.equal(chasmSideFor(index+1,1),side);
  assert.ok(side);assert.equal(chasmContains(segment,side*2.7),true);assert.equal(chasmContains(segment,0),false);assert.equal(chasmContains(segment,-side*2.7),false);
  assert.equal(chasmIntersects(segment,-10),true);segment.position.z=17;assert.equal(chasmContains(segment,side*2.7),false);
 }
 assert.equal(chasmSideFor(2,0),0);assert.equal(chasmSideFor(2,2),0);
});
test('low obstacle permits recovery after three seconds; other collisions remain fatal',()=>{
 assert.equal(fatalCollision('jump',10,-Infinity),false);assert.equal(fatalCollision('jump',12.99,10),true);assert.equal(fatalCollision('jump',13,10),false);
 for(const type of ['slide','block','chasm'])assert.equal(fatalCollision(type,20,0),true);
});
