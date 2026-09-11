DIA A DIA DA ELO — PRIMEIRA VERSÃO PWA

O que já funciona:
- Instalação como app no Android/iPhone via navegador
- Tela inicial com quatro áreas
- Sistema de estrelinhas salvo no aparelho
- Surpresa/missão do dia
- Jogo “Ache a estrela”
- Jogo da memória
- Quiz educativo
- Desenho/pintura com o dedo
- Área de vídeos pronta para receber IDs do YouTube
- Link do canal protegido por uma continha para responsáveis
- Funciona offline em boa parte do conteúdo graças ao service worker
- Sem cadastro, sem anúncios e sem coleta de dados

COMO ADICIONAR VÍDEOS:
Abra app.js e procure por const VIDEOS. Para cada vídeo, coloque:
{ title: 'Título do vídeo', id: 'ID_DO_YOUTUBE' }

Exemplo: se a URL for https://youtu.be/ABC123xyz o id é ABC123xyz.

COMO TESTAR:
1. Hospede os arquivos em qualquer serviço gratuito de site estático (GitHub Pages, Cloudflare Pages, Netlify etc.).
2. Abra o endereço pelo Chrome no Android ou Safari no iPhone.
3. Use “Adicionar à tela inicial”.

IMPORTANTE:
Para publicação futura na Google Play/App Store, o projeto pode ser empacotado como app nativo. Apps infantis precisam seguir as políticas específicas das lojas.
