import * as THREE from 'three';
import { getPatina } from '../graphics/Patina.js';
import { buildCityCar } from '../environments/CityCar.js';

export function entranceState(remaining){return THREE.MathUtils.smoothstep(45-remaining,0,30);}

// Architecture reconstructed from the supplied photograph, rather than a photo plane.
export function buildCampus(f){
  const g=f.campus=new THREE.Group();f.root.add(g);const foliage=new THREE.SphereGeometry(1,10,6);
  const mat=(color,roughness=.8,metalness=.05)=>new THREE.MeshStandardMaterial({color,roughness,metalness});
  const stucco=mat(0xd4d2c6),concrete=mat(0x89877e),asphalt=mat(0x414549,.96),grass=mat(0x344735),soil=mat(0x4f493d),glass=mat(0x24444a,.24,.55),frame=mat(0x999e98,.45,.6),blue=mat(0x215b82),green=mat(0x43814a),lightGreen=mat(0x8da569);
  stucco.bumpMap=getPatina().asphalt;stucco.bumpScale=.018;asphalt.map=getPatina().asphalt;
  const box=(m,x,y,z,w,h,d)=>f.box(g,m,x,y,z,w,h,d);
  const terrain=mat(0x60625a,.98);terrain.map=getPatina().asphalt.clone();terrain.map.repeat.set(90,90);terrain.map.needsUpdate=true;
  box(terrain,0,-.33,-65,500,.4,600);
  // Street and sidewalks end at the foyer threshold (-102.5), never under it.
  f.groundSurfaces={road:box(asphalt,0,-.195,36.25,14,.4,277.5)};
  for(const side of [-1,1]){box(concrete,side*8.5,-.12,-10.25,3,.22,184.5);box(stucco,side*7.05,.03,-10.25,.18,.18,184.5);}
  for(let z=32;z>-91;z-=13)box(stucco,-5.5,.001,z,.08,.012,5);
  for(let x=-5;x<=5;x+=1.4)box(stucco,x,.002,-91,.7,.015,3.6);
  // Raised pedestrian forecourt and recessed glazed teaching wing.
  box(concrete,-19,.12,-107,30,.3,15);box(concrete,-19,.015,-98,30,.08,2.2);
  box(stucco,-20,3.7,-111,31,7.4,5);
  box(glass,-20,2.25,-108.36,29,3.6,.12);
  for(let x=-34;x<-5;x+=1.4){box(frame,x,2.25,-108.22,.07,3.8,.18);box(frame,x,3.3,-108.15,1.3,.045,.09);}
  box(blue,-20,5.2,-108.15,29,1.9,.15);
  // Angular green/blue facade graphics from the photo, made as polygon geometry.
  for(let i=0;i<11;i++){
    const s=new THREE.Shape();s.moveTo(0,0);s.lineTo(2.6,.1);s.lineTo(3.5,1.5);s.lineTo(1.2,1.9);s.closePath();
    const panel=new THREE.Mesh(new THREE.ShapeGeometry(s),i%3===0?lightGreen:green);panel.position.set(-33+i*2.55,4.25,-108.02);g.add(panel);
    box(frame,-33+i*2.7,5.2,-107.9,.09,2.1,.25);
  }
  const arch=(left,right,height,beam,depth,z)=>{
    const s=new THREE.Shape(),radius=2;
    s.moveTo(left,0);s.lineTo(left,height-.7);s.quadraticCurveTo(left,height,left+.7,height);s.lineTo(right-radius,height);s.quadraticCurveTo(right,height,right,height-radius);s.lineTo(right,0);s.lineTo(right-beam,0);s.lineTo(right-beam,height-radius);s.quadraticCurveTo(right-beam,height-beam,right-radius,height-beam);s.lineTo(left+beam,height-beam);s.lineTo(left+beam,0);s.closePath();
    const mesh=new THREE.Mesh(new THREE.ExtrudeGeometry(s,{depth,bevelEnabled:true,bevelSize:.09,bevelThickness:.09,bevelSegments:3,steps:1,curveSegments:20}),stucco);mesh.position.z=z;mesh.castShadow=true;mesh.receiveShadow=true;g.add(mesh);return mesh;
  };
  arch(-36,-3.9,7.6,1,1.7,-106.8);
  // Taller curved portal adjoining the photographed vertical building; center stays passable.
  arch(-4.9,9,10.1,.85,2,-107);
  f.text(g,'UniFECAF',-27,5.15,-104.95,11.5,1.35);
  // Open square brand emblem in relief, with no invented wording.
  for(const y of [4.7,5.6])box(frame,-34.1,y,-104.9,1.2,.13,.06);
  for(const x of [-34.65,-33.55])box(frame,x,5.15,-104.9,.13,1,.06);
  box(stucco,14.5,17,-119,11,34,12);
  for(let row=0;row<12;row++)for(let col=0;col<5;col++){
    const x=10.2+col*2.1,y=1.8+row*2.65;
    box(glass,x,y,-112.92,1.05,1.55,.12);box(concrete,x,y+.95,-112.65,1.55,.22,.6);box(frame,x-.72,y,-112.55,.12,2.1,.85);
  }
  box(blue,13,5,-111.9,9,1.5,.18);
  // Low planters, individual foliage and palms replace bright rectangular lawn strips.
  for(const side of [-1,1])for(let n=0;n<5;n++){
    const x=side*(10+n%2*2),z=-35-n*14;
    box(concrete,x,.19,z,2.5,.4,4);box(soil,x,.4,z,2.3,.03,3.8);
    for(let j=0;j<5;j++){const plant=new THREE.Mesh(foliage,grass);plant.position.set(x+(j%2-.5)*.8,.66,z-1.3+j*.6);plant.scale.set(.75,.35,.7);g.add(plant);}
  }
  for(const [x,z] of [[-32,-101],[-15,-103],[9,-100],[17,-104],[22,-109]])f.palm(g,x,z);
  for(let n=0;n<10;n++){const shrub=new THREE.Mesh(foliage,grass);shrub.position.set(8+n*1.5,.6,-105);shrub.scale.set(1,.6,1.5);g.add(shrub);}
  // Parked vehicles and street furniture anchor the entrance in an urban street.
  for(const [x,z] of [[-13,-45],[14,-79]]){
    box(f.dark,x,.65,z,2.2,.9,4.4);box(glass,x,1.25,z-.2,1.9,.8,2.5);
    for(const dx of [-1.05,1.05])for(const dz of [-1.3,1.3]){const tire=f.round(g,f.dark,x+dx,.35,z+dz,.38,.2);tire.rotation.z=Math.PI/2;}
  }
  // Low surrounding blocks and parking lots give the approach a grounded urban horizon.
  for(const side of [-1,1])for(let n=0;n<6;n++){
    const x=side*(36+n%2*12),z=-20-n*25,h=3.5+n%3*1.4;
    box(concrete,x,h/2,z,10,h,13);box(stucco,x,h+.1,z,10.5,.2,13.5);
    for(let j=0;j<4;j++)box(glass,x+(j-1.5)*1.9,1.9,z+6.55,1.3,1.5,.08);
    box(asphalt,side*24,-.08,z,10,.08,18);
    for(let j=0;j<5;j++)box(stucco,side*24+j*.9,.001,z, .05,.015,4);
  }
  // Background towers frame the campus while leaving the entrance visible.
  for(const side of [-1,1])for(let n=0;n<4;n++){
    const x=side*(42+n*14),z=-130-(n%2)*26,h=21+n%3*8;
    box(n%2?concrete:stucco,x,h/2,z,10,h,10);
    for(let row=0;row<Math.floor(h/3);row++)for(let col=0;col<3;col++)box(glass,x+(col-1)*2.5,2+row*2.7,z+5.05,1.4,1.45,.08);
    box(frame,x,h+.1,z,10.3,.2,10.3);
  }
  const carMaterials={carAsh:mat(0x777a76,.7,.3),carLight:mat(0xbbb9af,.7,.25),carCharcoal:mat(0x343b3e,.7,.3),carRed:mat(0x963e36,.65,.25),carBlue:mat(0x596f78,.65,.3),carRust:mat(0x735c4a),tire:mat(0x1d2221),hub:mat(0x929b9a,.4,.6),carGlass:mat(0x284149,.25,.45),lamp:mat(0xd7d0b5),tail:mat(0x8a3430)};
  carMaterials.carGlass.side=THREE.DoubleSide;
  for(const side of [-1,1])for(let n=0;n<4;n++){
    const car=buildCityCar(f,carMaterials,n+(side>0?2:0),side,()=>.5);car.position.set(side*11,.05,17-n*20);g.add(car);
  }
  for(const side of [-1,1])for(let z=-25;z>-100;z-=25){f.round(g,frame,side*8,2.6,z,.055,5.2);box(stucco,side*7.7,5.2,z,.8,.13,.4);}
  // Sliding glass doors are attached to the entrance frame, not to a detached gate.
  f.entryDoors=[-1,1].map(side=>{
    const door=new THREE.Group();g.add(door);door.position.set(side*1.95,0,-106.1);
    f.box(door,glass,0,2.65,0,3.9,5.3,.12);
    for(const x of [-1.93,1.93])f.box(door,frame,x,2.65,.1,.075,5.3,.12);
    for(const y of [.1,5.2])f.box(door,frame,0,y,.1,3.9,.1,.12);
    f.box(door,frame,-side*.25,2.3,.16,.04,.65,.06);return door;
  });
  box(frame,0,5.45,-106,8,.24,.35);box(f.blue,0,5.65,-106,1,.08,.2);
  // The photographed portal is wider and taller than the moving leaves.
  // Fixed glazing closes the right-hand gap; doors slide in front, not coplanar.
  f.entryInfill=new THREE.Group();g.add(f.entryInfill);
  f.entrySidePanel=f.box(f.entryInfill,glass,6.025,2.65,-106.4,4.25,5.3,.12);
  f.box(f.entryInfill,glass,-3.975,2.65,-106.4,.15,5.3,.12);
  f.box(f.entryInfill,glass,2.05,7.275,-106.4,12.2,3.95,.12);
  for(const x of [-4.05,3.9,8.15])f.box(f.entryInfill,frame,x,2.65,-106.28,.075,5.3,.12);
  f.box(f.entryInfill,frame,2.05,5.32,-106.28,12.2,.08,.12);
  f.hall=new THREE.Group();f.root.add(f.hall);
  f.groundSurfaces.hall=f.box(f.hall,concrete,0,-.2,-135,15,.4,65);
  for(const x of [-7.5,7.5]){
    f.box(f.hall,stucco,x,3.5,-135,.3,7,65);
    for(let z=-111;z>-165;z-=8){
      f.box(f.hall,frame,x*.98,1.1,z,.08,.08,5);f.box(f.hall,f.blue,x*.98,3,z,.04,.3,4);
      f.box(f.hall,concrete,x*.96,3.3,z,.15,6.6,.3);f.box(f.hall,glass,x*.97,3.1,z-2,.04,2.5,2.7);
      f.box(f.hall,frame,x*.95,3.1,z-2,.08,.07,2.7);
    }
  }
  f.box(f.hall,stucco,0,7,-135,15,.25,65);
  for(let z=-110;z>-166;z-=10)f.box(f.hall,f.white,0,6.8,z,3,.05,.6);
  for(const x of [-4.5,4.5])f.box(f.hall,frame,x,.012,-135,.06,.025,64);
  for(let z=-105;z>-166;z-=5)f.box(f.hall,frame,0,.013,z,14.5,.02,.035);
  f.text(f.hall,'EXPOTECH 2026',0,5,-160,7,1.2);
}
