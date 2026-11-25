import * as THREE from 'three';
import { getPatina } from '../graphics/Patina.js';
import { getSurfaces } from '../graphics/SurfaceLibrary.js';
import { chasmSideFor } from './Chasm.js';
import { buildCityCar } from './CityCar.js';

function lavaTexture(){
  const canvas=document.createElement('canvas');canvas.width=canvas.height=256;const ctx=canvas.getContext('2d');
  ctx.fillStyle='#48110b';ctx.fillRect(0,0,256,256);let seed=941;const rand=()=>{seed=(1664525*seed+1013904223)>>>0;return seed/4294967296;};
  for(let n=0;n<95;n++){
    let x=rand()*256,y=rand()*256;ctx.beginPath();ctx.moveTo(x,y);
    for(let j=0;j<5;j++){x+=(rand()-.5)*35;y+=(rand()-.5)*35;ctx.lineTo(x,y);}
    ctx.lineWidth=2+rand()*7;ctx.strokeStyle=n%4===0?'#ffd25a':n%3===0?'#ff7621':'#d12d0b';ctx.stroke();
  }
  const texture=new THREE.CanvasTexture(canvas);texture.wrapS=texture.wrapT=THREE.RepeatWrapping;texture.repeat.set(2,3);texture.colorSpace=THREE.SRGBColorSpace;return texture;
}

function assets(w){
  if(w.art)return w.art;const p=getPatina(),s=getSurfaces();
  const mat=(color,roughness=.8,metalness=.2,map=p.steel)=>new THREE.MeshStandardMaterial({color,roughness,metalness,map});
  const lavaMap=lavaTexture();
  w.art={concrete:mat(0x9c8c76),asphalt:mat(0x696c70,.94,.05,p.asphalt),rust:mat(0xd6a27b,.8,.45,p.rust),paint:mat(0x8caaa4,.8,.3,p.head),glass:mat(0x203740,.3,.45),leaf:mat(0x40563c,.95,.05),distant:mat(0x766b62,.95,.05),carAsh:new THREE.MeshStandardMaterial({color:0x777a76,roughness:.67,metalness:.3}),carLight:new THREE.MeshStandardMaterial({color:0xb7b4a9,roughness:.65,metalness:.25}),carCharcoal:new THREE.MeshStandardMaterial({color:0x373d40,roughness:.66,metalness:.3}),carRed:new THREE.MeshStandardMaterial({color:0xa3312a,roughness:.62,metalness:.25}),carBlue:new THREE.MeshStandardMaterial({color:0x586b6d,roughness:.65,metalness:.3}),carRust:mat(0x754536,.85,.25,p.rust),tire:new THREE.MeshStandardMaterial({color:0x151616,roughness:.96}),hub:mat(0x76766f,.7,.55,p.steel),carGlass:new THREE.MeshStandardMaterial({color:0x1b3038,roughness:.24,metalness:.38,side:THREE.DoubleSide}),lamp:new THREE.MeshStandardMaterial({color:0xb2a68b,roughness:.4}),tail:new THREE.MeshStandardMaterial({color:0x5e201a,roughness:.6}),lava:new THREE.MeshStandardMaterial({map:lavaMap,emissiveMap:lavaMap,color:0xffffff,emissive:0xff5b15,emissiveIntensity:1.6,roughness:.75}),toxic:new THREE.MeshStandardMaterial({color:0x659b32,emissive:0x5cda18,emissiveIntensity:.65,roughness:.25,metalness:.35}),wet:mat(0x26352d,.32,.4),sphere:new THREE.SphereGeometry(1,8,6),steam:new THREE.SpriteMaterial({map:s.glow,color:0xbac7c2,transparent:true,opacity:.13,depthWrite:false}),dustMist:new THREE.SpriteMaterial({map:s.glow,color:0xb4a18b,transparent:true,opacity:.19,depthWrite:false}),lavaMist:new THREE.SpriteMaterial({map:s.glow,color:0xee652d,transparent:true,opacity:.16,depthWrite:false}),mist:new THREE.SpriteMaterial({map:s.glow,color:0x65b86b,transparent:true,opacity:.14,depthWrite:false})};return w.art;
}

