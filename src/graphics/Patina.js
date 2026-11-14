import * as THREE from 'three';
let library;
export function getPatina(){
  if(library)return library;
  let seed=9581;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
  const paint=(base)=>{
    const canvas=document.createElement('canvas');canvas.width=canvas.height=256;const c=canvas.getContext('2d');c.fillStyle=base;c.fillRect(0,0,256,256);
    for(let i=0;i<2600;i++){const x=random()*256,y=random()*256,r=random()*3+.3;c.fillStyle=base==='#686862'?(i%4?'rgba(20,24,24,.25)':'rgba(125,126,119,.4)'):(i%4?'rgba(54,40,28,.32)':'rgba(170,91,37,.8)');c.beginPath();c.ellipse(x,y,r,r*.55,random()*6,0,7);c.fill();}
    c.strokeStyle='#43372c';c.lineWidth=.7;
    for(let i=0;i<65;i++){const x=random()*256,y=random()*256;c.beginPath();c.moveTo(x,y);c.lineTo(x+random()*28,y+random()*17);c.stroke();}
    const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;texture.wrapS=texture.wrapT=THREE.RepeatWrapping;texture.anisotropy=4;return texture;
  };
  library={rust:paint('#b36b3f'),head:paint('#aac8bd'),steel:paint('#777e77'),asphalt:paint('#686862')};library.asphalt.repeat.set(3,8);return library;
}
