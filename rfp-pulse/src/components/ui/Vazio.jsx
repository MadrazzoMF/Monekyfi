import { Icone } from './Icone.jsx';

export function Vazio({ icone = 'arquivo', titulo, descricao, acao }) {
  return (
    <div className="vazio animate-entrar">
      <span className="grid h-14 w-14 place-items-center rounded-2xl bg-raised border border-line text-ink-faint">
        <Icone nome={icone} tamanho={26} strokeWidth={1.5} />
      </span>
      <p className="text-base font-semibold text-ink">{titulo}</p>
      {descricao ? <p className="max-w-md text-sm leading-relaxed">{descricao}</p> : null}
      {acao ? <div className="mt-1">{acao}</div> : null}
    </div>
  );
}
