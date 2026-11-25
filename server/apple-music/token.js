import { readFile } from 'node:fs/promises';
import { createPrivateKey, sign } from 'node:crypto';
import { resolve } from 'node:path';
import { root } from '../database/config.js';

export async function developerToken(env=process.env,now=Math.floor(Date.now()/1000)){
  const team=env.APPLE_MUSIC_TEAM_ID?.trim(),kid=env.APPLE_MUSIC_KEY_ID?.trim();
  if(!/^[A-Z0-9]{10}$/.test(team||'')||!/^[A-Z0-9]{10}$/.test(kid||''))throw Error('Credenciais Apple de desenvolvedor não configuradas.');
  const path=resolve(root,'.data','apple-music','AuthKey.p8');
  let key;try{key=createPrivateKey(await readFile(path));}catch{throw Error('Chave MusicKit não encontrada ou inválida em .data/apple-music/AuthKey.p8.');}
  return signDeveloperToken({team,kid,key,now});
}
export function signDeveloperToken({team,kid,key,now}){
  if(!/^[A-Z0-9]{10}$/.test(team||'')||!/^[A-Z0-9]{10}$/.test(kid||''))throw Error('Identificadores Apple inválidos.');
  if(key.asymmetricKeyType!=='ec'||key.asymmetricKeyDetails?.namedCurve!=='prime256v1')throw Error('A chave MusicKit precisa usar a curva P-256.');
  const encode=value=>Buffer.from(JSON.stringify(value)).toString('base64url');
  const head=encode({alg:'ES256',kid,typ:'JWT'}),payload=encode({iss:team,iat:now,exp:now+3600});
  const input=head+'.'+payload,signature=sign('sha256',Buffer.from(input),{key,dsaEncoding:'ieee-p1363'}).toString('base64url');
  return input+'.'+signature;
}
