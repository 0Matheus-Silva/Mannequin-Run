# Upgrade gráfico e animações cinematográficas

Implementado e verificado localmente em 14/11/2026. A evolução utiliza a arquitetura existente e o Three.js já armazenado no projeto. Nenhum recurso foi enviado ao Google Drive, GitHub ou serviço de publicação.

## Personagem

O manequim recebeu um novo rig procedural, com capacete angular, visor ciano, placas torácicas chanfradas, abdômen segmentado, proteção pélvica, coluna mecânica iluminada, juntas com anéis metálicos, mãos com dedos e pés próprios. Grafite fosco, metal escovado, prata, cromo, borracha escura e superfícies emissivas diferenciam as peças.

O modelo público continua acessível por `src/player/Mannequin.js`. A implementação nova fica em `CinematicMannequin.js`; a movimentação e o volume de colisão permanecem em `PlayerController.js`. Uma futura versão GLB pode implementar a mesma interface de raiz, atualização e reset de pose sem alterar a física.

Corrida, salto, deslizamento e colisão agora misturam poses com amortecimento. O deslizamento articula quadris e joelhos, inclina o tronco e aplica uma pequena correção de altura. Um teste confirma que a silhueta deslizando fica abaixo do vão existente de 1,18 m.

## Idle e sequência PLAY

No menu, o corpo fica orientado para a posição real da câmera. A cabeça complementa essa orientação com limites de rotação. Respiração, ombros, cabeça, mãos e distribuição de peso usam frequências diferentes e amplitudes pequenas para evitar um ciclo visual rígido.

Ao clicar em PLAY, o jogo entra no estado `starting`. A sequência nominal tem **2,65 segundos**:

1. A unidade reage e começa a orientar a cabeça para a pista.
2. O tronco acompanha, e o corpo gira progressivamente entre aproximadamente 0,48 e 1,72 s.
3. A câmera se desloca para a posição de acompanhamento.
4. A corrida começa a se misturar somente após 1,8 s, com o giro já concluído.
5. Ao terminar a sequência, entram a gameplay, o HUD e o anúncio do setor.

Os estados visuais são `menu_idle`, `menu_start_transition`, `turn_to_run` e `gameplay_run`, além da pose de colisão. Durante a apresentação, os controles de movimento ficam bloqueados, os obstáculos ficam inativos e distância/pontuação não avançam. Cliques repetidos não reiniciam a sequência. Escape pausa e retoma a apresentação do mesmo ponto. Reiniciar após Game Over continua imediato, para não repetir a introdução a cada tentativa.

O teste com o loop nativo do Edge e a GPU Intel concluiu a sequência em **2,737 s**, verificando que a orientação final já corresponde à pista.

## Abandoned Lab

O laboratório recebeu três camadas de composição:

- Próxima: passarelas, drenagem, caixas danificadas, trilhos e suportes estruturais.
- Intermediária: nichos com racks, bancadas científicas, monitores com gráficos, cápsulas, tubulações e painéis.
- Distante: corredores de serviço recuados, silhuetas de máquinas, estruturas elevadas, cabos suspensos e displays.

Os módulos usam variações determinísticas de equipamentos e danos, conservando a reciclagem dos dez segmentos. Geometrias e materiais são compartilhados. Vapor discreto e névoa complementam as partículas existentes; o vapor é desligado em Econômica.

Os outros três setores foram preservados e conferidos com o novo personagem, materiais compartilhados e renderização. A reconstrução arquitetônica detalhada desta entrega se concentra no Abandoned Lab, conforme a prioridade do pedido.

## Obstáculos e componentes

Os gabinetes ganharam molduras, painéis sobrepostos, ventilações, parafusos, bases e luzes de estado. As barreiras baixas usam estrutura chanfrada e listras de alerta. As vigas têm travessas, suportes, fixadores, iluminação vermelha e uma indicação de deslizamento.

Os três tipos conservam os parâmetros de colisão anteriores. Testes calculam os limites geométricos dos modelos e verificam que permanecem dentro dos envelopes existentes, com tolerância de 3 cm para acabamentos.

Os chips ganharam corpo metálico, contatos nos quatro lados, circuitos nas duas faces, núcleo luminoso e halo discreto. Rotação, flutuação, partículas, som de coleta e pontuação continuam funcionando. Não foram criadas novas regras ou hitboxes para a pista.

## Materiais, iluminação e renderização

- Texturas de metal escovado, desgaste, piso e telas geradas por código em canvas, sem downloads ou bibliotecas adicionais.
- Materiais PBR com metalness, roughness e emissividade diferentes por superfície.
- Ambiente de reflexão pré-filtrado gerado uma vez por PMREM a partir de painéis de estúdio procedurais.
- Luz principal fria, retrato com spotlight, recorte ciano e contraste âmbar.
- Sombras filtradas e sombra de contato suave sob o personagem.
- Renderização HDR com bloom moderado em resolução reduzida, tone mapping e vinheta discreta em Padrão/Alta.
- Filtro leve de bordas no compositor. Alta acrescenta MSAA 4×; Padrão evita esse custo de multisampling.
- Econômica mantém o render direto, reduz a resolução interna e desliga sombras e bloom.

Não foi adicionado SSAO, SSR ou ray tracing: a oclusão de contato é aproximada, os reflexos vêm do ambiente pré-filtrado e a atmosfera usa névoa/vapor. Essas escolhas preservam legibilidade e evitam passes pesados adicionais. A composição continua fixa em 1920 × 1080, dimensionada proporcionalmente em 16:9.

## Verificações

**121 verificações passaram:**

