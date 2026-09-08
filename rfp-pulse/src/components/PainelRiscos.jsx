import { useState } from 'react';
import { TipoRisco, Severidade, Probabilidade } from '../domain/enums.js';
import { rotulo, formatarMoeda } from '../lib/formatos.js';
import { acoes } from '../state/acoes.js';
import { useAppDispatch } from '../state/hooks.js';
import { BadgeOutline, BadgeSeveridade } from './ui/Badge.jsx';
import { Campo } from './ui/Campo.jsx';
import { Segmentado } from './ui/Segmentado.jsx';
import { Icone } from './ui/Icone.jsx';

const OPCOES_SEV = [
  { valor: 'critico', rotulo: 'Crítico', tom: 'nogo' },
  { valor: 'alto', rotulo: 'Alto', tom: 'cond' },
  { valor: 'medio', rotulo: 'Médio' },
  { valor: 'baixo', rotulo: 'Baixo' },
];
const OPCOES_PROB = [
  { valor: 'alta', rotulo: 'Alta', tom: 'nogo' },
  { valor: 'media', rotulo: 'Média', tom: 'cond' },
  { valor: 'baixa', rotulo: 'Baixa' },
];
const ORDEM_SEV = { critico: 0, alto: 1, medio: 2, baixo: 3 };

export function PainelRiscos({ edital, ativo, onSelecionar }) {
  const dispatch = useAppDispatch();
  const [novo, setNovo] = useState({ titulo: '', tipo: 'operacional', severidade: 'medio', probabilidade: 'media' });

  const criticosAbertos = edital.riscos.filter((r) => r.severidade === 'critico' && !r.aceito).length;
  const exposicao = edital.riscos.filter((r) => !r.aceito).reduce((s, r) => s + (r.impactoEstimado || 0), 0);
  const ordenados = [...edital.riscos].sort((a, b) => a.aceito - b.aceito || ORDEM_SEV[a.severidade] - ORDEM_SEV[b.severidade]);

  const adicionar = (e) => {
    e.preventDefault();
    if (!novo.titulo.trim()) return;
    dispatch(acoes.adicionarRisco({ editalId: edital.id, ...novo, titulo: novo.titulo.trim() }));
    setNovo({ ...novo, titulo: '' });
  };

  return (
    <section className="flex flex-col gap-4" aria-labelledby="h-riscos">
      <div className="flex items-center justify-between gap-4">
        <h3 id="h-riscos">Riscos</h3>
        <span className="text-xs text-ink-muted">exposição não aceita <strong className="text-ink tabular-nums">{formatarMoeda(exposicao)}</strong></span>
      </div>
      {criticosAbertos > 0 ? <p role="status" className="aviso-atencao"><Icone nome="alerta" className="mt-0.5" /><span>{criticosAbertos} risco(s) crítico(s) sem aceite formal. A recomendação fica limitada a <strong>Condicional</strong> até o aceite.</span></p> : null}
      {edital.riscos.length === 0 ? <p className="text-sm text-ink-faint">Nenhum risco mapeado.</p> : null}
      <ul className="flex flex-col gap-2.5">
        {ordenados.map((r) => (
          <li key={r.id} className="item" data-ativo={ativo === r.id ? 'true' : undefined} data-concluido={r.aceito ? 'true' : undefined}>
            <div className="flex flex-wrap items-center gap-1.5">
              <BadgeSeveridade valor={r.severidade} />
              <BadgeOutline>{rotulo('tipoRisco', r.tipo)}</BadgeOutline>
              {r.aceito ? <BadgeOutline>aceito</BadgeOutline> : null}
              <span className="flex-1" />
              {r.trechoOrigem ? <button type="button" className="btn-link inline-flex items-center gap-1" onClick={() => onSelecionar(r.id)}><Icone nome="olho" tamanho={13} /> no texto</button> : null}
              <button type="button" className="btn-icon !p-1 hover:!text-nogo" onClick={() => dispatch(acoes.removerRisco(r.id))} aria-label="Remover risco"><Icone nome="lixo" tamanho={14} /></button>
            </div>
            <p className="item-titulo text-sm font-medium leading-snug">{r.titulo}</p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <div className="flex items-center gap-2 text-xs text-ink-muted">Severidade <Segmentado rotulo="Severidade" valor={r.severidade} opcoes={OPCOES_SEV} onChange={(severidade) => dispatch(acoes.atualizarRisco(r.id, { severidade }))} /></div>
              <div className="flex items-center gap-2 text-xs text-ink-muted">Probabilidade <Segmentado rotulo="Probabilidade" valor={r.probabilidade} opcoes={OPCOES_PROB} onChange={(probabilidade) => dispatch(acoes.atualizarRisco(r.id, { probabilidade }))} /></div>
            </div>
            <div className="grid gap-2 sm:grid-cols-[10rem_1fr_auto] items-end">
              <Campo rotulo="Impacto (R$)">
                <input className="input input-sm" inputMode="decimal"
                  value={r.impactoEstimado ? (r.impactoEstimado / 100).toFixed(2).replace('.', ',') : ''} placeholder="0,00"
                  onChange={(e) => { const n = Number(e.target.value.replace(/\./g, '').replace(',', '.')); dispatch(acoes.atualizarRisco(r.id, { impactoEstimado: Number.isFinite(n) ? Math.round(n * 100) : 0 })); }} />
              </Campo>
              <Campo rotulo="Mitigação"><input className="input input-sm" value={r.mitigacao} placeholder="como reduzir ou contornar" onChange={(e) => dispatch(acoes.atualizarRisco(r.id, { mitigacao: e.target.value }))} /></Campo>
              <button type="button" className={`${r.aceito ? 'btn-secondary' : 'btn-success'} btn-sm`} onClick={() => dispatch(acoes.atualizarRisco(r.id, { aceito: !r.aceito }))}>
                <Icone nome={r.aceito ? 'x' : 'check'} tamanho={14} /> {r.aceito ? 'Desfazer aceite' : 'Aceitar risco'}
              </button>
            </div>
          </li>
        ))}
      </ul>

      <form className="item-add grid gap-2 sm:grid-cols-[1fr_auto_auto_auto] items-end" onSubmit={adicionar}>
        <Campo rotulo="Novo risco"><input className="input input-sm" value={novo.titulo} onChange={(e) => setNovo({ ...novo, titulo: e.target.value })} placeholder="descreva o risco" /></Campo>
        <Campo rotulo="Tipo">
          <select className="select select-sm" value={novo.tipo} onChange={(e) => setNovo({ ...novo, tipo: e.target.value })}>
            {TipoRisco.valores.map((t) => <option key={t} value={t}>{rotulo('tipoRisco', t)}</option>)}
          </select>
        </Campo>
        <Campo rotulo="Severidade">
          <select className="select select-sm" value={novo.severidade} onChange={(e) => setNovo({ ...novo, severidade: e.target.value })}>
            {Severidade.valores.map((s) => <option key={s} value={s}>{rotulo('severidade', s)}</option>)}
          </select>
        </Campo>
        <button type="submit" className="btn-secondary btn-sm"><Icone nome="mais" tamanho={14} /> Adicionar</button>
      </form>
    </section>
  );
}
