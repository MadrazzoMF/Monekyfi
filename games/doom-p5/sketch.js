/* =============================================================================
   PULSO DO ABISMO
   FPS de raycasting (estilo Doom) escrito do zero em p5.js.
   Arte, mapas, sons e mecânicas 100% procedurais/originais.

   Mecânicas autorais:
     1. COMPASSO      - o mundo pulsa a 120 BPM; atirar na batida = dano dobrado
                        e devolução da munição. Portas de pulso abrem no compasso.
     2. ECO TEMPORAL  - os últimos 6s do seu movimento ficam gravados; solte um
                        fantasma que repete tudo (inclusive os tiros) e luta por você.
     3. FASE          - vire éter: atravessa paredes verdes, enxerga através delas
                        e fica imune a projéteis, mas não pode atirar.
     4. COLHEITA      - inimigos soltam almas; absorvê-las recarrega Éter e sobe o
                        multiplicador de Frenesi (dano crescente enquanto a corrente
                        de almas não quebrar).
     5. PACTO DE SANGUE - sem munição, a arma dispara consumindo vida.
   ============================================================================= */

'use strict';

// ----------------------------------------------------------------------------- config
const RW = 320, RH = 200;            // resolução interna (look pixelado)
const VIEW_W = 960, VIEW_H = 600;    // resolução da tela
const FOV = Math.PI / 3;
const TEX = 64;
const BPM = 120;
const BEAT_MS = 60000 / BPM;
const BEAT_WINDOW = 0.16;            // fração da batida que conta como "no compasso"
const REC_SECONDS = 6;
const REC_FRAMES = REC_SECONDS * 60;

// tiles: # parede tijolo | = parede tecno | ~ parede de fase | P porta de pulso
//        E saída | . chão | S spawn
const RAW_MAP = [
  '########################',
  '#S...#......=====......#',
  '#....#.....=.....=.....#',
  '#..#####...=.###.=..~~~#',
  '#..#.......P.#E#.=..#..#',
  '#..#.#####.=.#P#.=..#..#',
  '#....#...#.=.....=..#..#',
  '####.#.#.#.=======..#..#',
  '#....#.#.#..........#..#',
  '#.####.#.############..#',
  '#......#.....P.........#',
  '#.######.###.#########.#',
  '#.#....#.#.....#.....#.#',
  '#.#.##.#.#.###.#.###.#.#',
  '#.#.#~~~~~#.#.#...#..#.#',
  '#.#.#.....#.#.#####..#.#',
  '#.#.#######.#........#.#',
  '#.#.........#.########.#',
  '#.###########.#......#.#',
  '#.............#.####.#.#',
  '####.#######..#.#..#.#.#',
  '#..........#..#....#...#',
  '#..~~~~....#.......#...#',
  '########################',
];
const MW = RAW_MAP[0].length;
const MH = RAW_MAP.length;
let grid = [];

// ----------------------------------------------------------------------------- estado
let buf;                    // framebuffer interno
let zbuf = new Float32Array(RW);
let wallTex = [];           // texturas de parede (Uint8ClampedArray)
let sprTex = [];            // texturas de sprite (com alpha)

const WALL_BRICK = 0, WALL_TECH = 1, WALL_PHASE = 2, WALL_DOOR = 3, WALL_EXIT = 4;
const SPR_IMP = 0, SPR_HOUND = 1, SPR_SENTINEL = 2, SPR_SOUL = 3, SPR_BALL = 4,
      SPR_ECHO = 5, SPR_AMMO = 6, SPR_MED = 7;

let player, enemies, shots, souls, pickups, echoes;
let floorNum = 1, kills = 0, gameState = 'title'; // title | play | dead | clear
let record = [], recHead = 0, recCount = 0;
let shakeT = 0, flashT = 0, flashCol = [255, 0, 0];
let msg = '', msgT = 0;
let audioCtx = null, lastBeatIndex = -1;
let keysDown = {};

// toque (celular/tablet): analógico virtual + arrasto para mirar + botões
let touchMode = false;
let stick = null;          // { id, ox, oy, x, y }
let look = null;           // { id, px }
let firing = false;
let btnHeld = { fase: false, eco: false, arma: false };
const TBTN = {
  fire: { x: VIEW_W - 92,  y: VIEW_H - 108, r: 54, label: 'FOGO' },
  fase: { x: VIEW_W - 196, y: VIEW_H - 66,  r: 34, label: 'FASE' },
  eco:  { x: VIEW_W - 196, y: VIEW_H - 152, r: 34, label: 'ECO'  },
  arma: { x: VIEW_W - 92,  y: VIEW_H - 212, r: 30, label: 'ARMA' },
};

const WEAPONS = [
  { name: 'PISTOLA',  dmg: 14, ammo: 'balas',     cost: 1, rate: 260, spread: 0.01, pellets: 1, kind: 'hit'  },
  { name: 'ESCOPETA', dmg: 9,  ammo: 'cartuchos', cost: 1, rate: 720, spread: 0.11, pellets: 8, kind: 'hit'  },
  { name: 'CEIFADOR', dmg: 26, ammo: 'celulas',   cost: 1, rate: 420, spread: 0.0,  pellets: 1, kind: 'proj' },
];

// ----------------------------------------------------------------------------- util
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const now = () => millis();
const beatFloat = () => now() / BEAT_MS;
const beatPhase = () => beatFloat() % 1;
const onBeat = () => { const p = beatPhase(); return p < BEAT_WINDOW || p > 1 - BEAT_WINDOW; };
const doorsOpen = () => (Math.floor(beatFloat()) % 2) === 0;

function tileAt(x, y) {
  const ix = Math.floor(x), iy = Math.floor(y);
  if (ix < 0 || iy < 0 || ix >= MW || iy >= MH) return '#';
  return grid[iy][ix];
}

/** A célula bloqueia movimento/visão para quem está (ou não) em fase? */
function blocks(ch, phased) {
  if (ch === '.' || ch === 'S') return false;
  if (ch === 'E') return false;
  if (ch === '~') return !phased;          // parede de fase: some quando você é éter
  if (ch === 'P') return !doorsOpen();     // porta de pulso: abre no compasso
  return true;
}

function texOf(ch) {
  if (ch === '=') return WALL_TECH;
  if (ch === '~') return WALL_PHASE;
  if (ch === 'P') return WALL_DOOR;
  return WALL_BRICK;
}

function say(t) { msg = t; msgT = now(); }

