# MonkeyPirates — RPG de farm PVE/PVP no estilo Blox Fruits

Base completa e jogável de um RPG de mundo aberto no Roblox, escrita do zero em
Luau. **O mundo inteiro é gerado por código** — ilhas, mar, decoração, NPCs,
interface — então você consegue entrar e jogar sem modelar nada no Studio.

> Este projeto vive em `roblox-game/` dentro do repositório do MonkeyFi. Ele é
> independente do app React Native: nada aqui interfere no build do Expo.

---

## O que já funciona

**Progressão**
- Nível 1 → 150 com curva de XP configurável
- 5 categorias de stat (Combate, Defesa, Espada, Arma de Fogo, Fruta), 3 pontos por nível
- Beli (moeda), reset de stats pago
- Salvamento em DataStore com autosave, retry com backoff e save no desligamento do servidor

**Combate**
- M1 (clique) com a arma equipada — punhos, katana (hitbox corpo a corpo) e pistola (raycast)
- 3 golpes de fruta por fruta (Z, X, C) em quatro formatos: projétil, área na mira, cone à frente, explosão ao redor
- Cooldowns visíveis na barra de golpes, números de dano flutuantes
- **Toda validação no servidor**: dano, alcance, cooldown e alvo

**PVE**
- 5 tipos de inimigo (nível 5 a 100, incluindo um boss) com IA de aggro, perseguição, ataque e leash
- Respawn automático, barra de vida por inimigo
- Recompensa por dano: quem mais bateu leva 100%, quem ajudou leva 40%

**PVP**
- Liberado a partir do nível 10, bloqueado em zona segura, dano reduzido entre jogadores
- Placa de nome com nível acima de cada jogador

**Mundo**
- 5 ilhas: Ilha do Início (segura), Vila dos Bandidos, Ruínas da Selva, Porto do Deserto, Fortaleza da Marinha
- Mar de Terrain water, cais de viagem entre ilhas com trava por nível
- Frutas nascendo sozinhas pelo mapa, com raridade sorteada e anúncio global das raras
- Respawn na ilha onde você morreu

**Missões**
- 5 missões de caça, uma ativa por vez, quadro de missões nos NPCs
- Progresso rastreado por abate, recompensa em XP e Beli

**Interface** (toda construída em runtime)
- HUD: nível, barra de XP, Beli, fruta, vida, zona atual, missão ativa
- Menu do personagem (M): distribuição de stats e loja de armas
- Toasts de notificação, quadro de missões

---

## Como rodar

Escolha **um** dos dois caminhos.

### Caminho A — Rojo (recomendado)

O código fica em arquivos versionados no Git e sincroniza com o Studio em tempo
real. Toda mudança que você (ou eu) fizer aparece no Studio sozinha.

**1. Instale as ferramentas** (uma vez só)

```bash
# Aftman gerencia a versão do Rojo declarada em aftman.toml
# https://github.com/LPGhatguy/aftman/releases
cd roblox-game
aftman install
```

Ou instale o Rojo direto: <https://rojo.space/docs/v7/getting-started/installation/>

**2. Instale o plugin do Rojo no Studio**

```bash
rojo plugin install
```

**3. Suba o servidor de sincronização**

```bash
cd roblox-game
rojo serve
```

**4. No Roblox Studio**

- Crie um Baseplate novo (ou abra um lugar vazio)
- **Apague o Baseplate e o SpawnLocation** que vêm por padrão — o mapa é gerado por código
- Abra a aba **Plugins → Rojo → Connect**
- A árvore aparece em ReplicatedStorage, ServerScriptService e StarterPlayer

**5. Aperte Play.** O mundo é construído no boot do servidor.

Para gerar um arquivo `.rbxl` fechado, sem sincronização:

```bash
rojo build -o MonkeyPirates.rbxl
```

### Caminho B — copiar e colar no Studio

Sem instalar nada. A desvantagem é que você repete o processo a cada
atualização. **Os nomes têm que ser exatamente estes** — os `require` do código
dependem deles.

