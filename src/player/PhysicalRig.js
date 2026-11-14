import * as THREE from 'three';
import { batchMeshes } from '../utils/batchMeshes.js';

export function buildPhysicalRig(rig){
  const cloth=document.createElement('canvas');cloth.width=cloth.height=128;const ctx=cloth.getContext('2d');ctx.fillStyle='#777c82';ctx.fillRect(0,0,128,128);
  for(let n=0;n<128;n+=3){ctx.strokeStyle=n%2?'#72767a':'#82868b';ctx.beginPath();ctx.moveTo(0,n);ctx.lineTo(128,n+2);ctx.stroke();}
  const fabric=new THREE.CanvasTexture(cloth);fabric.wrapS=fabric.wrapT=THREE.RepeatWrapping;fabric.repeat.set(3,3);
  rig.metal=new THREE.MeshStandardMaterial({color:0xe9e5dd,roughness:.62,metalness:.02});
  rig.headPaint=rig.metal;
  rig.graphite=new THREE.MeshStandardMaterial({color:0x12171d,roughness:.88,metalness:0,bumpMap:fabric,bumpScale:.009});
  rig.dark=new THREE.MeshStandardMaterial({color:0x080c11,roughness:.57,metalness:.08});
  rig.chrome=new THREE.MeshStandardMaterial({color:0x737d80,metalness:.7,roughness:.4});
  rig.glow=new THREE.MeshStandardMaterial({color:0x46e6f5,emissive:0x23b4df,emissiveIntensity:1.2,roughness:.3});
  rig.visor=new THREE.MeshStandardMaterial({color:0x050a10,metalness:.4,roughness:.23});
  rig.boxGeo=new THREE.BoxGeometry(1,1,1);const sphere=new THREE.SphereGeometry(1,16,12),smallSphere=new THREE.SphereGeometry(1,10,8),sleeve=new THREE.CylinderGeometry(1,.86,1,16,1);
  const box=(p,m,x,y,z,w,h,d)=>{const mesh=new THREE.Mesh(rig.boxGeo,m);mesh.position.set(x,y,z);mesh.scale.set(w,h,d);mesh.castShadow=true;mesh.receiveShadow=true;p.add(mesh);return mesh;};
  const oval=(p,m,x,y,z,w,h,d)=>{const mesh=new THREE.Mesh(w<.08&&h<.12?smallSphere:sphere,m);mesh.position.set(x,y,z);mesh.scale.set(w,h,d);mesh.castShadow=true;mesh.receiveShadow=true;p.add(mesh);return mesh;};
  const tube=(p,m,points,r=.009)=>{const curve=new THREE.CatmullRomCurve3(points.map(v=>new THREE.Vector3(...v)));const mesh=new THREE.Mesh(new THREE.TubeGeometry(curve,24,r,5,false),m);p.add(mesh);return mesh;};
  const group=(parent,x,y,z)=>{const g=new THREE.Group();g.position.set(x,y,z);parent.add(g);return g;};
  const dressed=(p,x,y,z,w,h,d)=>{const mesh=new THREE.Mesh(sleeve,rig.graphite);mesh.position.set(x,y,z);mesh.scale.set(w,h,d);mesh.castShadow=true;mesh.receiveShadow=true;p.add(mesh);return mesh;};
  rig.root.userData.design='physical-mannequin';
  rig.pelvis=group(rig.body,0,1.13,0);oval(rig.pelvis,rig.graphite,0,-.1,0,.29,.15,.18);
  box(rig.pelvis,rig.dark,0,-.025,-.16,.48,.07,.05);box(rig.pelvis,rig.chrome,0,-.025,-.193,.065,.055,.015);
  box(rig.body,rig.metal,0,1.185,-.1,.4,.12,.2);
  rig.torso=group(rig.body,0,1.48,0);
  oval(rig.torso,rig.metal,0,.12,0,.325,.45,.18);
  // Unzipped jacket hangs around an actual open PC enclosure, exposing white collar/abdomen.
  const seams=new THREE.MeshStandardMaterial({color:0x3b424a,roughness:.9});
  for(const side of [-1,1]){
    const panel=new THREE.Shape();panel.moveTo(side*.18,.45);panel.lineTo(side*.36,.43);panel.quadraticCurveTo(side*.46,.35,side*.43,.12);panel.lineTo(side*.39,-.56);panel.lineTo(side*.21,-.55);panel.lineTo(side*.18,.12);panel.closePath();
    const coat=new THREE.Mesh(new THREE.ExtrudeGeometry(panel,{depth:.25,bevelEnabled:true,bevelSize:.035,bevelThickness:.025,bevelSegments:3,curveSegments:12}),rig.graphite);coat.position.z=-.15;coat.castShadow=true;rig.torso.add(coat);
    const lapel=box(rig.torso,rig.graphite,side*.285,.19,-.205,.14,.64,.055);lapel.rotation.z=side*-.1;
    box(rig.torso,seams,side*.225,-.03,-.242,.018,.65,.016);
    for(let n=0;n<18;n++)box(rig.torso,rig.chrome,side*.225,-.32+n*.033,-.254,.012,.012,.008);
    tube(rig.torso,seams,[[side*.35,-.32,-.19],[side*.38,-.14,-.2],[side*.36,-.05,-.21]],.005);
    tube(rig.torso,rig.dark,[[side*.2,.48,-.13],[side*.23,.28,-.25],[side*.23,.12,-.25]],.009);
  }
  box(rig.torso,rig.graphite,0,.1,.16,.47,.69,.1);
  box(rig.torso,rig.graphite,0,-.04,.155,.62,.96,.09);
  rig.hardware=group(rig.torso,0,.055,-.17);rig.hardware.userData.kind='open-computer';
  const board=new THREE.MeshStandardMaterial({color:0x183e39,roughness:.68,metalness:.3});
  const gold=new THREE.MeshStandardMaterial({color:0xb69a54,metalness:.55,roughness:.5});
  box(rig.hardware,rig.dark,0,-.02,0,.43,.57,.18);box(rig.hardware,board,0,.015,-.103,.37,.47,.018);
  for(const x of [-.205,.205])box(rig.hardware,rig.chrome,x,-.02,-.12,.018,.58,.025);
  for(const y of [-.3,.26])box(rig.hardware,rig.chrome,0,y,-.12,.43,.018,.025);
  for(let n=0;n<3;n++){box(rig.hardware,rig.dark,.115-n*.05,.12,-.125,.028,.21,.04);box(rig.hardware,gold,.115-n*.05,.23,-.15,.024,.015,.015);}
  const fan=group(rig.hardware,-.065,.105,-.15);
  const ring=new THREE.Mesh(new THREE.TorusGeometry(.092,.012,6,24),rig.chrome);fan.add(ring);
  for(let n=0;n<7;n++){const blade=oval(fan,rig.dark,0,0,0,.025,.08,.009);blade.position.set(Math.sin(n*6.28/7)*.035,Math.cos(n*6.28/7)*.035,0);blade.rotation.z=-n*6.28/7+.5;}
  oval(fan,rig.chrome,0,0,-.012,.023,.023,.012);
  box(rig.hardware,rig.dark,0,-.145,-.16,.37,.1,.09);
  for(let n=0;n<13;n++)box(rig.hardware,rig.chrome,-.16+n*.026,-.145,-.21,.009,.075,.018);
  box(rig.hardware,rig.dark,0,-.25,-.125,.32,.055,.07);
  for(let n=0;n<3;n++)tube(rig.hardware,gold,[[.14,.17,-.15],[.18,.02,-.19],[.14,-.1,-.22],[.05,-.1,-.22]],.004+n*.001);
  // Rear service opening keeps real components legible in the running view too.
  const rear=group(rig.torso,0,.11,.22);box(rear,rig.dark,0,0,0,.31,.4,.035);box(rear,board,0,0,.023,.27,.35,.02);
  for(let n=0;n<6;n++)box(rear,rig.chrome,0,-.13+n*.052,.04,.23,.014,.018);
  for(const side of [-1,1])box(rear,rig.graphite,side*.2,0,0,.07,.55,.07);
  rig.neck=group(rig.body,0,2.06,0);oval(rig.neck,rig.metal,0,-.015,0,.12,.18,.115);
  rig.head=group(rig.neck,0,.2,0);rig.hood=group(rig.head,0,0,0);
  const hood=new THREE.Mesh(new THREE.SphereGeometry(1,28,18,0,Math.PI),rig.graphite);hood.scale.set(.32,.345,.3);hood.position.set(0,.02,.005);rig.hood.add(hood);
  tube(rig.hood,rig.graphite,[[-.22,-.24,-.17],[-.29,.02,-.13],[-.22,.26,-.12],[0,.34,-.1],[.22,.26,-.12],[.29,.02,-.13],[.22,-.24,-.17]],.018);
  for(const side of [-1,1])oval(rig.hood,rig.graphite,side*.26,-.08,.025,.075,.25,.19);
  rig.mask=group(rig.head,0,0,-.16);rig.mask.userData.kind='cyan-segmented-mask';oval(rig.mask,rig.visor,0,0,0,.225,.275,.09);
  const face=(points)=>tube(rig.mask,rig.glow,points.map(([x,y])=>[-x,y,-.087-Math.max(0,1-Math.abs(x)/.25)*.008]),.0045);
  face([[-.18,.09],[-.18,.18],[-.12,.22],[-.04,.20],[0,.15],[.01,.1]]);
  face([[-.18,.055],[-.15,.005],[-.095,-.01]]);
  face([[.04,.13],[.05,.22],[.10,.27]]);
  face([[.06,.095],[.13,.065],[.18,.04]]);
  face([[.18,.01],[.16,-.06],[.17,-.12],[.20,-.15]]);
  face([[-.18,-.08],[-.14,-.1],[-.115,-.18],[-.11,-.24]]);
  const respirator=new THREE.Mesh(new THREE.TorusGeometry(.06,.0045,6,28),rig.glow);respirator.position.set(-.015,-.075,-.105);respirator.scale.y=1.23;rig.mask.add(respirator);
  for(let n=0;n<5;n++)box(rig.mask,seams,-.055+n*.02,-.075,-.106,.006,.075,.006);
  rig.arms=[-1,1].map(side=>{
    const pivot=group(rig.body,side*.49,1.91,0);oval(pivot,rig.graphite,0,-.025,0,.145,.135,.16);dressed(pivot,0,-.2,0,.135,.48,.15);
    const joint=group(pivot,0,-.43,0);dressed(joint,0,-.17,0,.115,.43,.13);box(joint,rig.dark,0,-.35,0,.18,.08,.19);
    for(let n=0;n<3;n++){const fold=box(joint,seams,side*.06,-.1-n*.065,-.105,.08,.015,.014);fold.rotation.z=side*.18;}
    const hand=group(joint,0,-.42,0);oval(hand,rig.metal,0,-.04,0,.07,.1,.045);
    const fingers=Array.from({length:4},(_,n)=>oval(hand,rig.metal,(n-1.5)*.032,-.145,-.005,.014,.065,.02));
    const thumb=oval(hand,rig.metal,side*.075,-.065,-.015,.024,.06,.025);thumb.rotation.z=side*.4;
    return {pivot,joint,hand,fingers};
  });
  rig.legs=[-1,1].map(side=>{
    const pivot=group(rig.body,side*.175,1.09,0);dressed(pivot,0,-.23,0,.14,.55,.16);
    const joint=group(pivot,0,-.48,0);dressed(joint,0,-.24,0,.115,.53,.14);
    box(joint,rig.dark,0,-.41,0,.18,.08,.21);
    tube(pivot,seams,[[side*.12,-.02,.02],[side*.125,-.2,.04],[side*.1,-.39,.03]],.004);
    const foot=group(joint,0,-.47,0);oval(foot,rig.graphite,0,0,-.07,.115,.065,.23);box(foot,rig.dark,0,-.045,-.07,.21,.035,.38);
    return {pivot,joint,foot};
  });
  for(const part of [rig.torso,rig.pelvis,rig.head,rig.neck,rig.hardware,rear,...rig.arms.flatMap(a=>[a.pivot,a.joint]),...rig.legs.flatMap(l=>[l.pivot,l.joint,l.foot])])batchMeshes(part);
}
