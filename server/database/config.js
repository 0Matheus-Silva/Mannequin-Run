import mysql from 'mysql2/promise';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
export const root = fileURLToPath(new URL('../../', import.meta.url));
export function loadEnvironment() {
  try { process.loadEnvFile(root + '.env'); } catch (error) { if (error.code !== 'ENOENT') throw error; }
}
loadEnvironment();
export const database = 'mannequin_run';
export function options({admin = false, withDatabase = true} = {}) {
  const host = process.env.MYSQL_HOST || '127.0.0.1';
  const ca = process.env.MYSQL_SSL_CA;
  if (!['127.0.0.1', 'localhost', '::1'].includes(host) && !ca) throw new Error('MySQL remoto requer MYSQL_SSL_CA com certificado verificável.');
  const user = admin ? process.env.MYSQL_ADMIN_USER : process.env.MYSQL_USER;
  const password = admin ? process.env.MYSQL_ADMIN_PASSWORD : process.env.MYSQL_PASSWORD;
  if (!user || !password) throw new Error(admin ? 'Preencha MYSQL_ADMIN_USER e MYSQL_ADMIN_PASSWORD no .env local.' : 'Credenciais MySQL locais ainda não configuradas.');
  return {host, port: Number(process.env.MYSQL_PORT || 3306), user, password,
    ...(withDatabase ? {database} : {}), ...(ca ? {ssl: {ca: readFileSync(ca), rejectUnauthorized: true, verifyIdentity: !['127.0.0.1','localhost','::1'].includes(host)}} : {}),
    charset: 'utf8mb4', timezone: 'Z', decimalNumbers: true, dateStrings: true,
    multipleStatements: false, connectTimeout: 5000};
}
export function createPool() {
  return mysql.createPool({...options(), waitForConnections: true, connectionLimit: 5, queueLimit: 30,
    maxIdle: 3, idleTimeout: 60000, enableKeepAlive: true});
}
