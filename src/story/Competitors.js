import * as THREE from 'three';
import { getPatina } from '../graphics/Patina.js';
import { batchMeshes } from '../utils/batchMeshes.js';

// Original exhibition projects: no names, symbols or licensed character assets.
export function createCompetitor(kind){
  const root=new THREE.Group(),body=new THREE.Group();root.add(body);root.userData.kind=kind;
  const cube=new THREE.BoxGeometry(1,1,1),sphere=new THREE.SphereGeometry(1,16,12),cylinder=new THREE.CylinderGeometry(1,1,1,16);
  const material=(color,metalness=0,roughness=.7)=>new THREE.MeshStandardMaterial({color,metalness,roughness});
  const red=material(0xa82f27),blue=material(0x254d88),skin=material(0xe0af7b),hair=material(0x382e29),glove=material(0xe8ddc8),boot=material(0x46312a),metal=material(0x7b8984,.65,.4);
  const add=(parent,geometry,mat,x,y,z,sx,sy,sz)=>{const m=new THREE.Mesh(geometry,mat);m.position.set(x,y,z);m.scale.set(sx,sy,sz);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;};
  const box=(p,m,x,y,z,w,h,d)=>add(p,cube,m,x,y,z,w,h,d);
  const ball=(p,m,x,y,z,w,h,d)=>add(p,sphere,m,x,y,z,w,h,d);
  let lid,screen,tongue,tears,monitor;
  if(kind==='inventor'){
    // Rounded cap, asymmetric wrench badge and scarf distinguish this original inventor.
    for(const side of [-1,1]){ball(body,boot,side*.24,.13,.12,.23,.13,.34);box(body,blue,side*.23,.46,0,.31,.65,.36);}
    ball(body,red,0,.94,0,.49,.42,.28);box(body,blue,0,.91,.23,.56,.46,.12);
    for(const side of [-1,1]){
      box(body,blue,side*.23,1.15,.24,.085,.4,.07);ball(body,metal,side*.23,1.05,.3,.045,.045,.025);
      const arm=ball(body,red,side*.52,1.02,0,.16,.31,.17);arm.rotation.z=side*.25;
      ball(body,glove,side*.58,.76,.09,.17,.18,.15);
      ball(body,skin,side*.36,1.52,0,.09,.13,.11);
    }
    ball(body,skin,0,1.55,.035,.36,.34,.3);
    ball(body,hair,0,1.52,-.19,.35,.3,.14);
    for(const side of [-1,1]){
      ball(body,glove,side*.13,1.61,.297,.073,.095,.025);ball(body,hair,side*.13,1.61,.323,.028,.055,.018);
      const brow=box(body,hair,side*.13,1.73,.29,.13,.035,.025);brow.rotation.z=side*-.12;
      const moustache=ball(body,hair,side*.12,1.42,.313,.15,.065,.06);moustache.rotation.z=side*.2;
    }
    ball(body,skin,0,1.51,.34,.1,.09,.1);
    ball(body,red,0,1.84,0,.4,.21,.33);ball(body,red,.04,1.79,.3,.38,.035,.21);
    box(body,metal,-.17,1.92,.29,.05,.13,.025);box(body,metal,-.17,1.98,.29,.12,.035,.025);
    box(body,glove,.28,1.28,.1,.13,.15,.08);
  }else{
    const wood=material(0x634431,.18,.84);wood.map=getPatina().rust;
    const dark=material(0x142026,.25,.65),tooth=material(0xe7d9ae,.05,.6),eye=material(0x9fcbbb,.25,.3);
    for(const side of [-1,1]){ball(body,boot,side*.53,.13,.18,.28,.13,.37);box(body,metal,side*.53,.28,0,.13,.3,.14);}
    box(body,wood,0,.6,0,1.65,.65,1.1);box(body,dark,0,.94,0,1.45,.08,.9);
    for(const x of [-.65,.65]){box(body,metal,x,.6,.57,.1,.65,.06);box(body,metal,x,.6,-.57,.1,.65,.06);}
    // Interior monitor, bezel, stand and keyboard remain visible through the open mouth.
    monitor=new THREE.Group();body.add(monitor);
    box(monitor,metal,0,1.03,-.04,.14,.3,.13);box(monitor,dark,0,1.36,-.07,1.08,.68,.13);
    const canvas=document.createElement('canvas');canvas.width=256;canvas.height=160;const ctx=canvas.getContext('2d');ctx.fillStyle='#082532';ctx.fillRect(0,0,256,160);ctx.fillStyle='#72e8cf';ctx.font='bold 21px monospace';ctx.fillText('PROJETO 03',22,35);ctx.font='18px monospace';ctx.fillText('> SISTEMA ATIVO',18,78);ctx.fillText('[|||||||||||]',18,115);
    const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;
    const display=new THREE.MeshBasicMaterial({map:texture});screen=box(monitor,display,0,1.37,.006,.94,.52,.015);screen.userData.monitor=true;
    tongue=new THREE.Group();body.add(tongue);tongue.position.set(0,1.02,.48);
    const pink=material(0xe96787);ball(tongue,pink,0,-.05,.36,.23,.075,.48);ball(tongue,pink,0,-.14,.72,.24,.12,.2);
    box(tongue,material(0x9b3159),0,.015,.4,.018,.012,.5);
    tears=new THREE.Group();body.add(tears);const tearMat=new THREE.MeshBasicMaterial({color:0x71e5ff});
    for(let n=0;n<14;n++){const drop=new THREE.Mesh(new THREE.SphereGeometry(.055,7,5),tearMat);drop.scale.y=1.8;tears.add(drop);}tears.visible=false;
    box(monitor,metal,0,.98,.32,.85,.05,.24);
    lid=new THREE.Group();lid.position.set(0,1,-.53);lid.rotation.x=-1.13;body.add(lid);
    box(lid,wood,0,.1,.55,1.72,.25,1.15);for(const x of [-.65,.65])box(lid,metal,x,.24,.55,.11,.04,1.15);
    const cone=new THREE.ConeGeometry(.065,.19,5);
    for(let i=0;i<7;i++){
      add(body,cone,tooth,-.66+i*.22,1.02,.56,1,1,1);
      const fang=add(lid,cone,tooth,-.66+i*.22,-.08,1.05,1,1,1);fang.rotation.z=Math.PI;
    }
    for(const side of [-1,1]){ball(lid,eye,side*.43,.32,.9,.18,.16,.1);ball(lid,dark,side*.43,.34,.99,.04,.09,.025);}
    for(const side of [-1,1]){box(body,metal,side*.88,.75,.1,.15,.2,.3);const cable=new THREE.Mesh(new THREE.TorusGeometry(.16,.025,6,16,Math.PI*1.4),eye);cable.position.set(side*.85,.63,.4);body.add(cable);}
  }
  batchMeshes(body);
  return {root,body,lid,screen,tongue,tears,monitor,update(dt,t=null){this.time=t??((this.time??0)+dt);body.position.y=.006+Math.sin(this.time*1.8)*.006;if(lid){const close=THREE.MathUtils.smoothstep(this.time,27,27.8);lid.rotation.x=(-1.13+Math.sin(this.time*1.4)*.025)*(1-close)-.04*close;tongue.scale.y=1-close*.7;tongue.position.y=1.02-close*.025;screen.visible=close<.7;monitor.position.y=-.8*close;tears.visible=this.time>=27.8&&this.time<31;tears.children.forEach((drop,n)=>{const u=(((this.time-27.8)*1.4+n/7)%1+1)%1,side=n%2?1:-1;drop.position.set(side*(.45+u*.55),1.2+u*1.35-u*u*.45,.65);});if(tears.visible)lid.rotation.x+=Math.sin(this.time*29)*.04;body.rotation.z=tears.visible?Math.sin(this.time*35)*.025:0;}}};
}
