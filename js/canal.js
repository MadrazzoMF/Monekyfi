/* Pipeline de vídeos do canal */

MK.renderShell("canal");
document.getElementById("icone").innerHTML = MK.art.monkey(34);

let videos = MK.load("videos", []);

const ETAPAS = [
  { id: "ideia",     rotulo: "💡 Ideias" },
  { id: "roteiro",   rotulo: "✍️ Roteiro" },
  { id: "gravando",  rotulo: "🎥 Gravando" },
  { id: "editando",  rotulo: "✂️ Editando" },
  { id: "publicado", rotulo: "🚀 Publicado" }
];

const FORMATO = { video: "🎬", short: "⚡", live: "🔴" };

function salvar() { MK.save("videos", videos); }

function render() {
  document.getElementById("kanban").innerHTML = ETAPAS.map(etapa => {
    const doEstagio = videos.filter(v => v.etapa === etapa.id);
    const idx = ETAPAS.findIndex(x => x.id === etapa.id);

    const cards = doEstagio.map(v => {
      const anterior = ETAPAS[idx - 1];
      const proxima = ETAPAS[idx + 1];
      return `
        <div class="kanban-card">
          <strong>${FORMATO[v.formato] ?? ""} ${MK.esc(v.titulo)}</strong>
          ${v.obs ? `<div class="muted" style="margin-top:.2rem;">${MK.esc(v.obs)}</div>` : ""}
          <div class="move">
            ${anterior ? `<button class="btn small ghost" data-mover="${v.id}" data-para="${anterior.id}">←</button>` : ""}
            ${proxima ? `<button class="btn small" data-mover="${v.id}" data-para="${proxima.id}">→ ${proxima.rotulo.split(" ")[1] ?? ""}</button>` : ""}
            <button class="btn small danger" data-apagar="${v.id}">✕</button>
          </div>
        </div>`;
    }).join("");

    return `
      <div class="kanban-col">
        <h3>${etapa.rotulo} <span class="count">${doEstagio.length}</span></h3>
        ${cards || `<p class="muted" style="font-size:.8rem;">vazio</p>`}
      </div>`;
  }).join("");
}

document.getElementById("form").addEventListener("submit", e => {
  e.preventDefault();
  videos.unshift({
    id: MK.uid(),
    titulo: document.getElementById("f-titulo").value.trim(),
    formato: document.getElementById("f-formato").value,
    obs: document.getElementById("f-obs").value.trim(),
    etapa: "ideia",
    criadoEm: MK.todayISO()
  });
  salvar();
  e.target.reset();
  render();
  MK.toast("Ideia no pipeline! 💡");
});

document.getElementById("kanban").addEventListener("click", e => {
  const btn = e.target.closest("button");
  if (!btn) return;
  if (btn.dataset.mover) {
    const v = videos.find(x => x.id === btn.dataset.mover);
    if (v) {
      v.etapa = btn.dataset.para;
      salvar();
      render();
      if (v.etapa === "publicado") MK.toast("Vídeo publicado! 🚀🍌");
    }
  } else if (btn.dataset.apagar) {
    if (!confirm("Apagar este vídeo do pipeline?")) return;
    videos = videos.filter(x => x.id !== btn.dataset.apagar);
    salvar();
    render();
  }
});

render();
