# Executar Nexus em outro computador Windows

Abrir a pasta no VS Code não inicia os servidores. Live Server, `file://` e GitHub Pages servem apenas o frontend; não emitem tokens Gemini.

1. Obtenha a versão atual do repositório. Instale Python 3.11+ e MySQL Community Server. O MySQL Server deve estar ativo; apenas MySQL Workbench não basta. Disponibilize Node 22.13+ ou execute `powershell -ExecutionPolicy Bypass -File .\tools\Prepare-Node.ps1` para preparar o Node portátil.
2. Na raiz, se ainda não existir `.env`, copie `.env.example` para `.env`. Preencha a chave Gemini e as credenciais administrativas **do MySQL desse computador** somente no arquivo local. As confirmações `GEMINI_ENABLED=true`, `GEMINI_AUDIENCE_REVIEW=approved-adults-only` e `GEMINI_FREE_TIER_CONFIRMED=true` exigem as revisões descritas em GEMINI-LOCAL.md. Não substitua um `.env` já preenchido pelo modelo vazio.
3. No terminal PowerShell do VS Code, dentro da pasta do projeto, execute:

```powershell
powershell -ExecutionPolicy Bypass -File .\Start-Local.ps1 -Setup
```

O inicializador prepara as dependências Node, cria o banco e as tabelas e inicia o backend Python mais o servidor Node. Não instala o MySQL nem serviços Windows. Mantenha o terminal aberto. Nas próximas execuções use o mesmo comando sem `-Setup`.

4. Abra **http://127.0.0.1:8084**. Selecione Gemini Live no chatbot, aceite o processamento externo e conecte. Use CONHEÇA O NEXUS para apresentar ou ATIVAR MICROFONE para conversar. Permita o microfone no navegador.
5. Se não conectar, execute em outro terminal:

```powershell
powershell -ExecutionPolicy Bypass -File .\tools\Test-Local.ps1
```

O diagnóstico não imprime credenciais, não envia áudio e não emite tokens. `ready=true` confirma somente a configuração local; acesso real ao Google e cota só são confirmados ao conectar. Informe o endereço aberto, os resultados do diagnóstico e a mensagem abaixo de CONEXÃO INDISPONÍVEL, sem enviar `.env`.

Alterações em `.env` exigem reiniciar o backend Python; uma instância antiga pode ser reutilizada pelo inicializador. Se necessário, encerre o processo correspondente à execução anterior do Nexus antes de iniciar de novo. Variáveis de ambiente do Windows têm prioridade sobre `.env`.

Cada PC usa seu próprio MySQL e seu próprio armazenamento de navegador. Baixar o repositório não transfere perfis, recordes nem credenciais. Para dados anteriores, use os procedimentos de backup/exportação de MYSQL-JOGADORES-DUALSENSE.md.
