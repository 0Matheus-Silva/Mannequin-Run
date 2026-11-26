import * as THREE from 'three';
import { Mannequin } from '../player/Mannequin.js';
import { SuspensionCables } from '../player/SuspensionCables.js';
import { SectorWorld } from '../environments/SectorWorld.js';
import { sectorAt } from '../environments/Sectors.js';
import { withLeftTurn } from '../environments/LeftTurn.js';
import { bridgeHeight } from '../environments/BridgeProfile.js';
import { PlayerController } from '../player/PlayerController.js';
import { Input } from './Input.js';
import { SwipeInput } from './SwipeInput.js';
import { TrackObjects } from '../obstacles/TrackObjects.js';
import { ElevatedRoute,routeHeight,crossesEntrance,routeSpawnAllowed } from '../environments/ElevatedRoute.js';
import { arrivalFogOpacity } from '../story/ArrivalFog.js';
import { fatalCollision } from '../obstacles/Collision.js';
import { Records, RunSession } from './RunSession.js';
import { AudioEngine } from '../audio/AudioEngine.js';
import { Effects } from '../world/Effects.js';
import { Settings } from '../utils/Settings.js';
import { StartSequence } from './StartSequence.js';
import { createStudioEnvironment,getSurfaces } from '../graphics/SurfaceLibrary.js';
import { CinematicRenderer } from '../graphics/CinematicRenderer.js';
import { Atmosphere } from '../environments/Atmosphere.js';
import { Passages } from '../environments/Passages.js';
import { RescueEncounter } from './RescueEncounter.js';
import { storyComplete } from './Progression.js';
import { StoryFinale } from '../story/StoryFinale.js';
import { chapterById } from './Chapters.js';
import { GamepadInput,menuControl } from './GamepadInput.js';
import { GamepadCursor } from './GamepadCursor.js';

