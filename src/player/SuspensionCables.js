import * as THREE from 'three';
// Segmented cables are allocated once; their endpoints follow the animated rig.
export class SuspensionCables{
 constructor(scene,player){
  this.player=player;this.root=new THREE.Group();scene.add(this.root);
  this.black=new THREE.MeshStandardMaterial({color:0x111a18,roughness:.68,metalness:.2});
  this.green=new THREE.MeshStandardMaterial({color:0x30c562,emissive:0x0a8e35,emissiveIntensity:.7,roughness:.45});
  this.geometry=new THREE.CylinderGeometry(1,1,1,8);this.axis=new THREE.Vector3(0,1,0);this.tmp=new THREE.Vector3();
  this.links=[
    {anchor:new THREE.Vector3(-4.2,5.1,-1.5),bend:-.48,target:()=>player.arms[1].pivot,offset:new THREE.Vector3(0,-.12,.14)},
    {anchor:new THREE.Vector3(4.2,5.1,-1.5),bend:.48,target:()=>player.arms[0].pivot,offset:new THREE.Vector3(0,-.12,.14)},
    {anchor:new THREE.Vector3(-4.2,2.3,-1.5),bend:-.55,target:()=>player.pelvis,offset:new THREE.Vector3(-.17,-.06,.22)},
    {anchor:new THREE.Vector3(4.2,2.3,-1.5),bend:.55,target:()=>player.pelvis,offset:new THREE.Vector3(.17,-.06,.22)},
    {anchor:new THREE.Vector3(-4.1,3.5,-1.4),bend:-.48,target:()=>player.torso,offset:new THREE.Vector3(-.24,.08,.22),radius:.028},
    {anchor:new THREE.Vector3(4.1,3.5,-1.4),bend:.48,target:()=>player.torso,offset:new THREE.Vector3(.24,.08,.22),radius:.028},
    {anchor:new THREE.Vector3(-1.1,5.8,-2.8),bend:-.18,target:()=>player.neck,offset:new THREE.Vector3(0,.06,.15),radius:.028}
  ].map((link,i)=>({...link,parts:Array.from({length:10},(_,n)=>{const mesh=new THREE.Mesh(this.geometry,n%3===1?this.green:this.black);mesh.castShadow=true;this.root.add(mesh);return mesh;})}));
 }
 update(state,elapsed=0){
  const show=state==='menu'||state==='starting'||state==='paused-starting';this.root.visible=show;if(!show)return;
  this.player.root.updateMatrixWorld(true);const release=state==='menu'?0:THREE.MathUtils.smoothstep(elapsed,.12,1.25);
  for(const link of this.links){
   const end=link.target().localToWorld(link.offset.clone()),anchor=link.anchor,detached=end.clone().lerp(anchor,release);
   const path=link.control?new THREE.QuadraticBezierCurve3(anchor,link.control.clone().lerp(anchor,release),detached):null;
   let prev=anchor.clone();for(let n=0;n<link.parts.length;n++){
    const t=(n+1)/link.parts.length,point=path?path.getPoint(t):anchor.clone().lerp(detached,t);const curve=Math.sin(t*Math.PI)*(1-release);point.x+=link.bend*curve;point.y-=.28*curve;point.z-=.24*curve;
    const mesh=link.parts[n],diff=point.clone().sub(prev),radius=link.radius??.035;mesh.visible=diff.length()>.005;mesh.position.copy(point).add(prev).multiplyScalar(.5);mesh.scale.set(radius,diff.length(),radius);mesh.quaternion.setFromUnitVectors(this.axis,diff.normalize());prev=point;
   }
  }
 }
}
