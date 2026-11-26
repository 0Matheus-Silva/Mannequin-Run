import test from 'node:test';import assert from 'node:assert/strict';
import {createSectorPattern,createChasmPattern,overlapsPlayer,canCollect} from '../src/obstacles/Collision.js';
import {PlayerController,LANE_WIDTH} from '../src/player/PlayerController.js';
function feasible(pattern,sector,speed){
 const obstacle=pattern.obstacles.find(o=>o.lane===pattern.collectibles[0].lane);if(!obstacle)return false;
 for(let start=-20;start<=-1;start+=.25){const p=new PlayerController();p.lane=obstacle.lane;p.x=obstacle.lane*LANE_WIDTH;let z=-22,acted=false,collected=0,hit=false;const seen=new Set();
  for(let n=0;n<500&&z<8;n++){const prev=z;z+=speed/120;if(!acted&&z>=start){acted=true;p[obstacle.type]();}p.update(1/120);
   if(overlapsPlayer(p,{...obstacle,sector,x:obstacle.lane*LANE_WIDTH},prev,z)){hit=true;break;}
   pattern.collectibles.forEach((c,i)=>{if(!seen.has(i)&&canCollect(p,c.lane*LANE_WIDTH,prev+c.z,z+c.z,c.y,c.action)){seen.add(i);collected++;}});
  }if(!hit&&collected>0)return true;
 }return false;
}
test('cada setor oferece rotas coletáveis de salto e deslize em velocidades baixa e alta',()=>{
 for(let sector=0;sector<5;sector++)for(const type of ['jump','slide'])for(const speed of [13,30]){
  const patterns=Array.from({length:20},(_,i)=>createSectorPattern(i,sector,()=>.5));const pattern=patterns.find(p=>p.route===type);assert.ok(pattern,`setor ${sector} sem ${type}`);assert.ok(feasible(pattern,sector,speed),`setor ${sector}: ${type} inviável a ${speed}`);
 }
});
test('crateras também oferecem componentes sobre obstáculos sem usar a faixa destruída',()=>{
 for(const side of [-1,1])for(const index of [0,1]){const p=createChasmPattern(index,side,()=>.1);assert.ok(p.collectibles.every(c=>c.lane!==side));for(const speed of [13,30])assert.ok(feasible(p,1,speed),`cratera ${side}, ${p.route}, ${speed}`);}
});
