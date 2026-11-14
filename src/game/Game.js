import * as THREE from 'three';
import { Mannequin } from '../player/Mannequin.js';
import { SectorWorld } from '../environments/SectorWorld.js';
import { sectorAt } from '../environments/Sectors.js';
import { PlayerController } from '../player/PlayerController.js';
import { Input } from './Input.js';
import { TrackObjects } from '../obstacles/TrackObjects.js';
import { Records, RunSession } from './RunSession.js';
import { AudioEngine } from '../audio/AudioEngine.js';
import { Effects } from '../world/Effects.js';
import { Settings } from '../utils/Settings.js';
import { StartSequence } from './StartSequence.js';
import { createStudioEnvironment,getSurfaces } from '../graphics/SurfaceLibrary.js';
import { CinematicRenderer } from '../graphics/CinematicRenderer.js';
import { Atmosphere } from '../environments/Atmosphere.js';
import { Passages } from '../environments/Passages.js';
import { storyComplete } from './Progression.js';
import { StoryFinale } from '../story/StoryFinale.js';
import { chapterById } from './Chapters.js';

export class Game {
  constructor(canvas, ui) {
    this.ui = ui;
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
    this.renderer.setSize(1920, 1080, false);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.08;
    this.renderPipeline=new CinematicRenderer(this.renderer);
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x07131d);
    this.scene.fog = new THREE.FogExp2(0x071923, .029);
    this.camera = new THREE.PerspectiveCamera(48, 16 / 9, .1, 180);
    this.camera.position.set(3.1, 2.7, 6.3);
    this.target = new THREE.Vector3(-2.1, 1.3, 0);
    this.environmentTarget=createStudioEnvironment(this.renderer);this.scene.environment=this.environmentTarget.texture;
    this.scene.environmentIntensity=.55;
    this.sequence=new StartSequence();this.resumeState='playing';
    const hemisphere = new THREE.HemisphereLight(0x8ec9df, 0x162333, 1.1);
    this.scene.add(hemisphere);
    const key = new THREE.DirectionalLight(0xc9e8f1, 2.8);
    key.position.set(-3, 7, 4); key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    Object.assign(key.shadow.camera, { left: -8, right: 8, top: 8, bottom: -8, far: 30 });
    key.shadow.bias = -.001;
    key.shadow.normalBias=.025;key.shadow.radius=3;
    this.scene.add(key);
    const rim = new THREE.PointLight(0x20eeed, 65, 18, 2);
    rim.position.set(2, 3, -4); this.scene.add(rim);
    const warm = new THREE.PointLight(0xf29c5b, 35, 16, 2);
    warm.position.set(-5, 2, -14); this.scene.add(warm);
    const portrait=new THREE.SpotLight(0xc4eafa,55,20,.55,.65,1.6);
    portrait.position.set(-2,4.5,4);portrait.target.position.set(0,1.5,0);this.scene.add(portrait,portrait.target);
    this.world = new SectorWorld(this.scene, hemisphere, rim);
    this.atmosphere=new Atmosphere(this.scene);this.atmosphere.update(0);
    this.passages=new Passages(this.scene,()=>this.audio?.effect('door'));
    this.finale=null;this.fallElapsed=0;
    this.sector = 0;
    this.player = new Mannequin(); this.scene.add(this.player.root);
    this.contactShadow=new THREE.Mesh(new THREE.PlaneGeometry(1.4,1.9),new THREE.MeshBasicMaterial({map:getSurfaces().glow,color:0x000207,transparent:true,opacity:.5,depthWrite:false}));
    this.contactShadow.rotation.x=-Math.PI/2;this.contactShadow.position.y=.025;this.scene.add(this.contactShadow);
    this.motion = new PlayerController();
    let storage;
    try { storage = localStorage; } catch { storage = null; }
    this.records = new Records(storage);
    this.settings = new Settings(storage);
    this.audio = new AudioEngine(); this.audio.setEnabled(this.settings.audio); this.audio.setVolume(this.settings.volume);
    this.audio.setMusicEnabled(this.settings.music);this.audio.setMusicVolume(this.settings.musicVolume);this.audio.setEffectsVolume(this.settings.effectsVolume);this.audio.selectTrack(this.settings.track);
    this.effects = new Effects(this.scene);
    this.session = new RunSession(this.records);
    this.track = new TrackObjects(this.scene, (x,y,z) => {
      this.session.collect();this.effects.burst(x,y,z);this.audio.effect('collect');this.ui.collect();
    }, () => this.crash());
    this.setQuality(this.settings.quality);
    this.input = new Input(action => this.action(action));
    this.desiredCamera = new THREE.Vector3(); this.desiredTarget = new THREE.Vector3();
    this.clock = new THREE.Clock();
    this.state = 'menu';
    this.elapsed = 0;
    canvas.addEventListener('webglcontextlost', event => {
      event.preventDefault(); this.renderer.setAnimationLoop(null);
      ui.error('A conexão com a GPU foi interrompida. Recarregue a página.');
    });
    document.addEventListener('visibilitychange', () => {
      // Never advance a simulation by the time spent in a background tab.
      this.clock.getDelta();
      if (document.hidden && ['playing','starting','ending','falling','victory'].includes(this.state)) this.pause();
    });
    window.addEventListener('blur', () => { if (['playing','starting','ending','falling','victory'].includes(this.state)) this.pause(); });
  }

  action(action) {
    if (document.querySelector('dialog[open]')) return;
    if (action === 'pause') {
      if (['playing','starting','ending','falling','victory'].includes(this.state)) this.pause();
      else if (this.state === 'paused') this.resume();
      return;
    }
    if (action === 'restart' && this.state === 'gameover') { this.startRun(); return; }
    if (this.state !== 'playing') return;
    if (action === 'left' || action === 'right') { this.motion.move(action === 'left' ? -1 : 1); this.audio.effect('move'); }
    if (action === 'jump' && this.motion.jump()) this.audio.effect('jump');
    if (action === 'slide' && this.motion.slide()) this.audio.effect('slide');
  }

  setQuality(quality) {
    const levels={eco:{scale:.65,shadows:false},standard:{scale:1,shadows:true},high:{scale:Math.min(devicePixelRatio,1.5),shadows:true}};
    const level=levels[quality]??levels.standard;
    this.renderer.setPixelRatio(level.scale);this.renderer.setSize(1920,1080,false);
    this.renderer.shadowMap.enabled=level.shadows;
    this.renderPipeline.setQuality(quality);
    this.world.setQuality(quality);
    this.scene.traverse(node=>{if(node.isMesh){const materials=Array.isArray(node.material)?node.material:[node.material];for(const material of materials)material.needsUpdate=true;}});
    this.settings.quality=quality in levels?quality:'standard';this.settings.save();
  }

  pause(){this.resumeState=this.state;this.setState('paused');}
  resume(){if(this.state==='paused'){this.clock.getDelta();this.setState(this.resumeState);}}

  beginRun(){
    if(this.state!=='menu')return;
    this.activeChapter='campaign';
    this.motion.reset();this.session.reset(this.settings.mode);this.world.mode=this.settings.mode;this.track.reset();this.effects.reset();this.passages.reset();
    this.sequence.begin(this.player.root.rotation.y,this.camera.position,this.target);
    this.audio.setSector(0,false);void this.audio.unlock();
    this.setState('starting');document.activeElement?.blur();
  }

  startRun(chapterId=this.activeChapter??'campaign') {
    const chapter=chapterById(this.settings.mode==='story'?chapterId:'campaign');this.activeChapter=chapter.id;
    this.motion.reset(); this.session.reset(this.settings.mode);this.world.mode=this.settings.mode; this.track.reset();this.finale?.reset();this.world.root.visible=true;this.passages.reset();this.fallElapsed=0;
    this.world.reset(); this.sector = 0; this.ui.sector(0, true);
    this.effects.reset();this.audio.setSector(0,false);void this.audio.unlock();
    this.player.root.rotation.y = 0;
    this.sequence.active=false;this.player.resetPose();
    this.setState('playing'); document.activeElement?.blur();
    if(chapter.id!=='campaign'){
      this.session.distance=chapter.distance;this.session.startDistance=chapter.distance;this.session.practice=true;
      this.world.segments.forEach((segment,i)=>this.world.replace(i,chapter.distance>=2400?1:sectorAt(chapter.distance-segment.position.z+8)));
      this.world.applyPalette(chapter.distance);this.atmosphere.update(chapter.distance,'story');this.passages.update(chapter.distance,'story');
      this.sector=sectorAt(chapter.distance);this.ui.sector(this.sector,true);this.audio.setSector(this.sector,false);
      this.camera.position.set(0,3.8,7);this.target.set(0,1.4,-7);this.camera.lookAt(this.target);
      if(chapter.endingTime!==undefined){this.startEnding();this.finale.seek(chapter.endingTime);}
      this.update();this.ui.status('TRECHO DO MODO HISTÓRIA / '+chapter.name);
    }
  }

  launchChapter(id){if(this.state!=='menu')return;this.chooseMode('story');const chapter=chapterById(id);if(chapter.id==='campaign')this.beginRun();else this.startRun(chapter.id);}

  crash() {
    if (this.state !== 'playing') return;
    this.session.finish();this.fallElapsed=0;this.player.impactTime=0;this.effects.burst(this.motion.x,1,0,true);this.audio.effect('crash');this.ui.hit();this.setState('falling');
  }

  chooseMode(mode){if(this.state!=='menu')return;this.activeChapter='campaign';this.settings.mode=mode==='story'?'story':'infinite';this.settings.save();this.ui.mode(this.settings.mode);}
  startEnding(){
    this.session.distance=2400;this.session.finish();this.track.reset();this.passages.reset();
    this.finale??=new StoryFinale(this);this.finale.start();this.setState('ending');
  }

  setState(state) {
    this.state = state;
    if (state === 'menu') { this.motion.reset(); this.track.reset(); this.effects.reset();this.world.reset();this.world.root.visible=true;this.atmosphere.update(0);this.passages.reset();this.finale?.reset();this.sector = 0; this.ui.sector(0, false);this.audio.setSector(0,false);this.sequence.active=false;this.player.resetPose();this.player.root.rotation.y=Math.atan2(-3.1,-6.3); }
    this.audio.setPlaying(state==='playing'||state==='ending'||state==='victory');
    if(state==='playing')void this.audio.unlock();
    this.track.root.visible = !['menu','starting','ending','victory'].includes(state)&&!(state==='paused'&&['ending','victory'].includes(this.resumeState));
    this.ui.setState(state, this.session);
  }

  start() {
    this.setState('menu');
    this.renderer.setAnimationLoop(() => this.update());
  }

  advance(dt) {
    if(this.state==='ending'||this.state==='victory'){this.finale.advance(dt);return;}
    if(this.state==='falling'){this.fallElapsed+=dt;if(this.fallElapsed>=1.5)this.setState('gameover');return;}
    if(this.state==='starting'){
      this.sequence.advance(dt);this.world.update(dt,12*this.sequence.launch,0);
      if(!this.sequence.active){this.setState('playing');this.ui.sector(0,true);}
      return;
    }
    if (this.state !== 'playing') return;
    while (dt > 1e-8 && this.state === 'playing') {
      const step = Math.min(dt, 1/120);
      this.motion.update(step); this.session.update(step);
      if(storyComplete(this.session.mode,this.session.distance)){this.startEnding();return;}
      this.world.update(step, this.session.speed, this.session.distance);
      this.passages.update(this.session.distance,this.session.mode);
      const sector = sectorAt(this.session.distance);
      if (sector !== this.sector) { this.sector = sector; this.ui.sector(sector, true);this.audio.setSector(sector); }
      this.track.update(step, this.session.speed, this.motion, this.session.time,this.session.distance);
      dt -= step;
    }
  }

  update() {
    const dt = Math.min(this.clock.getDelta(), .05);
    this.elapsed += dt;
    this.advance(dt);
    const menu = this.state === 'menu';
    const running = this.state === 'playing';
    const ending=['ending','victory'].includes(this.state)||(this.state==='paused'&&['ending','victory'].includes(this.resumeState));
    this.effects.update(this.state==='paused'?0:dt,running?this.session.speed:0);this.audio.update();
    const cinematic=this.state==='starting'||(this.state==='paused'&&this.resumeState==='starting');
    const animationDt=this.state==='paused'?0:dt;
    if (menu) this.world.update(dt, 0);
    if(!ending)this.audio.setCeremonyDucking(null);
    if(!ending)this.atmosphere.update(menu?0:this.session.distance,this.session.mode);
    const blend = 1 - Math.exp(-dt * 3);
    this.desiredCamera.set(menu ? 3.1 : this.motion.x * .12, menu ? 2.7 : 3.8, menu ? 6.3 : 7);
    this.desiredTarget.set(menu ? -2.1 : this.motion.x * .17, menu ? 1.3 : 1.4, menu ? 0 : -7);
    if(cinematic){
      this.camera.position.lerpVectors(this.sequence.fromCamera,this.desiredCamera,this.sequence.cameraBlend);
      this.target.lerpVectors(this.sequence.fromTarget,this.desiredTarget,this.sequence.cameraBlend);
      this.player.root.rotation.y=this.sequence.yaw;
    }else{
      this.camera.position.lerp(this.desiredCamera,blend);this.target.lerp(this.desiredTarget,blend);
      this.player.root.rotation.y=menu?Math.atan2(-this.camera.position.x,-this.camera.position.z):0;
    }
    this.camera.lookAt(this.target);
    const desiredFov=this.passages.state?.visible&&!menu?50:48;
    const fov=THREE.MathUtils.damp(this.camera.fov,desiredFov,3,dt);if(Math.abs(fov-this.camera.fov)>.005){this.camera.fov=fov;this.camera.updateProjectionMatrix();}
    this.player.update(animationDt,ending?this.finale.walking:running||(!menu&&!cinematic),this.motion,['falling','gameover'].includes(this.state)||(this.state==='paused'&&this.resumeState==='falling'),{transition:cinematic?this.sequence:null,cameraPosition:this.camera.position,speed:this.session.speed});
    if(ending)this.finale.present(animationDt);
    else if(this.session.mode==='story'&&this.session.distance>=2220&&['playing','paused','falling','gameover'].includes(this.state)){this.finale??=new StoryFinale(this);this.finale.preview(this.session.distance);}
    this.contactShadow.position.set(this.player.root.position.x,ending?this.player.root.position.y+.025:.025,this.player.root.position.z);this.contactShadow.material.opacity=.5/(1+this.motion.y);this.contactShadow.scale.setScalar(1+this.motion.y*.2);
    this.ui.update(this.session);
    this.render();
  }
  render(){this.renderPipeline.render(this.scene,this.camera);}
}
