# Nexus

**GitHub Pages:** o link público executa o jogo e a demonstração local. Gemini Live e MySQL exigem os servidores da versão completa; veja [como executar no GitHub e localmente](./docs/EXECUCAO-GITHUB.md).

**Execução local com jogadores MySQL e controle DualSense:** execute `powershell -ExecutionPolicy Bypass -File .\Start-Local.ps1` e abra **http://127.0.0.1:8084**. O inicializador cria o banco automaticamente após configurar as credenciais locais; não instala serviços Windows. Veja [configuração, salvamento, backup e testes](./docs/MYSQL-JOGADORES-DUALSENSE.md). Gemini permanece no backend Python existente.

**Jogar no navegador:** [Nexus no GitHub Pages](https://0matheus-silva.github.io/Mannequin-Run/).

**Último ajuste:** fala direta “Ai, minha língua!”, sem repetições; apresentações começam assim que termina o pouso, com ritmo 40% mais rápido e câmera contínua. Entrada da UniFECAF com fechamento lateral direito e superior, sem vão para o interior. [Publicação e funcionamento no Pages](./docs/PUBLICACAO.md). Os relatórios abaixo são registros de versões anteriores.

**Entrega atual — cinema e Sadachbia:** câmera individual para os três concorrentes, fala local do baú, explosão/fanfarra em WAV, mixagem revisada, WIN! e créditos de nove segundos. Gemini configurado para Sadachbia com nova personalidade; sessão real permanece desativada e pendente de validação autorizada. [Relatório dos dois prompts e testes](./docs/CINEMA-VOZ-SADACHBIA.md). Instância atualizada em **http://localhost:8082**. Os relatos abaixo registram versões anteriores.

**Premiação revisada:** pódios ampliados com números livres das escadas; baú com língua e reação no segundo lugar; aparelho de plasma com sobrecarga, explosão e fogo no terceiro; taça, VITÓRIA e créditos mais lentos. [Relatório da premiação e 327 verificações](./docs/PREMIACAO-ENCERRAMENTO.md). Avaliação rápida em **CAPÍTULOS → Cerimônia da EXPOTECH 2026**. Os relatos abaixo registram entregas anteriores.

**Nova entrega — assistente:** painel lateral, conversa roteirizada identificada, apresentação falada offline, microfone e áudio independentes. Backend Gemini Live preparado e desativado até revisão de público, chave e cota. [Relatório, execução, configuração e 284 verificações](./docs/ASSISTENTE-CONVERSACIONAL.md). Para experimentar, abra **CONVERSAR** no jogo. O modo local funciona sem API.

Runner 3D para PC, com Modo História e Modo Infinito. Desenvolvimento por etapas, conforme documento mestre 2.1 e pacote visual.

**Entrega mais recente:** protagonista adaptado à fotografia do projeto físico, com roupa preta, capuz, máscara ciano e hardware exposto; oito capítulos acessíveis no menu; créditos CDC2NA subindo cinco segundos após ocupar o pódio. Veja [personagem, fases, créditos e validação](./docs/PERSONAGEM-FISICO-FASES-CREDITOS.md). Para avaliar rapidamente: **CAPÍTULOS → Cerimônia da EXPOTECH 2026 → INICIAR TRECHO**. Registros abaixo correspondem às versões anteriores.

**Atualização atual — ajustes finais:** interface em português, fachada UniFECAF com portais curvos e chegada durante a corrida, portas automáticas, pódio completo com inventor e baú com monitor, além de trilhas de componentes para salto, deslize e troca de faixa. [Relatório completo e testes](./docs/AJUSTES-FINAIS.md): 191 verificações aprovadas e 1.800 percursos de coleta simulados. As medições e os relatórios abaixo são registros das entregas anteriores.

**Pacote visual e narrativo implementado:** robô enferrujado, quatro cenários 3D, portas físicas, obstáculos temáticos, música independente e final do Modo História na UniFECAF / EXPOTECH 2026. Consulte o [relatório atual completo](./docs/PACOTE-VISUAL-RELATORIO.md): 163 verificações aprovadas, arquivos, capturas, instruções e limites. Amostra local na Intel UHD 620: Econômica 60,1 FPS, Padrão 41,6 FPS e Alta 30,2 FPS. Tudo permanece local.

**Upgrade gráfico aplicado:** manequim com armadura articulada, idle olhando para a câmera, sequência cinematográfica de PLAY, laboratório ampliado, modelos industriais e bloom. Veja o [relatório do upgrade](./docs/UPGRADE-GRAFICO.md), com arquivos, testes e medições. Na Intel UHD 620 testada, Econômica ficou perto de 60 FPS na amostra de renderização; Padrão ficou perto de 41 FPS.

## Executar no Windows

Na pasta do projeto, abra o terminal PowerShell e execute:

```powershell
powershell -ExecutionPolicy Bypass -File .\Start-Game.ps1
```

Abra **http://localhost:8080** no Edge ou Chrome. Para encerrar o servidor, use Ctrl+C. Se a porta estiver ocupada, acrescente `-Port 8081` e abra a nova porta.

O servidor usa apenas .NET/PowerShell, aceita conexões apenas da própria máquina e serve recursos estáticos. Não exige Node, npm, Python ou backend do jogo. A opção Bypass vale só para esse processo. Não abra `index.html` por duplo clique: os módulos JavaScript precisam de HTTP.

## Escopo atual: etapas 1 a 5

- Laboratório procedural com arquitetura em profundidade, monitores, tubulações, passarelas e névoa.
- Manequim humanoide com volumes arredondados, juntas, visor e circuitos ciano.
- Animações de espera e corrida com braços, pernas e flexão de joelhos.
- Três faixas, troca lateral suave, salto, deslizamento e animação de colisão.
- Obstáculos altos, barreiras para saltar e vigas para deslizar, com colisões verificadas em pequenos passos de simulação.
- Chips animados, efeitos de coleta, pontuação, distância e recorde no LocalStorage.
- Velocidade progressiva, padrões com uma faixa sempre livre e ciclo de Game Over/reinício.
- Quatro setores com arquitetura e atmosfera próprias, transições graduais e títulos cinematográficos.
- Menu inicial, instruções, pausa, resultados e configurações.
- Áudio sintetizado localmente: música sequenciada, ambiente por setor e efeitos de movimento, coleta e colisão.
- Volume, áudio ligado/desligado e três opções de qualidade gráfica, com preferências salvas.
- Composição fixa 1920 × 1080 com escala uniforme e barras pretas.
- Tela cheia e tratamento de falha de inicialização/WebGL.

**A etapa 6 — testes finais e publicação — permanece pendente por solicitação do usuário.** As verificações de desenvolvimento de cada etapa foram executadas; isso não equivale à homologação final em hardware real.

## Jogar

1. Ao abrir, confira laboratório, personagem iluminado e animação de espera.
2. Clique em **PLAY / INICIAR**. Use **A/D** ou **←/→** para trocar de faixa.
3. Use **Espaço/↑** para saltar as barreiras baixas amarelas e **S/↓** para deslizar sob as vigas vermelhas. Desvie dos gabinetes altos.
4. Colete componentes: cada chip vale 75 pontos, além dos 10 pontos por metro percorrido.
5. Use **Esc** para pausar/continuar. Após Game Over, **R** reinicia. Os menus também funcionam pelo mouse.
6. Selecione o modo antes de PLAY. Cada 600 metros inicia um setor. No Infinito, o ciclo recomeça após o quarto; no História, aos 2.400 m começa a chegada à UniFECAF e a cerimônia. As transições de cor começam 120 metros antes da mudança.
7. Use **CONFIGURAÇÕES** para mudar qualidade, música, faixa e volumes geral/de música/de efeitos. É possível selecionar áudio próprio somente para a sessão local. O áudio só é inicializado após interação; o botão **ÁUDIO ON/OFF** permite silenciar tudo.

Se a execução estiver pesada, selecione qualidade **Econômica**, que reduz a resolução interna e desliga sombras. A escala externa continua proporcional, com barras pretas quando necessário.

## Verificações de desenvolvimento

Com o servidor ativo, abra as páginas `tests/movement.html`, `tests/mechanics.html`, `tests/sectors.html`, `tests/polish.html` e `tests/smoke.html`. Cada uma mostra `ALL PASS` ao concluir. Elas usam dados de teste; execute em um perfil separado do navegador se quiser preservar seus recordes sem interferência.

O script `tools/Test-Browser.ps1` automatiza uma página no Microsoft Edge headless instalado no caminho padrão do Windows. Exemplo:

```powershell
powershell -ExecutionPolicy Bypass -File .\tools\Test-Browser.ps1 -Page tests/mechanics.html
```

As páginas `tests/gallery.html` e `tests/menus.html` são cenas de inspeção visual. Não fazem parte do fluxo normal do jogo.

Veja [VALIDACAO.md](./VALIDACAO.md) para os resultados e [docs/DESENVOLVIMENTO.md](./docs/DESENVOLVIMENTO.md) para o relatório por etapa.

## Organização

- `src/game/`: renderização, câmera, estados, controles, pontuação e persistência de recorde.
- `src/player/Mannequin.js`: modelo e animação; interface `root/update` permite trocar o visual por GLB no futuro.
- `src/player/PlayerController.js`: movimento e volume de colisão, independentes do visual.
- `src/environments/`: laboratório, setores e reciclagem de arquitetura com materiais compartilhados.
- `src/obstacles/`: padrões, colisões e objetos de pista reutilizáveis.
- `src/world/Effects.js`: pool fixo de partículas de coleta e colisão.
- `src/audio/AudioEngine.js`: síntese sonora e ambiente, com limite de vozes.
- `src/utils/`: configurações e agrupamento de malhas repetidas em instâncias.
- `src/ui/UI.js`: menus, escala fixa, tela cheia e mensagens.
- `styles/main.css`: interface com coordenadas lógicas fixas.
- `assets/vendor/three/`: Three.js 0.170.0 e licença MIT, armazenados localmente.

Dependência: [Three.js](https://threejs.org/), usando módulos ES conforme a [documentação oficial de instalação](https://threejs.org/manual/pages/installation.html). A biblioteca é fixada em 0.170.0 para manter a base reproduzível; não depende de CDN durante o jogo. Fontes, personagem e ambiente não exigem downloads externos.

Os caminhos de execução são relativos e adequados à hospedagem estática. Compatibilidade real com GitHub Pages só poderá ser confirmada após publicação autorizada.

## Versionamento

Único remoto autorizado: `https://github.com/0Matheus-Silva/Mannequin-Run.git`, branch `main`. Não houve push ou deploy.

Próxima etapa, ainda não executada: etapa 6, com homologação final de controles, colisões, transições, áudio, proporção, tela cheia e desempenho; eventual publicação depende de autorização explícita.
