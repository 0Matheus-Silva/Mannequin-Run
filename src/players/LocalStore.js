export function requestValue(request) { return new Promise((resolve,reject)=>{request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);}); }
export class LocalStore {
  async open() {
    this.db=await new Promise((resolve,reject)=>{const r=indexedDB.open('mannequin-run.players.v1',1);r.onupgradeneeded=()=>{for(const name of ['profiles','runs','outbox'])r.result.createObjectStore(name,{keyPath:'id'});};r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});return this;
  }
  async all(name){return requestValue(this.db.transaction(name).objectStore(name).getAll());}
  async get(name,id){return requestValue(this.db.transaction(name).objectStore(name).get(id));}
  async write(operations) {
    return new Promise((resolve,reject)=>{const tx=this.db.transaction([...new Set(operations.map(o=>o.store))],'readwrite');for(const o of operations){const store=tx.objectStore(o.store);if(o.delete)store.delete(o.id);else store.put(o.value);}tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error);});
  }
  async put(store,value){await this.write([{store,value}]);}
}
export function summarize(profile,runs) {
  const valid=runs.filter(r=>r.playerId===profile.id&&!r.practice),final=valid.filter(r=>['crashed','completed'].includes(r.result));
  const checkpoints=[...(profile.checkpoints||[])];
  for(const r of valid.filter(r=>r.checkpoint)){if(!checkpoints.some(c=>c.distance===r.checkpoint))checkpoints.push({distance:r.checkpoint,items:r.items,duration:r.duration,score:Math.floor(r.checkpoint*10+r.items*75)});}
  checkpoints.sort((a,b)=>b.distance-a.distance);
  return {...profile,checkpoints,best_score:Math.max(profile.best_score||0,...final.map(r=>r.score)),best_infinite:Math.max(profile.best_infinite||0,...final.filter(r=>r.mode==='infinite').map(r=>r.score)),best_story:Math.max(profile.best_story||0,...final.filter(r=>r.mode==='story').map(r=>r.score)),max_distance:Math.max(profile.max_distance||0,...valid.map(r=>r.distance)),story_distance:Math.max(profile.story_distance||0,...valid.filter(r=>r.mode==='story').map(r=>Math.min(3000,r.distance))),story_completed:Boolean(profile.story_completed||valid.some(r=>r.result==='completed')),last_checkpoint:Math.max(profile.last_checkpoint||0,...checkpoints.map(c=>c.distance))};
}
