import { UI } from './ui/UI.js';

const ui = new UI();
export let game = null;
export let assistant = null;
export let players = null;
export let music = null;
try {
  // Dynamic import keeps initialization errors visible even if a dependency fails.
  const { Game } = await import('./game/Game.js');
  game = new Game(document.querySelector('#scene'), ui);
  ui.bind(game);
  game.start();
} catch (error) {
  console.error(error);
  ui.error(error.message);
}
try {
  const { MusicUI } = await import('./music/MusicUI.js');
  music = new MusicUI(game);
} catch (error) { console.warn('Reprodutor de música indisponível:',error.message); }
try {
  const { AssistantUI } = await import('./assistant/AssistantUI.js');
  assistant = new AssistantUI(music);
} catch (error) {
  console.warn('Assistente local indisponível:', error.message);
  document.querySelector('#assistant-open').disabled=true;
}
if(game){
  try{
    const {Players}=await import('./players/Players.js');players=new Players(game,assistant);
    const diagnostic=document.querySelector('#gamepad-dialog');
    document.querySelector('#gamepad-open').onclick=()=>{if(['playing','starting','ending','falling','victory'].includes(game.state))game.pause();diagnostic.showModal();};
    document.querySelector('#gamepad-close').onclick=()=>diagnostic.close();
    for(const button of diagnostic.querySelectorAll('[data-calibrate]'))button.onclick=()=>game.gamepad.calibrate(button.dataset.calibrate);
    setInterval(()=>{if(diagnostic.open){const pad=game.gamepad.pad;document.querySelector('#gamepad-readings').textContent=pad?JSON.stringify({name:pad.id,mapping:pad.mapping,buttons:pad.buttons.map((b,i)=>b.pressed?i:null).filter(i=>i!==null),axes:pad.axes.map(v=>Math.round(v*100)/100),calibrating:game.gamepad.calibration?.action||null},null,2):'Conecte o DualSense e pressione um botão.';}},100);
  }catch(error){console.warn('Perfis locais indisponíveis:',error.message);}
}
