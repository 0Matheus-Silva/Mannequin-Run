# GitHub e execução da aplicação

## Site publicado

O workflow `.github/workflows/pages.yml` publica automaticamente pushes em `main`, copiando apenas `index.html`, `assets`, `src` e `styles`. Em Settings → Pages, a fonte precisa ser GitHub Actions. Acompanhe a execução “Publicar MANNEQUIN RUN” na aba Actions.

Endereço: https://0matheus-silva.github.io/Mannequin-Run/

GitHub Pages hospeda arquivos estáticos: o jogo e a demonstração roteirizada com narração local funcionam ali. **Pages não executa Node, Python ou MySQL**, portanto não fornece Gemini Live nem sincronização com o banco. Perfis criados nesse endereço ficam pendentes no navegador; eles não são um banco compartilhado online.

## Versão completa após baixar o repositório

No Windows com MySQL Community e Python 3.11+ instalados:

1. Disponibilize Node LTS 22.13+ ou execute `powershell -ExecutionPolicy Bypass -File tools/Prepare-Node.ps1` para uma cópia portátil.
2. Copie `.env.example` para `.env` e preencha as credenciais administrativas MySQL localmente. Configure sua chave Gemini e as confirmações operacionais somente nesse arquivo, conforme [o guia Gemini](./GEMINI-LOCAL.md). Nunca coloque segredos em arquivos do Pages ou no Git.
3. Execute `powershell -ExecutionPolicy Bypass -File .\Start-Local.ps1 -Setup` para criar banco, tabelas e usuário restrito.
4. Abra **http://127.0.0.1:8084**. Nas próximas execuções, basta `Start-Local.ps1`.

O servidor Node serve jogo/perfis e encaminha `/api/assistant/*` ao Python. MySQL e demonstração funcionam sem internet após preparar dependências; Gemini Live exige internet e cota. O teste local não liga ou configura a VM.

## Disponibilizar a versão completa fora da máquina

É necessário hospedar **o conjunto de servidores**, e não apenas copiar os arquivos para IIS ou Pages: Node, Python e MySQL, além de um endereço HTTPS e configuração segura de origem/proxy. O código atual aceita somente origens de loopback; encaminhar uma URL pública diretamente à porta 8084 será recusado e não constitui uma publicação pronta.

Uma implantação externa precisa configurar explicitamente o domínio confiável, proteção das rotas de perfis/exportação, HTTPS e operação dos processos, mantendo MySQL e o broker Gemini privados. Um túnel ngrok para a VM não remove esses requisitos. Nenhum túnel, serviço externo, faturamento ou configuração de VM foi criado nesta atualização.

## Continuidade da fala

O áudio Live deixou de ser interrompido por picos locais do microfone: a interrupção por fala do visitante é decidida pelo evento do Gemini, com o botão INTERROMPER FALA mantido. A fila PCM não descarta mais trechos só por ultrapassar cem blocos pequenos. Fala sintetizada local longa foi dividida em segmentos, com cancelamento protegido contra callbacks antigos.

O limite operacional Live existente continua sendo **três minutos por sessão**; ao atingir esse limite, a interface pede nova conexão. Minimizar o painel, ocultar a página, encerrar ou clicar em interromper continua parando a fala intencionalmente. Quedas de rede ou cota do provedor não podem ser eliminadas por uma correção da fila local.

A apresentação menciona a autoria coletiva de **Matheus, Pedro e Victor** no começo ou no final, sem atribuir etapas a pessoas específicas. A base, o roteiro mestre, as instruções Live e o WAV local foram atualizados juntos.
