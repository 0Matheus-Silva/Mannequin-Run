# Nexus — pacote visual e narrativo

Entrega local de desenvolvimento em 14/11/2026, em `D:\Matheus\Manequin-Run`.

## Material consultado integralmente

Lidos, nesta ordem, `LEIA_PRIMEIRO.md` e `PROMPT_MESTRE_CODEX_MANNEQUIN_RUN.md`, além da cópia `.txt`. O PDF `MANNEQUIN_RUN_Brief_Visual.pdf` foi renderizado e suas oito páginas foram inspecionadas. As dez imagens de `referencias_visuais` foram abertas individualmente:

- `moodboard_quatro_setores_e_jornada.png`;
- `referencia_robo_estilo_original.png`;
- `referencia_fachada_real_unifecaf.png`;
- `referencia_podio_expotech_2026.png`;
- `referencia_transicao_porta_laboratorio.png`;
- `setor_01_abandoned_lab_painel.png`;
- `setor_01_abandoned_lab_referencia.png`;
- `setor_02_fallen_city_painel.png`;
- `setor_03_industrial_complex_painel.png`;
- `setor_04_contaminated_zone_painel.png`.

O pacote original foi preservado. As referências orientaram modelagem, materiais, iluminação e narrativa; os cenários são geometria 3D. As texturas de desgaste, telas e letreiros são geradas localmente por Canvas. Nenhuma imagem foi substituída por um fundo plano ou usada como fachada falsa.

## Diagnóstico e implementação

O jogo existente já possuía controles, colisões, pontuação, reciclagem de segmentos, menus e uma sequência inicial funcional. As principais lacunas eram o personagem excessivamente metálico, a pouca diferenciação arquitetônica entre setores, a ausência de uma saída física, de modos separados e de encerramento narrativo, além do controle único de áudio.

### Personagem e animações

Cabeça arredondada verde pálido, dois olhos circulares ciano, placas laranja com ferrugem, metal opaco e cabos aparentes. O brilho foi reduzido. Permanecem o rig articulado, a respiração, a mudança de peso, o olhar para a câmera e o giro de PLAY antes da corrida. O pouso ganhou recuperação breve de torso e joelhos. A colisão agora congela a sessão, anima uma queda controlada de 1,5 s e só então abre Game Over. O corpo é corrigido pela sua caixa visual para permanecer acima do piso.

### Quatro setores

| Setor | Construção e identidade |
|---|---|
| Abandoned Lab | Interior azul/ciano, monitores com fissuras, tubos, passarelas, piso com pequenas manchas úmidas e iluminação industrial. |
| The Fallen City | Rua aberta, lajes e colunas expostas, prédios danificados, carros abandonados, ônibus laterais, vegetação, entulho e rachaduras; céu em gradiente, sol geométrico e nuvens suaves. |
| Industrial Complex | Galpões, janelas âmbar, chaminés, silos, tubulações, passarelas, transportadores, guindastes e vapor moderado. |
| Contaminated Zone | Tanques corroídos, barris, canos rompidos, vazamentos, vegetação alterada e névoa verde; canais tóxicos ficam fora das três faixas. |

Cada setor recebeu três variantes temáticas de obstáculo, mantendo os limites dos colisores originais. Modelos são reutilizados em pools. A posição absoluta de cada segmento determina sua arquitetura, permitindo enxergar o próximo setor além da passagem.

### Portas e continuidade

Portais físicos com duas folhas deslizantes, faixas de alerta, luzes e som de mecanismo aparecem antes das fronteiras de setor. A porta começa a abrir a 85 m, já está completamente aberta a 33 m e possui abertura forçada de segurança perto da passagem. As folhas deixam as três faixas livres. O portal permanece brevemente atrás da câmera após a travessia. A porta é cenográfica e não adiciona um colisor que possa bloquear a corrida.

### Modos e final

O menu oferece Modo História e Modo Infinito, com seleção persistida. O História percorre quatro setores de 600 m e, aos 2.400 m, encerra a pontuação e inicia uma sequência de aproximadamente 30 s. O Infinito continua alternando setores sem forçar a cerimônia.

