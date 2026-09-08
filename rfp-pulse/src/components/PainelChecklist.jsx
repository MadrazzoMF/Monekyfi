import { useState } from 'react';
import { TipoChecklist, Criticidade } from '../domain/enums.js';
import { rotulo, formatarData, formatarDiasRestantes } from '../lib/formatos.js';
import { calcularDiasRestantes } from '../lib/datas.js';
import { acoes } from '../state/acoes.js';
import { useAppDispatch, useUsuarios } from '../state/hooks.js';

const hojeIso = () => new Date().toISOString().slice(0, 10);

export function PainelChecklist({ edital }) {
  const dispatch = useAppDispatch();
  const usuarios = useUsuarios();
  const [novo, setNovo] = useState({ titulo: '', tipo: 'documento', criticidade: 'media', dataLimite: '' });
  const hoje = hojeIso();

  const pendentes = edital.checklist.filter((i) => !i.concluido).length;

  const adicionar = (e) => {
    e.preventDefault();
    if (!novo.titulo.trim()) return;
    dispatch(acoes.adicionarItemChecklist({ editalId: edital.id, ...novo, titulo: novo.titulo.trim(), dataLimite: novo.dataLimite || null }));
    setNovo({ ...novo, titulo: '', dataLimite: '' });
  };

  return (
    <section className="flex flex-col gap-4" aria-labelledby="h-checklist">
      <h3 id="h-checklist">
        Checklist ({pendentes} pendentes de {edital.checklist.length})
      </h3>
      {edital.checklist.length === 0 ? <p>Nenhum item.</p> : null}
      <ul className="flex flex-col gap-2">
        {edital.checklist.map((i) => {
          const dias = calcularDiasRestantes(i.dataLimite, hoje);
          return (
            <li key={i.id} className="flex flex-wrap gap-2 items-center" data-concluido={i.concluido ? 'true' : undefined} data-criticidade={i.criticidade}>
              <input
                type="checkbox"
                id={`ck-${i.id}`}
                checked={i.concluido}
                onChange={(e) => dispatch(acoes.atualizarItemChecklist(i.id, { concluido: e.target.checked }))}
              />
              <label htmlFor={`ck-${i.id}`}>{i.titulo}</label>
              <span>{rotulo('tipoChecklist', i.tipo)}</span>
              <span>{rotulo('criticidade', i.criticidade)}</span>
              <span>
                {formatarData(i.dataLimite)}
                {i.dataLimite && !i.concluido ? ` (${formatarDiasRestantes(dias)})` : ''}
              </span>
              <select
                aria-label="Responsável"
                value={i.responsavelId ?? ''}
                onChange={(e) => dispatch(acoes.atualizarItemChecklist(i.id, { responsavelId: e.target.value || null }))}
              >
                <option value="">sem responsável</option>
                {usuarios.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.nome}
                  </option>
                ))}
              </select>
              <button type="button" onClick={() => dispatch(acoes.removerItemChecklist(i.id))}>
                remover
              </button>
            </li>
          );
        })}
      </ul>

      <form className="flex flex-wrap gap-2 items-end" onSubmit={adicionar}>
        <label className="flex flex-col gap-1 flex-1">
          Novo item
          <input value={novo.titulo} onChange={(e) => setNovo({ ...novo, titulo: e.target.value })} />
        </label>
        <label className="flex flex-col gap-1">
          Tipo
          <select value={novo.tipo} onChange={(e) => setNovo({ ...novo, tipo: e.target.value })}>
            {TipoChecklist.valores.map((t) => (
              <option key={t} value={t}>
                {rotulo('tipoChecklist', t)}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          Criticidade
          <select value={novo.criticidade} onChange={(e) => setNovo({ ...novo, criticidade: e.target.value })}>
            {Criticidade.valores.map((c) => (
              <option key={c} value={c}>
                {rotulo('criticidade', c)}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          Data limite
          <input type="date" value={novo.dataLimite} onChange={(e) => setNovo({ ...novo, dataLimite: e.target.value })} />
        </label>
        <button type="submit">Adicionar</button>
      </form>
    </section>
  );
}
