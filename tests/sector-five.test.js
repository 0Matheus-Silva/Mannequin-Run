import test from 'node:test';import assert from 'node:assert/strict';
import {PlayerController} from '../src/player/PlayerController.js';
import {RescueState,REQUIRED_HITS,SUPPLY_AMOUNT,SUPPLY_START} from '../src/game/RescueState.js';
import {turnPose,withLeftTurn} from '../src/environments/LeftTurn.js';
import {bridgeHeight,BRIDGE_START,BRIDGE_END} from '../src/environments/BridgeProfile.js';
import {storyComplete} from '../src/game/Progression.js';
test('descida acelerada prepara rolagem ao aterrissar e salto cancela rolagem',()=>{
 const p=new PlayerController();assert.ok(p.jump());for(let i=0;i<20;i++)p.update(1/120);assert.ok(p.y>0);assert.ok(p.slide());assert.ok(p.velocityY<0);for(let i=0;i<100&&p.y>0;i++)p.update(1/120);assert.equal(p.y,0);assert.ok(p.slideTime>0);assert.ok(p.jump());assert.equal(p.slideTime,0);assert.equal(p.slideBlend,0);assert.ok(p.velocityY>0);
});
test('componentes coletados recuperam servidor automaticamente',()=>{
 const r=new RescueState();assert.equal(r.collect(SUPPLY_START-1),0);assert.equal(r.update(.1,SUPPLY_START),true);assert.equal(r.collect(SUPPLY_START,SUPPLY_AMOUNT),SUPPLY_AMOUNT);assert.equal(r.update(.1,SUPPLY_START),false);
 for(let i=SUPPLY_AMOUNT;i<REQUIRED_HITS;i++)assert.equal(r.collect(2500),1);assert.ok(r.completed);assert.equal(r.collect(2500),0);assert.equal(storyComplete('story',2999),false);assert.equal(storyComplete('story',3000),true);
});
test('curva muda a direção para a esquerda sem salto de posição',()=>{
 const a=turnPose(2379.999),b=turnPose(2380),c=turnPose(2440),d=turnPose(2440.001);
 assert.ok(Math.hypot(a.x-b.x,a.z-b.z)<.002);assert.ok(Math.hypot(c.x-d.x,c.z-d.z)<.002);assert.ok(c.x<0);assert.ok(Math.abs(c.angle-Math.PI/2)<1e-8);assert.ok(d.x<c.x);
});

test('ponte desce no meio e volta ao nível nas extremidades',()=>{
 const mid=(BRIDGE_START+BRIDGE_END)/2;assert.equal(bridgeHeight(BRIDGE_START),0);assert.ok(bridgeHeight(mid)<-3);assert.equal(bridgeHeight(BRIDGE_END),0);assert.ok(bridgeHeight(mid+80)>bridgeHeight(mid));
});

test('ponte aplica altura ao renderizar sem alterar coordenadas da simulação',()=>{
 const node={visible:true,position:{x:0,y:0,z:0,set(x,y,z){this.x=x;this.y=y;this.z=z;}},rotation:{x:0,y:0},scale:{z:1},userData:{sector:4}};
 const distance=2700,game={state:'playing',session:{distance},world:{segments:[node]},track:{rows:[]},passages:{root:{visible:false}},rescue:{supplies:[],boss:{visible:false}}};
 withLeftTurn(game,()=>assert.equal(node.position.y,bridgeHeight(distance)));assert.equal(node.position.y,0);assert.equal(node.position.z,0);
});
