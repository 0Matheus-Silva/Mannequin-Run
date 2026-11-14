# Relatório de desenvolvimento

## Entrega atual — personagem físico, fases e créditos

O [relatório do personagem físico, capítulos e créditos](./PERSONAGEM-FISICO-FASES-CREDITOS.md) descreve o novo manequim de roupa preta, capuz, máscara ciano e computador exposto, baseado na fotografia obrigatória. O menu oferece oito trechos, incluindo chegada, entrada e cerimônia. Os créditos CDC2NA com Fabiano Matheus de Camargo Silva, Pedro Henrique Freitas de Oliveira e Vitor Barioni Ferraz sobem cinco segundos após o protagonista ocupar o pódio; possuem opção automática e reprodução manual. Foram aprovadas 237 verificações. Tudo permanece local.

## Entrega anterior — idioma, UniFECAF, pódio e coleta

Veja o [relatório dos ajustes finais](./AJUSTES-FINAIS.md): textos em português, nova fachada baseada na fotografia, campus visível durante a corrida, entrada automática, continuidade de câmera, pódio sem cortes, inventor no segundo lugar, baú com monitor no terceiro e rotas de coleta com salto/deslize/troca de faixa. Foram aprovadas 191 verificações, incluindo 1.800 percursos simulados e o final completo no loop nativo. Velocidade, pontuação, controles, modos e áudio foram preservados. Tudo permanece local, sem publicação.

Os registros abaixo correspondem às entregas anteriores.

## Entrega anterior — pacote visual e narrativo

O [relatório completo do pacote visual](./PACOTE-VISUAL-RELATORIO.md) registra a leitura integral dos materiais, o novo robô enferrujado, os quatro ambientes 3D, portas, obstáculos por setor, seleção de modos, áudio independente e encerramento na UniFECAF / EXPOTECH 2026. Foram aprovadas 163 verificações. A amostra local na Intel UHD 620 foi de 60,1 / 41,6 / 30,2 FPS em Econômica / Padrão / Alta. A implementação e as evidências permanecem exclusivamente locais; publicação continua fora do escopo.

Os registros a seguir descrevem as entregas que precederam os ajustes finais.

Etapas 1 a 5 implementadas na pasta `D:\Matheus\Manequin-Run`. Etapa 6 reservada para autorização futura.

Depois dessas etapas, foi aplicado o [upgrade gráfico e cinematográfico](./UPGRADE-GRAFICO.md): novo manequim, idle com olhar para câmera, giro antes da corrida, laboratório detalhado, modelos industriais e renderização HDR/bloom. O relatório vinculado registra a entrega atual, os 121 testes aprovados e os limites de desempenho observados.

## Etapa 2 — gameplay

Implementado: movimento lateral interpolado entre três faixas; salto com gravidade; deslizamento temporário e recuperação; controles PC; câmera estável com pequeno acompanhamento lateral; poses de salto e deslizamento.

Arquivos principais: `src/player/PlayerController.js`, `src/game/Input.js`, `src/player/Mannequin.js` e `src/game/Game.js`.

Verificado: 15 testes de limites de faixa, movimento intermediário, salto único, pouso, impedimento de deslizar no ar, recuperação de altura e todas as teclas. Nenhum problema pendente identificado nesses testes.

Como observar: inicie a partida; use A/D ou setas laterais, Espaço/↑ e S/↓. A posição real e a animação acompanham a interpolação. A etapa seguinte adicionou os perigos e as recompensas.

## Etapa 3 — mecânicas

Implementado: três tipos de obstáculo; chips luminosos e rotativos; colisão longitudinal com varredura; simulação em passos de até 1/120 s; distância, itens e pontuação; recorde; dificuldade; pausa; Game Over e reinício.

A velocidade cresce de 12 até 28 m/s. Cada grupo deixa uma faixa totalmente livre. Grupos são lançados com pelo menos 1,65 s entre eles, além de uma introdução mais espaçada. Os objetos são reciclados e não se acumulam indefinidamente.

Arquivos principais: `src/game/RunSession.js`, `src/obstacles/Collision.js`, `src/obstacles/TrackObjects.js`, `src/game/Game.js`, `src/ui/UI.js` e `index.html`.

Verificado: 24 testes, incluindo cada tipo de colisão, passagem rápida, salto sobre barreira, deslizamento sob viga, 300 padrões com faixa livre, coleta sem duplicação, recorde entre instâncias, falha do armazenamento, pausa e reinício. Os testes integrados usam a cena real com atualização manual da simulação.

