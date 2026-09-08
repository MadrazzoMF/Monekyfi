import { useState } from 'react';
import { transicoesPossiveis } from '../domain/maquinaEstados.js';
import { rotulo, formatarDataHora } from '../lib/formatos.js';
import { acoes } from '../state/acoes.js';
import { useAppDispatch, useAppState, useUsuarioAtual } from '../state/hooks.js';

export function PainelStatus({ edital }) {
  const dispatch = useAppDispatch();
  const state = useAppState();
  const usuario = useUsuarioAtual();
  const [comentario, setComentario] = useState('');
  const destinos = transicoesPossiveis(edital.status);

  const transicionar = (para) => {
    dispatch(acoes.transicionarStatus(edital.id, para, { usuarioId: usuario?.id, comentario }));
    setComentario('');
  };

  return (
    <section className="flex flex-col gap-4" aria-labelledby="h-status">
      <h3 id="h-status">Fluxo de aprovação</h3>
      <p>
        Status atual: <strong>{rotulo('status', edital.status)}</strong>
      </p>

      {destinos.length === 0 ? (
        <p>Status final. Nenhuma transição disponível.</p>
      ) : (
        <div className="flex flex-col gap-2">
          <label className="flex flex-col gap-1">
            Comentário (opcional)
            <input value={comentario} onChange={(e) => setComentario(e.target.value)} />
          </label>
          <div className="flex gap-2 flex-wrap">
            {destinos.map((d) => (
              <button key={d} type="button" data-destino={d} onClick={() => transicionar(d)} disabled={!usuario}>
                Mover para {rotulo('status', d)}
              </button>
            ))}
          </div>
          {!usuario ? <p>Selecione um usuário atual para transicionar.</p> : null}
        </div>
      )}

      <h4>Histórico</h4>
      {edital.historico.length === 0 ? <p>Sem registros.</p> : null}
      <ol className="flex flex-col gap-2">
        {edital.historico.map((h) => (
          <li key={h.id}>
            <time dateTime={h.timestamp}>{formatarDataHora(h.timestamp)}</time> · {rotulo('status', h.deStatus)} → {rotulo('status', h.paraStatus)} ·{' '}
            {state.usuarios.porId[h.usuarioId]?.nome ?? h.usuarioId}
            {h.comentario ? <div>“{h.comentario}”</div> : null}
          </li>
        ))}
      </ol>
    </section>
  );
}
