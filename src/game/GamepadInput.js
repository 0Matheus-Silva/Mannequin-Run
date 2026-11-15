const standard={cross:0,circle:1,options:9,left:14,right:15,up:12,down:13,axis:0};
const safeStorage=()=>{try{return globalThis.localStorage;}catch{return null;}};
export function readControls(pad,mapping=standard){
  const pressed=n=>Number.isInteger(n)&&Boolean(pad.buttons[n]?.pressed||pad.buttons[n]?.value>.5),axis=pad.axes[mapping.axis]||0;
  return {cross:pressed(mapping.cross),circle:pressed(mapping.circle),options:pressed(mapping.options),left:pressed(mapping.left)||axis<-.55,right:pressed(mapping.right)||axis>.55,up:pressed(mapping.up),down:pressed(mapping.down)};
}
export class GamepadInput{
  constructor(onAction,{getPads=()=>navigator.getGamepads?.()||[],onStatus=()=>{},onMenu=()=>{},onPointer=()=>false,isPlaying=()=>false,target=window,storage=safeStorage()}={}){
    this.onAction=onAction;this.getPads=getPads;this.onStatus=onStatus;this.onMenu=onMenu;this.onPointer=onPointer;this.isPlaying=isPlaying;this.target=target;this.storage=storage;this.previous={};this.id=null;this.armed=false;this.calibration=null;
    this.connected=()=>this.poll();this.disconnected=e=>{if(e.gamepad?.id===this.id){this.id=null;this.pad=null;this.previous={};this.armed=false;this.onPointer(null,null);this.onStatus('Controle desconectado. Teclado disponível.');}};
    target.addEventListener('gamepadconnected',this.connected);target.addEventListener('gamepaddisconnected',this.disconnected);
  }
  mapping(pad){if(pad.mapping==='standard')return standard;try{return JSON.parse(this.storage.getItem('mannequin-run.gamepad.'+pad.id))||null;}catch{return null;}}
  calibrate(action){this.calibration={action,released:false};}
  poll(){
    let pads;try{pads=Array.from(this.getPads()).filter(p=>p?.connected);}catch{return;}
    const pad=pads.find(p=>p.id===this.id)||pads.find(p=>/dualsense|054c.*(0ce6|0df2)|wireless controller/i.test(p.id))||pads[0];
    if(!pad){this.onPointer(null,null);if(this.id){this.id=null;this.pad=null;this.previous={};this.armed=false;this.onStatus('Controle desconectado. Teclado disponível.');}return;}
    const mapping=this.mapping(pad);
    if(this.id!==pad.id){this.id=pad.id;this.previous={};this.armed=false;this.onStatus('Controle conectado: '+pad.id+(mapping?' · X saltar/confirmar · ○ deslizar/voltar · Options pausar':' · Mapeamento não padrão: calibre em TESTAR CONTROLE.'));}
    this.pad=pad;
    const pointer=this.onPointer(this.calibration?null:pad,mapping);
    if(this.calibration){const c=this.calibration,index=pad.buttons.findIndex(b=>b.pressed),axis=pad.axes.findIndex(v=>Math.abs(v)>.65);
      if(index<0&&axis<0)c.released=true;
      if(c.released&&((c.action==='axis'&&axis>=0)||(c.action!=='axis'&&index>=0))){const m={...(mapping||{axis:0})};m[c.action]=c.action==='axis'?axis:index;try{this.storage.setItem('mannequin-run.gamepad.'+pad.id,JSON.stringify(m));}catch{}this.calibration=null;this.armed=false;this.onStatus('Comando calibrado: '+c.action);}
      return;
    }
    if(!mapping)return;
    const state=readControls(pad,mapping);
    if(pointer){state.left=Boolean(pad.buttons[mapping.left]?.pressed);state.right=Boolean(pad.buttons[mapping.right]?.pressed);}
    if(!this.armed){this.previous=state;if(!Object.values(state).some(Boolean))this.armed=true;return;}
    for(const key of Object.keys(state))if(state[key]&&!this.previous[key]){
      if(this.isPlaying()){
        const action={left:'left',right:'right',cross:'jump',circle:'slide',options:'pause'}[key];if(action)this.onAction(action);
      }else this.onMenu(key);
    }
    this.previous=state;
  }
  dispose(){this.target.removeEventListener('gamepadconnected',this.connected);this.target.removeEventListener('gamepaddisconnected',this.disconnected);}
}
export function menuControl(game,key){
  const dialog=document.querySelector('dialog[open]');
  if(key==='options'&&!dialog){game.action('pause');return;}
  if(key==='circle'){
    if(dialog){const back=dialog.querySelector('[data-pad-back]')||dialog.querySelector('button[id$="-close"]');if(back)back.click();else dialog.close();}
    else if(game.state==='paused')game.resume();else if(game.state==='gameover')game.setState('menu');return;
  }
  const root=dialog||document.querySelector(game.state==='menu'?'#menu':game.state==='paused'?'#pause-panel':game.state==='gameover'?'#over-panel':game.state==='victory'?'#victory-panel':'#menu');
  const controls=Array.from(root.querySelectorAll('button,input,select')).filter(n=>!n.disabled&&n.getClientRects().length);
  if(!controls.length)return;
  const active=document.activeElement,index=controls.indexOf(active);
  if(['left','right','up','down'].includes(key)){
    if(active?.tagName==='SELECT'&&['up','down'].includes(key)){active.selectedIndex=Math.max(0,Math.min(active.options.length-1,active.selectedIndex+(key==='down'?1:-1)));active.dispatchEvent(new Event('change'));return;}
    controls[(index+(key==='left'||key==='up'?-1:1)+controls.length)%controls.length].focus();
  }
  if(key==='cross'){const node=index>=0?active:root.querySelector('#play,#resume,[data-restart]')||controls[0];if(node.tagName==='INPUT')node.focus();else node.click();}
}
