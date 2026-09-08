import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useUsuarios, useUsuarioAtual } from '../state/hooks.js';
import { acoes } from '../state/acoes.js';
import { Modalidade } from '../domain/enums.js';
import { analisarTexto } from '../lib/analise.js';
import { rotulo, formatarMoeda } from '../lib/formatos.js';
import { gerarId } from '../lib/ids.js';
import { Campo } from '../components/ui/Campo.jsx';
import { BadgeOutline, BadgeSeveridade, BadgeCriticidade } from '../components/ui/Badge.jsx';

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
      <legend className="text-sm font-semibold mb-2">
        {titulo} <span className="text-ink-muted font-normal">({itens.length})</span>
      </legend>
      <ul className="flex flex-col gap-1.5">
        {itens.map((item) => (
          <li key={item._id}>
            <label className={`flex gap-3 items-start rounded-lg border p-2.5 text-sm cursor-pointer transition-colors ${selecionados.has(item._id) ? 'border-brand-300 bg-brand-50/60 dark:bg-brand-900/20' : 'border-line opacity-70'}`}>
              <input type="checkbox" className="checkbox mt-0.5" checked={selecionados.has(item._id)} onChange={() => onToggle(item._id)} />
              <span className="flex flex-col gap-1">{render(item)}</span>
            </label>
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
    const r = analisarTexto(form.textoBruto, { hoje: hojeIso(), dataLimiteEnvio: form.dataLimiteEnvio || undefined });
    const marcar = (lista, tipo) => lista.map((x) => ({ ...x, _id: gerarId(tipo), _tipo: tipo }));
    const enriquecida = { ...r, criterios: marcar(r.criterios, 'sc'), riscos: marcar(r.riscos, 'sr'), checklist: marcar(r.checklist, 'sk') };
    setAnalise(enriquecida);
    setSelecionados(new Set([...enriquecida.criterios, ...enriquecida.riscos, ...enriquecida.checklist].map((x) => x._id)));
    const m = r.metadados;
    setForm((f) => ({
      ...f,
      titulo: f.titulo || m.titulo || '',
      orgao: f.orgao || m.orgao || '',
      modalidade: f.modalidade === FORM_VAZIO.modalidade && m.modalidade ? m.modalidade : f.modalidade,
      numeroProcesso: f.numeroProcesso || m.numeroProcesso || '',
      valorEstimadoReais: f.valorEstimadoReais || (m.valorEstimado ? (m.valorEstimado / 100).toFixed(2).replace('.', ',') : ''),
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

  const filtrar = (lista) => lista.filter((x) => selecionados.has(x._id)).map(({ _id, _tipo, ...resto }) => resto);
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
            ? { criterios: filtrar(analise.criterios), riscos: filtrar(analise.riscos), checklist: filtrar(analise.checklist).map(({ trechoOrigem, ...c }) => c) }
            : {},
        ),
      );
      navigate(`/edital/${id}`);
    } catch (err) {
      setErro(err.message);
    }
  };

  return (
    <section className="flex flex-col gap-5">
      <header>
        <h2>Importar edital</h2>
        <p className="text-sm text-ink-muted">Cole o texto do edital, RFP ou termo de referência. O motor de análise sugere critérios, riscos e checklist.</p>
      </header>

      <form className="grid gap-5 lg:grid-cols-5" onSubmit={importar}>
        <div className="card lg:col-span-3 flex flex-col gap-3">
          <div className="card-header !mb-0">
            <h3>1. Texto bruto</h3>
            <button type="button" className="btn-primary" onClick={analisar} disabled={!form.textoBruto.trim()}>
              Analisar texto
            </button>
          </div>
          <textarea className="textarea" rows={14} value={form.textoBruto} onChange={set('textoBruto')} placeholder="Cole aqui o texto do edital, RFP ou termo de referência" aria-label="Texto bruto do edital" />
          {analise ? (
            <p className="aviso-info">
              {analise.criterios.length} critérios, {analise.riscos.length} riscos, {analise.checklist.length} itens de checklist sugeridos. Campos vazios foram preenchidos automaticamente.
            </p>
          ) : null}
        </div>

        <div className="card lg:col-span-2 grid gap-3 content-start">
          <h3 className="mb-1">2. Dados do edital</h3>
          <Campo rotulo="Título"><input className="input" required value={form.titulo} onChange={set('titulo')} /></Campo>
          <Campo rotulo="Órgão / empresa"><input className="input" required value={form.orgao} onChange={set('orgao')} /></Campo>
          <div className="grid grid-cols-2 gap-3">
            <Campo rotulo="Modalidade">
              <select className="select" value={form.modalidade} onChange={set('modalidade')}>
                {Modalidade.valores.map((m) => <option key={m} value={m}>{rotulo('modalidade', m)}</option>)}
              </select>
            </Campo>
            <Campo rotulo="Nº do processo"><input className="input" value={form.numeroProcesso} onChange={set('numeroProcesso')} /></Campo>
          </div>
          <Campo rotulo="Valor estimado (R$)" dica={formatarMoeda(reaisParaCentavos(form.valorEstimadoReais))}>
            <input className="input" inputMode="decimal" value={form.valorEstimadoReais} onChange={set('valorEstimadoReais')} placeholder="1.850.000,00" />
          </Campo>
          <div className="grid grid-cols-2 gap-3">
            <Campo rotulo="Abertura das propostas"><input className="input" type="date" value={form.dataAberturaPropostas} onChange={set('dataAberturaPropostas')} /></Campo>
            <Campo rotulo="Limite de envio"><input className="input" type="date" value={form.dataLimiteEnvio} onChange={set('dataLimiteEnvio')} /></Campo>
          </div>
          <Campo rotulo="Responsável">
            <select className="select" value={form.responsavelId} onChange={set('responsavelId')}>
              <option value="">—</option>
              {usuarios.map((u) => <option key={u.id} value={u.id}>{u.nome}</option>)}
            </select>
          </Campo>
          <Campo rotulo="Tags (separadas por vírgula)"><input className="input" value={form.tags} onChange={set('tags')} placeholder="ti, municipal, urgente" /></Campo>
        </div>

        {analise ? (
          <div className="card lg:col-span-5 flex flex-col gap-5">
            <div className="card-header !mb-0">
              <h3>3. Sugestões da análise</h3>
              <span className="text-sm text-ink-muted">{totalSelecionado} selecionadas</span>
            </div>
            {analise.criterios.length + analise.riscos.length + analise.checklist.length === 0 ? (
              <p className="text-sm text-ink-muted">Nada encontrado no texto. Você pode adicionar itens manualmente depois de importar.</p>
            ) : null}
            <div className="grid gap-6 md:grid-cols-3">
              <Sugestoes titulo="Critérios" itens={analise.criterios} selecionados={selecionados} onToggle={alternar}
                render={(c) => (<><span>{c.descricao}</span><span className="flex gap-1"><BadgeOutline>{rotulo('categoria', c.categoria)}</BadgeOutline>{c.obrigatorio ? <BadgeOutline>obrigatório</BadgeOutline> : null}</span></>)} />
              <Sugestoes titulo="Riscos" itens={analise.riscos} selecionados={selecionados} onToggle={alternar}
                render={(r) => (<><span>{r.titulo}</span><span className="flex gap-1"><BadgeOutline>{rotulo('tipoRisco', r.tipo)}</BadgeOutline><BadgeSeveridade valor={r.severidade} /></span></>)} />
              <Sugestoes titulo="Checklist" itens={analise.checklist} selecionados={selecionados} onToggle={alternar}
                render={(k) => (<><span>{k.titulo}</span><span className="flex gap-1"><BadgeOutline>{rotulo('tipoChecklist', k.tipo)}</BadgeOutline><BadgeCriticidade valor={k.criticidade} /></span></>)} />
            </div>
          </div>
        ) : null}

        {erro ? <p role="alert" className="aviso-erro lg:col-span-5">{erro}</p> : null}

        <div className="lg:col-span-5 flex gap-2 justify-end">
          <button type="button" className="btn-secondary" onClick={() => navigate('/')}>Cancelar</button>
          <button type="submit" className="btn-primary">Importar edital</button>
        </div>
      </form>
    </section>
  );
}
