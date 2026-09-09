import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAppDispatch, useEdital, useUsuarios } from '../state/hooks.js';
import { acoes } from '../state/acoes.js';
import { rotulo, formatarMoeda, formatarData } from '../lib/formatos.js';
import { criteriosEliminatorios, riscosCriticosNaoAceitos } from '../lib/recomendacao.js';
import { TextoOrigem } from '../components/TextoOrigem.jsx';
import { PainelCriterios } from '../components/PainelCriterios.jsx';
import { PainelChecklist } from '../components/PainelChecklist.jsx';
import { PainelRiscos } from '../components/PainelRiscos.jsx';
import { PainelStatus } from '../components/PainelStatus.jsx';
import { BadgeStatus, BadgeOutline, PillRecomendacao } from '../components/ui/Badge.jsx';
import { AnelScore } from '../components/ui/AnelScore.jsx';
import { Prazo } from '../components/ui/Prazo.jsx';
import { Vazio } from '../components/ui/Vazio.jsx';
import { Icone } from '../components/ui/Icone.jsx';

const ABAS = [
  ['criterios', 'Critérios', 'escudo'],
  ['checklist', 'Checklist', 'lista'],
  ['riscos', 'Riscos', 'alerta'],
  ['status', 'Aprovação', 'fluxo'],
];

function Fato({ icone, rotulo: r, children }) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-md bg-raised text-ink-faint"><Icone nome={icone} tamanho={14} /></span>
      <div className="min-w-0">
        <dt>{r}</dt>
        <dd className="mt-0.5 truncate">{children}</dd>
      </div>
    </div>
  );
}

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
    return <Vazio icone="busca" titulo="Edital não encontrado" acao={<Link to="/" className="btn-secondary"><Icone nome="voltar" /> Voltar ao dashboard</Link>} />;
  }

  const selecionar = (itemId) => {
    setAtivo(itemId);
    setAba(edital.riscos.some((r) => r.id === itemId) ? 'riscos' : 'criterios');
  };

  const eliminatorios = criteriosEliminatorios(edital.criterios);
  const criticos = riscosCriticosNaoAceitos(edital.riscos);
  const contagem = { criterios: edital.criterios.length, checklist: edital.checklist.filter((i) => !i.concluido).length, riscos: edital.riscos.length, status: edital.historico.length };

  const motivo =
    eliminatorios.length ? { classe: 'aviso-erro', icone: 'alerta', texto: `NO-GO forçado: ${eliminatorios.length} critério(s) obrigatório(s) não atendido(s). O score é ignorado.` }
    : criticos.length && edital.recomendacao === 'condicional' ? { classe: 'aviso-atencao', icone: 'alerta', texto: `${criticos.length} risco(s) crítico(s) sem aceite limitam a recomendação a Condicional.` }
    : edital.recomendacao === 'indefinido' ? { classe: 'aviso-info', icone: 'info', texto: 'Nenhum critério avaliado ainda. Avalie os critérios para gerar a recomendação.' }
    : null;

  return (
    <article className="flex flex-col gap-5 animate-entrar">
      <nav aria-label="Navegação" className="text-sm"><Link to="/" className="inline-flex items-center gap-1.5 text-ink-muted no-underline hover:text-ink"><Icone nome="voltar" tamanho={14} /> Dashboard</Link></nav>

      <header className="card card-pad flex flex-col gap-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex min-w-0 flex-col gap-2">
            <div className="flex flex-wrap items-center gap-1.5">
              <BadgeStatus valor={edital.status} />
              <BadgeOutline>{rotulo('modalidade', edital.modalidade)}</BadgeOutline>
              {edital.numeroProcesso ? <BadgeOutline>{edital.numeroProcesso}</BadgeOutline> : null}
              {edital.tags.map((t) => <BadgeOutline key={t}>#{t}</BadgeOutline>)}
            </div>
            <h2 className="text-balance">{edital.titulo}</h2>
            <p className="flex items-center gap-1.5 text-sm text-ink-muted"><Icone nome="predio" tamanho={14} className="text-ink-faint" />{edital.orgao}</p>
          </div>
          <div className="flex shrink-0 items-center gap-5 rounded-xl border border-line bg-raised/60 px-5 py-3">
            <AnelScore valor={edital.scoreAderencia} tamanho={68} />
            <div className="flex flex-col gap-1.5">
              <span className="label">Recomendação</span>
              <span data-recomendacao={edital.recomendacao}><PillRecomendacao valor={edital.recomendacao} /></span>
            </div>
          </div>
        </div>

        {motivo ? <p role={motivo.classe === 'aviso-erro' ? 'alert' : 'status'} className={motivo.classe}><Icone nome={motivo.icone} className="mt-0.5" />{motivo.texto}</p> : null}

        <dl className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
          <Fato icone="relogio" rotulo="Prazo de envio">{formatarData(edital.dataLimiteEnvio)} · <Prazo dias={edital.diasRestantes} /></Fato>
          <Fato icone="calendario" rotulo="Abertura">{formatarData(edital.dataAberturaPropostas)}</Fato>
          <Fato icone="moeda" rotulo="Valor estimado"><span className="tabular-nums">{formatarMoeda(edital.valorEstimado)}</span></Fato>
          <Fato icone="importar" rotulo="Importado em">{formatarData(edital.dataImportacao)}</Fato>
          <Fato icone="usuario" rotulo="Responsável">
            <select className="select select-sm !w-auto -my-1" aria-label="Responsável" value={edital.responsavelId ?? ''} onChange={(e) => dispatch(acoes.atualizarEdital(edital.id, { responsavelId: e.target.value || null }))}>
              <option value="">—</option>
              {usuarios.map((u) => <option key={u.id} value={u.id}>{u.nome}</option>)}
            </select>
          </Fato>
        </dl>
      </header>

      <div className="grid gap-5 xl:grid-cols-5">
        <section aria-labelledby="h-texto" className="card card-pad xl:col-span-2 flex flex-col gap-3 xl:sticky xl:top-6 self-start">
          <div className="flex items-baseline justify-between">
            <h3 id="h-texto">Texto do edital</h3>
            <span className="text-xs text-ink-faint">clique num trecho marcado</span>
          </div>
          <TextoOrigem texto={edital.textoBruto} itens={itensMarcaveis} ativo={ativo} onSelecionar={selecionar} />
          <p className="flex gap-3 text-[11px] text-ink-faint">
            <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-accent/40" /> critério</span>
            <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-cond/40" /> risco</span>
          </p>
        </section>

        <div className="card card-pad xl:col-span-3 flex flex-col gap-4">
          <nav aria-label="Seções da análise">
            <ul className="tabs" role="tablist">
              {ABAS.map(([chave, titulo, icone]) => (
                <li key={chave} role="presentation">
                  <button type="button" className="tab" role="tab" aria-selected={aba === chave} onClick={() => setAba(chave)}>
                    <Icone nome={icone} tamanho={15} /> {titulo} <span className="contador">{contagem[chave]}</span>
                  </button>
                </li>
              ))}
            </ul>
          </nav>
          <div role="tabpanel" key={aba} className="animate-entrar">
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
