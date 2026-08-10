# PULSO DO ABISMO

FPS de **raycasting** no estilo Doom, escrito do zero em **p5.js**. Sem assets externos:
texturas, sprites, mapa e som são gerados por código.

## Como rodar

```bash
cd games/doom-p5
python3 -m http.server 8080
# abra http://localhost:8080
```

(Também funciona abrindo `index.html` direto no navegador; o servidor local só evita
restrições de arquivo local em alguns navegadores.)

## Controles

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
