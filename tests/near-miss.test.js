import test from 'node:test';import assert from 'node:assert/strict';
import {isNearMiss} from '../src/obstacles/Collision.js';
test('escape por pouco detecta desvio e manobras, não uma faixa distante',()=>{
 const obstacle={type:'block',x:0};assert.equal(isNearMiss({x:1.4,y:0,height:2.65},obstacle),true);assert.equal(isNearMiss({x:2.7,y:0,height:2.65},obstacle),false);
 assert.equal(isNearMiss({x:0,y:.8,height:2.65},{type:'jump',x:0}),true);assert.equal(isNearMiss({x:0,y:0,height:.8},{type:'slide',x:0}),true);
});
