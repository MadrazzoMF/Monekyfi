export function Campo({ rotulo, children, className = '', dica, htmlFor }) {
  const Tag = htmlFor ? 'div' : 'label';
  return (
    <Tag className={`field ${className}`}>
      {htmlFor ? <label htmlFor={htmlFor} className="label">{rotulo}</label> : <span className="label">{rotulo}</span>}
      {children}
      {dica ? <small>{dica}</small> : null}
    </Tag>
  );
}
