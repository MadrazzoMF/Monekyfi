import { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useUsuarios, useUsuarioAtual } from '../state/hooks.js';
import { acoes } from '../state/acoes.js';
import { Modalidade } from '../domain/enums.js';
import { analisarTexto } from '../lib/analise.js';
import { rotulo, formatarMoeda } from '../lib/formatos.js';
import { gerarId } from '../lib/ids.js';
import { Campo } from '../components/ui/Campo.jsx';
import { BadgeOutline, BadgeSeveridade, BadgeCriticidade } from '../components/ui/Badge.jsx';
import { Icone } from '../components/ui/Icone.jsx';
import { useToast } from '../components/ui/Toast.jsx';

const hojeIso = () => new Date().toISOString().slice(0, 10);

const FORM_VAZIO = {
  titulo: '', orgao: '', modalidade: 'pregao', numeroProcesso: '', valorEstimadoReais: '',
  dataAberturaPropostas: '', dataLimiteEnvio: '', responsavelId: '', tags: '', textoBruto: '',
};

const EXEMPLO = `A PREFEITURA MUNICIPAL DE SÃO CARLOS torna público que realizará licitação na modalidade PREGÃO ELETRÔNICO nº 088/2026, para contratação de empresa especializada em manutenção de iluminação pública com fornecimento de luminárias LED. Valor estimado: R$ 4.750.000,00. Abertura das propostas em 15/11/2026. Envio das propostas até 13/11/2026.
Exige-se atestado de capacidade técnica compatível com 40% do objeto.
Certidões negativas de débitos federais, estaduais, municipais e trabalhistas (CNDT).
Patrimônio líquido mínimo de 10% do valor estimado.
Certificação ISO 9001 será considerada diferencial na pontuação técnica.
O pagamento será efetuado em 45 dias após a medição mensal.
Multa de 20% sobre o valor do contrato em caso de rescisão por culpa da contratada.
Garantia de proposta de 1% do valor estimado.
A visita técnica é obrigatória e deverá ser agendada com a Secretaria de Obras.
Atendimento corretivo em até 4 horas, 24 horas por dia, em todo o município.
Demais serviços correlatos conforme necessidade da contratante.`;

function reaisParaCentavos(texto) {
  if (!texto) return 0;
  const n = Number(String(texto).replace(/\./g, '').replace(',', '.'));
  return Number.isFinite(n) ? Math.round(n * 100) : 0;
}

function Passo({ n, titulo, extra }) {
  return (
    <div className="card-title !mb-3">
      <h3 className="flex items-center gap-2.5">
        <span className="grid h-6 w-6 place-items-center rounded-full bg-accent/15 text-accent text-xs font-bold">{n}</span>
        {titulo}
      </h3>
      {extra}
    </div>
  );
}

function Sugestoes({ titulo, icone, itens, selecionados, onToggle, onTodos, render }) {
  const nSel = itens.filter((i) => selecionados.has(i._id)).length;
  return (
    <fieldset className="flex min-w-0 flex-col gap-2">
      <legend className="mb-2 flex w-full items-center justify-between">
        <span className="flex items-center gap-2 text-sm font-semibold"><Icone nome={icone} tamanho={15} className="text-ink-faint" />{titulo} <span className="text-ink-faint font-normal">{nSel}/{itens.length}</span></span>
        {itens.length ? <button type="button" className="btn-link" onClick={() => onTodos(itens, nSel < itens.length)}>{nSel < itens.length ? 'marcar todos' : 'desmarcar'}</button> : null}
      </legend>
      {itens.length === 0 ? <p className="text-xs text-ink-faint">Nada encontrado nesta categoria.</p> : null}
      <ul className="flex flex-col gap-1.5">
        {itens.map((item) => {
          const on = selecionados.has(item._id);
          return (
            <li key={item._id}>
              <label className={`flex cursor-pointer items-start gap-3 rounded-lg border p-2.5 text-sm transition-colors ${on ? 'border-accent/40 bg-accent/5' : 'border-line opacity-60 hover:opacity-100'}`}>
                <input type="checkbox" className="checkbox mt-0.5" checked={on} onChange={() => onToggle(item._id)} />
                <span className="flex min-w-0 flex-col gap-1.5">{render(item)}</span>
              </label>
            </li>
          );
        })}
      </ul>
    </fieldset>
  );
}

