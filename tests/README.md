# Testes automatizados — Dia a Dia da Elo

Requisitos: Node.js 18 ou mais recente; não é preciso instalar dependências.

## Executar

Na pasta raiz do app:

```sh
node --test tests/*.test.cjs
```

As suítes cobrem estrutura e referências locais, versão e cache PWA, recursos offline, sintaxe JavaScript, URLs em CSS, privacidade, importação OBJ/JSON, controles de toque, vídeo incorporado sem recompensa por visualização, fontes locais, relatório semanal, modo vertical, bem-estar do bichinho e os novos recursos dos jogos. A verificação de jogos confere ilustrações locais, dicas, estilos responsivos e inclusão no modo offline. Os testes de importação confirmam que o arquivo não é lido antes da autorização dos responsáveis; nada disso substitui testes em aparelhos reais. As rodadas de jogo também foram simuladas em navegador Chromium móvel; repetir manualmente a validação em Android e iPhone antes da publicação.

Para verificar apenas a importação 3D ou a ampliação de toque:

```sh
node --test tests/models3d.test.cjs tests/touch-assist.test.cjs
```


A suíte `orientation-recovery.test.cjs` confere a orientação paisagem, o bloqueio do modo retrato e a recuperação do cache.
