Dia a Dia da Elo - leia-me
==========================
App infantil instalável (PWA) em HTML/CSS/JS puro. Funciona offline, sem conta e sem servidor.

Estrutura
- index.html ........ tela única do app (painéis: início, Casa, jogos, Escolinha, Ateliê, Cinema, histórias, Pais...)
- app.js, v3.js ..... lógica geral, mapa, jogos e Área dos Pais
- pet.js, pet-core.js, pet-notify.js .... bichinho virtual e lembretes
- home.js, home.css . Mundo da Elo (início em tela fixa) e Casa da Elo
- safety.js ......... tratamento de erros, pergunta para adultos e convite para criar o PIN
- sw.js, version.js . service worker (offline, lembretes) e número da versão
- rpg.html .......... RPG das Estrelas
- privacy.html, terms.html ... textos legais (o mesmo texto está em index.html; mude os dois)
- legal-config.js ... e-mail de contato para a política (preencha)
- push-config.js .... servidor opcional de lembretes (veja a pasta push-server do pacote separado)
- fonts.css e assets/fonts/LEIA-ME.txt ... como incluir as fontes originais, sem Google Fonts

Publicação (GitHub Pages)
1. Suba o app-upload.zip na raiz do repositório (o workflow descompacta e publica).
2. A cada versão nova, mude o número em version.js, sw.js, index.html (TARGET_VER) e CHANGELOG.txt.

Privacidade: sem anúncios, sem analytics, sem chamadas ao Google Fonts. Dados só no aparelho.
Histórico de versões: CHANGELOG.txt
