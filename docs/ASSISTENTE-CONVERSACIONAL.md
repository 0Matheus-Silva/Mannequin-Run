# Assistente do Nexus

Entrega local de 14/11/2026. O jogo recebeu um painel lateral independente, demonstração roteirizada e apresentação falada offline. A infraestrutura para Gemini Live está implementada, mas a conversa real permanece desativada: faltam chave, revisão operacional do público e confirmação da disponibilidade gratuita no projeto do provedor. Nenhuma conversa ou gravação foi enviada ao Google durante o desenvolvimento.

## Funcionalidades

- Painel à direita, avatar do manequim com capuz e máscara ciano, animação durante a fala, estados de conexão, escuta, processamento e erro.
- Abrir, minimizar e expandir preservam a simulação e a proporção 16:9. O botão de pausa se desloca para permanecer acessível. Digitar no formulário não aciona movimentos.
- Conversa por texto em demonstração explicitamente identificada como roteirizada. Saudações variadas, humor leve, respostas sobre projeto, componentes, controles, modos e história; perguntas desconhecidas recebem uma limitação clara.
- Personalidade e conhecimento separados do código. Especificações de CPU/GPU/RAM não foram inventadas. A base registra a diferença entre EXPOTEC no pedido e EXPOTECH nas cenas existentes, sem renomear o jogo.
- Botão de apresentação com transcrição e WAV local. A contingência foi gerada com Microsoft Maria Desktop, instalada no Windows; ela **não é Puck**. Respostas da demonstração podem usar síntese de voz local pt-BR disponível no navegador, com texto como alternativa.
- Volume de voz independente, interrupção imediata e fila de reprodução PCM. Captura mono por AudioWorklet e reamostragem contínua para PCM16 de 16 kHz; reprodução Live preparada para PCM16 de 24 kHz.
- Microfone somente mediante acionamento. Na demonstração, serve para testar captura e indicador: não transcreve perguntas nem envia áudio. Minimizá-lo ou encerrar a sessão desliga as faixas do dispositivo. A aplicação não grava arquivos de visitantes.
- Histórico somente em memória, limitado a 60 mensagens; texto limitado por entrada/mensagem. Encerrar limpa o histórico; minimizar conserva a conversa. Não há persistência em LocalStorage para diálogos.
- Falhas de permissão, rede, configuração e cota têm mensagens próprias. Reconexão manual, sem repetição automática nem troca para serviço pago.

## Integração preparada e proteções

O backend usa apenas a biblioteca padrão do Python, escuta em 127.0.0.1 e também serve o jogo. A chave permanente fica no ambiente do processo ou em `.env`, nunca no HTML/JavaScript. O navegador recebe somente um token efêmero de uso único. Host, Origin, nonce CSRF, tamanho de corpo, caminhos estáticos e arquivos permitidos são verificados. Não são registrados corpos de requisição, transcrições, chaves ou tokens.

