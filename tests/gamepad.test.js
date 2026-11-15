import test from 'node:test';
import assert from 'node:assert/strict';
import { GamepadInput,readControls } from '../src/game/GamepadInput.js';
const pad=()=>({id:'DualSense standard',index:0,connected:true,mapping:'standard',axes:[0,0],buttons:Array.from({length:18},()=>({pressed:false,value:0}))});
test('standard DualSense mapping covers cross circle options dpad and stick deadzone',()=>{
  const p=pad();p.buttons[0].pressed=true;p.buttons[1].pressed=true;p.buttons[9].pressed=true;p.buttons[14].pressed=true;
  const c=readControls(p);assert.ok(c.cross&&c.circle&&c.options&&c.left);p.axes[0]=.2;assert.equal(readControls(p).right,false);p.axes[0]=.8;assert.equal(readControls(p).right,true);
});
test('edge detection, disconnect, reconnect, simultaneous keyboard action and menu routing',()=>{
  let pads=[pad()],playing=true;const actions=[],menus=[],status=[];
  const input=new GamepadInput(a=>actions.push(a),{getPads:()=>pads,onMenu:a=>menus.push(a),onStatus:s=>status.push(s),isPlaying:()=>playing,target:new EventTarget(),storage:{getItem:()=>null}});
  input.poll();pads[0].buttons[0].pressed=true;input.poll();input.poll();assert.deepEqual(actions,['jump']);actions.push('keyboard-left');
  pads[0].buttons[0].pressed=false;input.poll();pads[0].axes[0]=-.9;input.poll();assert.deepEqual(actions,['jump','keyboard-left','left']);
  pads=[];input.poll();assert.match(status.at(-1),/desconectado/);pads=[pad()];input.poll();playing=false;pads[0].buttons[0].pressed=true;input.poll();assert.deepEqual(menus,['cross']);input.dispose();
});
test('unknown mapping stays inert until explicit per-device calibration',()=>{
  const p=pad();p.mapping='';const saved=new Map(),actions=[];const input=new GamepadInput(a=>actions.push(a),{getPads:()=>[p],isPlaying:()=>true,target:new EventTarget(),storage:{getItem:k=>saved.get(k)||null,setItem:(k,v)=>saved.set(k,v)}});
  input.poll();p.buttons[3].pressed=true;input.poll();assert.equal(actions.length,0);p.buttons[3].pressed=false;input.calibrate('cross');input.poll();p.buttons[3].pressed=true;input.poll();p.buttons[3].pressed=false;input.poll();p.buttons[3].pressed=true;input.poll();assert.deepEqual(actions,['jump']);input.dispose();
});
test('menu pointer consumes analog motion while dpad and cross retain explicit menu actions',()=>{
 const p=pad(),menus=[];let pointers=0;
 const input=new GamepadInput(()=>assert.fail('Menu must not move player'),{getPads:()=>[p],isPlaying:()=>false,onPointer:pad=>{if(pad)pointers++;return Boolean(pad);},onMenu:key=>menus.push(key),target:new EventTarget(),storage:{getItem:()=>null}});
 input.poll();p.axes=[.9,.7];input.poll();input.poll();assert.equal(menus.length,0);assert.ok(pointers>=3);
 p.buttons[0].pressed=true;input.poll();assert.deepEqual(menus,['cross']);p.buttons[0].pressed=false;p.buttons[14].pressed=true;input.poll();assert.deepEqual(menus,['cross','left']);input.dispose();
});