export function NovoEdital() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const toast = useToast();
  const usuarios = useUsuarios();
  const usuarioAtual = useUsuarioAtual();
  const [form, setForm] = useState({ ...FORM_VAZIO, responsavelId: usuarioAtual?.id ?? '' });
  const [analise, setAnalise] = useState(null);
  const [selecionados, setSelecionados] = useState(new Set());
  const [erro, setErro] = useState('');
  const [arrastando, setArrastando] = useState(false);
  const arquivoRef = useRef(null);

  const set = (campo) => (e) => setForm((f) => ({ ...f, [campo]: e.target.value }));

  const analisar = (texto = form.textoBruto) => {
    const r = analisarTexto(texto, { hoje: hojeIso(), dataLimiteEnvio: form.dataLimiteEnvio || undefined });
    const marcar = (lista, tipo) => lista.map((x) => ({ ...x, _id: gerarId(tipo), _tipo: tipo }));
    const enriquecida = { ...r, criterios: marcar(r.criterios, 'sc'), riscos: marcar(r.riscos, 'sr'), checklist: marcar(r.checklist, 'sk') };
    setAnalise(enriquecida);
    setSelecionados(new Set([...enriquecida.criterios, ...enriquecida.riscos, ...enriquecida.checklist].map((x) => x._id)));
    const m = r.metadados;
    setForm((f) => ({
      ...f,
      textoBruto: texto,
      titulo: f.titulo || m.titulo || '',
      orgao: f.orgao || m.orgao || '',
      modalidade: f.modalidade === FORM_VAZIO.modalidade && m.modalidade ? m.modalidade : f.modalidade,
      numeroProcesso: f.numeroProcesso || m.numeroProcesso || '',
      valorEstimadoReais: f.valorEstimadoReais || (m.valorEstimado ? (m.valorEstimado / 100).toFixed(2).replace('.', ',') : ''),
      dataAberturaPropostas: f.dataAberturaPropostas || m.dataAberturaPropostas || '',
      dataLimiteEnvio: f.dataLimiteEnvio || m.dataLimiteEnvio || '',
    }));
    const total = r.criterios.length + r.riscos.length + r.checklist.length;
    toast.info(`${total} sugestões encontradas no texto`);
  };

  const lerArquivo = (file) => {
    if (!file) return;
    if (!/text|\.txt$|\.md$/i.test(file.type + file.name)) {
      toast.erro('Envie um arquivo de texto (.txt). PDFs ainda não são lidos.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => analisar(String(reader.result ?? ''));
    reader.readAsText(file, 'utf-8');
  };

  const alternar = (id) => setSelecionados((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const marcarTodos = (itens, marcar) => setSelecionados((s) => { const n = new Set(s); for (const i of itens) marcar ? n.add(i._id) : n.delete(i._id); return n; });
  const filtrar = (lista) => lista.filter((x) => selecionados.has(x._id)).map(({ _id, _tipo, ...resto }) => resto);
  const totalSelecionado = useMemo(() => selecionados.size, [selecionados]);

  const importar = (e) => {
    e.preventDefault();
    setErro('');
    try {
      const id = gerarId('ed');
      dispatch(acoes.importarEdital(
        {
          id, titulo: form.titulo.trim(), orgao: form.orgao.trim(), modalidade: form.modalidade,
          numeroProcesso: form.numeroProcesso.trim(), valorEstimado: reaisParaCentavos(form.valorEstimadoReais),
          textoBruto: form.textoBruto, dataAberturaPropostas: form.dataAberturaPropostas || null,
          dataLimiteEnvio: form.dataLimiteEnvio || null, responsavelId: form.responsavelId || null,
          tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
        },
        analise ? { criterios: filtrar(analise.criterios), riscos: filtrar(analise.riscos), checklist: filtrar(analise.checklist).map(({ trechoOrigem, ...c }) => c) } : {},
      ));
      toast.ok('Edital importado');
      navigate(`/edital/${id}`);
    } catch (err) {
      setErro(err.message);
      toast.erro(err.message);
    }
  };

  return (
    <section className="flex flex-col gap-5">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2>Importar edital</h2>
          <p className="mt-1 text-sm text-ink-muted">Cole ou arraste o texto. O motor de análise extrai os dados e sugere critérios, riscos e checklist.</p>
        </div>
      </header>

      <form className="grid gap-5 xl:grid-cols-5" onSubmit={importar}>
        <div className="card card-pad xl:col-span-3 flex flex-col gap-3">
          <Passo n="1" titulo="Texto bruto" extra={
            <div className="flex items-center gap-2">
              <button type="button" className="btn-ghost btn-sm" onClick={() => analisar(EXEMPLO)}><Icone nome="exemplo" tamanho={14} /> Usar exemplo</button>
              <button type="button" className="btn-secondary btn-sm" onClick={() => arquivoRef.current?.click()}><Icone nome="arquivo" tamanho={14} /> Abrir .txt</button>
              <input ref={arquivoRef} type="file" accept=".txt,.md,text/plain" className="hidden" onChange={(e) => lerArquivo(e.target.files?.[0])} />
            </div>
          } />
          <div
            className={`relative rounded-lg transition-shadow ${arrastando ? 'ring-4 ring-accent/30' : ''}`}
            onDragOver={(e) => { e.preventDefault(); setArrastando(true); }}
            onDragLeave={() => setArrastando(false)}
            onDrop={(e) => { e.preventDefault(); setArrastando(false); lerArquivo(e.dataTransfer.files?.[0]); }}
          >
            <textarea className="textarea min-h-[22rem]" value={form.textoBruto} onChange={set('textoBruto')} placeholder="Cole aqui o texto do edital, RFP ou termo de referência, ou arraste um arquivo .txt" aria-label="Texto bruto do edital" />
            {arrastando ? <div className="pointer-events-none absolute inset-0 grid place-items-center rounded-lg bg-bg/70 text-sm font-medium text-accent">Solte o arquivo aqui</div> : null}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs text-ink-faint">{form.textoBruto.length.toLocaleString('pt-BR')} caracteres</span>
            <button type="button" className="btn-primary" onClick={() => analisar()} disabled={!form.textoBruto.trim()}>
              <Icone nome="faisca" /> Analisar texto
            </button>
          </div>
          {analise ? (
            <p className="aviso-ok"><Icone nome="check" className="mt-0.5" /><span>{analise.criterios.length} critérios, {analise.riscos.length} riscos e {analise.checklist.length} itens de checklist sugeridos. Os campos vazios ao lado foram preenchidos automaticamente; revise antes de importar.</span></p>
          ) : null}
        </div>

        <div className="card card-pad xl:col-span-2 grid content-start gap-3">
          <Passo n="2" titulo="Dados do edital" />
          <Campo rotulo="Título"><input className="input" required value={form.titulo} onChange={set('titulo')} placeholder="objeto resumido" /></Campo>
          <Campo rotulo="Órgão / empresa"><input className="input" required value={form.orgao} onChange={set('orgao')} /></Campo>
          <div className="grid grid-cols-2 gap-3">
            <Campo rotulo="Modalidade">
              <select className="select" value={form.modalidade} onChange={set('modalidade')}>
                {Modalidade.valores.map((m) => <option key={m} value={m}>{rotulo('modalidade', m)}</option>)}
              </select>
            </Campo>
            <Campo rotulo="Nº do processo"><input className="input" value={form.numeroProcesso} onChange={set('numeroProcesso')} placeholder="PE 001/2026" /></Campo>
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
          <div className="card card-pad xl:col-span-5 flex flex-col gap-5 animate-entrar">
            <Passo n="3" titulo="Sugestões da análise" extra={<span className="badge-accent">{totalSelecionado} selecionadas</span>} />
            <div className="grid gap-6 md:grid-cols-3">
              <Sugestoes titulo="Critérios" icone="escudo" itens={analise.criterios} selecionados={selecionados} onToggle={alternar} onTodos={marcarTodos}
                render={(c) => (<><span className="leading-snug">{c.descricao}</span><span className="flex flex-wrap gap-1"><BadgeOutline>{rotulo('categoria', c.categoria)}</BadgeOutline>{c.obrigatorio ? <BadgeOutline>obrigatório</BadgeOutline> : null}</span></>)} />
              <Sugestoes titulo="Riscos" icone="alerta" itens={analise.riscos} selecionados={selecionados} onToggle={alternar} onTodos={marcarTodos}
                render={(r) => (<><span className="leading-snug">{r.titulo}</span><span className="flex flex-wrap gap-1"><BadgeOutline>{rotulo('tipoRisco', r.tipo)}</BadgeOutline><BadgeSeveridade valor={r.severidade} /></span></>)} />
              <Sugestoes titulo="Checklist" icone="lista" itens={analise.checklist} selecionados={selecionados} onToggle={alternar} onTodos={marcarTodos}
                render={(k) => (<><span className="leading-snug">{k.titulo}</span><span className="flex flex-wrap gap-1"><BadgeOutline>{rotulo('tipoChecklist', k.tipo)}</BadgeOutline><BadgeCriticidade valor={k.criticidade} /></span></>)} />
            </div>
          </div>
        ) : null}

        {erro ? <p role="alert" className="aviso-erro xl:col-span-5"><Icone nome="alerta" className="mt-0.5" />{erro}</p> : null}

        <div className="xl:col-span-5 sticky bottom-0 -mx-4 flex justify-end gap-2 border-t border-line bg-bg/85 px-4 py-3 backdrop-blur md:-mx-8 md:px-8">
          <button type="button" className="btn-secondary" onClick={() => navigate('/')}>Cancelar</button>
          <button type="submit" className="btn-primary"><Icone nome="check" /> Importar edital</button>
        </div>
      </form>
    </section>
  );
}
