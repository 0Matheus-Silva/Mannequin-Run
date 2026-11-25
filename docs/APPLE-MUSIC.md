# Apple Music no Nexus

O Nexus usa uma aba própria para MusicKit JS. A música toca nessa aba; o jogo envia comandos e não transmite o áudio ao Gemini. O usuário precisa manter o reprodutor aberto e autorizar sua própria conta pela Apple. Os controles do jogo funcionam independentemente do chatbot; pedidos de voz e texto ao Gemini Live usam a ferramenta `controlar_apple_music`.

## Preparação da Apple

1. Consulte o [Apple Developer Program](https://developer.apple.com/programs/enroll/). Para MusicKit na web, a Apple exige credenciais de desenvolvedor; a associação ao programa normalmente é paga. Uma instituição elegível pode solicitar isenção. A conta Apple Music do ouvinte e a conta da equipe desenvolvedora têm papéis diferentes e podem ou não ser a mesma conta.
2. No portal Apple Developer, crie um [Media ID e uma chave privada de Media Services](https://developer.apple.com/help/account/capabilities/create-a-media-identifier-and-private-key/) com MusicKit ativado. Anote o Team ID e o Key ID. A chave é um segredo; não a envie pelo chat, não a publique e não a coloque em `src`, `assets` ou no Git.
3. Neste computador, salve a chave privada como `.data/apple-music/AuthKey.p8` e preencha `APPLE_MUSIC_TEAM_ID` e `APPLE_MUSIC_KEY_ID` no arquivo `.env` local. A pasta `.data` e o arquivo `.env` são ignorados pelo Git. Reinicie o servidor com `Start-Local.ps1`.
4. Abra o jogo pelo servidor Node local, clique em **APPLE MUSIC** e, na aba aberta, clique em **Conectar Apple Music**. Faça o login e dê a autorização diretamente à Apple; mantenha a aba aberta. Use **Desconectar** para revogar a sessão no reprodutor.

O servidor gera tokens de desenvolvedor ES256 de curta duração; a chave privada não é enviada ao navegador. O login, a assinatura, a disponibilidade das faixas, os domínios autorizados, as políticas de reprodução automática e o comportamento em segundo plano precisam ser verificados com credenciais reais e no navegador do usuário. O servidor estático `Start-Game.ps1` não possui a API necessária: use `Start-Local.ps1`.

Se a reprodução automática for bloqueada, inicie a música pelos controles da aba do reprodutor. Use fones para reduzir o risco de o microfone captar e enviar música ao Gemini Live. Nenhum teste simulado substitui a autorização e reprodução reais pela Apple.
