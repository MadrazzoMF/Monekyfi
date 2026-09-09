// Ícones inline (traços estilo Lucide). Sem dependência externa.
const CAMINHOS = {
  painel: 'M3 3h7v9H3zM14 3h7v5h-7zM14 12h7v9h-7zM3 16h7v5H3z',
  importar: 'M12 3v12m0 0l-4-4m4 4l4-4M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2',
  busca: 'M21 21l-4.35-4.35M11 18a7 7 0 100-14 7 7 0 000 14z',
  filtro: 'M4 5h16l-6 8v5l-4 2v-7z',
  x: 'M18 6L6 18M6 6l12 12',
  check: 'M20 6L9 17l-5-5',
  alerta: 'M12 9v4m0 4h.01M10.3 3.9L1.8 18a2 2 0 001.7 3h17a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z',
  info: 'M12 16v-4m0-4h.01M22 12a10 10 0 11-20 0 10 10 0 0120 0z',
  relogio: 'M12 6v6l4 2m6-2a10 10 0 11-20 0 10 10 0 0120 0z',
  moeda: 'M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6',
  arquivo: 'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8zM14 2v6h6M16 13H8m8 4H8m2-8H8',
  lista: 'M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01',
  escudo: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
  fluxo: 'M6 3v12m0 0a3 3 0 103 3m-3-3a3 3 0 003 3m9-15a3 3 0 100 6 3 3 0 000-6zm0 6c0 6-6 6-9 9',
  seta: 'M5 12h14m-7-7l7 7-7 7',
  voltar: 'M19 12H5m7 7l-7-7 7-7',
  sol: 'M12 3v1m0 16v1m9-9h-1M4 12H3m15.4-6.4l-.7.7M6.3 17.7l-.7.7m12.8 0l-.7-.7M6.3 6.3l-.7-.7M12 17a5 5 0 100-10 5 5 0 000 10z',
  lua: 'M21 12.8A9 9 0 1111.2 3a7 7 0 009.8 9.8z',
  usuario: 'M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2m12-14a4 4 0 11-8 0 4 4 0 018 0z',
  mais: 'M12 5v14m-7-7h14',
  lixo: 'M3 6h18M8 6V4a1 1 0 011-1h6a1 1 0 011 1v2m2 0v14a2 2 0 01-2 2H8a2 2 0 01-2-2V6h12z',
  olho: 'M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zm11 3a3 3 0 100-6 3 3 0 000 6z',
  faisca: 'M12 2l1.8 5.5L19 9l-5.2 1.5L12 16l-1.8-5.5L5 9l5.2-1.5zM19 16l.9 2.6L22 19.5l-2.1.9L19 23l-.9-2.6L16 19.5l2.1-.9z',
  tag: 'M20.6 13.4l-7.2 7.2a2 2 0 01-2.8 0L3 13V3h10l7.6 7.6a2 2 0 010 2.8zM7 7h.01',
  predio: 'M3 21h18M5 21V7l8-4v18M19 21V11l-6-4M9 9v.01M9 12v.01M9 15v.01M9 18v.01',
  calendario: 'M8 2v4m8-4v4M3 10h18M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z',
  seta_cima: 'M12 19V5m-7 7l7-7 7 7',
  seta_baixo: 'M12 5v14m7-7l-7 7-7-7',
  ordenar: 'M8 9l4-4 4 4M8 15l4 4 4-4',
  play: 'M5 3l14 9-14 9V3z',
  exemplo: 'M4 4h16v16H4zM8 9h8M8 13h6',
};

export function Icone({ nome, tamanho = 16, className = '', strokeWidth = 1.8, ...resto }) {
  const d = CAMINHOS[nome];
  if (!d) return null;
  return (
    <svg
      width={tamanho}
      height={tamanho}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={`shrink-0 ${className}`}
      {...resto}
    >
      <path d={d} />
    </svg>
  );
}
