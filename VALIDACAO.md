# Validação de desenvolvimento — etapas 1 a 5

Data: 14/11/2026.

## Atualização atual — personagem físico, capítulos e créditos

Veja [o relatório desta entrega](./docs/PERSONAGEM-FISICO-FASES-CREDITOS.md). **237 verificações aprovadas**: nove suítes controladas e dois testes do loop nativo. A suíte nova tem 45 verificações de modelo, dedos articulados, seletor, oito trechos, HUD, controles, recorde protegido nos atalhos, entrada, cerimônia e créditos. As regressões anteriores, incluindo 1.800 percursos de coleta simulados, foram executadas novamente.

Revisadas capturas do personagem no menu e na corrida, seletor, pódio, créditos e configurações. O loop nativo confirmou giro antes de correr, todas as fases da premiação e rolagem dos créditos após a vitória. Os relatórios seguintes são históricos; os números atuais de desempenho estão no relatório desta entrega.

## Atualização atual — ajustes finais

O [relatório dos ajustes finais](./docs/AJUSTES-FINAIS.md) reúne alterações, arquivos, instruções e limites. **191 verificações aprovadas** em dez suítes, incluindo as anteriores, 26 verificações dos novos ajustes e duas do final completo no loop nativo. Foram simulados 600 padrões em três velocidades, totalizando **1.800 percursos coletáveis sem colisão**, com faixa livre e componentes fora dos sólidos.

Revisadas capturas de campus distante, fachada, entrada, três participantes e rotas. Abertura nativa: 2,700 s; final nativo: 32,148 s e 1.802 quadros. Amostra curta de renderização do laboratório na Intel UHD 620: Econômica 60,4 FPS; Padrão 43,6 FPS; Alta 28,8 FPS. Não são médias da campanha. Tudo foi executado localmente, sem publicação. Os registros seguintes são históricos.

## Atualização — pacote visual e narrativo

Veja [docs/PACOTE-VISUAL-RELATORIO.md](./docs/PACOTE-VISUAL-RELATORIO.md) para implementação, arquivos, reprodução e limites. **163 verificações aprovadas** nas oito suítes, incluindo modos, portas, obstáculos, queda, campus, pódio, vitória, áudio e recursos de GPU. Após três ciclos completos dos setores, as contagens estabilizaram em 20 geometrias e 13 texturas na cena medida. Revisadas capturas locais dos setores, menus e final.

Loop nativo de PLAY: 2,712 s. Amostra curta de renderização na Intel UHD 620: Econômica 60,1 FPS; Padrão 41,6 FPS; Alta 30,2 FPS. Alta não atingiu 60 FPS nessa GPU. Homologação prolongada, avaliação auditiva humana e tela cheia interativa não foram realizadas. Nenhuma publicação ou operação remota foi feita.

## Atualização — upgrade gráfico

O relatório completo está em [docs/UPGRADE-GRAFICO.md](./docs/UPGRADE-GRAFICO.md). As 93 verificações existentes passaram, junto com 26 verificações novas de personagem, sequência, modelos e renderização e duas verificações do loop real na GPU Intel: **121 verificações aprovadas**. A sequência levou 2,737 s no teste real.

Amostra curta de renderização na Intel UHD 620: Econômica 60,2 FPS; Padrão 40,6 FPS. Esses valores incluem espera entre quadros, mas não representam uma homologação de partida longa. A medição anterior de apenas submissão de comandos foi descartada como estimativa de FPS. O modo software apresentou fluidez insuficiente para validar o loop em tempo real.

Os limites de validação da etapa 1 registrados abaixo são históricos. O upgrade acrescentou a medição em GPU real e inspeção das novas capturas; tela cheia interativa, áudio percebido e homologação prolongada permanecem pendentes.

## Verificado

