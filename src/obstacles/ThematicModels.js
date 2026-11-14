import * as THREE from 'three';
import { getPatina } from '../graphics/Patina.js';
import { batchMeshes } from '../utils/batchMeshes.js';
import { OBSTACLES } from './Collision.js';
export function buildThematic(w,type,sector){
  if(!w.themeMaterials){const p=getPatina();const mat=(color,map=p.rust)=>new THREE.MeshStandardMaterial({color,map,metalness:.4,roughness:.78});w.themeMaterials={rust:mat(0xd0a17b),blue:mat(0x87a8a6,p.head),glass:mat(0x32454b,p.steel),toxic:mat(0x789443),concrete:mat(0xb5a894,p.steel)};w.themeCylinder=new THREE.CylinderGeometry(1,1,1,12);}
  const a=w.themeMaterials,g=new THREE.Group();
  const box=(m,x,y,z,ww,h,d)=>w.box(g,m,x,y,z,ww,h,d);
  const cyl=(m,x,y,z,r,h,axis='y')=>{const v=new THREE.Mesh(w.themeCylinder,m);v.position.set(x,y,z);v.scale.set(r,h,r);if(axis==='x')v.rotation.z=Math.PI/2;if(axis==='z')v.rotation.x=Math.PI/2;g.add(v);return v;};
  if(sector===1){
    if(type==='block'){
      box(a.blue,0,1.48,0,1.78,2.94,1.24);box(w.black,0,1.88,.63,1.47,.86,.025);box(a.glass,0,1.9,.65,1.3,.65,.015);
      box(a.rust,0,.44,.64,1.62,.3,.02);box(w.warning,0,2.82,.64,1.5,.08,.02);
      for(const x of [-.82,.82]){box(w.black,x,1.45,0,.1,2.8,1.27);cyl(w.black,x,.35,0,.27,.12,'x');}
      for(const x of [-.56,.56])box(w.warning,x,1.18,.64,.2,.12,.025);
    }else if(type==='jump'){
      box(a.concrete,0,.34,0,1.75,.68,.95);for(let n=0;n<5;n++){const stripe=box(w.warning,-.6+n*.3,.4,.485,.15,.45,.02);stripe.rotation.z=-.3;}box(a.rust,0,.73,0,1.7,.08,.4);
    }else{
      box(a.blue,0,2.04,0,1.9,1.72,.95);box(w.black,0,2.1,.485,1.7,1.15,.025);box(w.red,0,1.22,.49,1.85,.06,.015);for(const x of [-.9,.9])box(a.rust,x,.6,0,.08,1.2,.8);
    }
  }else if(sector===2){
    if(type==='block'){
      box(a.rust,0,.25,0,1.8,.5,1.3);cyl(w.chrome,0,1.65,0,.48,2.7);box(a.rust,0,2.7,0,1.7,.6,1.2);for(const x of [-.74,.74])box(a.rust,x,1.6,0,.15,2.1,.8);box(w.warning,0,1.7,.5,.7,.18,.08);
    }else if(type==='jump'){
      cyl(a.rust,0,.4,0,.37,1.78,'x');for(const x of [-.6,.6])cyl(w.chrome,x,.4,0,.38,.1,'x');box(w.warning,0,.72,.1,1.5,.04,.2);
    }else{
      box(a.rust,0,2.1,0,1.9,1.6,1);cyl(w.chrome,0,1.37,0,.18,1.8,'x');box(w.red,0,1.2,.45,1.8,.04,.07);for(const x of [-.91,.91])box(w.black,x,.6,0,.07,1.2,.8);
    }
  }else{
    if(type==='block'){
      for(const x of [-.44,.44])for(const y of [.75,2.25]){cyl(a.rust,x,y,0,.43,1.5);cyl(a.toxic,x,y,0,.435,.28);}box(w.warning,0,1.65,.45,.65,.3,.06);
    }else if(type==='jump'){
      cyl(a.rust,0,.4,0,.36,1.78,'x');box(a.toxic,0,.12,0,1.75,.2,.94);box(w.warning,0,.73,0,1.2,.06,.15);
    }else{
      box(a.rust,0,2.1,0,1.9,1.58,.96);cyl(a.toxic,0,1.39,0,.2,1.8,'x');box(w.red,0,1.2,.45,1.85,.04,.05);for(const x of [-.91,.91])box(w.black,x,.6,0,.07,1.2,.8);
    }
  }
  g.userData.hitbox={...OBSTACLES[type]};g.userData.type=type;g.userData.sector=sector;return batchMeshes(g);
}
