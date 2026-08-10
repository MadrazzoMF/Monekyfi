# PULSO DO ABISMO

FPS de **raycasting** no estilo Doom, escrito do zero em **p5.js**. Sem assets externos:
texturas, sprites, mapa e som são gerados por código.

## Jogar em qualquer dispositivo (arquivo único)

`dist/pulso-do-abismo.html` é **um arquivo só, ~1 MB, com a p5.js embutida**. Baixe e
abra no navegador — funciona offline, sem instalar nada, no Windows, macOS, Linux,
Android e iOS. Não precisa de servidor.

Para deixar com cara de app: abra o arquivo, toque em **Tela cheia**. Se você servir o
arquivo por HTTPS (GitHub Pages, Netlify, Drive etc.), dá para usar
"Adicionar à tela de início" no celular e ele abre em tela cheia com ícone próprio.

### Regerar o arquivo único

```bash
cd games/doom-p5
node build.js        # junta shell.html + vendor/p5.min.js + sketch.js -> dist/
```

## Rodar no editor p5.js (editor.p5js.org)

`sketch.js` é autossuficiente: crie um sketch novo em https://editor.p5js.org, apague o
conteúdo do `sketch.js` de lá, cole este arquivo inteiro e aperte ▶. Não precisa mexer no
`index.html` do editor nem adicionar bibliotecas — só a p5.js, que já vem carregada.

Duas diferenças dentro do editor:

- o preview é estreito; use o botão de tela cheia do preview para ver os 960x600 inteiros;
- o editor roda o sketch num iframe sem pointer lock, então a mira funciona
  **arrastando com o botão do mouse pressionado** (as setas ← → também giram).

## Desenvolvimento

```bash
cd games/doom-p5
python3 -m http.server 8080   # http://localhost:8080 usa index.html (p5 via CDN)
```

## Controles

No **celular/tablet**, a interface aparece sozinha no primeiro toque: analógico virtual
na metade esquerda, arrastar na metade direita para mirar, e os botões **FOGO**, **FASE**,
**ECO** e troca de arma à direita. Empurrar o analógico até o fim = correr.

No **computador**:

| Tecla | Ação |
|---|---|
| `W` `A` `S` `D` | andar / strafe |
| mouse (clique p/ travar) ou `←` `→` | girar |
| clique esquerdo / `CTRL` / `ESPAÇO` | atirar |
| `SHIFT` | correr |
| `1` `2` `3` | pistola / escopeta / ceifador |
| `F` | entrar/sair de **FASE** |
| `Q` | soltar **ECO TEMPORAL** |
| `R` | reiniciar |

## Mecânicas autorais

1. **Compasso (120 BPM)** — o mundo pulsa. Tiro dentro da janela dourada do metrônomo
   dá **dano x2 e devolve a munição**. Portas amarelas abrem/fecham na batida e os
   inimigos aceleram nela; a Sentinela *só* atira na batida.
2. **Eco Temporal** — os últimos 6 s de movimento e tiros ficam gravados. `Q` solta um
   fantasma que repete tudo, mira sozinho, atira com metade do dano e **rouba o aggro**
   dos inimigos. Custa 30 de Éter + 1 carga.
3. **Fase** — `F` transforma você em éter: atravessa as paredes verdes, **enxerga através
   delas**, fica invisível para os inimigos e imune a projéteis — mas não pode atirar e
   drena Éter. Materializar dentro de uma parede é bloqueado.
4. **Colheita de Almas** — inimigos mortos soltam almas que são atraídas até você.
   Cada alma dá Éter e sobe o **Frenesi** (até x2,2 de dano). Parar de matar por 4 s
   quebra a corrente. A cada 8 almas você ganha uma carga de Eco.
5. **Pacto de Sangue** — sem munição, a arma dispara mesmo assim: custa 8 de vida e
   dá +60% de dano.

## Estrutura

- `index.html` — carrega p5.js e o sketch.
- `sketch.js` — engine (DDA raycasting em framebuffer 320x200), IA, mecânicas e HUD.