```
ReplicatedStorage
└── Shared                    (Folder)
    ├── Net                   (ModuleScript)  ← src/shared/Net.lua
    ├── Config                (Folder)
    │   ├── GameConfig        (ModuleScript)
    │   ├── StatConfig        (ModuleScript)
    │   ├── WeaponConfig      (ModuleScript)
    │   ├── FruitConfig       (ModuleScript)
    │   ├── NpcConfig         (ModuleScript)
    │   ├── QuestConfig       (ModuleScript)
    │   └── ZoneConfig        (ModuleScript)
    └── Util                  (Folder)
        ├── Signal            (ModuleScript)
        ├── DamageMath        (ModuleScript)
        └── Cooldowns         (ModuleScript)

ServerScriptService
└── Game                      (Script)        ← src/server/init.server.lua
    ├── Services              (Folder)
    │   ├── DataService       (ModuleScript)
    │   ├── LevelService      (ModuleScript)
    │   ├── CharacterService  (ModuleScript)
    │   ├── CombatService     (ModuleScript)
    │   ├── NpcService        (ModuleScript)
    │   ├── QuestService      (ModuleScript)
    │   ├── FruitService      (ModuleScript)
    │   ├── ShopService       (ModuleScript)
    │   └── TravelService     (ModuleScript)
    └── World                 (Folder)
        ├── MapBuilder        (ModuleScript)
        └── RigBuilder        (ModuleScript)

StarterPlayer
└── StarterPlayerScripts
    └── Game                  (LocalScript)   ← src/client/init.client.lua
        ├── Ui                (ModuleScript)
        ├── ClientState       (ModuleScript)
        └── Controllers       (Folder)
            ├── HudController     (ModuleScript)
            ├── CombatController  (ModuleScript)
            ├── MenuController    (ModuleScript)
            ├── QuestController   (ModuleScript)
            ├── NotifyController  (ModuleScript)
            └── DamageController  (ModuleScript)
```

Regra geral: arquivo `X.lua` → ModuleScript chamado `X`. Os dois `init.*` viram
o Script/LocalScript pai, não um filho chamado "init".

---

## Configurações necessárias no Studio

**1. DataStore (obrigatório para salvar progresso)**

`Game Settings → Security → Enable Studio Access to API Services` → **ligado**.

Sem isso o jogo roda normalmente, mas nada é salvo e você verá um aviso no
Output. Em produção (jogo publicado) o DataStore funciona sem essa flag.

**2. Avatar R6 (recomendado)**

`Game Settings → Avatar → Avatar Type → R6`.

Os inimigos são rigs R6 construídos por código. O código do jogador suporta R6 e
R15, mas R6 deixa tudo consistente visualmente.

**3. Testar PVP**

`Test → Clients and Servers → 2 players → Start`. Suba os dois personagens até o
nível 10 e saia da Ilha do Início.

---

## Controles

| Ação | Tecla |
|---|---|
| Ataque com a arma (segurar mantém o combo) | Clique esquerdo |
| Golpes da fruta | `Z` `X` `C` |
| Menu do personagem (stats + loja) | `M` |
| Interagir (missões, comer fruta, viajar) | `E` |
| Fechar janelas | `Esc` |

No celular há um botão "Menu" na tela e o toque funciona como ataque.

---

## Loop do jogo

1. Você nasce na **Ilha do Início** (zona segura, sem PVP).
2. Pega a missão com o **Mestre Kenji** e viaja pelo cais até a **Vila dos Bandidos**.
3. Farma Bandidos → XP, Beli e progresso de missão.
4. Sobe de nível → distribui pontos no menu (`M`) → compra a Katana com 2.500 Beli.
5. Acha uma **fruta** no mapa (aparecem a cada 4 minutos) e ganha 3 golpes.
6. Nível 10 libera PVP fora das zonas seguras.
7. Avança pelas ilhas até enfrentar o **Capitão da Marinha** (nível 100, 12.000 de vida).

---

## Onde mexer para balancear

Tudo que é número está em `src/shared/Config/`. Nenhum service tem valor
mágico embutido.

