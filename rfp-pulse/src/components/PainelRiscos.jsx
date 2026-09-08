import { useState } from 'react';
import { TipoRisco, Severidade, Probabilidade } from '../domain/enums.js';
import { rotulo, formatarMoeda } from '../lib/formatos.js';
import { acoes } from '../state/acoes.js';
import { useAppDispatch } from '../state/hooks.js';
import { BadgeOutline, BadgeSeveridade } from './ui/Badge.jsx';
import { Campo } from './ui/Campo.jsx';

export function PainelRiscos({ edital, ativo, onSelecionar }) {
  const dispatch = useAppDispatch();
  const [novo, setNovo] = useState({ titulo: '', tipo: 'operacional', severidade: 'medio', probabilidade: 'media' });

  const criticosAbertos = edital.riscos.filter((r) => r.severidade === 'critico' && !r.aceito).length;
  const exposicao = edital.riscos.filter((r) => !r.aceito).reduce((s, r) => s + (r.impactoEstimado || 0), 0);

  const adicionar = (e) => {
    e.preventDefault();
    if (!novo.titulo.trim()) return;
    dispatch(acoes.adicionarRisco({ editalId: edital.id, ...novo, titulo: novo.titulo.trim() }));
    setNovo({ ...novo, titulo: '' });
  };

  return (
    <section className="flex flex-col gap-4" aria-labelledby="h-riscos">
      <div className="flex items-baseline justify-between">
        <h3 id="h-riscos">Riscos</h3>
        <span className="text-xs text-ink-muted">exposição não aceita: {formatarMoeda(exposicao)}</span>
      </div>
      {criticosAbertos > 0 ? (
        <p role="status" className="aviso-atencao">{criticosAbertos} risco(s) crítico(s) sem aceite formal: a recomendação fica limitada a Condicional.</p>
      ) : null}
      {edital.riscos.length === 0 ? <p className="text-sm text-ink-muted">Nenhum risco mapeado.</p> : null}
      <ul className="flex flex-col gap-3">
        {edital.riscos.map((r) => (
          <li key={r.id} className="item" data-ativo={ativo === r.id ? 'true' : undefined} data-severidade={r.severidade}>
            <div className="flex flex-wrap items-center gap-1.5">
              <BadgeOutline>{rotulo('tipoRisco', r.tipo)}</BadgeOutline>
              <BadgeSeveridade valor={r.severidade} />
              <BadgeOutline>prob. {rotulo('probabilidade', r.probabilidade)}</BadgeOutline>
              {r.aceito ? <BadgeOutline>aceito</BadgeOutline> : null}
              <span className="flex-1" />
              {r.trechoOrigem ? <button type="button" className="btn-link" onClick={() => onSelecionar(r.id)}>ver no texto</button> : null}
              <button type="button" className="btn-link !text-nogo" onClick={() => dispatch(acoes.removerRisco(r.id))}>remover</button>
            </div>
            <p className="text-sm font-medium">{r.titulo}</p>
            <div className="grid gap-2 sm:grid-cols-[auto_auto_1fr_auto] items-end">
              <Campo rotulo="Severidade">
                <select className="select" value={r.severidade} onChange={(e) => dispatch(acoes.atualizarRisco(r.id, { severidade: e.target.value }))}>
                  {Severidade.valores.map((s) => <option key={s} value={s}>{rotulo('severidade', s)}</option>)}
                </select>
              </Campo>
              <Campo rotulo="Probabilidade">
                <select className="select" value={r.probabilidade} onChange={(e) => dispatch(acoes.atualizarRisco(r.id, { probabilidade: e.target.value }))}>
                  {Probabilidade.valores.map((p) => <option key={p} value={p}>{rotulo('probabilidade', p)}</option>)}
                </select>
              </Campo>
              <Campo rotulo="Impacto estimado (R$)">
                <input className="input" inputMode="decimal"
                  value={r.impactoEstimado ? (r.impactoEstimado / 100).toFixed(2).replace('.', ',') : ''}
                  placeholder="0,00"
                  onChange={(e) => {
                    const n = Number(e.target.value.replace(/\./g, '').replace(',', '.'));
                    dispatch(acoes.atualizarRisco(r.id, { impactoEstimado: Number.isFinite(n) ? Math.round(n * 100) : 0 }));
                  }} />
              </Campo>
              <label className="flex items-center gap-2 text-sm py-2">
                <input type="checkbox" className="checkbox" checked={r.aceito} onChange={(e) => dispatch(acoes.atualizarRisco(r.id, { aceito: e.target.checked }))} />
                Aceito
              </label>
            </div>
            <Campo rotulo="Mitigação"><input className="input" value={r.mitigacao} placeholder="como reduzir ou contornar" onChange={(e) => dispatch(acoes.atualizarRisco(r.id, { mitigacao: e.target.value }))} /></Campo>
          </li>
        ))}
      </ul>

      <form className="rounded-lg border border-dashed border-line p-3 grid gap-2 sm:grid-cols-[1fr_auto_auto_auto] items-end" onSubmit={adicionar}>
        <Campo rotulo="Novo risco"><input className="input" value={novo.titulo} onChange={(e) => setNovo({ ...novo, titulo: e.target.value })} placeholder="descreva o risco" /></Campo>
        <Campo rotulo="Tipo">
          <select className="select" value={novo.tipo} onChange={(e) => setNovo({ ...novo, tipo: e.target.value })}>
            {TipoRisco.valores.map((t) => <option key={t} value={t}>{rotulo('tipoRisco', t)}</option>)}
          </select>
        </Campo>
        <Campo rotulo="Severidade">
          <select className="select" value={novo.severidade} onChange={(e) => setNovo({ ...novo, severidade: e.target.value })}>
            {Severidade.valores.map((s) => <option key={s} value={s}>{rotulo('severidade', s)}</option>)}
          </select>
        </Campo>
        <button type="submit" className="btn-secondary">Adicionar</button>
      </form>
    </section>
  );
}
