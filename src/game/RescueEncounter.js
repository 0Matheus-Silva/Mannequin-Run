import * as THREE from 'three';
import {RescueState,SUPPLY_START,ENCOUNTER_END,REQUIRED_HITS,SUPPLY_AMOUNT} from './RescueState.js';
import {bridgeHeight} from '../environments/BridgeProfile.js';
export class RescueEncounter {
 constructor(scene){
  this.state=new RescueState();this.root=new THREE.Group();scene.add(this.root);
  const metal=new THREE.MeshStandardMaterial({color:0x34494d,metalness:.65,roughness:.55}),dark=new THREE.MeshStandardMaterial({color:0x111d21,metalness:.5,roughness:.7}),light=new THREE.MeshStandardMaterial({color:0xff7d40,emissive:0xf3420b,emissiveIntensity:1.2}),good=new THREE.MeshStandardMaterial({color:0x5fffd1,emissive:0x25ba9b,emissiveIntensity:1.5});
  const box=(parent,mat,x,y,z,w,h,d)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(1,1,1),mat);m.position.set(x,y,z);m.scale.set(w,h,d);parent.add(m);return m;};
  this.boss=new THREE.Group();this.root.add(this.boss);box(this.boss,metal,0,0,0,3.3,3.6,1.5);box(this.boss,dark,0,.2,.77,2.9,2.8,.08);
  for(let i=0;i<6;i++){box(this.boss,metal,0,-1.2+i*.4,.83,2.6,.28,.1);box(this.boss,i%2?good:light,-1,-1.2+i*.4,.9,.13,.08,.05);}
  for(const side of [-1,1]){const eye=box(this.boss,light,side*.7,1,.91,.65,.16,.08);eye.rotation.z=side*-.3;box(this.boss,metal,side*2,0,0,.5,2.6,.8);}
  this.core=box(this.boss,light,0,-.1,.93,.6,.6,.12);
  // The starting supply remains automatic, without a barrier across the lanes.
  this.supplies=[];
  this.shots=Array.from({length:5},()=>{const shot=new THREE.Mesh(new THREE.BoxGeometry(.18,.18,.32),good);shot.visible=false;this.root.add(shot);return shot;});this.shotAge=[];this.shotOrigin=[];this.hud=document.querySelector('#rescue-hud');
 }
 entryProtected(distance,mode){const d=((distance%3000)+3000)%3000;return mode==='story'&&d>=2320&&d<=SUPPLY_START+24;}
 reset(distance=0){this.state.reset(distance);this.root.visible=false;this.exitTime=0;this.shotAge=[];this.shots.forEach(s=>s.visible=false);this.hud.hidden=true;}
 update(dt,distance,mode){const active=mode==='story'&&distance>=2400&&distance<ENCOUNTER_END;this.root.visible=active;this.hud.hidden=!active;if(!active)return false;
  const collected=this.state.update(dt,distance),s=this.state;if(collected)this.collect(distance,0,1,SUPPLY_AMOUNT);this.root.position.y=bridgeHeight(distance);
  if(s.completed)this.exitTime+=dt;this.boss.visible=!s.completed||this.exitTime<2;this.boss.position.set(0,6.5+Math.sin(distance*.035)*.25+(s.completed?this.exitTime*5:0),-24-(s.completed?this.exitTime*8:0));this.core.material=s.completed?this.shots[0].material:this.boss.children[3].material;this.boss.rotation.z=Math.sin(distance*.02)*.035;
  this.shots.forEach((shot,i)=>{const age=this.shotAge[i];if(age===undefined)return;this.shotAge[i]+=dt;const t=this.shotAge[i]/.42;shot.visible=t>=0&&t<1;const origin=this.shotOrigin[i]??{x:0,y:1.4};shot.position.set(origin.x*(1-t),origin.y+(6.5-origin.y)*t,-24*t);shot.rotation.z+=dt*8;if(t>=1)this.shotAge[i]=undefined;});
  document.querySelector('#rescue-progress').max=REQUIRED_HITS;document.querySelector('#rescue-progress').value=s.hits;
  document.querySelector('#rescue-count').textContent=`SERVIDOR ${s.hits}/${REQUIRED_HITS}`;
  document.querySelector('#rescue-message').textContent=s.completed?'SERVIDOR RECUPERADO':'PEGUE COMPONENTES PARA AJUDAR O SERVIDOR';return collected;
 }
 collect(distance,x=0,y=1.4,amount=1){const added=this.state.collect(distance,amount);for(let n=0;n<added;n++){let i=this.shotAge.findIndex(value=>value===undefined);if(i<0)i=this.shotAge.length%this.shots.length;this.shotAge[i]=-n*.1;this.shotOrigin[i]={x,y};}return added;}
}
