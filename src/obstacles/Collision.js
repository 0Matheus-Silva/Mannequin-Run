export const OBSTACLES = {
  block: { width: 1.8, depth: 1.3, bottom: 0, top: 3 },
  jump: { width: 1.8, depth: 1, bottom: 0, top: .78 },
  slide: { width: 1.9, depth: 1, bottom: 1.18, top: 2.9 },
};
export const fatalCollision=(type,time,lastStumble)=>type!=='jump'||time-lastStumble<3;

// Swept longitudinal bounds prevent tunneling at high speed or low frame rate.
export function overlapsPlayer(player, obstacle, previousZ, z) {
  const bounds = obstacle.type==='slide' && obstacle.sector===1 ? {...OBSTACLES.slide,top:1.7} : OBSTACLES[obstacle.type];
  if (Math.min(previousZ, z) > bounds.depth / 2 + .22 || Math.max(previousZ, z) < -bounds.depth / 2 - .22) return false;
  if (Math.abs(player.x - obstacle.x) >= bounds.width / 2 + .27) return false;
  return player.y + .08 < bounds.top && player.y + player.height > bounds.bottom;
}

export function isNearMiss(player,obstacle){
  const bounds=OBSTACLES[obstacle.type],dx=Math.abs(player.x-obstacle.x),edge=bounds.width/2+.27;
  if(dx>=edge&&dx<edge+.65)return true;
  if(dx>=edge)return false;
  if(obstacle.type==='jump')return player.y+.08>=bounds.top&&player.y<1.2;
  if(obstacle.type==='slide')return player.y<.1&&player.height<=bounds.bottom;
  return false;
}

export function canCollect(player, x, previousZ, z, height=1.25, action='free') {
  if(action==='jump'&&player.y<.65)return false;
  if(action==='slide'&&(player.height>1.15||player.y>.1))return false;
  // Ordinary lane pickups remain reachable during a grounded slide/roll.
  // Jump and low-slide routes retain their action and height requirements.
  const reach=action==='free'&&player.y<=.1?Math.max(player.height,1.55):player.height;
  return Math.min(previousZ, z) <= .65 && Math.max(previousZ, z) >= -.65 &&
    Math.abs(player.x - x) < .8 && player.y+.08 < height+.22 && player.y + reach > height-.22;
}

export function createPattern(index, random = Math.random) {
  const safeLane = Math.floor(random() * 3) - 1;
  const blocked = [-1, 0, 1].filter(lane => lane !== safeLane);
  const types = ['jump', 'slide', 'block'];
  // A full lane always stays clear; rows allow >=1.65s to cross two lanes.
  const obstacles=blocked.slice(0,index<3?1:2).map((lane,n)=>({lane,type:types[(index+n)%types.length]}));
  const route=index<3?'free':['free','jump','slide','weave'][index%4];
  let collectibles;
  if(route==='jump'||route==='slide'){
    obstacles[0].type=route;
    collectibles=[-2,0,2].map((z,i)=>({lane:obstacles[0].lane,z,y:route==='jump'?(i===1?3.15:2.95):.45,action:route}));
  }else if(route==='weave'){
    const from=safeLane===0?(index%2?1:-1):0;
    collectibles=[{lane:from,z:12,y:1.25,action:'free'},{lane:0,z:6,y:1.25,action:'free'},{lane:safeLane,z:0,y:1.25,action:'free'}];
  }else collectibles=[-5,-2,1].map(z=>({lane:safeLane,z,y:1.25,action:'free'}));
  return {safeLane,obstacles,route,collectibles};
}

export function createChasmPattern(index,side,random=Math.random){
  if(side!==-1&&side!==1)return null;
  const available=[-1,0,1].filter(lane=>lane!==side);
  const safeLane=available[Math.floor(random()*available.length)];
  const obstacleLane=available.find(lane=>lane!==safeLane),type=index%2?'slide':'jump';
  // Alternate jump and slide rewards on the grounded obstacle lane.
  const collectibles=[-2,0,2].map((z,i)=>({lane:obstacleLane,z,y:type==='jump'?(i===1?3.15:2.95):.45,action:type}));
  return {safeLane,obstacles:[{lane:obstacleLane,type}],route:type,collectibles};
}
export function createSectorPattern(index,sector,random=Math.random){return createPattern(index,random);}