// ----------------------------------------------------------------------------- áudio
function blip(freq, dur, type, gain) {
  if (!audioCtx) return;
  const o = audioCtx.createOscillator(), g = audioCtx.createGain();
  o.type = type || 'square';
  o.frequency.setValueAtTime(freq, audioCtx.currentTime);
  o.frequency.exponentialRampToValueAtTime(Math.max(30, freq * 0.4), audioCtx.currentTime + dur);
  g.gain.setValueAtTime(gain === undefined ? 0.08 : gain, audioCtx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + dur);
  o.connect(g); g.connect(audioCtx.destination);
  o.start(); o.stop(audioCtx.currentTime + dur);
}
function initAudio() {
  if (audioCtx) return;
  try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { audioCtx = null; }
}

// ----------------------------------------------------------------------------- texturas
function bakeGraphics(g) {
  g.loadPixels();
  return new Uint8ClampedArray(g.pixels);
}

function makeWallTextures() {
  const mk = () => createGraphics(TEX, TEX);

  // tijolo infernal
  let g = mk(); g.noStroke(); g.background(58, 26, 26);
  for (let y = 0; y < TEX; y += 16) {
    for (let x = 0; x < TEX; x += 32) {
      const ox = (y / 16) % 2 === 0 ? 0 : 16;
      g.fill(96 + Math.random() * 24, 34, 30);
      g.rect(x + ox + 1, y + 1, 30, 14);
    }
  }
  for (let i = 0; i < 500; i++) { g.fill(0, 0, 0, 40); g.rect(Math.random() * TEX, Math.random() * TEX, 1, 1); }
  wallTex[WALL_BRICK] = bakeGraphics(g);

  // painel tecno
  g = mk(); g.noStroke(); g.background(30, 38, 50);
  for (let i = 0; i < 8; i++) { g.fill(46, 58, 74); g.rect(2, i * 8 + 1, 60, 6); }
  g.fill(120, 190, 220); g.rect(4, 4, 4, 56); g.rect(56, 4, 4, 56);
  for (let i = 0; i < 300; i++) { g.fill(255, 255, 255, 18); g.rect(Math.random() * TEX, Math.random() * TEX, 1, 1); }
  wallTex[WALL_TECH] = bakeGraphics(g);

  // parede de fase (verde, atravessável em fase)
  g = mk(); g.noStroke(); g.background(14, 52, 40);
  for (let y = 0; y < TEX; y++) {
    const a = 40 + 40 * Math.sin(y * 0.4);
    g.fill(40, 200 - a, 120 + a * 0.5, 200);
    g.rect(0, y, TEX, 1);
  }
  for (let i = 0; i < 120; i++) { g.fill(180, 255, 220, 120); g.rect(Math.random() * TEX, Math.random() * TEX, 2, 2); }
  wallTex[WALL_PHASE] = bakeGraphics(g);

  // porta de pulso
  g = mk(); g.noStroke(); g.background(60, 48, 20);
  g.fill(150, 120, 40); g.rect(6, 2, 52, 60);
  g.fill(230, 190, 70); g.rect(28, 8, 8, 48);
  wallTex[WALL_DOOR] = bakeGraphics(g);

  // saída
  g = mk(); g.noStroke(); g.background(20, 20, 40);
  for (let i = 0; i < 6; i++) { g.fill(90 + i * 22, 60, 220); g.rect(4 + i * 5, 4 + i * 5, 56 - i * 10, 56 - i * 10); }
  wallTex[WALL_EXIT] = bakeGraphics(g);
}

function makeSpriteTextures() {
  const mk = () => { const g = createGraphics(TEX, TEX); g.clear(); g.noStroke(); return g; };
  let g;

  // IMP: lançador de bolas de fogo
  g = mk();
  g.fill(150, 40, 30); g.ellipse(32, 40, 30, 34);
  g.fill(180, 60, 40); g.ellipse(32, 20, 22, 20);
  g.fill(255, 220, 90); g.ellipse(26, 18, 6, 8); g.ellipse(38, 18, 6, 8);
  g.fill(120, 30, 25); g.triangle(20, 12, 24, 0, 28, 12); g.triangle(36, 12, 40, 0, 44, 12);
  g.fill(150, 40, 30); g.rect(14, 32, 6, 20); g.rect(44, 32, 6, 20);
  sprTex[SPR_IMP] = bakeGraphics(g);

  // CÃO: corpo baixo e rápido
  g = mk();
  g.fill(90, 60, 40); g.ellipse(32, 44, 42, 22);
  g.fill(110, 74, 48); g.ellipse(46, 36, 20, 18);
  g.fill(255, 80, 40); g.ellipse(50, 34, 5, 5);
  g.fill(70, 46, 30); g.rect(18, 50, 5, 12); g.rect(30, 50, 5, 12); g.rect(42, 50, 5, 12);
  sprTex[SPR_HOUND] = bakeGraphics(g);

  // SENTINELA: torre que só dispara na batida
  g = mk();
  g.fill(80, 88, 100); g.rect(22, 28, 20, 34);
  g.fill(110, 120, 136); g.rect(18, 16, 28, 14);
  g.fill(120, 230, 255); g.ellipse(32, 23, 12, 8);
  g.fill(60, 66, 76); g.rect(28, 8, 8, 10);
  sprTex[SPR_SENTINEL] = bakeGraphics(g);

  // ALMA
  g = mk();
  for (let r = 16; r > 0; r -= 2) { g.fill(120, 220, 255, 30 + (16 - r) * 12); g.ellipse(32, 32, r * 2, r * 2); }
  sprTex[SPR_SOUL] = bakeGraphics(g);

  // PROJÉTIL
  g = mk();
  for (let r = 14; r > 0; r -= 2) { g.fill(255, 160 - r * 6, 40, 40 + (14 - r) * 14); g.ellipse(32, 32, r * 2, r * 2); }
  sprTex[SPR_BALL] = bakeGraphics(g);

  // ECO (fantasma do jogador)
  g = mk();
  g.fill(90, 200, 255, 130); g.ellipse(32, 40, 26, 34); g.ellipse(32, 20, 18, 18);
  g.fill(200, 245, 255, 180); g.ellipse(27, 19, 4, 5); g.ellipse(37, 19, 4, 5);
  sprTex[SPR_ECHO] = bakeGraphics(g);

  // MUNIÇÃO
  g = mk();
  g.fill(200, 180, 60); g.rect(20, 34, 24, 18);
  g.fill(240, 230, 120); g.rect(20, 30, 24, 6);
  sprTex[SPR_AMMO] = bakeGraphics(g);

  // MEDKIT
  g = mk();
  g.fill(230, 235, 240); g.rect(20, 32, 24, 20);
  g.fill(210, 40, 50); g.rect(30, 36, 4, 12); g.rect(26, 40, 12, 4);
  sprTex[SPR_MED] = bakeGraphics(g);
}

