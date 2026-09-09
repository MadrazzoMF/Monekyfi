import { useState } from 'react';
import { TipoChecklist, Criticidade } from '../domain/enums.js';
import { rotulo, formatarData } from '../lib/formatos.js';
import { calcularDiasRestantes } from '../lib/datas.js';
import { acoes } from '../state/acoes.js';
import { useAppDispatch, useUsuarios } from '../state/hooks.js';
import { BadgeOutline, BadgeCriticidade } from './ui/Badge.jsx';
import { Prazo } from './ui/Prazo.jsx';
import { Campo } from './ui/Campo.jsx';
import { Icone } from './ui/Icone.jsx';

const hojeIso = () => new Date().toISOString().slice(0, 10);
const ORDEM_CRIT = { bloqueante: 0, alta: 1, media: 2, baixa: 3 };

export function PainelChecklist({ edital }) {
  const dispatch = useAppDispatch();
  const usuarios = useUsuarios();
  const [novo, setNovo] = useState({ titulo: '', tipo: 'documento', criticidade: 'media', dataLimite: '' });
  const hoje = hojeIso();

  const concluidos = edital.checklist.filter((i) => i.concluido).length;
  const total = edital.checklist.length;
  const pct = total ? Math.round((concluidos / total) * 100) : 0;
  const bloqueantesAbertos = edital.checklist.filter((i) => !i.concluido && i.criticidade === 'bloqueante').length;

  const ordenados = [...edital.checklist].sort((a, b) => a.concluido - b.concluido || ORDEM_CRIT[a.criticidade] - ORDEM_CRIT[b.criticidade] || String(a.dataLimite ?? '9').localeCompare(String(b.dataLimite ?? '9')));

  const adicionar = (e) => {
    e.preventDefault();
    if (!novo.titulo.trim()) return;
    dispatch(acoes.adicionarItemChecklist({ editalId: edital.id, ...novo, titulo: novo.titulo.trim(), dataLimite: novo.dataLimite || null }));
    setNovo({ ...novo, titulo: '', dataLimite: '' });
  };

  return (
    <section className="flex flex-col gap-4" aria-labelledby="h-checklist">
      <div className="flex items-center justify-between gap-4">
        <h3 id="h-checklist">Checklist</h3>
        <span className="text-xs text-ink-muted">{concluidos}/{total} concluídos</span>
      </div>
      {total > 0 ? (
        <div className="flex items-center gap-3">
          <div className="bar" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Progresso do checklist">
            <span className={pct === 100 ? 'bg-go' : 'bg-accent'} style={{ width: `${pct}%` }} />
          </div>
          <span className="text-xs tabular-nums text-ink-muted w-9 text-right">{pct}%</span>
        </div>
      ) : <p className="text-sm text-ink-faint">Nenhum item ainda.</p>}
      {bloqueantesAbertos ? <p className="aviso-atencao !py-1.5 text-xs"><Icone nome="alerta" tamanho={14} className="mt-0.5" />{bloqueantesAbertos} item(ns) bloqueante(s) em aberto.</p> : null}

      <ul className="flex flex-col gap-2">
        {ordenados.map((i) => {
          const dias = calcularDiasRestantes(i.dataLimite, hoje);
          return (
            <li key={i.id} className="item !flex-row flex-wrap items-center gap-x-3 gap-y-2 !py-2.5" data-concluido={i.concluido ? 'true' : undefined}>
              <input type="checkbox" className="checkbox h-[18px] w-[18px]" id={`ck-${i.id}`} checked={i.concluido} onChange={(e) => dispatch(acoes.atualizarItemChecklist(i.id, { concluido: e.target.checked }))} />
              <label htmlFor={`ck-${i.id}`} className="item-titulo min-w-[10rem] flex-1 cursor-pointer text-sm font-medium">{i.titulo}</label>
              <BadgeOutline>{rotulo('tipoChecklist', i.tipo)}</BadgeOutline>
              <BadgeCriticidade valor={i.criticidade} />
              <span className="inline-flex items-center gap-1.5 text-xs whitespace-nowrap">
                <Icone nome="calendario" tamanho={13} className="text-ink-faint" />
                {i.dataLimite ? <>{formatarData(i.dataLimite)} {i.concluido ? null : <Prazo dias={dias} />}</> : <span className="text-ink-faint">sem data</span>}
              </span>
              <select className="select select-sm !w-auto" aria-label="Responsável" value={i.responsavelId ?? ''} onChange={(e) => dispatch(acoes.atualizarItemChecklist(i.id, { responsavelId: e.target.value || null }))}>
                <option value="">sem responsável</option>
                {usuarios.map((u) => <option key={u.id} value={u.id}>{u.nome}</option>)}
              </select>
              <button type="button" className="btn-icon !p-1 hover:!text-nogo" onClick={() => dispatch(acoes.removerItemChecklist(i.id))} aria-label="Remover item"><Icone nome="lixo" tamanho={14} /></button>
            </li>
          );
        })}
      </ul>

      <form className="item-add grid gap-2 sm:grid-cols-[1fr_auto_auto_auto_auto] items-end" onSubmit={adicionar}>
        <Campo rotulo="Novo item"><input className="input input-sm" value={novo.titulo} onChange={(e) => setNovo({ ...novo, titulo: e.target.value })} placeholder="o que precisa ser feito" /></Campo>
        <Campo rotulo="Tipo">
          <select className="select select-sm" value={novo.tipo} onChange={(e) => setNovo({ ...novo, tipo: e.target.value })}>
            {TipoChecklist.valores.map((t) => <option key={t} value={t}>{rotulo('tipoChecklist', t)}</option>)}
          </select>
        </Campo>
        <Campo rotulo="Criticidade">
          <select className="select select-sm" value={novo.criticidade} onChange={(e) => setNovo({ ...novo, criticidade: e.target.value })}>
            {Criticidade.valores.map((c) => <option key={c} value={c}>{rotulo('criticidade', c)}</option>)}
          </select>
        </Campo>
        <Campo rotulo="Data limite"><input className="input input-sm" type="date" value={novo.dataLimite} onChange={(e) => setNovo({ ...novo, dataLimite: e.target.value })} /></Campo>
        <button type="submit" className="btn-secondary btn-sm"><Icone nome="mais" tamanho={14} /> Adicionar</button>
      </form>
    </section>
  );
}