Como observar: desvie dos gabinetes; salte as peças amarelas; deslize sob as vigas vermelhas; colecione chips. Esc pausa, R reinicia após colisão. Se o LocalStorage falhar, o recorde permanece disponível durante a sessão e a interface informa a limitação.

## Etapa 4 — ambientes

Implementado: quatro setores em ciclo, cada um com 600 m. A atmosfera começa a mudar nos 120 m finais do setor. A nova arquitetura entra pelos segmentos distantes, conservando os segmentos próximos até serem reciclados.

- Abandoned Lab: corredores, equipamentos, monitores e tubulações ciano.
- The Fallen City: torres danificadas, estruturas caídas, destroços, chamas e cinzas em atmosfera quente.
- Industrial Complex: maquinário, tubulações elevadas, esteiras e ventiladores animados em tons roxos.
- Contaminated Zone: tanques tecnológicos, estruturas danificadas, névoa mais densa e luz verde.

Arquivos principais: `src/environments/Sectors.js`, `src/environments/SectorWorld.js`, `src/environments/Laboratory.js`, `src/ui/UI.js` e estilos de títulos.

Verificado: 19 testes de limites de setor, continuidade de cores, identidades, reciclagem e reinício. As quatro vistas também foram inspecionadas em captura. A etapa seguinte adicionou som específico e acabamento visual.

Como observar: percorra 600 m por setor. Para inspeção direta durante desenvolvimento, `tests/gallery.html` reúne os quatro setores sem exigir uma partida prolongada.

## Etapa 5 — finalização da implementação

Implementado: HUD de pontuação, distância, itens, recorde, velocidade e progresso do setor; instruções; menus de pausa e resultados; configurações persistentes; botão de tela cheia; áudio sintetizado; música sequenciada discreta; ambientes sonoros e efeitos de salto, faixa, deslizamento, coleta, colisão e setor; partículas e flash de colisão.

O AudioContext não é criado no carregamento. A partida ou o botão de áudio inicializa o som após interação. Mute e volume controlam todo o grafo. Não há arquivos externos de música ou dependência de rede durante a execução.

Qualidade Econômica usa 65% da resolução lógica e desativa sombras; Padrão usa resolução lógica e sombras; Alta considera a densidade de pixels até 1,5. Todas preservam a composição 16:9. Malhas estáticas repetidas são agrupadas em instâncias; os recursos gráficos compartilhados são reaproveitados.

Arquivos principais: `src/audio/AudioEngine.js`, `src/world/Effects.js`, `src/utils/Settings.js`, `src/utils/batchMeshes.js`, `src/ui/UI.js`, `src/game/Game.js`, `index.html` e `styles/main.css`.

Verificado: 23 testes específicos de acabamento, além de regressões de mecânicas e inicialização. Capturas dos menus e dos setores foram conferidas. Foram corrigidos dois problemas encontrados nas capturas: deslocamento do palco ao reduzir a janela e ausência de escala nos diálogos nativos que entram na camada superior do navegador.

Como observar: abra configurações, altere áudio/volume/qualidade, jogue e veja os efeitos. O servidor continua sendo iniciado com `powershell -ExecutionPolicy Bypass -File .\Start-Game.ps1`.

## Assistente conversacional — entrega local

Painel independente com demonstração roteirizada, personalidade e base de conhecimento separadas, apresentação WAV offline, captura AudioWorklet, reprodução PCM e gestão de sessão. Gemini Live preparado com backend Python e tokens efêmeros, mas desativado até revisão de público/termos, chave e cota. Nenhuma conversa foi enviada ao provedor. Foram aprovadas 284 verificações, incluindo 237 regressões do jogo, 35 do assistente no navegador e 12 do backend. Consulte o [relatório completo](./ASSISTENTE-CONVERSACIONAL.md) para arquivos, comandos, resultados e limitações.

## Escadas e subida ao pódio

Os três lugares receberam escadas individuais, com degraus proporcionais à altura de cada plataforma e bordas douradas. A sequência agora aproxima o protagonista, anima pernas e joelhos durante a subida de costas para a câmera, chega ao centro do primeiro lugar e somente então gira para o público. A entrega da taça e os créditos mantêm seus tempos. Os números foram deslocados para a lateral das escadas para permanecerem visíveis.

Arquivos: `src/story/StoryFinale.js`, `src/game/Game.js`, `tests/podium-stairs.html` e suporte de tempo de captura em `tests/package-scene.html`. Validação local: trajetória, altura das três escadas, articulação, orientação e giro; regressões de ajustes finais e capítulos; final completo com loop real e créditos. Evidências em `.tmp-qa/podium-*.txt` e `.tmp-qa/podium-escadas.png`.