export class Game {
  constructor(canvas, ui) {
    this.ui = ui;
    this.events=new EventTarget();
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
    this.elevatedRoute=new ElevatedRoute(this.scene);
    this.atmosphere=new Atmosphere(this.scene);this.atmosphere.update(0);
    this.passages=new Passages(this.scene,()=>this.audio?.effect('door'));
    this.finale=null;this.fallElapsed=0;this.rescue=new RescueEncounter(this.scene);
    this.sector = 0;
    this.player = new Mannequin(); this.scene.add(this.player.root);this.cables=new SuspensionCables(this.scene,this.player);
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
      this.session.collect();if(this.session.mode==='story')this.rescue.collect(this.session.distance,x,y);this.effects.burst(x,y,z);this.audio.effect('collect');this.ui.collect();
    }, type => this.hitObstacle(type),()=>this.audio.playNexusCue('quase'));
    this.setQuality(this.settings.quality);
    this.input = new Input(action => this.action(action));
    this.swipes=new SwipeInput(document.querySelector('#stage'),action=>this.action(action),{enabled:()=>this.state==='playing'&&!document.querySelector('dialog[open]')});
    this.menuCursor=new GamepadCursor(this);
    this.gamepad=new GamepadInput(action=>this.action(action),{isPlaying:()=>this.state==='playing'&&!document.querySelector('dialog[open]')&&!document.activeElement?.closest?.('#assistant-panel input'),onPointer:(pad,mapping)=>this.menuCursor.update(pad,mapping),onMenu:key=>{if(!this.menuCursor.handle(key)){menuControl(this,key);if(['left','right','up','down'].includes(key))this.menuCursor.snapToFocus();}},onStatus:text=>{const node=document.querySelector('#gamepad-status');if(node)node.textContent=text;}});
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
    this.renderer.setPixelRatio(this.ui.mobile?Math.min(level.scale,1):level.scale);this.resizeView(false);
    this.renderer.shadowMap.enabled=level.shadows;
    this.renderPipeline.setQuality(quality);
    this.world.setQuality(quality);
    this.scene.traverse(node=>{if(node.isMesh){const materials=Array.isArray(node.material)?node.material:[node.material];for(const material of materials)material.needsUpdate=true;}});
    this.settings.quality=quality in levels?quality:'standard';this.settings.save();
  }

  resizeView(refresh=true){
    const mobile=this.ui.mobile,viewport=document.querySelector('#viewport'),width=mobile?Math.max(1,viewport.clientWidth):1920,height=mobile?Math.max(1,viewport.clientHeight):1080;
    this.renderer.setSize(width,height,false);this.camera.aspect=width/height;
    this.camera.fov=mobile?THREE.MathUtils.radToDeg(2*Math.atan(Math.tan(THREE.MathUtils.degToRad(24))*Math.max(1,1.15/this.camera.aspect))):48;
    this.camera.updateProjectionMatrix();
    if(refresh)this.renderPipeline.setQuality(this.settings.quality);
  }

  pause(){this.resumeState=this.state;this.setState('paused');}
  resume(){if(this.state==='paused'){this.clock.getDelta();this.setState(this.resumeState);}}

  beginRun(){
    if(this.state!=='menu')return;
    this.activeChapter='campaign';this.lastStumble=-Infinity;this.fallCause=null;this.rescueVoicePlayed=false;this.rescuePiecesVoicePlayed=false;this.rescueNarrative=null;this.rescueVoiceEpoch=(this.rescueVoiceEpoch??0)+1;
    this.audio.resetNexusQueue();this.audio.resetNexusHistory();this.chasmJumpActive=false;this.premonitionPlayed=false;this.motion.reset();this.session.reset(this.settings.mode);this.rescue.reset();this.world.mode=this.settings.mode;this.track.reset();this.effects.reset();this.passages.reset();
    this.sequence.begin(this.player.root.rotation.y,this.camera.position,this.target);
    this.audio.setSector(0,false);void this.audio.unlock();
    this.setState('starting');document.activeElement?.blur();
    this.events.dispatchEvent(new CustomEvent('runstart'));
  }

  startRun(chapterId=this.activeChapter??'campaign',checkpoint=null) {
    this.lastStumble=-Infinity;this.fallCause=null;this.rescueVoicePlayed=false;this.rescuePiecesVoicePlayed=false;this.rescueNarrative=null;
    this.events.dispatchEvent(new CustomEvent('beforerunreset'));
    const chapter=chapterById(this.settings.mode==='story'?chapterId:'campaign');this.activeChapter=chapter.id;
    this.audio.resetNexusQueue();this.audio.resetNexusHistory();this.chasmJumpActive=false;this.motion.reset(); this.session.reset(this.settings.mode);this.rescue.reset(chapter.distance);this.world.mode=this.settings.mode; this.track.reset();this.finale?.reset();this.world.root.visible=true;this.passages.reset();this.fallElapsed=0;
    this.world.reset(); this.sector = 0; this.ui.sector(0, true);
    this.effects.reset();this.audio.setSector(0,false);void this.audio.unlock();
    this.player.root.rotation.y = 0;
    this.sequence.active=false;this.player.resetPose();
    this.setState('playing'); document.activeElement?.blur();
    if(chapter.id!=='campaign'){
      this.session.distance=chapter.distance;this.session.startDistance=chapter.distance;this.session.practice=true;
      this.world.segments.forEach((segment,i)=>{const absolute=chapter.distance-segment.position.z+8;this.world.replace(i,this.settings.mode==='story'&&chapter.distance<3000&&absolute>=3000?4:this.world.sectorFor(absolute));});
      this.world.applyPalette(chapter.distance);this.atmosphere.update(chapter.distance,'story');this.passages.update(chapter.distance,'story');
      this.sector=sectorAt(chapter.distance);this.ui.sector(this.sector,true);this.audio.setSector(this.sector,false);
      this.camera.position.set(0,3.8,7);this.target.set(0,1.4,-7);this.camera.lookAt(this.target);
      const chapterVoice=chapter.id==='machines'?this.nextBridgeVoice():{city:'nexus-setor-2',industry:'nexus-setor-3',contamination:'nexus-setor-4',arrival:'nexus-premonicao'}[chapter.id];
      if(chapterVoice&&this.audio.enabled)void this.audio.unlock().then(ok=>{if(ok&&this.state==='playing'&&this.activeChapter===chapter.id)this.audio.queueNexusLine(chapterVoice);});
      if(chapter.endingTime!==undefined){this.startEnding();this.finale.seek(chapter.endingTime);}
      this.update();this.ui.status('TRECHO DO MODO HISTÓRIA / '+chapter.name);
    }
    if(checkpoint){this.session.distance=Number(checkpoint.distance);this.session.items=Number(checkpoint.items);this.session.time=Number(checkpoint.duration);this.session.startDistance=0;this.session.practice=false;this.session.resumed=true;this.rescue.reset(this.session.distance);this.ui.status('CAMPANHA RETOMADA DO CHECKPOINT');}
    this.events.dispatchEvent(new CustomEvent('runstart'));
  }

  launchChapter(id){if(this.state!=='menu')return;this.chooseMode('story');const chapter=chapterById(id);if(chapter.id==='campaign')this.beginRun();else this.startRun(chapter.id);}

  nextBridgeVoice(){return 'nexus-ponte-2';}

  updateRescueNarrative(){
    if(this.session.mode!=='story'||!this.rescue.state.completed)return true;
    const n=this.rescueNarrative??=( {started:this.session.time,stage:0} );
    const audio=this.audio,available=audio.enabled&&audio.context?.state==='running';
    if(n.stage===0&&this.session.time-n.started>=4){if(!available||audio.nexusMayPlay?.('nexus-ponte-1')===false||audio.queueNexusLine('nexus-ponte-1'))n.stage=1;}
    const ready=()=>!audio.nexusQueue?.length&&audio.context.currentTime>=(audio.nexusVoiceUntil??0)+1;
    if(n.stage===1&&this.session.time-n.started>=8&&(!available||ready())){if(!available||audio.nexusMayPlay?.('nexus-premonicao')===false||audio.queueNexusLine('nexus-premonicao'))n.stage=2;}
    if(n.stage===2&&this.session.time-n.started>=12&&(!available||(!audio.nexusQueue?.length&&audio.context.currentTime>=(audio.nexusVoiceUntil??0)-3)))n.stage=3;
    return n.stage===3;
  }

  crash(cause='obstacle') {
    if (this.state !== 'playing') return;
    if(cause==='chasm')this.audio.playNexusCue('cratera');
    else {this.audio.resetNexusQueue();const choices=['nexus-derrota-1','nexus-derrota-1','nexus-derrota-1','nexus-derrota-matheus','nexus-derrota-pedro','nexus-derrota-vitor'];this.audio.queueNexusLine(choices[Math.floor(Math.random()*choices.length)]);}
    this.fallCause=cause;this.session.finish();this.fallElapsed=0;this.player.impactTime=0;if(cause!=='chasm'){this.effects.burst(this.motion.x,1,0,true);this.audio.effect('crash');this.ui.hit();}this.setState('falling');
    this.events.dispatchEvent(new CustomEvent('runfinish',{detail:{result:'crashed'}}));
  }

  hitObstacle(type){
    if(fatalCollision(type,this.session.time,this.lastStumble??-Infinity)){this.crash();return true;}
    this.audio.playNexusCue('tropeco');this.lastStumble=this.session.time;this.ui.hit();this.effects.burst(this.motion.x,.5,0,true);this.audio.effect('crash');return false;
  }

  chooseMode(mode){if(this.state!=='menu')return;this.activeChapter='campaign';this.settings.mode=mode==='story'?'story':'infinite';this.settings.save();this.ui.mode(this.settings.mode);}
  startEnding(){
    this.rescue.root.visible=false;this.rescue.hud.hidden=true;this.session.distance=3000;this.session.finish();this.track.reset();this.passages.reset();
    this.events.dispatchEvent(new CustomEvent('runfinish',{detail:{result:'completed'}}));
    this.finale??=new StoryFinale(this);this.finale.start();this.setState('ending');
  }

  setState(state) {
    this.state = state;
    if (state === 'menu') { this.rescue.reset();this.motion.reset(); this.track.reset(); this.effects.reset();this.world.reset();this.world.root.visible=true;this.atmosphere.update(0);this.passages.reset();this.finale?.reset();this.sector = 0; this.ui.sector(0, false);this.audio.setSector(0,false);this.sequence.active=false;this.player.resetPose();this.player.root.rotation.y=Math.atan2(-3.1,-6.3); }
    this.audio.setPlaying(state==='playing'||state==='ending'||state==='victory');
    if(state==='playing')void this.audio.unlock();
    this.track.root.visible = !['menu','starting','ending','victory'].includes(state)&&!(state==='paused'&&['ending','victory'].includes(this.resumeState));
    this.ui.setState(state, this.session);
    this.events.dispatchEvent(new CustomEvent('statechange',{detail:{state}}));
  }

  start() {
    this.setState('menu');
    this.renderer.setAnimationLoop(() => this.update());
    const prepareFinale=()=>{if(!this.finale)this.finale=new StoryFinale(this);};
    if(globalThis.requestIdleCallback)requestIdleCallback(prepareFinale,{timeout:3000});else setTimeout(prepareFinale,500);
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
      const beforeDistance=this.session.distance;
      this.motion.update(step); this.session.update(step);
      const cycleBefore=((beforeDistance%3000)+3000)%3000,cycleAfter=((this.session.distance%3000)+3000)%3000;
      if(cycleBefore<1400&&cycleAfter>=1400)this.ui.status('ESTRADA ELEVADA À FRENTE');
      if(crossesEntrance(beforeDistance,this.session.distance))this.ui.status('ESTRADA ELEVADA · CONTINUE A CORRIDA');
      if(this.session.mode==='story'&&!this.session.practice)for(const distance of [600,1200,1800,2300,2400])if(beforeDistance<distance&&this.session.distance>=distance)this.events.dispatchEvent(new CustomEvent('checkpoint',{detail:{distance}}));
      if(this.session.mode==='story'&&this.session.distance>=2990&&(!this.rescue.state.completed||!this.updateRescueNarrative())){this.session.distance=2990;if(!this.rescue.state.completed)this.ui.status('PEGUE COMPONENTES PARA AJUDAR O SERVIDOR');}
      if(storyComplete(this.session.mode,this.session.distance)){this.startEnding();return;}
      if(this.rescue.update(step,this.session.distance,this.session.mode))this.audio.effect('collect');
      if(this.rescue.state.completed)this.updateRescueNarrative();
      if(this.session.mode==='story'&&!this.rescuePiecesVoicePlayed&&this.rescue.state.hits>=4&&!this.rescue.state.completed&&this.audio.playNexusReaction('nexus-servidor-pecas'))this.rescuePiecesVoicePlayed=true;
      this.world.update(step, this.session.speed, this.session.distance);
      this.elevatedRoute.update(this.session.distance);
      this.passages.update(this.session.distance,this.session.mode);
      const sector = sectorAt(this.session.distance);
      if (sector !== this.sector) { this.sector = sector; this.ui.sector(sector, true);this.audio.setSector(sector);if(sector>0)this.audio.queueNexusLine(sector===4?this.nextBridgeVoice():'nexus-setor-'+(sector+1)); }
      const overChasm=this.world.chasmAt(this.motion.x),grounded=this.motion.y<=.01&&this.motion.velocityY<=0;
      if(overChasm&&!grounded)this.chasmJumpActive=true;
      if(grounded&&this.chasmJumpActive){if(!overChasm)this.audio.queueNexusLine('nexus-lava');this.chasmJumpActive=false;}
      if(grounded&&overChasm){this.crash('chasm');return;}
      this.track.update(step, this.session.speed, this.motion, this.session.time,this.session.distance,z=>({allowed:routeSpawnAllowed(this.session.distance-z)&&!this.rescue.entryProtected(this.session.distance-z,this.session.mode),sides:this.world.chasmSidesNear(z)}),d=>routeHeight(d)+bridgeHeight(d),this.session.mode);
      dt -= step;
    }
  }

  update() {
    this.gamepad?.poll();
    const dt = Math.min(this.clock.getDelta(), .05);
    this.elapsed += dt;
    this.advance(dt);
    const menu = this.state === 'menu';
    const running = this.state === 'playing';
    const ending=['ending','victory'].includes(this.state)||(this.state==='paused'&&['ending','victory'].includes(this.resumeState));
    const elevation=menu||ending?0:routeHeight(this.session.distance)+bridgeHeight(this.session.distance);
    this.elevatedRoute.update(menu?0:this.session.distance);if(ending)this.elevatedRoute.root.visible=false;
    this.effects.update(this.state==='paused'?0:dt,running?this.session.speed:0);this.audio.update();
    const cinematic=this.state==='starting'||(this.state==='paused'&&this.resumeState==='starting');
    const animationDt=this.state==='paused'?0:dt;
    if (menu) this.world.update(dt, 0);
    if(!ending)this.audio.setCeremonyDucking(null);
    if(!ending)this.atmosphere.update(menu?0:this.session.distance,this.session.mode);
    const blend = 1 - Math.exp(-dt * 3);
    this.desiredCamera.set(menu ? 3.1 : this.motion.x * .12, menu ? 2.7 : 3.8+elevation, menu ? 6.3 : 7);
    this.desiredTarget.set(menu ? -2.1 : this.motion.x * .17, menu ? 1.3 : 1.4+elevation, menu ? 0 : -7);
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
    const chasmFall=this.fallCause==='chasm'&&(['falling','gameover'].includes(this.state)||(this.state==='paused'&&this.resumeState==='falling'));
    this.player.update(animationDt,chasmFall?false:ending?this.finale.walking:running||(!menu&&!cinematic),this.motion,!chasmFall&&(['falling','gameover'].includes(this.state)||(this.state==='paused'&&this.resumeState==='falling')),{transition:cinematic?this.sequence:null,cameraPosition:this.camera.position,speed:this.session.speed});
    this.player.root.position.y+=elevation;
    if(menu||cinematic)this.player.root.position.y+=.20*(cinematic?1-THREE.MathUtils.smoothstep(this.sequence.elapsed,.15,1.25):1);
    this.cables.update(menu?'menu':cinematic?(this.state==='paused'?'paused-starting':'starting'):'hidden',this.sequence.elapsed);
    const stumbleAge=this.session.time-(this.lastStumble??-Infinity);
    this.player.root.visible=!(running&&stumbleAge<3&&Math.floor(stumbleAge*8)%2===1);
    if(running&&stumbleAge>=0&&stumbleAge<.55){const impact=Math.sin(Math.PI*stumbleAge/.55);this.player.body.rotation.x-=impact*.35;this.player.body.rotation.z+=impact*.16;}
    if(chasmFall){this.player.root.position.y-=Math.min(12,this.fallElapsed*this.fallElapsed*9);this.player.body.rotation.x=-.18;this.player.arms.forEach((arm,i)=>{arm.pivot.rotation.z=(i?1:-1)*.55;arm.pivot.rotation.x=-.35;});}
    if(ending)this.finale.present(animationDt);
    const fogState=this.state==='paused'?this.resumeState:this.state;
    const turnDistance=((this.session.distance%3000)+3000)%3000;
    const showRescueNotice=this.session.mode==='story'&&running&&turnDistance>=2310&&turnDistance<2420;
    document.querySelector('#rescue-instruction').hidden=true;
    if(showRescueNotice&&!this.rescueVoicePlayed){
      this.rescueVoicePlayed=true;const epoch=this.rescueVoiceEpoch;
      if(this.audio.context&&this.audio.enabled)setTimeout(()=>{if(this.state==='playing'&&this.rescueVoiceEpoch===epoch&&this.session.distance<2470)void this.audio.loadAwardSounds().then(()=>{if(this.state==='playing'&&this.rescueVoiceEpoch===epoch&&this.session.distance<2470)this.audio.queueNexusLine('nexus-servidor');});},650);
    }
    document.querySelector('#arrival-fog').style.opacity=arrivalFogOpacity(this.session.mode,fogState,this.session.distance,this.finale?.elapsed??0,this.rescue.state.completed&&this.rescueNarrative?.stage===3);
    this.contactShadow.position.set(this.player.root.position.x,ending?this.player.root.position.y+.025:elevation+.025,this.player.root.position.z);this.contactShadow.material.opacity=.5/(1+this.motion.y);this.contactShadow.scale.setScalar(1+this.motion.y*.2);
    this.contactShadow.visible=!(this.fallCause==='chasm'&&['falling','gameover'].includes(this.state));
    this.ui.update(this.session);
    this.render();
  }
  render(){withLeftTurn(this,()=>this.renderPipeline.render(this.scene,this.camera));}
}
