/* Lista de tarefas */

MK.renderShell("tarefas");
document.getElementById("icone").innerHTML = MK.art.leaf(30);

let tarefas = MK.load("tarefas", []);
let filtro = "todas"; // todas | canal | pessoal | pendentes | feitas

const ORDEM_PRIORIDADE = { alta: 0, media: 1, baixa: 2 };
const TAG_PRIORIDADE = { alta: "coral", media: "banana", baixa: "" };
const ROTULO_PRIORIDADE = { alta: "alta", media: "média", baixa: "baixa" };

function salvar() { MK.save("tarefas", tarefas); }

function render() {
  const filtros = [
    ["todas", "Todas"], ["pendentes", "Pendentes"], ["feitas", "Feitas"],
    ["canal", "Canal"], ["pessoal", "Pessoal"]
  ];
  document.getElementById("filtros").innerHTML = filtros.map(([f, r]) =>
    `<button class="chip ${filtro === f ? "active" : ""}" data-f="${f}">${r}</button>`).join("");

  const visiveis = tarefas
    .filter(t => {
      if (filtro === "pendentes") return !t.feita;
      if (filtro === "feitas") return t.feita;
      if (filtro === "canal" || filtro === "pessoal") return t.area === filtro;
      return true;
    })
    .sort((a, b) =>
      (a.feita ? 1 : 0) - (b.feita ? 1 : 0) ||
      (ORDEM_PRIORIDADE[a.prioridade] ?? 1) - (ORDEM_PRIORIDADE[b.prioridade] ?? 1));

  const lista = document.getElementById("lista");
  if (!visiveis.length) {
    lista.innerHTML = `<div class="empty">${MK.art.leaf(44)}Nada por aqui. A selva está em paz. 🐒</div>`;
    return;
  }

  lista.innerHTML = visiveis.map(t => `
    <div class="item ${t.feita ? "done" : ""}">
      <button class="habit-check ${t.feita ? "on" : ""}" data-toggle="${t.id}" title="${t.feita ? "Desmarcar" : "Concluir"}">${t.feita ? "✓" : ""}</button>
      <div class="body">
        <span class="item-title">${MK.esc(t.texto)}</span>
        <div class="row" style="margin-top:.25rem;">
          <span class="tag ${TAG_PRIORIDADE[t.prioridade] ?? ""}">${ROTULO_PRIORIDADE[t.prioridade] ?? t.prioridade}</span>
          <span class="tag ${t.area === "canal" ? "banana" : "paper"}">${t.area === "canal" ? "Canal" : "Pessoal"}</span>
        </div>
      </div>
      <div class="actions">
        <button class="btn small danger" data-apagar="${t.id}">✕</button>
      </div>
    </div>`).join("");
}

document.getElementById("form").addEventListener("submit", e => {
  e.preventDefault();
  tarefas.unshift({
    id: MK.uid(),
    texto: document.getElementById("f-texto").value.trim(),
    prioridade: document.getElementById("f-prioridade").value,
    area: document.getElementById("f-area").value,
    feita: false,
    criadaEm: MK.todayISO()
  });
  salvar();
  document.getElementById("f-texto").value = "";
  render();
  MK.toast("Tarefa adicionada! 🍌");
});

document.getElementById("filtros").addEventListener("click", e => {
  const f = e.target.closest("[data-f]")?.dataset.f;
  if (!f) return;
  filtro = f;
  render();
});

document.getElementById("lista").addEventListener("click", e => {
  const btn = e.target.closest("button");
  if (!btn) return;
  if (btn.dataset.toggle) {
    const t = tarefas.find(x => x.id === btn.dataset.toggle);
    if (t) { t.feita = !t.feita; salvar(); render(); }
  } else if (btn.dataset.apagar) {
    tarefas = tarefas.filter(x => x.id !== btn.dataset.apagar);
    salvar();
    render();
  }
});

document.getElementById("limpar-feitas").addEventListener("click", () => {
  const feitas = tarefas.filter(t => t.feita).length;
  if (!feitas) { MK.toast("Nenhuma tarefa concluída pra limpar."); return; }
  if (!confirm(`Remover ${feitas} tarefa(s) concluída(s)?`)) return;
  tarefas = tarefas.filter(t => !t.feita);
  salvar();
  render();
  MK.toast("Selva limpa! 🌿");
});

render();
