# Configuração local do Gemini Live

O arquivo `.env` na raiz do projeto é local, ignorado pelo Git e bloqueado pelos servidores HTTP. Não coloque a chave em arquivos de `src`, `assets`, HTML ou nesta conversa.

Abra `D:\Matheus\Manequin-Run\.env` no editor. Na linha `GEMINI_API_KEY=`, cole a chave imediatamente depois de `=`, sem espaços. Salve o arquivo. O backend lê `.env` ao iniciar; variáveis já definidas no ambiente do processo têm prioridade sobre o arquivo.

As opções de liberação permanecem nos valores originais. Depois de confirmar pessoalmente que o projeto Google está sem faturamento pago, que há cota gratuita disponível e que a revisão de público está concluída para uso apenas por adultos, os valores previstos pela implementação são:

```dotenv
GEMINI_ENABLED=true
GEMINI_AUDIENCE_REVIEW=approved-adults-only
GEMINI_FREE_TIER_CONFIRMED=true
```

Essas opções apenas registram confirmações locais: não alteram a conta Google nem habilitam faturamento. Colar a chave por si só não libera a integração.

Inicie ou reinicie o backend na raiz do projeto:

```powershell
powershell -ExecutionPolicy Bypass -File .\Start-Assistant.ps1
```

Abra `http://127.0.0.1:8081`. O servidor de jogo na porta 8080 não emite tokens Gemini. No painel CONVERSAR, selecione Gemini, leia e aceite o aviso de processamento externo e inicie a sessão. O microfone requer acionamento próprio.

A configuração existente permanece em `assets/assistant/live-config.json`: modelo `gemini-3.8-live`, voz `Sadachbia`, idioma `pt-BR`. O backend inclui a instrução de `personality.json` e a base oficial de `knowledge.json`. O navegador recebe apenas um token efêmero e usa `BidiGenerateContentConstrained`, conforme a [documentação oficial de WebSockets](https://aistudio.google.com/docs/live-api/get-started-websocket#authentication-with-ephemeral-tokens).

Os testes locais validam payload, personalidade, proteção dos segredos e conexão simulada. Somente uma sessão real após configurar a chave pode confirmar acesso do projeto, cota, aceitação da voz e qualidade do áudio. A voz da demonstração offline continua independente de Sadachbia.

## Diagnóstico real de 15/11/2026

A API REST rejeitou `liveConnectConstraints` com HTTP 400. Esse nome pertence à abstração do SDK; o esquema REST consultado no serviço exige `bidiGenerateContentSetup`. O backend agora envia a configuração completa nesse campo, mantendo modelo, voz, personalidade e base oficial vinculados ao token.

Após a correção, a emissão real retornou HTTP 200 e uma conexão WebSocket com a configuração existente recebeu `setupComplete`. Não foram enviados áudio de microfone ou perguntas nesse diagnóstico. A qualidade da conversa e da voz ainda depende do teste manual. O intervalo local entre emissões foi removido: uma nova tentativa manual pode ser feita imediatamente. Continuam valendo o limite local de 30 tentativas por dia/processo, configur?veis por GEMINI_LOCAL_DAILY_LIMIT e os limites retornados pelo Google.
