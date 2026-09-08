import { useState } from 'react';
import { TipoRisco, Severidade, Probabilidade } from '../domain/enums.js';
import { rotulo, formatarMoeda } from '../lib/formatos.js';
import { acoes } from '../state/acoes.js';
import { useAppDispatch } from '../state/hooks.js';

export function PainelRiscos({ edital, ativo, onSelecionar }) {
  const dispatch = useAppDispatch();
  const [novo, setNovo] = useState({ titulo: '', tipo: 'operacional', severidade: 'medio', probabilidade: 'media' });

  const criticosAbertos = edital.riscos.filter((r) => r.severidade === 'critico' && !r.aceito).length;

  const adicionar = (e) => {
    e.preventDefault();
    if (!novo.titulo.trim()) return;
    dispatch(acoes.adicionarRisco({ editalId: edital.id, ...novo, titulo: novo.titulo.trim() }));
    setNovo({ ...novo, titulo: '' });
  };

  return (
    <section className="flex flex-col gap-4" aria-labelledby="h-riscos">
      <h3 id="h-riscos">Riscos ({edital.riscos.length})</h3>
      {criticosAbertos > 0 ? (
        <p role="status">
          {criticosAbertos} risco(s) crítico(s) sem aceite: recomendação limitada a Condicional.
        </p>
      ) : null}
      {edital.riscos.length === 0 ? <p>Nenhum risco mapeado.</p> : null}
      <ul className="flex flex-col gap-4">
        {edital.riscos.map((r) => (
          <li key={r.id} className="flex flex-col gap-2" data-ativo={ativo === r.id ? 'true' : undefined} data-severidade={r.severidade}>
            <div className="flex gap-2 flex-wrap">
              <span>{rotulo('tipoRisco', r.tipo)}</span>
              <span>{rotulo('severidade', r.severidade)}</span>
              <span>Prob. {rotulo('probabilidade', r.probabilidade)}</span>
              {r.trechoOrigem ? (
                <button type="button" onClick={() => onSelecionar(r.id)}>
                  ver no texto
                </button>
              ) : null}
            </div>
            <p>{r.titulo}</p>
            <div className="flex gap-4 flex-wrap">
              <label className="flex gap-1">
                Severidade
                <select value={r.severidade} onChange={(e) => dispatch(acoes.atualizarRisco(r.id, { severidade: e.target.value }))}>
                  {Severidade.valores.map((s) => (
                    <option key={s} value={s}>
                      {rotulo('severidade', s)}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex gap-1">
                Probabilidade
                <select value={r.probabilidade} onChange={(e) => dispatch(acoes.atualizarRisco(r.id, { probabilidade: e.target.value }))}>
                  {Probabilidade.valores.map((p) => (
                    <option key={p} value={p}>
                      {rotulo('probabilidade', p)}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex gap-1">
                Impacto (R$)
                <input
                  inputMode="decimal"
                  value={r.impactoEstimado ? (r.impactoEstimado / 100).toFixed(2).replace('.', ',') : ''}
                  placeholder={formatarMoeda(0)}
                  onChange={(e) => {
                    const n = Number(e.target.value.replace(/\./g, '').replace(',', '.'));
                    dispatch(acoes.atualizarRisco(r.id, { impactoEstimado: Number.isFinite(n) ? Math.round(n * 100) : 0 }));
                  }}
                />
              </label>
              <label className="flex gap-1">
                <input type="checkbox" checked={r.aceito} onChange={(e) => dispatch(acoes.atualizarRisco(r.id, { aceito: e.target.checked }))} />
                Aceito
              </label>
              <button type="button" onClick={() => dispatch(acoes.removerRisco(r.id))}>
                remover
              </button>
            </div>
            <label className="flex flex-col gap-1">
              Mitigação
              <input value={r.mitigacao} onChange={(e) => dispatch(acoes.atualizarRisco(r.id, { mitigacao: e.target.value }))} />
            </label>
          </li>
        ))}
      </ul>

      <form className="flex flex-wrap gap-2 items-end" onSubmit={adicionar}>
        <label className="flex flex-col gap-1 flex-1">
          Novo risco
          <input value={novo.titulo} onChange={(e) => setNovo({ ...novo, titulo: e.target.value })} />
        </label>
        <label className="flex flex-col gap-1">
          Tipo
          <select value={novo.tipo} onChange={(e) => setNovo({ ...novo, tipo: e.target.value })}>
            {TipoRisco.valores.map((t) => (
              <option key={t} value={t}>
                {rotulo('tipoRisco', t)}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          Severidade
          <select value={novo.severidade} onChange={(e) => setNovo({ ...novo, severidade: e.target.value })}>
            {Severidade.valores.map((s) => (
              <option key={s} value={s}>
                {rotulo('severidade', s)}
              </option>
            ))}
          </select>
        </label>
        <button type="submit">Adicionar</button>
      </form>
    </section>
  );
}
