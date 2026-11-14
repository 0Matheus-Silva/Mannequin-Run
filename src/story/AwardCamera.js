import * as THREE from 'three';

// World-space camera keys: all approaches remain in front of the stage.
const keys=[
  {time:21,position:[0,5.4,11],target:[0,3.4,-8],fov:48},
  {time:21.4,position:[0,5.4,11],target:[0,3.4,-8],fov:48},
  {time:23,position:[4.4,3.65,-1.8],target:[4.4,2.5,-10],fov:43},
  {time:26,position:[4.4,3.65,-1.8],target:[4.4,2.5,-10],fov:43},
  {time:27,position:[-4.4,3.9,-1.6],target:[-4.4,2.8,-9.8],fov:43},
  {time:31,position:[-4.4,3.9,-1.6],target:[-4.4,2.8,-9.8],fov:43},
  {time:32,position:[0,4.1,1.4],target:[0,3.35,-10],fov:46},
  {time:35,position:[0,4.1,1.4],target:[0,3.35,-10],fov:46},
];
export function awardCamera(t){
  let a=keys[0],b=a;
  for(let i=1;i<keys.length;i++){b=keys[i];if(t<=b.time)break;a=b;}
  const u=a===b?0:THREE.MathUtils.smootherstep(t,a.time,b.time);
  return {position:new THREE.Vector3(...a.position).lerp(new THREE.Vector3(...b.position),u),target:new THREE.Vector3(...a.target).lerp(new THREE.Vector3(...b.target),u),fov:THREE.MathUtils.lerp(a.fov,b.fov,u)};
}