- Git local em `main`, sem commits, com apenas o remoto oficial autorizado.
- Recursos Three.js e licença MIT presentes localmente.
- Servidor PowerShell iniciado e recursos carregados via HTTP em localhost.
- Edge headless com WebGL2/SwiftShader: 11 verificações em `tests/smoke.html`, todas passaram.
- Animação altera a pose das pernas.
- Modelo fornece raiz única para adaptação futura.
- Dois minutos simulados mantêm a quantidade de objetos do cenário.
- Segmentos permanecem nos limites e conservam espaçamento de 16 unidades.
- Inicialização completa e contexto WebGL2 ativo.
- Entrada na prévia e retorno pelo Escape.
- Abertura e fechamento do diálogo de informações.
- Captura da tela inicial em 1920 × 1080 inspecionada: personagem, arquitetura, tipografia e botões aparecem sem sobreposição de texto.

Para repetir o teste, inicie o servidor e abra `http://localhost:8080/tests/smoke.html`. O resultado esperado é `ALL PASS`.

## Limites desta validação

- Não foi medido FPS na GPU real; os testes automatizados usaram renderização por software.
- Tela cheia pela Fullscreen API e saída pela tecla do navegador precisam de interação manual.
- A experiência completa em janela e em diferentes monitores ainda precisa da conferência do usuário.
- Não houve publicação, push ou teste em GitHub Pages.
- Avisos internos do gerenciador de tarefas do Edge apareceram no processo headless; as verificações do jogo passaram.

## Problemas do ambiente e solução

- Node/npm e Python executável não disponíveis: servidor local implementado em PowerShell/.NET.
- Sandbox passou a falhar ao abrir processos após `git init`: comandos de verificação executados com aprovação fora do sandbox.
- Git apontou proprietário diferente para `.git`: utilizada opção `-c safe.directory=D:/Matheus/Manequin-Run` apenas nos comandos locais. Nenhuma configuração global foi alterada. Caso o aviso apareça no terminal do usuário, a mesma opção pode ser aplicada ao comando necessário.

## Etapas 2 a 5 — atualização

As páginas abaixo passaram no Edge headless com renderização WebGL por SwiftShader:

| Página | Verificações | Cobertura |
| --- | ---: | --- |
| `tests/movement.html` | 15 | Faixas, interpolação, salto, pouso, deslizamento, teclas e remoção do listener |
| `tests/mechanics.html` | 24 | Colisões por tipo, passagem rápida, faixa livre, coleta, recorde, pausa, reinício e integração com UI |
| `tests/sectors.html` | 19 | Ciclo dos quatro setores, continuidade de cores, arquitetura reciclada e reset |
| `tests/polish.html` | 23 | Inicialização de áudio, volume, limite de vozes, partículas, preferências, qualidade, instâncias e escala de cena/diálogo |
| `tests/smoke.html` | 12 | Inicialização e regressão de animação, cenário, menus e WebGL |

Total: **93 verificações de desenvolvimento**. As verificações da etapa 1 acima são o registro histórico inicial; a página smoke foi atualizada para o jogo atual.

Inspeção visual adicional: capturas dos quatro setores, menu inicial, pausa, Game Over e configurações. Foi encontrado e corrigido deslocamento da cena em janelas menores; também foi corrigida a escala dos diálogos nativos na camada superior do navegador. A composição foi verificada em uma janela lógica de 960 × 540 dentro dos testes, sem reorganização dos elementos.

O cenário e os objetos repetidos usam `InstancedMesh`, geometrias e materiais compartilhados. Instâncias removidas durante a troca de arquitetura liberam suas alocações. Obstáculos e chips usam nove grupos recicláveis; efeitos usam 96 partículas e áudio transitório tem limite de 12 vozes.

O teste de áudio verificou o grafo e as configurações, não a percepção sonora em caixas ou fones. O navegador headless pode manter o contexto suspenso por ausência de gesto real. A verificação auditiva fica para a etapa 6, junto com a medição de FPS na GPU do usuário, sessões prolongadas e a interação real de tela cheia.

## Etapa 6 — não executada

Por solicitação do usuário, a homologação final e publicação não foram realizadas. Não houve commit, push, deploy, alteração global do Git ou uso de conectores GitHub. A próxima etapa permanece pendente.
