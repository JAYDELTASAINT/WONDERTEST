'use strict';
/* Cenários: tilesets (renderizados uma vez por sala), objetos e fundos com parallax. */

const TS = 16;

const TILESETS = {
  /* Mundo Sombrio: chão roxo, trilha clara, vazio preto com penhascos */
  dark: {
    floor: (ch) => ch === '.' || ch === ',' || ch === 'x',
    draw(g, ch, x, y, tx, ty, at) {
      const fl = this.floor(ch);
      if (!fl) {
        // vazio: desenha a face do penhasco se houver chão acima
        let depth = 0;
        for (let k = 1; k <= 2; k++) { if (this.floor(at(tx, ty - k))) { depth = k; break; } if (at(tx, ty - k) !== '#') break; }
        if (depth === 1) {
          const gr = g.createLinearGradient(0, y, 0, y + 16);
          gr.addColorStop(0, '#2c1650'); gr.addColorStop(1, '#170a2a');
          g.fillStyle = gr; g.fillRect(x, y, 16, 16);
          g.fillStyle = '#3a2066';
          for (let i = 0; i < 16; i += 3) { const h = 6 + Math.floor(U.hash(tx * 16 + i, ty, 7) * 9); g.fillRect(x + i + (ty % 2), y, 1, h); }
          g.fillStyle = '#0e0618'; g.fillRect(x, y + 14, 16, 2);
        } else if (depth === 2) {
          g.fillStyle = '#0e0618'; g.fillRect(x, y, 16, 5);
        }
        return;
      }
      const path = ch === ',';
      const a = path ? '#64399a' : '#3e2266', b = path ? '#6e42a6' : '#46286f';
      g.fillStyle = (tx + ty) % 2 ? a : b; g.fillRect(x, y, 16, 16);
      if (path) {
        g.fillStyle = '#4e2a80'; g.fillRect(x, y + 15, 16, 1); g.fillRect(x + ((ty % 2) ? 7 : 15), y, 1, 15);
        g.fillStyle = '#7c52b6'; g.fillRect(x + 1, y + 1, 3, 1);
      } else {
        for (let i = 0; i < 4; i++) {
          const hx = Math.floor(U.hash(tx, ty, i) * 15), hy = Math.floor(U.hash(ty, tx, i + 9) * 15);
          g.fillStyle = i % 2 ? '#563285' : '#341c58'; g.fillRect(x + hx, y + hy, i === 0 ? 2 : 1, 1);
        }
      }
      // bordas onde encosta no vazio
      const v = (cx, cy) => !this.floor(at(cx, cy));
      if (v(tx, ty - 1)) { g.fillStyle = '#d27ae6'; g.fillRect(x, y, 16, 1); g.fillStyle = '#8c4cb8'; g.fillRect(x, y + 1, 16, 1); }
      if (v(tx - 1, ty)) { g.fillStyle = '#8c4cb8'; g.fillRect(x, y, 1, 16); }
      if (v(tx + 1, ty)) { g.fillStyle = '#8c4cb8'; g.fillRect(x + 15, y, 1, 16); }
      if (v(tx, ty + 1)) { g.fillStyle = '#b060d0'; g.fillRect(x, y + 15, 16, 1); }
    },
  },
  /* Castelo: xadrez, tapete vermelho, paredes de pedra */
  castle: {
    floor: (ch) => ch === 'c' || ch === '=' || ch === 'x' || ch === 's',
    draw(g, ch, x, y, tx, ty, at) {
      if (ch === '#') { g.fillStyle = '#000'; g.fillRect(x, y, 16, 16); return; }
      if (ch === 'w' || ch === 'W') {
        g.fillStyle = ch === 'W' ? '#160c24' : '#24143a'; g.fillRect(x, y, 16, 16);
        if (ch === 'w') {
          g.fillStyle = '#301c4c';
          g.fillRect(x, y + 7, 16, 1); g.fillRect(x, y + 15, 16, 1);
          g.fillRect(x + ((ty % 2) ? 4 : 12), y, 1, 7); g.fillRect(x + ((ty % 2) ? 12 : 4), y + 8, 1, 7);
          if (at(tx, ty + 1) !== 'w' && at(tx, ty + 1) !== 'W') { g.fillStyle = '#0c0614'; g.fillRect(x, y + 14, 16, 2); }
        } else { g.fillStyle = '#2a1844'; g.fillRect(x, y + 15, 16, 1); }
        return;
      }
      if (ch === '=') {
        g.fillStyle = '#9a1c38'; g.fillRect(x, y, 16, 16);
        g.fillStyle = '#b42a48'; g.fillRect(x + 2, y + (ty % 2 ? 3 : 11), 3, 1); g.fillRect(x + 10, y + (ty % 2 ? 11 : 3), 3, 1);
        const notC = (cx, cy) => at(cx, cy) !== '=';
        g.fillStyle = PAL.gold;
        if (notC(tx - 1, ty)) g.fillRect(x, y, 2, 16);
        if (notC(tx + 1, ty)) g.fillRect(x + 14, y, 2, 16);
        if (notC(tx, ty - 1)) g.fillRect(x, y, 16, 2);
        if (notC(tx, ty + 1)) g.fillRect(x, y + 14, 16, 2);
        return;
      }
      g.fillStyle = (tx + ty) % 2 ? '#2a1844' : '#3c2662'; g.fillRect(x, y, 16, 16);
      g.fillStyle = (tx + ty) % 2 ? '#342052' : '#4a3076'; g.fillRect(x + 1, y + 1, 5, 1);
      if (at(tx, ty - 1) === 'w' || at(tx, ty - 1) === 'W') { g.fillStyle = 'rgba(0,0,0,0.45)'; g.fillRect(x, y, 16, 4); }
    },
  },
  /* Mundo da Luz (externo): neve, rua, calçada */
  light: {
    floor: (ch) => '.=-+x'.includes(ch),
    draw(g, ch, x, y, tx, ty, at) {
      if (ch === '#') return;
      if (ch === '=' || ch === '+') {
        g.fillStyle = '#6c6c7a'; g.fillRect(x, y, 16, 16);
        for (let i = 0; i < 5; i++) { g.fillStyle = i % 2 ? '#62626e' : '#767684'; g.fillRect(x + Math.floor(U.hash(tx, ty, i) * 15), y + Math.floor(U.hash(ty, tx, i) * 15), 2, 1); }
        if (ch === '+') { g.fillStyle = '#f4d24a'; g.fillRect(x + 2, y + 7, 10, 2); }
        if (at(tx, ty - 1) !== '=' && at(tx, ty - 1) !== '+') { g.fillStyle = '#9a9aa8'; g.fillRect(x, y, 16, 2); }
        return;
      }
      if (ch === '-') {
        g.fillStyle = '#c4c4d0'; g.fillRect(x, y, 16, 16);
        g.fillStyle = '#a4a4b4'; g.fillRect(x, y + 15, 16, 1); g.fillRect(x + 15, y, 1, 16);
        g.fillStyle = '#e8eef8'; g.fillRect(x + Math.floor(U.hash(tx, ty, 3) * 12), y + 3, 3, 1);
        return;
      }
      g.fillStyle = '#eef3fa'; g.fillRect(x, y, 16, 16);
      for (let i = 0; i < 4; i++) {
        g.fillStyle = i % 2 ? '#dbe4f2' : '#ffffff';
        g.fillRect(x + Math.floor(U.hash(tx, ty, i + 3) * 14), y + Math.floor(U.hash(ty, tx, i + 5) * 15), i % 2 ? 3 : 1, 1);
      }
      if (U.hash(tx, ty, 11) > 0.93) { g.fillStyle = '#c8d6ea'; g.fillRect(x + 6, y + 9, 5, 2); }
    },
  },
  /* Escola (interno) */
  school: {
    floor: (ch) => 'fx'.includes(ch),
    draw(g, ch, x, y, tx, ty, at) {
      if (ch === '#') return;
      g.fillStyle = (tx + ty) % 2 ? '#e6d8b2' : '#d6c69c'; g.fillRect(x, y, 16, 16);
      g.fillStyle = '#c4b288'; g.fillRect(x, y + 15, 16, 1); g.fillRect(x + 15, y, 1, 16);
      g.fillStyle = 'rgba(255,255,255,0.35)'; g.fillRect(x + 2, y + 2, 4, 1);
      if (at(tx, ty - 1) === '#') { g.fillStyle = 'rgba(40,30,20,0.35)'; g.fillRect(x, y, 16, 4); }
    },
  },
};

