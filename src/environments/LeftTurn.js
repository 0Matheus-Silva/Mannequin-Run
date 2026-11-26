import {bridgeHeight} from './BridgeProfile.js';
const START=2380,END=2440,LENGTH=END-START,RADIUS=LENGTH/(Math.PI/2);
export function turnPose(distance){
 if(distance<=START)return {x:0,z:-distance,angle:0};
 if(distance>=END)return {x:-RADIUS-(distance-END),z:-START-RADIUS,angle:Math.PI/2};
 const angle=(distance-START)/RADIUS;return {x:-RADIUS*(1-Math.cos(angle)),z:-START-RADIUS*Math.sin(angle),angle};
}
export function withLeftTurn(game,draw){
 const distance=game.session.distance%3000,playing=game.state==='playing'||game.state==='paused'||game.state==='falling';
 if(!playing||distance<START-150||distance>2960+32){draw();return;}
 const turning=distance<=END+32,current=turnPose(distance),cos=Math.cos(current.angle),sin=Math.sin(current.angle),saved=[];
 const transform=(obj,offset=0,bridge=false)=>{
  if(!obj?.visible)return;const {x,y,z}=obj.position,at=turnPose(distance-z),direction=turnPose(distance-z+offset).angle-current.angle;
  saved.push([obj,x,y,z,obj.rotation.x,obj.rotation.y,obj.scale.z]);
  if(turning){const dx=at.x-current.x,dz=at.z-current.z;obj.position.x=cos*dx-sin*dz+Math.cos(direction)*x;obj.position.z=sin*dx+cos*dz-Math.sin(direction)*x;obj.rotation.y+=direction;if(offset)obj.scale.z*=1.012;}
  if(bridge){const sample=distance-z;obj.position.y=y+bridgeHeight(sample);if(offset)obj.rotation.x+=Math.atan2(bridgeHeight(sample+16)-bridgeHeight(sample),16);}
 };
 for(const segment of game.world.segments)transform(segment,8,segment.userData.sector===4);
 if(turning){for(const row of game.track.rows)transform(row.group);transform(game.passages.root);for(const supply of game.rescue.supplies)transform(supply);transform(game.rescue.boss);}
 try{draw();}finally{for(const [obj,x,y,z,rx,ry,scale] of saved){obj.position.set(x,y,z);obj.rotation.x=rx;obj.rotation.y=ry;obj.scale.z=scale;}}
}
