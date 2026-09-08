import { useEffect, useMemo, useRef } from 'react';
import { localizarTrechos } from '../lib/analise.js';

/**
 * Texto bruto com os trechos de origem marcados.
 * itens: [{ id, trechoOrigem, _tipo }]  ativo: id selecionado
 */
export function TextoOrigem({ texto, itens, ativo, onSelecionar }) {
  const marcas = useMemo(() => localizarTrechos(texto, itens), [texto, itens]);
  const refs = useRef({});

  useEffect(() => {
    const el = ativo ? refs.current[ativo] : null;
    if (el?.scrollIntoView) el.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }, [ativo]);

  if (!texto) return <p>Sem texto bruto para este edital.</p>;

  const partes = [];
  let cursor = 0;
  for (const m of marcas) {
    if (m.inicio > cursor) partes.push(<span key={`t${cursor}`}>{texto.slice(cursor, m.inicio)}</span>);
    partes.push(
      <mark
        key={m.id}
        ref={(el) => {
          refs.current[m.id] = el;
        }}
        data-tipo={m.tipo}
        data-ativo={ativo === m.id ? 'true' : undefined}
        tabIndex={0}
        role="button"
        aria-pressed={ativo === m.id}
        onClick={() => onSelecionar?.(m.id)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onSelecionar?.(m.id);
          }
        }}
      >
        {texto.slice(m.inicio, m.fim)}
      </mark>,
    );
    cursor = m.fim;
  }
  if (cursor < texto.length) partes.push(<span key={`t${cursor}`}>{texto.slice(cursor)}</span>);

  return (
    <div className="texto-origem" aria-label="Texto bruto do edital">
      {partes}
    </div>
  );
}
