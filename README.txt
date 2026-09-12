DIA A DIA DA ELO — VERSÃO OFICIAL 1.0

Esta é a primeira versão tratada como versão oficial do aplicativo.

PRINCIPAIS RECURSOS
- Home simplificada e organizada.
- Vídeos e 13 playlists oficiais.
- Jogos em tela cheia: Ache a Estrela, Labirinto, Memória, Quebra-cabeça e Toque no Número.
- Jogo da memória com 16 artes ilustradas padronizadas da Elo; 8, 16 ou 32 cartas.
- Quebra-cabeça com 16 imagens padronizadas, níveis 3x3, 4x4 e 5x5 e bloqueio automático ao concluir.
- Escolinha com níveis Fácil, Médio e Desafio.
- Área de colorir com 10 desenhos, 30 cores, preenchimento por toque, desfazer, salvar e zoom de 100% a 400%.
- Aventuras da Elo com 4 histórias.
- Sistema de pontos, missões e conquistas em tela própria.
- Área dos responsáveis protegida por PIN de 4 dígitos.
- Links externos protegidos pelo PIN.
- Política de Privacidade e Termos de Uso públicos e dentro do app.
- Service Worker com atualização resiliente: um arquivo opcional ausente não bloqueia todo o app.
- Assets antigos e duplicados removidos.
- Novos ícones oficiais, incluindo versões maskable para Android/PWA.

ATUALIZAÇÃO NO GITHUB PAGES
1. Extraia o ZIP.
2. Substitua TODO o conteúdo do repositório pelo conteúdo desta pasta, mantendo index.html na raiz.
3. Faça commit.
4. Aguarde GitHub Pages terminar o deploy.
5. Confirme em Área dos Pais > Sobre o app: "Dia a Dia da Elo • versão 1.0."

IMPORTANTE SOBRE O ÍCONE NO ANDROID
O pacote inclui novos ícones oficiais em assets/icons e o manifest aponta somente para eles.
Se o ícone antigo continuar na tela inicial após o site atualizar, o Android pode estar mantendo o ícone da instalação anterior em cache. Nesse caso, depois de confirmar a versão 1.0 no navegador, remova apenas a instalação/atalho antigo e instale novamente a partir da página atualizada. Os dados locais podem depender do método de instalação, portanto teste antes de limpar dados do navegador.

ESTRUTURA PRINCIPAL
- index.html
- app.js
- sw.js
- manifest.webmanifest
- privacy.html
- terms.html
- assets/
  - icons/
  - memory-cards/
  - puzzle/
  - coloring/
  - stories/
