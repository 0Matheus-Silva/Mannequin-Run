import * as THREE from 'three';
import { createCompetitor } from './Competitors.js';
import { buildCampus, entranceState } from './Campus.js';
import { batchMeshes } from '../utils/batchMeshes.js';
import { createPlasmaProject } from './PlasmaProject.js';
import { awardCamera } from './AwardCamera.js';
import { CREDITS_DURATION } from './Credits.js';

export const ENDING_DURATION=35;
export const CREDITS_START=34.8;
export function endingPhase(t){return t<10.5?'arrival':t<17?'interior':t<31?'podium':t<ENDING_DURATION?'trophy':'victory';}
export function arrivalTravel(t,speed=28){const first=Math.min(t,3),u=first/3;return Math.min(180,speed*first+(10-speed)*3*(u**3-.5*u**4)+Math.max(0,t-3)*10);}
// All heights are measured from the auditorium floor; the stage is 0.36 m high.
export function podiumTiming(speed=28){
  const start=3+(180-(speed+10)*1.5)/10-.3;
  return {start,stairs:start+.6,landing:start+1.65,turn:start+1.65,end:start+1.9};
}
export function podiumWalk(t,speed=28){
  const timing=podiumTiming(speed),approach=THREE.MathUtils.clamp((t-timing.start)/.6,0,1),u=THREE.MathUtils.clamp((t-timing.stairs)/1.05,0,1);
  const settle=THREE.MathUtils.clamp((t-timing.landing)/.25,0,1),air=u===0||u===1?0:Math.sin(Math.PI*u);
  return {x:0,z:t<timing.stairs?-4.8*approach:-4.8-5.2*u,
    y:t<timing.stairs?.36*THREE.MathUtils.smoothstep(t,timing.stairs-.25,timing.stairs):.36+1.8*THREE.MathUtils.smoothstep(u,0,1)+2.5*air,
    rotation:Math.PI*THREE.MathUtils.smoothstep(u,0,1),spin:Math.PI*2*THREE.MathUtils.smootherstep(u,0,1),
    jumping:t>=timing.stairs&&t<timing.landing,settle:Math.sin(Math.PI*settle),turning:t>=timing.landing&&t<=timing.end,progress:u};
}
function sign(text,color='#153956',background='#edece4',w=1024,h=192){
  const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');x.fillStyle=background;x.fillRect(0,0,w,h);x.fillStyle=color;x.font=`bold ${Math.floor(h*.63)}px Arial`;x.textAlign='center';x.textBaseline='middle';x.fillText(text,w/2,h*.54,w*.92);
  const texture=new THREE.CanvasTexture(c);texture.colorSpace=THREE.SRGBColorSpace;
  return new THREE.MeshBasicMaterial({map:texture,side:THREE.DoubleSide});
}
export class StoryFinale{
  constructor(game){
    this.game=game;this.root=new THREE.Group();game.scene.add(this.root);this.root.visible=false;
    this.boxGeometry=new THREE.BoxGeometry(1,1,1);this.cylinder=new THREE.CylinderGeometry(1,1,1,16);
    const mat=(color,roughness=.7,metalness=.1)=>new THREE.MeshStandardMaterial({color,roughness,metalness});
    this.white=mat(0xe1dfd0);this.paving=mat(0x8b938d);this.blue=mat(0x155288);this.green=mat(0x55a64a);this.glass=mat(0x6d9d9d,.25,.5);this.dark=mat(0x263a3b);this.wood=mat(0x78513b);this.purple=mat(0x322b4a);this.gold=mat(0xeac26c,.27,.75);
    this.buildCampus();this.buildAuditorium();
    this.others=[createCompetitor('monitor-chest'),createPlasmaProject()];
    this.others.forEach(bot=>this.root.add(bot.root));
    this.trophy=this.makeTrophy();this.root.add(this.trophy);
    batchMeshes(this.campus);batchMeshes(this.hall);batchMeshes(this.auditorium);
    this.elapsed=0;this.done=false;this.cheered=false;
  }
  box(parent,material,x,y,z,w,h,d){const mesh=new THREE.Mesh(this.boxGeometry,material);mesh.position.set(x,y,z);mesh.scale.set(w,h,d);mesh.receiveShadow=true;parent.add(mesh);return mesh;}
  text(parent,text,x,y,z,w,h,material){return this.box(parent,material??sign(text),x,y,z,w,h,.03);}
  round(parent,material,x,y,z,r,h){const mesh=new THREE.Mesh(this.cylinder,material);mesh.position.set(x,y,z);mesh.scale.set(r,h,r);parent.add(mesh);return mesh;}
  palm(parent,x,z){
    const trunk=this.round(parent,this.wood,x,2.6,z,.16,5.2);trunk.rotation.z=x>0?.07:-.08;
    const leafGeometry=new THREE.SphereGeometry(1,8,5);
    for(let n=0;n<7;n++){const leaf=new THREE.Mesh(leafGeometry,this.green);leaf.scale.set(2,.13,.45);leaf.position.set(x,5.1,z);leaf.rotation.set(.2,n*Math.PI*2/7,.15);parent.add(leaf);}
  }
  buildCampus(){buildCampus(this);}
  buildAuditorium(){
    const g=this.auditorium=new THREE.Group();this.root.add(g);
    // Meet the foyer at -167.5 without coplanar overlap (z-fighting).
    this.groundSurfaces.auditorium=this.box(g,this.wood,0,-.2,-190.75,28,.4,46.5);
    for(const x of [-14,14])this.box(g,this.purple,x,5.5,-188,.4,11,50);
    this.box(g,this.dark,0,11,-188,28,.3,50);
    this.box(g,this.purple,0,5.5,-198,28,11,.3);
    for(let x=-13;x<14;x+=1.1)this.round(g,this.purple,x,5.2,-197.7,.25,10.4);
    this.box(g,this.wood,0,.18,-191,18,.36,13);
    this.text(g,'EXPOTECH 2026',0,6.6,-197.45,15,2.1,sign('EXPOTECH 2026','#f5dfad','#162d44'));
    this.winnerScreen=this.text(g,'WIN! — 1º LUGAR',0,5.05,-197.4,8,.65,sign('WIN! — 1º LUGAR','#ffe1a1','#162d44'));this.winnerScreen.visible=false;
    this.winnerLight=new THREE.PointLight(0xffdc8e,0,12,2);this.winnerLight.position.set(0,6,-188);g.add(this.winnerLight);
    const places=[{x:-4.4,height:1.2,rank:'2'},{x:0,height:1.8,rank:'1'},{x:4.4,height:.95,rank:'3'}];
    this.podiumParts=[];this.rankSigns=[];this.podiumStairs=[];
    for(const place of places){
      const platform=new THREE.Group();g.add(platform);
      this.podiumParts.push(this.box(platform,this.gold,place.x,.36+place.height/2,-190,4,place.height,2.7));
      this.box(platform,this.dark,place.x,.39,-190,4.04,.06,2.74);
      this.box(platform,this.gold,place.x,.36+place.height-.025,-190,4.08,.05,2.76);
      const label=this.text(platform,place.rank,place.x,.36+place.height*.66,-188.56,.85,.62,sign(place.rank,'#fff7d5','#253642',192,144));label.userData.rank=place.rank;this.rankSigns.push(label);
    }
    for(const side of [-1,1])for(let n=0;n<4;n++){this.box(g,this.dark,side*9,1,-174-n*3,4,1.7,.7);}
    // A seated audience faces the stage, leaving the central aisle open.
    const headGeometry=new THREE.SphereGeometry(.22,10,8),skin=[0xc99370,0x8c604b,0xdec0a0,0x715044].map(color=>new THREE.MeshStandardMaterial({color,roughness:.95}));
    const clothes=[0x334d61,0x665a55,0x435746,0x555168].map(color=>new THREE.MeshStandardMaterial({color,roughness:1}));
    for(const side of [-1,1])for(let row=0;row<4;row++)for(let seat=0;seat<4;seat++){
      const x=side*(7.55+seat*.95),z=-174-row*3,i=(row*5+seat+(side>0?2:0))%4;
      this.box(g,clothes[i],x,2.08,z,.53,.75,.4);
      const head=new THREE.Mesh(headGeometry,skin[(i+row)%4]);head.position.set(x,2.65,z-.02);g.add(head);
      for(const arm of [-1,1])this.box(g,clothes[i],x+arm*.33,2.08,z,.13,.65,.16);
      for(const leg of [-1,1])this.box(g,this.dark,x+leg*.15,1.64,z-.28,.16,.2,.56);
    }
    for(const side of [-1,1]){const light=new THREE.PointLight(0xffc879,75,20,2);light.position.set(side*6,7,-188);g.add(light);}
  }
  makeTrophy(){
    const g=new THREE.Group();this.round(g,this.gold,0,0,0,.13,.08);this.round(g,this.gold,0,.18,0,.035,.3);
    const cup=new THREE.Mesh(new THREE.CylinderGeometry(.19,.06,.24,16),this.gold);cup.position.y=.4;g.add(cup);
    for(const side of [-1,1]){const handle=new THREE.Mesh(new THREE.TorusGeometry(.12,.02,6,14),this.gold);handle.position.set(side*.18,.38,0);g.add(handle);}g.visible=false;return g;
  }
  start(){
    this.creditElapsed=-CREDITS_START;this.creditsManual=false;this.creditsFinished=false;this.soundCues=new Set();
    this.game.camera.far=420;this.game.camera.updateProjectionMatrix();
    this.elapsed=0;this.done=false;this.cheered=false;this.root.visible=true;this.root.position.set(0,0,0);
    this.initialFog=this.game.scene.fog.color.clone();this.initialFogDensity=this.game.scene.fog.density;this.startCamera=this.game.camera.position.clone();this.startTarget=this.game.target.clone();this.arrivalSpeed=this.game.session.speed;this.startX=this.game.motion.x;this.startY=this.game.motion.y;this.game.player.resetPose();this.game.track.reset();this.game.passages.reset();this.game.motion.reset();this.trophy.visible=false;
  }
  reset(){this.root.visible=false;this.trophy.visible=false;this.elapsed=0;this.done=false;this.game.camera.far=180;this.game.camera.updateProjectionMatrix();this.game.world.segments.forEach(s=>{s.visible=true;for(const [node,visible] of s.userData.approachHidden??[])node.visible=visible;delete s.userData.approachHidden;});}
  preview(distance){
    this.root.visible=true;this.campus.visible=true;this.hall.visible=true;this.auditorium.visible=false;this.others.forEach(bot=>bot.root.visible=false);this.trophy.visible=false;
    this.root.position.z=distance-2400;this.updateEntrance(105-this.root.position.z);
    this.game.camera.far=420;this.game.camera.updateProjectionMatrix();
    const blend=THREE.MathUtils.smoothstep(distance,2220,2300);this.game.scene.fog.density=THREE.MathUtils.lerp(this.game.scene.fog.density,.003,blend);
    this.daylight(blend);
    this.trimStreet();
  }
  daylight(blend){
    const uniforms=this.game.atmosphere.skyMaterial.uniforms;
    uniforms.top.value.lerp(new THREE.Color(0x607fa6),blend);uniforms.bottom.value.lerp(new THREE.Color(0xb9c2c8),blend);
  }
  trimStreet(){
    const world=this.game.world;
    world.segments.forEach(segment=>{
      segment.visible=segment.position.z>this.root.position.z-88;
      if(segment.position.z<this.root.position.z+118&&!segment.userData.approachHidden){
        segment.userData.approachHidden=[];
        segment.traverse(node=>{if((node.isMesh||node.isSprite)&&node.material!==world.art?.asphalt&&node.material!==world.art?.wet){segment.userData.approachHidden.push([node,node.visible]);node.visible=false;}});
      }
    });
  }
  updateEntrance(remaining){this.entryOpen=entranceState(remaining);this.entryDoors.forEach((door,i)=>door.position.x=(i?1:-1)*(1.95+this.entryOpen*4.3));}
  replayCredits(){this.creditElapsed=0;this.creditsManual=true;}
  seek(time){this.elapsed=Math.min(ENDING_DURATION,Math.max(0,time));this.creditElapsed=time-CREDITS_START;this.done=time>=ENDING_DURATION;if(this.done)this.game.setState('victory');}
  get walking(){return this.elapsed<podiumTiming(this.arrivalSpeed).stairs;}
  advance(dt){
    const previous=this.elapsed,landed=podiumTiming(this.arrivalSpeed).end,before=arrivalTravel(previous,this.arrivalSpeed),rate=1.4;
    let next=previous+dt*(previous>=21?rate:1);
    // Begin the presentations immediately after the landing, without a timed hold.
    if(previous<21&&next>=landed)next=21+(next-landed)*rate;
    this.elapsed=Math.min(ENDING_DURATION,next);
    if(this.creditsManual||previous>=CREDITS_START)this.creditElapsed+=dt;
    else this.creditElapsed=this.elapsed<CREDITS_START?this.elapsed-CREDITS_START:(next-CREDITS_START)/rate;
    if(Math.abs(this.creditElapsed)<1e-8)this.creditElapsed=0;
    const after=arrivalTravel(this.elapsed,this.arrivalSpeed);
    if(after>before&&dt>0)this.game.world.update(dt,(after-before)/dt,2400+after);
    if(this.elapsed>=ENDING_DURATION&&!this.done){this.done=true;this.game.setState('victory');}
    if(this.done&&!this.creditsFinished&&(!this.game.settings.credits||this.creditElapsed>=CREDITS_DURATION)){
      this.creditsFinished=true;this.game.events.dispatchEvent(new CustomEvent('creditsfinished'));
    }
  }
  present(dt){
    const g=this.game,t=this.elapsed,travel=arrivalTravel(t,this.arrivalSpeed),phase=endingPhase(t);this.phase=phase;
    g.audio.setCeremonyDucking(t);
    this.campus.visible=true;this.hall.visible=true;this.auditorium.visible=true;this.others.forEach(bot=>bot.root.visible=true);
    this.root.position.z=travel;g.world.root.visible=false;this.updateEntrance(105-travel);
    const warm=THREE.MathUtils.smoothstep(t,0,6);g.scene.fog.color.copy(this.initialFog).lerp(new THREE.Color(0xadb9bd),warm);g.scene.fog.density=THREE.MathUtils.lerp(this.initialFogDensity??.004,.003,warm);g.atmosphere.update(780);this.daylight(1);
    const walk=podiumWalk(t,this.arrivalSpeed);
    g.player.root.rotation.y=walk.rotation;
    g.player.root.position.set(walk.x+this.startX*(1-THREE.MathUtils.smoothstep(t,0,4)),walk.y+this.startY*(1-THREE.MathUtils.smoothstep(t,0,1)),walk.z);
    if(walk.jumping){
      const tuck=Math.sin(walk.progress*Math.PI);
      g.player.body.position.y=0;g.player.body.rotation.set(-.12,walk.spin,0);g.player.neck.rotation.set(0,0,0);
      g.player.legs.forEach((leg,i)=>{leg.pivot.rotation.x=(i?.35:-.35)*tuck;leg.joint.rotation.x=-.08-.8*tuck;leg.foot.rotation.x=0;});
      g.player.arms.forEach((arm,i)=>{arm.pivot.rotation.set(-.35,0,(i?1:-1)*(.15+.6*tuck));arm.joint.rotation.x=-.4;});
    }
    if(walk.turning){g.player.body.position.y=0;g.player.body.rotation.set(0,0,0);g.player.neck.rotation.set(0,0,0);g.player.legs.forEach(leg=>{leg.pivot.rotation.x=0;leg.joint.rotation.x=-.08;leg.foot.rotation.x=0;});}
    if(walk.turning){g.player.body.position.y=-.1*walk.settle;g.player.legs.forEach(leg=>leg.joint.rotation.x-=.2*walk.settle);}
    if(t<8){const blend=THREE.MathUtils.smoothstep(t,0,6);g.camera.position.lerpVectors(this.startCamera,new THREE.Vector3(5,5.4,13),blend);g.target.lerpVectors(this.startTarget,new THREE.Vector3(-8,3,-55),blend);}
    else if(t<18){const blend=THREE.MathUtils.smoothstep(t,8,11);g.camera.position.lerpVectors(new THREE.Vector3(5,5.4,13),new THREE.Vector3(0,3.8,7),blend);g.target.lerpVectors(new THREE.Vector3(-8,3,-55),new THREE.Vector3(0,2,-20),blend);}
    else if(t<21){const blend=THREE.MathUtils.smootherstep(t,18,21);g.camera.position.lerpVectors(new THREE.Vector3(0,3.8,7),new THREE.Vector3(0,4.5,9),blend);g.target.lerpVectors(new THREE.Vector3(0,2,-20),new THREE.Vector3(0,3.1,-10),blend);}
    else{const shot=awardCamera(t);g.camera.position.copy(shot.position);g.target.copy(shot.target);g.camera.fov=shot.fov;g.camera.updateProjectionMatrix();}
    const jumpTiming=podiumTiming(this.arrivalSpeed);
    if(t>=jumpTiming.start-.6&&t<21){
      const follow=THREE.MathUtils.smootherstep(t,jumpTiming.start-.6,jumpTiming.stairs),wide=0;
      g.camera.position.set(0,THREE.MathUtils.lerp(THREE.MathUtils.lerp(3.8,5.4,follow),4.5,wide),THREE.MathUtils.lerp(THREE.MathUtils.lerp(7,11,follow),9,wide));
      g.target.set(0,THREE.MathUtils.lerp(THREE.MathUtils.lerp(2,3.4,follow),3.1,wide),THREE.MathUtils.lerp(THREE.MathUtils.lerp(-20,-8,follow),-10,wide));
    }
    g.camera.lookAt(g.target);
    this.others[0].update(dt,t);this.others[1].update(t);
    this.others.forEach((bot,i)=>bot.root.position.set(i?4.4:-4.4,i?1.31:1.56,-190));
    if(t>=22&&t<25.5){const cue='charge-'+Math.floor((t-22)*4);if(!this.soundCues.has(cue)){this.soundCues.add(cue);g.audio.effect('plasma-charge',(t-22)/3.5);}}
    for(const [name,from,to] of [['plasma-burst',25.5,26.4],['tongue-yelp',27.65,28.4]])if(t>=from&&t<to&&!this.soundCues.has(name)){this.soundCues.add(name);g.audio.effect(name);}
    const lift=THREE.MathUtils.smoothstep(t,32,34);
    this.trophy.visible=t>=32;
    if(t>=32){
      g.player.arms[1].pivot.rotation.x=-lift*2.5;g.player.arms[1].joint.rotation.x=-.3;
      g.player.root.updateMatrixWorld(true);const hand=g.player.arms[1].hand.getWorldPosition(new THREE.Vector3());
      this.trophy.visible=true;this.trophy.position.copy(hand).sub(this.root.position);this.trophy.position.y+=.1;
      const delivery=1-THREE.MathUtils.smoothstep(t,32,32.6);this.trophy.position.x+=delivery*1.2;this.trophy.position.y+=delivery*.35;
      if(!this.cheered){this.cheered=true;g.audio.effect('applause');}
    }
    g.ui.ending(phase,t);
    document.querySelector('#award-win').hidden=t<34;
    this.winnerScreen.visible=t>=34;this.winnerLight.intensity=12*THREE.MathUtils.smoothstep(t,32,34);
    if(t>=34&&!this.soundCues.has('victory')){this.soundCues.add('victory');g.audio.effect('victory');}
    g.ui.credits(this.creditElapsed,g.settings.credits||this.creditsManual);
  }
}
