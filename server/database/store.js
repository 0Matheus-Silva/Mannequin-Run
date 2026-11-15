import { player, run, uuid, finished, Invalid } from './validation.js';
export class Store {
  constructor(pool) { this.pool = pool; }
  async createPlayer(input) {
    const p = player(input), c = await this.pool.getConnection();
    try {
      await c.beginTransaction();
      await c.execute('INSERT IGNORE INTO players(id,name) VALUES (?,?)', [p.id,p.name]);
      const [[existing]] = await c.execute('SELECT * FROM players WHERE id=? FOR UPDATE', [p.id]);
      if (existing.name !== p.name) throw new Invalid('O identificador pertence a outro perfil.',409);
      await c.execute('INSERT IGNORE INTO progress(player_id) VALUES (?)',[p.id]);
      await c.commit(); return existing;
    } catch (e) { await c.rollback(); throw e; } finally { c.release(); }
  }
  async players(search = '') {
    if (typeof search !== 'string' || search.length > 48) throw new Invalid('Busca inválida.');
    // INSTR treats %, _ and backslash as literal text, not LIKE wildcards.
    const [rows] = await this.pool.execute('SELECT * FROM players WHERE INSTR(name,?)>0 OR id=? ORDER BY last_active_at DESC,id LIMIT 50',[search,search]); return rows;
  }
  async profile(id) {
    uuid(id);
    const [[p]] = await this.pool.execute('SELECT p.*,g.* FROM players p JOIN progress g ON g.player_id=p.id WHERE p.id=?',[id]);
    if (!p) throw new Invalid('Perfil não encontrado.',404);
    const [history] = await this.pool.execute('SELECT * FROM runs WHERE player_id=? ORDER BY created_at DESC,id DESC LIMIT 100',[id]);
    const [[counts]] = await this.pool.execute("SELECT COUNT(*) AS run_count FROM runs WHERE player_id=? AND result IN ('crashed','completed')",[id]);
    const [checkpoints] = await this.pool.execute('SELECT * FROM checkpoints WHERE player_id=? ORDER BY distance DESC',[id]);
    const [achievements] = await this.pool.execute('SELECT code,unlocked_at FROM achievements WHERE player_id=?',[id]);
    return {...p, ...counts, history, checkpoints, achievements};
  }
  async saveRun(input) {
    const v = run(input), c = await this.pool.getConnection();
    try {
      await c.beginTransaction();
      const [[p]] = await c.execute('SELECT id FROM players WHERE id=? FOR UPDATE',[v.playerId]);
      if (!p) throw new Invalid('Crie o perfil antes da partida.',404);
      const [[old]] = await c.execute('SELECT * FROM runs WHERE id=? FOR UPDATE',[v.id]);
      if (old && old.player_id !== v.playerId) throw new Invalid('Partida pertence a outro perfil.',409);
      if (old && (old.mode !== v.mode || Boolean(old.practice) !== v.practice || Boolean(old.resumed) !== v.resumed || old.start_distance !== v.startDistance)) throw new Invalid('A identidade da partida não pode ser alterada.',409);
      if (old && (old.revision >= v.revision || finished(old.result))) { await c.commit(); return {saved:true,duplicate:true}; }
      if (old && (v.distance < old.distance || v.duration < old.duration || v.items < old.items)) throw new Invalid('O progresso não pode retroceder.',409);
      const params = [v.playerId,v.mode,v.practice,v.resumed,v.score,v.distance,v.startDistance,v.items,v.sector,v.duration,v.result,v.revision];
      if (old) await c.execute('UPDATE runs SET player_id=?,mode=?,practice=?,resumed=?,score=?,distance=?,start_distance=?,items=?,sector=?,duration=?,result=?,revision=?,updated_at=UTC_TIMESTAMP(3) WHERE id=?',[...params,v.id]);
      else await c.execute('INSERT INTO runs(player_id,mode,practice,resumed,score,distance,start_distance,items,sector,duration,result,revision,id) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)',[...params,v.id]);
      await c.execute('UPDATE players SET last_active_at=UTC_TIMESTAMP(3) WHERE id=?',[v.playerId]);
      if (!v.practice) {
        const eligible = ['crashed','completed'].includes(v.result), completed = v.result === 'completed';
        const storyDistance = v.mode === 'story' ? Math.floor(Math.min(v.distance,2400)) : 0;
        await c.execute(`UPDATE progress SET story_distance=GREATEST(story_distance,?),last_checkpoint=GREATEST(last_checkpoint,?),
          unlocked_sectors=GREATEST(unlocked_sectors,?),best_score=GREATEST(best_score,?),best_infinite=GREATEST(best_infinite,?),
          best_story=GREATEST(best_story,?),max_distance=GREATEST(max_distance,?),story_completed=GREATEST(story_completed,?),updated_at=UTC_TIMESTAMP(3) WHERE player_id=?`,
          [storyDistance,v.checkpoint,Math.min(4,Math.floor(storyDistance/600)+1),eligible?v.score:0,eligible&&v.mode==='infinite'?v.score:0,eligible&&v.mode==='story'?v.score:0,v.distance,completed,v.playerId]);
        if (v.checkpoint) await c.execute(`INSERT INTO checkpoints(player_id,distance,run_id,score,items,duration) VALUES (?,?,?,?,?,?)
          ON DUPLICATE KEY UPDATE run_id=VALUES(run_id),score=VALUES(score),items=VALUES(items),duration=VALUES(duration),created_at=UTC_TIMESTAMP(3)`,[v.playerId,v.checkpoint,v.id,Math.floor(v.checkpoint*10+v.items*75),v.items,v.duration]);
        const awards = [...(eligible?['first_run']:[]),...(completed?['story_complete']:[]),...(eligible&&v.items>=10?['collector_10']:[])];
        for (const code of awards) await c.execute('INSERT IGNORE INTO achievements(player_id,code) VALUES (?,?)',[v.playerId,code]);
      }
      await c.commit(); return {saved:true};
    } catch(e) { await c.rollback(); throw e; } finally { c.release(); }
  }
  async ranking(mode = 'all') {
    if (!['all','story','infinite'].includes(mode)) throw new Invalid('Ranking inválido.');
    const [rows] = await this.pool.execute(`SELECT t.player_id,p.name,t.score,t.distance,t.mode,t.created_at FROM
      (SELECT *,ROW_NUMBER() OVER(PARTITION BY player_id ORDER BY score DESC,distance DESC,created_at ASC,id ASC) AS position
       FROM runs WHERE practice=0 AND result IN ('crashed','completed') AND (?='all' OR mode=?)) t
      JOIN players p ON p.id=t.player_id WHERE t.position=1 ORDER BY t.score DESC,t.distance DESC,t.created_at ASC,t.id ASC LIMIT 10`,[mode,mode]);
    return rows;
  }
  async deletePlayer(id) { uuid(id); await this.pool.execute('DELETE FROM players WHERE id=?',[id]); return {deleted:true}; }
}
export const tables = ['players','runs','progress','checkpoints','achievements'];
export async function snapshot(pool) {
  const c = await pool.getConnection();
  try {
    await c.query('SET TRANSACTION ISOLATION LEVEL REPEATABLE READ');
    await c.query('START TRANSACTION WITH CONSISTENT SNAPSHOT');
    const data = {format:'mannequin-run-mysql-v1',exportedAt:new Date().toISOString(),tables:{}};
    for(const name of tables) [data.tables[name]] = await c.query(`SELECT * FROM ${name}`);
    await c.commit(); return data;
  } catch(e) { await c.rollback(); throw e; } finally { c.release(); }
}
