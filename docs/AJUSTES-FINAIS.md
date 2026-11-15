# Ajustes de idioma, UniFECAF, pódio e gameplay

Entrega de desenvolvimento local — 14/11/2026.

## Escopo e diagnóstico

Pedido lido integralmente do anexo `c9bcaaa8-c97b-415e-ab6c-c744fdcb4800/Texto colado.txt`. A fotografia `MANNEQUIN_RUN_Codex_Visual_Package/referencias_visuais/referencia_fachada_real_unifecaf.png` foi novamente aberta e usada como referência arquitetônica prioritária.

O diagnóstico confirmou nomes de setores e botões ainda em inglês, campus formado por blocos retos e canteiros excessivamente artificiais, ocultação imediata da rua ao começar o final, ausência de portas próprias da faculdade, números do pódio próximos do piso e dois participantes que repetiam o protagonista. A coleta usava sempre uma faixa livre e altura fixa, e sua detecção não recebia a altura real do componente.

As alterações foram limitadas a essas áreas. Personagem principal, quatro cenários de corrida, controles, modos, áudio, progressão, pontuação, recorde e proporção 16:9 continuam nos sistemas existentes.

## Textos em português

Padronizados os nomes exibidos no HUD e nas apresentações:

- **SETOR 01 — LABORATÓRIO ABANDONADO**;
- **SETOR 02 — CIDADE EM RUÍNAS**;
- **SETOR 03 — COMPLEXO INDUSTRIAL**;
- **SETOR 04 — ZONA CONTAMINADA**.

Traduzidos também INICIAR, COMO JOGAR, CONTINUAR, REINICIAR, MENU PRINCIPAL, FIM DE JOGO, DIVISÃO DE PESQUISA, rótulos dos monitores e estados de áudio LIGADO/DESLIGADO. As instruções explicam as novas trilhas e deixam claro que coletar é opcional. Durante o final, o cabeçalho identifica o destino UniFECAF e depois a cerimônia EXPOTECH 2026, sem permanecer com o nome de um setor anterior. Nexus, UniFECAF e EXPOTECH 2026 foram preservados.

## Chegada e fachada

A composição anterior foi substituída por um novo conjunto tridimensional, em módulo próprio:

- Portal branco horizontal com canto curvo, espessura e acabamento chanfrado; segundo portal mais alto junto ao prédio vertical, conforme a disposição da fotografia.
- Ala longa de vidro recuado com montantes, letreiro UniFECAF, emblema em relevo e faixa superior com painéis geométricos verdes e azuis.
- Torre lateral com janelas, pequenos volumes de fachada e profundidade.
- Palmeiras, vegetação baixa, canteiros de concreto e terra, sem as antigas faixas verdes retangulares.
- Asfalto texturizado, calçadas, faixa de pedestres, acesso de veículos, estacionamento, carros, postes, terreno e construções baixas no entorno. O terreno evita a aparência de uma estrada suspensa sobre o fundo.
- Céu diurno durante a aproximação final, com transição da névoa e manutenção das atmosferas dos demais setores.

O campus passa a existir à frente a partir dos 2.220 m do Modo História. A névoa se dissipa gradualmente e a fachada fica visível à distância antes dos 2.400 m, enquanto troca de faixa, salto, deslize e colisões continuam ativos. A aproximação substitui a arquitetura da rua adiante por uma avenida aberta, mantendo o piso e preparando o acesso.

Aos 2.400 m, permanece o encerramento da pontuação já existente. A sequência dirigida preserva a posição inicial do protagonista e a câmera, parte da velocidade corrente e desacelera suavemente para a chegada. O mundo externo acompanha o deslocamento; a rua não é simplesmente ocultada no primeiro quadro. O personagem continua pela entrada e pelo corredor até o auditório, sem troca por uma tela estática.

### Entrada funcional

Duas folhas de vidro com caixilhos e puxadores fazem parte do portal principal. A abertura começa a 45 m da entrada e termina a 15 m, antes da travessia. As folhas se afastam até deixar livres as três faixas. A abertura é controlada pela distância efetiva à fachada e não por um portão genérico independente. Pisos, paredes e teto do corredor se conectam à entrada.

## Pódio e participantes

