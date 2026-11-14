# Premiação da EXPOTECH 2026 — revisão local

Implementação de 14/11/2026 sobre a versão existente. Ajuste posterior: os créditos agora começam aos 32 s, junto à taça completamente erguida, sem espera após a vitória. A rolagem começa com o título já entrando na área visível. O foco foi a sequência final; chegada à UniFECAF, corrida, capítulos e assistente continuam disponíveis. Não foram usadas dependências novas, imagens externas, plugins, conectores ou serviços remotos.

## Pódio e numeração

As caixas passaram de 2,8 para 4 metros de largura, com acabamento na base e borda superior. Os lugares laterais foram afastados para x = −4,4 e +4,4, preservando 2–1–3 e o primeiro lugar mais alto. Todas as bases permanecem sobre o palco, cuja altura é 0,36 m.

Cada escada foi deslocada para a metade esquerda da sua plataforma. A numeração frontal ficou maior e mais contrastante, na área livre superior à direita da escada. Isso mantém um caminho de acesso ao topo sem colocar os números atrás dos degraus. A câmera foi recuada para mostrar as três posições completas. Os testes verificam enquadramento e usam raycasting da câmera até cada número para detectar escadas à frente.

A subida do protagonista acompanha a nova posição da escada central. Ele avança de costas para o público, articula pernas e joelhos, alcança o centro do topo e só então gira para a câmera.

Ajuste posterior de fluidez: a aproximação agora começa 0,3 s antes de terminar o deslocamento da chegada, calculada pela velocidade real de entrada. São 0,9 s de aproximação, 1,5 s nos degraus, 0,3 s até o centro e 0,5 s de giro. Não existe intervalo parado entre corrida, aproximação e escada. A animação das pernas acompanha esses mesmos marcos, sem continuar correndo depois de chegar ao topo. Os demais acontecimentos da premiação e o início imediato dos créditos junto à taça foram preservados.

## Concorrentes e animações

**Segundo lugar, à esquerda:** baú monstruoso com tampa articulada, dentes, olhos, monitor e língua rosa estendida. Depois da explosão do terceiro lugar, fecha gradualmente a tampa e espreme a língua. O monitor recolhe para dentro, evitando atravessar a tampa. A reação inclui tremor, som cômico curto e jatos de lágrimas ciano que sobem. A língua continua visível depois do fechamento.

**Terceiro lugar, à direita:** projeto eletrônico inspirado em bobina de Tesla/alto-falante de plasma. Tem placa, componentes, trilhas, enrolamento de cobre, terminal metálico, estrutura e caixa translúcida de acrílico. As descargas animadas aumentam de alcance, acompanhadas por pulsos crescentes de chiado sintetizado. A sobrecarga dura 3,5 segundos e termina em flash, faíscas e som de explosão. Chamas estilizadas permanecem dentro da região do terceiro pódio. Os efeitos são decorativos, sem colisões ou dano aos demais participantes.

**Primeiro lugar, no centro:** protagonista preservado. Depois das duas reações, recebe a taça, ergue o braço e assume a pose de vencedor. A câmera se aproxima suavemente, mantendo os três lugares visíveis, e aparece **VITÓRIA**.

Todos os efeitos usam recursos reutilizados; não são criados novos meshes por quadro. As animações dos concorrentes dependem do tempo da cena, respeitando pausa e reinício. Os sons usam o barramento de efeitos existente e respeitam mute e volumes.

## Cronologia

Tempos contados desde o início da chegada cinematográfica:

| Intervalo | Acontecimento |
| --- | --- |
| 0–17 s | Chegada e interior anteriores preservados |
| Cerca de 15–18,2 s a 28 m/s; 17,4–20,6 s a 12 m/s | Aproximação contínua, escada e giro do protagonista |
| 21–22 s | Apresentação do conjunto no palco |
| 22–25,5 s | Chiado e descargas crescentes do terceiro lugar |
| 25,5 s | Explosão controlada; início do fogo |
| 27–27,8 s | Baú fecha sobre a língua |
| 27,8–29 s | Reação com lágrimas |
| 29–32 s | Entrega e levantamento da taça |
| 32 s | Taça erguida, mensagem VITÓRIA e início dos créditos |
| 33 s | Tela de vitória com botões |
| 32–62 s | Rolagem dos créditos durante 30 segundos |

Os créditos começam **junto à taça completamente erguida**, e os nomes rolam por **30 segundos**, a 42 pixels lógicos por segundo. O título CDC2NA e os três nomes foram preservados. Continuam funcionando: pausar, desligar créditos automáticos e reproduzi-los manualmente. O capítulo Cerimônia começa aos 21 s, antes das novas reações, permitindo avaliar a sequência inteira sem repetir a corrida.

## Arquivos

Criados:

- `src/story/PlasmaProject.js`: aparelho, arcos, explosão e fogo.
- `tests/award-finale.html`: verificação integrada da premiação.
- `tests/award-audio.html`: áudio real do navegador e limpeza de fontes.
- `tests/award-gallery.html`: quatro momentos para inspeção visual.
- `docs/PREMIACAO-ENCERRAMENTO.md`: este relatório.