/* ---------- Objetos (props) ---------- */
const PROPS = {
  tree(p) { // árvore de Cheesy Poofs
    p.line(19, 55, 19, 26, '#1c0e2a', 4); p.line(19, 40, 13, 32, '#1c0e2a', 2); p.line(20, 36, 27, 29, '#1c0e2a', 2);
    p.rect(21, 30, 1, 22, '#2e1844');
    const puffs = [[19, 16, 11], [9, 20, 7], [29, 20, 7], [13, 10, 7], [26, 10, 7], [19, 5, 6], [6, 28, 5], [32, 28, 5], [19, 25, 7]];
    for (const [x, y, r] of puffs) p.circle(x, y, r, '#f2952a');
    for (const [x, y, r] of puffs) p.ellipse(x, y, r, r, '#c2601a', y + r * 0.35, 1e9);
    for (const [x, y, r] of puffs) p.circle(x - r * 0.35, y - r * 0.35, r * 0.28, '#ffc864');
  },
  bag(p) { // pacote gigante de Cheesy Poofs
    p.poly([[3, 6], [23, 6], [25, 33], [1, 33]], '#2c4cb8');
    p.poly([[15, 6], [23, 6], [25, 33], [17, 33]], '#20388e');
    p.rect(2, 2, 22, 5, '#f2952a'); for (let x = 2; x < 24; x += 2) p.px(x, 1, '#f2952a');
    p.circle(13, 19, 7, '#f6d040'); p.circle(13, 19, 5, '#f2952a');
    for (const [x, y] of [[11, 17], [15, 18], [12, 21], [14, 15]]) p.circle(x, y, 1.5, '#ffc864');
    p.rect(4, 28, 18, 2, '#e23030');
  },
  lamp(p) {
    p.rect(5, 10, 2, 28, '#1c0e2a'); p.rect(2, 36, 8, 2, '#1c0e2a');
    p.circle(6, 7, 5, '#ff5ad8'); p.circle(5, 6, 2.5, '#ffd0f4');
  },
  sign(p) {
    p.rect(8, 10, 2, 10, PAL.woodD);
    p.rect(1, 1, 16, 10, PAL.wood); p.rect(1, 9, 16, 2, PAL.woodD);
    for (let i = 0; i < 3; i++) p.rect(3, 3 + i * 2, 12 - (i % 2) * 3, 1, '#4a2a10');
  },
  chest(p) {
    p.rect(1, 7, 18, 10, '#8a1c34'); p.rect(1, 3, 18, 5, '#a82a44');
    p.rect(1, 7, 18, 1, PAL.goldD); p.rect(1, 3, 18, 1, PAL.gold);
    p.rect(1, 3, 2, 14, PAL.gold); p.rect(17, 3, 2, 14, PAL.gold);
    p.rect(8, 7, 4, 4, PAL.gold); p.px(9, 9, '#3a1010');
  },
  chestOpen(p) {
    p.rect(1, 7, 18, 10, '#8a1c34'); p.rect(3, 8, 14, 3, '#2a0a14');
    p.rect(1, 0, 18, 5, '#a82a44'); p.rect(1, 4, 18, 1, PAL.goldD);
    p.rect(1, 0, 2, 17, PAL.gold); p.rect(17, 0, 2, 17, PAL.gold);
  },
  switchOff(p) { p.rect(0, 2, 16, 13, '#2a1844'); p.rect(1, 3, 14, 11, '#4a2c74'); p.ellipse(8, 8, 5, 4, '#8a6ab8'); p.ellipse(8, 7, 5, 3.5, '#b494e0'); },
  switchOn(p) { p.rect(0, 2, 16, 13, '#2a1844'); p.rect(1, 3, 14, 11, '#4a2c74'); p.ellipse(8, 9, 5, 3, '#f6c832'); p.ellipse(8, 9, 3, 1.8, '#fff0a0'); },
  spikesUp(p) {
    p.rect(0, 10, 16, 6, '#26143e');
    for (let i = 0; i < 4; i++) { const x = i * 4; p.poly([[x, 14], [x + 4, 14], [x + 2, 3]], '#c8cee0'); p.poly([[x + 2, 14], [x + 4, 14], [x + 2, 3]], '#8a90a8'); }
  },
  spikesDown(p) { p.rect(0, 10, 16, 6, '#26143e'); for (let i = 0; i < 4; i++) p.rect(i * 4 + 1, 12, 2, 1, '#120a20'); },
  rock(p) { p.ellipse(10, 9, 9, 6, '#4a2c70'); p.ellipse(10, 9, 9, 6, '#331c50', 11, 1e9); p.ellipse(7, 6, 3, 2, '#6a46a0'); },
  candy(p) {
    p.rect(5, 11, 2, 14, '#f0f0f0');
    p.circle(6, 6, 6, '#ff5ab4'); p.circle(6, 6, 4, '#ffffff'); p.circle(6, 6, 2, '#ff5ab4');
  },
  pillar(p) {
    p.rect(2, 4, 16, 42, '#3a2660'); p.rect(12, 4, 6, 42, '#2a1a48'); p.rect(4, 4, 2, 42, '#4e3680');
    p.rect(0, 0, 20, 5, '#4e3680'); p.rect(0, 44, 20, 5, '#4e3680');
  },
  banner(p) {
    p.rect(0, 0, 16, 2, PAL.gold);
    p.poly([[1, 2], [15, 2], [15, 30], [8, 25], [1, 30]], '#b01c34');
    p.rect(1, 2, 1, 27, PAL.goldD); p.rect(14, 2, 1, 27, PAL.goldD);
    p.circle(8, 12, 5, PAL.skin); p.ellipse(8, 9, 5.5, 3, PAL.cartHat, -1e9, 10); p.rect(3, 9, 11, 1, PAL.cartYellow);
    p.px(6, 12, '#000'); p.px(10, 12, '#000'); p.rect(7, 15, 3, 1, '#000');
  },
  throne(p) {
    p.rect(4, 0, 36, 40, PAL.gold); p.rect(7, 3, 30, 34, '#9a1c38');
    for (const x of [4, 14, 24, 34]) p.poly([[x, 0], [x + 6, 0], [x + 3, -6 + 6]], PAL.gold);
    p.rect(0, 30, 44, 14, PAL.goldD); p.rect(2, 30, 40, 10, '#b42a48');
    p.rect(0, 44, 6, 6, PAL.goldD); p.rect(38, 44, 6, 6, PAL.goldD);
    p.circle(22, 12, 4, PAL.gold); p.circle(22, 12, 2, '#e23030');
  },
  tent(p) { // loja do Butters
    p.poly([[32, 2], [62, 30], [2, 30]], '#3a5ad0');
    for (let i = 0; i < 6; i++) p.poly([[32, 2], [8 + i * 10, 30], [13 + i * 10, 30]], '#f0f0ff');
    p.rect(4, 30, 56, 24, '#2c46a8'); p.rect(4, 30, 56, 2, '#f6c832');
    p.rect(22, 34, 20, 20, '#120a20');
    p.rect(20, 12, 24, 9, '#f6c832'); p.rect(21, 13, 22, 7, '#fff0a0');
    p.px(31, 0, '#e23030'); p.rect(31, 0, 1, 3, '#e23030');
  },
  gate(p) { // portão da Cartmanlândia
    p.rect(0, 10, 72, 62, '#2a1844');
    p.ellipse(36, 30, 26, 22, '#140a20', 8, 1e9);
    p.rect(10, 30, 52, 42, '#140a20');
    p.rect(12, 30, 23, 42, '#5a2a1c'); p.rect(37, 30, 23, 42, '#5a2a1c');
    p.rect(12, 30, 23, 2, PAL.gold); p.rect(37, 30, 23, 2, PAL.gold);
    for (const x of [16, 28, 41, 53]) p.rect(x, 33, 2, 38, '#3e1c12');
    p.circle(33, 52, 1.5, PAL.gold); p.circle(39, 52, 1.5, PAL.gold);
    p.rect(0, 6, 72, 6, '#3c2662'); for (let x = 0; x < 72; x += 8) p.rect(x, 0, 5, 7, '#3c2662');
  },
  pine(p) { // pinheiro nevado
    p.rect(14, 42, 4, 10, '#5a3a1c');
    const layers = [[16, 4, 6, 12], [16, 12, 10, 20], [16, 21, 13, 30], [16, 30, 15, 42]];
    for (const [cx, top, hw, bot] of layers) {
      p.poly([[cx, top], [cx + hw, bot], [cx - hw, bot]], '#2c6a3c');
      p.poly([[cx, top], [cx + hw, bot], [cx + 2, bot]], '#1e4e2c');
      p.poly([[cx, top], [cx + hw * 0.45, top + (bot - top) * 0.45], [cx - hw * 0.45, top + (bot - top) * 0.45]], '#f4f8ff');
      p.rect(cx - hw + 1, bot - 1, hw * 2 - 2, 1, '#e4ecf8');
    }
  },
  busstop(p) {
    p.rect(6, 10, 2, 32, '#7a7a88'); p.rect(4, 41, 6, 2, '#5a5a66');
    p.rect(0, 0, 14, 11, '#2a6ad0'); p.rect(1, 1, 12, 9, '#3c7ae6');
    p.rect(3, 3, 8, 1, '#fff'); p.rect(3, 5, 6, 1, '#fff'); p.rect(3, 7, 8, 1, '#fff');
  },
  snowman(p) {
    p.circle(10, 24, 8, '#f8fbff'); p.circle(10, 13, 6, '#f8fbff'); p.circle(10, 4, 4.5, '#f8fbff');
    p.ellipse(10, 24, 8, 8, '#d8e2f0', 27, 1e9);
    p.px(9, 3, '#000'); p.px(12, 3, '#000'); p.rect(10, 5, 3, 1, '#f08020');
    p.px(10, 11, '#000'); p.px(10, 14, '#000'); p.rect(4, 0, 12, 1, '#222'); p.rect(6, -3 + 3, 8, 1, '#222');
    p.line(4, 12, 0, 8, '#6a4020'); p.line(16, 12, 20, 9, '#6a4020');
  },
  mailbox(p) { p.rect(5, 9, 2, 12, '#5a3a1c'); p.rect(0, 2, 12, 8, '#3a5ad0'); p.ellipse(6, 3, 6, 2, '#3a5ad0'); p.rect(11, 3, 1, 4, '#e23030'); },
  trash(p) { p.rect(1, 3, 12, 15, '#7a8a8a'); p.rect(0, 1, 14, 3, '#8e9e9e'); for (let x = 3; x < 12; x += 3) p.rect(x, 5, 1, 12, '#5a6a6a'); },
  bench(p) { p.rect(0, 4, 32, 3, '#8a5a2c'); p.rect(0, 9, 32, 3, '#8a5a2c'); p.rect(2, 12, 2, 6, '#3a3a3a'); p.rect(28, 12, 2, 6, '#3a3a3a'); p.rect(0, 0, 32, 3, '#a06a34'); },
  closet(p) {
    p.rect(0, 0, 26, 42, '#5a4a3a'); p.rect(2, 2, 22, 40, '#8a6a46'); p.rect(3, 3, 20, 38, '#9a7a52');
    p.rect(3, 20, 20, 1, '#8a6a46'); p.circle(19, 24, 1.5, PAL.gold);
    p.rect(5, 6, 16, 6, '#e8e0c8'); p.rect(6, 8, 14, 1, '#6a5a4a');
  },
  door(p) {
    p.rect(0, 0, 24, 40, '#4a3a2a'); p.rect(2, 2, 20, 38, '#7a5a3a'); p.rect(4, 5, 16, 10, '#a8d0f0'); p.rect(4, 10, 16, 1, '#7a5a3a'); p.circle(18, 24, 1.5, PAL.gold);
  },
  dummyStand(p) { drawSrChapeu(p, 0); },
};
const PROP_SIZE = {
  tree: [40, 58], bag: [26, 35], lamp: [12, 39], sign: [18, 21], chest: [20, 18], chestOpen: [20, 18], switchOff: [16, 16], switchOn: [16, 16],
  spikesUp: [16, 16], spikesDown: [16, 16], rock: [20, 15], candy: [12, 26], pillar: [20, 50], banner: [16, 32], throne: [44, 50],
  tent: [64, 56], gate: [72, 72], pine: [32, 52], busstop: [14, 44], snowman: [21, 33], mailbox: [12, 21], trash: [14, 18], bench: [32, 18],
  closet: [26, 42], door: [24, 40], dummyStand: [34, 50],
};
const NO_OUTLINE = new Set(['spikesDown', 'switchOff', 'switchOn']);
Spr.prop = function (name) {
  return this.get('prop:' + name, () => {
    const [w, h] = PROP_SIZE[name] || [16, 16];
    const p = new Painter(w + 2, h + 2);
    p.g.translate(1, 1);
    PROPS[name](p);
    p.g.setTransform(1, 0, 0, 1, 0, 0);
    if (!NO_OUTLINE.has(name)) p.outline();
    return p.c;
  });
};

