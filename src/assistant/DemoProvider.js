const normalize=text=>text.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
export class DemoProvider{
  constructor(knowledge,personality){this.knowledge=knowledge;this.personality=personality;this.turn=0;this.lastTopic='project';this.kind='demo';}
  async connect(){return this.personality.greetings[this.turn++%this.personality.greetings.length];}
  async reply(text){
    const q=normalize(text);let topic;
    if(/(qr\s*code|qrcode|celular|mobile|smartphone|ranking online)/.test(q))topic='scope';
    else if(/(fonte de alimentacao|qual fonte|quantos watts|quanto custa|preco|qual hipervisor|virtualbox|vmware|endereco atual|link atual)/.test(q))topic='unknown';
    else if(/(projeto (completo|inteiro)|todas as etapas|todo o projeto|processo completo|apresentacao completa|apresente o projeto|apresente o manequim run|apresente o mannequin run)/.test(q))topic='presentation';
    else if(/(primeira etapa|etapa 1|caracteriz|transformacao|manequim fisico)/.test(q))topic='physical';
    else if(/(segunda etapa|etapa 2)/.test(q))topic='hardware';
    else if(/(terceira etapa|etapa 3)/.test(q))topic='vm';
    else if(/(quarta etapa|etapa 4)/.test(q))topic='game';
    else if(/(quinta etapa|etapa 5)/.test(q))topic='chatbot';
    else if(/(equipe|integrante|quem (fez|criou|desenvolveu)|matheus|pedro|victor|vitor|autor|criador|responsavel)/.test(q))topic='team';
    else if(/(ngrok|tunel|https|acesso externo)/.test(q))topic='ngrok';
    else if(/\biis\b|internet information services/.test(q))topic='iis';
    else if(/(windows server|sistema operacional)/.test(q))topic='windowsServer';
    else if(/\bvm\b|maquina virtual|virtualiz/.test(q))topic=/(ram|memoria|disco|recurso|processador|cpu|32|4 gb)/.test(q)?'vmResources':'vm';
    else if(/(chatbot|assistente|gemini|inteligencia artificial|sadachbia)/.test(q))topic='chatbot';
    else if(/(banco de dados|mysql|salvamento|checkpoint|perfil|ranking|historico)/.test(q))topic='persistence';
    else if(/(cpu|processador)/.test(q)&&/(ram|memoria|gpu|placa de video|ssd)/.test(q))topic='hardware';
    else if(/(gpu|placa de video|rtx|vram|memoria dedicada)/.test(q))topic='gpu';
    else if(/(cpu|processador|i7)/.test(q))topic='cpu';
    else if(/(ram|memoria|2133)/.test(q))topic='ram';
    else if(/(ssd|armazenamento|disco)/.test(q))topic='storage';
    else if(/(placa.mae|aorus|b360)/.test(q))topic='motherboard';
    else if(/(hardware|especific|computador|gabinete|tronco)/.test(q))topic='hardware';
    else if(/(pont|recorde|score)/.test(q))topic='score';
    else if(/(control|tecla|como jog|pular|saltar|desliz)/.test(q))topic='controls';
    else if(/(infinit)/.test(q))topic='infinite';
    else if(/(historia|campanha|capitulo|podio|trofeu)/.test(q))topic='story';
    else if(/(setor|cenario|ambiente|fase)/.test(q))topic='sectors';
    else if(/(obstac|colet|component)/.test(q))topic='obstacles';
    else if(/(tecnolog|program|three|javascript|html|css|feito|desenvolv)/.test(q))topic='technology';
    else if(/(mascara|roupa|capuz|personagem|manequim)/.test(q))topic='character';
    else if(/(semestral|cdc|projeto)/.test(q))topic='project';
    else if(/(jogo|jogabilidade|endless|subway)/.test(q))topic='game';
    else if(/(expotec|unifecaf|evento)/.test(q))topic='event';
    else if(/(voce e|quem e|mora|pensa|conscien)/.test(q))return this.knowledge.identity+' Nesta modalidade, minhas respostas são uma demonstração local roteirizada.';
    else if(/apresent/.test(q))topic='presentation';
    else if(/(mais|isso|continue|detalhe)/.test(q))topic=this.lastTopic;
    else if(/^(oi|ola|bom dia|boa tarde|boa noite|e ai)[!? .]*$/.test(q))return this.personality.greetings[this.turn++%this.personality.greetings.length];
    if(!topic)return this.knowledge.unknown;
    this.lastTopic=topic;const suffix=this.turn++%3===0?' '+this.personality.followups[this.turn%this.personality.followups.length]:'';
    return this.knowledge[topic]+(topic==='presentation'||topic==='unknown'?'':suffix);
  }
  close(){this.lastTopic='project';}
}