// ----------------------------------------------------------------------------- entidades
function makePlayer(x, y) {
  return {
    x, y, dir: 0, hp: 100, maxHp: 100, eter: 100, maxEter: 100,
    ammo: { balas: 60, cartuchos: 20, celulas: 25 },
    weapon: 0, lastShot: 0, phased: false, bob: 0,
    frenzy: 1, frenzyT: 0, echoCharges: 1, combo: 0,
  };
}

const ENEMY_KINDS = {
  imp:      { hp: 34, spd: 1.5, dmg: 11, range: 9,  cd: 1500, spr: SPR_IMP,      ranged: true,  soul: 2 },
  hound:    { hp: 26, spd: 3.1, dmg: 9,  range: 0.9, cd: 700, spr: SPR_HOUND,    ranged: false, soul: 1 },
  sentinel: { hp: 60, spd: 0.0, dmg: 14, range: 13, cd: 900,  spr: SPR_SENTINEL, ranged: true,  soul: 3, beatOnly: true },
};

function spawnEnemy(kind, x, y) {
  const k = ENEMY_KINDS[kind];
  enemies.push({ kind, x, y, hp: k.hp * (1 + (floorNum - 1) * 0.18), max: k.hp, cd: 0, hurt: 0, dead: false });
}

function freeCells() {
  const out = [];
  for (let y = 1; y < MH - 1; y++) for (let x = 1; x < MW - 1; x++) {
    if (grid[y][x] === '.' ) out.push([x + 0.5, y + 0.5]);
  }
  return out;
}

function resetLevel(full) {
  grid = RAW_MAP.map(r => r.split(''));
  enemies = []; shots = []; souls = []; pickups = []; echoes = [];
  record = []; recHead = 0; recCount = 0;

  let sx = 1.5, sy = 1.5;
  for (let y = 0; y < MH; y++) for (let x = 0; x < MW; x++) if (grid[y][x] === 'S') { sx = x + 0.5; sy = y + 0.5; }

  if (full) { player = makePlayer(sx, sy); floorNum = 1; kills = 0; }
  else {
    player.x = sx; player.y = sy; player.dir = 0; player.phased = false;
    player.hp = clamp(player.hp + 25, 0, player.maxHp);
    player.eter = player.maxEter;
    player.echoCharges = Math.min(3, player.echoCharges + 1);
  }

  const cells = freeCells().filter(c => Math.hypot(c[0] - sx, c[1] - sy) > 6);
  const n = 7 + floorNum * 3;
  for (let i = 0; i < n; i++) {
    const c = cells[Math.floor(Math.random() * cells.length)];
    const r = Math.random();
    spawnEnemy(r < 0.45 ? 'imp' : r < 0.8 ? 'hound' : 'sentinel', c[0], c[1]);
  }
  for (let i = 0; i < 5; i++) {
    const c = cells[Math.floor(Math.random() * cells.length)];
    pickups.push({ x: c[0], y: c[1], type: Math.random() < 0.6 ? 'ammo' : 'med' });
  }
}

// ----------------------------------------------------------------------------- setup
function setup() {
  const c = createCanvas(VIEW_W, VIEW_H);
  c.parent('game');
  pixelDensity(1);
  noSmooth();
  buf = createImage(RW, RH);
  buf.loadPixels();
  makeWallTextures();
  makeSpriteTextures();
  resetLevel(true);
  textFont('monospace');
}

// ----------------------------------------------------------------------------- movimento
function tryMove(e, nx, ny, phased) {
  const r = 0.22;
  if (!blocks(tileAt(nx + Math.sign(nx - e.x) * r, e.y), phased)) e.x = nx;
  if (!blocks(tileAt(e.x, ny + Math.sign(ny - e.y) * r), phased)) e.y = ny;
}

/** Raycast simples usado por tiros hitscan e linha de visão. */
function rayWallDist(ox, oy, ang, phased, maxD) {
  const dx = Math.cos(ang), dy = Math.sin(ang);
  const step = 0.03;
  for (let d = 0; d < maxD; d += step) {
    if (blocks(tileAt(ox + dx * d, oy + dy * d), phased)) return d;
  }
  return maxD;
}

function losClear(ax, ay, bx, by) {
  const d = Math.hypot(bx - ax, by - ay);
  return rayWallDist(ax, ay, Math.atan2(by - ay, bx - ax), false, d) >= d - 0.05;
}

// ----------------------------------------------------------------------------- combate
function damageEnemy(en, dmg, fromEcho) {
  en.hp -= dmg;
  en.hurt = now();
  if (en.hp <= 0 && !en.dead) {
    en.dead = true;
    kills++;
    const k = ENEMY_KINDS[en.kind];
    for (let i = 0; i < k.soul; i++) {
      souls.push({ x: en.x + (Math.random() - 0.5) * 0.4, y: en.y + (Math.random() - 0.5) * 0.4, t: now(), vz: 0 });
    }
    blip(140, 0.25, 'sawtooth', 0.09);
    if (!fromEcho) shakeT = now();
  }
}

/** Hitscan: acha o inimigo mais próximo dentro de um cone estreito ao longo do raio. */
function hitscan(ox, oy, ang, dmg, fromEcho) {
  const wall = rayWallDist(ox, oy, ang, false, 22);
  let best = null, bestD = wall;
  for (const en of enemies) {
    if (en.dead) continue;
    const dx = en.x - ox, dy = en.y - oy;
    const dist = Math.hypot(dx, dy);
    if (dist > bestD) continue;
    let da = Math.atan2(dy, dx) - ang;
    while (da > Math.PI) da -= Math.PI * 2;
    while (da < -Math.PI) da += Math.PI * 2;
    if (Math.abs(da) < Math.atan2(0.35, Math.max(0.4, dist))) { best = en; bestD = dist; }
  }
  if (best) damageEnemy(best, dmg, fromEcho);
}

