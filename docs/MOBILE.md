# Nexus Run no celular

Abra o site no navegador do celular. O jogo adapta a câmera e os menus à orientação vertical ou horizontal. A partida mantém os modos, a identificação de jogadores e o salvamento local existentes.

- Deslize para a esquerda/direita: troca uma faixa por gesto.
- Deslize para cima: pula.
- Deslize para baixo: desliza sob obstáculos.
- Toque na pausa para interromper a partida.

Não há botões virtuais de movimento. Toques curtos, mouse, gestos cancelados, formulários, menus e o chatbot não comandam o personagem. O navegador pode reservar gestos que começam na borda para voltar à página anterior; comece os gestos na área central do jogo.

Teclado e controle continuam disponíveis no computador. Em telas pequenas, menus e formulários permitem rolagem; a área da corrida bloqueia a rolagem para reconhecer gestos. O jogo não exige instalar aplicativo.

O GitHub Pages pode servir o jogo e a demonstração local ao celular. Gemini Live e MySQL continuam dependendo dos servidores existentes, ausentes no Pages. `127.0.0.1` no celular se refere ao próprio celular: não é o endereço do computador. Esta implementação não expõe os servidores locais na rede nem altera a proteção de origem. Não coloque a chave Gemini no frontend.

Validação automatizada: quatro direções, repetição, cancelamento, multitoque, pausa, formulário de jogador, câmera, diálogos e chatbot em viewport de celular; regressões de teclado/controle e assistente no desktop. A sensibilidade e o desempenho precisam ser confirmados em Android/iPhone reais. Para aparelhos lentos, selecione qualidade Eco nas configurações.
