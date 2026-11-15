# Coleta no deslize, cursor do controle e identificação

Atualização local de 15/11/2026.

- **Coleta:** componentes comuns na altura padrão de 1,25 m continuam alcançáveis durante um deslize/rolamento no chão. A redução da altura física do personagem não reduz mais o alcance desses componentes. As exigências dos componentes de salto e das trilhas baixas foram preservadas, assim como distância lateral, varredura longitudinal e colisões com obstáculos.
- **Cursor:** nos menus e diálogos, o analógico esquerdo move um círculo azul e X ativa o controle sob o cursor. O direcional continua navegando entre controles, Círculo volta e Options pausa/continua. O cursor aparece somente com controle conectado e mapeado, some na corrida e na desconexão, e permanece acima dos diálogos. No gameplay o analógico continua acionando as mesmas trocas de faixa.
- **Identificação:** INICIAR abre diretamente “QUEM VAI JOGAR?” e foca o campo do nome, inclusive quando existe um perfil anterior selecionado. Não é necessário abrir JOGADORES primeiro. Pode-se criar um jogador, selecionar um perfil anterior ou usar visitante sem salvar; o reinício após colisão mantém o perfil da partida.

Arquivos principais: `src/obstacles/Collision.js`, `src/game/GamepadCursor.js`, `src/game/GamepadInput.js`, `src/game/Game.js`, `src/players/Players.js` e `styles/players.css`.

Validação automatizada: coleta em diferentes alturas da animação, exigências de salto/deslize, mapeamento e bordas dos botões, movimento do cursor, clique de X em INICIAR, foco no nome dentro de diálogo, identificação com perfil anterior, ocultação durante gameplay/desconexão e regressão completa de perfis/MySQL. A validação do DualSense físico permanece manual.

Sem alterações na integração Gemini, na base do chatbot ou nas credenciais. Sem commit, push ou publicação.