function playerShoot() {
  const w = WEAPONS[player.weapon];
  if (now() - player.lastShot < w.rate) return;
  if (player.phased) { say('EM FASE: ARMAS SELADAS'); return; }

  const beat = onBeat();
  let bloodPact = false;
  if (player.ammo[w.ammo] < w.cost) {
    if (player.hp <= 12) { say('SEM MUNICAO E SEM SANGUE'); blip(90, 0.1, 'square', 0.05); return; }
    bloodPact = true;
    player.hp -= 8;                          // PACTO DE SANGUE
    flashT = now(); flashCol = [200, 0, 0];
    say('PACTO DE SANGUE  -8 VIDA');
  } else {
    player.ammo[w.ammo] -= w.cost;
    if (beat) player.ammo[w.ammo] += w.cost; // tiro no compasso devolve a munição
  }

  player.lastShot = now();
  const mult = (beat ? 2 : 1) * player.frenzy * (bloodPact ? 1.6 : 1);

  if (w.kind === 'proj') {
    shots.push({ x: player.x, y: player.y, a: player.dir, spd: 7, dmg: w.dmg * mult, mine: true, life: now() });
  } else {
    for (let i = 0; i < w.pellets; i++) {
      hitscan(player.x, player.y, player.dir + (Math.random() - 0.5) * w.spread * 2, w.dmg * mult, false);
    }
  }
  shakeT = now() - (beat ? 0 : 60);
  player.didShoot = true;
  blip(beat ? 520 : 300, 0.09, 'square', 0.06);
  if (beat) { flashT = now(); flashCol = [255, 210, 90]; say('NO COMPASSO  x2'); }
}

// ----------------------------------------------------------------------------- eco temporal
function pushRecord() {
  const f = { x: player.x, y: player.y, dir: player.dir, shot: player.didShoot ? 1 : 0, w: player.weapon };
  if (record.length < REC_FRAMES) record.push(f);
  else { record[recHead] = f; recHead = (recHead + 1) % REC_FRAMES; }
  recCount = Math.min(recCount + 1, REC_FRAMES);
}

function releaseEcho() {
  if (player.echoCharges < 1) { say('SEM CARGA DE ECO'); return; }
  if (player.eter < 30) { say('ETER INSUFICIENTE'); return; }
  if (recCount < 30) { say('MEMORIA CURTA DEMAIS'); return; }
  player.echoCharges--; player.eter -= 30;
  const frames = [];
  for (let i = 0; i < recCount; i++) frames.push(record[(recHead + i) % record.length]);
  echoes.push({ frames, i: 0, born: now() });
  say('ECO TEMPORAL LIBERADO');
  blip(700, 0.3, 'triangle', 0.07);
}

function updateEchoes(dt) {
  for (const e of echoes) {
    e.i += dt * 60;
    const idx = Math.floor(e.i);
    if (idx >= e.frames.length) { e.done = true; continue; }
    const f = e.frames[idx];
    e.x = f.x; e.y = f.y; e.dir = f.dir;
    if (f.shot) {
      const w = WEAPONS[f.w];
      // o eco luta com metade do dano, mas mira sozinho no alvo mais próximo
      let tgt = null, td = 12;
      for (const en of enemies) if (!en.dead) {
        const d = Math.hypot(en.x - e.x, en.y - e.y);
        if (d < td && losClear(e.x, e.y, en.x, en.y)) { td = d; tgt = en; }
      }
      const ang = tgt ? Math.atan2(tgt.y - e.y, tgt.x - e.x) : e.dir;
      hitscan(e.x, e.y, ang, w.dmg * 0.5, true);
      blip(420, 0.05, 'triangle', 0.03);
    }
  }
  echoes = echoes.filter(e => !e.done);
}

