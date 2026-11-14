import * as THREE from 'three';

export class Effects {
  constructor(scene) {
    this.count=96;this.cursor=0;
    this.positions=new Float32Array(this.count*3);this.colors=new Float32Array(this.count*3);
    this.velocities=new Float32Array(this.count*3);this.life=new Float32Array(this.count);
    this.positions.fill(-1000);
    const geometry=new THREE.BufferGeometry();
    geometry.setAttribute('position',new THREE.BufferAttribute(this.positions,3));
    geometry.setAttribute('color',new THREE.BufferAttribute(this.colors,3));
    this.points=new THREE.Points(geometry,new THREE.PointsMaterial({size:.085,vertexColors:true,transparent:true,opacity:.9,depthWrite:false,blending:THREE.AdditiveBlending}));
    this.points.frustumCulled=false;scene.add(this.points);
  }
  burst(x,y,z,crash=false) {
    for(let n=0;n<(crash?40:14);n++){
      const i=this.cursor++%this.count;const j=i*3;
      this.positions.set([x,y,z],j);this.velocities.set([(Math.random()-.5)*5,1+Math.random()*4,(Math.random()-.5)*5],j);
      this.colors.set(crash?[1,.25,.08]:[.2,1,.8],j);this.life[i]=.4+Math.random()*.35;
    }
    this.points.geometry.attributes.color.needsUpdate=true;
    this.points.geometry.attributes.position.needsUpdate=true;
  }
  reset(){this.life.fill(0);this.positions.fill(-1000);this.points.geometry.attributes.position.needsUpdate=true;}
  update(dt,speed=0){
    for(let i=0;i<this.count;i++){
      if(this.life[i]<=0)continue;this.life[i]-=dt;const j=i*3;
      if(this.life[i]<=0){this.positions[j+1]=-1000;continue;}
      this.positions[j]+=this.velocities[j]*dt;this.positions[j+1]+=this.velocities[j+1]*dt;this.positions[j+2]+=(this.velocities[j+2]+speed*.5)*dt;
      this.velocities[j+1]-=dt*8;
    }
    this.points.geometry.attributes.position.needsUpdate=true;
  }
}
