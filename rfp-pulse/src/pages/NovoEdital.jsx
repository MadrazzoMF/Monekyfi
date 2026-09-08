import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useUsuarios, useUsuarioAtual } from '../state/hooks.js';
import { acoes } from '../state/acoes.js';
import { Modalidade } from '../domain/enums.js';
import { analisarTexto } from '../lib/analise.js';
import { rotulo, formatarMoeda } from '../lib/formatos.js';
import { gerarId } from '../lib/ids.js';

const hojeIso = () => new Date().toISOString().slice(0, 10);

const FORM_VAZIO = {
  titulo: '',
  orgao: '',
  modalidade: 'pregao',
  numeroProcesso: '',
  valorEstimadoReais: '',
  dataAberturaPropostas: '',
  dataLimiteEnvio: '',
  responsavelId: '',
  tags: '',
  textoBruto: '',
};

function reaisParaCentavos(texto) {
  if (!texto) return 0;
  const n = Number(String(texto).replace(/\./g, '').replace(',', '.'));
  return Number.isFinite(n) ? Math.round(n * 100) : 0;
}

function Sugestoes({ titulo, itens, selecionados, onToggle, render }) {
  if (itens.length === 0) return null;
  return (
    <fieldset className="flex flex-col gap-2">
      <legend>
        {titulo} ({itens.length})
      </legend>
      <ul className="flex flex-col gap-2">
        {itens.map((item) => (
          <li key={item._id} className="flex gap-2">
            <input
              type="checkbox"
              id={item._id}
              checked={selecionados.has(item._id)}
              onChange={() => onToggle(item._id)}
            />
            <label htmlFor={item._id}>{render(item)}</label>
          </li>
        ))}
      </ul>
    </fieldset>
  );
}