// ----------------------------------------------------------------------------- update
function update(dt) {
  const p = player;

  // --- pulso do mundo (batida audível + porta abrindo)
  const bi = Math.floor(beatFloat());
  if (bi !== lastBeatIndex) { lastBeatIndex = bi; blip(bi % 4 === 0 ? 180 : 120, 0.06, 'sine', 0.05); }

  // --- fase
  if (p.phased) {
    p.eter -= dt * 26;
    if (p.eter <= 0) { p.eter = 0; p.phased = false; say('FASE COLAPSOU'); }
  } else {
    p.eter = clamp(p.eter + dt * 4, 0, p.maxEter);
  }

  // --- movimento
  let fwd = keysDown[87] ? 1 : keysDown[83] ? -1 : 0;
  let str = keysDown[68] ? 1 : keysDown[65] ? -1 : 0;
  let sprint = !!keysDown[16];
  if (stick) {                                   // analógico virtual
    const dx = (stick.x - stick.ox) / 56, dy = (stick.y - stick.oy) / 56;
    const m = Math.hypot(dx, dy);
    if (m > 0.18) { fwd += clamp(-dy, -1, 1); str += clamp(dx, -1, 1); }
    if (m > 0.92) sprint = true;                 // empurrar o analógico até o fim = correr
  }
  const run = sprint ? 1.7 : 1;
  const spd = (p.phased ? 2.6 : 3.4) * run * dt;
  const rot = 2.4 * dt;
  let mx = 0, my = 0;
  if (keysDown[37]) p.dir -= rot;
  if (keysDown[39]) p.dir += rot;
  if (keysDown[38]) { mx += Math.cos(p.dir); my += Math.sin(p.dir); }
  if (keysDown[40]) { mx -= Math.cos(p.dir); my -= Math.sin(p.dir); }
  mx += Math.cos(p.dir) * fwd + Math.cos(p.dir + Math.PI / 2) * str;
  my += Math.sin(p.dir) * fwd + Math.sin(p.dir + Math.PI / 2) * str;
  const ml = Math.hypot(mx, my);
  if (ml > 0) {
    tryMove(p, p.x + (mx / ml) * spd, p.y + (my / ml) * spd, p.phased);
    p.bob += dt * 9 * run;
  }
  // se a fase acabou dentro de uma parede, empurra pra fora
  if (!p.phased && blocks(tileAt(p.x, p.y), false)) {
    p.hp -= 12 * dt; flashT = now(); flashCol = [40, 220, 160];
  }

  if (firing || (!touchMode && (mouseIsPressed || keysDown[17] || keysDown[32]))) playerShoot();
  pushRecord();
  p.didShoot = false;
  updateEchoes(dt);

  // --- frenesi decai
  if (p.frenzy > 1 && now() - p.frenzyT > 4000) { p.frenzy = 1; p.combo = 0; say('FRENESI PERDIDO'); }

  // --- inimigos
  for (const en of enemies) {
    if (en.dead) continue;
    const k = ENEMY_KINDS[en.kind];
    // alvo: jogador (se não estiver em fase) ou o eco mais próximo
    let tx = p.x, ty = p.y, targetIsEcho = false;
    for (const e of echoes) {
      if (Math.hypot(e.x - en.x, e.y - en.y) < Math.hypot(tx - en.x, ty - en.y)) { tx = e.x; ty = e.y; targetIsEcho = true; }
    }
    if (p.phased && !targetIsEcho) continue;  // em fase você é invisível para eles

    const d = Math.hypot(tx - en.x, ty - en.y);
    const see = losClear(en.x, en.y, tx, ty);
    const ang = Math.atan2(ty - en.y, tx - en.x);

    if (k.spd > 0 && see && d > (k.ranged ? 3.2 : 0.7)) {
      const s = k.spd * (1 + (floorNum - 1) * 0.08) * dt * (onBeat() ? 1.5 : 1); // eles também sentem o compasso
      tryMove(en, en.x + Math.cos(ang) * s, en.y + Math.sin(ang) * s, false);
    }
    if (see && d < k.range && now() - en.cd > k.cd) {
      if (k.beatOnly && !onBeat()) continue;  // sentinela só dispara na batida
      en.cd = now();
      if (k.ranged) shots.push({ x: en.x, y: en.y, a: ang, spd: 4.2, dmg: k.dmg, mine: false, life: now() });
      else if (d < 1.0 && !targetIsEcho) { p.hp -= k.dmg; flashT = now(); flashCol = [220, 20, 20]; blip(110, 0.1, 'square', 0.06); }
    }
  }
  enemies = enemies.filter(e => !e.dead || now() - e.hurt < 300);

  // --- projéteis
  for (const s of shots) {
    const nx = s.x + Math.cos(s.a) * s.spd * dt, ny = s.y + Math.sin(s.a) * s.spd * dt;
    if (blocks(tileAt(nx, ny), false)) { s.done = true; continue; }
    s.x = nx; s.y = ny;
    if (now() - s.life > 4000) s.done = true;
    if (s.mine) {
      for (const en of enemies) if (!en.dead && Math.hypot(en.x - s.x, en.y - s.y) < 0.45) { damageEnemy(en, s.dmg, false); s.done = true; break; }
    } else {
      if (!player.phased && Math.hypot(p.x - s.x, p.y - s.y) < 0.35) {
        p.hp -= s.dmg; s.done = true; flashT = now(); flashCol = [220, 40, 20]; blip(100, 0.12, 'square', 0.06);
      }
      for (const e of echoes) if (Math.hypot(e.x - s.x, e.y - s.y) < 0.35) s.done = true;
    }
  }
  shots = shots.filter(s => !s.done);

  // --- almas (colheita)
  for (const s of souls) {
    const d = Math.hypot(p.x - s.x, p.y - s.y);
    if (d < 3.5) { s.x += (p.x - s.x) * dt * 2.4; s.y += (p.y - s.y) * dt * 2.4; }  // são atraídas
    if (d < 0.5) {
      s.done = true;
      p.eter = clamp(p.eter + 9, 0, p.maxEter);
      p.combo++;
      p.frenzy = clamp(1 + p.combo * 0.06, 1, 2.2);
      p.frenzyT = now();
      if (p.combo % 8 === 0) { p.echoCharges = Math.min(3, p.echoCharges + 1); say('CARGA DE ECO GANHA'); }
      blip(880 + p.combo * 8, 0.06, 'sine', 0.05);
    }
    if (now() - s.t > 16000) s.done = true;
  }
  souls = souls.filter(s => !s.done);

  // --- itens
  for (const it of pickups) {
    if (Math.hypot(p.x - it.x, p.y - it.y) < 0.5) {
      it.done = true;
      if (it.type === 'ammo') { p.ammo.balas += 24; p.ammo.cartuchos += 8; p.ammo.celulas += 12; say('MUNICAO'); }
      else { p.hp = clamp(p.hp + 28, 0, p.maxHp); say('KIT MEDICO'); }
      blip(660, 0.08, 'triangle', 0.05);
    }
  }
  pickups = pickups.filter(i => !i.done);

  // --- saída / morte
  const alive = enemies.filter(e => !e.dead).length;
  if (alive === 0 && tileAt(p.x, p.y) === 'E') { floorNum++; resetLevel(false); say('ANDAR ' + floorNum); }
  if (p.hp <= 0) { gameState = 'dead'; }
}

