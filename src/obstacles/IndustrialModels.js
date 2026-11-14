import * as THREE from 'three';
import { batchMeshes } from '../utils/batchMeshes.js';
import { OBSTACLES } from './Collision.js';

export function buildObstacle(w,type){
  const g=new THREE.Group();const box=(m,x,y,z,a,b,c)=>w.box(g,m,x,y,z,a,b,c);
  const armor=(m,x,y,z,a,b,c)=>{const mesh=new THREE.Mesh(w.armorGeometry,m);mesh.position.set(x,y,z);mesh.scale.set(a,b,c);mesh.castShadow=true;g.add(mesh);return mesh;};
  const bolt=(x,y,z)=>{const m=new THREE.Mesh(w.boltGeometry,w.chrome);m.position.set(x,y,z);m.rotation.x=Math.PI/2;g.add(m);};
  if(type==='block'){
    armor(w.material,0,1.5,0,1.72,2.98,1.22);
    box(w.black,0,1.52,.602,1.51,2.74,.035);
    for(const x of [-.79,.79])box(w.chrome,x,1.5,.61,.07,2.86,.06);
    for(const y of [.16,2.84])box(w.chrome,0,y,.63,1.61,.08,.035);
    for(let row=0;row<3;row++){
      box(w.material,0,.63+row*.79,.62,1.39,.69,.025);
      box(w.black,-.1,.63+row*.79,.63,1.02,.47,.015);
      for(let n=0;n<5;n++)box(w.chrome,-.12,.45+row*.79+n*.075,.64,.86,.017,.015);
      box(row===1?w.red:w.cyan,.59,.64+row*.79,.64,.045,.1,.015);
      for(const x of [-.64,.64])for(const dy of [-.25,.25])bolt(x,.63+row*.79+dy,.64);
    }
    box(w.red,0,2.7,.64,.9,.045,.015);
    box(w.black,0,.06,0,1.8,.12,1.3);
  }else if(type==='jump'){
    armor(w.material,0,.38,0,1.76,.73,.96);
    box(w.black,0,.39,.485,1.7,.51,.025);
    for(let n=0;n<7;n++){
      const stripe=box(w.warning,-.66+n*.22,.39,.49,.12,.46,.018);stripe.rotation.z=-.32;
    }
    for(const x of [-.76,.76]){
      armor(w.chrome,x,.39,0,.17,.72,.94);
      box(w.warning,x,.69,.49,.1,.07,.02);
      for(const y of [.17,.58])bolt(x,y,.49);
    }
    box(w.black,0,.73,0,1.45,.07,.9);
    box(w.warning,0,.768,.25,1.24,.02,.04);
  }else{
    // Solid gantry above 1.18m. Side feet stay outside the clear central opening.
    armor(w.material,0,2.045,0,1.85,1.7,.95);
    box(w.black,0,2.08,.477,1.68,1.46,.025);
    for(let n=0;n<5;n++)box(w.chrome,0,1.54+n*.24,.485,1.5,.045,.018);
    box(w.red,0,1.21,.49,1.88,.055,.018);
    for(const x of [-.91,.91]){
      box(w.chrome,x,2.05,0,.075,1.7,.92);
      box(w.black,x,.59,0,.075,1.18,.8);
      box(w.warning,x,1.5,.49,.045,.36,.015);
      for(const y of [1.4,2.65])bolt(x,y,.49);
    }
    // Down-facing chevron identifies the clearance without changing collision space.
    for(const side of [-1,1]){const arrow=box(w.warning,side*.12,1.87,.48,.3,.06,.025);arrow.rotation.z=side*.5;}
  }
  g.userData.hitbox={...OBSTACLES[type]};g.userData.type=type;
  return batchMeshes(g);
}

export function buildChip(w){
  const chip=new THREE.Group();
  const body=new THREE.Mesh(w.armorGeometry,w.material);body.scale.set(.43,.43,.12);chip.add(body);
  for(const side of [-1,1]){
    w.box(chip,w.black,0,0,side*.07,.34,.34,.025);
    w.box(chip,w.cyan,0,0,side*.09,.17,.17,.025);
    for(let n=-1;n<=1;n++){
      w.box(chip,w.chrome,side*.275,n*.115,0,.12,.037,.045);
      w.box(chip,w.chrome,n*.115,side*.275,0,.037,.12,.045);
      w.box(chip,w.cyan,side*.13,n*.095,side*.087,.035,.02,.018);
    }
  }
  const halo=new THREE.Sprite(w.haloMaterial);halo.scale.set(1.05,1.05,1.05);chip.add(halo);
  return batchMeshes(chip);
}
