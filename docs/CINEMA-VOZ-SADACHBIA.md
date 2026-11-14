# Cerimônia cinematográfica e voz Sadachbia

**Atualização posterior de movimento:** as escadas frontais foram removidas e o protagonista agora faz um salto com pirueta para o primeiro lugar, com pouso amortecido e câmera acompanhando a trajetória. Números centralizados e coreografia contínua em aproximadamente 1,9 s. A câmera antecipa o recuo para não cortar os pés ou a cabeça. A cronologia dos concorrentes, voz, taça e créditos permanece igual. Os registros de escadas e a contagem de testes abaixo correspondem à entrega anterior. Validação atual em `.tmp-qa/pirueta-*.txt`.

Entrega local dos dois prompts de 14/11/2026. O jogo existente foi preservado. Não houve acesso a serviços externos, upload, commit, push, deploy, publicação, instalação de dependências, uso de plugins/conectores ou alteração em outro repositório.

## Cena final

O plano aberto apresenta palco, marca EXPOTECH 2026, os três participantes e os números 2–1–3. As caixas largas e as escadas deslocadas foram preservadas. O protagonista continua emendando a aproximação na subida sem pausa e gira somente no topo.

A nova direção de câmera tem enquadramentos individuais, com interpolação `smootherstep` da posição, alvo e campo de visão. A trajetória permanece à frente do palco e não passa pelas plataformas. O jogo continua usando sua câmera normal fora do encerramento.

| Tempo da chegada | Cena |
| --- | --- |
| Até 21 s | UniFECAF, interior e subida contínua preservados |
| 21–22 s | Plano aberto do palco e das três posições |
| 22–23 s | Travelling e zoom para a direita |
| 23–26 s | Close do aparelho, sobrecarga e explosão aos 25,5 s |
| 26–27 s | Transição suave até o baú à esquerda |
| 27–29 s | Fechamento sobre a língua, fala e lágrimas |
| 29–30 s | Transição suave até o protagonista |
| 30–32 s | Entrega e levantamento da taça com iluminação quente |
| 32 s | WIN!, primeiro lugar e fanfarra; telão também indica vitória |
| 32,8 s | Início dos créditos, após concluir a pose principal |
| 33 s | Tela de vitória e seus controles |
| 32,8–41,8 s | Créditos rolando por nove segundos |

O prompt mais recente determina **nove segundos de rolagem**. Essa duração substitui os 30 segundos da entrega anterior. Não foi reintroduzida a longa espera: os créditos começam 0,8 segundo após a taça totalmente erguida. CDC2NA e os três nomes continuam iguais. Pausa, reprodução manual e opção de desligar créditos automáticos foram mantidas.

O terceiro lugar mantém placa, componentes, bobina e acrílico, agora com fiação, eletrodos, alternância de luz azul/violeta e pequenos fragmentos na explosão. Fogo, clarão e faíscas permanecem restritos ao equipamento. O segundo lugar continua sendo o baú com monitor, língua, recolhimento do monitor ao fechar e lágrimas ascendentes. O grito foi sincronizado com a compressão da língua. No primeiro lugar, o modelo aprovado permanece intacto, com a taça inteira no close.

A legenda inferior deixa de aparecer durante os closes para não sobrepor números ou ações. WIN! foi colocado acima do telão, com indicação de primeiro lugar e iluminação do vencedor.

## Áudios locais e mixagem

Foram adicionados três arquivos em `assets/audio/ceremony/`:

- `explosion.wav`: 3,4 s, efeito original com impacto de ruído, grave, reverberação em múltiplos atrasos e cauda de destroços.
- `chest-tongue.wav`: 1,7 s, “Ah! Minha língua!”, gerado pelo Windows System.Speech com Microsoft Maria Desktop pt-BR, ênfase e prosódia; silêncio removido e duração ajustada à animação.
- `victory.wav`: 2,4 s, fanfarra original sintetizada localmente.