export function NovoEdital() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const usuarios = useUsuarios();
  const usuarioAtual = useUsuarioAtual();
  const [form, setForm] = useState({ ...FORM_VAZIO, responsavelId: usuarioAtual?.id ?? '' });
  const [analise, setAnalise] = useState(null);
  const [selecionados, setSelecionados] = useState(new Set());
  const [erro, setErro] = useState('');

  const set = (campo) => (e) => setForm((f) => ({ ...f, [campo]: e.target.value }));

  const analisar = () => {
    const r = analisarTexto(form.textoBruto, {
      hoje: hojeIso(),
      dataLimiteEnvio: form.dataLimiteEnvio || undefined,
    });
    const marcar = (lista, tipo) => lista.map((x) => ({ ...x, _id: gerarId(tipo), _tipo: tipo }));
    const enriquecida = {
      ...r,
      criterios: marcar(r.criterios, 'sc'),
      riscos: marcar(r.riscos, 'sr'),
      checklist: marcar(r.checklist, 'sk'),
    };
    setAnalise(enriquecida);
    setSelecionados(
      new Set([...enriquecida.criterios, ...enriquecida.riscos, ...enriquecida.checklist].map((x) => x._id)),
    );
    // preenche metadados só onde o usuário ainda não digitou
    const m = r.metadados;
    setForm((f) => ({
      ...f,
      titulo: f.titulo || m.titulo || '',
      orgao: f.orgao || m.orgao || '',
      modalidade: f.modalidade === FORM_VAZIO.modalidade && m.modalidade ? m.modalidade : f.modalidade,
      numeroProcesso: f.numeroProcesso || m.numeroProcesso || '',
      valorEstimadoReais:
        f.valorEstimadoReais || (m.valorEstimado ? (m.valorEstimado / 100).toFixed(2).replace('.', ',') : ''),
      dataAberturaPropostas: f.dataAberturaPropostas || m.dataAberturaPropostas || '',
      dataLimiteEnvio: f.dataLimiteEnvio || m.dataLimiteEnvio || '',
    }));
  };

  const alternar = (id) =>
    setSelecionados((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });

  const filtrar = (lista) =>
    lista
      .filter((x) => selecionados.has(x._id))
      .map(({ _id, _tipo, ...resto }) => resto);

  const totalSelecionado = useMemo(() => selecionados.size, [selecionados]);

  const importar = (e) => {
    e.preventDefault();
    setErro('');
    try {
      const id = gerarId('ed');
      dispatch(
        acoes.importarEdital(
          {
            id,
            titulo: form.titulo.trim(),
            orgao: form.orgao.trim(),
            modalidade: form.modalidade,
            numeroProcesso: form.numeroProcesso.trim(),
            valorEstimado: reaisParaCentavos(form.valorEstimadoReais),
            textoBruto: form.textoBruto,
            dataAberturaPropostas: form.dataAberturaPropostas || null,
            dataLimiteEnvio: form.dataLimiteEnvio || null,
            responsavelId: form.responsavelId || null,
            tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
          },
          analise
            ? {
                criterios: filtrar(analise.criterios),
                riscos: filtrar(analise.riscos),
                checklist: filtrar(analise.checklist).map(({ trechoOrigem, ...c }) => c),
              }
            : {},
        ),
      );
      navigate(`/edital/${id}`);
    } catch (err) {
      setErro(err.message);
    }
  };

  return (
    <section className="flex flex-col gap-4">
      <h2>Importar edital</h2>

      <form className="grid gap-4 md:grid-cols-2" onSubmit={importar}>
        <label className="flex flex-col gap-1 md:col-span-2">
          Texto bruto do edital
          <textarea
            rows={12}
            value={form.textoBruto}
            onChange={set('textoBruto')}
            placeholder="Cole aqui o texto do edital, RFP ou termo de referência"
          />
        </label>
        <div className="md:col-span-2 flex gap-4">
          <button type="button" onClick={analisar} disabled={!form.textoBruto.trim()}>
            Analisar texto
          </button>
          {analise ? (
            <span>
              {analise.criterios.length} critérios, {analise.riscos.length} riscos, {analise.checklist.length} itens de checklist sugeridos
            </span>
          ) : null}
        </div>

        <label className="flex flex-col gap-1">
          Título
          <input required value={form.titulo} onChange={set('titulo')} />
        </label>
        <label className="flex flex-col gap-1">
          Órgão / empresa
          <input required value={form.orgao} onChange={set('orgao')} />
        </label>
        <label className="flex flex-col gap-1">
          Modalidade
          <select value={form.modalidade} onChange={set('modalidade')}>
            {Modalidade.valores.map((m) => (
              <option key={m} value={m}>
                {rotulo('modalidade', m)}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          Nº do processo
          <input value={form.numeroProcesso} onChange={set('numeroProcesso')} />
        </label>
        <label className="flex flex-col gap-1">
          Valor estimado (R$)
          <input inputMode="decimal" value={form.valorEstimadoReais} onChange={set('valorEstimadoReais')} placeholder="1.850.000,00" />
          <small>{formatarMoeda(reaisParaCentavos(form.valorEstimadoReais))}</small>
        </label>
        <label className="flex flex-col gap-1">
          Responsável
          <select value={form.responsavelId} onChange={set('responsavelId')}>
            <option value="">—</option>
            {usuarios.map((u) => (
              <option key={u.id} value={u.id}>
                {u.nome}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          Abertura das propostas
          <input type="date" value={form.dataAberturaPropostas} onChange={set('dataAberturaPropostas')} />
        </label>
        <label className="flex flex-col gap-1">
          Limite de envio
          <input type="date" value={form.dataLimiteEnvio} onChange={set('dataLimiteEnvio')} />
        </label>
        <label className="flex flex-col gap-1 md:col-span-2">
          Tags (separadas por vírgula)
          <input value={form.tags} onChange={set('tags')} />
        </label>

        {analise ? (
          <div className="md:col-span-2 flex flex-col gap-4">
            <h3>Sugestões da análise ({totalSelecionado} selecionadas)</h3>
            <Sugestoes
              titulo="Critérios de elegibilidade"
              itens={analise.criterios}
              selecionados={selecionados}
              onToggle={alternar}
              render={(c) => (
                <>
                  [{rotulo('categoria', c.categoria)}] {c.descricao} {c.obrigatorio ? '(obrigatório)' : ''}
                </>
              )}
            />
            <Sugestoes
              titulo="Riscos"
              itens={analise.riscos}
              selecionados={selecionados}
              onToggle={alternar}
              render={(r) => (
                <>
                  [{rotulo('tipoRisco', r.tipo)} · {rotulo('severidade', r.severidade)}] {r.titulo}
                </>
              )}
            />
            <Sugestoes
              titulo="Checklist"
              itens={analise.checklist}
              selecionados={selecionados}
              onToggle={alternar}
              render={(k) => (
                <>
                  [{rotulo('tipoChecklist', k.tipo)} · {rotulo('criticidade', k.criticidade)}] {k.titulo}
                </>
              )}
            />
          </div>
        ) : null}

        {erro ? <p role="alert" className="md:col-span-2">{erro}</p> : null}

        <div className="md:col-span-2 flex gap-4">
          <button type="submit">Importar edital</button>
          <button type="button" onClick={() => navigate('/')}>
            Cancelar
          </button>
        </div>
      </form>
    </section>
  );
}