// Each recycled 16 m segment carries its own distant district, roads and smoke.
function buildIndustrialDistrict(w,g,a,index,side){
  const random=w.random(index*977+side*1039+4519),box=(m,x,y,z,ww,h,d)=>w.box(g,m,x,y,z,ww,h,d);
  const cylinder=(m,x,y,z,r,h)=>{const mesh=new THREE.Mesh(w.labCylinder,m);mesh.position.set(x,y,z);mesh.scale.set(r,h,r);g.add(mesh);return mesh;};
  // Extend terrain underneath the district so gaps between facilities are not sky.
  box(a.concrete,side*54.5,-.28,-8,97,.4,16);
  box(a.concrete,side*6.8,-.18,-8,2.4,.4,16);
  for(const roadX of [25,51,79]){
    box(a.asphalt,side*roadX,.012,-8,4,.08,16);
    for(const z of [-2,-7,-12])box(w.trim,side*roadX,.06,z,.045,.02,2.3);
  }
  for(const [layer,baseX] of [17,34,63,94].entries()){
    for(let n=0;n<2;n++){
      const z=-4-n*8+(random()-.5)*1.2,x=side*(baseX+(random()-.5)*3),width=5+random()*4,depth=6.5+random()*2,height=2.8+random()*(layer===0?3:7);
      box(n%2?a.distant:a.rust,x,height/2,z,width,height,depth);
      box(w.metal,x,height+.06,z,width+.2,.12,depth+.2);
      if((index+n+layer)%3===0){
        const tankX=x+side*(width*.22),tankZ=z+(random()-.5)*2;
        cylinder(a.rust,tankX,height+.65,tankZ,.7,1.3);
      }else{
        for(let row=0;row<2;row++)for(let j=0;j<3;j++){
          const windowY=1.2+row*1.4;if(windowY<height-.35)box(a.glass,x-side*(width/2+.02),windowY,z-2+j*2,.035,.5,.9);
        }
      }
      if(layer<3&&(index+n+layer)%3===0){
        const stackX=x+side*(width*.3),stackZ=z-1,stackHeight=2.5+random()*3,top=height+stackHeight;
        cylinder(a.rust,stackX,height+stackHeight/2,stackZ,.38,stackHeight);
        cylinder(w.metal,stackX,top,stackZ,.44,.15);
        for(let puff=0;puff<2;puff++){
          const smoke=new THREE.Sprite(a.dustMist),baseY=top+.9+puff*1.3;
          smoke.position.set(stackX+side*puff*.35,baseY,stackZ);smoke.scale.set(2.6+puff,2.4+puff,1);
          smoke.userData.industrialSmoke={baseY,baseX:smoke.position.x,phase:random()*Math.PI*2};g.add(smoke);g.userData.animated.push(smoke);
        }
      }
    }
  }
}

