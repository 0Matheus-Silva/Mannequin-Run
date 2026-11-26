const smooth=x=>{x=Math.max(0,Math.min(1,x));return x*x*(3-2*x);};
// Reach full opacity before swapping worlds, then uncover the campus gradually.
export function arrivalFogOpacity(mode,state,distance,elapsed=0,fogElapsed=null){
 if(mode!=='story')return 0;
 if(state==='playing')return fogElapsed===null?0:smooth(fogElapsed/2.4);
 if(state==='ending')return 1-smooth((elapsed-.8)/2.4);
 return 0;
}