O final constrói uma interpretação 3D da fachada fotografada: portal branco horizontal, vidro, painéis verdes e azuis, letreiro **UniFECAF**, torre adjacente e palmeiras. A câmera valoriza a fachada, atravessa a abertura central e segue por um corredor até o auditório. O palco tem cortinas, assentos, iluminação, letreiro **EXPOTECH 2026** e pódio 2–1–3, com o centro mais alto. Dois robôs coadjuvantes acompanham o protagonista, que ergue uma taça. Há aplausos sintetizados e tela de vitória com os nomes exatos. A sequência respeita pausa e retorno ao menu, e sua estrutura é reutilizada ao reiniciar.

### Música e interface

Três composições sequenciadas originais, sem downloads, com seleção de faixa, música ligada/desligada e volumes separados de música e efeitos. O volume geral e o silenciamento existentes permanecem. É possível selecionar arquivos de áudio próprios: são reproduzidos por URLs `blob:` apenas na sessão, sem cópia para o servidor ou upload. Sua disponibilidade não é persistida entre sessões.

Os novos controles cabem no diálogo existente. A apresentação continua fixa em 1920×1080, escalada uniformemente em 16:9, com HUD, recorde, pausa, dificuldade, coleta, reinício e atalhos preservados.

### Desempenho e recursos

Materiais e geometrias compartilhados, arquitetura estática com instanciamento, descarte dos buffers de instâncias substituídas, pools limitados e biblioteca de texturas em cache. O agrupamento agora respeita malhas invisíveis, evitando fechar visualmente a entrada do campus. O MSAA do alvo HDR de Alta foi reduzido de quatro para duas amostras; bloom continua controlado e Econômica desativa sombras/pós-processamento.

## Arquivos desta entrega

| Área | Arquivos principais novos ou alterados |
|---|---|
| Personagem e materiais | `src/player/CinematicMannequin.js`, `src/graphics/Patina.js`, `SurfaceLibrary.js`, `CinematicRenderer.js` |
| Cenários | `src/environments/SectorArchitecture.js`, `Atmosphere.js`, `Passages.js`, `SectorWorld.js`, `Sectors.js`, `Laboratory.js`, `LabArchitecture.js` |
| Obstáculos | `src/obstacles/ThematicModels.js`, `TrackObjects.js` |
| Progressão e narrativa | `src/game/Progression.js`, `RunSession.js`, `Game.js`, `src/story/StoryFinale.js` |
| Áudio | `src/audio/MusicLibrary.js`, `AudioEngine.js` |
| Interface e preferências | `index.html`, `styles/main.css`, `src/ui/UI.js`, `src/utils/Settings.js` |
| Reutilização | `src/utils/batchMeshes.js` |
| Validação | `tests/visual-package.html`, `package-scene.html`, `package-gallery.html`, `story-gallery.html`; ajustes em `mechanics.html`, `upgrade.html`, `scene.html`, `performance.html` |
| Leitura local do PDF | `tools/Read-Package-Pdf.py`, `tools/Render-Package-Pdf.ps1` |
| Documentação | Este relatório, `README.md`, `docs/DESENVOLVIMENTO.md`, `VALIDACAO.md` |

## Testes executados

Microsoft Edge headless local, WebGL2 por ANGLE/D3D11 na Intel UHD Graphics 620. Os testes de lógica e integração usam relógio virtual e avanço controlado. O teste de PLAY e as medições de desempenho usam relógio real, em execuções separadas.

| Suíte | Resultado | Cobertura |
|---|---:|---|
| `movement.html` | 15 PASS | Faixas, interpolação, salto, pouso, deslize e teclas. |
| `mechanics.html` | 25 PASS | Colisões com varredura, rotas, coleta, pontuação, recorde, pausa, queda, resultados e reinício. |
| `sectors.html` | 19 PASS | Quatro setores, continuidade de paleta, reciclagem, contagens fixas e retorno ao laboratório. |
| `polish.html` | 23 PASS | Grafo de áudio, limite de vozes/partículas, preferências, diálogo, proporção e opções gráficas. |
| `smoke.html` | 12 PASS | Inicialização, WebGL2, animação, dois minutos de reciclagem simulada, PLAY, pausa e menus. |
| `upgrade.html` | 26 PASS | Idle/olhar, giro, pausa da abertura, controles, limites visuais, pools e compilação nos três níveis gráficos. |
| `transition-realtime.html` | 2 PASS | Loop nativo completa o giro e entra na jogabilidade. Tempo observado: 2.712 ms. |
| `visual-package.html` | 41 PASS | Modos, portas, 12 modelos temáticos, céu, queda/piso, campanha, campus 3D, pausa do final, pódio/taça, vitória, infinito, áudio e estabilidade de GPU. |

