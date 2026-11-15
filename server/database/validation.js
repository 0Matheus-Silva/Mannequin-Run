export class Invalid extends Error { constructor(message, status = 400) { super(message); this.status = status; } }
export function uuid(value) { if (typeof value !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)) throw new Invalid('Identificador inválido.'); return value; }
export function player(value) {
  const name = typeof value.name === 'string' ? value.name.trim().normalize('NFC') : '';
  if (!name || name.length > 48 || /[\x00-\x1f\x7f]/.test(name)) throw new Invalid('Use um nome ou apelido de 1 a 48 caracteres.');
  return {id: uuid(value.id), name};
}
export const checkpointDistances = [600, 1200, 1800, 2300];
export const finished = result => ['crashed', 'completed', 'abandoned'].includes(result);
export function run(value) {
  const v = {...value, id: uuid(value.id), playerId: uuid(value.playerId)};
  if (!['story','infinite'].includes(v.mode) || !['running','checkpoint','crashed','completed','abandoned'].includes(v.result)) throw new Invalid('Modo ou resultado inválido.');
  for (const key of ['score','distance','startDistance','items','duration','revision']) if (typeof v[key] !== 'number' || !Number.isFinite(v[key]) || v[key] < 0 || v[key] > 1e9) throw new Invalid('Valores da partida inválidos.');
  if (![v.score,v.items,v.revision].every(Number.isSafeInteger) || v.revision < 1 || v.startDistance > v.distance || v.items > 1e6 || v.duration > 86400 || (v.mode === 'story' && v.distance > 2400.01)) throw new Invalid('Partida fora dos limites.');
  if (v.score !== Math.floor((v.distance-v.startDistance)*10+v.items*75)) throw new Invalid('Pontuação inconsistente.');
  if (typeof v.practice !== 'boolean' || typeof v.resumed !== 'boolean' || (v.result === 'completed' && (v.mode !== 'story' || v.distance < 2400))) throw new Invalid('Estado inválido.');
  v.sector = v.mode==='story'?Math.min(3,Math.floor(v.distance/600)):Math.floor(v.distance/600)%4;
  v.checkpoint = v.checkpoint ?? 0;
  if (v.checkpoint !== 0 && (!checkpointDistances.includes(v.checkpoint) || v.mode !== 'story' || v.practice || v.checkpoint > v.distance || v.result !== 'checkpoint')) throw new Invalid('Checkpoint inválido.');
  return v;
}
