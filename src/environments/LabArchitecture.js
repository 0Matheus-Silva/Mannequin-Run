import * as THREE from 'three';

// Shared assets + seeded layouts: richer modules with no per-frame mesh creation.
export function buildLaboratory(w,index){
  const group=new THREE.Group(),random=w.random(index*79+138);
  group.userData.animated=[];
  const box=(m,x,y,z,a,b,c)=>w.box(group,m,x,y,z,a,b,c);
  const round=(m,x,y,z,a,b,c)=>{const mesh=new THREE.Mesh(w.labCylinder,m);mesh.position.set(x,y,z);mesh.scale.set(a,b,c);mesh.castShadow=true;group.add(mesh);return mesh;};
  box(w.floor,0,-.22,-8,12,.4,16);
  for(let n=0;n<2;n++){const puddle=new THREE.Mesh(w.puddleGeometry,w.puddleMaterial);puddle.rotation.x=-Math.PI/2;puddle.position.set((random()-.5)*6,.014,-2-random()*12);puddle.scale.set(.4+random(),.5+random()*1.4,1);group.add(puddle);}
  for(let z=-1;z>-16;z-=2){box(w.dark,0,.001,z,8.7,.014,.035);}
  for(const x of [-1.35,1.35])box(w.screen,x,.012,-8,.025,.015,16);
  for(const side of [-1,1]){
    box(w.metal,side*4.95,.05,-8,1.1,.18,16);
    box(w.light,side*4.42,.16,-8,.025,.025,15.5);
    box(w.trim,side*5.45,.12,-8,.14,.15,16);
    for(let n=0;n<20;n++)box(w.dark,side*5,.155,-.4-n*.8,.65,.025,.12);
    for(const z of [-.5,-8.5]){
      box(w.dark,side*6.5,3.7,z,.65,7.4,.7);
      box(w.metal,side*6.14,3.5,z,.16,6.8,.9);
      box(w.trim,side*6,2,z,.12,2.6,.38);
      box(w.light,side*6.02,4.9,z,.03,1.5,.4);
      for(const y of [1,6])box(w.trim,side*6.5,y,z,.9,.22,1);
      const brace=box(w.metal,side*5.8,6.3,z,.32,2.2,.35);brace.rotation.z=side*.5;
    }
    // Recessed bays leave glimpses of a second service corridor and distant machines.
    box(w.wall,side*9.3,3,-8,.3,6,16);
    box(w.dark,side*7.7,.04,-8,3.2,.12,16);
    box(w.metal,side*8.9,1.1,-8,.5,.15,16);
    box(w.screen,side*9.12,3.6,-8,.02,1.4,12);
    box(w.metal,side*8,6.5,-8,4.6,.25,16);
    for(let p=0;p<3;p++){
      const pipe=round(w.metal,side*(5.4+p*.4),6.9+p*.25,-8,.1+p*.035,16,.1+p*.035);pipe.rotation.x=Math.PI/2;
      for(const z of [-3,-11])box(w.trim,side*(5.4+p*.4),6.9+p*.25,z,.32,.32,.12);
    }
    for(let bay=0;bay<2;bay++){
      const z=-4-bay*8;const variant=(index+bay+(side>0?1:0))%3;
      if(variant===0){
        box(w.dark,side*6.9,1.6,z,1.55,3.2,2.8);
        box(w.metal,side*6.04,1.65,z,.12,3.1,2.65);
        for(let n=0;n<5;n++){
          box(w.trim,side*5.96,.45+n*.5,z,.05,.06,2.3);
          box(w.screen,side*5.94,.7+n*.5,z,.03,.27,1.7);
          box(n===2?w.amber:w.light,side*5.9,.7+n*.5,z+.98,.035,.035,.07);
        }
        box(w.metal,side*6.9,3.3,z,1.8,.13,3);
      }else if(variant===1){
        box(w.metal,side*6.8,1.1,z,2.1,.22,3.6);
        for(const dz of [-1.3,1.3])box(w.dark,side*6.8,.5,z+dz,1.7,1,.18);
        box(w.trim,side*7.2,1.9,z,.16,1.4,.14);
        const screen=box(w.screen,side*6.9,2.4,z,.09,.9,1.25);screen.rotation.z=side*-.14;
        box(w.dark,side*6.1,1.27,z-.7,.6,.06,.7);
        for(let n=0;n<3;n++)round(w.trim,side*6.6,1.45,z-.9+n*.8,.1,.6,.1);
        box(w.amber,side*7.2,2.9,z,.25,.06,.18);
      }else{
        round(w.dark,side*6.8,.3,z,.85,.4,.85);
        round(w.glass,side*6.8,1.95,z,.73,2.9,.73);
        for(const y of [.45,3.45])round(w.trim,side*6.8,y,z,.86,.18,.86);
        for(const dz of [-.55,.55])box(w.metal,side*6.2,1.95,z+dz,.12,2.9,.12);
        box(w.light,side*6,1.9,z,.04,1.7,.09);
        round(w.dark,side*6.8,1.7,z,.3,1.6,.3);
        box(w.screen,side*5.93,1.4,z,.05,.45,.6);
      }
    }
    // Irregular service panels, broken covers and exposed warm wiring.
    const broken=box(w.metal,side*5.6,.35,-(3+random()*9),.8,.65,1.2);broken.rotation.z=side*.24;broken.rotation.y=random()*.4;
    box(w.amber,side*6.3,4.7,-4,.035,.03,1.6);
    for(let n=0;n<4;n++)box(w.metal,side*(10.5+n*.7),3.5+n*.7,-10,1,7+n,2);
    box(w.light,side*10,5.1,-8,.03,.1,14);
    if(index%2===0){
      const vapor=new THREE.Sprite(w.hazeMaterial);vapor.position.set(side*5.8,1.4,-6);vapor.scale.set(2.7,1.5,1);vapor.userData.steam=true;group.add(vapor);group.userData.animated.push(vapor);
    }
  }
  box(w.metal,0,7.25,-.5,13.6,.45,.8);box(w.dark,0,7.55,-8,4,.25,16);
  for(const x of [-2.4,2.4]){box(w.trim,x,7,-8,.3,.16,16);box(w.light,x,6.9,-6,.8,.04,3.3);}
  for(const z of [-3,-11]){
    const cable=new THREE.Mesh(w.cableGeometry,w.dark);cable.position.set(0,7,z);group.add(cable);
  }
  // Hanging overhead display and damaged structural cover vary across modules.
  if(index%3!==1){box(w.dark,0,6.2,-14,3.1,.8,.25);box(w.screen,0,6.22,-13.86,2.7,.48,.035);box(w.amber,1.4,6.2,-13.82,.04,.35,.035);}
  if(index%4===2){const panel=box(w.metal,-3.8,6.4,-7,1.1,.08,3);panel.rotation.z=-.25;}
  return group;
}
