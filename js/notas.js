/* Caderninho de notas */

MK.renderShell("notas");
document.getElementById("icone").innerHTML = MK.art.leaf(30, "#d9e7c8");

let notas = MK.load("notas", []);
let editandoId = null;

const form = document.getElementById("form");
const fTitulo = document.getElementById("f-titulo");
const fArea = document.getElementById("f-area");
const fConteudo = document.getElementById("f-conteudo");
const busca = document.getElementById("busca");

function salvar() { MK.save("notas", notas); }

function render() {
  const termo = busca.value.trim().toLowerCase();
  const visiveis = notas.filter(n =>
    !termo || (n.titulo + " " + n.conteudo).toLowerCase().includes(termo));

  const lista = document.getElementById("lista");
  if (!visiveis.length) {
    lista.innerHTML = `<div class="empty" style="grid-column:1/-1;">${MK.art.leaf(44)}Nenhuma nota ainda. Toda grande ideia começa num rabisco. ✏️</div>`;
    return;
  }

  lista.innerHTML = visiveis.map(n => `
    <div class="card">
      <div class="row spread">
        <h3 class="mt-0">${MK.esc(n.titulo)}</h3>
        <span class="tag ${n.area === "canal" ? "banana" : "paper"}">${n.area === "canal" ? "Canal" : "Pessoal"}</span>
      </div>
      <p class="muted" style="white-space:pre-wrap; overflow-wrap:break-word;">${MK.esc(n.conteudo)}</p>
      <div class="row spread mt-1">
        <span class="muted">${MK.esc((n.criadaEm || "").split("-").reverse().join("/"))}</span>
        <span class="row">
          <button class="btn small ghost" data-editar="${n.id}">Editar</button>
          <button class="btn small danger" data-apagar="${n.id}">Apagar</button>
        </span>
      </div>
    </div>`).join("");
}

form.addEventListener("submit", e => {
  e.preventDefault();
  const dados = {
    titulo: fTitulo.value.trim(),
    area: fArea.value,
    conteudo: fConteudo.value
  };
  if (editandoId) {
    Object.assign(notas.find(x => x.id === editandoId), dados);
    MK.toast("Nota atualizada!");
  } else {
    notas.unshift({ id: MK.uid(), criadaEm: MK.todayISO(), ...dados });
    MK.toast("Nota guardada! 🍌");
  }
  salvar();
  cancelarEdicao();
  render();
});

function cancelarEdicao() {
  editandoId = null;
  form.reset();
  document.getElementById("form-titulo").textContent = "Nova nota";
  document.getElementById("cancelar").hidden = true;
}

document.getElementById("cancelar").addEventListener("click", cancelarEdicao);
busca.addEventListener("input", render);

document.getElementById("lista").addEventListener("click", e => {
  const btn = e.target.closest("button");
  if (!btn) return;
  if (btn.dataset.editar) {
    const n = notas.find(x => x.id === btn.dataset.editar);
    if (!n) return;
    editandoId = n.id;
    fTitulo.value = n.titulo;
    fArea.value = n.area || "pessoal";
    fConteudo.value = n.conteudo;
    document.getElementById("form-titulo").textContent = "Editando nota";
    document.getElementById("cancelar").hidden = false;
    window.scrollTo({ top: 0, behavior: "smooth" });
  } else if (btn.dataset.apagar) {
    if (!confirm("Apagar esta nota?")) return;
    notas = notas.filter(x => x.id !== btn.dataset.apagar);
    salvar();
    render();
    MK.toast("Nota apagada.");
  }
});

render();
