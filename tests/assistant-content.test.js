import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {DemoProvider} from '../src/assistant/DemoProvider.js';
const knowledge=JSON.parse(await readFile(new URL('../assets/assistant/knowledge.json',import.meta.url),'utf8'));
const personality=JSON.parse(await readFile(new URL('../assets/assistant/personality.json',import.meta.url),'utf8'));
test('Nexus identifies the project and assistant, while Nexus Run identifies the game',async()=>{
 const demo=new DemoProvider(knowledge,personality);
 assert.equal(await demo.reply('Apresente o Nexus'),knowledge.presentation);
 assert.ok((await demo.reply('Apresente o Nexus Run')).startsWith(knowledge.game));
 assert.match(knowledge.identity,/chatbot oficial.*projeto Nexus/);
 assert.match(knowledge.game,/jogo Nexus Run/);
 assert.match(knowledge.masterScript,/O Nexus Run é um jogo/);
 assert.doesNotMatch(JSON.stringify([knowledge,personality]),/mannequin run|manequim run/i);
 const html=await readFile(new URL('../index.html',import.meta.url),'utf8');
 assert.match(html,/<title>NEXUS RUN<\/title>/);
 assert.match(html,/<h2>NEXUS<\/h2>/);
});
test('full presentation introduces team, covers five ordered stages and closes with an invitation',async()=>{
 const demo=new DemoProvider(knowledge,personality),answer=await demo.reply('Apresente o projeto completo');
 assert.equal(answer,knowledge.presentation);assert.match(answer.split('\n')[0],/Matheus, Pedro e Victor/);
 const stages=['primeira etapa','segunda etapa','terceira etapa','quarta etapa','quinta etapa'];
 let previous=-1;for(const stage of stages){const at=answer.indexOf(stage);assert.ok(at>previous);previous=at;}
 for(const fact of ['i7-9700F','3.00 GHz','32 GB','2133 MHz','RTX 3050','8 GB','238 GB','B360M AORUS Gaming 3','Windows Server 2022','IIS','ngrok','4 GB','40 GB','dois processadores virtuais','HTML5','CSS3','JavaScript','Three.js','EXPOTECH 2026'])assert.ok(answer.includes(fact),fact);
 assert.match(answer,/Obrigado pela visita/);assert.match(answer,/gostaria de conhecer/);
});
test('specific questions route to every project stage without replaying the presentation',async()=>{
 const queries=[['Como foi a caracterização física?','physical'],['Quem fez o projeto?','team'],['Qual o processador?','cpu'],['Quanta RAM tem o computador?','ram'],['Qual a placa de vídeo?','gpu'],['Qual SSD?','storage'],['Qual a placa-mãe?','motherboard'],['Como funciona a máquina virtual?','vm'],['Quanta RAM foi alocada à VM?','vmResources'],['O que é IIS?','iis'],['Como funciona o ngrok?','ngrok'],['Qual Windows Server?','windowsServer'],['Explique o jogo','game'],['Quais os setores?','sectors'],['Como funciona o modo infinito?','infinite'],['Como foi desenvolvido o chatbot?','chatbot'],['Quais tecnologias do jogo?','technology'],['Existe salvamento MySQL?','persistence']];
 for(const [question,topic]of queries){const answer=await new DemoProvider(knowledge,personality).reply(question);assert.ok(answer.startsWith(knowledge[topic]),question);assert.ok(!answer.includes(knowledge.presentation),question);}
 for(const [question,topic]of [['Apresente o jogo','game'],['Apresente o hardware','hardware'],['Apresente a máquina virtual','vm']])assert.ok((await new DemoProvider(knowledge,personality).reply(question)).startsWith(knowledge[topic]),question);
});
test('scope keeps mobile and QR unavailable and distinguishes local ranking from online',async()=>{
 const d=new DemoProvider(knowledge,personality);for(const q of ['Tem QR Code?','Tem versão mobile?','Posso usar celular?','Existe ranking online?'])assert.ok((await d.reply(q)).startsWith(knowledge.scope),q);
 assert.match(knowledge.controls,/teste físico.*não foi confirmado/);assert.match(knowledge.persistence,/ranking online público confirmado/);
 assert.match(await d.reply('Qual fonte de alimentação?'),/Não tenho essa informação/);
 assert.match(await d.reply('Qual hipervisor?'),/Não tenho essa informação/);
});
test('master script is complete, compatible with the backend string schema, and personalities preserve factual boundaries',()=>{
 assert.ok(Object.values(knowledge).every(v=>typeof v==='string'));
 for(const heading of ['## 1. IDENTIDADE','## 10. FORMAS','OBJETIVO FINAL'])assert.ok(knowledge.masterScript.includes(heading));
 assert.ok(!JSON.stringify(knowledge).includes('Não há especificações confirmadas'));
 assert.match(personality.instruction,/32 GB/);assert.match(personality.instruction,/4 GB/);assert.match(personality.instruction,/não.*teste físico/);
});
test('collective authorship replaces individual task assignments throughout live knowledge',()=>{
 const text=JSON.stringify(knowledge)+' '+personality.instruction;
 assert.doesNotMatch(text,/caracterização de Pedro|VM de Pedro|jogo de Matheus|chatbot de Matheus|realizado por Matheus|realizada por Pedro|configurada por Pedro/);
 for(const name of ['Matheus','Pedro','Victor'])assert.equal(knowledge.presentation.split(name).length-1,1,name);
 assert.match(knowledge.team,/em conjunto/);assert.match(personality.instruction,/Não divida tarefas/);
});
