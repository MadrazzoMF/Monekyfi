export function Campo({ rotulo, children, className = '', dica }) {
  return (
    <label className={`field ${className}`}>
      <span className="label">{rotulo}</span>
      {children}
      {dica ? <small>{dica}</small> : null}
    </label>
  );
}
