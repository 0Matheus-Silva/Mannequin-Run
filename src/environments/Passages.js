import * as THREE from 'three';
import { armorGeometry } from '../graphics/Geometry.js';
import { getPatina } from '../graphics/Patina.js';
import { batchMeshes } from '../utils/batchMeshes.js';
export function passageState(distance){
  const cycle=distance%600;const boundary=distance>=600&&cycle<18?Math.floor(distance/600)*600:(Math.floor(distance/600)+1)*600;const remaining=boundary-distance;
  return{boundary,remaining,visible:remaining<=125,warning:remaining<90,open:remaining<22?1:THREE.MathUtils.smoothstep(85-remaining,0,52)};
}
export class Passages{
  constructor(scene,onDoor){
    this.root=new THREE.Group();scene.add(this.root);this.onDoor=onDoor;this.lastSound=-1;
    this.geometry=armorGeometry();this.metal=new THREE.MeshStandardMaterial({color:0x83918c,map:getPatina().steel,metalness:.55,roughness:.65});
    this.dark=new THREE.MeshStandardMaterial({color:0x26312f,metalness:.5,roughness:.7});
    this.alert=new THREE.MeshStandardMaterial({color:0xe8a148,emissive:0xff911b,emissiveIntensity:1.3});
    const box=(parent,mat,x,y,z,w,h,d)=>{const m=new THREE.Mesh(this.geometry,mat);m.position.set(x,y,z);m.scale.set(w,h,d);parent.add(m);return m;};
    for(const side of [-1,1]){box(this.root,this.metal,side*5.7,3.6,0,1.1,7.2,1.4);box(this.root,this.alert,side*5.12,4,.74,.07,3,.08);}
    box(this.root,this.metal,0,7.3,0,12.5,.75,1.7);box(this.root,this.alert,0,6.88,.89,3,.08,.08);
    this.leaves=[-1,1].map(side=>{const g=new THREE.Group();box(g,this.metal,0,3.45,0,5.1,6.9,.55);box(g,this.dark,0,3.5,.3,4.5,5.8,.08);for(let n=0;n<6;n++){const stripe=box(g,this.alert,-1.8+n*.68,1.3,.36,.32,1,.035);stripe.rotation.z=.55;}box(g,this.alert,side*2.25,3.6,.37,.05,5,.025);batchMeshes(g);this.root.add(g);return g;});
    this.root.visible=false;
  }
  reset(){this.lastSound=-1;this.root.visible=false;}
  update(distance,mode='infinite'){
    const s=passageState(distance);this.state=s;
    this.root.visible=s.visible&&!(mode==='story'&&s.boundary===2400);
    this.root.position.z=-s.remaining;
    this.leaves.forEach((g,i)=>{g.position.x=(i?1:-1)*(2.55+s.open*5.4);});
    this.alert.emissiveIntensity=s.warning?1.1+Math.sin(distance*1.2)*.25:.25;
    if(this.root.visible&&s.warning&&this.lastSound!==s.boundary){this.lastSound=s.boundary;this.onDoor?.();}
  }
}
