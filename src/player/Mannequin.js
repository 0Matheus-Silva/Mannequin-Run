import * as THREE from 'three';
export { Mannequin } from './CinematicMannequin.js';

// Visual adapter: the game uses only root/update(), allowing a future GLTF rig.
// Original procedural rig retained as a reference; the public adapter uses the new rig.
export class PrototypeMannequin {
  constructor() {
    this.root = new THREE.Group();
    this.body = new THREE.Group();
    this.root.add(this.body);
    this.metal = new THREE.MeshStandardMaterial({ color: 0x53626d, metalness: .85, roughness: .28 });
    this.dark = new THREE.MeshStandardMaterial({ color: 0x101b24, metalness: .75, roughness: .4 });
    this.glow = new THREE.MeshStandardMaterial({ color: 0x64fff2, emissive: 0x15e7eb, emissiveIntensity: 2.8 });
    this.sphere = new THREE.SphereGeometry(1, 20, 14);
    this.capsule = new THREE.CapsuleGeometry(1, 1, 5, 12);

    this.oval(this.body, this.metal, [0, 1.62, 0], [.39, .48, .23]);
    this.oval(this.body, this.dark, [0, 1.2, 0], [.29, .22, .21]);
    this.oval(this.body, this.dark, [0, 2.12, 0], [.1, .15, .1]);
    this.oval(this.body, this.metal, [0, 2.38, 0], [.235, .3, .23]);
    // Forward is -Z. Thin luminous visor and spinal circuit identify the unit.
    this.box(this.body, this.dark, [0, 2.4, -.207], [.38, .12, .08]);
    this.box(this.body, this.glow, [0, 2.415, -.253], [.31, .025, .025]);
    this.box(this.body, this.glow, [0, 1.66, -.226], [.035, .42, .025]);
    this.box(this.body, this.glow, [0, 1.65, .225], [.035, .54, .025]);
    for (let y = 1.4; y < 1.9; y += .12) {
      this.box(this.body, this.dark, [0, y, .23], [.22, .035, .03]);
    }
    this.arms = [-1, 1].map(side => this.limb(side, true));
    this.legs = [-1, 1].map(side => this.limb(side, false));
    this.time = 0;
  }

  oval(parent, material, position, scale) {
    const mesh = new THREE.Mesh(this.sphere, material);
    mesh.position.set(...position); mesh.scale.set(...scale);
    mesh.castShadow = true; mesh.receiveShadow = true; parent.add(mesh); return mesh;
  }

  box(parent, material, position, size) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), material);
    mesh.position.set(...position); parent.add(mesh); return mesh;
  }

  limb(side, arm) {
    const length = arm ? .43 : .5;
    const pivot = new THREE.Group();
    pivot.position.set(side * (arm ? .43 : .18), arm ? 1.95 : 1.12, 0);
    this.body.add(pivot);
    this.oval(pivot, this.dark, [0, 0, 0], [.12, .12, .12]);
    this.oval(pivot, this.glow, [side * .08, 0, 0], [.045, .075, .075]);
    const upper = new THREE.Mesh(this.capsule, this.metal);
    upper.scale.set(arm ? .105 : .14, length / 3, arm ? .105 : .14);
    upper.position.y = -length / 2; upper.castShadow = true; pivot.add(upper);
    const joint = new THREE.Group(); joint.position.y = -length; pivot.add(joint);
    this.oval(joint, this.dark, [0, 0, 0], [.1, .1, .1]);
    const lower = upper.clone(); lower.scale.x *= .8; lower.scale.z *= .8; joint.add(lower);
    this.box(joint, this.glow, [0, -length / 2, .105], [.025, length * .65, .018]);
    this.oval(joint, arm ? this.metal : this.dark, [0, -length, arm ? 0 : -.08], arm ? [.085, .12, .09] : [.13, .09, .24]);
    return { pivot, joint };
  }

  update(dt, running, motion = null, crashed = false) {
    this.time += dt;
    const t = this.time * (running ? 10 : 1.8);
    this.body.position.y = running ? .045 + Math.abs(Math.sin(t)) * .07 : Math.sin(t) * .025;
    this.body.rotation.x = running ? -.1 : 0;
    this.body.rotation.y = Math.sin(t) * (running ? .045 : .025);
    this.legs.forEach((leg, index) => {
      const phase = t + index * Math.PI;
      leg.pivot.rotation.x = running ? Math.sin(phase) * .65 : .025;
      leg.joint.rotation.x = running ? -.16 - Math.max(0, Math.cos(phase)) * .95 : -.06;
    });
    this.arms.forEach((arm, index) => {
      arm.pivot.rotation.x = running ? -Math.sin(t + index * Math.PI) * .65 : .08;
      arm.pivot.rotation.z = (index ? -1 : 1) * .09;
      arm.joint.rotation.x = running ? -.65 : -.16;
    });
    const slide = motion?.slideBlend ?? 0;
    this.body.scale.y = 1 - slide * .68;
    this.body.rotation.x += slide * .18;
    if (motion) {
      this.root.position.set(motion.x, motion.y, 0);
      this.body.rotation.z = (motion.lane * 2.7 - motion.x) * -.08;
      if (motion.y > .05) {
        this.legs[0].pivot.rotation.x = -.5;
        this.legs[1].pivot.rotation.x = .55;
        this.legs[0].joint.rotation.x = -.9;
        this.legs[1].joint.rotation.x = -.9;
      }
    }
    if (crashed) {
      this.body.rotation.z = -.65;
      this.body.rotation.x = -.45;
      this.body.position.y = -.15;
    }
  }
}
