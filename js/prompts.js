/* Biblioteca de prompts */

MK.renderShell("prompts");
document.getElementById("icone").innerHTML = MK.art.sparkle(30);

let prompts = MK.load("prompts", []);
let editandoId = null;
let filtroCategoria = "todas";

const form = document.getElementById("form");
const fTitulo = document.getElementById("f-titulo");
const fCategoria = document.getElementById("f-categoria");
const fArea = document.getElementById("f-area");
const fConteudo = document.getElementById("f-conteudo");
const busca = document.getElementById("busca");

function salvar() { MK.save("prompts", prompts); }

function categorias() {
  return [...new Set(prompts.map(p => p.categoria).filter(Boolean))].sort();
}

function renderFiltros() {
  const cats = categorias();
  document.getElementById("categorias").innerHTML = cats.map(c => `<option value="${MK.esc(c)}">`).join("");
  document.getElementById("filtros").innerHTML =
    [`<button class="chip ${filtroCategoria === "todas" ? "active" : ""}" data-cat="todas">Todas</button>`]
      .concat(cats.map(c =>
        `<button class="chip ${filtroCategoria === c ? "active" : ""}" data-cat="${MK.esc(c)}">${MK.esc(c)}</button>`))
      .join("");
}

function renderLista() {
  const termo = busca.value.trim().toLowerCase();
  const visiveis = prompts.filter(p => {
    const okCat = filtroCategoria === "todas" || p.categoria === filtroCategoria;
    const okBusca = !termo || (p.titulo + " " + p.conteudo + " " + (p.categoria || "")).toLowerCase().includes(termo);
    return okCat && okBusca;
  });

  const lista = document.getElementById("lista");
  if (!visiveis.length) {
    lista.innerHTML = `<div class="empty">${MK.art.banana(44)}Nenhum prompt por aqui ainda. Guarde o primeiro! 🐒</div>`;
    return;
  }

  lista.innerHTML = visiveis.map(p => `
    <div class="item">
      <div class="body">
        <div class="row">
          <span class="item-title">${MK.esc(p.titulo)}</span>
          ${p.categoria ? `<span class="tag">${MK.esc(p.categoria)}</span>` : ""}
          <span class="tag ${p.area === "canal" ? "banana" : "paper"}">${p.area === "canal" ? "Canal" : "Pessoal"}</span>
        </div>
        <pre class="copy-pre">${MK.esc(p.conteudo)}</pre>
      </div>
      <div class="actions">
        <button class="btn small" data-copiar="${p.id}">Copiar</button>
        <button class="btn small ghost" data-editar="${p.id}">Editar</button>
        <button class="btn small danger" data-apagar="${p.id}">Apagar</button>
      </div>
    </div>`).join("");
}

function render() { renderFiltros(); renderLista(); }

form.addEventListener("submit", e => {
  e.preventDefault();
  const dados = {
    titulo: fTitulo.value.trim(),
    categoria: fCategoria.value.trim(),
    area: fArea.value,
    conteudo: fConteudo.value
  };
  if (editandoId) {
    const p = prompts.find(x => x.id === editandoId);
    Object.assign(p, dados);
    MK.toast("Prompt atualizado!");
  } else {
    prompts.unshift({ id: MK.uid(), criadoEm: MK.todayISO(), ...dados });
    MK.toast("Prompt guardado! 🍌");
  }
  salvar();
  cancelarEdicao();
  render();
});

function cancelarEdicao() {
  editandoId = null;
  form.reset();
  document.getElementById("form-titulo").textContent = "Guardar novo prompt";
  document.getElementById("cancelar").hidden = true;
}

document.getElementById("cancelar").addEventListener("click", cancelarEdicao);

document.getElementById("filtros").addEventListener("click", e => {
  const cat = e.target.dataset.cat;
  if (!cat) return;
  filtroCategoria = cat;
  render();
});

busca.addEventListener("input", renderLista);

document.getElementById("lista").addEventListener("click", e => {
  const btn = e.target.closest("button");
  if (!btn) return;
  if (btn.dataset.copiar) {
    const p = prompts.find(x => x.id === btn.dataset.copiar);
    if (p) MK.copyText(p.conteudo);
  } else if (btn.dataset.editar) {
    const p = prompts.find(x => x.id === btn.dataset.editar);
    if (!p) return;
    editandoId = p.id;
    fTitulo.value = p.titulo;
    fCategoria.value = p.categoria || "";
    fArea.value = p.area || "canal";
    fConteudo.value = p.conteudo;
    document.getElementById("form-titulo").textContent = "Editando prompt";
    document.getElementById("cancelar").hidden = false;
    window.scrollTo({ top: 0, behavior: "smooth" });
  } else if (btn.dataset.apagar) {
    if (!confirm("Apagar este prompt?")) return;
    prompts = prompts.filter(x => x.id !== btn.dataset.apagar);
    salvar();
    render();
    MK.toast("Prompt apagado.");
  }
});

render();
