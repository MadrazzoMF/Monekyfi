# RFP-Pulse

Triagem inteligente de editais e propostas comerciais. Vite + React + Tailwind.

## Rodar

```bash
cd rfp-pulse
npm install
npm run dev      # http://localhost:5173
npm test         # Vitest
```

## Fase 1 — fundação de dados e estado

- `src/domain/` — enums congelados, factories das entidades, máquina de estados (`TRANSICOES`), seed.
- `src/lib/` — funções puras: `calcularDiasRestantes`, `calcularScoreAderencia`, `definirRecomendacao`, `derivarEdital`.
- `src/state/` — `useReducer` + Context, estado normalizado (`{ porId, ids }`), seletores, persistência versionada em localStorage.
- `src/pages/` — rotas `/`, `/novo`, `/edital/:id` (placeholders).

Score, recomendação e dias restantes **nunca são gravados**: aparecem só na saída dos seletores.

## Uso pelo console (modo dev)

```js
rfp.editais()                                   // lista derivada (score, recomendacao, diasRestantes)
rfp.edital('ed_02')                             // edital completo com critérios, checklist, riscos, histórico
rfp.dispatch(rfp.acoes.transicionarStatus('ed_04', 'em_analise'))
rfp.dispatch(rfp.acoes.transicionarStatus('ed_04', 'aprovado'))   // rejeitada: fora da tabela
rfp.dispatch(rfp.acoes.atualizarCriterio('cr_02', { situacao: 'nao_atende' }))
rfp.edital('ed_01').scoreAderencia              // recalculado
rfp.resetarSeed()
```

O console opera sobre o estado persistido no localStorage. Recarregue a página para a UI refletir.
