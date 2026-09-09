/**
 * Controle segmentado. opcoes: [{ valor, rotulo, tom? }]
 */
export function Segmentado({ valor, opcoes, onChange, rotulo, tamanho = '' }) {
  return (
    <div className={`seg ${tamanho}`} role="group" aria-label={rotulo}>
      {opcoes.map((o) => (
        <button key={o.valor} type="button" aria-pressed={valor === o.valor} data-tom={o.tom} onClick={() => onChange(o.valor)}>
          {o.rotulo}
        </button>
      ))}
    </div>
  );
}