Não foram baixados samples de bibliotecas nem extraídos sons de filmes ou jogos. Explosão e fanfarra são sínteses originais; não são gravações profissionais de biblioteca. A fala é sintética, sem ator. A [nota de origem e licença](../assets/audio/ceremony/ORIGEM-E-LICENCA.md) acompanha os arquivos. A engine/voz Microsoft não foi redistribuída, e não foi atribuída uma licença CC0 à voz instalada.

Os padrões de volume geral/música/efeitos passaram a 0,65/0,60/0,85. **Preferências já salvas não foram substituídas.** Movimentação, colisão, música e ambiente receberam mais presença. Explosão e fala passam pelo barramento de efeitos e compressor existentes; o WAV original é normalizado abaixo do limite PCM. Durante a explosão, a música cai a 50%; durante a fala, a 24%, retornando suavemente depois. Os sliders existentes continuam funcionando, inclusive durante essa redução temporária.

Os WAVs são carregados e decodificados após liberar áudio no navegador, sem bloquear o início da partida. Sem o arquivo disponível, efeitos de síntese existentes continuam como contingência; a versão entregue contém o WAV da frase completa.

Para regenerar os áudios, execute primeiro `tools/New-Chest-Voice.ps1` e depois `tools/New-Award-Audio.py` com Python local. O primeiro requer uma voz SAPI pt-BR instalada; o segundo usa somente biblioteca padrão, gera os efeitos e ajusta a duração da fala.

## Diagnóstico e ajuste do Gemini

A implementação encontrada utiliza:

| Responsabilidade | Arquivo real |
| --- | --- |
| Modelo, voz, idioma e limites | `assets/assistant/live-config.json` |
| Instrução de personalidade | `assets/assistant/personality.json` |
| Contexto confirmado do projeto | `assets/assistant/knowledge.json` |
| Inicialização Live e WebSocket | `src/assistant/GeminiProvider.js` |
| Autenticação, tokens e montagem da instrução | `server/assistant_server.py` |
| Histórico e gerenciamento de sessão | `src/assistant/Session.js` |
| Captura e reprodução | `src/assistant/audio/Microphone.js`, `VoiceOutput.js`, `capture-worklet.js`, `Resampler.js` |
| Demonstração e apresentação | `DemoProvider.js`, `Session.js` e `assets/assistant/presentation.wav` |

A voz anterior era **Puck**, selecionada no pedido inicial por seu estilo animado. Agora a configuração compartilhada usa **Sadachbia**, mantendo `gemini-3.8-live` e `pt-BR`. O backend já consome essa configuração e monta `generationConfig.speechConfig.voiceConfig.prebuiltVoiceConfig.voiceName`. Não foi criada uma segunda integração. O português brasileiro é determinado pela instrução do sistema; não foi adicionado um `languageCode` não suportado pela configuração de áudio nativo em uso.

A personalidade agora pede voz masculina natural, conversa animada e expressiva, curiosidade sobre humanos, sarcasmo leve, humor contextual sobre o manequim/computador e respostas curtas para perguntas simples. Evita bordões, saudações repetidas, atuação exagerada e apresentações fora de contexto. Mantém perguntas espontâneas, explicações adaptadas, distinção entre personagem e consciência real e proibição de inventar especificações ou dados pessoais.

A base inteira continua sendo enviada na instrução da sessão pelo backend. CPU/GPU/RAM não confirmados permanecem desconhecidos. O modo apresentação recebeu abertura mais convidativa e convite explícito a perguntar e experimentar; a contingência WAV local foi regenerada. Essa voz local **não é Sadachbia** e não substitui o áudio nativo da Gemini.

Não foram alterados o WebSocket, autenticação, captura, reprodução, histórico, layout do painel ou gerenciador de sessão do assistente. A restrição operacional para público adulto, revisão de cota, chave no backend e bloqueio padrão continuam em vigor. Nenhuma chave foi exposta nem faturamento habilitado.

## Validação

**364 verificações aprovadas**, com evidências em `.tmp-qa/cinema-*.txt`:

| Verificação | Aprovadas |
| --- | ---: |
| Nove suítes de regressão do jogo | 232 |
| Escadas e subida contínua | 12 |
| Premiação e efeitos | 33 |
| Câmera cinematográfica, mixagem, configuração e cinco perguntas | 20 |
| Reprodução de áudio com AudioContext real | 15 |
| Assistente integrado com microfone sintético | 35 |
| Backend, tokens simulados e instrução completa | 13 |
| Final completo no loop real | 4 |

