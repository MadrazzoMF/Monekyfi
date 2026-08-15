/* Finanças — balanço patrimonial + fluxo mensal */

MK.renderShell("financas");
document.getElementById("icone").innerHTML = MK.art.coin(32);

let ativos = MK.load("ativos", []);
let passivos = MK.load("passivos", []);
let fluxo = MK.load("fluxo", []);

const TIPO_ATIVO = {
  circulante: "Circulante",
  investimento: "Investimento",
  imobilizado: "Não circulante"
};
const TIPO_PASSIVO = {
  circulante: "Circulante",
  longo: "Não circulante"
};

const mesInput = document.getElementById("mes");
mesInput.value = MK.todayISO().slice(0, 7);
document.getElementById("fl-data").value = MK.todayISO();

const soma = arr => arr.reduce((s, x) => s + (Number(x.valor) || 0), 0);

function renderResumo() {
  const tA = soma(ativos);
  const tP = soma(passivos);
  const circulantes = soma(ativos.filter(a => a.tipo === "circulante"));
  const patrimonio = tA - tP;

  document.getElementById("resumo").innerHTML = [
    { num: MK.brl(tA), lbl: "total de ativos", cls: "" },
    { num: MK.brl(circulantes), lbl: "ativos circulantes", cls: "banana" },
    { num: MK.brl(tP), lbl: "total de passivos", cls: tP > 0 ? "coral" : "" },
    { num: MK.brl(patrimonio), lbl: "patrimônio líquido", cls: patrimonio < 0 ? "coral" : "" }
  ].map(s => `
    <div class="card stat">
      <div class="num ${s.cls}">${s.num}</div>
      <div class="lbl">${s.lbl}</div>
    </div>`).join("");

  document.getElementById("total-ativos").textContent = "· " + MK.brl(tA);
  document.getElementById("total-passivos").textContent = "· " + MK.brl(tP);
}

function linhaBalanco(x, colecao, rotulos) {
  return `
    <tr>
      <td>${MK.esc(x.nome)}</td>
      <td><span class="tag ${x.tipo === "circulante" ? "banana" : "paper"}">${rotulos[x.tipo] ?? x.tipo}</span></td>
      <td class="num">${MK.brl(x.valor)}</td>
      <td class="num"><button class="btn small danger" data-col="${colecao}" data-apagar="${x.id}">✕</button></td>
    </tr>`;
}

function renderTabelas() {
  const cab = `<tr><th>Nome</th><th>Tipo</th><th class="num">Valor</th><th></th></tr>`;
  document.getElementById("tabela-ativos").innerHTML = ativos.length
    ? cab + ativos.map(a => linhaBalanco(a, "ativos", TIPO_ATIVO)).join("")
    : `<tr><td class="muted">Nenhum ativo cadastrado ainda.</td></tr>`;
  document.getElementById("tabela-passivos").innerHTML = passivos.length
    ? cab + passivos.map(p => linhaBalanco(p, "passivos", TIPO_PASSIVO)).join("")
    : `<tr><td class="muted">Nenhum passivo — selva sem dívidas! 🎉</td></tr>`;
}

function renderFluxo() {
  const mes = mesInput.value;
  const doMes = fluxo
    .filter(l => (l.data || "").startsWith(mes))
    .sort((a, b) => (b.data || "").localeCompare(a.data || ""));

  const entradas = soma(doMes.filter(l => l.tipo === "entrada"));
  const saidas = soma(doMes.filter(l => l.tipo === "saida"));
  const saldo = entradas - saidas;

  document.getElementById("resumo-fluxo").innerHTML = [
    { num: MK.brl(entradas), lbl: "entradas", cls: "" },
    { num: MK.brl(saidas), lbl: "saídas", cls: "coral" },
    { num: MK.brl(saldo), lbl: "saldo do mês", cls: saldo < 0 ? "coral" : "banana" }
  ].map(s => `
    <div class="stat">
      <div class="num ${s.cls}">${s.num}</div>
      <div class="lbl">${s.lbl}</div>
    </div>`).join("");

  const tbl = document.getElementById("tabela-fluxo");
  if (!doMes.length) {
    tbl.innerHTML = `<tr><td class="muted">Nenhum lançamento neste mês.</td></tr>`;
    return;
  }
  tbl.innerHTML = `<tr><th>Data</th><th>Descrição</th><th class="num">Valor</th><th></th></tr>` +
    doMes.map(l => `
      <tr>
        <td class="muted">${MK.esc((l.data || "").split("-").reverse().slice(0, 2).join("/"))}</td>
        <td>${MK.esc(l.desc)}</td>
        <td class="num ${l.tipo === "entrada" ? "pos" : "neg"}">${l.tipo === "entrada" ? "+" : "−"} ${MK.brl(l.valor)}</td>
        <td class="num"><button class="btn small danger" data-col="fluxo" data-apagar="${l.id}">✕</button></td>
      </tr>`).join("");
}

function renderTudo() { renderResumo(); renderTabelas(); renderFluxo(); }

document.getElementById("form-ativo").addEventListener("submit", e => {
  e.preventDefault();
  ativos.push({
    id: MK.uid(),
    nome: document.getElementById("a-nome").value.trim(),
    tipo: document.getElementById("a-tipo").value,
    valor: Number(document.getElementById("a-valor").value)
  });
  MK.save("ativos", ativos);
  e.target.reset();
  renderTudo();
  MK.toast("Ativo adicionado! 🌳");
});

document.getElementById("form-passivo").addEventListener("submit", e => {
  e.preventDefault();
  passivos.push({
    id: MK.uid(),
    nome: document.getElementById("p-nome").value.trim(),
    tipo: document.getElementById("p-tipo").value,
    valor: Number(document.getElementById("p-valor").value)
  });
  MK.save("passivos", passivos);
  e.target.reset();
  renderTudo();
  MK.toast("Passivo adicionado.");
});

document.getElementById("form-fluxo").addEventListener("submit", e => {
  e.preventDefault();
  fluxo.push({
    id: MK.uid(),
    desc: document.getElementById("fl-desc").value.trim(),
    tipo: document.getElementById("fl-tipo").value,
    valor: Number(document.getElementById("fl-valor").value),
    data: document.getElementById("fl-data").value
  });
  MK.save("fluxo", fluxo);
  document.getElementById("fl-desc").value = "";
  document.getElementById("fl-valor").value = "";
  renderTudo();
  MK.toast("Lançamento feito! 🍌");
});

mesInput.addEventListener("change", renderFluxo);

document.querySelector("main").addEventListener("click", e => {
  const btn = e.target.closest("[data-apagar]");
  if (!btn) return;
  if (!confirm("Apagar este item?")) return;
  const id = btn.dataset.apagar;
  if (btn.dataset.col === "ativos") { ativos = ativos.filter(x => x.id !== id); MK.save("ativos", ativos); }
  if (btn.dataset.col === "passivos") { passivos = passivos.filter(x => x.id !== id); MK.save("passivos", passivos); }
  if (btn.dataset.col === "fluxo") { fluxo = fluxo.filter(x => x.id !== id); MK.save("fluxo", fluxo); }
  renderTudo();
});

renderTudo();
