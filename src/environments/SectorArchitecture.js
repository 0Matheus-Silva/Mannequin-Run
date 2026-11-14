import * as THREE from 'three';
import { getPatina } from '../graphics/Patina.js';
import { getSurfaces } from '../graphics/SurfaceLibrary.js';

function assets(w){
  if(w.art)return w.art;const p=getPatina(),s=getSurfaces();
  const mat=(color,roughness=.8,metalness=.2,map=p.steel)=>new THREE.MeshStandardMaterial({color,roughness,metalness,map});
  w.art={concrete:mat(0x9c8c76),asphalt:mat(0x696c70,.94,.05,p.asphalt),rust:mat(0xd6a27b,.8,.45,p.rust),paint:mat(0x8caaa4,.8,.3,p.head),glass:mat(0x203740,.3,.45),leaf:mat(0x40563c,.95,.05),toxic:new THREE.MeshStandardMaterial({color:0x659b32,emissive:0x5cda18,emissiveIntensity:.65,roughness:.25,metalness:.35}),wet:mat(0x26352d,.32,.4),sphere:new THREE.SphereGeometry(1,8,6),steam:new THREE.SpriteMaterial({map:s.glow,color:0xbac7c2,transparent:true,opacity:.13,depthWrite:false}),mist:new THREE.SpriteMaterial({map:s.glow,color:0x65b86b,transparent:true,opacity:.14,depthWrite:false})};return w.art;
}
export function buildExterior(w,index,sector){
  const a=assets(w),g=new THREE.Group(),random=w.random(index*73+sector*977);g.userData.animated=[];
  const box=(m,x,y,z,ww,h,d)=>w.box(g,m,x,y,z,ww,h,d);
  const cyl=(m,x,y,z,r,h,rz=0)=>{const mesh=new THREE.Mesh(w.labCylinder,m);mesh.position.set(x,y,z);mesh.scale.set(r,h,r);mesh.rotation.z=rz;mesh.castShadow=true;g.add(mesh);return mesh;};
  const leaf=(x,y,z,size=.5)=>{const m=new THREE.Mesh(a.sphere,a.leaf);m.position.set(x,y,z);m.scale.set(size,.23*size,size*.6);m.rotation.z=random()*2;g.add(m);};
  const steam=(x,y,z,green=false)=>{const m=new THREE.Sprite(green?a.mist:a.steam);m.position.set(x,y,z);m.scale.set(3,2,1);m.userData.steam=true;g.add(m);g.userData.animated.push(m);};
  box(sector===1?a.asphalt:a.wet,0,-.22,-8,12,.4,16);
  for(const side of [-1,1]){
    box(a.concrete,side*5.15,.04,-8,1.6,.25,16);
    if(sector===1){
      box(a.concrete,side*8,-.2,-8,4.2,.4,16);
      for(let n=0;n<2;n++){
        const z=-3-n*8,h=8+random()*13;
        // Exposed slabs and columns leave real openings in broken buildings.
        for(const dz of [-2,2])box(a.concrete,side*8.7,h/2,z+dz,3,h,.42);
        for(let y=.5;y<h;y+=2.4){
          box(a.concrete,side*8.5,y,z,3.8,.25,4.5);
          for(const dz of [-1.3,1.3])if(random()>.2){box(a.concrete,side*6.7,y+1,z+dz,.3,2,.32);box(a.glass,side*6.82,y+1,z+dz+.4,.05,1.3,.6);}
        }
        const broken=box(a.concrete,side*8.2,h,z,3.7,.5,2);broken.rotation.z=side*.17;
        box(a.concrete,side*17,h*.75,z-3,5,h*1.5,6);
      }
      const z=-5-(index%2)*5;const car=new THREE.Group();car.position.set(side*6.35,.15,z);g.add(car);
      const carBox=(m,x,y,zz,ww,h,d)=>w.box(car,m,x,y,zz,ww,h,d);
      carBox(a.rust,0,.45,0,1.7,.65,3.6);carBox(a.paint,0,1.02,-.2,1.5,.7,1.9);carBox(a.glass,0,1.08,-1.16,1.25,.46,.025);
      for(const x of [-.84,.84])for(const zz of [-1.15,1.15]){const tire=new THREE.Mesh(w.labCylinder,w.dark);tire.rotation.z=Math.PI/2;tire.position.set(x,.3,zz);tire.scale.set(.34,.18,.34);car.add(tire);}
      if(index%3===0){car.rotation.z=side*1.25;car.position.y=.8;}
      if(index%3===1){box(a.paint,side*12,1.4,-7,2.7,2.8,7);for(let n=0;n<5;n++)box(a.glass,side*10.62,1.8,-9.7+n*1.2,.02,1,.8);}
      for(let n=0;n<8;n++){
        const debris=box(a.concrete,side*(4.6+random()*2),.1+random()*.2,-random()*16,.25+random()*.6,.2+random()*.25,.4);debris.rotation.y=random()*3;
        leaf(side*(5.3+random()),.3+random()*.4,-random()*16,.25+random()*.25);
      }
      for(let n=0;n<6;n++){const crack=box(w.dark,(random()-.5)*7,.008,-random()*16,.025,.013,1+random()*2);crack.rotation.y=random()*3;}
      box(a.concrete,side*4.2,.015,-6,.07,.02,3);
    }else if(sector===2){
      box(a.rust,side*9,4,-8,5.5,8,14);
      for(let y=1;y<8;y+=2)for(let n=0;n<5;n++)box(w.amber,side*6.22,y,-2-n*2.6,.025,.45,1.2);
      cyl(a.rust,side*12,8,-5,1.2,16);cyl(a.concrete,side*12,15.5,-5,1.25,.45);
      cyl(a.rust,side*16,4,-11,2.1,8);
      for(let p=0;p<3;p++){const pipe=cyl(a.rust,side*(5.8+p*.48),5.5+p*.5,-8,.17,16);pipe.rotation.x=Math.PI/2;}
      for(const z of [-2,-10]){box(w.metal,side*5.6,4,z,.3,8,.35);box(a.rust,side*6.5,6,z,2.4,.2,3);for(const x of [5.4,7.5])box(w.trim,side*x,6.5,z,.07,1,3);}
      box(a.rust,side*6.1,.9,-6,1.7,.3,5);for(let n=0;n<8;n++)box(w.dark,side*6.1,1.08,-8.2+n*.6,1.5,.06,.18);
      if(index%2===0){steam(side*6,3.5,-4);box(w.amber,side*5.5,3,-4,.1,.25,.14);}
      if(side===1){box(a.rust,7,10,-8,.5,20,.5);box(a.rust,0,15,-8,15,.5,.7);cyl(w.dark,4,11.5,-8,.035,7);}
    }else{
      box(a.toxic,side*6.4,-.015,-8,1.6,.035,16);
      for(let n=0;n<2;n++){
        const z=-3-n*8;cyl(a.rust,side*10,4,z,2.3,8);cyl(w.metal,side*10,8,z,2.4,.25);
        const pipe=cyl(a.rust,side*7.4,1.3,z,.22,3.4,Math.PI/2);pipe.rotation.y=.2;
        cyl(a.toxic,side*6.5,.55,z,.06,1.1);
        cyl(a.rust,side*5.3,.65,z-2,.42,1.3);cyl(a.toxic,side*5.3,.67,z-2,.43,.32);
        box(a.concrete,side*16,7,z,5,14,5);
      }
      for(let n=0;n<4;n++){const z=-random()*16,x=side*(5.2+random());cyl(w.dark,x,.7,z,.04,1.4,side*.25);leaf(x+side*.25,1,z,.75);leaf(x-side*.2,.6,z,.5);}
      box(w.warning??w.amber,side*5.4,2.2,-5,.06,.8,.75);steam(side*7,1.7,-10,true);
    }
  }
  if(sector===2){box(a.rust,0,9,-.5,13,.4,.7);box(w.amber,0,8.75,-.5,3,.05,.2);}
  return g;
}