// ----------------------------------------------------------------------------- render 3D
function render() {
  const px = buf.pixels;
  const p = player;
  const dirX = Math.cos(p.dir), dirY = Math.sin(p.dir);
  const planeX = -dirY * Math.tan(FOV / 2), planeY = dirX * Math.tan(FOV / 2);
  const horizon = RH >> 1;

  // --- céu + chão (com casting de chão barato por linha)
  for (let y = 0; y < RH; y++) {
    const isFloor = y > horizon;
    const pY = isFloor ? (y - horizon) : (horizon - y);
    const rowDist = pY === 0 ? 1e6 : (0.5 * RH) / pY;
    const stepX = (rowDist * 2 * planeX) / RW, stepY = (rowDist * 2 * planeY) / RW;
    let fx = p.x + rowDist * (dirX - planeX), fy = p.y + rowDist * (dirY - planeY);
    const fog = clamp(1 - rowDist / 14, 0, 1);
    for (let x = 0; x < RW; x++) {
      const cx = Math.floor(fx * 2), cy = Math.floor(fy * 2);
      const chk = ((cx + cy) & 1) === 0;
      let r, g, b;
      if (isFloor) {
        r = (chk ? 62 : 44) * fog; g = (chk ? 48 : 34) * fog; b = (chk ? 42 : 32) * fog;
      } else {
        const t = 1 - y / horizon;
        r = 10 + 26 * t; g = 8 + 12 * t; b = 18 + 34 * t;
        if (onBeat()) { r += 14; b += 22; }
      }
      const i = (y * RW + x) * 4;
      px[i] = r; px[i + 1] = g; px[i + 2] = b; px[i + 3] = 255;
      fx += stepX; fy += stepY;
    }
  }

  // --- paredes (DDA)
  for (let x = 0; x < RW; x++) {
    const camX = (2 * x) / RW - 1;
    const rdX = dirX + planeX * camX, rdY = dirY + planeY * camX;
    let mapX = Math.floor(p.x), mapY = Math.floor(p.y);
    const dDX = Math.abs(1 / (rdX || 1e-9)), dDY = Math.abs(1 / (rdY || 1e-9));
    let stepX, stepY, sdX, sdY;
    if (rdX < 0) { stepX = -1; sdX = (p.x - mapX) * dDX; } else { stepX = 1; sdX = (mapX + 1 - p.x) * dDX; }
    if (rdY < 0) { stepY = -1; sdY = (p.y - mapY) * dDY; } else { stepY = 1; sdY = (mapY + 1 - p.y) * dDY; }

    let side = 0, hitCh = '#', guard = 0;
    while (guard++ < 128) {
      if (sdX < sdY) { sdX += dDX; mapX += stepX; side = 0; } else { sdY += dDY; mapY += stepY; side = 1; }
      const ch = tileAt(mapX + 0.5, mapY + 0.5);
      if (blocks(ch, p.phased)) { hitCh = ch; break; }
      if (ch === 'E') { hitCh = 'E'; break; }  // saída é sólida visualmente
    }
    const perp = side === 0 ? (sdX - dDX) : (sdY - dDY);
    const dist = Math.max(0.05, perp);
    zbuf[x] = dist;

    const lineH = Math.floor(RH / dist);
    const dStart = Math.max(0, -((lineH >> 1)) + (RH >> 1));
    const dEnd = Math.min(RH - 1, (lineH >> 1) + (RH >> 1));

    let wallX = side === 0 ? p.y + dist * rdY : p.x + dist * rdX;
    wallX -= Math.floor(wallX);
    let texX = Math.floor(wallX * TEX);
    if ((side === 0 && rdX > 0) || (side === 1 && rdY < 0)) texX = TEX - texX - 1;

    const tex = wallTex[hitCh === 'E' ? WALL_EXIT : texOf(hitCh)];
    const cleared = enemies.filter(e => !e.dead).length === 0;
    let shade = clamp(1.15 - dist / 13, 0, 1) * (side === 1 ? 0.72 : 1);
    if (hitCh === 'P') shade *= doorsOpen() ? 1 : 0.6 + 0.4 * Math.sin(beatFloat() * Math.PI * 2);
    if (hitCh === 'E') shade *= cleared ? 1.4 : 0.5;

    const step = TEX / lineH;
    let texPos = (dStart - (RH >> 1) + (lineH >> 1)) * step;
    for (let y = dStart; y <= dEnd; y++) {
      const texY = clamp(Math.floor(texPos), 0, TEX - 1);
      texPos += step;
      const ti = (texY * TEX + texX) * 4;
      const i = (y * RW + x) * 4;
      px[i] = tex[ti] * shade; px[i + 1] = tex[ti + 1] * shade; px[i + 2] = tex[ti + 2] * shade;
    }
  }

  // --- sprites
  const list = [];
  for (const e of enemies) if (!e.dead) list.push({ x: e.x, y: e.y, t: ENEMY_KINDS[e.kind].spr, s: 1, off: 0, hurt: now() - e.hurt < 120 });
  for (const s of souls) list.push({ x: s.x, y: s.y, t: SPR_SOUL, s: 0.4, off: 0.25 });
  for (const s of shots) list.push({ x: s.x, y: s.y, t: SPR_BALL, s: 0.35, off: 0.15 });
  for (const e of echoes) list.push({ x: e.x, y: e.y, t: SPR_ECHO, s: 1, off: 0, ghost: true });
  for (const it of pickups) list.push({ x: it.x, y: it.y, t: it.type === 'ammo' ? SPR_AMMO : SPR_MED, s: 0.5, off: 0.3 });

  list.sort((a, b) => Math.hypot(b.x - p.x, b.y - p.y) - Math.hypot(a.x - p.x, a.y - p.y));
  const invDet = 1 / (planeX * dirY - dirX * planeY);

  for (const sp of list) {
    const rx = sp.x - p.x, ry = sp.y - p.y;
    const tX = invDet * (dirY * rx - dirX * ry);
    const tY = invDet * (-planeY * rx + planeX * ry);
    if (tY <= 0.15) continue;
    const scrX = Math.floor((RW / 2) * (1 + tX / tY));
    const h = Math.abs(Math.floor(RH / tY)) * sp.s;
    const w = h;
    const vMove = (sp.off * RH) / tY;
    const yStart = Math.max(0, Math.floor(RH / 2 - h / 2 + vMove));
    const yEnd = Math.min(RH - 1, Math.floor(RH / 2 + h / 2 + vMove));
    const xStart = Math.max(0, Math.floor(scrX - w / 2));
    const xEnd = Math.min(RW - 1, Math.floor(scrX + w / 2));
    const tex = sprTex[sp.t];
    const shade = clamp(1.2 - tY / 13, 0.15, 1);

    for (let x = xStart; x <= xEnd; x++) {
      if (tY >= zbuf[x]) continue;
      const texX = clamp(Math.floor(((x - (scrX - w / 2)) * TEX) / w), 0, TEX - 1);
      for (let y = yStart; y <= yEnd; y++) {
        const texY = clamp(Math.floor((((y - vMove) - (RH / 2 - h / 2)) * TEX) / h), 0, TEX - 1);
        const ti = (texY * TEX + texX) * 4;
        const a = tex[ti + 3];
        if (a < 12) continue;
        const i = (y * RW + x) * 4;
        const k = (a / 255) * (sp.ghost ? 0.6 : 1);
        let r = tex[ti] * shade, g = tex[ti + 1] * shade, b = tex[ti + 2] * shade;
        if (sp.hurt) { r = 255; g = 200; b = 200; }
        px[i] = px[i] * (1 - k) + r * k;
        px[i + 1] = px[i + 1] * (1 - k) + g * k;
        px[i + 2] = px[i + 2] * (1 - k) + b * k;
      }
    }
  }

  buf.updatePixels();
  push();
  const sh = Math.max(0, 1 - (now() - shakeT) / 160);
  translate((Math.random() - 0.5) * 10 * sh, (Math.random() - 0.5) * 10 * sh);
  image(buf, 0, 0, VIEW_W, VIEW_H);
  pop();
}

