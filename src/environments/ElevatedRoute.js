import * as THREE from 'three';

export const ROUTE_START=1460, RAMP_END=1492, DESCENT_START=1760, ROUTE_END=1800, ROUTE_HEIGHT=5.2;
const cycleDistance=distance=>((distance%3000)+3000)%3000;
// The ramps are linear in distance, matching their rendered slope.
export function routeHeight(distance){const d=cycleDistance(distance);if(d<ROUTE_START||d>=ROUTE_END)return 0;if(d<RAMP_END)return ROUTE_HEIGHT*(d-ROUTE_START)/(RAMP_END-ROUTE_START);if(d<DESCENT_START)return ROUTE_HEIGHT;return ROUTE_HEIGHT*(ROUTE_END-d)/(ROUTE_END-DESCENT_START);}
export function crossesEntrance(before,after){return Math.floor(before/3000)===Math.floor(after/3000)&&cycleDistance(before)<ROUTE_START&&cycleDistance(after)>=ROUTE_START;}
export function routeSpawnAllowed(distance){const d=cycleDistance(distance);return !(d>=ROUTE_START-55&&d<RAMP_END+25)&&!(d>=DESCENT_START-25&&d<ROUTE_END+25);}

export class ElevatedRoute{
 constructor(scene){
  this.root=new THREE.Group();scene.add(this.root);const geo=new THREE.BoxGeometry(1,1,1);
  const metal=new THREE.MeshStandardMaterial({color:0x4e5556,roughness:.78,metalness:.48}),edge=new THREE.MeshStandardMaterial({color:0x9d7851,roughness:.75,metalness:.4}),mark=new THREE.MeshStandardMaterial({color:0xf2a13c,emissive:0x9c440b,emissiveIntensity:.5}),dark=new THREE.MeshStandardMaterial({color:0x252b2c,roughness:.9});
  const box=(mat,x,y,z,w,h,d)=>{const mesh=new THREE.Mesh(geo,mat);mesh.position.set(x,y,z);mesh.scale.set(w,h,d);mesh.castShadow=true;mesh.receiveShadow=true;this.root.add(mesh);return mesh;};
  const ramp=(start,end,ascending,width)=>{const len=end-start,angle=Math.atan2(ROUTE_HEIGHT,len),m=box(metal,0,ROUTE_HEIGHT/2-.12,-((start+end)/2-ROUTE_START),width,.24,Math.hypot(len,ROUTE_HEIGHT));m.rotation.x=ascending?angle:-angle;
    for(const x of [-width/2+.1,width/2-.1]){const rail=box(edge,x,ROUTE_HEIGHT/2+.08,m.position.z,.12,.16,Math.hypot(len,ROUTE_HEIGHT));rail.rotation.x=m.rotation.x;}
    for(let n=2;n<len;n+=2){const fraction=n/len,y=ascending?ROUTE_HEIGHT*fraction:ROUTE_HEIGHT*(1-fraction);box(edge,0,y+.025,-(start+n-ROUTE_START),width,.05,.08);}
  };
  ramp(ROUTE_START,RAMP_END,true,8.1);ramp(DESCENT_START,ROUTE_END,false,8.1);
  const length=DESCENT_START-RAMP_END;box(metal,0,ROUTE_HEIGHT-.12,-(RAMP_END-ROUTE_START+length/2),8.1,.24,length);
  for(const x of [-4,4]){box(edge,x,ROUTE_HEIGHT+.45,-(RAMP_END-ROUTE_START+length/2),.16,.9,length);}
  for(let z=RAMP_END;z<DESCENT_START;z+=12){for(const x of [-3.7,3.7])box(dark,x,ROUTE_HEIGHT/2,-(z-ROUTE_START),.3,ROUTE_HEIGHT,.35);for(const x of [-1.35,1.35])box(mark,x,ROUTE_HEIGHT+.012,-(z-ROUTE_START),.04,.025,4);}
  box(mark,0,.03,4,7.8,.05,1);this.root.visible=false;
 }
 update(distance){const d=cycleDistance(distance);this.root.visible=d>=ROUTE_START-150&&d<ROUTE_END+40;this.root.position.z=d-ROUTE_START;}
}
