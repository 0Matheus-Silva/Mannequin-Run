import { MUSIC_TRACKS } from './MusicLibrary.js';
const PRESETS = [
  { bass:55, filter:800, notes:[220,277.18,329.63,415.3], noise:.02 },
  { bass:43.65, filter:420, notes:[174.61,207.65,261.63,311.13], noise:.055 },
  { bass:51.91, filter:1100, notes:[207.65,246.94,311.13,369.99], noise:.035 },
  { bass:49, filter:560, notes:[196,233.08,293.66,349.23], noise:.045 },
];

// All audio assets and synthesis are local. Context creation requires a gesture.
export class AudioEngine {
  constructor() {
    this.context = null; this.enabled = true; this.volume = .65;
    this.sector = 0; this.playing = false; this.voices = new Set(); this.beat = 0;
    this.musicEnabled=true;this.externalMusicPlaying=false;this.musicVolume=.6;this.effectsVolume=.85;this.track='afterglow';this.localTracks=[];this.localAudio=null;this.awardBuffers=new Map();this.musicDuck=1;
  }

  async unlock() {
    if (!this.enabled) return false;
    try {
      if (!this.context) this.initialize();
      if (this.context.state === 'suspended') await this.context.resume();
      await this.loadAwardSounds();
      this.syncLocal();
      return this.context.state === 'running';
    } catch { return false; }
  }

  initialize() {
    const Context = window.AudioContext || window.webkitAudioContext;
    if (!Context) throw Error('Web Audio indisponível');
    const ctx = this.context = new Context();
    this.master = ctx.createGain(); this.master.gain.value = this.enabled ? this.volume : 0;
    this.effectsBus=ctx.createGain();this.effectsBus.gain.value=this.effectsVolume;this.effectsBus.connect(this.master);
    this.musicBus=ctx.createGain();this.musicBus.gain.value=this.musicEnabled&&!this.externalMusicPlaying?this.musicVolume:0;this.musicBus.connect(this.master);
    const compressor = ctx.createDynamicsCompressor();
    this.master.connect(compressor); compressor.connect(ctx.destination);
    this.ambient = ctx.createGain(); this.ambient.gain.value = .1; this.ambient.connect(this.effectsBus);
    this.filter = ctx.createBiquadFilter(); this.filter.type = 'lowpass'; this.filter.frequency.value = 800; this.filter.connect(this.ambient);
    this.drones = [1,1.503].map(ratio => {
      const oscillator = ctx.createOscillator(); oscillator.type = 'triangle'; oscillator.frequency.value = 55 * ratio;
      const gain=ctx.createGain();gain.gain.value=.14;oscillator.connect(gain);gain.connect(this.filter);oscillator.start();
      return oscillator;
    });
    const buffer=ctx.createBuffer(1,ctx.sampleRate*2,ctx.sampleRate);const data=buffer.getChannelData(0);
    let previous=0;
    for(let i=0;i<data.length;i++){previous=(previous+(Math.random()*2-1)*.025)/1.025;data[i]=previous*3;}
    this.noise=ctx.createBufferSource();this.noise.buffer=buffer;this.noise.loop=true;
    this.noiseGain=ctx.createGain();this.noiseGain.gain.value=.02;this.noise.connect(this.noiseGain);this.noiseGain.connect(this.filter);this.noise.start();
    this.nextBeat=ctx.currentTime+.2;this.setSector(this.sector,false);this.setPlaying(this.playing);
  }