| Quero mudar | Arquivo |
|---|---|
| Curva de XP, vida, velocidade, regras de PVP, cooldown global | `GameConfig.lua` |
| Categorias de stat e seus nomes | `StatConfig.lua` |
| Armas: dano, alcance, preço, nível mínimo | `WeaponConfig.lua` |
| Frutas: golpes, dano, cooldown, raridade, preço | `FruitConfig.lua` |
| Inimigos: vida, dano, XP, Beli, respawn, aggro | `NpcConfig.lua` |
| Missões: alvo, quantidade, recompensa | `QuestConfig.lua` |
| Ilhas: posição, tamanho, spawns, zona segura, NPCs de missão | `ZoneConfig.lua` |

Adicionar uma fruta nova, por exemplo, é só acrescentar uma entrada em
`FruitConfig.Fruits` com três golpes e colocar o id em `FruitConfig.Order`. O
sorteio de spawn, a UI, os cooldowns e o dano passam a funcionar sem nenhuma
outra mudança.

---

## Arquitetura

```
src/shared/     ReplicatedStorage — config e utilitários que os dois lados leem
src/server/     ServerScriptService — a única autoridade sobre o estado do jogo
src/client/     StarterPlayerScripts — input e interface, zero autoridade
```

**O servidor manda.** O cliente só pede ("quero usar Z apontando para aqui") e
desenha o que recebe. O perfil do jogador é replicado como um snapshot inteiro
pelo remote `State`; cada controller se inscreve em `ClientState.changed`.

**Ordem de boot** (`src/server/init.server.lua`): `Net` cria os remotes →
`MapBuilder` cria o mundo e os marcadores → os services sobem e encontram os
marcadores que precisam.

**Marcadores desacoplam o mapa dos sistemas.** `MapBuilder` cria parts
invisíveis com tags (`NpcSpawn`, `FruitSpawn`, `QuestGiver`, `TravelPad`) e os
services só procuram tags. Quando você trocar o mapa gerado por um feito à mão
no Studio, basta manter os marcadores — nenhum service muda.

---

## O que o servidor não confia no cliente

Vale saber, porque é onde jogos do gênero costumam ser explorados:

- **Mira**: a posição enviada pelo cliente é sempre truncada para o alcance do
  golpe, medida da posição real do jogador no servidor. Apontar para o outro
  lado do mapa não alcança nada além do permitido.
- **Cooldown**: contado no servidor, com uma pequena tolerância para latência. O
  cooldown do cliente é só feedback visual.
- **Dano**: calculado no servidor a partir do nível e dos stats salvos. O cliente
  nunca envia um valor de dano.
- **Alvos**: colhidos da lista de jogadores e dos NPCs marcados, filtrados por
  distância — o cliente não escolhe quem foi atingido.
- **Compras, stats e missões**: preço, nível mínimo, pontos disponíveis e alvo da
  missão são todos revalidados no servidor.
- **Vector3 inválido**: `NaN` e infinito são rejeitados antes de entrar em
  qualquer conta.

---

## O que ainda falta

Ordenado por quanto muda a sensação do jogo:

1. **Animações.** Os NPCs deslizam em vez de andar, e os golpes não têm pose. É a
   diferença mais visível entre isto e um jogo publicado. Precisa de Animations
   carregadas por asset id — é o único ponto que exige trabalho no Studio.
2. **Som.** Nenhum efeito sonoro ainda.
3. **Barcos** de verdade em vez dos cais de teleporte.
4. **Efeitos visuais no cliente.** Hoje os efeitos são parts criadas no servidor
   (simples e correto, mas gera tráfego). Mover para um remote `PlayVfx` e criar
   as parts localmente é a otimização natural quando o servidor encher.
5. **ProfileStore** no lugar do `DataService` atual, para session locking de
   verdade quando o jogo tiver muitos jogadores simultâneos.
6. **Raids de boss, trocas entre jogadores, ranking** (OrderedDataStore),
   game passes, dash e mobilidade.
7. **Usuário de fruta não nadar** — detalhe clássico do gênero, fácil de
   adicionar em `CharacterService`.

---

## Verificação

Todos os arquivos foram compilados com o compilador oficial do Luau
(`luau-compile`) sem erros. O que **não** foi verificado: comportamento em
runtime dentro do Studio — física dos rigs, tempo de geração do Terrain e
sensação do balanceamento só dá para avaliar jogando.
