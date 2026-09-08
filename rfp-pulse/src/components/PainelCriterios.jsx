import { useState } from 'react';
import { CategoriaCriterio, SituacaoCriterio } from '../domain/enums.js';
import { rotulo } from '../lib/formatos.js';
import { acoes } from '../state/acoes.js';
import { useAppDispatch } from '../state/hooks.js';

export function PainelCriterios({ edital, ativo, onSelecionar }) {
  const dispatch = useAppDispatch();
  const [novo, setNovo] = useState({ categoria: 'tecnica', descricao: '', obrigatorio: true, peso: 3 });

  const adicionar = (e) => {
    e.preventDefault();
    if (!novo.descricao.trim()) return;
    dispatch(acoes.adicionarCriterio({ editalId: edital.id, ...novo, peso: Number(novo.peso), descricao: novo.descricao.trim() }));
    setNovo({ ...novo, descricao: '' });
  };

  return (
    <section className="flex flex-col gap-4" aria-labelledby="h-criterios">
      <h3 id="h-criterios">Critérios de elegibilidade ({edital.criterios.length})</h3>
      {edital.criterios.length === 0 ? <p>Nenhum critério cadastrado.</p> : null}
      <ul className="flex flex-col gap-4">
        {edital.criterios.map((c) => (
          <li
            key={c.id}
            data-ativo={ativo === c.id ? 'true' : undefined}
            data-eliminatorio={c.obrigatorio && c.situacao === 'nao_atende' ? 'true' : undefined}
            className="flex flex-col gap-2"
          >
            <div className="flex gap-2 flex-wrap">
              <span>{rotulo('categoria', c.categoria)}</span>
              <span>{c.obrigatorio ? 'Obrigatório' : 'Desejável'}</span>
              <span>Peso {c.peso}</span>
              {c.trechoOrigem ? (
                <button type="button" onClick={() => onSelecionar(c.id)}>
                  ver no texto
                </button>
              ) : null}
            </div>
            <p>{c.descricao}</p>
            {c.obrigatorio && c.situacao === 'nao_atende' ? (
              <p role="status">Critério eliminatório: força NO-GO.</p>
            ) : null}
            <div className="flex gap-4 flex-wrap">
              <label className="flex gap-1">
                Situação
                <select
                  value={c.situacao}
                  onChange={(e) => dispatch(acoes.atualizarCriterio(c.id, { situacao: e.target.value }))}
                >
                  {SituacaoCriterio.valores.map((s) => (
                    <option key={s} value={s}>
                      {rotulo('situacao', s)}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex gap-1">
                Peso
                <select
                  value={c.peso}
                  onChange={(e) => dispatch(acoes.atualizarCriterio(c.id, { peso: Number(e.target.value) }))}
                >
                  {[1, 2, 3, 4, 5].map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex gap-1">
                <input
                  type="checkbox"
                  checked={c.obrigatorio}
                  onChange={(e) => dispatch(acoes.atualizarCriterio(c.id, { obrigatorio: e.target.checked }))}
                />
                Obrigatório
              </label>
              <button type="button" onClick={() => dispatch(acoes.removerCriterio(c.id))}>
                remover
              </button>
            </div>
            <label className="flex flex-col gap-1">
              Evidência
              <input
                value={c.evidencia}
                placeholder="documento, certidão, atestado que comprova"
                onChange={(e) => dispatch(acoes.atualizarCriterio(c.id, { evidencia: e.target.value }))}
              />
            </label>
            <label className="flex flex-col gap-1">
              Nota interna
              <input
                value={c.notaInterna}
                onChange={(e) => dispatch(acoes.atualizarCriterio(c.id, { notaInterna: e.target.value }))}
              />
            </label>
          </li>
        ))}
      </ul>

      <form className="flex flex-wrap gap-2 items-end" onSubmit={adicionar}>
        <label className="flex flex-col gap-1">
          Categoria
          <select value={novo.categoria} onChange={(e) => setNovo({ ...novo, categoria: e.target.value })}>
            {CategoriaCriterio.valores.map((c) => (
              <option key={c} value={c}>
                {rotulo('categoria', c)}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 flex-1">
          Novo critério
          <input value={novo.descricao} onChange={(e) => setNovo({ ...novo, descricao: e.target.value })} />
        </label>
        <label className="flex gap-1">
          <input type="checkbox" checked={novo.obrigatorio} onChange={(e) => setNovo({ ...novo, obrigatorio: e.target.checked })} />
          Obrigatório
        </label>
        <button type="submit">Adicionar</button>
      </form>
    </section>
  );
}