// ----------------------------------------------------------------------------- HUD
function drawWeapon() {
  const p = player;
  const bobX = Math.sin(p.bob) * 10, bobY = Math.abs(Math.cos(p.bob)) * 8;
  const kick = Math.max(0, 1 - (now() - p.lastShot) / 140) * 26;
  push();
  translate(VIEW_W / 2 + bobX, VIEW_H - 60 + bobY + kick);
  noStroke();
  if (p.phased) { pop(); return; }
  if (p.weapon === 0) {
    fill(60); rect(-16, -70, 32, 80); fill(95); rect(-10, -110, 20, 46); fill(30); rect(-5, -114, 10, 8);
  } else if (p.weapon === 1) {
    fill(70, 50, 30); rect(-26, -60, 52, 74); fill(110); rect(-20, -120, 16, 64); rect(4, -120, 16, 64);
  } else {
    fill(40, 60, 80); rect(-24, -70, 48, 84);
    fill(120, 230, 255, 180 + 60 * Math.sin(now() / 90)); ellipse(0, -110, 34, 34);
    fill(30, 50, 70); rect(-8, -140, 16, 30);
  }
  pop();
}

function bar(x, y, w, h, frac, col, label) {
  noStroke();
  fill(20, 22, 30); rect(x, y, w, h);
  fill(col[0], col[1], col[2]); rect(x + 2, y + 2, (w - 4) * clamp(frac, 0, 1), h - 4);
  fill(230); textSize(11); textAlign(LEFT, CENTER); text(label, x + 6, y + h / 2);
}

function minimap() {
  const s = 4, ox = VIEW_W - MW * s - 12, oy = 12;
  push(); noStroke();
  fill(0, 0, 0, 150); rect(ox - 4, oy - 4, MW * s + 8, MH * s + 8);
  for (let y = 0; y < MH; y++) for (let x = 0; x < MW; x++) {
    const ch = grid[y][x];
    if (ch === '.' || ch === 'S') continue;
    if (ch === 'E') fill(160, 110, 255);
    else if (ch === '~') fill(40, 190, 140);
    else if (ch === 'P') fill(doorsOpen() ? 90 : 210, 170, 60);
    else if (ch === '=') fill(70, 90, 120);
    else fill(110, 60, 55);
    rect(ox + x * s, oy + y * s, s, s);
  }
  for (const e of enemies) if (!e.dead) { fill(255, 70, 60); rect(ox + e.x * s - 1, oy + e.y * s - 1, 3, 3); }
  for (const e of echoes) { fill(90, 210, 255); rect(ox + e.x * s - 1, oy + e.y * s - 1, 3, 3); }
  fill(255); rect(ox + player.x * s - 1, oy + player.y * s - 1, 3, 3);
  stroke(255); line(ox + player.x * s, oy + player.y * s,
    ox + (player.x + Math.cos(player.dir) * 2) * s, oy + (player.y + Math.sin(player.dir) * 2) * s);
  pop();
}

function hud() {
  const p = player, w = WEAPONS[p.weapon];
  push();

  // flash de dano / evento
  const fl = Math.max(0, 1 - (now() - flashT) / 260);
  if (fl > 0) { noStroke(); fill(flashCol[0], flashCol[1], flashCol[2], fl * 110); rect(0, 0, VIEW_W, VIEW_H); }
  // véu da fase
  if (p.phased) { noStroke(); fill(40, 230, 170, 40 + 20 * Math.sin(now() / 120)); rect(0, 0, VIEW_W, VIEW_H); }

  // mira
  stroke(200, 255, 200, onBeat() ? 255 : 120);
  const cs = onBeat() ? 12 : 7;
  line(VIEW_W / 2 - cs, VIEW_H / 2, VIEW_W / 2 - 3, VIEW_H / 2);
  line(VIEW_W / 2 + 3, VIEW_H / 2, VIEW_W / 2 + cs, VIEW_H / 2);
  line(VIEW_W / 2, VIEW_H / 2 - cs, VIEW_W / 2, VIEW_H / 2 - 3);
  line(VIEW_W / 2, VIEW_H / 2 + 3, VIEW_W / 2, VIEW_H / 2 + cs);
  noStroke();

  // barras
  bar(12, VIEW_H - 74, 200, 22, p.hp / p.maxHp, [190, 40, 40], 'VIDA ' + Math.max(0, Math.ceil(p.hp)));
  bar(12, VIEW_H - 48, 200, 22, p.eter / p.maxEter, [40, 190, 160], 'ETER ' + Math.ceil(p.eter));

  // metrônomo do compasso
  const bw = 200, bx = 224, by = VIEW_H - 48;
  fill(20, 22, 30); rect(bx, by, bw, 22);
  fill(onBeat() ? 255 : 90, onBeat() ? 210 : 90, 60); rect(bx + beatPhase() * (bw - 6) + 2, by + 2, 6, 18);
  fill(255, 210, 90, 70); rect(bx + 2, by + 2, (bw - 6) * BEAT_WINDOW, 18);
  rect(bx + bw - 4 - (bw - 6) * BEAT_WINDOW, by + 2, (bw - 6) * BEAT_WINDOW, 18);
  fill(220); textSize(11); textAlign(LEFT, CENTER); text('COMPASSO', bx + 8, by + 11);

  // arma / munição / frenesi
  textAlign(LEFT, TOP); textSize(15); fill(240, 230, 200);
  text(w.name + '  ' + p.ammo[w.ammo] + ' ' + w.ammo, 224, VIEW_H - 74);
  fill(255, 180, 60);
  text('FRENESI x' + p.frenzy.toFixed(2) + '   ECO ' + '◆'.repeat(p.echoCharges), 440, VIEW_H - 74);

  // topo
  textAlign(LEFT, TOP); textSize(14); fill(200, 210, 230);
  const left = enemies.filter(e => !e.dead).length;
  text('ANDAR ' + floorNum + '   INIMIGOS ' + left + '   ABATES ' + kills, 12, 12);
  if (left === 0) { fill(180, 140, 255); text('SAIDA ABERTA — encontre o portal roxo no mapa', 12, 32); }

  if (now() - msgT < 1800) {
    textAlign(CENTER, CENTER); textSize(18); fill(255, 240, 180, 255 - (now() - msgT) / 8);
    text(msg, VIEW_W / 2, 90);
  }
  pop();
  minimap();
}

function overlayScreen(title, lines, col) {
  push();
  noStroke(); fill(0, 0, 0, 205); rect(0, 0, VIEW_W, VIEW_H);
  textAlign(CENTER, CENTER);
  fill(col[0], col[1], col[2]); textSize(46); text(title, VIEW_W / 2, 120);
  fill(215); textSize(15);
  lines.forEach((l, i) => text(l, VIEW_W / 2, 190 + i * 24));
  pop();
}