Alterados:

- `src/story/StoryFinale.js`: caixas, escadas, números, posições, câmera, cronologia, sons e taça.
- `src/story/Competitors.js`: língua, recolhimento do monitor, tampa e lágrimas do baú.
- `src/audio/AudioEngine.js`: chiado, explosão e reação cômica, sintetizados localmente.
- `src/ui/UI.js`, `index.html`, `styles/main.css`: indicação de vitória e rolagem ampliada.
- `assets/assistant/knowledge.json`: descrição da história atualizada para os novos concorrentes; apresentação WAV não mudou.
- `tests/final-adjustments.html`, `tests/physical-chapters.html`, `tests/visual-package.html`, `tests/podium-stairs.html`, `tests/finale-realtime.html`, `tests/package-scene.html`: expectativas de concorrentes e tempos atualizadas; teste do loop real ampliado para a ordem dos efeitos.
- `README.md`, `docs/DESENVOLVIMENTO.md`: registro da entrega.

## Testes locais

Após o ajuste de fluidez, foram repetidas as suítes `podium-stairs.html`, `physical-chapters.html` e `award-finale.html`. O teste da escada verifica avanço sem pausas na transição da chegada para a subida nas velocidades de 12, 20 e 28 m/s. Evidências em `.tmp-qa/subida-direta-*.txt` e `subida-direta-loop.txt`.

Após retirar a espera dos créditos, foram repetidas e aprovadas as 78 verificações de `physical-chapters.html` e `award-finale.html`, incluindo o instante de taça erguida, pausa, opção de desativar créditos e reprodução manual. Evidências: `.tmp-qa/creditos-imediatos-*.txt`. Os totais abaixo registram a validação completa da entrega anterior a esse ajuste pontual.

**327 verificações aprovadas** no Microsoft Edge local:

| Suíte | Aprovadas |
| --- | ---: |
| Movimento | 15 |
| Mecânicas | 25 |
| Setores | 19 |
| Acabamento | 23 |
| Inicialização | 12 |
| Upgrade gráfico e animações | 26 |
| Pacote visual e narrativa | 41 |
| Ajustes finais e chegada | 26 |
| Personagem, capítulos e créditos | 45 |
| Escadas e subida | 11 |
| Nova premiação | 33 |
| Novos efeitos sonoros, com AudioContext real | 12 |
| Final completo no loop nativo | 4 |
| Regressão do assistente, com microfone sintético | 35 |

A nova suíte cobre os três números sem oclusão, caixas apoiadas, ordem dos concorrentes, língua e monitor, acrílico e componentes, evolução do chiado/arcos, flash/faíscas, fogo isolado, fechamento gradual, lágrimas ascendentes, entrega posterior da taça, pose, vitória, duração dos créditos, restauração ao reiniciar e preservação do Infinito.

O teste de áudio desliga o ambiente para medir somente os efeitos: os três sons produziram sinal no analisador, as fontes foram liberadas ao terminar e mute impediu novas emissões. Não houve avaliação auditiva humana; o teste comprova geração e roteamento do sinal.

O loop real percorreu chegada, portas, auditório, sobrecarga, explosão, lágrimas, taça, vitória e créditos nessa ordem. A execução completa levou cerca de 57 segundos, incluindo dez segundos de progresso dos créditos. As capturas das quatro etapas foram inspecionadas visualmente; números, monitor, língua, lágrimas, aparelho e pose ficaram visíveis.

Durante a validação foram corrigidos o apoio do baú na plataforma, limites verticais das faíscas e um arredondamento numérico no instante exato de início dos créditos. As suítes afetadas foram repetidas e aprovadas.

Evidências locais em `.tmp-qa/award-*.txt`, `premiacao-audio.txt`, `premiacao-assistente.txt`, `premiacao-loop-nativo.txt` e `premiacao-sequencia.png`.

## Avaliar localmente

Com o servidor local ativo, atualize a página e selecione **CAPÍTULOS → Cerimônia da EXPOTECH 2026 → INICIAR TRECHO**. Aguarde a sequência até os créditos. A galeria está em `http://localhost:8081/tests/award-gallery.html` quando utilizado o backend local dessa porta.

Para iniciar pelo servidor original:

```powershell
powershell -ExecutionPolicy Bypass -File .\Start-Game.ps1
```

Abra `http://localhost:8080`. Alternativamente, `Start-Assistant.ps1` serve a mesma versão na porta 8081. A conexão real do assistente continua desativada.

## Limites

Eletricidade, explosão, acrílico, chamas e lágrimas são representações procedurais estilizadas. Não há simulação física de fragmentação, fogo, fluido ou circuito eletrônico. A cena não cria dano nos participantes. A aprovação do timbre, volume no equipamento do evento e ritmo cômico pede avaliação humana local; não houve homologação prolongada em outras GPUs.

Tudo permaneceu no projeto local. Nenhum upload, commit, push, publicação, deploy ou acesso a outros repositórios foi realizado.
