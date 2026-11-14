import * as THREE from 'three';
import { getSurfaces } from '../graphics/SurfaceLibrary.js';
import { buildLaboratory } from './LabArchitecture.js';
import { getPatina } from '../graphics/Patina.js';

export class Laboratory {
  constructor(scene) {
    this.root = new THREE.Group(); scene.add(this.root);
    this.length = 16;
    this.segments = [];
    this.metal = new THREE.MeshStandardMaterial({ color: 0x253743, metalness: .7, roughness: .48 });
    this.dark = new THREE.MeshStandardMaterial({ color: 0x0c1820, metalness: .55, roughness: .6 });
    this.light = new THREE.MeshStandardMaterial({ color: 0x67f8ef, emissive: 0x20d4d8, emissiveIntensity: 2 });
    this.amber = new THREE.MeshStandardMaterial({ color: 0xffaa63, emissive: 0xff6828, emissiveIntensity: 1.5 });
    this.screen = new THREE.MeshStandardMaterial({ color: 0x16424c, emissive: 0x117583, emissiveIntensity: .7 });
    const surfaces=getSurfaces();
    this.metal.map=getPatina().steel;this.metal.envMapIntensity=.35;this.metal.roughness=.6;
    this.puddleMaterial=new THREE.MeshStandardMaterial({color:0x15292c,metalness:.55,roughness:.2,transparent:true,opacity:.65});this.puddleGeometry=new THREE.CircleGeometry(1,12);
    this.floor=new THREE.MeshStandardMaterial({color:0x263b43,map:surfaces.floor,metalness:.68,roughness:.42,envMapIntensity:.5});
    this.wall=new THREE.MeshStandardMaterial({color:0x2a3b47,map:surfaces.metal,metalness:.35,roughness:.7});
    this.trim=new THREE.MeshStandardMaterial({color:0x728590,map:surfaces.metal,metalness:.85,roughness:.32,envMapIntensity:.6});
    this.glass=new THREE.MeshStandardMaterial({color:0x226878,metalness:.3,roughness:.21,transparent:true,opacity:.37,depthWrite:false});
    this.hazeMaterial=new THREE.SpriteMaterial({map:surfaces.glow,color:0x87c7d2,transparent:true,opacity:.085,depthWrite:false});
    this.screen.map=surfaces.screen;this.screen.emissiveMap=surfaces.screen;
    this.labCylinder=new THREE.CylinderGeometry(1,1,1,12);
    this.cableGeometry=new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(-5.5,0,0),new THREE.Vector3(-3,-.3,.2),new THREE.Vector3(0,-.85,0),new THREE.Vector3(3,-.35,-.1),new THREE.Vector3(5.5,0,0)]),20,.035,5,false);
    this.geometry = new THREE.BoxGeometry(1, 1, 1);
    for (let i = 0; i < 10; i++) {
      const segment = this.createSegment(i); segment.position.z = 16 - i * this.length;
      this.segments.push(segment); this.root.add(segment);
    }
    const random = this.random(273);
    const points = new Float32Array(240 * 3);
    for (let i = 0; i < 240; i++) {
      points[i * 3] = (random() - .5) * 18;
      points[i * 3 + 1] = random() * 9;
      points[i * 3 + 2] = 18 - random() * 140;
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(points, 3));
    this.dust = new THREE.Points(geometry, new THREE.PointsMaterial({ color: 0x72c6d4, size: .035, transparent: true, opacity: .45, depthWrite: false }));
    this.root.add(this.dust);
  }

  random(seed) { return () => { seed = (1664525 * seed + 1013904223) >>> 0; return seed / 4294967296; }; }

  box(parent, material, x, y, z, w, h, d) {
    const mesh = new THREE.Mesh(this.geometry, material);
    mesh.position.set(x, y, z); mesh.scale.set(w, h, d);
    mesh.castShadow = material === this.metal; mesh.receiveShadow = true;
    parent.add(mesh); return mesh;
  }

  createSegment(index) {
    return buildLaboratory(this,index);
  }

  createPrototypeSegment(index) {
    const group = new THREE.Group();
    const rand = this.random(index + 11);
    this.box(group, this.dark, 0, -.22, -8, 12, .4, 16);
    for (let z = -1; z > -16; z -= 2) {
      this.box(group, this.metal, 0, -.015, z, 8.8, .035, .035);
    }
    for (const side of [-1, 1]) {
      this.box(group, this.metal, side * 5, .02, -8, 1.3, .15, 16);
      this.box(group, this.light, side * 4.42, .11, -8, .035, .025, 15.5);
      this.box(group, this.dark, side * 7, 3.5, -8, .5, 7, 16);
      this.box(group, this.metal, side * 5.6, 3.5, -1, .4, 7, .5);
      this.box(group, this.light, side * 5.35, 3.8, -1, .04, 3.8, .12);
      this.box(group, this.metal, side * 5.6, 7, -8, .5, .35, 16);
      for (let p = 0; p < 3; p++) {
        this.box(group, this.metal, side * (5.9 + p * .3), 5.7 + p * .3, -8, .16, .16, 16);
      }
      for (let j = 0; j < 3; j++) {
        const z = -3 - j * 4;
        const h = 1.5 + rand() * 1.8;
        this.box(group, this.metal, side * 6, h / 2, z, 1.3, h, 2);
        this.box(group, this.screen, side * 5.32, h * .65, z, .04, .65, 1.25);
        for (let row = 0; row < 3; row++) this.box(group, this.light, side * 5.28, h * .65 + .18 - row * .16, z, .03, .025, .8 - row * .13);
        this.box(group, index % 3 === 0 ? this.amber : this.light, side * 5.29, .35, z, .03, .06, .1);
      }
      // Beyond the corridor: layered silhouettes give the facility depth.
      this.box(group, this.metal, side * 10, 5, -8, 2, 10, 3);
      for (let y = 1; y < 10; y += 2) this.box(group, this.screen, side * 8.97, y, -8, .02, .5, 2);
    }
    this.box(group, this.metal, 0, 7, -1, 11.6, .4, .5);
    this.box(group, this.light, 0, 6.77, -1, 4, .035, .22);
    for (const x of [-1.5, 1.5]) this.box(group, this.screen, x, .005, -8, .035, .015, 16);
    // Small broken machinery stays clear of the playable corridor.
    const debris = this.box(group, this.metal, index % 2 ? -4.8 : 4.8, .32, -11, .5, .6, .9);
    debris.rotation.z = .28;
    return group;
  }

  update(dt, speed) {
    for (const segment of this.segments) {
      segment.position.z += dt * speed;
      if (segment.position.z > 32) segment.position.z -= this.length * this.segments.length;
    }
    this.dust.rotation.z = Math.sin(performance.now() * .0001) * .025;
  }
}
