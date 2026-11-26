import * as THREE from 'three';
export function buildBridge(w,index){
 const g=new THREE.Group(),random=w.random(index*379+9023);g.userData.animated=[];
 if(!w.bridgeAssets){const mat=(color,roughness=1)=>new THREE.MeshStandardMaterial({color,roughness});w.bridgeAssets={wood:mat(0x80563b),wood2:mat(0x68442f),rope:mat(0xc6ac79),trunk:mat(0x493c2a),leaves:mat(0x2e633e),leaves2:mat(0x477b50),land:mat(0x395d40),rock:mat(0x7a8170),water:new THREE.MeshStandardMaterial({color:0x4e9caa,roughness:.3,metalness:.18}),foam:new THREE.MeshStandardMaterial({color:0xc9eff0,emissive:0x74aeb3,emissiveIntensity:.25}),crown:new THREE.ConeGeometry(1,1,7),stone:new THREE.DodecahedronGeometry(1,0)};}
 const a=w.bridgeAssets,box=(m,x,y,z,ww,h,d)=>w.box(g,m,x,y,z,ww,h,d);
 for(let n=0;n<20;n++){const plank=box(n%3?a.wood:a.wood2,0,-.16,-.4-n*.8,9.2,.28,.76);plank.rotation.y=(random()-.5)*.008;}
 for(const side of [-1,1]){
   box(a.wood2,side*4.4,-.34,-8,.23,.35,16);
   for(let n=0;n<=4;n++){const z=-n*4;box(a.wood2,side*4.42,.72,z,.19,1.5,.19);}
   for(const y of [.65,1.35]){const rope=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([[side*4.42,y,0],[side*4.42,y-.15,-4],[side*4.42,y,-8],[side*4.42,y-.15,-12],[side*4.42,y,-16]].map(p=>new THREE.Vector3(...p))),24,.055,6,false),a.rope);g.add(rope);}
   box(a.land,side*53,-21,-8,91,1,16);
   for(let n=0;n<16;n++){const x=side*(10+random()*77),z=-random()*16,h=2.5+random()*4.5;box(a.trunk,x,-20+h*.5,z,.3,h,.3);const crown=new THREE.Mesh(a.crown,n%2?a.leaves:a.leaves2);crown.position.set(x,-20+h,z);crown.scale.set(1.2+random()*.9,h*.72,1.2+random()*.9);g.add(crown);}
   for(let n=0;n<3;n++){const rock=new THREE.Mesh(a.stone,a.rock);rock.position.set(side*(12+random()*65),-20,-random()*16);rock.scale.set(1+random()*2,.5+random(),1+random()*2);g.add(rock);}
 }
 // River at the valley floor and cascading water visible on the far bank.
 box(a.water,0,-20.35,-8,18,.12,16);
 for(let n=0;n<4;n++)box(a.foam,(random()-.5)*14,-20.27,-2-n*4,1.2+random()*2,.03,.05);
 if(index%5===2){box(a.rock,sideValue(index)*24,-13,-14,8,16,1.6);box(a.foam,sideValue(index)*24,-13,-13.1,2,14,.16);box(a.water,sideValue(index)*24,-13,-12.98,1.6,13,.06);}
 return g;
}
function sideValue(index){return index%2?1:-1;}
