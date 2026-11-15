export class GamepadCursor{
  constructor(game){
    this.game=game;this.node=document.createElement('div');this.node.id='gamepad-cursor';this.node.setAttribute('popover','manual');this.node.setAttribute('aria-hidden','true');this.node.hidden=true;document.body.append(this.node);this.visible=false;this.context=null;this.last=performance.now();
  }
  center(node){const r=node.getBoundingClientRect();this.x=r.left+r.width/2;this.y=r.top+r.height/2;}
  update(pad,mapping){
    const dialog=document.querySelector('dialog[open]'),state=this.game.state;
    const active=Boolean(pad&&mapping&&(dialog||['menu','paused','gameover','victory'].includes(state))&&!document.hidden);
    const now=performance.now(),dt=Math.min(.05,(now-this.last)/1000);this.last=now;
    if(!active){if(this.visible){this.node.hidePopover?.();this.node.hidden=true;}this.visible=false;return false;}
    const context=dialog||document.getElementById({menu:'menu',paused:'pause-panel',gameover:'over-panel',victory:'victory-panel'}[state]);
    if(!this.visible||this.context!==context){if(this.node.matches(':popover-open'))this.node.hidePopover?.();const first=context?.querySelector('#play')||context?.querySelector('#resume')||context?.querySelector('input,button:not(:disabled),select');if(first)this.center(first);else{this.x=innerWidth/2;this.y=innerHeight/2;}this.context=context;}
    this.visible=true;this.node.hidden=false;if(!this.node.matches(':popover-open'))this.node.showPopover?.();
    const axis=value=>Math.abs(value||0)<.18?0:Math.sign(value)*(Math.abs(value)-.18)/.82;
    this.x=Math.max(10,Math.min(innerWidth-10,this.x+axis(pad.axes[mapping.axis])*650*dt));
    this.y=Math.max(10,Math.min(innerHeight-10,this.y+axis(pad.axes[mapping.axisY??mapping.axis+1])*650*dt));
    this.node.style.left=this.x+'px';this.node.style.top=this.y+'px';
    const target=document.elementFromPoint(this.x,this.y)?.closest('button,input,select,a,label');this.node.classList.toggle('over-control',Boolean(target&&!target.disabled));return true;
  }
  handle(key){
    if(!this.visible)return false;
    if(key==='cross'){
      const node=document.elementFromPoint(this.x,this.y)?.closest('button,input,select,a,label');
      if(node&&!node.disabled){node.focus?.();if(node.tagName!=='SELECT')node.click();}
      return true;
    }
    return false;
  }
  snapToFocus(){if(this.visible&&document.activeElement?.getClientRects().length)this.center(document.activeElement);}
}
