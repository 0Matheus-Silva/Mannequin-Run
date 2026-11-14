import * as THREE from 'three';
import { LANE_WIDTH } from '../player/PlayerController.js';
import { canCollect, createPattern, overlapsPlayer } from './Collision.js';
import { batchMeshes } from '../utils/batchMeshes.js';
import { armorGeometry } from '../graphics/Geometry.js';
import { getSurfaces } from '../graphics/SurfaceLibrary.js';
import { buildObstacle,buildChip } from './IndustrialModels.js';
import { buildThematic } from './ThematicModels.js';
import { sectorAt } from '../environments/Sectors.js';

export class TrackObjects {
  constructor(scene, onCollect, onCrash) {
    this.onCollect = onCollect; this.onCrash = onCrash;
    this.root = new THREE.Group(); scene.add(this.root);
    this.boxGeometry = new THREE.BoxGeometry(1, 1, 1);
    this.material = new THREE.MeshStandardMaterial({ color: 0x485562, metalness: .75, roughness: .35 });
    this.black = new THREE.MeshStandardMaterial({ color: 0x18212b, metalness: .6, roughness: .5 });
    this.warning = new THREE.MeshStandardMaterial({ color: 0xffb36e, emissive: 0xd15b17, emissiveIntensity: .8 });
    this.red = new THREE.MeshStandardMaterial({ color: 0xff6d72, emissive: 0xe22b3c, emissiveIntensity: 1.2 });
    this.cyan = new THREE.MeshStandardMaterial({ color: 0x88fff0, emissive: 0x32ebca, emissiveIntensity: 2 });
    this.armorGeometry=armorGeometry();this.boltGeometry=new THREE.CylinderGeometry(.022,.022,.018,6);
    const surfaces=getSurfaces();this.material.map=surfaces.metal;this.material.roughness=.4;
    this.chrome=new THREE.MeshStandardMaterial({color:0x95a8b2,metalness:.85,roughness:.27,envMapIntensity:.7});
    this.haloMaterial=new THREE.SpriteMaterial({map:surfaces.glow,color:0x47edee,transparent:true,opacity:.23,depthWrite:false,blending:THREE.AdditiveBlending});
    this.rows = Array.from({ length: 9 }, () => this.createRow());
    this.reset();
  }

  box(parent, material, x, y, z, w, h, d) {
    const mesh = new THREE.Mesh(this.boxGeometry, material);
    mesh.position.set(x,y,z); mesh.scale.set(w,h,d); mesh.castShadow = true;
    parent.add(mesh); return mesh;
  }

  obstacle(type,sector=0) {
    return sector===0?buildObstacle(this,type):buildThematic(this,type,sector);
  }

  prototypeObstacle(type) {
    const group = new THREE.Group();
    if (type === 'block') {
      this.box(group, this.material, 0,1.5,0, 1.8,3,1.3);
      this.box(group, this.black, 0,1.8,.66, 1.5,1.8,.03);
      for (let y=.9;y<2.7;y+=.4) this.box(group, this.red, 0,y,.69, 1.3,.045,.025);
      this.box(group, this.red, 0,2.9,.69, 1.7,.12,.03);
    } else if (type === 'jump') {
      this.box(group, this.material, 0,.39,0, 1.8,.78,1);
      for (let x=-.7;x<=.7;x+=.35) {
        const stripe = this.box(group, this.warning, x,.4,.51, .12,.65,.025);
        stripe.rotation.z = -.3;
      }
      this.box(group, this.warning, 0,.79,0, 1.8,.035,1);
    } else {
      this.box(group, this.material, 0,2.04,0, 1.9,1.72,1);
      this.box(group, this.red, 0,1.2,.51, 1.9,.09,.04);
      for (const x of [-.92,.92]) this.box(group, this.black, x,.59,0, .08,1.18,.8);
      this.box(group, this.warning, 0,1.55,.52, .8,.12,.03);
    }
    return batchMeshes(group);
  }

  createRow() {
    const group = new THREE.Group(); this.root.add(group);
    const slots = [-1,0,1].map(lane => {
      const variants = {};
      for (const type of ['block','jump','slide']) { variants[type] = this.obstacle(type); variants[type].position.x = lane * LANE_WIDTH; group.add(variants[type]); }
      return variants;
    });
    const chips = [-5,-2,1].map(z => {
      const chip=buildChip(this);
      chip.position.set(0,1.25,z); group.add(chip); return chip;
    });
    return { group, slots, themeSlots:{0:slots},chips, obstacles: [], active: false };
  }

  reset() {
    this.timer = 0; this.index = 0;
    for (const row of this.rows) { row.active = false; row.group.visible = false; }
  }

  spawn(sector=0) {
    const row = this.rows.find(row => !row.active);
    if (!row) return;
    const pattern = createPattern(this.index++);
    if(!row.themeSlots[sector])row.themeSlots[sector]=[-1,0,1].map(lane=>{const variants={};for(const type of ['block','jump','slide']){const model=this.obstacle(type,sector);model.position.x=lane*LANE_WIDTH;row.group.add(model);variants[type]=model;}return variants;});
    for(const slots of Object.values(row.themeSlots))for (const slot of slots) for (const mesh of Object.values(slot)) mesh.visible = false;
    row.obstacles = pattern.obstacles.map(obstacle => ({ ...obstacle, x: obstacle.lane * LANE_WIDTH }));
    row.sector=sector;
    for (const obstacle of row.obstacles) row.themeSlots[sector][obstacle.lane + 1][obstacle.type].visible = true;
    row.route=pattern.route;
    row.chips.forEach((chip,i)=>{const point=pattern.collectibles[i];chip.visible=true;chip.userData.baseY=point.y;chip.userData.action=point.action;chip.position.set(point.lane*LANE_WIDTH,point.y,point.z);});
    row.group.position.z = -85; row.group.visible = true; row.active = true;
  }

  update(dt, speed, player, elapsed,distance=0) {
    this.timer -= dt;
    if (this.timer <= 0) { this.spawn(sectorAt(distance+85)); this.timer += 1.65 + (this.index < 4 ? .45 : 0); }
    for (const row of this.rows) {
      if (!row.active) continue;
      const previousZ = row.group.position.z;
      row.group.position.z += speed * dt;
      const z = row.group.position.z;
      for (const obstacle of row.obstacles) {
        if (overlapsPlayer(player, obstacle, previousZ, z)) { this.onCrash(); return; }
      }
      for (let i=0;i<row.chips.length;i++) {
        const chip = row.chips[i];
        chip.rotation.y = elapsed * 2.5 + i;
        chip.position.y = chip.userData.baseY + Math.sin(elapsed * 3 + i) * .045;
        if (chip.visible && canCollect(player,chip.position.x,previousZ+chip.position.z,z+chip.position.z,chip.position.y,chip.userData.action)) {
          chip.visible = false; this.onCollect(chip.position.x, chip.position.y, z+chip.position.z);
        }
      }
      if (z > 12) { row.active = false; row.group.visible = false; }
    }
  }
}