## Premiação e encerramento — revisão final local

Nova composição 2–1–3: baú monstruoso com língua, protagonista e aparelho de plasma em acrílico. Caixas ampliadas e escadas deslocadas deixam os números frontais legíveis. A sequência apresenta sobrecarga de 3,5 s, explosão e fogo restritos ao terceiro lugar, baú fechando sobre a língua com lágrimas e, depois, protagonista levantando a taça com VITÓRIA. Os créditos começam imediatamente quando a taça termina de subir, junto à mensagem VITÓRIA, e rolam por 30 segundos. Foram aprovadas 327 verificações locais, incluindo efeitos, áudio real, regressões do gameplay e assistente. Consulte o [relatório de premiação](./PREMIACAO-ENCERRAMENTO.md) para tempos, arquivos, testes e limitações. A descrição anterior da cerimônia corresponde à versão anterior.

Último ajuste local de animação: removida a espera antes da escada. A aproximação emenda no deslocamento da chegada conforme a velocidade de entrada; degraus percorridos em 1,5 s, seguidos de chegada ao centro e giro para o público. Os créditos continuam começando junto à taça erguida. Validações e tempos no [relatório de premiação](./PREMIACAO-ENCERRAMENTO.md).

## Cinema e voz Sadachbia — entrega dos dois prompts

Entrega mais recente dos dois prompts: plano aberto e três closes com travelling/zoom suaves, explosão e fanfarra em WAV local, grito “Ah! Minha língua!” sincronizado, mixagem mais presente com redução de música durante fala, WIN! e créditos de nove segundos. A configuração Gemini mudou de Puck para Sadachbia, com personalidade expressiva em português; autenticação e integração existentes preservadas. Sessão real permanece desativada e não foi validada externamente. Consulte [cinema e voz Sadachbia](./CINEMA-VOZ-SADACHBIA.md) para diagnóstico, arquivos, testes e limites. Esse relatório substitui os tempos e a configuração de voz dos registros anteriores.

## Salto com pirueta — ajuste de fluidez

Última alteração de movimento: a subida por degraus foi substituída por salto com pirueta até o primeiro lugar. Escadas frontais removidas e números centralizados. A aproximação dura 0,6 s, o salto 1,05 s e o amortecimento do pouso 0,25 s, sem pausa intermediária. A câmera começa a recuar antes da decolagem, acompanha o corpo inteiro e retorna suavemente ao plano aberto antes dos closes. Foram verificadas trajetórias em 12, 20 e 28 m/s, enquadramento durante toda a pirueta, pouso, capítulos e premiação. As descrições anteriores de escadas são históricas. Evidências em `.tmp-qa/pirueta-*.txt` e `pirueta-salto.png`. A mudança suaviza a coreografia; não representa garantia de FPS em qualidade Alta.

## Piso da chegada — correção de cintilação

Correção posterior do chão piscando: o corredor e o auditório tinham 5,5 m de pisos sobrepostos exatamente na altura zero. O piso do auditório agora começa onde termina o corredor (z = −167,5). Rua e calçadas também terminam no limiar da entrada (z = −102,5), eliminando sobreposição quase coplanar na chegada. A altura do percurso e o apoio do palco foram preservados. Teste dedicado `tests/finale-floor.html` verifica limites, ausência de vãos/superfícies duplicadas e visibilidade durante toda a transição. Evidências em `.tmp-qa/piso-*.txt`.

## Pendências reservadas para a etapa 6

Atualização autorizada para GitHub: grito prolongado do baú com “Aaaaah! Ai! Ai! Minha língua!” (3,2 s), câmera/reações sincronizadas e entrada da UniFECAF fechada também na lateral direita e acima das folhas móveis. Automação de GitHub Pages em `.github/workflows/pages.yml`; artefato público contém apenas o jogo estático. A autorização mais recente permite commit, push e publicação neste repositório. Consulte [publicação e testes](./PUBLICACAO.md). Os registros anteriores de proibição de publicação são históricos.

Homologação final em hardware real: sessões prolongadas, sensação dos controles, audição, desempenho, telas cheias e janelas nas resoluções recomendadas; refinamentos que essa homologação revelar. Publicação no GitHub Pages e conferência do endereço publicado também permanecem pendentes. Não foram realizadas operações remotas de versionamento ou publicação.
