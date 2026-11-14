import * as THREE from 'three';
import { buildPhysicalRig } from './PhysicalRig.js';

const ease=(a,b,x)=>THREE.MathUtils.smoothstep(x,a,b);
export class Mannequin {
  constructor(){
    this.root=new THREE.Group();this.body=new THREE.Group();this.root.add(this.body);
    buildPhysicalRig(this);
    this.time=0;this.phase=0;this.runBlend=0;this.airBlend=0;this.slideBlend=0;this.crashBlend=0;this.impactTime=0;this.landed=false;
    this.animationState='menu_idle';this.gaze=new THREE.Vector3();this.wasAirborne=false;this.landing=0;
  }
  resetPose(){this.runBlend=0;this.airBlend=0;this.slideBlend=0;this.crashBlend=0;this.phase=0;this.impactTime=0;this.landing=0;this.wasAirborne=false;}
  update(dt,running,motion=null,crashed=false,options={}){
    this.time+=dt;
    const transition=options.transition??null;
    this.animationState=crashed?'collision':transition?(transition.elapsed<.45?'menu_start_transition':'turn_to_run'):running?'gameplay_run':'menu_idle';
    const runTarget=crashed?0:transition?ease(1.8,2.6,transition.elapsed):running?1:0;
    this.runBlend=THREE.MathUtils.damp(this.runBlend,runTarget,10,dt);
    this.airBlend=THREE.MathUtils.damp(this.airBlend,(motion?.y??0)>.06?1:0,14,dt);
    this.slideBlend=motion?.slideBlend??0;
    this.crashBlend=THREE.MathUtils.damp(this.crashBlend,crashed?1:0,9,dt);
    this.phase+=dt*(9.5+(options.speed??12)*.075)*this.runBlend;
    const r=this.runBlend,t=this.time,s=this.slideBlend,a=this.airBlend,c=this.crashBlend;
    const idle=1-r;
    this.root.position.set(motion?.x??0,motion?.y??0,0);
    this.body.scale.set(1,1,1);
    this.body.position.set(Math.sin(t*.63)*.018*idle,.018+Math.sin(t*1.7)*.012*idle+Math.abs(Math.sin(this.phase))*.045*r-s*.67-c*.12,0);
    this.body.rotation.set(-.08*r-s*.8-c*.45,Math.sin(this.phase)*.035*r+Math.sin(t*.41)*.035*idle,(motion?motion.lane*2.7-motion.x:0)*-.055-c*.65);
    this.torso.rotation.y=Math.sin(t*.53)*.035*idle+Math.sin(this.phase)*.07*r;
    this.torso.rotation.x=Math.sin(t*1.7)*.009*idle;
    this.torso.scale.x=1+Math.sin(t*1.7)*.006*idle;
    this.neck.rotation.set(Math.sin(t*.71)*.025*idle,0,Math.sin(t*.43)*.025*idle);
    if(options.cameraPosition&&!running&&!transition){
      this.root.updateMatrixWorld(true);this.gaze.copy(options.cameraPosition);this.root.worldToLocal(this.gaze);
      this.neck.rotation.y=THREE.MathUtils.clamp(Math.atan2(-this.gaze.x,-this.gaze.z),-.4,.4);
      this.neck.rotation.x+=THREE.MathUtils.clamp(Math.atan2(this.gaze.y-2.25,Math.hypot(this.gaze.x,this.gaze.z)),-.18,.18);
    }
    if(transition){
      const headTurn=ease(.15,.85,transition.elapsed),bodyTurn=ease(.45,1.65,transition.elapsed);
      this.neck.rotation.y=.65*(headTurn-bodyTurn);
      this.torso.rotation.y+=.32*(headTurn-bodyTurn);
    }
    for(let i=0;i<2;i++){
      const side=i?1:-1,phase=this.phase+i*Math.PI;
      const leg=this.legs[i],arm=this.arms[i];
      leg.pivot.rotation.x=Math.sin(phase)*.65*r*(1-a)*(1-s)+a*(i?.48:-.5)+s*1.1;
      leg.pivot.rotation.z=side*.025*idle;
      leg.joint.rotation.x=-.08-Math.max(0,Math.cos(phase))*.95*r*(1-a)*(1-s)-a*.8-s*1.5;
      leg.foot.rotation.x=-Math.max(0,Math.sin(phase))*.25*r+s*.2;
      arm.pivot.rotation.set(-Math.sin(phase)*.55*r*(1-a)*(1-s)+.08*idle-a*.35+s*.3,0,-side*(.07+Math.sin(t*.9+i)*.018*idle));
      arm.joint.rotation.x=-.16-.65*r-a*.3-s*.1;
      arm.hand.rotation.x=Math.sin(t*.8+i)*.035*idle;
      for(let n=0;n<arm.fingers.length;n++)arm.fingers[n].rotation.x=-.12-Math.sin(t*.5+n+i)*.045*idle-.35*r;
    }
    // Sliding uses articulated hips/knees plus a small uniform height correction.
    // Keep the visible silhouette below the unchanged 1.18m overhead clearance.
    this.body.scale.y=1-s*.22;
    if(dt>0){const airborne=(motion?.y??0)>.01;if(this.wasAirborne&&!airborne)this.landing=.18;this.wasAirborne=airborne;this.landing=Math.max(0,this.landing-dt);}
    const land=Math.sin(Math.PI*this.landing/.18);this.body.position.y-=land*.035;this.torso.rotation.x+=land*.07;this.legs.forEach(leg=>{leg.joint.rotation.x-=land*.25;});
    this.glow.emissiveIntensity=.75+(motion?.y>0?.2:0)+Math.sin(t*.7)*.06;
    if(crashed){
      this.impactTime+=dt;const fall=ease(.12,1.1,this.impactTime);
      this.body.rotation.z=-fall*Math.PI*.48;this.body.rotation.x=-.12;
      this.body.position.y=THREE.MathUtils.lerp(0,.3,fall);
      this.root.position.y=Math.max(0,(motion?.y??0)*(1-fall));
      this.body.rotation.y=Math.sin(fall*Math.PI)*.25;
      this.arms.forEach((arm,i)=>{arm.pivot.rotation.x=-.7+fall*.5;arm.pivot.rotation.z=(i?1:-1)*fall*.55;});
      this.root.updateMatrixWorld(true);const bounds=new THREE.Box3().setFromObject(this.body);
      if(bounds.min.y<.035)this.body.position.y+=.035-bounds.min.y;
    }
  }
}