**Total: 163 verificações aprovadas.** O teste de recursos percorreu três ciclos completos dos quatro setores; os dois últimos terminaram com as mesmas contagens: **20 geometrias e 13 texturas de GPU** na cena medida. Isso evidencia estabilidade nessa sequência, sem equivaler a uma prova de ausência de qualquer vazamento em sessões longas.

As capturas locais foram abertas para inspeção de menu, configurações, quatro setores, porta, fachada, cerimônia e vitória. A revisão encontrou e corrigiu o sol oculto, lacunas no piso lateral da cidade, prédios encobrindo a fachada, letreiro pouco legível e enquadramento apertado do pódio. Evidências estão em `.tmp-qa/`, incluindo `menu-package.png`, `settings-package.png`, `city-final.png`, `campus-final.png`, `package-sectors-final.png` e `package-story-final.png`. As duas galerias são registros anteriores aos últimos ajustes de sol, piso e fachada; as capturas individuais finais refletem essas correções.

### Medição de renderização

Cena de laboratório com obstáculos, canvas lógico 1920×1080, janela do navegador 1920×1080. Cinco quadros de aquecimento e oito amostras por qualidade, com `gl.finish()` e `requestAnimationFrame`.

| Qualidade | Média por quadro | Maior amostra | FPS do loop observado |
|---|---:|---:|---:|
| Econômica | 16,64 ms | 16,80 ms | 60,1 |
| Padrão | 24,04 ms | 43,30 ms | 41,6 |
| Alta | 33,11 ms | 37,80 ms | 30,2 |

Amostra curta e específica, não uma média de toda a campanha. Padrão e Alta continuam limitadas nessa GPU integrada. Alta usa HDR, sombras, bloom e antisserrilhado e não alcançou 60 FPS na máquina testada. Não foi feita homologação em outras GPUs, navegadores ou sessões prolongadas. Não houve avaliação auditiva humana; os controles e o grafo de áudio foram verificados programaticamente. Tela cheia depende da permissão/gesto do navegador; seu fluxo existente foi preservado, sem homologação interativa de monitor em tela cheia.

## Como executar e reproduzir

Na pasta do projeto:

```powershell
powershell -ExecutionPolicy Bypass -File .\Start-Game.ps1
```

Abra `http://localhost:8080`, selecione um modo e clique PLAY. Controles: A/D ou setas, Espaço/↑ para salto, S/↓ para deslize, Esc para pausa e R após Game Over. História termina aos 2.400 m; Infinito reinicia o ciclo de setores. Preferências e recorde ficam no LocalStorage desse endereço.

Com o servidor ativo, reproduza os testes:

```powershell
powershell -ExecutionPolicy Bypass -File tools/Test-Browser.ps1 -Hardware -Page tests/visual-package.html
powershell -ExecutionPolicy Bypass -File tools/Measure-Render.ps1 -Hardware -Page tests/transition-realtime.html -Report transition-package.txt
powershell -ExecutionPolicy Bypass -File tools/Measure-Render.ps1 -Hardware -Report performance-package.txt
```

As demais suítes da tabela usam o primeiro comando, trocando `-Page`. As galerias locais `tests/package-gallery.html` e `tests/story-gallery.html` mostram as cenas atuais. `tests/package-scene.html?view=arrival` permite inspecionar a fachada e `?view=ceremony` o pódio sem completar uma corrida; são páginas de desenvolvimento separadas do jogo.

## Limites e situação da entrega

Os modelos são procedurais e estilizados; não são uma reprodução fotorrealista das ilustrações nem um levantamento arquitetônico exato do campus. Nuvens são sprites suaves, reflexos usam o ambiente local e o piso tem materiais/manchas, sem reflexão planar ou ray tracing. A queda é animada, sem física ragdoll. A chegada/cerimônia é uma sequência dirigida após a corrida, não um campus livremente explorável.

As funcionalidades solicitadas estão integradas e os testes de desenvolvimento acima passaram. A etapa anterior de publicação/homologação final continua fora do escopo. Tudo permanece na pasta local: nenhum conector, Trello, Drive, upload, commit, push, deploy ou publicação foi utilizado.