  setEnabled(enabled) {
    this.enabled=enabled;
    if(this.context)this.master.gain.setTargetAtTime(enabled?this.volume:0,this.context.currentTime,.06);
    this.syncLocal();
  }
  setVolume(volume) {
    this.volume=Math.max(0,Math.min(1,volume));
    if(this.context)this.master.gain.setTargetAtTime(this.enabled?this.volume:0,this.context.currentTime,.05);
  }
  setPlaying(playing) {
    this.playing=playing;
    if(this.context)this.ambient.gain.setTargetAtTime(playing?.85:.13,this.context.currentTime,.4);
    this.syncLocal();
  }
  async loadAwardSounds(){
    if(this.awardLoading)return this.awardLoading;
    this.awardLoading=Promise.allSettled(['explosion','chest-tongue','victory'].map(async name=>{const response=await fetch(new URL('../../assets/audio/ceremony/'+name+'.wav',import.meta.url));if(!response.ok)throw Error('Local audio unavailable');const buffer=await this.context.decodeAudioData(await response.arrayBuffer());this.awardBuffers.set(name,buffer);}));
    return this.awardLoading;
  }
  awardClip(name,volume=1){
    const ctx=this.context,buffer=this.awardBuffers.get(name);if(!ctx||!buffer||!this.enabled||ctx.state!=='running'||this.voices.size>=12)return false;
    const source=ctx.createBufferSource(),gain=ctx.createGain();source.buffer=buffer;gain.gain.value=volume;source.connect(gain);gain.connect(this.effectsBus);this.voices.add(source);source.onended=()=>{source.disconnect();gain.disconnect();this.voices.delete(source);};source.start();return true;
  }
  setCeremonyDucking(time){
    const duck=time!==null&&time>=27.65&&time<31.2?.24:time!==null&&time>=25.5&&time<26.7?.5:1;
    if(duck===this.musicDuck)return;this.musicDuck=duck;
    if(this.context)this.musicBus.gain.setTargetAtTime(this.musicEnabled&&!this.externalMusicPlaying?this.musicVolume*duck:0,this.context.currentTime,.08);
  }
  setSector(sector,announce=true) {
    this.sector=sector;const preset=PRESETS[sector];if(!this.context)return;
    const t=this.context.currentTime;
    this.drones.forEach((osc,i)=>osc.frequency.setTargetAtTime(preset.bass*(i?1.503:1),t,1.5));
    this.filter.frequency.setTargetAtTime(preset.filter,t,1.5);this.noiseGain.gain.setTargetAtTime(preset.noise,t,1.5);
    if(announce)this.tone(130,520,.7,.12,'sine');
  }
  tone(from,to,duration,volume=.1,type='sine',delay=0,bus='effects') {
    const ctx=this.context;if(!ctx||!this.enabled||ctx.state!=='running'||this.voices.size>=12)return;
    const oscillator=ctx.createOscillator();const gain=ctx.createGain();const t=ctx.currentTime+delay;
    oscillator.type=type;oscillator.frequency.setValueAtTime(from,t);oscillator.frequency.exponentialRampToValueAtTime(Math.max(20,to),t+duration);
    gain.gain.setValueAtTime(.0001,t);gain.gain.exponentialRampToValueAtTime(volume,t+.015);gain.gain.exponentialRampToValueAtTime(.0001,t+duration);
    oscillator.connect(gain);gain.connect(bus==='music'?this.musicBus:this.effectsBus);this.voices.add(oscillator);
    oscillator.onended=()=>{oscillator.disconnect();gain.disconnect();this.voices.delete(oscillator);};
    oscillator.start(t);oscillator.stop(t+duration+.02);
  }
  effect(name,intensity=1) {
    if(name==='plasma-burst'&&this.awardClip('explosion',.9))return;
    if(name==='tongue-yelp'&&this.awardClip('chest-tongue',1))return;
    if(name==='victory'){if(!this.awardClip('victory',.8)){this.tone(523,784,.7,.12,'triangle');this.tone(784,1046,.9,.1,'sine',.2);}return;}
    if(name==='plasma-charge'||name==='plasma-burst'){
      const ctx=this.context;if(!ctx||ctx.state!=='running'||!this.enabled||this.voices.size>=12)return;
      const burst=name==='plasma-burst',duration=burst?.65:.28,source=ctx.createBufferSource(),gain=ctx.createGain(),filter=ctx.createBiquadFilter(),t=ctx.currentTime;
      const buffer=ctx.createBuffer(1,Math.ceil(ctx.sampleRate*duration),ctx.sampleRate),data=buffer.getChannelData(0);
      for(let i=0;i<data.length;i++)data[i]=(Math.random()*2-1)*(burst?1:(.6+.4*Math.sin(i*.17)));
      source.buffer=buffer;filter.type=burst?'lowpass':'bandpass';filter.frequency.value=burst?1500:2100;filter.Q.value=burst?.7:3;
      gain.gain.setValueAtTime(.0001,t);gain.gain.exponentialRampToValueAtTime(burst?.2:.015+.03*Math.max(0,Math.min(1,intensity)),t+.015);gain.gain.exponentialRampToValueAtTime(.0001,t+duration);
      source.connect(filter);filter.connect(gain);gain.connect(this.effectsBus);this.voices.add(source);source.onended=()=>{source.disconnect();filter.disconnect();gain.disconnect();this.voices.delete(source);};source.start();source.stop(t+duration);
      this.tone(burst?95:920,burst?25:1800,duration,burst?.12:.018,burst?'triangle':'sawtooth');
    }
    if(name==='tongue-yelp'){this.tone(380,920,.13,.065,'triangle');this.tone(920,310,.25,.05,'triangle',.12);}
    if(name==='collect'){this.tone(660,990,.12,.1);this.tone(990,1320,.16,.07,'sine',.07);}
    if(name==='jump')this.tone(160,440,.2,.12,'triangle');
    if(name==='slide')this.tone(220,55,.28,.1,'sawtooth');
    if(name==='move')this.tone(110,180,.09,.065,'triangle');
    if(name==='crash'){this.tone(150,25,.65,.3,'sawtooth');this.tone(90,28,.8,.19,'triangle');}
    if(name==='door'){this.tone(65,160,.9,.13,'sawtooth');this.tone(330,220,.35,.07,'triangle',.3);}
    if(name==='applause'){
      const ctx=this.context;if(!ctx||ctx.state!=='running'||!this.enabled)return;
      for(let i=0;i<8&&this.voices.size<12;i++){
        const source=ctx.createBufferSource(),gain=ctx.createGain(),t=ctx.currentTime+i*.12;source.buffer=this.noise.buffer;gain.gain.setValueAtTime(.0001,t);gain.gain.exponentialRampToValueAtTime(.35,t+.01);gain.gain.exponentialRampToValueAtTime(.0001,t+.11);source.connect(gain);gain.connect(this.effectsBus);this.voices.add(source);source.onended=()=>{source.disconnect();gain.disconnect();this.voices.delete(source);};source.start(t);source.stop(t+.12);
      }
    }
  }
  update() {
    const ctx=this.context;if(!ctx||!this.enabled||!this.playing||ctx.state!=='running')return;
    if(ctx.currentTime>=this.nextBeat&&this.musicEnabled&&!this.externalMusicPlaying&&!this.localAudio){
      const track=MUSIC_TRACKS.find(t=>t.id===this.track)??MUSIC_TRACKS[0];const note=track.notes[this.beat++%track.notes.length];
      this.tone(note,note*.999,1.1,.085,'sine',0,'music');this.tone(note*2,note*2,.7,.016,'triangle',.06,'music');
      if(this.beat%4===0)this.tone(note*.5,note*.5,1.8,.06,'triangle',0,'music');
      this.nextBeat=ctx.currentTime+track.tempo*(1-this.sector*.04);
    }
  }
  setMusicEnabled(value){this.musicEnabled=!!value;if(this.context)this.musicBus.gain.setTargetAtTime(value&&!this.externalMusicPlaying?this.musicVolume*this.musicDuck:0,this.context.currentTime,.08);this.syncLocal();}
  setMusicVolume(value){this.musicVolume=Math.max(0,Math.min(1,value));if(this.context)this.musicBus.gain.setTargetAtTime(this.musicEnabled&&!this.externalMusicPlaying?this.musicVolume*this.musicDuck:0,this.context.currentTime,.05);}
  setExternalMusicPlaying(value){this.externalMusicPlaying=!!value;if(this.context)this.musicBus.gain.setTargetAtTime(this.musicEnabled&&!this.externalMusicPlaying?this.musicVolume*this.musicDuck:0,this.context.currentTime,.08);this.syncLocal();}
  setEffectsVolume(value){this.effectsVolume=Math.max(0,Math.min(1,value));if(this.context)this.effectsBus.gain.setTargetAtTime(this.effectsVolume,this.context.currentTime,.05);}
  selectTrack(id){
    const local=this.localTracks.find(t=>t.id===id);if(!local&&!MUSIC_TRACKS.some(t=>t.id===id))return false;
    if(this.localAudio){this.localAudio.pause();this.localSource?.disconnect();this.localAudio=null;this.localSource=null;}
    this.track=id;this.beat=0;if(this.context)this.nextBeat=this.context.currentTime+.1;
    if(local){this.localAudio=new Audio(local.url);this.localAudio.loop=true;}
    this.syncLocal();return true;
  }
  addLocalFiles(files){
    const added=[];for(const file of files){if(!file.type.startsWith('audio/')&&!/\.(mp3|ogg|wav|m4a|aac|flac)$/i.test(file.name))continue;const entry={id:'local-'+this.localTracks.length,name:file.name,url:URL.createObjectURL(file)};this.localTracks.push(entry);added.push(entry);}return added;
  }
  syncLocal(){
    if(!this.localAudio)return;
    if(this.context&&!this.localSource){this.localSource=this.context.createMediaElementSource(this.localAudio);this.localSource.connect(this.musicBus);}
    if(this.context?.state==='running'&&this.enabled&&this.playing&&this.musicEnabled&&!this.externalMusicPlaying)void this.localAudio.play().catch(()=>{});else this.localAudio.pause();
  }
  async dispose() {this.localAudio?.pause();this.localSource?.disconnect();this.localTracks.forEach(t=>URL.revokeObjectURL(t.url));this.localTracks=[];if(this.context){await this.context.close();this.context=null;this.voices.clear();} }
}
