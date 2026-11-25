import { MusicBridge } from './bridge.js';
export class MusicUI{
  constructor(game){this.game=game;this.bridge=new MusicBridge();this.bridge.addEventListener('change',()=>this.refresh());
    document.querySelector('#music-open').onclick=()=>{const tab=window.open('./src/music/player.html','nexus-apple-music');if(!tab)this.note('Permita a abertura da aba do reprodutor.');};
    for(const [id,action] of [['music-previous','previous'],['music-play','resume'],['music-pause','pause'],['music-next','next']])document.getElementById(id).onclick=()=>this.command(action).catch(error=>this.note(error.message));
    this.refresh();
  }
  note(value){document.querySelector('#music-status').textContent=value;}
  refresh(){const s=this.bridge.status;this.note(s.text);for(const id of ['music-previous','music-play','music-pause','music-next'])document.getElementById(id).disabled=!s.connected;this.game?.audio.setExternalMusicPlaying(s.playing);}
  command(action,query=''){return this.bridge.command(action,query);}
}
