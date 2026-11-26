// One-time asset generation. The API key stays in the local environment or .env.
import { readFile, writeFile } from 'node:fs/promises';
const env=await readFile(new URL('../.env',import.meta.url),'utf8').catch(()=>'');
const slot=process.argv[3]||'GEMINI_API_KEY';
if(!['GEMINI_API_KEY','GEMINI_API_KEY_2','GEMINI_API_KEY_3'].includes(slot))throw Error('Chave selecionada inválida.');
const key=process.env[slot]||env.match(new RegExp('^\\s*'+slot+'\\s*=\\s*["\']?([^\\s"\']+)','m'))?.[1];
if(!key)throw Error('Chave Gemini principal não configurada.');
const lines={
 'nexus-quase-1':'Ufa, achei que eu viraria peça de reposição.',
 'nexus-tropeco-1':'Nós tropica mas não cai. [Dê uma risada curta, espontânea e audível.]',
 'nexus-derrota-1':'Aí não dá, né? Tá de brincadeira!',
 'nexus-derrota-matheus':'Haja paciência... Matheus, me ajuda aqui!',
 'nexus-derrota-pedro':'Haja paciência... Pedro, me ajuda aqui!',
 'nexus-derrota-vitor':'Haja paciência... Victor, me ajuda aqui!',
 'nexus-cratera-1':'Na próxima a gente combina de desviar antes, tá?',
 'nexus-lava':'Por pouco não viro torrada tecnológica!',
 'nexus-ponte-1':'Se ouvir alguma tábua estalando, finge que foi minha coluna.',
 'nexus-ponte-2':'Só não olha pra baixo. Eu olhei e não recomendo.',
 'nexus-servidor':'Segura firme, amigão, estamos trazendo suas peças!',
 'nexus-servidor-pecas':'Se isso não funcionar, alguém já tentou desligar e ligar de novo?',
 'nexus-vitoria-1':'Chegamos em primeiro! Agora alguém pode verificar meus parafusos?'
};
const name=process.argv[2];if(!lines[name])throw Error('Escolha um nome de áudio cadastrado no roteiro.');
const delivery=name.startsWith('nexus-derrota-')&&name!=='nexus-derrota-1'?'dizendo Haja paciência com irritação leve e cômica, fazendo uma breve pausa e chamando pelo nome com um pedido de ajuda natural, sem exagero':'com interpretação natural';
const request={contents:[{parts:[{text:'Fale em português brasileiro, como um personagem masculino amigável e descontraído. Diga somente a fala a seguir, '+delivery+': '+lines[name]}]}],generationConfig:{responseModalities:['AUDIO'],speechConfig:{voiceConfig:{prebuiltVoiceConfig:{voiceName:'Sadachbia'}}}}};
const response=await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent',{method:'POST',headers:{'Content-Type':'application/json','x-goog-api-key':key},body:JSON.stringify(request)});
if(!response.ok)throw Error('Geração de voz indisponível (HTTP '+response.status+').');
const result=await response.json(),part=result.candidates?.[0]?.content?.parts?.find(p=>p.inlineData?.data);if(!part)throw Error('O serviço não retornou áudio.');
const pcm=Buffer.from(part.inlineData.data,'base64'),header=Buffer.alloc(44);header.write('RIFF');header.writeUInt32LE(pcm.length+36,4);header.write('WAVEfmt ',8);header.writeUInt32LE(16,16);header.writeUInt16LE(1,20);header.writeUInt16LE(1,22);header.writeUInt32LE(24000,24);header.writeUInt32LE(48000,28);header.writeUInt16LE(2,32);header.writeUInt16LE(16,34);header.write('data',36);header.writeUInt32LE(pcm.length,40);
await writeFile(new URL('../assets/audio/'+name+'.wav',import.meta.url),Buffer.concat([header,pcm]));console.log('Áudio gerado: '+name);
