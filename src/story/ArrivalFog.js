const smooth=x=>{x=Math.max(0,Math.min(1,x));return x*x*(3-2*x);};
// The old world disappears only after the veil has become opaque.
export function arrivalFogOpacity(mode,state,distance,elapsed=0){
 if(mode!=='story')return 0;
 if(state==='playing')return .98*smooth((distance-2345)/55);
 if(state==='ending')return .98*(1-smooth((elapsed-.5)/2.2));
 return 0;
}
