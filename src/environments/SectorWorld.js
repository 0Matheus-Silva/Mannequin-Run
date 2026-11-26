import * as THREE from 'three';
import { Laboratory } from './Laboratory.js';
import { buildBridge } from './Bridge.js';
import { SECTORS, transitionAt } from './Sectors.js';
import { batchMeshes, releaseInstances } from '../utils/batchMeshes.js';
import { buildExterior } from './SectorArchitecture.js';
import { sectorAt } from './Sectors.js';
import { chasmContains,chasmIntersects } from './Chasm.js';

export class SectorWorld extends Laboratory {
  constructor(scene, hemisphere, rim) {
    super(scene);
    this.scene = scene; this.hemisphere = hemisphere; this.rim = rim;
    this.cylinder = new THREE.CylinderGeometry(1,1,1,14);
    this.cone = new THREE.ConeGeometry(1,1,8);
    this.hazard = new THREE.MeshStandardMaterial({ color:0x91ffac, emissive:0x31b657, emissiveIntensity:1.2, transparent:true, opacity:.62 });
    this.fire = new THREE.MeshStandardMaterial({ color:0xffad55, emissive:0xff4c16, emissiveIntensity:2.5, transparent:true, opacity:.85 });
    this.distance = 0; this.activeSector = 0;
    this.atmosphereTime=0;this.quality='standard';
    for (const segment of this.segments) { segment.userData.sector = 0;batchMeshes(segment); }
    this.applyPalette(0);
  }

  round(parent, geometry, material, x,y,z,w,h,d) {
    const mesh=new THREE.Mesh(geometry,material);mesh.position.set(x,y,z);mesh.scale.set(w,h,d);parent.add(mesh);return mesh;
  }

  build(index, sector) {
    if (sector===0) return super.createSegment(index);
    if (sector===4) return buildBridge(this,index);
    return buildExterior(this,index,sector);
  }
  buildPrototype(index,sector){
    const g=new THREE.Group(); const random=this.random(index*31+sector*271);
    this.box(g,this.dark,0,-.22,-8,12,.4,16);
    for (const x of [-1.35,1.35]) this.box(g,this.screen,x,.005,-8,.035,.015,16);
    for(const side of [-1,1]) {
      this.box(g,this.metal,side*5,.05,-8,1,.2,16);
      this.box(g,this.light,side*4.42,.14,-8,.035,.03,15.8);
      if(sector===1) {
        for(let j=0;j<3;j++) {
          const z=-2-j*5;const height=6+random()*12;
          this.box(g,this.metal,side*8,height/2,z,3,height,3.8);
          for(let y=1;y<height-1;y+=1.9) for(let c=0;c<2;c++) if(random()>.25) this.box(g,this.screen,side*6.48,y,z-1+c*2,.03,.75,.65);
          const broken=this.box(g,this.dark,side*7,height+.3,z,3.8,.7,1.2);broken.rotation.z=side*.22;
          this.box(g,this.dark,side*15,height*.65,z-5,5,height*1.3,4);
        }
        const fallen=this.box(g,this.metal,side*5.6,1.9,-9,.5,4.6,.5);fallen.rotation.z=side*.55;
        this.box(g,this.light,side*5.3,4,-9,1.3,.1,.35);
        const flame=this.round(g,this.cone,this.fire,side*5.5,.75,-5,.4,1.6,.4);
        flame.userData.flame=true;
        for(let n=0;n<4;n++) {const debris=this.box(g,this.metal,side*(4.8+random()),.15+random()*.2,-random()*16,.3+random()*.7,.3,.6);debris.rotation.y=random()*3;}
      } else if(sector===2) {
        this.box(g,this.metal,side*6,4,-8,1,8,1);
        this.box(g,this.dark,side*8,3,-8,3.5,6,12);
        for(let n=0;n<3;n++) {
          const pipe=this.round(g,this.cylinder,this.metal,side*(5.4+n*.6),5.6+n*.4,-8,.22,16,.22);pipe.rotation.x=Math.PI/2;
        }
        this.box(g,this.light,side*5.45,3.8,-8,.06,4,.1);
        const fan=new THREE.Group();fan.position.set(side*5.8,3.4,-4);g.add(fan);fan.userData.rotor=true;
        for(let n=0;n<4;n++){const blade=this.box(fan,this.metal,0,0,0,2.3,.18,.18);blade.rotation.z=n*Math.PI/4;}
        this.round(g,this.cylinder,this.light,side*5.8,3.4,-4,.26,.26,.26);
        this.box(g,this.metal,side*5.6,.8,-11,1.7,.25,4);
        for(let n=0;n<6;n++)this.box(g,this.amber,side*5.6,1,-13+n*.65,1.5,.06,.3);
      } else {
        for(let n=0;n<2;n++) {
          const z=-4-n*8;
          this.round(g,this.cylinder,this.metal,side*6,2.6,z,1.1,5.2,1.1);
          this.round(g,this.cylinder,this.hazard,side*6,2.7,z,1.14,3.2,1.14);
          for(const y of [.3,5.1])this.round(g,this.cylinder,this.dark,side*6,y,z,1.3,.25,1.3);
          this.box(g,this.light,side*4.83,2.7,z,.06,2.5,.12);
        }
        const ruin=this.box(g,this.metal,side*8,5,-8,.6,10,1);ruin.rotation.z=side*.15;
        this.box(g,this.dark,side*12,3.5,-8,4,7,10);
        this.box(g,this.light,side*9.8,2,-8,.03,.1,8);
      }
    }
    if(sector===2){this.box(g,this.metal,0,8,-8,13,.6,1);this.box(g,this.light,0,7.65,-8,5,.04,.3);}
    if(sector===3){const beam=this.box(g,this.metal,0,7,-4,14,.35,.5);beam.rotation.z=.07;}
    g.userData.animated=[];
    g.traverse(mesh=>{if(mesh.userData.flame||mesh.userData.rotor)g.userData.animated.push(mesh);});
    return g;
  }

