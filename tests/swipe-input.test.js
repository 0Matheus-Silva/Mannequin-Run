import test from 'node:test';
import assert from 'node:assert/strict';
import {SwipeInput,swipeAction} from '../src/game/SwipeInput.js';
test('swipes use dominant direction and ignore taps and small motion',()=>{
 for(const [x,y,action]of [[50,4,'right'],[-50,4,'left'],[3,-50,'jump'],[3,50,'slide'],[10,10,null],[0,0,null]])assert.equal(swipeAction(x,y),action);
});
test('one action per touch, canceled gestures, UI isolation and inactive gameplay',()=>{
 const surface=new EventTarget(),actions=[];let enabled=true;
 const input=new SwipeInput(surface,a=>actions.push(a),{enabled:()=>enabled});
 const fire=(type,x=0,y=0,extra={})=>{const e=new Event(type,{cancelable:true});Object.assign(e,{pointerType:'touch',pointerId:1,isPrimary:true,clientX:x,clientY:y,...extra});surface.dispatchEvent(e);};
 fire('pointerdown');fire('pointermove',40);fire('pointermove',80);assert.deepEqual(actions,['right']);
 fire('pointerdown');fire('pointercancel');fire('pointermove',0,-50);assert.equal(actions.length,1);
 fire('pointerdown',0,0,{pointerType:'mouse'});fire('pointermove',50);assert.equal(actions.length,1);
 enabled=false;fire('pointerdown');fire('pointermove',50);assert.equal(actions.length,1);
 enabled=true;fire('pointerdown');enabled=false;fire('pointermove',50);enabled=true;fire('pointermove',50);assert.equal(actions.length,1);
 fire('pointerdown');fire('pointerdown',0,0,{pointerId:2,isPrimary:false});fire('pointermove',50);assert.equal(actions.length,1);
 input.dispose();fire('pointerdown');fire('pointermove',50);assert.equal(actions.length,1);
});
