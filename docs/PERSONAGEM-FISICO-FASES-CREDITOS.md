# Personagem físico, capítulos e créditos CDC2NA

Entrega local de desenvolvimento — 14/11/2026.

## Referência e escopo

Foi lido integralmente `PROMPT_MESTRE_PERSONAGEM_FISICO_E_FASES.md`, localizado no pacote de mesmo nome dentro do projeto. A fotografia `referencias/referencia_personagem_fisico.jpg` desse pacote foi aberta e inspecionada como referência obrigatória.

O design enferrujado anterior foi substituído para atender à nova referência: manequim físico branco vestido com roupa preta, máscara tecnológica ciano e computador exposto. A construção visual foi separada da animação; os controladores de corrida, salto, deslize e colisões continuam os mesmos. Cenários, fachada, participantes laterais do pódio, rotas de coleta, áudio e velocidades não foram reconstruídos nesta entrega.

## Protagonista atualizado

- Manequim branco visível no pescoço, peito, abdômen e mãos.
- Jaqueta preta aberta, com painéis alongados, lapelas, zíper, costuras, cordões e material fosco com textura procedural de tecido.
- Calça preta e calçados escuros. Mangas e pernas possuem volumes contínuos para evitar o aspecto de peças metálicas separadas.
- Capuz preto envolvendo a cabeça; máscara preta com traços ciano curvos e segmentados, assimétricos, e detalhe circular de respiração, seguindo a fotografia.
- Gabinete aberto integrado ao torso: placa de circuito, cooler, módulos de memória, placa gráfica com dissipador, estrutura metálica e cabos amarelos. A abertura frontal permanece livre entre as lapelas.
- Abertura de serviço traseira com componentes aparentes, para manter a leitura tecnológica durante a corrida vista por trás. Essa parte é uma interpretação, pois a fotografia fornecida mostra a frente.
- Mãos brancas com quatro dedos e polegar. Os dedos permanecem no rig para continuar animando, em vez de serem incorporados ao agrupamento de malhas estáticas.

Mantidos: respiração e movimento de espera, olhar para a câmera, giro antes da corrida, animações de braços/pernas, salto, recuperação do pouso, postura de deslize, queda controlada e levantamento da taça. O volume visual do novo capuz/roupa passou no teste de folga sob a estrutura de 1,18 m do deslize. Os colisores não foram ampliados.

Geometrias pequenas foram simplificadas e compartilhadas nas mãos, cooler e partes de roupa. O hardware é geometria, sem substituir o tronco por uma fotografia ou painel plano da referência.

## Seletor do Modo História

No menu, o botão **CAPÍTULOS**, ao lado de **COMO JOGAR**, abre **Selecionar fase da campanha**. Escolha um dos oito trechos e clique **INICIAR TRECHO**:

| Opção | Estado inicial |
|---|---|
| Início da campanha | Partida normal desde 0 m, com animação de abertura. |
| Setor 01 — Laboratório Abandonado | Corrida no laboratório, a partir de 0 m. |
| Setor 02 — Cidade em Ruínas | Corrida na cidade, a partir de 600 m. |
| Setor 03 — Complexo Industrial | Corrida industrial, a partir de 1.200 m. |
| Setor 04 — Zona Contaminada | Corrida na zona contaminada, a partir de 1.800 m. |
| Chegada à UniFECAF | Corrida a partir de 2.300 m, com a faculdade visível ao longe; continua até a entrada e a cerimônia. |
| Entrada da UniFECAF | Sequência dirigida pouco antes do portal, com as folhas da porta em movimento e a passagem seguinte preservada. |
| Cerimônia da EXPOTECH 2026 | Protagonista no primeiro lugar, participantes laterais preparados e início da entrega/levantamento da taça. |

Os setores preparam arquitetura pela posição real dos segmentos, paleta, atmosfera, porta, HUD e áudio correspondente. O segmento anterior pode permanecer atrás do personagem na fronteira entre setores, preservando a continuidade espacial.

Os atalhos, exceto **Início da campanha**, são trechos de avaliação: a distância do HUD continua indicando o ponto real da campanha, mas a pontuação começa em zero no trecho e o recorde existente não é alterado. Isso evita ganhar recordes apenas por saltar para 2.300 m. O aviso está no seletor. **Reiniciar** retorna ao trecho escolhido; voltar ao menu e clicar **INICIAR** usa novamente o fluxo normal. O Modo Infinito ignora capítulos e continua desde o laboratório, com pontuação e recordes normais.

## Créditos solicitados

Os créditos automáticos começam **cinco segundos depois de o protagonista ocupar completamente o primeiro lugar**. O pódio é ocupado no segundo 21 da sequência, e a rolagem começa no segundo 26. No atalho da cerimônia, isso corresponde a cinco segundos após iniciar o trecho.

Os textos sobem sobre a cena do pódio, nesta ordem:

**CDC2NA**

Fabiano Matheus de Camargo Silva  
Pedro Henrique Freitas de Oliveira  
Vitor Barioni Ferraz

A rolagem continua após aparecer a faixa de vitória, sem ficar congelada no fim da animação principal. Os créditos terminam e se ocultam sozinhos. O botão **VER CRÉDITOS**, na vitória, permite repeti-los.

Em **CONFIGURAÇÕES**, a opção **Créditos automáticos após o pódio** fica ligada por padrão e sua preferência é salva localmente. Desligar o automático mantém disponível a reprodução manual. Esc pausa a rolagem, inclusive após a vitória; retomada e pausa ao perder foco mantêm o tempo correto. Voltar ao menu limpa a apresentação. O Infinito não exibe esses créditos.

