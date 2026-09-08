export function Vazio({ titulo, descricao, acao }) {
  return (
    <div className="vazio">
      <p className="text-base font-medium text-ink">{titulo}</p>
      {descricao ? <p className="text-sm">{descricao}</p> : null}
      {acao}
    </div>
  );
}
