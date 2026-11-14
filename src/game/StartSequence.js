import * as THREE from 'three';

export const START_DURATION=2.65;
export class StartSequence {
  constructor(){this.elapsed=0;this.active=false;this.startYaw=0;this.fromCamera=new THREE.Vector3();this.fromTarget=new THREE.Vector3();}
  begin(yaw,camera,target){this.elapsed=0;this.active=true;this.startYaw=yaw;this.fromCamera.copy(camera);this.fromTarget.copy(target);}
  advance(dt){this.elapsed=Math.min(START_DURATION,this.elapsed+dt);if(this.elapsed>=START_DURATION)this.active=false;}
  get turn(){return THREE.MathUtils.smoothstep(this.elapsed,.48,1.72);}
  get cameraBlend(){return THREE.MathUtils.smoothstep(this.elapsed,.45,START_DURATION);}
  get launch(){return THREE.MathUtils.smoothstep(this.elapsed,1.8,START_DURATION);}
  get yaw(){return THREE.MathUtils.lerp(this.startYaw,0,this.turn);}
}