/* ---------- Fundos ---------- */
const BG = {
  /* Estrelas cintilantes do Mundo Sombrio */
  stars(g, camX, camY, seed = 1, n = 40, par = 0.15) {
    for (let i = 0; i < n; i++) {
      const x = ((U.hash(i, seed, 1) * 900 - camX * par) % 360 + 360) % 360 - 20;
      const y = U.hash(i, seed, 2) * 200 - camY * par * 0.5;
      const tw = Math.sin(frame * 0.05 + i * 1.7) > 0.6;
      g.fillStyle = tw ? '#ffffff' : '#6a4a9a';
      g.fillRect(Math.round(x), Math.round(y), 1, 1);
    }
  },
  /* Silhueta da Cartmanlândia ao longe: roda-gigante, montanha-russa e torres */
  cartmanland(g, camX, camY, alpha = 1) {
    const par = 0.25, ox = -camX * par, oy = -camY * 0.1;
    g.save(); g.globalAlpha = alpha;
    const col = '#26103e';
    // roda-gigante
    const wx = 250 + ox, wy = 70 + oy, R = 46;
    g.strokeStyle = col; g.lineWidth = 2;
    g.beginPath(); g.arc(wx, wy, R, 0, Math.PI * 2); g.stroke();
    g.lineWidth = 1;
    const rot = frame * 0.004;
    for (let i = 0; i < 12; i++) {
      const a = rot + (i * Math.PI) / 6;
      g.beginPath(); g.moveTo(wx, wy); g.lineTo(wx + Math.cos(a) * R, wy + Math.sin(a) * R); g.stroke();
      const lx = Math.round(wx + Math.cos(a) * R), ly = Math.round(wy + Math.sin(a) * R);
      g.fillStyle = (i + Math.floor(frame / 8)) % 3 === 0 ? '#ffd040' : '#ff5ad8';
      g.fillRect(lx - 1, ly - 1, 2, 2);
    }
    g.fillStyle = col;
    g.beginPath(); g.moveTo(wx - 4, wy); g.lineTo(wx - 30, wy + 90); g.lineTo(wx - 24, wy + 90); g.lineTo(wx, wy + 8); g.lineTo(wx + 24, wy + 90); g.lineTo(wx + 30, wy + 90); g.lineTo(wx + 4, wy); g.fill();
    // montanha-russa
    g.strokeStyle = col; g.lineWidth = 2;
    g.beginPath();
    for (let x = -40; x <= 200; x += 4) { const y = 110 + Math.sin((x + 30) * 0.035) * 26 + oy; if (x === -40) g.moveTo(x + ox * 0.8, y); else g.lineTo(x + ox * 0.8, y); }
    g.stroke();
    g.lineWidth = 1;
    for (let x = -40; x <= 200; x += 12) { const y = 110 + Math.sin((x + 30) * 0.035) * 26 + oy; g.beginPath(); g.moveTo(x + ox * 0.8, y); g.lineTo(x + ox * 0.8, 200); g.stroke(); }
    // torres do castelo
    g.fillStyle = col;
    for (const [tx, th] of [[400, 90], [430, 120], [460, 80]]) {
      g.fillRect(tx + ox, 160 - th + oy, 18, th + 60);
      g.beginPath(); g.moveTo(tx - 3 + ox, 160 - th + oy); g.lineTo(tx + 9 + ox, 160 - th - 20 + oy); g.lineTo(tx + 21 + ox, 160 - th + oy); g.fill();
      g.fillStyle = '#ffd040'; g.fillRect(tx + 7 + ox, 170 - th + oy, 3, 4); g.fillStyle = col;
    }
    g.restore();
  },
  /* Céu e montanhas do Mundo da Luz */
  sky(g, top = '#86c2ee', bottom = '#d8ecfa', h = 120) {
    const gr = g.createLinearGradient(0, 0, 0, h);
    gr.addColorStop(0, top); gr.addColorStop(1, bottom);
    g.fillStyle = gr; g.fillRect(0, 0, W, h);
  },
  mountains(g, camX, y0 = 30, tint = null) {
    const layers = [
      { par: 0.15, col: tint ? tint[0] : '#9ab4d4', snow: '#f4f8ff', base: y0 + 60, amp: 34, f: 0.012, seed: 3 },
      { par: 0.3, col: tint ? tint[1] : '#6e8eb4', snow: '#e8f0fa', base: y0 + 76, amp: 22, f: 0.02, seed: 7 },
    ];
    for (const L of layers) {
      g.fillStyle = L.col;
      g.beginPath(); g.moveTo(0, 200);
      for (let x = 0; x <= W; x += 2) {
        const wx = x + camX * L.par;
        const y = L.base - Math.abs(Math.sin(wx * L.f + L.seed)) * L.amp - Math.sin(wx * L.f * 2.7) * L.amp * 0.25;
        g.lineTo(x, y);
      }
      g.lineTo(W, 200); g.fill();
      g.fillStyle = L.snow;
      for (let x = 0; x <= W; x += 1) {
        const wx = x + camX * L.par;
        const y = L.base - Math.abs(Math.sin(wx * L.f + L.seed)) * L.amp - Math.sin(wx * L.f * 2.7) * L.amp * 0.25;
        if (y < L.base - L.amp * 0.62) g.fillRect(x, Math.round(y), 1, Math.round((L.base - L.amp * 0.62 - y) * 0.6) + 1);
      }
    }
  },
  snowfall(g, n = 50, speed = 0.6) {
    g.fillStyle = '#ffffff';
    for (let i = 0; i < n; i++) {
      const x = (U.hash(i, 1, 9) * W + Math.sin(frame * 0.03 + i) * 6 + 400) % W;
      const y = (U.hash(i, 2, 9) * H + frame * speed * (0.6 + U.hash(i, 3, 9))) % H;
      g.fillRect(Math.round(x), Math.round(y), i % 5 === 0 ? 2 : 1, i % 5 === 0 ? 2 : 1);
    }
  },
  /* Grade roxa animada do fundo de batalha */
  battleGrid(g, t, alpha = 1) {
    g.fillStyle = '#000'; g.fillRect(0, 0, W, H);
    g.save(); g.globalAlpha = alpha;
    const draw = (size, off, col) => {
      g.strokeStyle = col; g.lineWidth = 1; g.beginPath();
      for (let x = -size + (off % size); x < W + size; x += size) { g.moveTo(Math.round(x) + 0.5, 0); g.lineTo(Math.round(x) + 0.5, H); }
      for (let y = -size + (off % size); y < H + size; y += size) { g.moveTo(0, Math.round(y) + 0.5); g.lineTo(W, Math.round(y) + 0.5); }
      g.stroke();
    };
    draw(50, t * 0.5, '#2a0e46');
    draw(50, -t * 0.5 + 25, '#3d1666');
    g.restore();
  },
};
