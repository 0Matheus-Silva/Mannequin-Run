import test from 'node:test';import assert from 'node:assert/strict';
import {arrivalFogOpacity} from '../src/story/ArrivalFog.js';
test('a neblina fica totalmente opaca antes da chegada e clareia depois',()=>{
 assert.equal(arrivalFogOpacity('story','playing',2990),0);
 assert.equal(arrivalFogOpacity('story','playing',2999,0,false),0);
 assert.ok(arrivalFogOpacity('story','playing',2995)>0);
 assert.equal(arrivalFogOpacity('story','playing',3000),1);
 assert.equal(arrivalFogOpacity('story','ending',3000,0),1);
 assert.equal(arrivalFogOpacity('story','ending',3000,3.2),0);
 assert.equal(arrivalFogOpacity('infinite','playing',2990),0);
});
