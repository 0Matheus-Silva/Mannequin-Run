import { LIVE_ENDPOINT, ASSISTANT_CONFIG } from './Config.js';
export const pcmBase64=pcm=>{const bytes=new Uint8Array(pcm.length*2),view=new DataView(bytes.buffer);for(let i=0;i<pcm.length;i++)view.setInt16(i*2,pcm[i],true);let binary='';for(const byte of bytes)binary+=String.fromCharCode(byte);return btoa(binary);};
export function providerError(code){return ({429:'Cota ou limite indisponível. Escolha uma chave reserva e reconecte, ou tente novamente mais tarde.',403:'Integração bloqueada. A equipe precisa revisar público, termos e configuração.',503:'API não configurada ou indisponível. A demonstração local continua disponível.',1008:'Sessão recusada pelo provedor. Verifique configuração e cota antes de tentar novamente.'})[code]??'Conexão interrompida. O microfone foi desligado. Reconecte manualmente ou use a demonstração local.';}
export class GeminiProvider{
  constructor(emit,{fetcher=(...args)=>globalThis.fetch(...args),Socket=WebSocket,toolHandler,slot="principal"}={}){this.emit=emit;this.slot=slot;this.fetcher=fetcher;this.Socket=Socket;this.toolHandler=toolHandler;this.kind='live';this.closed=false;this.serial=Promise.resolve();}
  async connect(){
    const configResponse=await this.fetcher('/api/assistant/config',{cache:'no-store'});if(!configResponse.ok)throw Error(providerError(503));const config=await configResponse.json();if(!config.ready)throw Error(config.reason??providerError(403));
    const response=await this.fetcher('/api/assistant/token',{method:'POST',headers:{'Content-Type':'application/json','X-Assistant-CSRF':config.csrf},body:JSON.stringify({slot:this.slot}),signal:AbortSignal.timeout(15000)});
    if(!response.ok){const failure=await response.json().catch(()=>null);const known=['local_cooldown','local_daily_limit','provider_quota','provider_unavailable'];throw Error(known.includes(failure?.code)&&typeof failure.error==='string'?failure.error:providerError(response.status));}const credentials=await response.json();
    if(this.closed)return;
    await new Promise((resolve,reject)=>{
      const socket=this.socket=new this.Socket(LIVE_ENDPOINT+'?access_token='+encodeURIComponent(credentials.token));
      const timer=setTimeout(()=>{reject(Error('Tempo de conexão excedido. Tente a demonstração local.'));this.close();},12000);
      socket.onopen=()=>socket.send(JSON.stringify({setup:credentials.setup}));
      socket.onmessage=event=>{this.serial=this.serial.then(async()=>{
        let message;try{message=JSON.parse(typeof event.data==='string'?event.data:await event.data.text());}
        catch{this.emit({type:'error',text:'Resposta inválida do provedor.'});this.close();return;}
        if(message.setupComplete){clearTimeout(timer);resolve();}
        try{await this.handle(message);}catch{this.emit({type:'error',text:'Não foi possível processar a resposta recebida. Interrompa a fala e reconecte.'});this.close();}
      });};
      socket.onerror=()=>{clearTimeout(timer);reject(Error(providerError(503)));};
      socket.onclose=event=>{clearTimeout(timer);reject(Error(providerError(event.code)));if(!this.closed)this.emit({type:'error',text:providerError(event.code)});};
    });
    this.timer=setTimeout(()=>{this.emit({type:'error',text:'Limite local de três minutos atingido. Inicie outra sessão manualmente.'});this.close();},ASSISTANT_CONFIG.maxSessionSeconds*1000);
  }
  async handle(message){
    if(this.closed)return;
    if(message.error){this.emit({type:'error',text:providerError(message.error.code)});this.close();return;}
    if(message.goAway){this.emit({type:'error',text:'O provedor vai encerrar a conexão. Reconecte manualmente; o histórico não é reenviado.'});this.close();return;}
    if(message.toolCall?.functionCalls){const functionResponses=[];for(const call of message.toolCall.functionCalls){let response;try{if(!this.toolHandler)throw Error('Reprodutor indisponível.');response={result:await this.toolHandler(call.name,call.args||{})};}catch(error){response={error:error.message||'Não foi possível executar o comando.'};}functionResponses.push({id:call.id,name:call.name,response});}this.send({toolResponse:{functionResponses}});}
    const content=message.serverContent;if(!content)return;
    if(content.interrupted)this.emit({type:'interrupt'});
    if(content.inputTranscription?.text)this.emit({type:'transcript',role:'user',text:content.inputTranscription.text});
    if(content.outputTranscription?.text)this.emit({type:'transcript',role:'assistant',text:content.outputTranscription.text});
    for(const part of content.modelTurn?.parts??[]){if(part.inlineData?.data&&part.inlineData.mimeType?.startsWith('audio/pcm'))this.emit({type:'audio',data:part.inlineData.data});}
    if(content.turnComplete)this.emit({type:'turn'});
  }
  send(value){if(this.socket?.readyState===1&&this.socket.bufferedAmount<262144)this.socket.send(JSON.stringify(value));}
  reply(text){this.send({clientContent:{turns:[{role:'user',parts:[{text}]}],turnComplete:true}});}
  audio(pcm){this.send({realtimeInput:{audio:{data:pcmBase64(pcm),mimeType:'audio/pcm;rate=16000'}}});}
  endAudio(){this.send({realtimeInput:{audioStreamEnd:true}});}
  close(){this.closed=true;clearTimeout(this.timer);if(this.socket){this.socket.onclose=null;this.socket.close();this.socket=null;}}
}
