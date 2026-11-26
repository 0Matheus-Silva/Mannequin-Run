import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, relative, extname } from 'node:path';
import { randomBytes } from 'node:crypto';
import { createPool, root } from './database/config.js';
import { Store, snapshot } from './database/store.js';
import { Invalid } from './database/validation.js';
const port=Number(process.env.LOCAL_PORT||8084), assistantPort=Number(process.env.ASSISTANT_PORT||8081);
let pool,store;try{pool=createPool();store=new Store(pool);}catch{}
const sessions=new Map(), origins=new Set([`http://127.0.0.1:${port}`,`http://localhost:${port}`]);
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.svg':'image/svg+xml','.wav':'audio/wav','.ico':'image/x-icon'};
function reply(res,status,data,headers={}){res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff',...headers});res.end(JSON.stringify(data));}
async function body(req){let data='',size=0;for await(const chunk of req){size+=chunk.length;if(size>65536)throw new Invalid('Requisição grande demais.',413);data+=chunk;}try{return JSON.parse(data||'{}');}catch{throw new Invalid('JSON inválido.');}}
function session(req){const id=req.headers.cookie?.match(/(?:^|;\s*)mnq_session=([a-f0-9]{64})(?:;|$)/)?.[1];return sessions.get(id);}
const server=http.createServer(async(req,res)=>{
  try {
    if(!['127.0.0.1:'+port,'localhost:'+port].includes(req.headers.host)||req.headers.origin&&!origins.has(req.headers.origin))return reply(res,403,{error:'Origem não autorizada.'});
    const url=new URL(req.url,'http://127.0.0.1:'+port),path=decodeURIComponent(url.pathname);
    if(path.startsWith('/api/assistant/')){
      if(!['GET','POST'].includes(req.method))return reply(res,405,{error:'Método inválido.'});
      if(req.method==='POST'&&!origins.has(req.headers.origin))return reply(res,403,{error:'Origem não autorizada.'});
      const data=req.method==='POST'?JSON.stringify(await body(req)):undefined;
      try{
        const response=await fetch(`http://127.0.0.1:${assistantPort}${url.pathname}`,{method:req.method,headers:{'Content-Type':'application/json','Origin':`http://127.0.0.1:${assistantPort}`,'X-Assistant-CSRF':req.headers['x-assistant-csrf']||''},body:data,signal:AbortSignal.timeout(16000)});
        return reply(res,response.status,await response.json());
      }catch{return reply(res,503,{error:'Backend Gemini indisponível. A demonstração local continua disponível.'});}
    }
    if(path==='/api/local/config'&&req.method==='GET'){
      let s=session(req),cookie={};
      if(!s){const now=Date.now();for(const [id,v]of sessions)if(now-v.created>86400000)sessions.delete(id);if(sessions.size>2000)sessions.clear();const id=randomBytes(32).toString('hex');s={csrf:randomBytes(32).toString('hex'),created:now};sessions.set(id,s);cookie={'Set-Cookie':`mnq_session=${id}; HttpOnly; SameSite=Strict; Path=/; Max-Age=86400`};}
      let ready=false;try{await pool?.execute('SELECT 1 FROM players LIMIT 1');ready=Boolean(pool);}catch{}
      return reply(res,200,{ready,csrf:s.csrf,storage:ready?'mysql':'pending',message:ready?'MySQL local disponível.':'Banco indisponível. Dados ficam pendentes neste navegador até sincronizar.'},cookie);
    }
    if(path.startsWith('/api/')){
      const s=session(req);if(!s)return reply(res,403,{error:'Abra o jogo para iniciar uma sessão local.'});
      if(!['GET','HEAD'].includes(req.method)&&(!origins.has(req.headers.origin)||req.headers['x-local-csrf']!==s.csrf))return reply(res,403,{error:'Requisição não autorizada.'});
      if(!store)return reply(res,503,{error:'MySQL ainda não configurado.'});
      if(path==='/api/players'&&req.method==='GET')return reply(res,200,await store.players(url.searchParams.get('q')||''));
      if(path==='/api/players'&&req.method==='POST')return reply(res,200,await store.createPlayer(await body(req)));
      const profile=path.match(/^\/api\/players\/([a-f0-9-]+)$/i);
      if(profile&&req.method==='GET')return reply(res,200,await store.profile(profile[1]));
      if(profile&&req.method==='DELETE')return reply(res,200,await store.deletePlayer(profile[1]));
      if(path==='/api/runs'&&req.method==='POST')return reply(res,200,await store.saveRun(await body(req)));
      if(path==='/api/ranking'&&req.method==='GET')return reply(res,200,await store.ranking(url.searchParams.get('mode')||'all'));
      if(path==='/api/results/export'&&req.method==='POST')return reply(res,200,await snapshot(pool),{'Content-Disposition':'attachment; filename="nexus-resultados.json"'});
      return reply(res,404,{error:'Rota inexistente.'});
    }
    if(!['GET','HEAD'].includes(req.method))return reply(res,405,{error:'Método inválido.'});
    const name=path==='/'?'index.html':path.slice(1),target=resolve(root,name),parts=relative(root,target).split(/[\\/]/);
    if(parts.some(p=>p.startsWith('.'))||!(name==='index.html'||['src','styles','assets','tests'].includes(parts[0]))||!mime[extname(target)])return reply(res,404,{error:'Não encontrado.'});
    const metadata=await stat(target);if(!metadata.isFile())return reply(res,404,{error:'Não encontrado.'});
    const data=await readFile(target);res.writeHead(200,{'Content-Type':mime[extname(target)],'Content-Length':data.length,'Cache-Control':'no-cache','X-Content-Type-Options':'nosniff'});res.end(req.method==='HEAD'?undefined:data);
  }catch(error){reply(res,error instanceof Invalid?error.status:error.code==='ENOENT'?404:503,{error:error instanceof Invalid?error.message:'Serviço local indisponível. Dados pendentes serão preservados no navegador.'});}
});
server.listen(port,'127.0.0.1',()=>console.log(`NEXUS RUN: http://127.0.0.1:${port} — jogadores MySQL + Gemini preservado`));
async function close(){server.close();await pool?.end();}process.on('SIGTERM',close);process.on('SIGINT',close);
