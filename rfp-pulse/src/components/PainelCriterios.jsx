import { useState } from 'react';
import { CategoriaCriterio } from '../domain/enums.js';
import { rotulo } from '../lib/formatos.js';
import { acoes } from '../state/acoes.js';
import { useAppDispatch } from '../state/hooks.js';
import { BadgeOutline } from './ui/Badge.jsx';
import { Campo } from './ui/Campo.jsx';
import { Segmentado } from './ui/Segmentado.jsx';
import { Icone } from './ui/Icone.jsx';

const OPCOES_SITUACAO = [
  { valor: 'atende', rotulo: 'Atende', tom: 'go' },
  { valor: 'parcial', rotulo: 'Parcial', tom: 'cond' },
  { valor: 'nao_atende', rotulo: 'Não atende', tom: 'nogo' },
  { valor: 'nao_avaliado', rotulo: 'N/A' },
];

const ORDEM_CATEGORIA = ['juridica', 'fiscal', 'tecnica', 'economico_financeira', 'documental'];

export function PainelCriterios({ edital, ativo, onSelecionar }) {
  const dispatch = useAppDispatch();
  const [novo, setNovo] = useState({ categoria: 'tecnica', descricao: '', obrigatorio: true, peso: 3 });
  const [expandido, setExpandido] = useState({});

  const adicionar = (e) => {
    e.preventDefault();
    if (!novo.descricao.trim()) return;
    dispatch(acoes.adicionarCriterio({ editalId: edital.id, ...novo, peso: Number(novo.peso), descricao: novo.descricao.trim() }));
    setNovo({ ...novo, descricao: '' });
  };

  const avaliados = edital.criterios.filter((c) => c.situacao !== 'nao_avaliado').length;
  const ordenados = [...edital.criterios].sort((a, b) => {
    const elim = (c) => (c.obrigatorio && c.situacao === 'nao_atende' ? 0 : 1);
    return elim(a) - elim(b) || ORDEM_CATEGORIA.indexOf(a.categoria) - ORDEM_CATEGORIA.indexOf(b.categoria);
  });

  return (
    <section className="flex flex-col gap-4" aria-labelledby="h-criterios">
      <div className="flex items-baseline justify-between">
        <h3 id="h-criterios">Critérios de elegibilidade</h3>
        <span className="text-xs text-ink-muted">{avaliados}/{edital.criterios.length} avaliados</span>
      </div>
      {edital.criterios.length === 0 ? <p className="text-sm text-ink-faint">Nenhum critério cadastrado. Adicione abaixo ou reimporte com a análise.</p> : null}
      <ul className="flex flex-col gap-2.5">
        {ordenados.map((c) => {
          const eliminatorio = c.obrigatorio && c.situacao === 'nao_atende';
          const aberto = expandido[c.id] || ativo === c.id;
          return (
            <li key={c.id} className="item" data-ativo={ativo === c.id ? 'true' : undefined} data-eliminatorio={eliminatorio ? 'true' : undefined}>
              <div className="flex flex-wrap items-center gap-1.5">
                <BadgeOutline>{rotulo('categoria', c.categoria)}</BadgeOutline>
                <BadgeOutline>{c.obrigatorio ? 'obrigatório' : 'desejável'}</BadgeOutline>
                <BadgeOutline>peso {c.peso}</BadgeOutline>
                <span className="flex-1" />
                {c.trechoOrigem ? <button type="button" className="btn-link inline-flex items-center gap-1" onClick={() => onSelecionar(c.id)}><Icone nome="olho" tamanho={13} /> no texto</button> : null}
                <button type="button" className="btn-icon !p-1" onClick={() => setExpandido((x) => ({ ...x, [c.id]: !aberto }))} aria-expanded={aberto} aria-label="Detalhes"><Icone nome={aberto ? 'seta_cima' : 'seta_baixo'} tamanho={14} /></button>
              </div>
              <p className="text-sm font-medium leading-snug">{c.descricao}</p>
              {eliminatorio ? <p role="status" className="aviso-erro !py-1.5 text-xs"><Icone nome="alerta" tamanho={14} className="mt-0.5" />Critério eliminatório: força NO-GO independentemente do score.</p> : null}
              <div className="flex flex-wrap items-center gap-3">
                <Segmentado rotulo="Situação" valor={c.situacao} opcoes={OPCOES_SITUACAO} onChange={(situacao) => dispatch(acoes.atualizarCriterio(c.id, { situacao }))} />
                <label className="flex items-center gap-1.5 text-xs text-ink-muted">
                  Peso
                  <select className="select select-sm !w-auto" value={c.peso} onChange={(e) => dispatch(acoes.atualizarCriterio(c.id, { peso: Number(e.target.value) }))}>
                    {[1, 2, 3, 4, 5].map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                </label>
                <label className="flex items-center gap-1.5 text-xs text-ink-muted">
                  <input type="checkbox" className="checkbox" checked={c.obrigatorio} onChange={(e) => dispatch(acoes.atualizarCriterio(c.id, { obrigatorio: e.target.checked }))} />
                  Obrigatório
                </label>
                <span className="flex-1" />
                <button type="button" className="btn-icon !p-1 hover:!text-nogo" onClick={() => dispatch(acoes.removerCriterio(c.id))} aria-label="Remover critério"><Icone nome="lixo" tamanho={14} /></button>
              </div>
              {aberto ? (
                <div className="grid gap-2 sm:grid-cols-2 animate-entrar">
                  <Campo rotulo="Evidência"><input className="input input-sm" value={c.evidencia} placeholder="documento que comprova" onChange={(e) => dispatch(acoes.atualizarCriterio(c.id, { evidencia: e.target.value }))} /></Campo>
                  <Campo rotulo="Nota interna"><input className="input input-sm" value={c.notaInterna} onChange={(e) => dispatch(acoes.atualizarCriterio(c.id, { notaInterna: e.target.value }))} /></Campo>
                  {c.trechoOrigem ? <p className="sm:col-span-2 text-xs text-ink-faint font-mono leading-relaxed border-l-2 border-line pl-2">“{c.trechoOrigem}”</p> : null}
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>

      <form className="item-add grid gap-2 sm:grid-cols-[auto_1fr_auto_auto] items-end" onSubmit={adicionar}>
        <Campo rotulo="Categoria">
          <select className="select select-sm" value={novo.categoria} onChange={(e) => setNovo({ ...novo, categoria: e.target.value })}>
            {CategoriaCriterio.valores.map((c) => <option key={c} value={c}>{rotulo('categoria', c)}</option>)}
          </select>
        </Campo>
        <Campo rotulo="Novo critério"><input className="input input-sm" value={novo.descricao} onChange={(e) => setNovo({ ...novo, descricao: e.target.value })} placeholder="descreva a exigência" /></Campo>
        <label className="flex items-center gap-1.5 pb-2 text-xs text-ink-muted">
          <input type="checkbox" className="checkbox" checked={novo.obrigatorio} onChange={(e) => setNovo({ ...novo, obrigatorio: e.target.checked })} />
          Obrigatório
        </label>
        <button type="submit" className="btn-secondary btn-sm"><Icone nome="mais" tamanho={14} /> Adicionar</button>
      </form>
    </section>
  );
}
