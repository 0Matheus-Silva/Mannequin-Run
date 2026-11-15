# Jogadores, progresso MySQL e DualSense

Entrega local de 15/11/2026. O serviço MySQL80 já estava instalado e ativo (MySQL Community 8.0.46). Nenhum serviço Windows foi instalado ou reconfigurado. O projeto anterior tinha backend Python para Gemini, e não Node: foi acrescentado um servidor Node independente, preservando o broker Gemini e os servidores anteriores.

## Iniciar nesta máquina

```powershell
powershell -ExecutionPolicy Bypass -File .\Start-Local.ps1
```

Abra **http://127.0.0.1:8084**. Esta é a entrada com identificação, salvamento MySQL e Gemini. `Start-Game.ps1` (8080) e `Start-Assistant.ps1` (8081) continuam disponíveis; nessas portas, perfis podem ficar pendentes no navegador porque não há API MySQL. Use sempre a mesma origem (por exemplo, 127.0.0.1:8084): armazenamento do navegador é separado por endereço e porta.

O Node usa `mysql2/promise`, pool limitado a cinco conexões, consultas parametrizadas, transações InnoDB, validação de dados, UUIDs e revisões monotônicas para evitar duplicação de eventos reenviados. Apenas o backend conhece as credenciais. A chave Gemini não foi movida para o Node nem para o navegador; `/api/assistant/*` é encaminhado para o backend Python existente.

O inicializador reutiliza o Python se a porta configurada já oferece a API do assistente. Caso contrário, inicia `Start-Assistant.ps1` oculto, sem instalar serviço. O jogo e os perfis funcionam sem Gemini; conversar com Gemini continua dependendo de internet, chave e cota.

## Outro computador ou atualização

1. Instale **MySQL Community Server 8.0+**, configure uma senha de administrador e deixe o servidor ativo. O repositório não instala o serviço automaticamente.
2. Disponibilize **Node.js LTS 22.13+**. Alternativa sem serviço ou PATH global: execute `powershell -ExecutionPolicy Bypass -File tools/Prepare-Node.ps1`. Isso baixa Node 24 LTS x64 para `.tools/` e confere o SHA256 oficial. A preparação inicial requer internet; a execução local posterior não.
3. Copie `.env.example` para `.env`. Preencha **MYSQL_ADMIN_USER** e **MYSQL_ADMIN_PASSWORD** somente nesse arquivo. Não é necessário criar o banco manualmente. Para Gemini, configure a chave separadamente conforme [GEMINI-LOCAL.md](./GEMINI-LOCAL.md).
4. Execute `powershell -ExecutionPolicy Bypass -File .\Start-Local.ps1 -Setup`. O comando instala as dependências Node do lockfile se necessário, cria `mannequin_run`, aplica migrações e provisiona `mannequin_run_app`, restrito a SELECT/INSERT/UPDATE/DELETE nesse banco. Se MYSQL_PASSWORD estiver vazio, gera uma senha aleatória e a salva apenas em `.env`.
5. Em atualizações do repositório, execute novamente com `-Setup` para aplicar novas migrações. Arquivos de migração já aplicados têm checksum e não devem ser editados; crie uma nova versão SQL.

O instalador não altera a senha de um usuário MySQL já existente. Se `mannequin_run_app` já existir, informe sua senha correta em MYSQL_PASSWORD ou escolha outro MYSQL_USER dedicado. O usuário de aplicação deve ser diferente do administrador. Depois do provisionamento é possível apagar MYSQL_ADMIN_PASSWORD do `.env`; o funcionamento diário usa apenas o usuário restrito. Informe a credencial administrativa novamente para aplicar migrações futuras.

O MySQL padrão fica limitado pelo cliente a loopback. Para conexão remota, é obrigatório fornecer MYSQL_SSL_CA com um certificado CA válido; a verificação de certificado e identidade não é desabilitada. Nesta instalação a CA no diretório de dados do MySQL é protegida pelo Windows, portanto a conexão local usa loopback sem TLS; para exigir criptografia também localmente, disponibilize a CA pública em um caminho legível e configure MYSQL_SSL_CA. Não exponha esta aplicação de exposição à rede pública.

## Esquema

