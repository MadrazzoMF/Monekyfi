/* Rastreador de hábitos — grade semanal */

MK.renderShell("habitos");
document.getElementById("icone").innerHTML = MK.art.banana(32);

let habitos = MK.load("habitos", []);
let checks = MK.load("habitos_checks", {});
let deslocSemana = 0; // 0 = semana atual, -1 = anterior...

const DIAS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

function iso(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function diasDaSemana() {
  const hoje = new Date();
  const diaSemana = (hoje.getDay() + 6) % 7; // seg = 0
  const segunda = new Date(hoje);
  segunda.setDate(hoje.getDate() - diaSemana + deslocSemana * 7);
  return DIAS.map((_, i) => {
    const d = new Date(segunda);
    d.setDate(segunda.getDate() + i);
    return d;
  });
}

function streak(habitId) {
  const marcados = checks[habitId] || {};
  let n = 0;
  const d = new Date();
  // se hoje ainda não foi marcado, a sequência conta a partir de ontem
  if (!marcados[iso(d)]) d.setDate(d.getDate() - 1);
  while (marcados[iso(d)]) {
    n++;
    d.setDate(d.getDate() - 1);
  }
  return n;
}

function render() {
  const dias = diasDaSemana();
  const hojeIso = MK.todayISO();

  document.getElementById("rotulo-semana").textContent =
    `${dias[0].toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })} – ${dias[6].toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })}`;

  const grade = document.getElementById("grade");
  if (!habitos.length) {
    grade.innerHTML = `<tr><td class="muted" style="padding:1.5rem 0;">Nenhum hábito plantado ainda. Comece com um pequeno! 🌱</td></tr>`;
    return;
  }

  const cab = `<tr><th>Hábito</th>${dias.map((d, i) =>
    `<th>${DIAS[i]}<br><span style="font-weight:400">${d.getDate()}</span></th>`).join("")}<th>🔥</th><th></th></tr>`;

  grade.innerHTML = cab + habitos.map(h => {
    const marcados = checks[h.id] || {};
    const celulas = dias.map(d => {
      const dIso = iso(d);
      const futuro = dIso > hojeIso;
      const on = !!marcados[dIso];
      return `<td><button class="habit-check ${on ? "on" : ""}" data-h="${h.id}" data-d="${dIso}" ${futuro ? "disabled" : ""}>${on ? "🍌" : ""}</button></td>`;
    }).join("");
    return `<tr>
      <td>${MK.esc(h.nome)}</td>
      ${celulas}
      <td><strong>${streak(h.id)}</strong></td>
      <td><button class="btn small danger" data-apagar="${h.id}">✕</button></td>
    </tr>`;
  }).join("");
}

document.getElementById("form").addEventListener("submit", e => {
  e.preventDefault();
  habitos.push({ id: MK.uid(), nome: document.getElementById("f-nome").value.trim(), criadoEm: MK.todayISO() });
  MK.save("habitos", habitos);
  e.target.reset();
  render();
  MK.toast("Hábito plantado! 🌱");
});

document.getElementById("grade").addEventListener("click", e => {
  const btn = e.target.closest("button");
  if (!btn) return;
  if (btn.dataset.h) {
    const { h, d } = btn.dataset;
    checks[h] = checks[h] || {};
    if (checks[h][d]) delete checks[h][d];
    else checks[h][d] = true;
    MK.save("habitos_checks", checks);
    render();
  } else if (btn.dataset.apagar) {
    if (!confirm("Apagar este hábito e seu histórico?")) return;
    habitos = habitos.filter(x => x.id !== btn.dataset.apagar);
    delete checks[btn.dataset.apagar];
    MK.save("habitos", habitos);
    MK.save("habitos_checks", checks);
    render();
  }
});

document.getElementById("semana-antes").addEventListener("click", () => { deslocSemana--; render(); });
document.getElementById("semana-depois").addEventListener("click", () => {
  if (deslocSemana < 0) { deslocSemana++; render(); }
});

render();