// ----------------------------------------------------------------------------- loop
function draw() {
  background(0);
  const dt = Math.min(0.05, deltaTime / 1000);

  if (gameState === 'play') {
    update(dt);
    render();
    drawWeapon();
    hud();
    if (touchMode) drawTouchUI();
  } else if (gameState === 'title') {
    render();
    overlayScreen('PULSO DO ABISMO', [
      'WASD mover · mouse/setas girar · clique ou CTRL atirar · SHIFT correr',
      '1 2 3 trocar arma · F entrar em FASE · Q soltar ECO TEMPORAL · R reiniciar',
      '',
      'COMPASSO: atire dentro da janela dourada = dano x2 e munição devolvida',
      'FASE: atravessa paredes verdes, some do radar inimigo, gasta ÉTER',
      'ECO: solta um fantasma com seus últimos 6 segundos, que luta por você',
      'COLHEITA: absorva almas para ÉTER e para subir o FRENESI',
      'PACTO DE SANGUE: sem munição a arma dispara consumindo vida',
      '',
      'NO CELULAR: analógico à esquerda, arraste à direita para mirar, botões à direita',
      'CLIQUE OU TOQUE PARA COMEÇAR',
    ], [255, 90, 60]);
  } else if (gameState === 'dead') {
    render(); hud();
    overlayScreen('VOCE FOI CONSUMIDO', ['Andar ' + floorNum + ' · ' + kills + ' abates',
      touchMode ? 'Toque na tela para renascer' : 'Pressione R para renascer'], [220, 40, 40]);
  }
}

// ----------------------------------------------------------------------------- input
function toggleFase() {
  if (!player.phased) {
    if (player.eter > 12) { player.phased = true; say('FASE'); blip(300, 0.2, 'sine', 0.05); }
    else say('ETER INSUFICIENTE');
  } else if (blocks(tileAt(player.x, player.y), false)) say('NAO PODE MATERIALIZAR AQUI');
  else { player.phased = false; say('MATERIALIZADO'); }
}

function keyPressed() {
  keysDown[keyCode] = true;
  if (key === '1') player.weapon = 0;
  if (key === '2') player.weapon = 1;
  if (key === '3') player.weapon = 2;
  if (key === 'f' || key === 'F') toggleFase();
  if (key === 'q' || key === 'Q') releaseEcho();
  if (key === 'r' || key === 'R') { gameState = 'play'; resetLevel(true); }
  if (keyCode === 32 || keyCode === 9) return false; // não rolar a página
}
function keyReleased() { keysDown[keyCode] = false; }

function mousePressed() {
  initAudio();
  if (gameState === 'title') { gameState = 'play'; return; }
  if (gameState === 'dead') return;
  const c = document.querySelector('canvas');
  if (c && !document.pointerLockElement && c.requestPointerLock) c.requestPointerLock();
}

function mouseMoved() {
  if (gameState === 'play' && document.pointerLockElement) player.dir += movedX * 0.0028;
}
function mouseDragged() { mouseMoved(); }

// --------------------------------------------------------------------------- toque
function inBtn(b, x, y) { return Math.hypot(x - b.x, y - b.y) <= b.r; }

function syncTouches() {
  touchMode = true;
  const list = touches || [];
  const ids = new Set(list.map(t => t.id));
  if (stick && !ids.has(stick.id)) stick = null;
  if (look && !ids.has(look.id)) look = null;

  const pressed = { fire: false, fase: false, eco: false, arma: false };
  for (const t of list) {
    if (stick && t.id === stick.id) { stick.x = t.x; stick.y = t.y; continue; }
    if (look && t.id === look.id) { player.dir += (t.x - look.px) * 0.006; look.px = t.x; continue; }
    let onBtn = false;
    for (const k in TBTN) if (inBtn(TBTN[k], t.x, t.y)) { pressed[k] = true; onBtn = true; break; }
    if (onBtn) continue;
    if (t.x < VIEW_W * 0.42) stick = { id: t.id, ox: t.x, oy: t.y, x: t.x, y: t.y };
    else look = { id: t.id, px: t.x };
  }

  firing = pressed.fire;
  if (pressed.fase && !btnHeld.fase) toggleFase();
  if (pressed.eco && !btnHeld.eco) releaseEcho();
  if (pressed.arma && !btnHeld.arma) player.weapon = (player.weapon + 1) % WEAPONS.length;
  btnHeld = { fase: pressed.fase, eco: pressed.eco, arma: pressed.arma };
}

// o p5 encaminha eventos de mouse para os handlers de toque: só reagimos a toque real
function isTouchEvt(e) {
  return !!(e && (e.touches || String(e.type || '').indexOf('touch') === 0 || e.pointerType === 'touch'));
}

function touchStarted(e) {
  if (!isTouchEvt(e)) return;     // mouse: deixa mousePressed cuidar
  initAudio();
  touchMode = true;
  if (gameState === 'title') { gameState = 'play'; return false; }
  if (gameState === 'dead') { gameState = 'play'; resetLevel(true); return false; }
  syncTouches();
  return false;                   // impede rolagem/zoom da página
}
function touchMoved(e) { if (!isTouchEvt(e)) return; syncTouches(); return false; }
function touchEnded(e) { if (!isTouchEvt(e)) return; syncTouches(); return false; }

function drawTouchUI() {
  push(); noStroke();
  for (const k in TBTN) {
    const b = TBTN[k];
    const hot = (k === 'fire' && firing) || btnHeld[k];
    fill(hot ? 200 : 120, hot ? 90 : 120, hot ? 60 : 140, hot ? 130 : 60);
    ellipse(b.x, b.y, b.r * 2, b.r * 2);
    fill(255, 235, 210, 210); textAlign(CENTER, CENTER); textSize(b.r > 40 ? 15 : 11);
    text(k === 'arma' ? WEAPONS[player.weapon].name.slice(0, 4) : b.label, b.x, b.y);
  }
  if (stick) {
    fill(255, 255, 255, 35); ellipse(stick.ox, stick.oy, 112, 112);
    const dx = clamp(stick.x - stick.ox, -56, 56), dy = clamp(stick.y - stick.oy, -56, 56);
    fill(255, 255, 255, 110); ellipse(stick.ox + dx, stick.oy + dy, 46, 46);
  }
  pop();
}
