#!/usr/bin/env node
/* Gera dist/pulso-do-abismo.html: um único arquivo, sem rede, sem instalação.
   Uso: node build.js   (a partir de games/doom-p5) */

const fs = require('fs');
const path = require('path');

const here = __dirname;
const p5Path = path.join(here, 'vendor', 'p5.min.js');
if (!fs.existsSync(p5Path)) {
  console.error('vendor/p5.min.js não encontrado. Rode: npm pack p5@1.9.4 && tar xzf p5-1.9.4.tgz && mv package/lib/p5.min.js vendor/');
  process.exit(1);
}

const p5 = fs.readFileSync(p5Path, 'utf8');
const sketch = fs.readFileSync(path.join(here, 'sketch.js'), 'utf8');
const shell = fs.readFileSync(path.join(here, 'shell.html'), 'utf8');

if (/<\/script/i.test(p5) || /<\/script/i.test(sketch)) {
  console.error('Fonte contém </script — precisaria de escape.');
  process.exit(1);
}

const html = shell
  .replace('/*__P5__*/', () => p5)
  .replace('/*__SKETCH__*/', () => sketch);

fs.mkdirSync(path.join(here, 'dist'), { recursive: true });
const out = path.join(here, 'dist', 'pulso-do-abismo.html');
fs.writeFileSync(out, html);
console.log('ok ->', out, (html.length / 1024).toFixed(0) + ' KB');
