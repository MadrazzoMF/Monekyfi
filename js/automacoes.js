/* Catálogo de automações */

MK.renderShell("automacoes");
document.getElementById("icone").innerHTML = MK.art.vine(60);

let autos = MK.load("autos", []);
let editandoId = null;
let filtroStatus = "todas";

const STATUS = {
  ativa:   { rotulo: "🟢 Ativa",   cls: "" },
  pausada: { rotulo: "🟡 Pausada", cls: "banana" },
  ideia:   { rotulo: "💡 Ideia",   cls: "paper" }
};

const form = document.getElementById("form");
const fNome = document.getElementById("f-nome");
const fFerramenta = document.getElementById("f-ferramenta");
const fStatus = document.getElementById("f-status");
const fLink = document.getElementById("f-link");
const fDescricao = document.getElementById("f-descricao");

function salvar() { MK.save("autos", autos); }

function render() {
  const filtros = ["todas", "ativa", "pausada", "ideia"];
  document.getElementById("filtros").innerHTML = filtros.map(f =>
    `<button class="chip ${filtroStatus === f ? "active" : ""}" data-f="${f}">
      ${f === "todas" ? "Todas" : STATUS[f].rotulo}
    </button>`).join("");

  const visiveis = filtroStatus === "todas" ? autos : autos.filter(a => a.status === filtroStatus);
  const lista = document.getElementById("lista");

  if (!visiveis.length) {
    lista.innerHTML = `<div class="empty">${MK.art.vine(90)}Nenhuma automação registrada. Bora colocar os robôs pra trabalhar! 🤖</div>`;
    return;
  }

  lista.innerHTML = visiveis.map(a => `
    <div class="item">
      <div class="body">
        <div class="row">
          <span class="item-title">${MK.esc(a.nome)}</span>
          ${a.ferramenta ? `<span class="tag">${MK.esc(a.ferramenta)}</span>` : ""}
          <span class="tag ${STATUS[a.status]?.cls ?? ""}">${STATUS[a.status]?.rotulo ?? a.status}</span>
        </div>
        ${a.descricao ? `<p>${MK.esc(a.descricao)}</p>` : ""}
        ${a.link ? `<p><a href="${MK.esc(a.link)}" target="_blank" rel="noopener">abrir automação ↗</a></p>` : ""}
      </div>
      <div class="actions">
        <button class="btn small ghost" data-editar="${a.id}">Editar</button>
        <button class="btn small danger" data-apagar="${a.id}">Apagar</button>
      </div>
    </div>`).join("");
}

form.addEventListener("submit", e => {
  e.preventDefault();
  const dados = {
    nome: fNome.value.trim(),
    ferramenta: fFerramenta.value.trim(),
    status: fStatus.value,
    link: fLink.value.trim(),
    descricao: fDescricao.value.trim()
  };
  if (editandoId) {
    Object.assign(autos.find(x => x.id === editandoId), dados);
    MK.toast("Automação atualizada!");
  } else {
    autos.unshift({ id: MK.uid(), criadoEm: MK.todayISO(), ...dados });
    MK.toast("Automação registrada! 🍌");
  }
  salvar();
  cancelarEdicao();
  render();
});

function cancelarEdicao() {
  editandoId = null;
  form.reset();
  document.getElementById("form-titulo").textContent = "Registrar automação";
  document.getElementById("cancelar").hidden = true;
}

document.getElementById("cancelar").addEventListener("click", cancelarEdicao);

document.getElementById("filtros").addEventListener("click", e => {
  const f = e.target.closest("[data-f]")?.dataset.f;
  if (!f) return;
  filtroStatus = f;
  render();
});

document.getElementById("lista").addEventListener("click", e => {
  const btn = e.target.closest("button");
  if (!btn) return;
  if (btn.dataset.editar) {
    const a = autos.find(x => x.id === btn.dataset.editar);
    if (!a) return;
    editandoId = a.id;
    fNome.value = a.nome;
    fFerramenta.value = a.ferramenta || "";
    fStatus.value = a.status || "ativa";
    fLink.value = a.link || "";
    fDescricao.value = a.descricao || "";
    document.getElementById("form-titulo").textContent = "Editando automação";
    document.getElementById("cancelar").hidden = false;
    window.scrollTo({ top: 0, behavior: "smooth" });
  } else if (btn.dataset.apagar) {
    if (!confirm("Apagar esta automação?")) return;
    autos = autos.filter(x => x.id !== btn.dataset.apagar);
    salvar();
    render();
    MK.toast("Automação apagada.");
  }
});

render();