  sectorFor(distance){const cycle=((distance%3000)+3000)%3000;if(cycle>=2400&&cycle<2440)return 3;if(this.mode==='story'&&distance<3000&&distance>=3000-1)return 4;if(this.mode==='story'&&distance>=3000)return 1;return sectorAt(distance);}
  replace(index, sector) {
    const previous=this.segments[index];
    if(previous.userData.sector===sector)return previous;
    const next=batchMeshes(this.build(index,sector));next.position.copy(previous.position);next.userData.sector=sector;
    next.traverse(node=>{if(node.userData.steam||node.userData.industrialSmoke)node.visible=this.quality!=='eco';});
    releaseInstances(previous);
    this.root.remove(previous);this.root.add(next);this.segments[index]=next;
    // Every mesh uses shared geometry/materials; detached nodes are garbage collected.
    return next;
  }

  reset() {
    this.distance=0;this.activeSector=0;
    this.segments.forEach((_,i)=>{const segment=this.replace(i,0);segment.position.z=16-i*this.length;});
    this.applyPalette(0);
  }

  chasmAt(x){return this.segments.some(segment=>chasmContains(segment,x,this.length));}
  chasmNear(z,margin=12){return this.segments.some(segment=>chasmIntersects(segment,z,margin,this.length));}
  chasmSidesNear(z,margin=12){return [...new Set(this.segments.filter(segment=>chasmIntersects(segment,z,margin,this.length)).map(segment=>segment.userData.chasmSide))];}

  applyPalette(distance) {
    let {current,next,blend}=transitionAt(distance);
    if(this.mode==='story'&&distance>=3000){current=1;next=1;blend=0;}
    else if(this.mode==='story'&&distance>=2880){current=4;next=4;blend=0;}
    this.activeSector=current;
    const a=SECTORS[current],b=SECTORS[next];
    this.scene.background.copy(a.sky).lerp(b.sky,blend);
    this.scene.fog.color.copy(a.fog).lerp(b.fog,blend);
    const densities=[.025,.014,.012,.016,.007];this.scene.fog.density=THREE.MathUtils.lerp(densities[current],densities[next],blend);
    this.metal.color.copy(a.metal).lerp(b.metal,blend);this.dark.color.copy(a.floor).lerp(b.floor,blend);
    this.light.color.copy(a.accent).lerp(b.accent,blend);this.light.emissive.copy(this.light.color);
    this.screen.emissive.copy(this.light.color).multiplyScalar(.45);
    this.dust.material.color.copy(a.particle).lerp(b.particle,blend);
    this.hemisphere.color.copy(a.fill).lerp(b.fill,blend);
    this.rim.color.copy(this.light.color);
  }

  update(dt,speed,distance=this.distance) {
    this.atmosphereTime+=dt;
    if(this.art?.lava){this.art.lava.map.offset.set(this.atmosphereTime*.008,this.atmosphereTime*.012);this.art.lava.emissiveIntensity=1.45+Math.sin(this.atmosphereTime*1.7)*.2;}
    this.distance=distance;this.applyPalette(distance);
    const transition=transitionAt(distance);
    const architecture=transition.blend>.05?transition.next:transition.current;
    for(let i=0;i<this.segments.length;i++) {
      let segment=this.segments[i];segment.position.z+=dt*speed;
      if(segment.position.z>32){segment.position.z-=this.length*this.segments.length;const absolute=distance-segment.position.z+8;segment=this.replace(i,this.mode==='story'&&distance<3000&&absolute>=3000?4:this.sectorFor(absolute));}
      for(const mesh of segment.userData.animated??[]) {
        if(mesh.userData.rotor)mesh.rotation.z+=dt*1.6;
        if(mesh.userData.flame)mesh.scale.y=1.5+Math.sin(distance*.4+i)*.3;
        if(mesh.userData.steam){mesh.position.y=1.4+Math.sin(this.atmosphereTime*.65+i)*.15;mesh.scale.x=2.7+Math.sin(this.atmosphereTime*.4+i)*.3;}
        if(mesh.userData.industrialSmoke){const smoke=mesh.userData.industrialSmoke,t=this.atmosphereTime*.45+smoke.phase;mesh.position.y=smoke.baseY+(t%2);mesh.position.x=smoke.baseX+Math.sin(t*.7)*.45;}
      }
    }
    const positions=this.dust.geometry.attributes.position;
    for(let i=0;i<positions.count;i++){
      positions.array[i*3+1]-=dt*(this.activeSector===1?.6:.12);
      positions.array[i*3+2]+=dt*speed*.5;
      if(positions.array[i*3+1]<0)positions.array[i*3+1]=9;
      if(positions.array[i*3+2]>18)positions.array[i*3+2]=-122;
    }
    positions.needsUpdate=true;
  }
  setQuality(quality){this.quality=quality;this.root.traverse(node=>{if(node.userData.steam||node.userData.industrialSmoke)node.visible=quality!=='eco';});}
}
