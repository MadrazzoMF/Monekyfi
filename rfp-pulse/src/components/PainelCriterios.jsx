import { useState } from 'react';
import { CategoriaCriterio, SituacaoCriterio } from '../domain/enums.js';
import { rotulo } from '../lib/formatos.js';
import { acoes } from '../state/acoes.js';
import { useAppDispatch } from '../state/hooks.js';
import { BadgeOutline, BadgeSituacao } from './ui/Badge.jsx';
import { Campo } from './ui/Campo.jsx';

export function PainelCriterios({ edital, ativo, onSelecionar }) {
  const dispatch = useAppDispatch();
  const [novo, setNovo] = useState({ categoria: 'tecnica', descricao: '', obrigatorio: true, peso: 3 });

  const adicionar = (e) => {
    e.preventDefault();
    if (!novo.descricao.trim()) return;
    dispatch(acoes.adicionarCriterio({ editalId: edital.id, ...novo, peso: Number(novo.peso), descricao: novo.descricao.trim() }));
    setNovo({ ...novo, descricao: '' });
  };

  const avaliados = edital.criterios.filter((c) => c.situacao !== 'nao_avaliado').length;

  return (
    <section className="flex flex-col gap-4" aria-labelledby="h-criterios">
      <div className="flex items-baseline justify-between">
        <h3 id="h-criterios">Critérios de elegibilidade</h3>
        <span className="text-xs text-ink-muted">{avaliados} de {edital.criterios.length} avaliados</span>
      </div>
      {edital.criterios.length === 0 ? <p className="text-sm text-ink-muted">Nenhum critério cadastrado.</p> : null}
      <ul className="flex flex-col gap-3">
        {edital.criterios.map((c) => {
          const eliminatorio = c.obrigatorio && c.situacao === 'nao_atende';
          return (
            <li key={c.id} className="item" data-ativo={ativo === c.id ? 'true' : undefined} data-eliminatorio={eliminatorio ? 'true' : undefined}>
              <div className="flex flex-wrap items-center gap-1.5">
                <BadgeOutline>{rotulo('categoria', c.categoria)}</BadgeOutline>
                <BadgeOutline>{c.obrigatorio ? 'obrigatório' : 'desejável'}</BadgeOutline>
                <BadgeOutline>peso {c.peso}</BadgeOutline>
                <BadgeSituacao valor={c.situacao} />
                <span className="flex-1" />
                {c.trechoOrigem ? <button type="button" className="btn-link" onClick={() => onSelecionar(c.id)}>ver no texto</button> : null}
                <button type="button" className="btn-link !text-nogo" onClick={() => dispatch(acoes.removerCriterio(c.id))}>remover</button>
              </div>
              <p className="text-sm font-medium">{c.descricao}</p>
              {eliminatorio ? <p role="status" className="aviso-erro !py-1.5 text-xs">Critério eliminatório: força NO-GO independentemente do score.</p> : null}
              <div className="grid gap-2 sm:grid-cols-[1fr_auto_auto] items-end">
                <Campo rotulo="Situação">
                  <select className="select" value={c.situacao} onChange={(e) => dispatch(acoes.atualizarCriterio(c.id, { situacao: e.target.value }))}>
                    {SituacaoCriterio.valores.map((s) => <option key={s} value={s}>{rotulo('situacao', s)}</option>)}
                  </select>
                </Campo>
                <Campo rotulo="Peso">
                  <select className="select" value={c.peso} onChange={(e) => dispatch(acoes.atualizarCriterio(c.id, { peso: Number(e.target.value) }))}>
                    {[1, 2, 3, 4, 5].map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                </Campo>
                <label className="flex items-center gap-2 text-sm py-2">
                  <input type="checkbox" className="checkbox" checked={c.obrigatorio} onChange={(e) => dispatch(acoes.atualizarCriterio(c.id, { obrigatorio: e.target.checked }))} />
                  Obrigatório
                </label>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                <Campo rotulo="Evidência"><input className="input" value={c.evidencia} placeholder="documento que comprova" onChange={(e) => dispatch(acoes.atualizarCriterio(c.id, { evidencia: e.target.value }))} /></Campo>
                <Campo rotulo="Nota interna"><input className="input" value={c.notaInterna} onChange={(e) => dispatch(acoes.atualizarCriterio(c.id, { notaInterna: e.target.value }))} /></Campo>
              </div>
            </li>
          );
        })}
      </ul>

      <form className="rounded-lg border border-dashed border-line p-3 grid gap-2 sm:grid-cols-[auto_1fr_auto_auto] items-end" onSubmit={adicionar}>
        <Campo rotulo="Categoria">
          <select className="select" value={novo.categoria} onChange={(e) => setNovo({ ...novo, categoria: e.target.value })}>
            {CategoriaCriterio.valores.map((c) => <option key={c} value={c}>{rotulo('categoria', c)}</option>)}
          </select>
        </Campo>
        <Campo rotulo="Novo critério"><input className="input" value={novo.descricao} onChange={(e) => setNovo({ ...novo, descricao: e.target.value })} placeholder="descreva a exigência" /></Campo>
        <label className="flex items-center gap-2 text-sm py-2">
          <input type="checkbox" className="checkbox" checked={novo.obrigatorio} onChange={(e) => setNovo({ ...novo, obrigatorio: e.target.checked })} />
          Obrigatório
        </label>
        <button type="submit" className="btn-secondary">Adicionar</button>
      </form>
    </section>
  );
}
