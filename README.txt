Dia a Dia da Elo — leia-me
==========================
Versão 4.3.23 • aplicativo infantil instalável (PWA), feito em HTML/CSS/JavaScript.

Uso e privacidade
- Perfis e progresso permanecem neste aparelho.
- Vídeos do YouTube só abrem dentro do player incorporado do Cinema e exigem internet; assistir é opcional e não concede estrelas.
- O app não pune pausas: o bichinho não desaparece e suas necessidades não se acumulam quando a criança não está usando o app.
- O resumo semanal e o contador aproximado de uso ativo ficam locais.
- O botão offline prepara os recursos disponíveis no pacote; vídeos continuam online.

Arquivos principais
- index.html, app.js, v3.js: interface e lógica central.
- home.js, home.css: Mundo da Elo e Casa da Elo.
- touch-assist.js: amplia áreas táteis pequenas sem alterar o desenho dos botões.
- completion.js, completion.css: resumo parental, atividade opcional, modo vertical e preparação offline.
- models3d.js: Estúdio 3D; importação OBJ/JSON protegida pelo PIN.
- pet.js, pet-core.js, pet-notify.js: bichinho e lembretes opcionais.
- sw.js, offline-manifest.js, version.js: instalação, cache e preparação offline.
- rpg.html: aventura do Reino das Estrelas.
- legal-config.js: contato oficial tonlm10@gmail.com.

Testes
Node.js 18 ou mais recente, sem dependências:
`node --test tests/*.test.cjs`
Leia também `tests/README.md`. Testes simulados não substituem o teste em aparelhos reais.

Publicação
O repositório configurado usa o workflow `.github/workflows/importar-app.yml`; publicar requer enviar `app-upload.zip` e confirmar o commit com uma conta autenticada. Esta conversa não tem uma sessão GitHub ativa.

Pendências conhecidas antes de uma publicação ampla
- Testar YouTube, modo vertical/paisagem, notificações, instalação e offline em Android e iPhone.
- A refatoração completa do app.js, a remoção dos handlers inline e a limpeza de CSS legado continuam precisando de revisão dedicada.
