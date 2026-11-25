import * as THREE from 'three';
import { batchMeshes } from '../utils/batchMeshes.js';

export function buildPhysicalRig(rig){
  const cloth=document.createElement('canvas');cloth.width=cloth.height=128;const ctx=cloth.getContext('2d');ctx.fillStyle='#777c82';ctx.fillRect(0,0,128,128);
  for(let n=0;n<128;n+=3){ctx.strokeStyle=n%2?'#72767a':'#82868b';ctx.beginPath();ctx.moveTo(0,n);ctx.lineTo(128,n+2);ctx.stroke();}
  const fabric=new THREE.CanvasTexture(cloth);fabric.wrapS=fabric.wrapT=THREE.RepeatWrapping;fabric.repeat.set(3,3);
  rig.metal=new THREE.MeshStandardMaterial({color:0xe6d9ad,roughness:.62,metalness:.02});
  rig.headPaint=rig.metal;
  rig.graphite=new THREE.MeshStandardMaterial({color:0x12171d,roughness:.88,metalness:0,bumpMap:fabric,bumpScale:.009});
  rig.dark=new THREE.MeshStandardMaterial({color:0x080c11,roughness:.57,metalness:.08});
  rig.chrome=new THREE.MeshStandardMaterial({color:0x737d80,metalness:.7,roughness:.4});
  rig.glow=new THREE.MeshStandardMaterial({color:0x46e6f5,emissive:0x23b4df,emissiveIntensity:1.2,roughness:.3});
  rig.greenGlow=new THREE.MeshStandardMaterial({color:0x48ff39,emissive:0x16ef18,emissiveIntensity:1.5,roughness:.32});
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
  rig.hardware=group(rig.torso,0,.055,-.17);rig.hardware.userData.kind='open-computer';rig.hardware.scale.set(1.15,1.02,1);
  const board=new THREE.MeshStandardMaterial({color:0x102c1a,emissive:0x06400c,emissiveIntensity:.22,roughness:.68,metalness:.3});
  const innerMetal=new THREE.MeshStandardMaterial({color:0x263138,metalness:.65,roughness:.48});
  const gold=new THREE.MeshStandardMaterial({color:0xb69a54,metalness:.55,roughness:.5});
  // Recessed motherboard and deep side walls separate the enclosure from its raised components.
  box(rig.hardware,rig.dark,0,-.02,.035,.43,.57,.11);box(rig.hardware,board,0,.015,-.032,.37,.47,.018);
  for(const x of [-.205,.205]){
    box(rig.hardware,innerMetal,x,-.02,-.115,.022,.58,.21);
    box(rig.hardware,rig.chrome,x,-.02,-.224,.018,.58,.012);
  }
  for(const y of [-.3,.26]){
    box(rig.hardware,innerMetal,0,y,-.115,.43,.02,.21);
    box(rig.hardware,rig.chrome,0,y,-.224,.43,.012,.012);
  }
  for(const x of [-.18,.18])for(const y of [-.275,.235])oval(rig.hardware,rig.chrome,x,y,-.235,.009,.009,.004);
  for(let n=0;n<5;n++)box(rig.hardware,gold,-.145+n*.025,-.035,-.045,.007,.12,.003);
  for(let n=0;n<3;n++){box(rig.hardware,rig.dark,.115-n*.05,.12,-.125,.028,.21,.04);box(rig.hardware,gold,.115-n*.05,.23,-.15,.024,.015,.015);}
  box(rig.hardware,innerMetal,-.065,.105,-.091,.205,.205,.09);
  for(let n=0;n<9;n++)box(rig.hardware,rig.chrome,-.151+n*.021,.105,-.141,.007,.18,.025);
  const fan=group(rig.hardware,-.065,.105,-.19);
  const fanWell=new THREE.Mesh(new THREE.CylinderGeometry(.089,.089,.035,24),rig.dark);fanWell.rotation.x=Math.PI/2;fanWell.position.z=.019;fan.add(fanWell);
  const ring=new THREE.Mesh(new THREE.TorusGeometry(.092,.012,6,24),rig.greenGlow);fan.add(ring);
  for(let n=0;n<7;n++){const blade=oval(fan,innerMetal,0,0,0,.025,.08,.009);blade.position.set(Math.sin(n*6.28/7)*.035,Math.cos(n*6.28/7)*.035,0);blade.rotation.z=-n*6.28/7+.5;}
  oval(fan,rig.greenGlow,0,0,-.012,.023,.023,.012);
  box(rig.hardware,rig.dark,0,-.145,-.16,.37,.1,.09);
  for(let n=0;n<13;n++)box(rig.hardware,rig.chrome,-.16+n*.026,-.145,-.21,.009,.075,.018);
  box(rig.hardware,rig.dark,0,-.25,-.125,.32,.055,.07);
  for(let n=0;n<3;n++)tube(rig.hardware,gold,[[.14,.17,-.15],[.18,.02,-.19],[.14,-.1,-.22],[.05,-.1,-.22]],.004+n*.001);
  for(const y of [-.265,-.195])box(rig.hardware,rig.greenGlow,0,y,-.218,.35,.009,.008);
  for(let n=0;n<8;n++)box(rig.hardware,rig.greenGlow,.17,.2-n*.045,-.13,.016,.018,.008);
  // Rear service opening keeps real components legible in the running view too.
  const rear=group(rig.torso,0,.11,.22);box(rear,rig.dark,0,0,0,.31,.4,.035);box(rear,board,0,0,.023,.27,.35,.02);
  for(let n=0;n<6;n++)box(rear,n%2?rig.greenGlow:rig.chrome,0,-.13+n*.052,.04,.23,.014,.018);
  for(const side of [-1,1])box(rear,rig.graphite,side*.2,0,0,.07,.55,.07);
  rig.neck=group(rig.body,0,2.06,0);oval(rig.neck,rig.metal,0,-.015,0,.12,.18,.115);
  rig.head=group(rig.neck,0,.2,0);rig.hood=group(rig.head,0,0,0);
  const hood=new THREE.Mesh(new THREE.SphereGeometry(1,28,18,0,Math.PI),rig.graphite);hood.scale.set(.32,.345,.3);hood.position.set(0,.02,.005);rig.hood.add(hood);
  // Layered fabric at the back and neck gives the hood a draped silhouette.
  const hoodBack=oval(rig.hood,rig.graphite,0,-.18,.13,.295,.23,.19);hoodBack.rotation.x=-.25;
  const hoodDrape=oval(rig.hood,rig.graphite,0,-.32,.09,.26,.16,.2);hoodDrape.rotation.x=-.35;
  for(const side of [-1,1]){
    tube(rig.hood,seams,[[side*.07,.27,.19],[side*.12,.08,.29],[side*.17,-.12,.27],[side*.2,-.28,.17]],.006);
    tube(rig.hood,rig.dark,[[side*.23,.04,.19],[side*.27,-.1,.16],[side*.24,-.24,.1]],.008);
    tube(rig.hood,seams,[[side*.03,-.17,.31],[side*.1,-.28,.26],[side*.19,-.37,.14]],.005);
  }
  tube(rig.hood,rig.graphite,[[-.22,-.24,-.17],[-.29,.02,-.13],[-.22,.26,-.12],[0,.34,-.1],[.22,.26,-.12],[.29,.02,-.13],[.22,-.24,-.17]],.018);
  for(const side of [-1,1])oval(rig.hood,rig.graphite,side*.26,-.08,.025,.075,.25,.19);
  rig.mask=group(rig.head,0,0,-.16);rig.mask.userData.kind='cyan-segmented-mask';oval(rig.mask,rig.visor,0,0,0,.225,.275,.09);
  const face=(points)=>tube(rig.mask,rig.glow,points.map(([x,y])=>[-x,y,-.087-Math.max(0,1-Math.abs(x)/.25)*.008]),.0045);
  for(const side of [-1,1]){
    oval(rig.mask,rig.visor,side*.105,.105,-.07,.105,.085,.04);
    face([[side*.02,.15],[side*.1,.2],[side*.2,.2],[side*.19,.1],[side*.13,.035],[side*.045,.055],[side*.02,.15]]);
    oval(rig.mask,rig.dark,side*.205,-.12,-.025,.08,.105,.075);
    const filter=new THREE.Mesh(new THREE.TorusGeometry(.071,.005,6,24),rig.glow);filter.position.set(side*.205,-.12,-.085);filter.scale.y=1.25;rig.mask.add(filter);
    for(let n=0;n<3;n++)box(rig.mask,seams,side*.205,-.16+n*.035,-.1,.08,.006,.008);
  }
  oval(rig.mask,rig.dark,0,-.105,-.09,.085,.08,.06);
  tube(rig.mask,seams,[[-.15,-.01,-.085],[-.12,-.09,-.13],[0,-.19,-.14],[.12,-.09,-.13],[.15,-.01,-.085]],.006);
  const respirator=new THREE.Mesh(new THREE.TorusGeometry(.061,.005,6,28),rig.glow);respirator.position.set(0,-.105,-.147);rig.mask.add(respirator);
  for(let n=0;n<5;n++)for(let j=0;j<3;j++)oval(rig.mask,seams,(n-2)*.018,-.105+(j-1)*.022,-.151,.005,.005,.003);
  rig.arms=[-1,1].map(side=>{
    const pivot=group(rig.body,side*.49,1.91,0);oval(pivot,rig.graphite,0,-.025,0,.145,.135,.16);dressed(pivot,0,-.2,0,.135,.48,.15);
    const joint=group(pivot,0,-.43,0);dressed(joint,0,-.17,0,.115,.43,.13);box(joint,rig.dark,0,-.35,0,.18,.08,.19);
    for(let n=0;n<3;n++){const fold=box(joint,seams,side*.06,-.1-n*.065,-.105,.08,.015,.014);fold.rotation.z=side*.18;}
    const hand=group(joint,0,-.42,0);oval(hand,rig.dark,0,-.04,0,.07,.1,.045);
    const fingers=Array.from({length:4},(_,n)=>oval(hand,rig.dark,(n-1.5)*.032,-.145,-.005,.014,.065,.02));
    const thumb=oval(hand,rig.dark,side*.075,-.065,-.015,.024,.06,.025);thumb.rotation.z=side*.4;
    return {pivot,joint,hand,fingers};
  });
  rig.legs=[-1,1].map(side=>{
    const pivot=group(rig.body,side*.175,1.09,0);dressed(pivot,0,-.23,0,.14,.55,.16);
    const joint=group(pivot,0,-.48,0);dressed(joint,0,-.24,0,.115,.53,.14);
    box(joint,rig.dark,0,-.41,0,.18,.08,.21);
    tube(pivot,seams,[[side*.12,-.02,.02],[side*.125,-.2,.04],[side*.1,-.39,.03]],.004);
    const foot=group(joint,0,-.47,0);oval(foot,rig.graphite,0,0,-.07,.115,.065,.23);box(foot,rig.dark,0,-.045,-.07,.21,.035,.38);
    oval(joint,rig.graphite,0,-.025,-.09,.12,.13,.09);
    for(let n=0;n<3;n++)box(foot,rig.chrome,0,.05,-.1-n*.035,.105,.008,.012);
    box(foot,rig.chrome,0,-.03,-.265,.16,.018,.015);
    return {pivot,joint,foot};
  });
  // Prebuilt compact roll: no lights, particles or geometry allocations during play.
  rig.rollBall=group(rig.root,0,.48,0);rig.rollBall.visible=false;
  oval(rig.rollBall,rig.dark,0,0,0,.46,.46,.46);
  for(let n=0;n<3;n++){
    const band=new THREE.Mesh(new THREE.TorusGeometry(.452,.014,6,40),rig.greenGlow);
    band.rotation.set(n*Math.PI/3,n*Math.PI/3,0);rig.rollBall.add(band);
  }
  for(let n=0;n<8;n++){const angle=n*Math.PI/4;oval(rig.rollBall,rig.greenGlow,Math.sin(angle)*.455,Math.cos(angle)*.455,0,.025,.025,.025);}
  batchMeshes(rig.rollBall);
  for(const part of [rig.torso,rig.pelvis,rig.head,rig.neck,rig.hardware,rear,...rig.arms.flatMap(a=>[a.pivot,a.joint]),...rig.legs.flatMap(l=>[l.pivot,l.joint,l.foot])])batchMeshes(part);
}