| Tabela | Conteúdo |
|---|---|
| players | UUID, nome/apelido, criação e última atividade; nomes repetidos são permitidos. |
| runs | Partida, jogador, modo, prática/retomada, score, distância, itens, setor, duração, resultado e revisão. |
| progress | Recordes geral/por modo, maior distância, progresso, setores liberados e último checkpoint. |
| checkpoints | Posição e dados para retomada nos 600, 1200, 1800 e 2300 metros da campanha. |
| achievements | Primeira partida concluída, dez componentes e conclusão da História. |
| schema_migrations | Controle técnico de versões do esquema e checksums. |

Chaves estrangeiras usam exclusão em cascata para o perfil. Há índices para busca de nomes/atividade, histórico e ranking. Dados confirmados estão no diretório de dados do próprio MySQL e sobrevivem à reinicialização do navegador, Node, Python e Windows (com o serviço MySQL em funcionamento).

## Fluxo e salvamento

**INICIAR** pede “QUEM VAI JOGAR?”. Digite nome/apelido e crie um perfil ou selecione um perfil anterior. Pessoas com o mesmo nome têm UUIDs diferentes e última atividade visível. Não há email, telefone ou senha de visitante; isto é um quiosque local e a escolha de perfil não constitui autenticação de identidade.

O salvamento ocorre no início, nos checkpoints, após Game Over, ao concluir os 2400 metros da campanha, ao interromper uma partida e em pausas/momentos periódicos de 15 segundos. Não há gravação a cada frame. A fila IndexedDB é gravada antes de sincronizar com MySQL; falhas do backend não interrompem o jogo. O texto de status diferencia “Salvo no MySQL local” de “sincronização pendente”. Dados ainda pendentes dependem desse navegador/origem e serão perdidos se o usuário apagar os dados do site. Ao recarregar, partidas interrompidas permanecem no histórico, mas somente checkpoints confirmados podem ser retomados; não se restaura um frame arbitrário.

**CONTINUAR HISTÓRIA** recupera o último checkpoint válido, incluindo componentes e tempo acumulado. A campanha retomada usa a mesma física e pontuação. Os capítulos de demonstração continuam como prática, sem competir no ranking ou alterar progresso da campanha. **VISITANTE SEM SALVAR** permite jogar sem criar perfil.

O ranking tem Top 10 geral, História e Infinito, com um melhor resultado por jogador. Aceita partidas encerradas por colisão ou conclusão; exclui prática, abandonadas e partidas em andamento. Recordes são por perfil; o recorde antigo global do navegador não é atribuído a visitantes novos.

Use **JOGADORES / RANKING → PRÓXIMO VISITANTE** entre pessoas. Isso encerra a partida pendente, desmarca o aceite externo, apaga o histórico em memória do chatbot e fecha sua sessão/microfone. Selecionar outro perfil também encerra o contexto do chatbot. Não há detecção física automática de troca de pessoa. A seleção de perfil não é mantida automaticamente após recarregar para evitar atribuir a próxima partida ao visitante anterior.

**EXCLUIR PERFIL** pede confirmação, exige MySQL acessível e sincronização concluída, e exclui partidas, checkpoints, progresso e conquistas associados. Backups anteriores ainda contêm os dados de sua data de criação; remova-os separadamente se necessário.

## Rotas do servidor Node

