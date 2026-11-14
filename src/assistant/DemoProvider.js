const normalize=text=>text.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
export class DemoProvider{
  constructor(knowledge,personality){this.knowledge=knowledge;this.personality=personality;this.turn=0;this.lastTopic='project';this.kind='demo';}
  async connect(){return this.personality.greetings[this.turn++%this.personality.greetings.length];}
  async reply(text){
    const q=normalize(text);let topic;
    if(/(cpu|gpu|processador|ram|memoria|fonte|rtx|especific|quanto custa|preco)/.test(q))topic='hardware';
    else if(/(pont|recorde|score)/.test(q))topic='score';
    else if(/(control|tecla|como jog|pular|saltar|desliz)/.test(q))topic='controls';
    else if(/(infinit)/.test(q))topic='infinite';
    else if(/(historia|campanha|capitulo|podio|trofeu)/.test(q))topic='story';
    else if(/(setor|cenario|ambiente|fase)/.test(q))topic='sectors';
    else if(/(obstac|colet|component)/.test(q))topic='obstacles';
    else if(/(tecnolog|program|three|javascript|feito|desenvolv)/.test(q))topic='technology';
    else if(/(hardware|computador|gabinete|tronco)/.test(q))topic='hardware';
    else if(/(mascara|roupa|capuz|personagem|manequim)/.test(q))topic='character';
    else if(/(equipe|criador|autor|semestral|cdc|projeto)/.test(q))topic='project';
    else if(/(expotec|unifecaf|evento)/.test(q))topic='event';
    else if(/(voce e|quem e|mora|pensa|conscien)/.test(q))return 'Sou o personagem do projeto, interpretado aqui por uma demonstração local roteirizada. Não sou uma consciência real. Mas minha casa no manequim é bem concreta — só falta a geladeira!';
    else if(/(mais|isso|continue|detalhe)/.test(q))topic=this.lastTopic;
    else if(/^(oi|ola|bom dia|boa tarde|boa noite|e ai)[!? .]*$/.test(q))return this.personality.greetings[this.turn++%this.personality.greetings.length];
    if(!topic)return this.knowledge.unknown;
    this.lastTopic=topic;const suffix=this.turn++%3===0?' '+this.personality.followups[this.turn%this.personality.followups.length]:'';
    return this.knowledge[topic]+suffix;
  }
  close(){this.lastTopic='project';}
}
