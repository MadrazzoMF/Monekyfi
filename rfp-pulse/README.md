# RFP-Pulse

Triagem inteligente de editais e propostas comerciais. Vite + React + Tailwind.

## Rodar

```bash
cd rfp-pulse
npm install
npm run dev      # http://localhost:5173
npm test         # Vitest
```

## Estrutura

- `src/domain/` — enums congelados, factories das entidades, máquina de estados (`TRANSICOES`), seed.
- `src/lib/` — funções puras: datas, score, recomendação, filtros, análise heurística de texto, formatação.
- `src/state/` — `useReducer` + Context, estado normalizado (`{ porId, ids }`), seletores, persistência versionada em localStorage.
- `src/components/` — painéis do detalhe, tabela, filtros e primitivos de UI em `ui/`.
- `src/pages/` — `/` dashboard, `/novo` importação com análise, `/edital/:id` visão dividida.

## Build limpo (sem exemplos)

```bash
VITE_SEM_SEED=true VITE_STORAGE_SUFFIX=:limpo npm run build
```

Começa sem editais, com um usuário admin local. O dashboard vazio oferece o botão "Carregar 10 exemplos".

## Fases entregues

1. **Fundação** — entidades, máquina de estados, reducer, persistência, seed, testes das funções puras.
2. **Dashboard** — resumo, filtros persistidos, tabela ordenável.
3. **Motor de análise e visão dividida** — `analisarTexto()` extrai metadados e sugere critérios, riscos e checklist com trecho de origem; detalhe com texto marcado à esquerda e painéis editáveis à direita.
4. **Design system** — tokens no Tailwind (`brand`, `ink`, `surface`, `go/nogo/cond`), classes de componente em `index.css`, dark mode por `prefers-color-scheme`.

## Regras de negócio

- `src/domain/` — enums congelados, factories das entidades, máquina de estados (`TRANSICOES`), seed.
- `src/lib/` — funções puras: `calcularDiasRestantes`, `calcularScoreAderencia`, `definirRecomendacao`, `derivarEdital`.
- `src/state/` — `useReducer` + Context, estado normalizado (`{ porId, ids }`), seletores, persistência versionada em localStorage.
- `src/pages/` — rotas `/`, `/novo`, `/edital/:id` (placeholders).

- Score, recomendação e dias restantes **nunca são gravados**: aparecem só na saída dos seletores.
- Critério `obrigatorio` com situação `nao_atende` força `no_go`, ignorando o score.
- Risco `critico` não aceito limita a recomendação a `condicional`.
- Score: `atende` = peso, `parcial` = metade, `nao_atende` = 0, `nao_avaliado` fora do cálculo. GO ≥ 70, condicional ≥ 40.
- Transições de status só pela tabela `TRANSICOES`; cada transição gera um `RegistroAprovacao` append-only.

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
