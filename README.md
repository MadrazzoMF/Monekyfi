# 🐵 Monekyfi — sua selva organizada

Site organizador de vida com tema de floresta, macacos e bananas — visual vetorial feito à mão, minimalista. Serve pro canal **e** pra vida pessoal.

## O que tem dentro

| Página | O que faz |
|---|---|
| **Início** | Resumo do dia: saudação, frase "banana do dia", tarefas pendentes, hábitos de hoje, patrimônio e metas em andamento |
| **Prompts** | Biblioteca de prompts de IA com categorias, busca e botão de copiar |
| **Automações** | Catálogo de automações (n8n, Make, Zapier, scripts...) com status ativa/pausada/ideia |
| **Finanças** | Balanço patrimonial (ativos circulantes, investimentos, passivos, patrimônio líquido) + fluxo de entradas/saídas por mês |
| **Tarefas** | Lista de tarefas com prioridade e separação Canal / Pessoal |
| **Hábitos** | Grade semanal de hábitos com sequência (streak) 🍌 |
| **Metas** | Metas com barra de progresso, prazo e unidade (inscritos, R$, kg...) |
| **Notas** | Caderninho de ideias com busca |
| **Canal** | Pipeline de vídeos estilo kanban: ideia → roteiro → gravando → editando → publicado |
| **Backup** | Exportar/importar todos os dados em JSON |

## Como funciona

- **100% estático** — HTML, CSS e JavaScript puros. Zero build, zero dependência, zero servidor.
- Os dados ficam no **localStorage do navegador**. Use a página **Backup** pra exportar um `.json` de segurança (e pra levar seus dados de um dispositivo pro outro).

## Deploy na Vercel

1. Suba este repositório pro GitHub (já está 😉).
2. Na [Vercel](https://vercel.com), clique em **Add New → Project** e importe o repositório.
3. Framework preset: **Other**. Não precisa de build command nem output directory — é só dar **Deploy**.

Pronto: cada push na branch principal publica o site automaticamente.

## Rodar localmente

Abra o `index.html` no navegador, ou rode um servidorzinho:

```bash
python3 -m http.server 8000
# http://localhost:8000
```

---

Feito à mão na floresta 🌿🍌
