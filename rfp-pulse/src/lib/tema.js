// Tema claro/escuro. Escuro é o padrão.
const CHAVE = 'rfp-pulse:tema';

export function lerTema() {
  try {
    const salvo = globalThis.localStorage?.getItem(CHAVE);
    if (salvo === 'light' || salvo === 'dark') return salvo;
  } catch {
    /* ignora */
  }
  return 'dark';
}

export function aplicarTema(tema) {
  if (typeof document === 'undefined') return;
  document.documentElement.dataset.theme = tema;
  try {
    globalThis.localStorage?.setItem(CHAVE, tema);
  } catch {
    /* ignora */
  }
}
