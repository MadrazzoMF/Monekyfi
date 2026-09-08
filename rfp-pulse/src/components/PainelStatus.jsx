import { Fragment, useState } from 'react';
import { transicoesPossiveis, STATUS_TERMINAIS } from '../domain/maquinaEstados.js';
import { rotulo, formatarDataHora } from '../lib/formatos.js';
import { acoes } from '../state/acoes.js';
import { useAppDispatch, useAppState, useUsuarioAtual } from '../state/hooks.js';
import { BadgeStatus } from './ui/Badge.jsx';
import { Campo } from './ui/Campo.jsx';
import { Icone } from './ui/Icone.jsx';
import { useToast } from './ui/Toast.jsx';

const FLUXO = ['importado', 'em_analise', 'triado', 'em_aprovacao', 'aprovado', 'proposta_enviada'];
const CLASSE_DESTINO = { descartado: 'btn-danger', reprovado: 'btn-danger', aprovado: 'btn-success', proposta_enviada: 'btn-success' };
const ICONE_DESTINO = { descartado: 'x', reprovado: 'x', aprovado: 'check', proposta_enviada: 'seta' };

export function PainelStatus({ edital }) {
  const dispatch = useAppDispatch();
  const state = useAppState();
  const usuario = useUsuarioAtual();
  const toast = useToast();
  const [comentario, setComentario] = useState('');
  const destinos = transicoesPossiveis(edital.status);
  const terminalFora = STATUS_TERMINAIS.includes(edital.status) && !FLUXO.includes(edital.status);
  const posicao = FLUXO.indexOf(edital.status);
  const ultimoFluxo = terminalFora ? edital.historico.at(-1)?.deStatus : null;
  const posicaoRef = terminalFora ? FLUXO.indexOf(ultimoFluxo) : posicao;

  const transicionar = (para) => {
    dispatch(acoes.transicionarStatus(edital.id, para, { usuarioId: usuario?.id, comentario }));
    setComentario('');
    toast.ok(`Status alterado para ${rotulo('status', para)}`);
  };

  return (
    <section className="flex flex-col gap-5" aria-labelledby="h-status">
      <h3 id="h-status">Fluxo de aprovação</h3>

      <ol className="flex flex-nowrap items-center gap-1.5 overflow-x-auto pb-1" aria-label="Etapas">
        {FLUXO.map((s, i) => {
          const feito = posicaoRef > i || (terminalFora && posicaoRef === i);
          const atual = !terminalFora && s === edital.status;
          return (
            <Fragment key={s}>
              {i > 0 ? <li aria-hidden="true" className="step-linha" data-feito={posicaoRef >= i ? 'true' : undefined} /> : null}
              <li className="step" data-estado={atual ? 'atual' : feito ? 'feito' : undefined}>
                <span className="step-dot">{feito ? <Icone nome="check" tamanho={12} strokeWidth={2.5} /> : i + 1}</span>
                <span className="whitespace-nowrap">{rotulo('status', s)}</span>
              </li>
            </Fragment>
          );
        })}
        {terminalFora ? (
          <>
            <li aria-hidden="true" className="step-linha" />
            <li className="step" data-estado="terminal"><span className="step-dot"><Icone nome="x" tamanho={12} strokeWidth={2.5} /></span>{rotulo('status', edital.status)}</li>
          </>
        ) : null}
      </ol>

      <div className="item !bg-raised">
        <div className="flex items-center gap-2 text-sm text-ink-muted">Status atual <BadgeStatus valor={edital.status} /></div>
        {destinos.length === 0 ? (
          <p className="text-sm text-ink-faint">Status final. Nenhuma transição disponível.</p>
        ) : (
          <>
            <Campo rotulo="Comentário (fica registrado no histórico)">
              <input className="input" value={comentario} onChange={(e) => setComentario(e.target.value)} placeholder="motivo, ressalvas, condições" />
            </Campo>
            <div className="flex flex-wrap gap-2">
              {destinos.map((d) => (
                <button key={d} type="button" className={CLASSE_DESTINO[d] ?? 'btn-primary'} data-destino={d} onClick={() => transicionar(d)} disabled={!usuario}>
                  <Icone nome={ICONE_DESTINO[d] ?? 'seta'} tamanho={15} /> {rotulo('status', d)}
                </button>
              ))}
            </div>
            {!usuario ? <p className="aviso-atencao !py-1.5 text-xs"><Icone nome="usuario" tamanho={14} className="mt-0.5" />Selecione o usuário atual na barra lateral para transicionar.</p> : null}
          </>
        )}
      </div>

      <div>
        <h4 className="mb-3 text-ink-muted">Histórico</h4>
        {edital.historico.length === 0 ? <p className="text-sm text-ink-faint">Sem registros.</p> : null}
        <ol className="relative flex flex-col gap-3 border-l border-line pl-5">
          {[...edital.historico].reverse().map((h, idx) => (
            <li key={h.id} className="relative text-sm animate-entrar" style={{ animationDelay: `${idx * 30}ms` }}>
              <span aria-hidden="true" className={`absolute -left-[1.55rem] top-1 h-2.5 w-2.5 rounded-full ring-4 ring-surface ${idx === 0 ? 'bg-accent' : 'bg-line-strong'}`} />
              <div className="flex flex-wrap items-center gap-1.5">
                <BadgeStatus valor={h.deStatus} /> <Icone nome="seta" tamanho={12} className="text-ink-faint" /> <BadgeStatus valor={h.paraStatus} />
              </div>
              <div className="mt-1 text-xs text-ink-muted">
                {state.usuarios.porId[h.usuarioId]?.nome ?? h.usuarioId} · <time dateTime={h.timestamp}>{formatarDataHora(h.timestamp)}</time>
              </div>
              {h.comentario ? <p className="mt-1 text-ink-muted border-l-2 border-line pl-2 italic">“{h.comentario}”</p> : null}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