A câmera foi testada ao longo da trajetória, incluindo continuidade, campo de visão, permanência fora do palco, plano aberto, aparelho inteiro, baú com lágrimas, protagonista e troféu completos. A galeria das quatro etapas foi inspecionada visualmente. A legenda que sobrepunha a numeração nos closes foi removida.

Os sons foram efetivamente reproduzidos no navegador local: sinal medido no analisador, fontes liberadas ao terminar, mute e encerramento verificados. A primeira versão expressiva do grito ficou longa; sua duração foi medida e ajustada para 1,7 s, e o teste de áudio foi repetido com sucesso. A posição das gotas antes da reação também foi normalizada para manter os limites geométricos corretos.

Cinco perguntas da demonstração local foram testadas: como jogar, tecnologias usadas, processador/RAM, consciência e Modo Infinito. Verificou-se que a configuração declara Sadachbia/pt-BR e que a personalidade e todos os valores da base chegam à instrução Live. O teste do assistente cobre áudio local, interrupção, histórico, encerramento, recuperação após erro e controles do jogo.

**Não houve sessão real com Gemini.** Aceitação de Sadachbia pelo provedor, timbre masculino, qualidade de português, humor e naturalidade da resposta real ainda não foram verificados externamente. Os testes de payload e demonstração não comprovam esses resultados. A restrição de público adulto e a configuração autorizada precisam estar resolvidas antes de essa validação ocorrer. A implementação permanece desativada por padrão.

Não houve escuta humana dos arquivos ou homologação acústica do equipamento do evento. A reprodução e o sinal foram verificados por automação; impacto e interpretação devem ser avaliados pela equipe localmente. Fogo, acrílico, fragmentos e lágrimas são efeitos procedurais estilizados, sem simulação física real.

## Executar e avaliar

A instância local atualizada foi iniciada em **http://localhost:8082**, preservando os servidores anteriormente abertos. Para iniciar outra vez nessa porta:

```powershell
powershell -ExecutionPolicy Bypass -File .\Start-Assistant.ps1 -Port 8082
```

No jogo, escolha **CAPÍTULOS → Cerimônia da EXPOTECH 2026 → INICIAR TRECHO**. Ative o áudio e ajuste os volumes desejados. A sequência apresenta cada concorrente até WIN! e créditos. A galeria fica em `tests/award-gallery.html`.

O servidor original `Start-Game.ps1` também serve jogo e demonstração; reinicie uma instância antiga para reconhecer os WAVs. Para testar Sadachbia futuramente, reinicie o backend depois de configurar a chave e concluir a revisão operacional já documentada em [ASSISTENTE-CONVERSACIONAL.md](./ASSISTENTE-CONVERSACIONAL.md). Selecione Gemini, leia o aviso e inicie uma sessão autorizada. O modo demonstração continuará usando voz local, independentemente do nome configurado para Gemini.

## Arquivos desta entrega

Criados: `src/story/AwardCamera.js`, `tools/New-Award-Audio.py`, `tools/New-Chest-Voice.ps1`, três WAVs e nota de origem em `assets/audio/ceremony/`, `tests/cinematic-awards.html` e este relatório.

Alterados: `src/story/StoryFinale.js`, `PlasmaProject.js`, `Competitors.js`; `src/audio/AudioEngine.js`; `src/game/Game.js`; `src/utils/Settings.js`; `src/ui/UI.js`; `index.html`; `styles/main.css`; `assets/assistant/live-config.json`, `personality.json`, `knowledge.json`, `presentation.wav`; `tools/New-Presentation-Audio.ps1`; testes `award-finale.html`, `award-audio.html`, `physical-chapters.html`, `final-adjustments.html`, `visual-package.html`, `finale-realtime.html`, `test_assistant_server.py`; `README.md` e `docs/DESENVOLVIMENTO.md`.

Nenhuma dependência adicionada. Python e System.Speech já estavam disponíveis localmente.
