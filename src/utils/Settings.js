const KEY='mannequin-run.settings.v1';
export class Settings {
  constructor(storage){
    this.storage=storage;this.audio=true;this.volume=.65;this.quality='standard';this.mode='infinite';this.music=true;this.musicVolume=.6;this.effectsVolume=.85;this.track='afterglow';this.credits=true;
    try{const saved=JSON.parse(storage.getItem(KEY));if(saved){this.audio=typeof saved.audio==='boolean'?saved.audio:true;this.volume=Number.isFinite(saved.volume)?Math.max(0,Math.min(1,saved.volume)):.65;this.quality=['eco','standard','high'].includes(saved.quality)?saved.quality:'standard';}}catch{}
    try{const saved=JSON.parse(storage.getItem(KEY))??{};this.credits=saved.credits!==false;this.mode=saved.mode==='story'?'story':'infinite';this.music=saved.music!==false;this.musicVolume=Number.isFinite(saved.musicVolume)?Math.max(0,Math.min(1,saved.musicVolume)):.6;this.effectsVolume=Number.isFinite(saved.effectsVolume)?Math.max(0,Math.min(1,saved.effectsVolume)):.85;this.track=['afterglow','rust','home'].includes(saved.track)?saved.track:'afterglow';}catch{}
  }
  save(){try{this.storage.setItem(KEY,JSON.stringify({audio:this.audio,volume:this.volume,quality:this.quality,mode:this.mode,music:this.music,musicVolume:this.musicVolume,effectsVolume:this.effectsVolume,track:this.track,credits:this.credits}));}catch{}}
}