O palco tem o topo em 0,36 m; agora todas as plataformas começam nessa altura, em vez de terem sua parte inferior escondida pelo palco. Foram ampliadas a largura das posições e a distância entre participantes. As plataformas têm alturas de 1,20 m / 1,80 m / 0,95 m, na ordem **2 / 1 / 3**. Os números ficam centralizados nas faces frontais.

A câmera permanece centralizada, com distância suficiente para mostrar os três participantes, as bases completas, o troféu e o letreiro EXPOTECH 2026. A aproximação final é discreta. A tela de vitória passou a ser uma faixa inferior, para não encobrir o segundo lugar.

**Primeiro lugar:** preservado o robô enferrujado original. Ele ocupa o centro mais alto, vira-se gradualmente, recebe a taça por uma animação de entrega lateral, segura e levanta o troféu; aplausos e iluminação existentes continuam ativos.

**Segundo lugar:** novo inventor/encanador estilizado, com boné vermelho, bigode, camiseta vermelha, jardineira azul com botões, luvas, botas e expressão simpática. Foi modelado com geometria própria, pequeno emblema de ferramenta assimétrico e detalhe de lenço. Não usa nome ou logotipo comercial nem arquivos de personagens licenciados.

**Terceiro lugar:** baú antigo tecnológico com pés, reforços metálicos, tampa/boca aberta, dentes, olhos e cabos. Um monitor com moldura, pedestal, teclado e tela acesa com texto em português ocupa o interior. Há oscilação discreta do corpo e da tampa. Ambos substituem os dois robôs genéricos, sem alterar o protagonista.

## Rotas de coleta

O gerador agora fornece a posição e a ação esperada de cada componente, com quatro famílias de padrões:

| Rota | Distribuição | Ação incentivada |
|---|---|---|
| Livre | Componentes na faixa desimpedida, à altura normal. | Coleta acessível e recuperação entre desafios. |
| Salto | Três componentes acima de uma barreira baixa, formando um pequeno arco. | Saltar a barreira para coletar. |
| Deslize | Três componentes baixos, sob uma estrutura elevada. | Deslizar pela passagem. |
| Mudança de faixa | Componentes com espaçamento longitudinal entre centro e lateral. | Acompanhar a trilha e retornar/seguir para a faixa segura. |

As primeiras três fileiras continuam simples. Depois, as quatro famílias se alternam; trilhas de salto/deslize em faixas laterais e a alternância entre fileiras permitem combinar movimentos. A coleta usa a altura real do componente, além de faixa e varredura longitudinal. Componentes de salto exigem elevação; componentes baixos de deslize exigem postura reduzida. Não ficam dentro do volume sólido do obstáculo.

Mantidos: três componentes por fileira, máximo de dois obstáculos, uma faixa sempre desimpedida, tempos de geração de 2,10 s nas fileiras iniciais e depois 1,65 s, colisores, velocidade de 12 a 28 m/s, 75 pontos por componente e 10 pontos por metro. Nenhuma trilha obriga a coleta para sobreviver. Os modelos continuam em pools, com movimento visual leve.

## Arquivos alterados

| Área | Arquivos |
|---|---|
| Idioma e instruções | `index.html`, `src/ui/UI.js`, `src/environments/Sectors.js`, `src/graphics/SurfaceLibrary.js` |
| Campus novo | `src/story/Campus.js` (novo) |
| Participantes novos | `src/story/Competitors.js` (novo) |
| Chegada, porta, pódio e premiação | `src/story/StoryFinale.js`, `src/game/Game.js` |
| Coleta e geração | `src/obstacles/Collision.js`, `src/obstacles/TrackObjects.js` |
| Vitória sem obstrução | `styles/main.css` |
| Validação | `tests/final-adjustments.html`, `tests/finale-realtime.html`, `tests/final-gallery.html`, `tests/routes-gallery.html` (novos); `tests/package-scene.html` |
| Documentação | Este relatório, `README.md`, `docs/DESENVOLVIMENTO.md`, `VALIDACAO.md` |

## Testes e resultados

Execução local no Edge, WebGL2 por ANGLE/D3D11 na Intel UHD Graphics 620. As suítes abaixo foram executadas; os testes de lógica usam tempo controlado e os dois testes nativos usam relógio real.

