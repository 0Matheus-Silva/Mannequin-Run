import test from 'node:test';
import assert from 'node:assert/strict';
import {generateKeyPairSync,verify} from 'node:crypto';
import {readFile} from 'node:fs/promises';
import {signDeveloperToken,developerToken} from '../server/apple-music/token.js';
import {MusicBridge} from '../src/music/bridge.js';
const originalFetch=globalThis.fetch;
globalThis.fetch=async url=>({json:async()=>JSON.parse(await readFile(url,'utf8'))});
const {GeminiProvider}=await import('../src/assistant/GeminiProvider.js');globalThis.fetch=originalFetch;

test('Apple developer token uses a P-256 ES256 signature and bounded lifetime',async()=>{
 const {privateKey,publicKey}=generateKeyPairSync('ec',{namedCurve:'prime256v1'}),token=signDeveloperToken({team:'ABCDEFGHIJ',kid:'1234567890',key:privateKey,now:1700000000}),[header,payload,sig]=token.split('.');
 assert.deepEqual(JSON.parse(Buffer.from(header,'base64url')),{alg:'ES256',kid:'1234567890',typ:'JWT'});
 assert.equal(JSON.parse(Buffer.from(payload,'base64url')).exp,1700003600);
 assert.ok(verify('sha256',Buffer.from(header+'.'+payload),{key:publicKey,dsaEncoding:'ieee-p1363'},Buffer.from(sig,'base64url')));
 await assert.rejects(()=>developerToken({}),/não configuradas/);
});
test('Live tool returns actual player results and does not claim success on failure',async()=>{
 const sent=[],provider=new GeminiProvider(()=>{},{Socket:class{},toolHandler:async(name,args)=>{assert.equal(name,'controlar_apple_music');if(args.acao==='pause')throw Error('Conecte o reprodutor');return {message:'Reprodução iniciada.'};}});
 provider.socket={readyState:1,bufferedAmount:0,send:value=>sent.push(JSON.parse(value))};
 await provider.handle({toolCall:{functionCalls:[{id:'one',name:'controlar_apple_music',args:{acao:'play',busca:'música'}},{id:'two',name:'controlar_apple_music',args:{acao:'pause'}}]}});
 const responses=sent[0].toolResponse.functionResponses;assert.equal(responses[0].response.result.message,'Reprodução iniciada.');assert.match(responses[1].response.error,/Conecte/);
});
test('cross-tab bridge validates commands and returns the player response',async()=>{
 class Channel{postMessage(value){this.last=value;}close(){}}
 const bridge=new MusicBridge({Channel});const pending=bridge.command('play','Nome e artista');const request=bridge.channel.last;
 bridge.receive({kind:'response',id:request.id,ok:true,result:{message:'tocando'}});assert.equal((await pending).message,'tocando');
 await assert.rejects(()=>bridge.command('remove'),/inválido/);bridge.close();
});
