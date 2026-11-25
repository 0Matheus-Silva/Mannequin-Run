const $=id=>document.getElementById(id),channel=new BroadcastChannel('nexus-apple-music-v1');
let music=null,connected=false,playing=false,text='Preparando conexão…';
function publish(){channel.postMessage({kind:'status',connected,playing,text});$('status').textContent=text;$('connect').disabled=!music||connected;$('disconnect').disabled=!connected;}
async function initialize(){
  try{
    await fetch('/api/local/config',{cache:'no-store'});const response=await fetch('/api/apple-music/config',{cache:'no-store'});const config=await response.json();if(!response.ok)throw Error(config.error||'MusicKit não configurado.');
    await new Promise((resolve,reject)=>{if(window.MusicKit)return resolve();let timer;const done=()=>{clearTimeout(timer);document.removeEventListener('musickitloaded',done);resolve();};document.addEventListener('musickitloaded',done,{once:true});const script=document.createElement('script');script.src='https://js-cdn.music.apple.com/musickit/v3/musickit.js';script.onload=()=>{if(window.MusicKit)done();};script.onerror=()=>{clearTimeout(timer);document.removeEventListener('musickitloaded',done);reject(Error('Não foi possível carregar o MusicKit. Verifique sua conexão.'));};timer=setTimeout(()=>{document.removeEventListener('musickitloaded',done);reject(Error('O MusicKit demorou para carregar. Reabra esta aba.'));},15000);document.head.append(script);});
    music=await MusicKit.configure({developerToken:config.developerToken,app:{name:'Nexus Run',build:'1.0'}});music=music||MusicKit.getInstance();
    connected=Boolean(music.isAuthorized);text=connected?'Apple Music conectado.':'Clique em Conectar Apple Music e autorize sua conta.';
    for(const eventName of ['playbackStateDidChange','nowPlayingItemDidChange','authorizationStatusDidChange']){const event=MusicKit.Events?.[eventName]||eventName;music.addEventListener?.(event,()=>{connected=Boolean(music.isAuthorized);playing=Boolean(music.isPlaying);const item=music.nowPlayingItem?.attributes;text=connected?(item?.name?`${item.name} · ${item.artistName||''}`:'Apple Music conectado.'):'Apple Music desconectado.';publish();});}
  }catch(error){text=error.message||'Não foi possível preparar o MusicKit.';}publish();
}
async function execute(action,query=''){
  if(!music||!connected)throw Error('Conecte o Apple Music na aba do reprodutor primeiro.');
  if(action==='play'){
    query=String(query).trim().slice(0,180);if(!query)throw Error('Informe o nome da música ou do artista.');
    let storefront=music.storefrontId;if(typeof storefront!=='string'||!storefront){const country=await music.api.music('/v1/me/storefront');storefront=country?.data?.data?.[0]?.id;}
    if(!storefront||!/^[a-z]{2}$/i.test(storefront))throw Error('Não foi possível identificar a região da conta Apple Music.');
    const response=await music.api.music(`/v1/catalog/${storefront}/search`,{term:query,types:'songs',limit:10});const songs=response?.data?.results?.songs?.data||response?.data?.data?.results?.songs?.data||[];
    if(!songs.length)throw Error('Nenhuma música encontrada. Tente incluir o artista.');
    await music.setQueue({songs:songs.map(song=>song.id)});await music.play();playing=true;text=`${songs[0].attributes.name} · ${songs[0].attributes.artistName}`;publish();return {message:'Reprodução iniciada.',title:songs[0].attributes.name,artist:songs[0].attributes.artistName};
  }
  if(action==='pause'){await music.pause();playing=false;text='Música pausada.';}
  else if(action==='resume'){await music.play();playing=true;text='Reprodução retomada.';}
  else if(action==='next'){await music.skipToNextItem();}
  else if(action==='previous'){await music.skipToPreviousItem();}
  else throw Error('Comando inválido.');publish();return {message:text};
}
channel.onmessage=async event=>{const m=event.data;if(m?.kind==='hello'){publish();return;}if(m?.kind!=='command'||typeof m.id!=='string')return;try{const result=await execute(m.action,m.query);channel.postMessage({kind:'response',id:m.id,ok:true,result});}catch(error){const message=error.message||'Não foi possível reproduzir. Use os controles desta aba.';text=message;publish();channel.postMessage({kind:'response',id:m.id,ok:false,error:message});}};
$('connect').onclick=async()=>{try{await music.authorize();connected=Boolean(music.isAuthorized);text=connected?'Apple Music conectado. Volte ao jogo.':'A autorização não foi concluída.';}catch{connected=false;text='Não foi possível autorizar. Verifique a conta e permita a janela de login da Apple.';}publish();};
$('disconnect').onclick=async()=>{try{await music.unauthorize();connected=false;playing=false;text='Apple Music desconectado.';}catch{text='Não foi possível desconectar.';}publish();};
$('search').onsubmit=async event=>{event.preventDefault();try{await execute('play',$('query').value);}catch(error){text=error.message;publish();}};
for(const action of ['previous','pause','next'])$(action).onclick=()=>execute(action).catch(error=>{text=error.message;publish();});$('play').onclick=()=>execute('resume').catch(error=>{text=error.message;publish();});
addEventListener('pagehide',()=>{connected=false;playing=false;text='A aba do Apple Music foi fechada.';publish();channel.close();});void initialize();
