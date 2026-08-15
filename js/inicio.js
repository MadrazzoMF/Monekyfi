/* Página inicial — resumo geral da selva */

MK.renderShell("inicio");

document.getElementById("hero-art").innerHTML = MK.art.monkey(96);
document.getElementById("leaf-1").innerHTML = MK.art.leaf(24);

/* saudação + data */
(function saudacao() {
  const h = new Date().getHours();
  const txt = h < 5 ? "Boa madrugada" : h < 12 ? "Bom dia" : h < 18 ? "Boa tarde" : "Boa noite";
  document.getElementById("saudacao").textContent = `${txt}, macaco!`;
  document.getElementById("data-hoje").textContent =
    new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
})();

/* banana do dia — frase rotativa por data */
(function bananaDoDia() {
  const frases = [
    "Macaco esperto guarda banana antes de comer banana.",
    "Um galho de cada vez — é assim que se atravessa a floresta.",
    "Quem anota, não se perde na selva.",
    "Constância vale mais que pressa: a árvore cresce todo dia um pouco.",
    "Banana guardada hoje é energia amanhã.",
    "Organizar é abrir caminho na mata fechada.",
    "Pequenos hábitos, grandes selvas.",
    "Macaco que revisa o plano não cai do galho.",
    "Foco no cacho, não em uma banana só.",
    "A selva recompensa quem aparece todos os dias."
  ];
  const dia = Math.floor(Date.now() / 86400000);
  document.getElementById("banana-do-dia").textContent = "🍌 " + frases[dia % frases.length];
})();

/* estatísticas rápidas */
(function stats() {
  const tarefas = MK.load("tarefas", []);
  const pendentes = tarefas.filter(t => !t.feita).length;

  const habitos = MK.load("habitos", []);
  const checks = MK.load("habitos_checks", {});
  const hoje = MK.todayISO();
  const feitosHoje = habitos.filter(h => checks[h.id] && checks[h.id][hoje]).length;

  const ativos = MK.load("ativos", []).reduce((s, a) => s + (Number(a.valor) || 0), 0);
  const passivos = MK.load("passivos", []).reduce((s, p) => s + (Number(p.valor) || 0), 0);
  const patrimonio = ativos - passivos;

  const prompts = MK.load("prompts", []).length;

  const stats = [
    { num: pendentes, lbl: "tarefas pendentes", cls: pendentes > 0 ? "banana" : "" },
    { num: `${feitosHoje}/${habitos.length}`, lbl: "hábitos hoje", cls: "" },
    { num: MK.brl(patrimonio), lbl: "patrimônio líquido", cls: patrimonio < 0 ? "coral" : "" },
    { num: prompts, lbl: "prompts guardados", cls: "" }
  ];

  document.getElementById("stats").innerHTML = stats.map(s => `
    <div class="card stat">
      <div class="num ${s.cls}">${MK.esc(s.num)}</div>
      <div class="lbl">${s.lbl}</div>
    </div>`).join("");
})();

/* atalhos */
(function quickLinks() {
  const links = [
    { href: "prompts.html",    art: MK.art.sparkle(34), t: "Prompts",    d: "sua biblioteca de IA" },
    { href: "automacoes.html", art: MK.art.vine(70),    t: "Automações", d: "robôs trabalhando por você" },
    { href: "financas.html",   art: MK.art.coin(34),    t: "Finanças",   d: "ativos, passivos e fluxo" },
    { href: "tarefas.html",    art: MK.art.leaf(34),    t: "Tarefas",    d: "o que fazer hoje" },
    { href: "habitos.html",    art: MK.art.banana(34),  t: "Hábitos",    d: "constância diária" },
    { href: "canal.html",      art: MK.art.monkey(34),  t: "Canal",      d: "ideias e pipeline de vídeos" }
  ];
  document.getElementById("quick-links").innerHTML = links.map(l => `
    <a class="quick-link" href="${l.href}">
      <span>${l.art}</span>
      <span>${l.t}</span>
      <span class="ql-desc">${l.d}</span>
    </a>`).join("");
})();

/* próximas tarefas */
(function proximas() {
  const ordem = { alta: 0, media: 1, baixa: 2 };
  const tarefas = MK.load("tarefas", [])
    .filter(t => !t.feita)
    .sort((a, b) => (ordem[a.prioridade] ?? 1) - (ordem[b.prioridade] ?? 1))
    .slice(0, 5);

  const el = document.getElementById("proximas-tarefas");
  if (!tarefas.length) {
    el.innerHTML = `<p class="muted">Nenhuma tarefa pendente. A selva está em paz. 🐒</p>`;
    return;
  }
  el.innerHTML = tarefas.map(t => `
    <div class="row spread" style="padding:.35rem 0; border-bottom:1.5px dashed var(--leaf-soft);">
      <span>${MK.esc(t.texto)}</span>
      <span class="tag ${t.prioridade === "alta" ? "coral" : t.prioridade === "media" ? "banana" : ""}">${MK.esc(t.prioridade || "média")}</span>
    </div>`).join("") + `<p class="mt-1"><a href="tarefas.html">ver todas →</a></p>`;
})();

/* metas em andamento */
(function metas() {
  const metas = MK.load("metas", []).filter(m => (Number(m.atual) || 0) < (Number(m.alvo) || 1)).slice(0, 4);
  const el = document.getElementById("metas-andamento");
  if (!metas.length) {
    el.innerHTML = `<p class="muted">Nenhuma meta em andamento. Que tal plantar uma? <a href="metas.html">criar meta →</a></p>`;
    return;
  }
  el.innerHTML = metas.map(m => {
    const pct = Math.min(100, Math.round(((Number(m.atual) || 0) / (Number(m.alvo) || 1)) * 100));
    return `
      <div style="margin-bottom:.8rem;">
        <div class="row spread"><strong>${MK.esc(m.titulo)}</strong><span class="muted">${pct}%</span></div>
        <div class="progress mt-0" style="margin-top:.3rem;"><span style="width:${pct}%"></span></div>
      </div>`;
  }).join("") + `<p><a href="metas.html">ver todas →</a></p>`;
})();
