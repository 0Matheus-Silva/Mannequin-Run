import * as THREE from 'three';

let surfaces;
function canvasTexture(draw,size=256){
  const canvas=document.createElement('canvas');canvas.width=canvas.height=size;const ctx=canvas.getContext('2d');draw(ctx,size);
  const texture=new THREE.CanvasTexture(canvas);texture.wrapS=texture.wrapT=THREE.RepeatWrapping;texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=4;return texture;
}
export function getSurfaces(){
  if(surfaces)return surfaces;
  let seed=7182;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
  const metal=canvasTexture((ctx,s)=>{
    ctx.fillStyle='#afb5b8';ctx.fillRect(0,0,s,s);
    for(let n=0;n<1900;n++){const gray=120+Math.floor(random()*100);ctx.strokeStyle=`rgba(${gray},${gray},${gray},.16)`;ctx.beginPath();const x=random()*s,y=random()*s;ctx.moveTo(x,y);ctx.lineTo(x+random()*36,y+.2);ctx.stroke();}
    for(let n=0;n<35;n++){ctx.strokeStyle='rgba(20,28,32,.17)';ctx.beginPath();const x=random()*s,y=random()*s;ctx.moveTo(x,y);ctx.lineTo(x+random()*40,y+random()*12);ctx.stroke();}
  });
  const floor=canvasTexture((ctx,s)=>{
    ctx.fillStyle='#8e9b9e';ctx.fillRect(0,0,s,s);ctx.strokeStyle='#29383b';ctx.lineWidth=3;ctx.strokeRect(2,2,s-4,s-4);
    for(let n=0;n<3500;n++){const g=Math.floor(90+random()*85);ctx.fillStyle=`rgba(${g},${g},${g},.25)`;ctx.fillRect(random()*s,random()*s,1+random()*3,1);}
    for(let x=16;x<s;x+=32)for(let y=16;y<s;y+=32){ctx.fillStyle='#48575a';ctx.fillRect(x,y,13,3);ctx.fillStyle='#b8c5c7';ctx.fillRect(x,y+3,13,1);}
    for(const x of [10,s-10])for(const y of [10,s-10]){ctx.fillStyle='#3b484b';ctx.beginPath();ctx.arc(x,y,3,0,Math.PI*2);ctx.fill();}
  });floor.repeat.set(4,8);
  const screen=canvasTexture((ctx,s)=>{
    ctx.fillStyle='#071b20';ctx.fillRect(0,0,s,s);ctx.strokeStyle='#276e76';ctx.lineWidth=1;
    for(let y=24;y<s;y+=20){ctx.beginPath();ctx.moveTo(12,y);ctx.lineTo(s-12,y);ctx.stroke();}
    ctx.fillStyle='#6cfff3';ctx.font='12px monospace';ctx.fillText('NXS // PESQUISA',13,20);ctx.fillText('UNIDADE: 001',13,225);
    ctx.strokeStyle='#62e1de';ctx.beginPath();for(let x=10;x<245;x+=5){const y=95+Math.sin(x*.09)*20+random()*12;x===10?ctx.moveTo(x,y):ctx.lineTo(x,y);}ctx.stroke();
    for(let n=0;n<5;n++){ctx.fillStyle=n===3?'#ffad62':'#317f85';ctx.fillRect(14,140+n*12,60+random()*140,4);}
    ctx.strokeStyle='rgba(136,178,175,.5)';ctx.lineWidth=.8;for(let n=0;n<7;n++){const angle=n*.9;ctx.beginPath();ctx.moveTo(180,64);ctx.lineTo(180+Math.cos(angle)*32,64+Math.sin(angle)*32);ctx.lineTo(180+Math.cos(angle+.2)*90,64+Math.sin(angle+.2)*90);ctx.stroke();}
  });screen.wrapS=screen.wrapT=THREE.ClampToEdgeWrapping;
  const glow=canvasTexture((ctx,s)=>{const gradient=ctx.createRadialGradient(s/2,s/2,0,s/2,s/2,s/2);gradient.addColorStop(0,'rgba(255,255,255,.9)');gradient.addColorStop(.2,'rgba(255,255,255,.32)');gradient.addColorStop(1,'rgba(255,255,255,0)');ctx.fillStyle=gradient;ctx.fillRect(0,0,s,s);},64);
  surfaces={metal,floor,screen,glow};return surfaces;
}

export function createStudioEnvironment(renderer){
  const scene=new THREE.Scene();scene.background=new THREE.Color(0x34434d);
  const geometry=new THREE.PlaneGeometry(1,1);const materials=[];
  for(const [color,intensity,position,scale] of [[0xc5e4f0,4,[-4,4,2],[3,6,1]],[0x47b9d0,3,[4,3,-2],[2,5,1]],[0xffbf83,2,[0,5,-4],[4,2,1]]]){
    const material=new THREE.MeshBasicMaterial({color,side:THREE.DoubleSide});material.color.multiplyScalar(intensity);materials.push(material);
    const panel=new THREE.Mesh(geometry,material);panel.position.set(...position);panel.scale.set(...scale);panel.lookAt(0,1,0);scene.add(panel);
  }
  const generator=new THREE.PMREMGenerator(renderer);const target=generator.fromScene(scene,.12,.1,30);generator.dispose();geometry.dispose();materials.forEach(m=>m.dispose());return target;
}
