/* Monekyfi — núcleo compartilhado: storage, navegação, arte SVG, utilidades */

const MK = (() => {
  const PREFIX = "monekyfi:v1:";

  /* ---------- storage ---------- */
  function load(key, fallback) {
    try {
      const raw = localStorage.getItem(PREFIX + key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  }

  function save(key, value) {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  }

  const DATA_KEYS = [
    "prompts", "autos", "ativos", "passivos", "fluxo",
    "tarefas", "habitos", "habitos_checks", "metas", "notas", "videos"
  ];

  function exportAll() {
    const dump = { app: "monekyfi", version: 1, exportadoEm: new Date().toISOString(), dados: {} };
    DATA_KEYS.forEach(k => { dump.dados[k] = load(k, null); });
    return dump;
  }

  function importAll(dump) {
    if (!dump || dump.app !== "monekyfi" || !dump.dados) {
      throw new Error("Arquivo inválido: não parece um backup do Monekyfi.");
    }
    DATA_KEYS.forEach(k => {
      if (dump.dados[k] != null) save(k, dump.dados[k]);
    });
  }

  function clearAll() {
    DATA_KEYS.forEach(k => localStorage.removeItem(PREFIX + k));
  }

  /* ---------- utilidades ---------- */
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

  function esc(s) {
    return String(s ?? "")
      .replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;").replaceAll("'", "&#39;");
  }

  const brl = v => (Number(v) || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const todayISO = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  };

  function toast(msg) {
    let el = document.getElementById("toast");
    if (!el) {
      el = document.createElement("div");
      el.id = "toast";
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.classList.add("show");
    clearTimeout(el._t);
    el._t = setTimeout(() => el.classList.remove("show"), 2200);
  }

  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
      toast("Copiado! 🍌");
    } catch {
      toast("Não deu pra copiar automaticamente.");
    }
  }

  /* ---------- arte SVG feita à mão ---------- */
  const art = {
    monkey(size = 40) {
      return `<svg width="${size}" height="${size}" viewBox="0 0 64 64" fill="none" aria-hidden="true">
        <circle cx="14" cy="26" r="9" fill="#7a5230" stroke="#27412e" stroke-width="2.5"/>
        <circle cx="50" cy="26" r="9" fill="#7a5230" stroke="#27412e" stroke-width="2.5"/>
        <circle cx="14" cy="26" r="4" fill="#c9976b"/>
        <circle cx="50" cy="26" r="4" fill="#c9976b"/>
        <circle cx="32" cy="32" r="20" fill="#7a5230" stroke="#27412e" stroke-width="2.5"/>
        <path d="M18 34 a14 13 0 0 1 28 0 a14 15 0 0 1 -28 0 Z" fill="#e8c39a"/>
        <path d="M20 24 a12 11 0 0 1 24 0 a12 8 0 0 1 -24 0 Z" fill="#e8c39a"/>
        <circle cx="25" cy="27" r="2.6" fill="#27412e"/>
        <circle cx="39" cy="27" r="2.6" fill="#27412e"/>
        <ellipse cx="32" cy="36" rx="2.6" ry="1.8" fill="#27412e"/>
        <path d="M26 42 q6 5 12 0" stroke="#27412e" stroke-width="2.5" stroke-linecap="round" fill="none"/>
      </svg>`;
    },
    banana(size = 34) {
      return `<svg width="${size}" height="${size}" viewBox="0 0 64 64" fill="none" aria-hidden="true">
        <path d="M14 12 q-4 22 12 34 q14 10 28 4 q3 -1 1 -4 q-14 2 -24 -6 q-13 -10 -12 -28 q0 -3 -2.5 -2 Z"
          fill="#f6c945" stroke="#27412e" stroke-width="2.5" stroke-linejoin="round"/>
        <path d="M13 10 l4 -3 3 4 -4 3 Z" fill="#7a5230" stroke="#27412e" stroke-width="2"/>
        <path d="M20 20 q2 14 12 21" stroke="#c99a1f" stroke-width="2.5" stroke-linecap="round" fill="none"/>
      </svg>`;
    },
    leaf(size = 30, color = "#7fb069") {
      return `<svg width="${size}" height="${size}" viewBox="0 0 64 64" fill="none" aria-hidden="true">
        <path d="M52 12 Q30 10 18 26 Q8 40 12 52 Q26 54 40 44 Q54 33 52 12 Z"
          fill="${color}" stroke="#27412e" stroke-width="2.5" stroke-linejoin="round"/>
        <path d="M16 48 Q30 38 46 18" stroke="#27412e" stroke-width="2" stroke-linecap="round" fill="none"/>
      </svg>`;
    },
    coin(size = 30) {
      return `<svg width="${size}" height="${size}" viewBox="0 0 64 64" fill="none" aria-hidden="true">
        <circle cx="32" cy="32" r="24" fill="#f6c945" stroke="#27412e" stroke-width="2.5"/>
        <circle cx="32" cy="32" r="17" fill="none" stroke="#c99a1f" stroke-width="2" stroke-dasharray="4 4"/>
        <text x="32" y="41" text-anchor="middle" font-family="Caprasimo, Georgia, serif" font-size="24" fill="#7a5230">$</text>
      </svg>`;
    },
    sparkle(size = 26) {
      return `<svg width="${size}" height="${size}" viewBox="0 0 64 64" fill="none" aria-hidden="true">
        <path d="M32 8 L37 27 L56 32 L37 37 L32 56 L27 37 L8 32 L27 27 Z"
          fill="#f6c945" stroke="#27412e" stroke-width="2.5" stroke-linejoin="round"/>
      </svg>`;
    },
    vine(width = 120) {
      return `<svg width="${width}" height="24" viewBox="0 0 160 24" fill="none" aria-hidden="true">
        <path d="M4 12 Q40 -6 80 12 Q120 30 156 12" stroke="#2f5d3f" stroke-width="2.5" stroke-linecap="round" fill="none"/>
        <path d="M40 8 q6 -8 12 -2 q-8 4 -12 2Z" fill="#7fb069" stroke="#27412e" stroke-width="1.8"/>
        <path d="M104 16 q6 8 12 2 q-8 -4 -12 -2Z" fill="#7fb069" stroke="#27412e" stroke-width="1.8"/>
      </svg>`;
    }
  };

  /* ---------- shell (header + footer) ---------- */
  const NAV = [
    { id: "inicio",     href: "index.html",      label: "Início" },
    { id: "prompts",    href: "prompts.html",    label: "Prompts" },
    { id: "automacoes", href: "automacoes.html", label: "Automações" },
    { id: "financas",   href: "financas.html",   label: "Finanças" },
    { id: "tarefas",    href: "tarefas.html",    label: "Tarefas" },
    { id: "habitos",    href: "habitos.html",    label: "Hábitos" },
    { id: "metas",      href: "metas.html",      label: "Metas" },
    { id: "notas",      href: "notas.html",      label: "Notas" },
    { id: "canal",      href: "canal.html",      label: "Canal" },
    { id: "config",     href: "config.html",     label: "Backup" }
  ];

  function renderShell(activeId) {
    const header = document.createElement("header");
    header.className = "site-header";
    header.innerHTML = `
      <div class="header-inner">
        <a class="brand" href="index.html">
          ${art.monkey(38)}
          <span class="brand-name">Moneky<span>fi</span></span>
        </a>
        <nav class="main-nav" aria-label="Navegação principal">
          ${NAV.map(n => `<a href="${n.href}" class="${n.id === activeId ? "active" : ""}">${n.label}</a>`).join("")}
        </nav>
      </div>`;
    document.body.prepend(header);

    const footer = document.createElement("footer");
    footer.className = "site-footer";
    footer.innerHTML = `
      <div class="footer-inner">
        <span>${art.banana(20)} Monekyfi — sua selva organizada</span>
        <span>${art.vine(110)}</span>
        <span>feito à mão na floresta 🌿</span>
      </div>`;
    document.body.appendChild(footer);
  }

  return { load, save, exportAll, importAll, clearAll, uid, esc, brl, todayISO, toast, copyText, art, renderShell, DATA_KEYS };
})();
