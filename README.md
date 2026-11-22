# Dia a Dia da Elo — versão 4.3.27

Aplicativo infantil instalável (PWA), em HTML/CSS/JavaScript. O uso é em paisagem; em retrato, o app pede que o aparelho seja virado. Perfis e progresso ficam armazenados no aparelho. O Cinema incorpora vídeos do YouTube e exige conexão; atividades locais disponíveis no cache podem funcionar sem internet.

## Recursos
- Mundo da Elo, jogos, Escolinha, Inglês, histórias, Ateliê e Festa da Família.
- Bichinho virtual sem perda por ausência e com lembretes opcionais.
- Área dos responsáveis protegida por PIN, acessibilidade e perfis locais.
- Resumo semanal armazenado localmente e estimativa de uso ativo.
- Preparação de recursos estáticos para uso offline; vídeos continuam online.
- Missão opcional de descoberta, sem recompensa por assistir a vídeos e sem sequência diária.

## Testes

Requer Node.js 18 ou mais recente, sem dependências adicionais:

```sh
node --test tests/*.test.cjs
```

Os testes cobrem a estrutura, recursos PWA/offline, referências a assets, sintaxe, privacidade, controles táteis, importação de modelos e as salvaguardas recentes. Automação em navegador simulado não substitui testes em dispositivos reais.

## Publicação

O workflow existente publica após o pacote de entrada ser enviado e o commit confirmado no repositório. A publicação requer acesso autenticado do responsável.

## Limitações conhecidas

- Testar o layout em celulares Android e iPhone, player incorporado do YouTube, notificações e cache offline antes de lançar.
- A refatoração completa do `app.js`, a remoção de handlers inline e a limpeza ampla de CSS legado ainda precisam de revisão dedicada.
