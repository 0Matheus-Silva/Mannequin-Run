export function swipeAction(dx,dy,threshold=28){
  if(Math.max(Math.abs(dx),Math.abs(dy))<threshold)return null;
  return Math.abs(dx)>Math.abs(dy)?(dx<0?'left':'right'):(dy<0?'jump':'slide');
}

export class SwipeInput{
  constructor(surface,onAction,{enabled=()=>true}={}){
    this.surface=surface;this.point=null;this.handlers={
      pointerdown:event=>{
        if(event.pointerType!=='touch'||!enabled()||event.target?.closest?.('button,a,input,select,textarea,dialog,#assistant-panel'))return;
        if(this.point){this.point=null;return;}
        if(!event.isPrimary)return;
        this.point={id:event.pointerId,x:event.clientX,y:event.clientY};
        surface.setPointerCapture?.(event.pointerId);
      },
      pointermove:event=>{
        const point=this.point;if(!point||point.id!==event.pointerId)return;
        if(!enabled()){this.point=null;return;}
        const action=swipeAction(event.clientX-point.x,event.clientY-point.y);
        if(action){this.point=null;event.preventDefault();onAction(action);}
      },
      pointerup:event=>{if(this.point?.id===event.pointerId)this.point=null;},
      pointercancel:()=>{this.point=null;},lostpointercapture:()=>{this.point=null;},
    };
    for(const [name,handler]of Object.entries(this.handlers))surface.addEventListener(name,handler);
  }
  dispose(){for(const [name,handler]of Object.entries(this.handlers))this.surface.removeEventListener(name,handler);this.point=null;}
}