| Método e rota | Função |
|---|---|
| GET /api/local/config | Disponibilidade MySQL e nonce CSRF; cookie HttpOnly/SameSite=Strict. |
| GET /api/players?q= | Busca por nome/apelido ou UUID completo. |
| POST /api/players | Criação idempotente de perfil. |
| GET /api/players/:id | Progresso, histórico e conquistas. |
| DELETE /api/players/:id | Exclusão em cascata. |
| POST /api/runs | Snapshot validado e idempotente da partida/checkpoint. |
| GET /api/ranking?mode=all\|story\|infinite | Top 10 de resultados válidos. |
| POST /api/results/export | Snapshot JSON consistente para download. |
| /api/assistant/* | Proxy local para o Gemini existente, com reescrita de Host/Origin para a porta Python. |

Escritas exigem Origin local e X-Local-CSRF. Requisições têm tamanho máximo; arquivos .env, backend, backups e pacotes não são servidos. A API do quiosque não é um sistema antitrapaça: valores são validados, mas não há simulação autoritativa de gameplay no servidor. As permissões do operador local são confiadas. Limites Gemini permanecem os mesmos e não há troca para faturamento pago.

## Backup, exportação e restauração

Com Node disponível no terminal:

```powershell
npm run db:backup
npm run db:export
# Somente em banco vazio já provisionado:
node tools/database.js restore .data/backups/ARQUIVO.json
```

Sem Node no PATH, use o node.exe portátil de `.tools/node-VERSAO-win-x64/` nesses comandos. Backups JSON e exportações CSV ficam em `.data/backups/`, ignorada pelo Git. Snapshot usa transação consistente. O CSV trata prefixos de fórmulas para não executar conteúdo de apelidos em planilhas. A restauração usa transação e recusa banco que já contenha perfis; não sobrescreve visitantes. Não há agendamento de backup automático; copie os backups para mídia local segura periodicamente.

## DualSense

O controle é lido pela Gamepad API no mesmo loop do jogo, com zona morta, detecção de borda e eventos de conexão/desconexão. Botões e teclado acionam o mesmo `Game.action`, sem alterar velocidade, física ou colisões.

| Comando | Ação |
|---|---|
| Analógico esquerdo horizontal / direcional ← → | Faixas; exige soltar/voltar ao centro entre trocas. |
| X | Saltar no gameplay / confirmar o controle focado no menu. |
| Círculo | Deslizar / voltar ou fechar diálogo. |
| Options | Pausar / continuar. |
| Direcional ↑ ↓ | Navegar pelos controles e opções de seleção dos menus. |

Layouts com `mapping=standard` usam o padrão do navegador. Layouts não padrão ficam sem ações até calibrar em **TESTAR CONTROLE**, com mapeamento armazenado por identificação do dispositivo. O painel mostra nome, mapeamento, índices dos botões e valores dos eixos. Não presume que todo “Wireless Controller” usa os mesmos índices brutos. Não exige Steam/DS4Windows. Entrada de nome ainda requer teclado ou teclado virtual do sistema.

**Teste físico do DualSense não realizado**. Testes automatizados usam objetos de controle simulados. Para validar manualmente no Edge e Chrome: conectar por USB/Bluetooth, pressionar um botão, abrir o painel, verificar X/Círculo/Options/direcional/eixo, jogar com teclado e controle, desconectar durante uma partida e reconectar sem recarregar. Confira também menus e volta pelo Círculo.

Referências: [Gamepad API](https://developer.mozilla.org/en-US/docs/Web/API/Gamepad_API/Using_the_Gamepad_API), [mysql2 pool](https://sidorares.github.io/node-mysql2/docs/examples/connections/create-pool).

## Testes locais

- Node: validação de entradas, identidade de perfis, agregação offline e controles simulados.
- MySQL real: transações, nomes iguais, idempotência, checkpoint, recordes, exclusão em cascata, ranking e persistência após fechar/reabrir pool.
- Edge e Chrome: fluxo completo de perfis, salvamento após colisão, retomada, fila com backend indisponível simulado, reabertura do IndexedDB, sincronização, separação do chatbot, proteção HTTP e proxy de configuração Sadachbia.
- Regressões do assistente utilizam microfone sintético e provedor simulado, sem gerar sessões Gemini reais. Capturas de menu/perfis em `.tmp-qa/`.
- Backup JSON e CSV foram gerados localmente; restauração real em banco vazio e recusa de sobrescrita também passaram. Reinício real do processo Node preservou perfil, partida e recorde, recuperados via HTTP. Perfis descartáveis dos testes foram excluídos ao final.
- Resultado: 8 testes Node/MySQL, 19 verificações de fluxo em cada navegador, 139 verificações de regressão do jogo e 40 do assistente aprovadas. O teste de fila offline simula indisponibilidade do backend; não foi desligada a rede do Windows durante o trabalho.

Não houve commit, push, deploy, contratação ou ativação de faturamento. `.env`, `.data/`, `.tools/`, node_modules e capturas temporárias ficam fora do Git.
