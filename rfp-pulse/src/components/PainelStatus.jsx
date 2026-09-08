import { useState } from 'react';
import { transicoesPossiveis, STATUS_TERMINAIS } from '../domain/maquinaEstados.js';
import { StatusEdital } from '../domain/enums.js';
import { rotulo, formatarDataHora } from '../lib/formatos.js';
import { acoes } from '../state/acoes.js';
import { useAppDispatch, useAppState, useUsuarioAtual } from '../state/hooks.js';
import { BadgeStatus } from './ui/Badge.jsx';
import { Campo } from './ui/Campo.jsx';

const FLUXO = ['importado', 'em_analise', 'triado', 'em_aprovacao', 'aprovado', 'proposta_enviada'];
const CLASSE_DESTINO = { descartado: 'btn-danger', reprovado: 'btn-danger' };

export function PainelStatus({ edital }) {
  const dispatch = useAppDispatch();
  const state = useAppState();
  const usuario = useUsuarioAtual();
  const [comentario, setComentario] = useState('');
  const destinos = transicoesPossiveis(edital.status);
  const terminal = STATUS_TERMINAIS.includes(edital.status);
  const posicao = FLUXO.indexOf(edital.status);

  const transicionar = (para) => {
    dispatch(acoes.transicionarStatus(edital.id, para, { usuarioId: usuario?.id, comentario }));
    setComentario('');
  };

  return (
    <section className="flex flex-col gap-5" aria-labelledby="h-status">
      <h3 id="h-status">Fluxo de aprovação</h3>

      <ol className="flex flex-wrap gap-1 text-xs" aria-label="Etapas">
        {FLUXO.map((s, i) => {
          const feito = posicao > i;
          const atual = s === edital.status;
          return (
            <li key={s} className={`flex items-center gap-1 rounded-full px-2.5 py-1 ${atual ? 'bg-brand-600 text-white font-semibold' : feito ? 'bg-go-soft text-go-ink' : 'bg-surface-sunken text-ink-faint'}`}>
              <span aria-hidden="true">{feito ? '✓' : i + 1}</span> {rotulo('status', s)}
            </li>
          );
        })}
        {terminal && !FLUXO.includes(edital.status) ? (
          <li className="rounded-full px-2.5 py-1 bg-nogo-soft text-nogo-ink font-semibold">{rotulo('status', edital.status)}</li>
        ) : null}
      </ol>

      <div className="item">
        <div className="flex items-center gap-2 text-sm">
          Status atual: <BadgeStatus valor={edital.status} />
        </div>
        {destinos.length === 0 ? (
          <p className="text-sm text-ink-muted">Status final. Nenhuma transição disponível.</p>
        ) : (
          <>
            <Campo rotulo="Comentário (fica no histórico)">
              <input className="input" value={comentario} onChange={(e) => setComentario(e.target.value)} placeholder="motivo, ressalvas, condições" />
            </Campo>
            <div className="flex gap-2 flex-wrap">
              {destinos.map((d) => (
                <button key={d} type="button" className={CLASSE_DESTINO[d] ?? 'btn-primary'} data-destino={d} onClick={() => transicionar(d)} disabled={!usuario}>
                  {rotulo('status', d)}
                </button>
              ))}
            </div>
            {!usuario ? <p className="aviso-atencao">Selecione o usuário atual no topo da página para transicionar.</p> : null}
          </>
        )}
      </div>

      <div>
        <h4 className="mb-2">Histórico</h4>
        {edital.historico.length === 0 ? <p className="text-sm text-ink-muted">Sem registros.</p> : null}
        <ol className="flex flex-col gap-2 border-l-2 border-line pl-4">
          {[...edital.historico].reverse().map((h) => (
            <li key={h.id} className="relative text-sm">
              <span aria-hidden="true" className="absolute -left-[1.35rem] top-1.5 h-2.5 w-2.5 rounded-full bg-brand-500 ring-2 ring-surface-raised" />
              <div className="flex flex-wrap items-center gap-1.5">
                <BadgeStatus valor={h.deStatus} /> <span className="text-ink-faint">→</span> <BadgeStatus valor={h.paraStatus} />
                <span className="text-ink-muted text-xs">· {state.usuarios.porId[h.usuarioId]?.nome ?? h.usuarioId} · <time dateTime={h.timestamp}>{formatarDataHora(h.timestamp)}</time></span>
              </div>
              {h.comentario ? <p className="text-ink-muted mt-0.5">“{h.comentario}”</p> : null}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
