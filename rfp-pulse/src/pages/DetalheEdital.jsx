import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAppDispatch, useEdital, useUsuarios } from '../state/hooks.js';
import { acoes } from '../state/acoes.js';
import { rotulo, formatarMoeda, formatarData } from '../lib/formatos.js';
import { criteriosEliminatorios } from '../lib/recomendacao.js';
import { TextoOrigem } from '../components/TextoOrigem.jsx';
import { PainelCriterios } from '../components/PainelCriterios.jsx';
import { PainelChecklist } from '../components/PainelChecklist.jsx';
import { PainelRiscos } from '../components/PainelRiscos.jsx';
import { PainelStatus } from '../components/PainelStatus.jsx';
import { BadgeRecomendacao, BadgeStatus, BadgeOutline } from '../components/ui/Badge.jsx';
import { Score } from '../components/ui/Score.jsx';
import { Prazo } from '../components/ui/Prazo.jsx';
import { Vazio } from '../components/ui/Vazio.jsx';

const ABAS = [
  ['criterios', 'Critérios'],
  ['checklist', 'Checklist'],
  ['riscos', 'Riscos'],
  ['status', 'Aprovação'],
];

export function DetalheEdital() {
  const { id } = useParams();
  const edital = useEdital(id);
  const usuarios = useUsuarios();
  const dispatch = useAppDispatch();
  const [aba, setAba] = useState('criterios');
  const [ativo, setAtivo] = useState(null);

  const itensMarcaveis = useMemo(() => {
    if (!edital) return [];
    return [...edital.criterios.map((c) => ({ ...c, _tipo: 'criterio' })), ...edital.riscos.map((r) => ({ ...r, _tipo: 'risco' }))];
  }, [edital]);

  if (!edital) {
    return <Vazio titulo="Edital não encontrado" acao={<Link to="/" className="btn-secondary">Voltar ao dashboard</Link>} />;
  }

  const selecionar = (itemId) => {
    setAtivo(itemId);
    setAba(edital.riscos.some((r) => r.id === itemId) ? 'riscos' : 'criterios');
  };

  const eliminatorios = criteriosEliminatorios(edital.criterios);
  const contagem = { criterios: edital.criterios.length, checklist: edital.checklist.filter((i) => !i.concluido).length, riscos: edital.riscos.length, status: edital.historico.length };

  return (
    <article className="flex flex-col gap-5">
      <nav aria-label="Navegação" className="text-sm"><Link to="/">← Dashboard</Link></nav>

      <header className="card flex flex-col gap-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex flex-col gap-1.5">
            <div className="flex flex-wrap items-center gap-1.5">
              <BadgeStatus valor={edital.status} />
              <BadgeOutline>{rotulo('modalidade', edital.modalidade)}</BadgeOutline>
              {edital.numeroProcesso ? <BadgeOutline>{edital.numeroProcesso}</BadgeOutline> : null}
              {edital.tags.map((t) => <BadgeOutline key={t}>#{t}</BadgeOutline>)}
            </div>
            <h2>{edital.titulo}</h2>
            <p className="text-sm text-ink-muted">{edital.orgao}</p>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-line bg-surface-sunken px-4 py-3">
            <div className="flex flex-col gap-1">
              <span className="label">Recomendação</span>
              <span data-recomendacao={edital.recomendacao}><BadgeRecomendacao valor={edital.recomendacao} /></span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="label">Score</span>
              <Score valor={edital.scoreAderencia} />
            </div>
          </div>
        </div>

        {eliminatorios.length > 0 ? (
          <p role="alert" className="aviso-erro">NO-GO forçado: {eliminatorios.length} critério(s) obrigatório(s) não atendido(s). O score é ignorado.</p>
        ) : null}

        <dl className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3 lg:grid-cols-5">
          <div><dt>Prazo de envio</dt><dd>{formatarData(edital.dataLimiteEnvio)} · <Prazo dias={edital.diasRestantes} /></dd></div>
          <div><dt>Abertura</dt><dd>{formatarData(edital.dataAberturaPropostas)}</dd></div>
          <div><dt>Valor estimado</dt><dd className="tabular-nums">{formatarMoeda(edital.valorEstimado)}</dd></div>
          <div><dt>Importado em</dt><dd>{formatarData(edital.dataImportacao)}</dd></div>
          <div>
            <dt><label htmlFor="responsavel">Responsável</label></dt>
            <dd>
              <select id="responsavel" className="select !py-1 text-xs" value={edital.responsavelId ?? ''} onChange={(e) => dispatch(acoes.atualizarEdital(edital.id, { responsavelId: e.target.value || null }))}>
                <option value="">—</option>
                {usuarios.map((u) => <option key={u.id} value={u.id}>{u.nome}</option>)}
              </select>
            </dd>
          </div>
        </dl>
      </header>

      <div className="grid gap-5 lg:grid-cols-5">
        <section aria-labelledby="h-texto" className="card lg:col-span-2 flex flex-col gap-3 lg:sticky lg:top-20 self-start">
          <div className="flex items-baseline justify-between">
            <h3 id="h-texto">Texto do edital</h3>
            <span className="text-xs text-ink-muted">clique num trecho marcado</span>
          </div>
          <TextoOrigem texto={edital.textoBruto} itens={itensMarcaveis} ativo={ativo} onSelecionar={selecionar} />
          <p className="flex gap-3 text-xs text-ink-muted">
            <span><mark className="rounded bg-brand-100 px-1 text-ink">critério</mark></span>
            <span><mark className="rounded bg-cond-soft px-1 text-ink">risco</mark></span>
          </p>
        </section>

        <div className="card lg:col-span-3 flex flex-col gap-4">
          <nav aria-label="Seções da análise">
            <ul className="tabs" role="tablist">
              {ABAS.map(([chave, titulo]) => (
                <li key={chave} role="presentation">
                  <button type="button" className="tab" role="tab" aria-selected={aba === chave} onClick={() => setAba(chave)}>
                    {titulo} <span className="ml-1 rounded-full bg-surface-sunken px-1.5 text-[11px] text-ink-muted">{contagem[chave]}</span>
                  </button>
                </li>
              ))}
            </ul>
          </nav>
          <div role="tabpanel">
            {aba === 'criterios' ? <PainelCriterios edital={edital} ativo={ativo} onSelecionar={setAtivo} /> : null}
            {aba === 'checklist' ? <PainelChecklist edital={edital} /> : null}
            {aba === 'riscos' ? <PainelRiscos edital={edital} ativo={ativo} onSelecionar={setAtivo} /> : null}
            {aba === 'status' ? <PainelStatus edital={edital} /> : null}
          </div>
        </div>
      </div>
    </article>
  );
}
