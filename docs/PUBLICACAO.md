# Publicação do MANNEQUIN RUN

Repositório: https://github.com/0Matheus-Silva/Mannequin-Run

Endereço do jogo: https://0matheus-silva.github.io/Mannequin-Run/

A publicação foi autorizada expressamente pelo usuário após as etapas locais anteriores. As proibições de commit/push/deploy registradas nos relatórios históricos referem-se àquelas etapas, não a esta autorização.

## Ajustes finais desta versão

Atualização posterior: a fala foi reduzida para **“Ai, minha língua!”**, sem interjeições repetidas, com cerca de 1,2 s. A espera programada depois do pouso foi eliminada: as apresentações começam imediatamente no mesmo enquadramento, a câmera inicia seu movimento em cerca de 0,3 s e a sequência avança 40% mais rápido. A ordem dos concorrentes foi preservada. Créditos continuam em tempo real por nove segundos. Os marcos abaixo descrevem a revisão anterior; os tempos internos da animação agora avançam mais rápido que o relógio real, com salto direto para a apresentação após pousar. Atalhos e capturas usam `seek()` para preservar cenas específicas.

- Grito do baú refeito como “Aaaaah! Ai! Ai! Minha língua!”, com repetição, ênfase e variação de tom. O WAV tem 3,2 segundos; a versão anterior tinha 1,7 segundo e interpretação muito acelerada. Continua sendo síntese local do Windows, sem ator humano ou serviço externo de voz.
- A câmera permanece no baú e as lágrimas duram mais. A música fica reduzida durante toda a fala. A aproximação do protagonista ocorre aos 31–32 s; levantamento da taça aos 32–34 s, WIN! aos 34 s e créditos aos 34,8 s. Vitória aos 35 s; créditos continuam rolando por nove segundos.
- Vidro lateral fixo fecha o trecho entre x = 3,9 e 8,15 na entrada da UniFECAF. Complementos superior e esquerdo cobrem o restante do portal; ficam atrás das folhas móveis, sem superfícies coplanares. A abertura central continua liberando as três faixas.
- Pirueta, pisos corrigidos, modos, controles, capítulos e preferências existentes preservados.

## Automação do site

O arquivo `.github/workflows/pages.yml` publica a branch `main` usando GitHub Actions. Ele prepara somente `index.html`, `assets/`, `src/` e `styles/` para o site; não publica o servidor Python, `.env`, ferramentas, testes ou pacotes de referência no artefato do Pages. O código-fonte e a documentação ficam disponíveis no repositório.

Em **Settings → Pages**, a fonte deve ser **GitHub Actions**. Depois disso, cada push em `main` atualiza o site automaticamente. O workflow também aceita execução manual em **Actions → Publicar MANNEQUIN RUN → Run workflow**. A configuração por branch/pasta `docs` não é usada.

## Assistente e segurança

O jogo e a demonstração do assistente funcionam como site estático. GitHub Pages não executa o backend Python: a conexão real Gemini continua indisponível nesse site, exigindo um backend separado e revisão operacional de público adulto/cotas antes de qualquer ativação. Não colocar chave no JavaScript ou nos arquivos do site.

`.env`, arquivos temporários, caches e pacotes originais de referência são ignorados. O único arquivo de exemplo de ambiente contém valores vazios/desativados. Nenhuma credencial deve fazer parte do commit.

## Testes

Foram executadas verificações locais da entrada completa, portas abertas/fechadas, separação entre vidro fixo e móvel, reação prolongada do baú, reprodução real dos WAVs no navegador, encerramento completo, câmera, capítulos, pisos e regressões do gameplay. Evidências em `.tmp-qa/publicacao-*.txt` e `porta-direita-corrigida.png`.

Para regenerar o grito: execute `tools/New-Chest-Voice.ps1` e depois `tools/New-Award-Audio.py`. Ambos usam recursos locais; o segundo remove silêncio e limita a fala a 3,2 segundos. Depois teste no capítulo Cerimônia antes de publicar.
