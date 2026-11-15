# Atualização do conteúdo do chatbot — 15/11/2026

O roteiro mestre fornecido foi incorporado integralmente em `assets/assistant/knowledge.json`, no campo `masterScript`, com respostas adicionais organizadas por assunto e uma apresentação narrável cobrindo as cinco etapas. Informações contraditórias anteriores foram substituídas: hardware agora confirmado, atribuições da equipe, nomes Matheus/Pedro/Victor e descrição da infraestrutura Windows Server 2022/IIS/ngrok. Os nomes e créditos existentes no jogo não foram alterados.

## Estrutura preservada

- `knowledge.json`: roteiro integral, fatos por etapa, explicações por componente, limites do escopo e apresentação completa.
- `personality.json`: instrução principal e saudações. Mantém português brasileiro, estilo natural, personagem fictício e transparência sobre IA; apresenta a equipe e as cinco etapas na ordem solicitada.
- `server/assistant_server.py`: já combina personalidade e toda a base na instrução Live; não foi necessário modificar a integração, tokens, voz Sadachbia, cotas ou configurações.
- `DemoProvider.js`: a demonstração local agora reconhece perguntas sobre caracterização, equipe, hardware, VM, recursos virtuais, Windows Server, IIS, ngrok, jogo e chatbot. Perguntas específicas não repetem a apresentação inteira. Apresentar apenas o jogo é diferente de apresentar o projeto completo.
- `Session.js`: o pedido enviado pelo botão de apresentação exige as cinco etapas, sem a instrução antiga de limitar tudo a um minuto.
- `presentation.wav`: narração offline regenerada a partir do novo texto, usando a voz local Microsoft Maria Desktop. Duração aproximada: 3 minutos e 47 segundos; esta voz de contingência não é Sadachbia. A demonstração não tem o limite de sessão Live.

As especificações do computador físico são diferenciadas das da VM: 32 GB de RAM no computador contra 4 GB alocados à VM de referência, além de dois processadores virtuais e disco virtual de 40 GB. Os serviços da VM são descritos conforme o roteiro; isso não afirma que a VM ou o túnel estejam ativos neste momento.

O roteiro exige confirmação antes de anunciar PS5, banco e ranking online. A implementação local já confirma suporte por Gamepad API e salvamento MySQL com ranking local, portanto esses fatos foram mantidos com as devidas limitações: teste físico do DualSense ainda não confirmado, sem ranking público online. QR Code, acesso por celular e versão mobile permanecem fora desta etapa. Nenhum desses recursos foi implementado aqui.

## Validação

- Quatro testes Node de conteúdo: ordem da apresentação, nomes e especificações, respostas específicas, distinção de escopo, roteiro integral e compatibilidade com o formato da base.
- Quinze testes Python do backend: verificam também que todo o JSON da base, inclusive campos com múltiplas linhas, chega intacto à instrução Gemini.
- Quarenta verificações do assistente no navegador: apresentação, texto seguro, hardware atualizado, áudio local, microfone sintético, interrupção, histórico, encerramento, erros e preservação dos modos do jogo.
- Narração WAV conferida quanto a formato e duração. Não foi gerada uma conversa externa com Gemini durante a validação; a naturalidade da apresentação Live precisa de avaliação manual. O limite Live existente de três minutos permanece inalterado.

## Como experimentar

Na página local existente, encerre uma conversa anterior e pressione **Ctrl+F5**. Abra CONVERSAR e use CONHEÇA O Nexus para a apresentação completa. Na demonstração, o roteiro também pode ser pedido por texto; no Gemini, inicie uma nova sessão para receber as novas instruções.

Perguntas sugeridas: “Apresente o projeto completo”, “Apresente apenas o jogo”, “Quem fez a caracterização?”, “Qual processador e quanta RAM?”, “Quanta memória foi alocada à VM?”, “Para que serve o IIS?”, “Como funciona o ngrok?” e “Quem desenvolveu o chatbot?”.

Nenhuma alteração no jogo, interface, MySQL, VM, hospedagem ou credenciais. Sem commit, push, deploy ou publicação.
