import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAppDispatch, useEdital, useUsuarios } from '../state/hooks.js';
import { acoes } from '../state/acoes.js';
import { rotulo, formatarMoeda, formatarData, formatarDiasRestantes } from '../lib/formatos.js';
import { criteriosEliminatorios } from '../lib/recomendacao.js';
import { TextoOrigem } from '../components/TextoOrigem.jsx';
import { PainelCriterios } from '../components/PainelCriterios.jsx';
import { PainelChecklist } from '../components/PainelChecklist.jsx';
import { PainelRiscos } from '../components/PainelRiscos.jsx';
import { PainelStatus } from '../components/PainelStatus.jsx';

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
    return [
      ...edital.criterios.map((c) => ({ ...c, _tipo: 'criterio' })),
      ...edital.riscos.map((r) => ({ ...r, _tipo: 'risco' })),
    ];
  }, [edital]);

  if (!edital) {
    return (
      <section>
        <p>Edital não encontrado.</p>
        <Link to="/">Voltar ao dashboard</Link>
      </section>
    );
  }

  const selecionar = (itemId) => {
    setAtivo(itemId);
    const ehRisco = edital.riscos.some((r) => r.id === itemId);
    setAba(ehRisco ? 'riscos' : 'criterios');
  };

  const eliminatorios = criteriosEliminatorios(edital.criterios);

  return (
    <article className="flex flex-col gap-4">
      <header className="flex flex-col gap-2">
        <Link to="/">← Dashboard</Link>
        <h2>{edital.titulo}</h2>
        <p>
          {edital.orgao} · {rotulo('modalidade', edital.modalidade)}
          {edital.numeroProcesso ? ` · ${edital.numeroProcesso}` : ''}
        </p>
        <dl className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div>
            <dt>Status</dt>
            <dd>{rotulo('status', edital.status)}</dd>
          </div>
          <div>
            <dt>Recomendação</dt>
            <dd data-recomendacao={edital.recomendacao}>{rotulo('recomendacao', edital.recomendacao)}</dd>
          </div>
          <div>
            <dt>Score de aderência</dt>
            <dd>{edital.scoreAderencia}/100</dd>
          </div>
          <div>
            <dt>Prazo de envio</dt>
            <dd>
              {formatarData(edital.dataLimiteEnvio)} ({formatarDiasRestantes(edital.diasRestantes)})
            </dd>
          </div>
          <div>
            <dt>Valor estimado</dt>
            <dd>{formatarMoeda(edital.valorEstimado)}</dd>
          </div>
          <div>
            <dt>Abertura</dt>
            <dd>{formatarData(edital.dataAberturaPropostas)}</dd>
          </div>
          <div>
            <dt>Importado em</dt>
            <dd>{formatarData(edital.dataImportacao)}</dd>
          </div>
          <div>
            <dt>
              <label htmlFor="responsavel">Responsável</label>
            </dt>
            <dd>
              <select
                id="responsavel"
                value={edital.responsavelId ?? ''}
                onChange={(e) => dispatch(acoes.atualizarEdital(edital.id, { responsavelId: e.target.value || null }))}
              >
                <option value="">—</option>
                {usuarios.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.nome}
                  </option>
                ))}
              </select>
            </dd>
          </div>
        </dl>
        {eliminatorios.length > 0 ? (
          <p role="alert">
            NO-GO forçado: {eliminatorios.length} critério(s) obrigatório(s) não atendido(s).
          </p>
        ) : null}
        {edital.tags.length ? <p>Tags: {edital.tags.join(', ')}</p> : null}
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        <section aria-labelledby="h-texto" className="flex flex-col gap-2">
          <h3 id="h-texto">Texto do edital</h3>
          <TextoOrigem texto={edital.textoBruto} itens={itensMarcaveis} ativo={ativo} onSelecionar={selecionar} />
        </section>

        <div className="flex flex-col gap-4">
          <nav aria-label="Seções da análise">
            <ul className="flex gap-2 flex-wrap" role="tablist">
              {ABAS.map(([chave, titulo]) => (
                <li key={chave} role="presentation">
                  <button type="button" role="tab" aria-selected={aba === chave} onClick={() => setAba(chave)}>
                    {titulo}
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