| Suíte | Verificações aprovadas |
|---|---:|
| Movimento | 15 |
| Mecânicas, colisões, coleta e pontuação | 25 |
| Setores e reciclagem | 19 |
| Áudio, configurações, menus e composição | 23 |
| Inicialização e fluxo básico | 12 |
| Rig, abertura, modelos e três qualidades | 26 |
| Integração do pacote visual anterior | 41 |
| Ajustes finais desta entrega | 26 |
| Abertura no loop nativo | 2 |
| Final completo no loop nativo | 2 |
| **Total** | **191** |

A suíte nova testa nomes, interface, antecipação da abertura, continuidade inicial de velocidade/câmera, campus durante gameplay ativo, entrada, corredor, participantes distintos, monitor, taça, plataformas acima do palco, vitória e isolamento do Infinito. O enquadramento é verificado projetando os volumes reais das plataformas, números, três participantes e troféu no espaço da câmera.

Foram simulados **600 padrões em três velocidades — 1.800 percursos**, com o controlador real em passos de 1/240 s. Todos permitem coletar os três componentes sem colidir, com as ações indicadas. Também se verificaram faixa livre e ausência de componentes dentro dos sólidos. Isso valida os padrões testados, sem substituir uma avaliação de dificuldade percebida por jogadores humanos.

O loop nativo concluiu a abertura em **2,700 s**. A nova sequência final percorreu chegada, interior, pódio, troféu e vitória em **32,148 s de relógio real**, com 1.802 quadros, porta aberta e sessão encerrada. As suítes anteriores verificaram pausa, reinício, recorde, áudio, compilação gráfica e estabilidade das contagens de GPU em ciclos dos setores.

Capturas locais de chegada distante, fachada, entrada, palco e rotas foram inspecionadas. A revisão corrigiu prédios que encobriam a fachada, terreno ausente nas laterais da avenida, sobreposição de pisos e o antigo painel de vitória que ocultava participantes. As evidências e saídas dos testes estão em `.tmp-qa/ajustes-*`; permanecem locais e ignoradas pelo Git.

### Desempenho observado

Medição curta da cena de laboratório, em 1920×1080 lógico, com aquecimento, oito amostras por qualidade, espera de GPU e `requestAnimationFrame`:

| Qualidade | Média por quadro | FPS observado |
|---|---:|---:|
| Econômica | 16,56 ms | 60,4 |
| Padrão | 22,91 ms | 43,6 |
| Alta | 34,74 ms | 28,8 |

Esses valores não são uma média da campanha nem uma medição específica da fachada. Alta continua abaixo de 60 FPS nessa GPU integrada. Geometrias de vegetação, dentes, caixas e materiais são compartilhadas; campus e participantes são construídos uma vez e reutilizados.

## Como avaliar localmente

Execute `powershell -ExecutionPolicy Bypass -File .\Start-Game.ps1` e abra `http://localhost:8080`. Escolha História para a chegada e o final; Infinito continua sem encerramento. As novas trilhas aparecem após as três primeiras fileiras.

Para inspecionar sem completar uma corrida:

- `http://localhost:8080/tests/final-gallery.html`: chegada distante, fachada, corredor e pódio;
- `http://localhost:8080/tests/routes-gallery.html`: exemplos das trilhas;
- `http://localhost:8080/tests/package-scene.html?view=facade`: fachada em tela inteira;
- `http://localhost:8080/tests/package-scene.html?view=ceremony`: pódio em tela inteira.

Para reproduzir a validação, com servidor ativo:

```powershell
powershell -ExecutionPolicy Bypass -File tools/Test-Browser.ps1 -Hardware -Page tests/final-adjustments.html
powershell -ExecutionPolicy Bypass -File tools/Measure-Render.ps1 -Hardware -Page tests/finale-realtime.html -Report ajustes-final-nativo.txt
```

## Limitações e estado local

A fachada é uma reconstrução procedural estilizada baseada na fotografia, sem levantamento métrico ou promessa de fotorrealismo. A comparação arquitetônica e as capturas não substituem a avaliação artística do usuário. Vidros usam material opaco reflexivo para preservar desempenho. A cerimônia continua sendo uma sequência dirigida. Não foi feita homologação prolongada em outras GPUs, avaliação auditiva humana ou teste interativo de tela cheia.

Nenhuma publicação, sincronização, operação de conta, upload, commit, push, deploy, GitHub Actions, plugin ou conector foi utilizado. Todo o trabalho permanece no projeto local para avaliação.