function buildContaminatedLandscape(w,g,a,index,side){
  const random=w.random(index*421+side*877+7301),box=(m,x,y,z,ww,h,d)=>w.box(g,m,x,y,z,ww,h,d);
  if(!a.bone){
    a.bone=new THREE.MeshStandardMaterial({color:0xb9ad85,roughness:.96});
    a.deadWood=new THREE.MeshStandardMaterial({color:0x35382d,roughness:1});
    a.deadEarth=new THREE.MeshStandardMaterial({color:0x34412f,roughness:1,map:getPatina().asphalt});
    a.ribGeometry=new THREE.TorusGeometry(.65,.045,5,12,Math.PI);
  }
  const cylinder=(m,x,y,z,r,h,rz=0,rx=0)=>{const mesh=new THREE.Mesh(w.labCylinder,m);mesh.position.set(x,y,z);mesh.scale.set(r,h,r);mesh.rotation.set(rx,0,rz);g.add(mesh);return mesh;};
  // A continuous bank joins the pavement to the recycled landscape.
  box(a.deadEarth,side*54.8,-.22,-8,98,.4,16);
  for(const [riverX,width] of [[12,3.4],[36,5.4],[71,4]]){
    const bend=side*(.8+random()*1.5)*(random()>.5?1:-1);
    for(let n=0;n<8;n++){
      const x1=side*riverX+bend*Math.sin(Math.PI*n/8),x2=side*riverX+bend*Math.sin(Math.PI*(n+1)/8),angle=Math.atan((x2-x1)/-2),length=Math.hypot(x2-x1,2)+.1;
      const bank=box(a.wet,(x1+x2)/2,-.004,-1-n*2,width+.45,.035,length);bank.rotation.y=angle;
      const water=box(a.toxic,(x1+x2)/2,.019,-1-n*2,width,.035,length);water.rotation.y=angle;
    }
  }
  // Pools and scattered low mounds break up the banks without entering the lanes.
  for(let n=0;n<5;n++){
    const x=side*(8+random()*82),z=-random()*16,pool=box(a.toxic,x,.015,z,1+random()*3,.025,1+random()*3);pool.rotation.y=random()*2;
    const mound=new THREE.Mesh(a.sphere,a.deadEarth);mound.position.set(x+side*(2+random()),.1,z);mound.scale.set(1.2+random(),.25+random()*.3,1+random());g.add(mound);
  }
  for(const [layer,baseX] of [9,19,30,48,65,85,100].entries())for(let n=0;n<2;n++){
    const x=side*(baseX+(random()-.5)*3),z=-3-n*8+(random()-.5)*2,h=1.8+random()*2.3;
    cylinder(a.deadWood,x,h/2,z,.1+random()*.08,h,side*(random()-.5)*.12);
    for(const branch of [-1,1]){
      cylinder(a.deadWood,x+branch*.35,h*.7,z,.045,h*.48,-branch*.8);
      cylinder(a.deadWood,x+branch*.54,h*.87,z,.025,h*.28,-branch*.52);
    }
  }
  if((index+(side>0?1:0))%3===0){
    const x=side*(9+random()*3),z=-5-random()*6;
    cylinder(a.bone,x,.75,z,.09,3,0,Math.PI/2);
    for(let n=0;n<5;n++){
      const rib=new THREE.Mesh(a.ribGeometry,a.bone);rib.position.set(x,.34,z-1.1+n*.55);rib.scale.set(1,.8,1);g.add(rib);
    }
    const skull=new THREE.Mesh(a.sphere,a.bone);skull.position.set(x,.52,z-1.9);skull.scale.set(.35,.25,.5);g.add(skull);
    for(const s of [-1,1])cylinder(a.bone,x+s*.48,.25,z+1,.055,1.1,s*.8);
  }
  for(let n=0;n<2;n++){const haze=new THREE.Sprite(a.mist);haze.position.set(side*(13+n*17),.8+n*.6,-4-n*8);haze.scale.set(12,3,1);g.add(haze);}
}
export function buildExterior(w,index,sector){
  const a=assets(w),g=new THREE.Group(),random=w.random(index*73+sector*977);g.userData.animated=[];
  const box=(m,x,y,z,ww,h,d)=>w.box(g,m,x,y,z,ww,h,d);
  const cyl=(m,x,y,z,r,h,rz=0)=>{const mesh=new THREE.Mesh(w.labCylinder,m);mesh.position.set(x,y,z);mesh.scale.set(r,h,r);mesh.rotation.z=rz;mesh.castShadow=true;g.add(mesh);return mesh;};
  const leaf=(x,y,z,size=.5)=>{const m=new THREE.Mesh(a.sphere,a.leaf);m.position.set(x,y,z);m.scale.set(size,.23*size,size*.6);m.rotation.z=random()*2;g.add(m);};
  const steam=(x,y,z,green=false)=>{const m=new THREE.Sprite(green?a.mist:a.steam);m.position.set(x,y,z);m.scale.set(3,2,1);m.userData.steam=true;g.add(m);g.userData.animated.push(m);};
  const chasmSide=chasmSideFor(index,sector);
  g.userData.chasmSide=chasmSide;
  if(chasmSide){
    // The outer lane and its entire roadside are absent for this segment.
    box(a.asphalt,-chasmSide*2.325,-.22,-8,7.35,.4,16);
    box(a.lava,chasmSide*7,-4.8,-8,12,.3,16);
    for(let n=0;n<4;n++){
      const farWall=box(a.distant,chasmSide*(11.5+random()),-2.8,-2-n*4,1.4,4.5+random(),4.2);
      farWall.rotation.z=chasmSide*(random()-.5)*.12;
    }
    for(let n=0;n<9;n++){
      const rubble=box(a.concrete,chasmSide*(3+random()*8),-4.3+random()*.6,-random()*16,1+random()*2,.4+random(),.7+random()*2);
      rubble.rotation.set((random()-.5)*.5,random()*3,(random()-.5)*.5);
    }
    for(let n=0;n<3;n++){const haze=new THREE.Sprite(a.dustMist);haze.position.set(chasmSide*(4+n*2.8),-3.2,-3-n*5);haze.scale.set(8,3.5,1);g.add(haze);}
    for(let n=0;n<3;n++){const haze=new THREE.Sprite(a.lavaMist);haze.position.set(chasmSide*(3.5+n*2.5),-3.8,-2-n*5);haze.scale.set(5,2.4,1);g.add(haze);}
    for(let n=0;n<8;n++){
      const z=-1-n*2,face=box(a.concrete,chasmSide*(1.5+random()*.25),-2.1-random()*.5,z,.4+random()*.35,4.2+random(),2.1);
      face.rotation.z=chasmSide*(.04+random()*.09);
      const edge=box(a.concrete,chasmSide*(1.36+random()*.18),-.08,z,.3+random()*.3,.2,1.5+random()*.5);edge.rotation.y=(random()-.5)*.2;
    }
  }else box(sector===1?a.asphalt:a.wet,0,-.22,-8,12,.4,16);
  for(const side of [-1,1]){
    if(side===chasmSide)continue;
    box(a.concrete,side*5.15,.04,-8,1.6,.25,16);
    if(sector===1){
      box(a.concrete,side*8,-.2,-8,4.2,.4,16);
      // Continuous, staggered ruins behind the foreground frames fill their gaps.
      // Start below the road so the horizon stays solid through the camera angle.
      const backdropRandom=w.random(index*193+side*631+1457);
      for(let n=0;n<4;n++){
        const z=-2-n*4,height=4.2+backdropRandom()*2.5;
        box(a.distant,side*15.5,(height-4)/2,z,2.8,height+4,4.15);
        const remnant=box(a.concrete,side*14,height-.15,z+(backdropRandom()-.5)*2,.35,.5+backdropRandom(),1.4+backdropRandom());
        remnant.rotation.z=(backdropRandom()-.5)*.18;
      }
      for(let n=0;n<2;n++){
        const haze=new THREE.Sprite(a.dustMist);haze.position.set(side*13,1.5,-4-n*8);haze.scale.set(8,4,1);g.add(haze);
      }
      for(let n=0;n<3;n++){
        const h=2.5+random()*4,z=-2-n*5+(random()-.5)*2;
        const ruin=box(a.distant,side*(18+random()*4),h/2-.4,z,3+random()*3,h,2+random()*2);ruin.rotation.z=(random()-.5)*.1;
      }
      for(let n=0;n<2;n++){
        const z=-3-n*8+(random()-.5)*2, x=side*(9+random()*2), floors=2+Math.floor(random()*3);
        const width=3+random()*2, depth=3.5+random()*2;
        // Uneven remnants of floors, walls and columns leave the skyline open.
        for(let floor=0;floor<floors;floor++){
          const y=.35+floor*2.1;
          {
            const slab=box(a.concrete,x,y,z,width,.18+random()*.14,depth*(.55+random()*.45));
            slab.rotation.z=(random()-.5)*.13;
          }
          for(const dz of [-depth*.36,depth*.36])if(floor<floors-1&&random()>.2){
            const column=box(a.concrete,x-side*width*.38,y+1,z+dz,.24,1.8,.3);
            column.rotation.z=(random()-.5)*.12;
          }
          if(random()>.48){
            const wall=box(a.concrete,x+side*width*.35,y+.75,z+(random()-.5),.3,1.4,depth*(.3+random()*.35));
            wall.rotation.z=(random()-.5)*.16;
          }
        }
        // Fragments of street-facing masonry with empty, broken window openings.
        const facadeX=x-side*width*.44;
        for(let floor=0;floor<floors-1;floor++){
          const y=.55+floor*2.1;
          if(random()>.25){
            box(a.concrete,facadeX,y+.2,z,.25,.45,depth*.85);
            for(const dz of [-depth*.38,depth*.38])if(random()>.2)
              box(a.concrete,facadeX,y+1,z+dz,.25,1.7,.4);
            if(random()>.4){const lintel=box(a.concrete,facadeX,y+1.75,z,.25,.22,depth*.7);lintel.rotation.x=(random()-.5)*.12;}
          }
        }
        for(let k=0;k<3;k++){
          const rubble=box(a.concrete,x+(random()-.5)*width,.2+random()*.25,z+(random()-.5)*depth,.5+random(),.3+random()*.35,.5+random());
          rubble.rotation.set(random()*.3,random()*3,random()*.4);
        }
      }
      const z=-5-(index%2)*5;const car=buildCityCar(w,a,index,side,random);car.position.x=side*6.35;car.position.z=z;g.add(car);
      if(index%3===1){box(a.paint,side*12,1.4,-7,2.7,2.8,7);for(let n=0;n<5;n++)box(a.glass,side*10.62,1.8,-9.7+n*1.2,.02,1,.8);}
      for(let n=0;n<8;n++){
        const debris=box(a.concrete,side*(4.6+random()*2),.1+random()*.2,-random()*16,.25+random()*.6,.2+random()*.25,.4);debris.rotation.y=random()*3;
        leaf(side*(5.3+random()),.3+random()*.4,-random()*16,.25+random()*.25);
      }
      // Broken street furniture interrupts the repeated outlines of the ruins.
      const poleZ=-2-random()*12;
      const pole=box(w.dark,side*5.7,1.45,poleZ,.1,2.9,.1);pole.rotation.z=side*(.08+random()*.23);
      const lamp=box(a.rust,side*5.55,2.75,poleZ,.7,.1,.16);lamp.rotation.z=-side*.12;
      if(index%2===0){
        const barrier=box(a.concrete,side*5.85,.4,-11,1.1,.8,2.2);barrier.rotation.y=side*.25;
        const slab=box(a.concrete,side*6.1,.35,-13,1.7,.16,1.5);slab.rotation.z=side*.2;
      }
      for(let n=0;n<6;n++){const crack=box(w.dark,(random()-.5)*7,.008,-random()*16,.025,.013,1+random()*2);crack.rotation.y=random()*3;}
      // Decorative broken asphalt stays outside the three playable lanes.
      const pitZ=-3-random()*10,pitX=side*5.05;
      const pit=new THREE.Mesh(new THREE.CircleGeometry(1,9),w.dark);pit.rotation.x=-Math.PI/2;pit.position.set(pitX,.18,pitZ);pit.scale.set(.55,.95,1);g.add(pit);
      for(let k=0;k<7;k++){const angle=k*Math.PI*2/7;const chip=box(a.concrete,pitX+Math.cos(angle)*.57,.2,pitZ+Math.sin(angle)*.98,.28,.1,.38);chip.rotation.y=angle;}
      box(a.concrete,side*4.2,.015,-6,.07,.02,3);
    }else if(sector===2){
      buildIndustrialDistrict(w,g,a,index,side);
      const variant=(index+(side>0?1:0))%3;
      // Lower, staggered facilities remain visible from the elevated road.
      for(let n=0;n<2;n++){
        const z=-4-n*8,h=2.4+random()*2.2,x=side*(15+random()*4);
        box(a.distant,x,h/2,z,3+random()*2,h,5+random()*2);
        if((index+n)%2===0){const stack=cyl(a.rust,x+side*1.4,h+1,z,.32,2);stack.rotation.z=side*.04;const haze=new THREE.Sprite(a.dustMist);haze.position.set(x+side*1.4,h+2.4,z);haze.scale.set(3.5,3,1);g.add(haze);}
      }
      if(variant===0){
        for(let n=0;n<2;n++){const z=-3-n*8,h=2.6+random()*1.3;box(a.rust,side*9,h/2,z,4.3,h,5.3);for(let j=0;j<3;j++)box(a.glass,side*6.82,h*.65,z-1.4+j*1.4,.03,.65,.9);}
      }else if(variant===1){
        for(const z of [-4,-12]){cyl(a.rust,side*9,2.1,z,1.6,4.2);cyl(w.metal,side*9,4.25,z,1.68,.18);for(const x of [7.3,10.7])box(w.metal,side*x,2.1,z,.2,4.2,.2);}
      }else{
        for(const z of [-2,-7,-12]){box(w.metal,side*7,2,z,.3,4,.35);box(a.rust,side*8.7,3.8,z,3.7,.22,.4);}box(a.rust,side*9,1.1,-8,3.5,2.2,8);
      }
      for(let p=0;p<3;p++){const pipe=cyl(a.rust,side*(6.8+p*.48),3.7+p*.35,-8,.14,16);pipe.rotation.x=Math.PI/2;}
      for(const z of [-2,-10]){box(w.metal,side*5.8,2,z,.25,4,.3);box(a.rust,side*6.6,3.8,z,1.8,.2,2.4);}
      box(a.rust,side*6.1,.9,-6,1.7,.3,5);for(let n=0;n<8;n++)box(w.dark,side*6.1,1.08,-8.2+n*.6,1.5,.06,.18);
      if(index%2===0){steam(side*6,3.5,-4);box(w.amber,side*5.5,3,-4,.1,.25,.14);}
      for(let n=0;n<3;n++){
        const z=-2-n*5+(random()-.5),height=1.4+random()*1.7;
        cyl(a.rust,side*(6.8+random()),height/2,z,.4+random()*.35,height);
        const valve=new THREE.Mesh(new THREE.TorusGeometry(.3,.045,6,12),w.trim);valve.position.set(side*6.1,1.3,z);valve.rotation.y=Math.PI/2;g.add(valve);
        const brace=box(w.metal,side*7,2.4,z,2.7,.13,.18);brace.rotation.z=side*(random()-.5)*.35;
      }
      for(let n=0;n<5;n++){const debris=box(a.rust,side*(5.3+random()*2),.14,-random()*16,.3+random()*.8,.2,.4+random());debris.rotation.y=random()*3;}
    }else{
      buildContaminatedLandscape(w,g,a,index,side);
      box(w.amber,side*5.4,1.35,-5,.06,.55,.65);
    }
  }
  if(sector===1)for(const side of [-1,1])for(let n=0;n<2;n++){const haze=new THREE.Sprite(a.dustMist);haze.position.set(side*(14+n*5),1.6+n,-4-n*7);haze.scale.set(12,5,1);g.add(haze);}
  return g;
}