O adaptador utiliza WebSocket nativo, `realtimeInput.text`, áudio, transcrições, detecção de interrupção e processamento de todos os eventos recebidos. A configuração compartilhada seleciona `gemini-3.8-live`, voz `Puck` e instruções em português. O protocolo e os formatos foram conferidos na [visão geral Live](https://aistudio.google.com/docs/live-api), nas [capacidades](https://aistudio.google.com/docs/live-api/capabilities), na [referência WebSocket](https://aistudio.google.com/api-reference/live/bidi-generate-content) e nos [tokens efêmeros](https://aistudio.google.com/docs/live-api/ephemeral-tokens). A [lista de vozes](https://aistudio.google.com/docs/speech-generation#prebuilt-voices) descreve Puck como animada.

O backend exige quatro condições: habilitação explícita, revisão de público `approved-adults-only`, confirmação da modalidade gratuita e chave configurada. O aceite no painel refere-se ao processamento externo e **não substitui essa revisão**. Os [termos do Gemini API](https://aistudio.google.com/docs/terms) restringem clientes dirigidos ou provavelmente acessíveis a menores de 18 anos; também explicam o tratamento dos dados em serviços gratuitos. Uma feira com acesso provável de menores deve continuar usando a demonstração local, salvo outra solução compatível com os termos aplicáveis.

Há limite local de três minutos por sessão, intervalo mínimo de três minutos entre emissões e dez emissões por dia/processo. Os contadores ficam em memória e reiniciar o servidor os reinicia; não constituem controle de faturamento. A [tabela de preços](https://aistudio.google.com/docs/pricing#gemini-3.8-live) apresenta modalidade gratuita para o modelo, mas a disponibilidade depende do projeto; consulte os [limites oficiais](https://aistudio.google.com/docs/rate-limits). Não existe garantia programática de custo zero para uma chave vinculada a faturamento: confira o projeto sem cobrança antes de qualquer ativação. Nenhum faturamento foi habilitado aqui.

## Arquivos

Criados:

- `assets/assistant/knowledge.json`, `personality.json`, `live-config.json`, `presentation.wav`.
- `src/assistant/Config.js`, `AssistantUI.js`, `Session.js`, `DemoProvider.js`, `GeminiProvider.js`.
- `src/assistant/audio/Microphone.js`, `VoiceOutput.js`, `Resampler.js`, `capture-worklet.js`.
- `styles/assistant.css`, `server/assistant_server.py`, `.env.example`, `Start-Assistant.ps1`.
- `tools/New-Presentation-Audio.ps1`, `tests/assistant.html`, `tests/assistant-scene.html`, `tests/test_assistant_server.py` e este relatório.

Modificados: `index.html` (painel), `src/main.js` (inicialização isolada), `.gitignore` (segredos/cache Python), `Start-Game.ps1` (MIME WAV), `tools/Test-Browser.ps1` e `tools/Measure-Render.ps1` (microfone sintético opcional), `README.md` e `docs/DESENVOLVIMENTO.md`.

Nenhuma dependência instalada. Node/npm não estavam disponíveis; o backend usa Python 3.11+ já presente (testado com Python 3.15). O modo offline continua disponível pelo servidor PowerShell original, sem Python. Web Audio, AudioWorklet, getUserMedia e SpeechSynthesis são APIs do navegador. Three.js permanece local e inalterado.

## Executar

Para jogo e demonstração offline:

```powershell
powershell -ExecutionPolicy Bypass -File .\Start-Game.ps1
```

Abra `http://localhost:8080`, clique em **CONVERSAR** e inicie a demonstração. Se o servidor já estava aberto antes da alteração, reinicie-o para reconhecer o MIME do WAV.

Para servir o jogo com o backend preparado, ainda desativado por padrão:

```powershell
powershell -ExecutionPolicy Bypass -File .\Start-Assistant.ps1
```

Abra `http://localhost:8081`. O script encontra Python instalado ou usa `uv python find --offline --no-python-downloads`; não baixa dependências. Ctrl+C encerra o servidor iniciado nesse terminal.

Somente depois de resolver a revisão de público/termos, a chave e a elegibilidade gratuita, copie `.env.example` para `.env` localmente. Defina `GEMINI_API_KEY` apenas nesse arquivo ou no ambiente do backend. Os valores de liberação são `GEMINI_ENABLED=true`, `GEMINI_AUDIENCE_REVIEW=approved-adults-only` e `GEMINI_FREE_TIER_CONFIRMED=true`; eles registram decisões operacionais e não executam a revisão por você. Reinicie o backend. Selecione Gemini no painel, leia o aviso e inicie a sessão. Não habilite para o evento enquanto a restrição de público permanecer sem solução.

O arquivo `.env` é ignorado pelo versionamento e não é servido pelos servidores. Não cole a chave no frontend. Para atualizar a contingência após editar a apresentação em `knowledge.json`, execute `tools/New-Presentation-Audio.ps1` em uma máquina Windows com voz pt-BR instalada.

## Testes e resultados

**284 verificações aprovadas:** 35 da integração do assistente no navegador, 12 do backend e 237 regressões do jogo. Evidências locais em `.tmp-qa/`.

| Verificação | Resultado |
| --- | --- |
| Movimento / mecânicas / setores / acabamento / inicialização | 15 / 25 / 19 / 23 / 12 aprovadas |
| Upgrade / pacote visual / ajustes finais / personagem e capítulos | 26 / 41 / 26 / 45 aprovadas |
| Introdução com loop nativo | 2 aprovadas |
| Chegada, pódio, troféu, vitória e créditos com loop nativo | 3 aprovadas |
| Assistente no Edge, relógio real e microfone sintético | 35 aprovadas |
| Backend Python, HTTP local e respostas do provedor simuladas | 12 aprovadas |

A integração cobre resampling contínuo, codificação PCM, eventos Live simultâneos simulados, bloqueio sem token/WebSocket, recusa de permissão simulada, **captura efetiva de blocos pelo AudioWorklet com dispositivo sintético**, liberação da faixa, reprodução PCM e WAV, interrupção, estados, formulário seguro, contexto, limite de histórico, apresentação, controles e modos do jogo, painel expandido inclusive com aviso/erro, encerramento e recuperação.

Os testes Python verificam quatro bloqueios operacionais, ausência de chamada externa quando desativado, emissão simulada com prazo e uso único, limites, falha de rede, cota sem novas tentativas, respostas sem segredo, rejeição de Host/Origin, proteção dos arquivos e WAV servido corretamente. As nove suítes antigas passaram novamente na porta 8081. A captura `assistente-painel.png` foi inspecionada visualmente, incluindo o botão de pausa fora do painel.

Comandos principais:

```powershell
powershell -ExecutionPolicy Bypass -File tools/Measure-Render.ps1 -Hardware -FakeMicrophone -Port 8081 -Page tests/assistant.html -Report assistente-integracao.txt
$assistantPython = (& uv python find --offline --no-python-downloads).Trim()
& $assistantPython tests/test_assistant_server.py
powershell -ExecutionPolicy Bypass -File tools/Test-Browser.ps1 -Hardware -Port 8081 -Page tests/physical-chapters.html
```

Áudio foi testado com relógio real: o orçamento virtual do script de captura não é adequado para aguardar reprodução/captura. Uma execução concorrente de capturas disputou o arquivo temporário do executor; as duas suítes afetadas foram repetidas sequencialmente e passaram. Isso não foi contado como falha do gameplay nem como execução aprovada.

## Limites e etapa externa pendente

Não houve sessão real autenticada com Gemini: emissão externa, qualidade da voz Puck, reconhecimento, latência, VAD no ambiente da feira e comportamento real de cota/rede precisam de validação posterior somente quando a ativação for permitida. A demonstração é um sistema de respostas por intenção, sem compreensão aberta de linguagem; as respostas desconhecidas são deliberadamente limitadas. A voz local de contingência tem identidade diferente da voz Gemini.

O teste de microfone usou um dispositivo sintético do Edge; não representa avaliação acústica do microfone físico, ruído ou eco no evento. A inspeção visual e os testes de reprodução não substituem escuta humana. O overlay preserva o centro e os controles, mas ocupa parte da lateral direita da cena. A homologação prolongada em hardware real continua reservada à etapa final previamente excluída pelo usuário.

Todo o trabalho permaneceu na pasta local. Não foram utilizados Drive, Trello, conectores, uploads, commits, push, deploy ou publicação.
