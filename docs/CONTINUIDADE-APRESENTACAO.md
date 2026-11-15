# Continuidade da apresentação

O botão de apresentação completa desliga o microfone e envia `audioStreamEnd` antes do pedido Live. Isso evita que o som das caixas ou a fala ambiente sejam enviados durante o roteiro e interpretados como uma interrupção. O microfone não é reativado automaticamente: o visitante pode usar ATIVAR MICROFONE para voltar à conversa, ou INTERROMPER FALA para parar a apresentação.

Pedidos digitados e o pedido de apresentação usam `clientContent` com `turnComplete: true`, delimitando explicitamente o turno. A captura de voz continua usando `realtimeInput`. Referência: https://ai.google.dev/api/live.

A fila PCM aceita até três minutos de áudio futuro, em vez de cortar a sessão ao acumular um minuto de áudio recebido mais rápido que a reprodução. O limite continua finito. Falhas de reprodução deixam de ser confundidas com JSON inválido do provedor.

Essas correções não removem o limite local de três minutos de conexão, as dez tentativas diárias nem os limites do Google. Uma apresentação iniciada perto do fim da conexão ainda pode ser encerrada pelo temporizador; para uma avaliação completa, inicie uma nova sessão antes de apresentar. Nenhuma reconexão automática ou troca de serviço foi introduzida.

Validação: teste unitário agenda noventa segundos de PCM antecipadamente e verifica o limite superior; testes de navegador verificam o turno de texto e a liberação real da faixa de microfone antes do pedido de apresentação, sem contato com o Gemini. O teste de escuta em caixas/fones com Gemini real permanece necessário para confirmar o comportamento no ambiente da apresentação.