| Página | Verificações | Resultado |
| --- | ---: | --- |
| `tests/movement.html` | 15 | ALL PASS |
| `tests/mechanics.html` | 24 | ALL PASS |
| `tests/sectors.html` | 19 | ALL PASS |
| `tests/polish.html` | 23 | ALL PASS |
| `tests/smoke.html` | 12 | ALL PASS |
| `tests/upgrade.html` | 26 | ALL PASS |
| `tests/transition-realtime.html` | 2 | ALL PASS no loop real, GPU Intel |

Foram verificados menu, olhar para câmera, idle, preservação da pose ao clicar, sequência completa, pausa/retomada durante a apresentação, bloqueio de controles durante o giro, faixas, salto, deslizamento, colisões, limites dos modelos, coleta, pontuação, recorde, Game Over, reinício, áudio, configurações, shaders dos três níveis, saída do compositor e proporção 16:9.

As capturas `upgrade-menu.png`, `upgrade-sequence.png` e `upgrade-sectors.png`, em `.tmp-qa/`, foram inspecionadas. A galeria da sequência reúne menu, giro, preparação para corrida e gameplay; a galeria dos setores mostra o jogo atualizado nos quatro ambientes.

O teste smoke foi adaptado para avançar a sequência deterministicamente. O relógio virtual do navegador não reproduziu a cadência do requestAnimationFrame de forma confiável; a apresentação foi verificada adicionalmente com relógio real e GPU, sem simular o avanço do jogo.

## Desempenho observado e limites

Adaptador identificado: **Intel UHD Graphics 620, Direct3D 11, Edge headless**. Amostra curta de oito quadros após cinco quadros de aquecimento, com uma cena de corrida e obstáculos. A medição inclui atualização visual do manequim, envio de renderização e espera pelo próximo requestAnimationFrame. Não equivale a um benchmark de partida longa com todos os sistemas em carga máxima.

| Qualidade | Resolução interna | Média entre quadros | Maior intervalo | Taxa observada na amostra |
| --- | --- | ---: | ---: | ---: |
| Econômica | 1248 × 702 | 16,60 ms | 18,90 ms | 60,2 FPS |
| Padrão | 1920 × 1080 | 24,61 ms | 46,50 ms | 40,6 FPS |

Na cena de menu inspecionada, a renderização principal registrou cerca de **201 chamadas de desenho e 42.594 triângulos**; os passes de pós-processamento são adicionais. Os objetos estáticos repetidos usam instâncias, os objetos da pista continuam em nove grupos recicláveis, os efeitos mantêm 96 partículas e as alocações de render targets são liberadas ao mudar a qualidade.

O teste inicial que media apenas chamadas de renderização indicava aproximadamente 5/11 ms; esses números foram descartados como estimativa de FPS por não incluírem o intervalo real entre quadros. O método corrigido produziu a tabela acima. O renderer SwiftShader ficou muito lento no loop completo, inclusive no modo Econômico, e não serve como referência de fluidez deste jogo. Os testes determinísticos nele continuam úteis para regressões.

**Para esta Intel UHD 620, recomenda-se Econômica quando a prioridade for aproximar-se de 60 FPS.** Padrão/Alta priorizam acabamento e exigem mais da GPU. A meta de 60 FPS não foi comprovada em todas as qualidades, em partidas prolongadas ou em outros computadores. Tela cheia real e percepção sonora continuam exigindo avaliação interativa pelo usuário; seus controles foram preservados.

## Arquivos criados

- `src/graphics/Geometry.js`
- `src/graphics/SurfaceLibrary.js`
- `src/graphics/CinematicRenderer.js`
- `src/player/CinematicMannequin.js`
- `src/game/StartSequence.js`
- `src/environments/LabArchitecture.js`
- `src/obstacles/IndustrialModels.js`
- `tests/upgrade.html`
- `tests/upgrade-gallery.html`
- `tests/performance.html`
- `tests/transition-realtime.html`
- `tools/Measure-Render.ps1`
- `docs/UPGRADE-GRAFICO.md`

## Arquivos modificados

- `src/player/Mannequin.js`: exporta o novo modelo mantendo a implementação original como referência.
- `src/game/Game.js`: apresentação, câmera, luzes, ambiente, renderização e integração com qualidade/pausa.
- `src/environments/Laboratory.js` e `SectorWorld.js`: arquitetura, materiais, vapor e reciclagem.
- `src/obstacles/TrackObjects.js`: modelos industriais e chips.
- `src/ui/UI.js` e `styles/main.css`: início cinematográfico, HUD e pausa contextual.
- `tests/mechanics.html`, `smoke.html` e `scene.html`: adaptação ao início animado e à nova renderização.
- `tools/Test-Browser.ps1`: opção de usar o adaptador gráfico disponível.
- `README.md`, `VALIDACAO.md` e `docs/DESENVOLVIMENTO.md`: instruções e registro da entrega.

## Avaliar localmente

Com o servidor ativo, abra **http://localhost:8080** e atualize com Ctrl+F5. Observe o idle, clique em PLAY e aguarde a sequência. Escape também funciona durante a apresentação.

Para iniciar o servidor novamente:

```powershell
powershell -ExecutionPolicy Bypass -File .\Start-Game.ps1
```

Para repetir as verificações específicas e a medição na GPU disponível:

```powershell
powershell -ExecutionPolicy Bypass -File .\tools\Test-Browser.ps1 -Hardware -Page tests/upgrade.html
powershell -ExecutionPolicy Bypass -File .\tools\Measure-Render.ps1 -Hardware
powershell -ExecutionPolicy Bypass -File .\tools\Measure-Render.ps1 -Hardware -Page tests/transition-realtime.html -Report transition-hardware.txt
```

Os perfis de teste são isolados na pasta local e não compartilham os recordes do perfil normal do navegador. Não houve commit, push, alteração do remoto, uso de Google Drive ou publicação. A etapa de publicação continua pendente.
