import * as THREE from 'three';
import { getSurfaces } from '../graphics/SurfaceLibrary.js';
import { transitionAt } from './Sectors.js';
export class Atmosphere{
  constructor(scene){
    this.root=new THREE.Group();scene.add(this.root);
    this.skyMaterial=new THREE.ShaderMaterial({side:THREE.BackSide,depthWrite:false,uniforms:{top:{value:new THREE.Color()},bottom:{value:new THREE.Color()}},vertexShader:'varying vec3 v;void main(){v=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:'varying vec3 v;uniform vec3 top;uniform vec3 bottom;void main(){float h=smoothstep(-.1,.65,normalize(v).y);gl_FragColor=vec4(mix(bottom,top,h),1.);}',toneMapped:false});
    this.sky=new THREE.Mesh(new THREE.SphereGeometry(160,20,12),this.skyMaterial);this.sky.renderOrder=-1000;this.root.add(this.sky);
    this.sun=new THREE.Mesh(new THREE.SphereGeometry(1,16,12),new THREE.MeshBasicMaterial({color:0xffdf99,fog:false,transparent:true}));this.sun.position.set(-2,12,-78);this.sun.scale.setScalar(3.8);this.root.add(this.sun);
    this.cloudMaterial=new THREE.SpriteMaterial({map:getSurfaces().glow,color:0xf2dfbd,transparent:true,opacity:.35,depthWrite:false,fog:false});
    for(let i=0;i<9;i++){const cloud=new THREE.Sprite(this.cloudMaterial);cloud.position.set(-65+i*16,15+(i%3)*2,-65-(i%2)*20);cloud.scale.set(26,4+(i%3),1);this.root.add(cloud);}
    this.tops=[0x07131d,0x586d87,0x454d5b,0x294d42,0x79a9bc].map(c=>new THREE.Color(c));this.bottoms=[0x071923,0xe7a969,0x8d6d51,0x51785a,0xb9d8c7].map(c=>new THREE.Color(c));
  }
  update(distance,mode='infinite'){
    let {current,next,blend}=transitionAt(distance);
    if(mode==='story'&&distance>=3000){current=1;next=1;blend=0;}else if(mode==='story'&&distance>=2880){current=4;next=4;blend=0;}
    this.skyMaterial.uniforms.top.value.copy(this.tops[current]).lerp(this.tops[next],blend);
    this.skyMaterial.uniforms.bottom.value.copy(this.bottoms[current]).lerp(this.bottoms[next],blend);
    const sun=(current===1?1:0)*(1-blend)+(next===1?1:0)*blend;this.sun.material.opacity=sun;this.sun.visible=sun>.001;
    this.cloudMaterial.opacity=(current===0?0:.35)*(1-blend)+(next===0?0:.35)*blend;
  }
}