## Arquivos alterados

| Área | Arquivos |
|---|---|
| Novo modelo físico | `src/player/PhysicalRig.js` (novo), `src/player/CinematicMannequin.js` |
| Catálogo de capítulos | `src/game/Chapters.js` (novo) |
| Carregamento, reinício, pausa e sessão de avaliação | `src/game/Game.js`, `src/game/RunSession.js` |
| Temporização e repetição dos créditos | `src/story/StoryFinale.js` |
| Menu, seletor, opção e nomes | `index.html`, `src/ui/UI.js`, `styles/main.css` |
| Preferência local | `src/utils/Settings.js` |
| Validação | `tests/physical-chapters.html` (novo), `tests/upgrade.html`, `tests/finale-realtime.html`, `tests/package-scene.html` |
| Documentação | Este relatório, `README.md`, `docs/DESENVOLVIMENTO.md`, `VALIDACAO.md` |

## Testes

Testes executados no Edge local, com WebGL2 / ANGLE / D3D11 na Intel UHD Graphics 620. Suítes de lógica e integração usam relógio controlado; abertura e final também foram executados com o loop nativo e relógio real.

| Suíte | Verificações aprovadas |
|---|---:|
| Movimento | 15 |
| Mecânicas, colisão, coleta, pontuação e recorde | 25 |
| Setores e reciclagem | 19 |
| Áudio, preferências, menus e composição | 23 |
| Inicialização e fluxo básico | 12 |
| Rig, abertura, deslize e três qualidades gráficas | 26 |
| Integração do pacote visual | 41 |
| Chegada, pódio e 1.800 percursos de coleta simulados | 26 |
| Personagem físico, oito capítulos e créditos | 45 |
| Abertura no loop nativo | 2 |
| Final e créditos no loop nativo | 3 |
| **Total** | **237** |

A suíte nova verifica materiais/elementos do protagonista, dedos animados, seletor dentro da tela, carregamento de cada setor e dos três trechos finais, controles, colisão, reinício do capítulo, proteção do recorde, continuidade posterior, cinco segundos de espera dos créditos, nomes, rolagem, pausa, repetição manual, opção automática, persistência e isolamento do Infinito.

As verificações anteriores continuam cobrindo a folga real do deslize, giro, queda acima do piso, hitboxes, rotas possíveis, enquadramento completo do pódio, participantes e troféu, coleta, áudio, pausa e materiais nos três níveis gráficos. As contagens de recursos de GPU se mantiveram estáveis no teste de ciclos completos dos setores.

A abertura nativa levou **2,711 s**. O teste nativo do final e dos créditos executou **2.137 quadros em 38,570 s**, atravessando todas as fases e confirmando que a rolagem continua após a vitória. Esse teste inclui tempo de exibição dos créditos, além da sequência principal de 30 s.

Capturas abertas para revisão: novo protagonista no menu, vista traseira na corrida, pódio, seletor de capítulos, créditos com os três nomes e configurações. Evidências locais: `.tmp-qa/fisico-*`. Os resultados de cada suíte foram salvos individualmente.

### Desempenho local

Após simplificar detalhes pequenos, a cena medida do laboratório ficou com 46.238 triângulos e 232 chamadas de desenho. Na amostra curta com cinco quadros de aquecimento, oito amostras, `gl.finish()` e `requestAnimationFrame`, em canvas lógico de 1920×1080:

| Qualidade | Média por quadro | FPS observado |
|---|---:|---:|
| Econômica | 16,65 ms | 60,1 |
| Padrão | 24,01 ms | 41,6 |
| Alta | 38,40 ms | 26,0 |

São medições específicas do laboratório na Intel UHD 620, não médias da campanha ou garantia de fluidez em outras máquinas. Alta continua abaixo de 60 FPS nessa GPU integrada. O teste de reciclagem estabilizou em 36 geometrias e 14 texturas de GPU na cena medida, sem crescimento nos ciclos comparados.

## Como executar e avaliar

```powershell
powershell -ExecutionPolicy Bypass -File .\Start-Game.ps1
```

Abra `http://localhost:8080`. Para avaliação rápida, use **CAPÍTULOS → Cerimônia da EXPOTECH 2026 → INICIAR TRECHO**: o protagonista já aparece no pódio e os créditos começam cinco segundos depois. Use **Entrada da UniFECAF** para observar o acesso e **Chegada à UniFECAF** para observar a aproximação jogável.

Para repetir o teste integrado:

```powershell
powershell -ExecutionPolicy Bypass -File tools/Test-Browser.ps1 -Hardware -Page tests/physical-chapters.html
powershell -ExecutionPolicy Bypass -File tools/Measure-Render.ps1 -Hardware -Page tests/finale-realtime.html -Report fisico-final-nativo.txt
```

## Limitações

O protagonista é uma reconstrução procedural 3D baseada em uma fotografia, com os elementos visuais obrigatórios; não é uma digitalização ou reprodução fotográfica idêntica. A roupa acompanha o rig, sem simulação física de tecido. A máscara é especialmente visível no menu e na premiação; durante a corrida, a câmera vê o capuz por trás e a abertura de serviço do hardware.

Os atalhos da entrada e da cerimônia são cenas dirigidas, como os mesmos trechos do final normal. As etapas de corrida continuam controláveis. Não houve homologação prolongada em outras GPUs, avaliação auditiva humana ou teste interativo de tela cheia.

Tudo permanece no projeto local. Nenhum plugin, conector, serviço externo, upload, commit, push, deploy ou publicação foi utilizado.
