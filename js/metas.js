/* Metas com barra de progresso */

MK.renderShell("metas");
document.getElementById("icone").innerHTML = MK.art.sparkle(30);

let metas = MK.load("metas", []);

function salvar() { MK.save("metas", metas); }

function render() {
  const lista = document.getElementById("lista");
  if (!metas.length) {
    lista.innerHTML = `<div class="empty" style="grid-column:1/-1;">${MK.art.sparkle(44)}Nenhuma meta plantada. Toda grande árvore começou semente. 🌱</div>`;
    return;
  }

  lista.innerHTML = metas.map(m => {
    const alvo = Number(m.alvo) || 1;
    const atual = Number(m.atual) || 0;
    const pct = Math.min(100, Math.round((atual / alvo) * 100));
    const completa = atual >= alvo;
    const prazo = m.prazo
      ? new Date(m.prazo + "T12:00:00").toLocaleDateString("pt-BR")
      : null;

    return `
      <div class="card ${completa ? "alt" : ""}">
        <div class="row spread">
          <h3 class="mt-0">${completa ? "🏆 " : ""}${MK.esc(m.titulo)}</h3>
          <span class="tag ${m.area === "canal" ? "banana" : "paper"}">${m.area === "canal" ? "Canal" : "Pessoal"}</span>
        </div>
        <div class="row spread muted">
          <span>${atual.toLocaleString("pt-BR")} / ${alvo.toLocaleString("pt-BR")} ${MK.esc(m.unidade || "")}</span>
          <span>${pct}%${prazo ? " · até " + prazo : ""}</span>
        </div>
        <div class="progress mt-1"><span class="${completa ? "leaf" : ""}" style="width:${pct}%"></span></div>
        <div class="row mt-1 spread">
          <form class="row" data-progresso="${m.id}">
            <input type="number" step="any" min="0" placeholder="novo valor" style="width:120px;" required>
            <button class="btn small" type="submit">Atualizar</button>
          </form>
          <button class="btn small danger" data-apagar="${m.id}">Apagar</button>
        </div>
      </div>`;
  }).join("");
}

document.getElementById("form").addEventListener("submit", e => {
  e.preventDefault();
  metas.unshift({
    id: MK.uid(),
    titulo: document.getElementById("f-titulo").value.trim(),
    alvo: Number(document.getElementById("f-alvo").value),
    atual: Number(document.getElementById("f-atual").value) || 0,
    unidade: document.getElementById("f-unidade").value.trim(),
    prazo: document.getElementById("f-prazo").value || null,
    area: document.getElementById("f-area").value,
    criadaEm: MK.todayISO()
  });
  salvar();
  e.target.reset();
  render();
  MK.toast("Meta plantada! 🌱");
});

document.getElementById("lista").addEventListener("submit", e => {
  const form = e.target.closest("[data-progresso]");
  if (!form) return;
  e.preventDefault();
  const m = metas.find(x => x.id === form.dataset.progresso);
  const valor = Number(form.querySelector("input").value);
  if (m && !Number.isNaN(valor)) {
    m.atual = valor;
    salvar();
    render();
    if (valor >= (Number(m.alvo) || 1)) MK.toast("META BATIDA! 🏆🍌");
    else MK.toast("Progresso atualizado!");
  }
});

document.getElementById("lista").addEventListener("click", e => {
  const btn = e.target.closest("[data-apagar]");
  if (!btn) return;
  if (!confirm("Apagar esta meta?")) return;
  metas = metas.filter(x => x.id !== btn.dataset.apagar);
  salvar();
  render();
});

render();
