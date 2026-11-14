export const STORY_CHAPTERS=[
  {id:'campaign',name:'Início da campanha',distance:0},
  {id:'laboratory',name:'Setor 01 — Laboratório Abandonado',distance:0},
  {id:'city',name:'Setor 02 — Cidade em Ruínas',distance:600},
  {id:'industry',name:'Setor 03 — Complexo Industrial',distance:1200},
  {id:'contamination',name:'Setor 04 — Zona Contaminada',distance:1800},
  {id:'arrival',name:'Chegada à UniFECAF',distance:2300},
  {id:'entrance',name:'Entrada da UniFECAF',distance:2400,endingTime:5},
  {id:'ceremony',name:'Cerimônia da EXPOTECH 2026',distance:2400,endingTime:21},
];
export const chapterById=id=>STORY_CHAPTERS.find(chapter=>chapter.id===id)??STORY_CHAPTERS[0];
