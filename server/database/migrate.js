import { createHash, randomBytes } from 'node:crypto';
import { readFile, readdir, writeFile } from 'node:fs/promises';
import mysql from 'mysql2/promise';
import { options, root, database } from './config.js';
export async function migrate(connection) {
  const [[lock]] = await connection.query("SELECT GET_LOCK('mannequin_run_schema', 15) AS acquired");
  if (!lock.acquired) throw new Error('Outra atualização do banco está em andamento.');
  try {
    await connection.query('CREATE TABLE IF NOT EXISTS schema_migrations (version VARCHAR(100) PRIMARY KEY, checksum CHAR(64) NOT NULL, applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP) ENGINE=InnoDB');
    const folder = new URL('./migrations/', import.meta.url);
    for (const version of (await readdir(folder)).filter(n => /^\d+.*\.sql$/.test(n)).sort()) {
      const sql = await readFile(new URL(version, folder), 'utf8');
      const checksum = createHash('sha256').update(sql).digest('hex');
      const [previous] = await connection.execute('SELECT checksum FROM schema_migrations WHERE version=?', [version]);
      if (previous.length) { if (previous[0].checksum !== checksum) throw new Error('Migração aplicada foi alterada; crie uma nova versão.'); continue; }
      // Only repository-owned migration files, never request input. DDL is retryable after partial failure.
      for (const statement of sql.split(';').map(s => s.trim()).filter(Boolean)) await connection.query(statement);
      await connection.execute('INSERT INTO schema_migrations(version,checksum) VALUES (?,?)', [version, checksum]);
    }
  } finally { await connection.query("SELECT RELEASE_LOCK('mannequin_run_schema')"); }
}
export async function setup({migrateOnly = false} = {}) {
  const connection = await mysql.createConnection(options({admin: true, withDatabase: false}));
  try {
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${database} CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci`);
    await connection.changeUser({database});
    await migrate(connection);
    if (!migrateOnly) {
      const user = process.env.MYSQL_USER || 'mannequin_run_app';
      if (!/^[a-zA-Z0-9_]{1,32}$/.test(user) || user === process.env.MYSQL_ADMIN_USER) throw new Error('Use um MYSQL_USER exclusivo, diferente do administrador.');
      const password = process.env.MYSQL_PASSWORD || randomBytes(32).toString('hex');
      // mysql2 escaping is used only for GRANT/CREATE USER syntax, which does not support placeholders.
      const account = mysql.escape(user) + "@'localhost'";
      await connection.query(`CREATE USER IF NOT EXISTS ${account} IDENTIFIED BY ${mysql.escape(password)}`);
      await connection.query(`GRANT SELECT, INSERT, UPDATE, DELETE ON ${database}.* TO ${account}`);
      if (!process.env.MYSQL_USER || !process.env.MYSQL_PASSWORD) {
        let text=await readFile(root+'.env','utf8');
        for(const [key,value]of [['MYSQL_USER',user],['MYSQL_PASSWORD',password]]){
          let seen=false;text=text.replace(new RegExp('^'+key+'=.*$','gm'),()=>{if(seen)return '';seen=true;return key+'='+value;});
          if(!seen)text+='\n'+key+'='+value+'\n';
        }
        await writeFile(root+'.env',text,{mode:0o600});
      }
      process.env.MYSQL_USER = user; process.env.MYSQL_PASSWORD = password;
      const check = await mysql.createConnection(options());
      try { await check.execute('SELECT 1'); } finally { await check.end(); }
    }
    console.log('MySQL: mannequin_run e esquema prontos. Credenciais não exibidas.');
  } finally { await connection.end(); }
}
