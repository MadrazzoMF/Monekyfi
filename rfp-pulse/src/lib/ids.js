let contador = 0;

export function gerarId(prefixo = 'id') {
  contador += 1;
  const aleatorio = Math.random().toString(36).slice(2, 8);
  return `${prefixo}_${Date.now().toString(36)}${contador.toString(36)}${aleatorio}`;
}
