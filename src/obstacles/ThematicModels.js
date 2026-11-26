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
    // Abandoned city: a damaged street vehicle, concrete roadblock and low traffic gantry.
    if(type==='block'){
      box(a.blue,0,1.28,0,1.7,2.15,1.13);box(a.rust,0,.28,0,1.72,.3,1.18);
      box(w.black,0,1.92,.58,1.48,.72,.045);box(a.glass,0,1.93,.61,1.31,.55,.025);
      for(const x of [-.67,.67]){cyl(w.black,x,.34,.25,.22,.16,'x');box(a.rust,x,1.27,.61,.08,1.15,.05);box(w.warning,x,.68,.62,.2,.11,.04);}
      box(w.black,0,1.16,.62,1.25,.32,.04);for(let n=0;n<4;n++)box(a.concrete,0,1.04+n*.08,.65,1.05,.025,.02);
      box(a.concrete,0,2.43,.03,1.52,.12,1.05);
    }else if(type==='jump'){
      box(a.concrete,0,.31,0,1.68,.62,.84);box(a.concrete,0,.64,0,1.5,.1,.76);
      box(w.black,0,.33,.44,1.49,.4,.025);for(let n=0;n<5;n++){const stripe=box(w.warning,-.57+n*.285,.34,.46,.13,.42,.025);stripe.rotation.z=-.45;}
      for(const x of [-.62,.62])box(a.rust,x,.12,.46,.17,.12,.04);
    }else{
      for(const x of [-.82,.82]){box(a.rust,x,.61,0,.14,1.22,.55);box(a.concrete,x,.1,0,.34,.2,.82);}
      box(a.blue,0,1.43,0,1.85,.4,.8);box(w.black,0,1.43,.42,1.65,.3,.025);
      for(let n=0;n<5;n++){const stripe=box(w.warning,-.65+n*.32,1.43,.445,.15,.22,.02);stripe.rotation.z=-.42;}
      box(w.red,0,1.22,.43,1.7,.06,.025);for(const x of [-.65,.65])cyl(w.warning,x,1.67,0,.09,.06);
    }
  }else if(sector===2){
    // Factory: pressure vessel, low pipe and suspended pipe bridge.
    if(type==='block'){
      box(a.rust,0,.13,0,1.75,.26,1.2);cyl(a.blue,0,1.47,0,.56,2.35);
      for(const y of [.35,1.25,2.55])cyl(a.rust,0,y,0,.59,.12);
      cyl(a.concrete,0,2.7,0,.49,.18);box(w.black,0,1.48,.56,.62,.72,.04);
      for(let n=0;n<3;n++)box(w.warning,0,1.24+n*.22,.59,.38,.035,.025);
      for(const x of [-.72,.72]){box(a.rust,x,1.35,0,.12,2.5,.85);box(a.concrete,x,.18,.3,.25,.24,.55);}
    }else if(type==='jump'){
      for(const x of [-.68,.68])box(a.concrete,x,.16,0,.3,.32,.84);
      cyl(a.rust,0,.43,0,.30,1.72,'x');for(const x of [-.55,.55])cyl(a.blue,x,.43,0,.33,.10,'x');
      box(w.black,0,.44,.3,.55,.18,.025);box(w.warning,0,.44,.32,.38,.05,.02);
    }else{
      for(const x of [-.83,.83]){box(a.rust,x,.59,0,.14,1.18,.7);box(a.concrete,x,.11,0,.34,.22,.9);}
      cyl(a.rust,0,1.65,0,.39,1.78,'x');for(const x of [-.63,.63])cyl(a.blue,x,1.65,0,.42,.11,'x');
      box(w.red,0,1.22,.36,1.55,.06,.03);box(w.black,0,1.7,.4,.62,.25,.025);box(w.warning,0,1.7,.42,.42,.06,.02);
    }
  }else if(sector===4){
    // Broken bridge supplies and timber, kept distinct from the industrial sector.
    if(!w.bridgeObstacleMaterials){
      const wood=(color)=>new THREE.MeshStandardMaterial({color,roughness:.95,metalness:0});
      w.bridgeObstacleMaterials={wood:wood(0x805b3b),dark:wood(0x543a29),rope:wood(0xc6a775),mark:wood(0xddc48c)};
    }
    const bridge=w.bridgeObstacleMaterials;
    if(type==='block'){
      // A tall collapsed stack of bridge planks blocks the lane.
      for(let n=0;n<5;n++){
        const plank=box(n%2?bridge.dark:bridge.wood,(n%2-.5)*.12,.31+n*.52,0,1.64,.47,.92);
        plank.rotation.y=(n%2-.5)*.13;
        for(const side of [-1,1])box(bridge.mark,side*.62,.31+n*.52,.48,.045,.045,.025);
      }
      for(const x of [-.52,.52])box(bridge.rope,x,1.35,.49,.07,2.55,.045);
    }else if(type==='jump'){
      // A low fallen timber lies across the deck.
      cyl(bridge.wood,0,.36,0,.33,1.72,'x');
      for(const x of [-.53,.53])cyl(bridge.rope,x,.36,0,.345,.075,'x');
      for(const x of [-.72,.72])cyl(bridge.dark,x,.36,0,.34,.04,'x');
    }else{
      // A suspended timber and rope frame leave a clear gap for a roll.
      for(const x of [-.83,.83]){
        box(bridge.dark,x,1.05,0,.14,2.1,.46);
        box(bridge.rope,x,1.1,.25,.07,2.05,.07);
      }
      cyl(bridge.wood,0,1.56,0,.34,1.8,'x');
      for(const x of [-.6,.6])cyl(bridge.rope,x,1.56,0,.35,.08,'x');
      // Upright splintered beams make the tall hazard read as a slide.
      for(const x of [-.55,.55]){const spar=box(bridge.dark,x,2.22,.05,.14,1.4,.22);spar.rotation.z=x*.12;}
      box(bridge.rope,0,1.21,.38,1.55,.045,.04);
    }
  }else{
    // Weathered cemetery stones distinguish the fourth sector from the factory.
    if(!w.graveAssets){
      const stone=new THREE.MeshStandardMaterial({color:0x949d9b,roughness:.92,metalness:.04});
      const ink=new THREE.MeshStandardMaterial({color:0x242c25,roughness:1});
      const shape=new THREE.Shape();shape.moveTo(-.72,0);shape.lineTo(-.72,1.85);shape.quadraticCurveTo(-.72,2.55,0,2.55);shape.quadraticCurveTo(.72,2.55,.72,1.85);shape.lineTo(.72,0);shape.closePath();
      const canvas=document.createElement('canvas');canvas.width=256;canvas.height=128;const ctx=canvas.getContext('2d');ctx.fillStyle='#30372f';ctx.font='bold 76px Georgia';ctx.textAlign='center';ctx.fillText('RIP',128,85);const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;
      w.graveAssets={stone,ink,geometry:new THREE.ExtrudeGeometry(shape,{depth:.35,bevelEnabled:true,bevelSize:.07,bevelThickness:.07,bevelSegments:2}),label:new THREE.MeshBasicMaterial({map:texture,transparent:true,depthWrite:false})};
    }
    const grave=w.graveAssets;
    if(type==='block'){
      const stone=new THREE.Mesh(grave.geometry,grave.stone);stone.position.set(0,.12,-.18);stone.castShadow=true;g.add(stone);
      const label=new THREE.Mesh(new THREE.PlaneGeometry(.85,.42),grave.label);label.position.set(0,1.83,.26);g.add(label);
      box(grave.stone,0,.12,0,1.75,.24,.85);
    }else if(type==='jump'){
      const slab=box(grave.stone,0,.34,0,1.75,.68,.95);slab.rotation.z=.04;
      box(grave.ink,0,.69,.05,1.45,.025,.07);box(grave.ink,0,.7,.05,.07,.025,.65);
    }else{
      for(const x of [-.79,.79])box(grave.stone,x,1.22,0,.25,2.44,.58);
      const lintel=box(grave.stone,0,1.67,0,1.86,.85,.65);lintel.rotation.z=.025;
      box(grave.ink,0,1.65,.34,.7,.08,.02);box(grave.ink,0,1.65,.35,.08,.48,.02);
    }
  }
  g.userData.hitbox={...OBSTACLES[type]};g.userData.type=type;g.userData.sector=sector;return batchMeshes(g);
}
