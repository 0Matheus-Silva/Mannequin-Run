import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { setup } from '../server/database/migrate.js';
import { createPool, root } from '../server/database/config.js';
import { snapshot, tables } from '../server/database/store.js';
const command = process.argv[2];
try {
  if (command === 'setup' || command === 'migrate') await setup({migrateOnly:command==='migrate'});
  else {
    const pool = createPool();
    try {
      if (command === 'check') {
        await pool.execute('SELECT 1 FROM schema_migrations LIMIT 1');
        console.log('Esquema MySQL disponível.');
      } else if (command === 'backup' || command === 'export') {
        const data = await snapshot(pool), folder = resolve(root,'.data/backups'); await mkdir(folder,{recursive:true});
        const filename = resolve(folder,new Date().toISOString().replace(/[:.]/g,'-')+(command==='backup'?'.json':'.csv'));
        if (command === 'backup') await writeFile(filename,JSON.stringify(data,null,2),{mode:0o600,flag:'wx'});
        else {
          const names = new Map(data.tables.players.map(p=>[p.id,p.name]));
          const safe = value => { let s=String(value??'');if(/^[=+@\-\t\r]/.test(s))s="'"+s;return '"'+s.replaceAll('"','""')+'"'; };
          const fields=['id','player_id','name','mode','score','distance','items','duration','result','practice','created_at'];
          const rows=data.tables.runs.map(r=>({...r,name:names.get(r.player_id)}));
          await writeFile(filename,'\ufeff'+[fields.join(','),...rows.map(r=>fields.map(k=>safe(r[k])).join(','))].join('\r\n'),{mode:0o600,flag:'wx'});
        }
        console.log('Arquivo local criado:',filename);
      } else if (command === 'restore') {
        const data = JSON.parse(await readFile(process.argv[3],'utf8'));
        if(data.format!=='mannequin-run-mysql-v1'||!tables.every(t=>Array.isArray(data.tables?.[t])))throw new Error('Backup incompatível.');
        const c = await pool.getConnection();
        try {
          await c.beginTransaction();
          const [[{count}]]=await c.query('SELECT COUNT(*) AS count FROM players');
          if(count)throw new Error('Restauração exige banco vazio para evitar sobrescrever visitantes.');
          for(const table of tables)for(const row of data.tables[table]){
            const [columns]=await c.query(`SHOW COLUMNS FROM ${table}`),allowed=new Set(columns.map(c=>c.Field)),keys=Object.keys(row);
            if(keys.some(k=>!allowed.has(k)))throw new Error('Coluna de backup inválida.');
            await c.execute(`INSERT INTO ${table} (${keys.map(k=>'`'+k+'`').join(',')}) VALUES (${keys.map(()=>'?').join(',')})`,keys.map(k=>row[k]));
          }
          await c.commit();console.log('Backup restaurado.');
        } catch(e) {await c.rollback();throw e;}finally{c.release();}
      } else throw new Error('Use setup, migrate, backup, export ou restore CAMINHO.');
    } finally {await pool.end();}
  }
} catch(error) {console.error(error.code ? 'Operação MySQL não concluída. Verifique serviço, permissões e credenciais no .env. Código: '+error.code : error.message);process.exitCode=1;}
