export class Records {
  constructor(storage) {
    this.storage = storage; this.persistent = true; this.best = 0;
    try {
      const value = Number(storage.getItem('mannequin-run.best.v1'));
      this.best = Number.isFinite(value) && value > 0 ? Math.floor(value) : 0;
    } catch { this.persistent = false; }
  }
  save(score) {
    this.best = Math.max(this.best, Math.floor(score));
    try { this.storage.setItem('mannequin-run.best.v1', String(this.best)); }
    catch { this.persistent = false; }
  }
}

export class RunSession {
  constructor(records) { this.records = records; this.reset(); }
  reset(mode='infinite') { this.mode=mode==='story'?'story':'infinite';this.distance = 0;this.startDistance=0;this.practice=false;this.resumed=false; this.items = 0; this.time = 0; this.ended = false; }
  get speed() { return Math.min(30, 13 + this.distance / 150); }
  get score() { return Math.floor((this.distance-this.startDistance) * 10 + this.items * 75); }
  update(dt) { if (!this.ended) { this.time += dt; this.distance += this.speed * dt; } }
  collect() { if (!this.ended) this.items++; }
  finish() { if (!this.ended) { this.ended = true;if(!this.practice)this.records.save(this.score); } }
}
