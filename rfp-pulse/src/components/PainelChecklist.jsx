import { useState } from 'react';
import { TipoChecklist, Criticidade } from '../domain/enums.js';
import { rotulo, formatarData } from '../lib/formatos.js';
import { calcularDiasRestantes } from '../lib/datas.js';
import { acoes } from '../state/acoes.js';
import { useAppDispatch, useUsuarios } from '../state/hooks.js';
import { BadgeOutline, BadgeCriticidade } from './ui/Badge.jsx';
import { Prazo } from './ui/Prazo.jsx';
import { Campo } from './ui/Campo.jsx';

const hojeIso = () => new Date().toISOString().slice(0, 10);

export function PainelChecklist({ edital }) {
  const dispatch = useAppDispatch();
  const usuarios = useUsuarios();
  const [novo, setNovo] = useState({ titulo: '', tipo: 'documento', criticidade: 'media', dataLimite: '' });
  const hoje = hojeIso();

  const concluidos = edital.checklist.filter((i) => i.concluido).length;
  const total = edital.checklist.length;
  const pct = total ? Math.round((concluidos / total) * 100) : 0;

  const adicionar = (e) => {
    e.preventDefault();
    if (!novo.titulo.trim()) return;
    dispatch(acoes.adicionarItemChecklist({ editalId: edital.id, ...novo, titulo: novo.titulo.trim(), dataLimite: novo.dataLimite || null }));
    setNovo({ ...novo, titulo: '', dataLimite: '' });
  };

  return (
    <section className="flex flex-col gap-4" aria-labelledby="h-checklist">
      <div className="flex items-baseline justify-between">
        <h3 id="h-checklist">Checklist</h3>
        <span className="text-xs text-ink-muted">{concluidos} de {total} concluídos</span>
      </div>
      {total > 0 ? (
        <div className="score-bar" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Progresso do checklist">
          <span className="bg-brand-600" style={{ width: `${pct}%` }} />
        </div>
      ) : (
        <p className="text-sm text-ink-muted">Nenhum item.</p>
      )}
      <ul className="flex flex-col gap-2">
        {edital.checklist.map((i) => {
          const dias = calcularDiasRestantes(i.dataLimite, hoje);
          return (
            <li key={i.id} className="item !flex-row flex-wrap items-center gap-x-3" data-concluido={i.concluido ? 'true' : undefined} data-criticidade={i.criticidade}>
              <input type="checkbox" className="checkbox" id={`ck-${i.id}`} checked={i.concluido} onChange={(e) => dispatch(acoes.atualizarItemChecklist(i.id, { concluido: e.target.checked }))} />
              <label htmlFor={`ck-${i.id}`} className="text-sm font-medium flex-1 min-w-[12rem] cursor-pointer">{i.titulo}</label>
              <BadgeOutline>{rotulo('tipoChecklist', i.tipo)}</BadgeOutline>
              <BadgeCriticidade valor={i.criticidade} />
              <span className="text-xs whitespace-nowrap">
                {i.dataLimite ? <>{formatarData(i.dataLimite)} · {i.concluido ? 'ok' : <Prazo dias={dias} />}</> : <span className="text-ink-faint">sem data</span>}
              </span>
              <select className="select !w-auto !py-1 text-xs" aria-label="Responsável" value={i.responsavelId ?? ''} onChange={(e) => dispatch(acoes.atualizarItemChecklist(i.id, { responsavelId: e.target.value || null }))}>
                <option value="">sem responsável</option>
                {usuarios.map((u) => <option key={u.id} value={u.id}>{u.nome}</option>)}
              </select>
              <button type="button" className="btn-link !text-nogo" onClick={() => dispatch(acoes.removerItemChecklist(i.id))}>remover</button>
            </li>
          );
        })}
      </ul>

      <form className="rounded-lg border border-dashed border-line p-3 grid gap-2 sm:grid-cols-[1fr_auto_auto_auto_auto] items-end" onSubmit={adicionar}>
        <Campo rotulo="Novo item"><input className="input" value={novo.titulo} onChange={(e) => setNovo({ ...novo, titulo: e.target.value })} placeholder="o que precisa ser feito" /></Campo>
        <Campo rotulo="Tipo">
          <select className="select" value={novo.tipo} onChange={(e) => setNovo({ ...novo, tipo: e.target.value })}>
            {TipoChecklist.valores.map((t) => <option key={t} value={t}>{rotulo('tipoChecklist', t)}</option>)}
          </select>
        </Campo>
        <Campo rotulo="Criticidade">
          <select className="select" value={novo.criticidade} onChange={(e) => setNovo({ ...novo, criticidade: e.target.value })}>
            {Criticidade.valores.map((c) => <option key={c} value={c}>{rotulo('criticidade', c)}</option>)}
          </select>
        </Campo>
        <Campo rotulo="Data limite"><input className="input" type="date" value={novo.dataLimite} onChange={(e) => setNovo({ ...novo, dataLimite: e.target.value })} /></Campo>
        <button type="submit" className="btn-secondary">Adicionar</button>
      </form>
    </section>
  );
}
