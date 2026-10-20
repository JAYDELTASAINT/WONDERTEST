'use strict';
/* Inimigos (dados, AÇÕES, falas) e padrões de ataque (balas). */

/* ---------- Sprites de balas ---------- */
const BULLET_ART = {
  puff() { const p = new Painter(12, 12); p.circle(6, 6, 4.6, '#f59a2a'); p.ellipse(6, 6, 4.6, 4.6, '#c96a14', 7.6, 1e9); p.circle(4.4, 4.4, 1.5, '#ffd080'); return p.outline().c; },
  bigpuff() { const p = new Painter(20, 20); for (const [x, y, r] of [[10, 11, 7], [6, 8, 4], [14, 8, 4], [10, 5, 4]]) p.circle(x, y, r, '#f59a2a'); p.ellipse(10, 11, 7, 7, '#c96a14', 14, 1e9); p.circle(7, 6, 1.6, '#ffd080'); return p.outline().c; },
  crumb() { const p = new Painter(6, 6); p.rect(1, 1, 4, 4, '#ffc040'); p.px(1, 1, '#fff0a0'); return p.outline().c; },
  fork() { const p = new Painter(8, 22); p.rect(3, 8, 2, 13, '#c8d2e6'); p.rect(1, 6, 6, 2, '#c8d2e6'); for (const x of [1, 3, 5]) p.rect(x, 1, 1, 5, '#eef3ff'); return flipV(p.outline().c); },
  feather() { const p = new Painter(8, 16); p.ellipse(4, 8, 2.6, 6.5, '#a0683a'); p.ellipse(4, 5, 2, 2.5, '#d09050'); p.line(4, 2, 4, 15, '#5a3010'); return p.outline().c; },
  frog() { const p = new Painter(14, 11); p.ellipse(7, 7, 5.5, 3.5, '#5ec25e'); p.circle(4, 3.5, 2.2, '#5ec25e'); p.circle(10, 3.5, 2.2, '#5ec25e'); p.px(4, 3, '#000'); p.px(10, 3, '#000'); p.rect(4, 8, 6, 1, '#2a6a2a'); return p.outline().c; },
  drop() { const p = new Painter(6, 8); p.ellipse(3, 5, 2, 2.4, '#a0622a'); p.px(3, 1, '#a0622a'); p.px(3, 2, '#a0622a'); p.px(2, 4, '#d8a060'); return p.outline().c; },
  cup() { const p = new Painter(14, 10); p.rect(1, 1, 9, 7, '#ffffff'); p.rect(2, 2, 7, 1, '#7aa0ff'); p.rect(10, 2, 2, 1, '#fff'); p.rect(11, 3, 1, 3, '#fff'); p.rect(10, 6, 2, 1, '#fff'); return p.outline().c; },
  hat() { const p = new Painter(12, 10); p.rect(0, 7, 12, 2, '#3a2052'); p.rect(2, 0, 8, 7, '#4a2a66'); p.rect(2, 5, 8, 1, '#d03a3a'); return p.outline().c; },
  claw() { const p = new Painter(16, 16); for (let i = 0; i < 3; i++) p.line(3 + i * 4, 1, 1 + i * 4, 14, '#ffffff', 1); return p.outline().c; },
  mud() { const p = new Painter(10, 10); p.circle(5, 5, 3.8, '#6a4220'); p.circle(4, 4, 1.4, '#9a6a3a'); return p.outline().c; },
  fist() { const p = new Painter(14, 12); p.ellipse(7, 6, 6, 4.5, '#6b4423'); for (let i = 0; i < 3; i++) p.px(3 + i * 3, 3, '#4e2f16'); p.rect(0, 4, 2, 4, '#3c5c9c'); return p.outline().c; },
  minigoomba() { const p = new Painter(16, 16); drawGoomba(p, 8, 15, 0.34, { noCape: true }); return p.outline().c; },
  minigoomba2() { const p = new Painter(16, 16); drawGoomba(p, 8, 15, 0.34, { noCape: true, frame: 2 }); return p.outline().c; },
  mushroom() { const p = new Painter(14, 14); p.rect(4, 8, 6, 5, '#f4e0c0'); p.ellipse(7, 7, 6.5, 5, '#e02828', -1e9, 9); p.circle(4, 5, 1.5, '#fff'); p.circle(9.5, 4, 1.6, '#fff'); p.px(5, 10, '#000'); p.px(8, 10, '#000'); return p.outline().c; },
  crescent() { const p = new Painter(22, 14); p.ellipse(11, 7, 10, 6, '#d4202e'); p.ellipse(13.5, 7, 9, 5, 'rgba(0,0,0,0)'); const id = p.g.getImageData(0, 0, 22, 14); for (let y = 0; y < 14; y++) for (let x = 0; x < 22; x++) { const dx = (x + 0.5 - 14) / 9, dy = (y + 0.5 - 7) / 5; if (dx * dx + dy * dy <= 1) id.data[(y * 22 + x) * 4 + 3] = 0; } p.g.putImageData(id, 0, 0); return p.outline().c; },
  bucket() { const p = new Painter(16, 18); p.poly([[1, 6], [15, 6], [13, 17], [3, 17]], '#e8e8e8'); for (const x of [3, 7, 11]) p.poly([[x, 6], [x + 2, 6], [x + 1.6, 17], [x + 0.4, 17]], '#d02020'); p.circle(6, 4, 3, '#c8822a'); p.circle(10, 3.5, 3, '#d8923a'); p.rect(11, 0, 2, 3, '#f4e8d8'); return p.outline().c; },
  drumstick() { const p = new Painter(10, 10); p.ellipse(4, 4, 3.4, 3, '#c8822a'); p.line(6, 6, 8, 8, '#f4e8d8', 2); return p.outline().c; },
  star() { return ICON.star; },
};
const _bs = {};
function bspr(n) { if (!_bs[n]) _bs[n] = BULLET_ART[n](); return _bs[n]; }
function flipV(img) { const c = makeCanvas(img.width, img.height), x = c.getContext('2d'); x.translate(0, img.height); x.scale(1, -1); x.drawImage(img, 0, 0); return c; }
const _words = {};
function wordImg(text, color = '#ff3030') {
  const k = text + color;
  if (!_words[k]) {
    const c = makeCanvas(text.length * 8 + 4, 18), x = c.getContext('2d');
    Font.draw(x, text, 2, 1, color, { outline: '#000' });
    _words[k] = c;
  }
  return _words[k];
}

/* Aviso piscante (inofensivo) */
function warnRect(B, x, y, w, h, frames, color = '#ff2020') {
  return B.spawn({ x, y, harmless: true, graze: false, life: frames, draw: (g, b) => { if (Math.floor(b.t / 3) % 2 === 0) { g.globalAlpha = 0.3; g.fillStyle = color; g.fillRect(Math.round(b.x - w / 2), Math.round(b.y - h / 2), w, h); g.globalAlpha = 1; } } });
}
const every = (c, n) => c.t % Math.max(1, Math.round(n / c.density)) === 1;

const PATTERNS = {
  /* --- Sr. Chapéu (treino) --- */
  hat_rain: { dur: 150, update(B, c) { const ib = B.inner(); if (every(c, 30)) B.spawn({ img: bspr('hat'), x: U.rnd(ib.x + 8, ib.x2 - 8), y: ib.y - 6, vy: 1.2, r: 4, dmg: c.e.atk, clip: true }); } },
  hat_line: {
    dur: 160, update(B, c) {
      const ib = B.inner();
      if (every(c, 46)) {
        const gap = U.irnd(0, 3);
        for (let i = 0; i < 5; i++) if (i !== gap) B.spawn({ img: bspr('hat'), x: ib.x2 + 8, y: ib.y + 8 + i * 15, vx: -1.3, r: 4, dmg: c.e.atk, clip: true });
      }
    },
  },
  /* --- Cheesinho --- */
  puff_rain: {
    dur: 170, update(B, c) {
      const ib = B.inner();
      if (every(c, 11)) {
        const ph = Math.random() * 6;
        B.spawn({ img: bspr('puff'), x: U.rnd(ib.x + 4, ib.x2 - 4), y: ib.y - 6, vy: U.rnd(1.4, 2.1), r: 4, dmg: c.e.atk, clip: true, update: (b) => { b.y += b.vy; b.x += Math.sin(b.t * 0.1 + ph) * 0.7; } });
      }
    },
  },
  fork_stab: {
    dur: 180, update(B, c) {
      const ib = B.inner();
      if (every(c, 30) && c.t < 150) {
        const n = c.t > 80 ? 2 : 1;
        for (let k = 0; k < n; k++) {
          const x = Math.round(U.rnd(ib.x + 8, ib.x2 - 8));
          warnRect(B, x, ib.cy, 10, ib.h, 18);
          B.spawn({ img: bspr('fork'), x, y: ib.y - 14, wait: 18, vy: 6.5, hw: 2, hh: 9, r: 0, dmg: c.e.atk, clip: true });
        }
      }
    },
  },
  crumb_spray: {
    dur: 160, init(B, c) { c.d.a = 0; }, update(B, c) {
      const ib = B.inner();
      if (every(c, 5)) {
        c.d.a += 0.35;
        const ang = Math.PI + Math.sin(c.d.a) * 0.75;
        B.spawn({ img: bspr('crumb'), x: ib.x2 + 6, y: ib.cy + Math.sin(c.d.a * 0.7) * 20, vx: Math.cos(ang) * 2.2, vy: Math.sin(ang) * 2.2, r: 2.5, dmg: c.e.atk, clip: true });
      }
    },
  },
  /* --- Peru Mutante --- */
  feather_fan: {
    dur: 170, update(B, c) {
      const ib = B.inner();
      if (every(c, 9)) {
        const fromLeft = c.t > 85 && Math.random() < 0.5;
        const y0 = U.rnd(ib.y + 4, ib.y2 - 4), ph = Math.random() * 6;
        B.spawn({ img: bspr('feather'), x: fromLeft ? ib.x - 8 : ib.x2 + 8, y: y0, vx: fromLeft ? 2.1 : -2.1, r: 3, dmg: c.e.atk, clip: true,
          update: (b) => { b.x += b.vx; b.y = y0 + Math.sin(b.t * 0.12 + ph) * 10; b.rot = Math.sin(b.t * 0.12 + ph) * 0.6 + Math.PI / 2; } });
      }
    },
  },
  turkey_charge: {
    dur: 190, init(B, c) { c.d.last = -1; }, update(B, c) {
      const ib = B.inner();
      if (every(c, 34) && c.t < 160) {
        let lane = U.irnd(0, 2); if (lane === c.d.last) lane = (lane + 1) % 3; c.d.last = lane;
        const y = ib.y + 13 + lane * 25, left = Math.random() < 0.5;
        warnRect(B, ib.cx, y, ib.w, 18, 20, '#ff8a20');
        const img = Spr.enemy('peru', 0);
        B.spawn({ x: left ? ib.x - 26 : ib.x2 + 26, y, wait: 20, vx: left ? 4.6 : -4.6, hw: 9, hh: 7, r: 0, dmg: c.e.atk + 2, clip: true,
          draw: (g, b) => { const s = 0.5; g.save(); g.translate(Math.round(b.x), Math.round(b.y)); if (b.vx > 0) g.scale(-1, 1); g.drawImage(img, -img.width * s / 2, -img.height * s / 2, img.width * s, img.height * s); g.restore(); } });
      }
    },
  },
  gobble_ring: {
    dur: 180, update(B, c) {
      const ib = B.inner();
      if (every(c, 50) && c.t < 140) {
        const n = 12, gap = U.irnd(0, n - 1), R = 64, a0 = Math.random() * Math.PI * 2;
        for (let i = 0; i < n; i++) {
          if (i === gap || i === (gap + 1) % n) continue;
          const a = a0 + (i / n) * Math.PI * 2;
          B.spawn({ img: bspr('feather'), x: ib.cx + Math.cos(a) * R, y: ib.cy + Math.sin(a) * R, vx: -Math.cos(a) * 1.1, vy: -Math.sin(a) * 1.1, rot: a + Math.PI / 2, r: 3, dmg: c.e.atk, life: 120 });
        }
      }
    },
  },
  /* --- Sapo Clyde --- */
  frog_hop: {
    dur: 180, update(B, c) {
      const ib = B.inner();
      if (every(c, 24)) {
        const left = Math.random() < 0.6;
        B.spawn({ img: bspr('frog'), x: left ? ib.x - 6 : ib.x2 + 6, y: ib.y2 - 6, vx: (left ? 1 : -1) * U.rnd(1.3, 2), vy: -U.rnd(3, 4.4), r: 4, dmg: c.e.atk, clip: true,
          update: (b) => { b.x += b.vx; b.y += b.vy; b.vy += 0.17; if (b.y > ib.y2 - 6) { b.y = ib.y2 - 6; b.vy = -U.rnd(3.2, 4.2); } } });
      }
    },
  },
  tea_pour: {
    dur: 180, init(B, c) { c.d.x = B.inner().x + 10; c.d.dir = 1; }, update(B, c) {
      const ib = B.inner();
      c.d.x += c.d.dir * 1.3;
      if (c.d.x > ib.x2 - 6 || c.d.x < ib.x + 6) c.d.dir *= -1;
      if (every(c, 5)) B.spawn({ img: bspr('drop'), x: c.d.x + U.rnd(-2, 2), y: ib.y + 6, vy: U.rnd(1.8, 2.4), vx: U.rnd(-0.3, 0.3), r: 2.5, dmg: c.e.atk, clip: true });
    },
    drawOver(g, B, c) { const ib = B.inner(); g.drawImage(bspr('cup'), Math.round(c.d.x - 7), Math.round(ib.y - 12)); },
  },
  /* --- ManBearPig --- */
  claw_sweep: {
    w: 90, dur: 190, update(B, c) {
      const ib = B.inner();
      if (every(c, 36) && c.t < 160) {
        const fromLeft = (Math.floor(c.t / 36) % 2) === 0;
        const y = U.rnd(ib.y + 10, ib.y2 - 10);
        warnRect(B, ib.cx, y, ib.w, 22, 16, '#ff2020');
        for (let k = 0; k < 3; k++) B.spawn({ img: bspr('claw'), x: fromLeft ? ib.x - 10 - k * 14 : ib.x2 + 10 + k * 14, y: y + (k - 1) * 6, wait: 16, vx: fromLeft ? 5 : -5, r: 6, dmg: c.e.atk, clip: true });
      }
    },
  },
  mud_rain: {
    w: 90, dur: 180, update(B, c) {
      const ib = B.inner();
      if (every(c, 14)) {
        const left = Math.random() < 0.5;
        B.spawn({ img: bspr('mud'), x: left ? ib.x + 4 : ib.x2 - 4, y: ib.y2, vx: (left ? 1 : -1) * U.rnd(0.8, 2.2), vy: -U.rnd(3.8, 5), r: 3.5, dmg: c.e.atk, clip: true,
          update: (b) => {
            b.x += b.vx; b.y += b.vy; b.vy += 0.16;
            if (b.vy > 0 && b.y > ib.y2 - 4) { b.dead = true; for (const s of [-1, 0, 1]) B.spawn({ img: bspr('crumb'), x: b.x, y: ib.y2 - 4, vx: s * 1.2, vy: -2.2, ay: 0.14, r: 2, dmg: c.e.atk - 2, clip: true, life: 50 }); }
          } });
      }
    },
  },
  half_triple: {
    w: 90, dur: 210, update(B, c) {
      const ib = B.inner();
      const ph = Math.floor(c.t / 70);
      if (ph === 0 && every(c, 16)) B.spawn({ img: bspr('fist'), x: ib.x2 + 8, y: U.rnd(ib.y + 6, ib.y2 - 6), vx: -3.4, r: 5, dmg: c.e.atk, clip: true });
      if (ph === 1 && every(c, 12)) B.spawn({ img: bspr('claw'), x: U.rnd(ib.x + 6, ib.x2 - 6), y: ib.y - 8, vy: 3.2, r: 6, dmg: c.e.atk, clip: true });
      if (ph === 2 && every(c, 10)) B.spawn({ img: bspr('mud'), x: U.rnd(ib.x + 6, ib.x2 - 6), y: ib.y2 + 6, vy: -3, r: 3.5, dmg: c.e.atk, clip: true });
    },
    drawOver(g, B, c) { const lbl = ['HOMEM', 'URSO', 'PORCO'][Math.min(2, Math.floor(c.t / 70))]; const ib = B.inner(); Mini.draw(g, lbl, ib.cx, ib.y - 9, '#ff5050', { align: 'center' }); },
  },
  /* --- Goomba --- */
  goomba_march: {
    dur: 180, init(B, c) { c.d.last = -1; }, update(B, c) {
      const ib = B.inner();
      if (every(c, 18)) {
        let lane = U.irnd(0, 2); if (lane === c.d.last && Math.random() < 0.7) lane = (lane + 1) % 3; c.d.last = lane;
        const y0 = ib.y + 13 + lane * 25, jumper = c.t > 60 && Math.random() < 0.3;
        B.spawn({ x: ib.x2 + 8, y: y0, vx: -U.rnd(1.6, 2.3), r: 5, dmg: c.e.atk, clip: true,
          update: (b) => { b.x += b.vx; b.y = y0 - (jumper ? Math.abs(Math.sin(b.t * 0.08)) * 22 : Math.abs(Math.sin(b.t * 0.3)) * 2); },
          draw: (g, b) => { const img = bspr(Math.floor(b.t / 6) % 2 ? 'minigoomba' : 'minigoomba2'); g.drawImage(img, Math.round(b.x - 8), Math.round(b.y - 9)); } });
      }
    },
  },
  cape_slash: {
    dur: 180, update(B, c) {
      const ib = B.inner();
      if (every(c, 28) && c.t < 160) {
        const left = Math.random() < 0.5, y = U.rnd(ib.y + 8, ib.y2 - 8);
        warnRect(B, ib.cx, y, ib.w, 12, 14, '#ff2040');
        B.spawn({ img: left ? flipCachedX(bspr('crescent')) : bspr('crescent'), x: left ? ib.x - 12 : ib.x2 + 12, y, wait: 14, vx: left ? 5.2 : -5.2, hw: 9, hh: 4, r: 0, dmg: c.e.atk, clip: true });
      }
    },
  },
  mushroom_bounce: {
    dur: 180, init(B, c) {
      const ib = B.inner();
      const n = Math.max(2, Math.round(3 * c.density));
      for (let i = 0; i < n; i++) {
        const a = Math.random() * Math.PI * 2;
        B.spawn({ img: bspr('mushroom'), x: ib.x + 10 + i * 25, y: ib.y + 8, wait: 10 + i * 12, showWaiting: true, vx: Math.cos(a) * 2.1 || 1.5, vy: Math.abs(Math.sin(a) * 2.1) + 0.8, r: 5, dmg: c.e.atk, life: 170,
          update: (b) => { b.x += b.vx; b.y += b.vy; if (b.x < ib.x + 6 || b.x > ib.x2 - 6) b.vx *= -1; if (b.y < ib.y + 6 || b.y > ib.y2 - 6) b.vy *= -1; b.x = U.clamp(b.x, ib.x + 6, ib.x2 - 6); b.y = U.clamp(b.y, ib.y + 6, ib.y2 - 6); } });
      }
    },
    update() {},
  },
  star_spiral: {
    dur: 170, init(B, c) { c.d.a = 0; }, update(B, c) {
      const ib = B.inner();
      if (every(c, 4)) {
        c.d.a += 0.45;
        for (const s of [0, Math.PI]) B.spawn({ img: bspr('star'), x: ib.cx, y: ib.y - 2, vx: Math.cos(c.d.a + s) * 1.6, vy: Math.abs(Math.sin(c.d.a + s)) * 1.4 + 0.5, r: 3, dmg: c.e.atk, clip: true });
      }
    },
  },
  /* --- Cartman --- */
  cheesy_storm: {
    dur: 190, update(B, c) {
      const ib = B.inner();
      const wind = Math.sin(c.t * 0.03) * 1.4;
      if (every(c, 7)) B.spawn({ img: bspr('puff'), x: U.rnd(ib.x - 20, ib.x2 + 20), y: ib.y - 6, vx: wind, vy: U.rnd(1.6, 2.4), r: 4, dmg: c.e.atk, clip: true });
      if (every(c, 55)) {
        const x = U.rnd(ib.x + 15, ib.x2 - 15);
        B.spawn({ img: bspr('bigpuff'), x, y: ib.y - 10, vy: 1.4, r: 7, dmg: c.e.atk + 2, clip: true,
          update: (b) => { b.y += b.vy; if (b.y > ib.cy - 5) { b.dead = true; Sfx.play('bite'); for (let i = 0; i < 7; i++) { const a = (i / 7) * Math.PI * 2; B.spawn({ img: bspr('crumb'), x: b.x, y: b.y, vx: Math.cos(a) * 1.8, vy: Math.sin(a) * 1.8, r: 2.5, dmg: c.e.atk - 2, clip: true }); } } } });
      }
    },
  },
  authority: {
    w: 96, h: 80, dur: 200, init(B, c) { c.d.last = -1; }, update(B, c) {
      const ib = B.inner();
      if (every(c, 34) && c.t < 170) {
        let row = U.irnd(0, 2); if (row === c.d.last) row = (row + 1) % 3; c.d.last = row;
        const word = U.pick(['AUTORIDADE', 'RESPEITEM', 'OBEDEÇAM']);
        const y = ib.y + 14 + row * 26, left = Math.random() < 0.5;
        const sp = 2.6 * (left ? 1 : -1);
        for (let i = 0; i < word.length; i++) {
          const ch = word[left ? word.length - 1 - i : i];
          const img = wordImg(ch, '#ff3030');
          const ph = i * 0.6;
          B.spawn({ img, x: left ? ib.x - 10 - i * 9 : ib.x2 + 10 + i * 9, y, vx: sp, hw: 3, hh: 5, r: 0, dmg: c.e.atk, clip: true, update: (b) => { b.x += b.vx; b.y = y + Math.sin(b.t * 0.2 + ph) * 3; } });
        }
      }
    },
  },
  kfc_buckets: {
    dur: 190, update(B, c) {
      const ib = B.inner();
      if (every(c, 40) && c.t < 165) {
        const x = U.rnd(ib.x + 12, ib.x2 - 12);
        B.spawn({ img: bspr('bucket'), x, y: ib.y - 10, vy: 1.8, r: 7, dmg: c.e.atk, clip: true,
          update: (b) => {
            b.y += b.vy;
            if (b.y > ib.y2 - 22) {
              b.dead = true; Sfx.play('thud');
              for (let i = 0; i < 5; i++) { const a = -Math.PI * (0.15 + i * 0.175); B.spawn({ img: bspr('drumstick'), x: b.x, y: b.y, vx: Math.cos(a) * 2.2, vy: Math.sin(a) * 2.6, ay: 0.09, vr: 0.2, r: 3, dmg: c.e.atk - 2, clip: true }); }
            }
          } });
      }
    },
  },
  belly_wave: {
    dur: 190, update(B, c) {
      const ib = B.inner();
      if (every(c, 42) && c.t < 160) {
        Sfx.play('boom'); Shake.start(3, 8);
        const gapA = -Math.PI / 2 + U.rnd(-0.9, 0.9), ox = ib.cx, oy = ib.y2 + 6;
        B.spawn({ x: ox, y: oy, r: 0, R: 0, harmless: true, graze: false, life: 120, dmg: c.e.atk,
          update: (b) => {
            b.R += 1.5;
            const s = B.soul; if (!s) return;
            const d = U.dist(s.x, s.y, ox, oy), a = Math.atan2(s.y - oy, s.x - ox);
            let da = Math.abs(((a - gapA + Math.PI * 3) % (Math.PI * 2)) - Math.PI);
            if (Math.abs(d - b.R) < 3 && da > 0.32 && s.inv <= 0) B.hitParty(b.dmg);
            else if (Math.abs(d - b.R) < 12 && da > 0.32) { s.graze = 6; B.addTP(0.25); }
          },
          draw: (g, b) => {
            g.save(); g.beginPath(); g.rect(ib.x, ib.y, ib.w, ib.h); g.clip();
            g.strokeStyle = '#ffffff'; g.lineWidth = 3;
            g.beginPath(); g.arc(ox, oy, b.R, gapA + 0.32, gapA + Math.PI * 2 - 0.32); g.stroke();
            g.strokeStyle = '#ff5050'; g.lineWidth = 1;
            g.beginPath(); g.arc(ox, oy, b.R, gapA + 0.32, gapA + Math.PI * 2 - 0.32); g.stroke();
            g.restore();
          } });
      }
    },
  },
  screw_you: {
    w: 96, h: 80, dur: 200, update(B, c) {
      const ib = B.inner();
      const phrase = 'DANEM-SE VOCÊS! VOU PRA CASA!';
      if (every(c, 6)) {
        c.d.i = ((c.d.i || 0) + 1) % phrase.length;
        const ch = phrase[c.d.i];
        if (ch !== ' ') B.spawn({ img: wordImg(ch, '#ffd23a'), x: U.rnd(ib.x + 6, ib.x2 - 6), y: ib.y - 8, vy: U.rnd(1.6, 2.6), vx: U.rnd(-0.4, 0.4), hw: 3, hh: 5, r: 0, dmg: c.e.atk, clip: true });
      }
    },
  },
  scepter_beam: {
    dur: 190, update(B, c) {
      const ib = B.inner();
      if (every(c, 44) && c.t < 165) {
        const s = B.soul;
        const a = U.rnd(0, Math.PI);
        const px = s ? s.x + U.rnd(-6, 6) : ib.cx, py = s ? s.y + U.rnd(-6, 6) : ib.cy;
        const dx = Math.cos(a), dy = Math.sin(a);
        B.spawn({ x: px, y: py, harmless: true, graze: false, life: 40, dmg: c.e.atk + 4,
          update: (b) => {
            if (b.t === 22) Sfx.play('magic');
            if (b.t > 22 && b.t < 34 && B.soul && B.soul.inv <= 0) {
              const sx = B.soul.x - px, sy = B.soul.y - py;
              const dist = Math.abs(sx * dy - sy * dx);
              if (dist < 5) B.hitParty(b.dmg);
              else if (dist < 14) { B.soul.graze = 6; B.addTP(0.3); }
            }
          },
          draw: (g, b) => {
            g.save(); g.beginPath(); g.rect(ib.x, ib.y, ib.w, ib.h); g.clip();
            if (b.t <= 22) { if (Math.floor(b.t / 3) % 2 === 0) { g.strokeStyle = '#ffd23a'; g.lineWidth = 1; g.beginPath(); g.moveTo(px - dx * 150, py - dy * 150); g.lineTo(px + dx * 150, py + dy * 150); g.stroke(); } }
            else { const w = b.t < 34 ? 9 : Math.max(0, 9 - (b.t - 34) * 2); g.strokeStyle = '#ffd23a'; g.lineWidth = w; g.beginPath(); g.moveTo(px - dx * 150, py - dy * 150); g.lineTo(px + dx * 150, py + dy * 150); g.stroke(); g.strokeStyle = '#ffffff'; g.lineWidth = Math.max(0, w - 5); g.stroke(); }
            g.restore();
          } });
      }
    },
  },
  goomba_toss: {
    w: 90, dur: 180, init(B, c) {
      const ib = B.inner();
      const img = Spr.enemy('goomba', 0);
      B.spawn({ x: ib.x2 + 20, y: ib.y + 20, vx: -2.6, vy: 1.7, wait: 12, r: 8, dmg: c.e.atk + 2, life: 170,
        update: (b) => {
          b.x += b.vx; b.y += b.vy; b.rot += 0.18;
          if (b.t > 8) { if (b.x < ib.x + 9 || b.x > ib.x2 - 9) { b.vx *= -1; Sfx.play('stomp'); } if (b.y < ib.y + 9 || b.y > ib.y2 - 9) { b.vy *= -1; Sfx.play('stomp'); } b.x = U.clamp(b.x, ib.x + 9, ib.x2 - 9); b.y = U.clamp(b.y, ib.y + 9, ib.y2 - 9); }
        },
        draw: (g, b) => { g.save(); g.translate(Math.round(b.x), Math.round(b.y)); g.rotate(b.rot); g.drawImage(img, -13, -13, 26, 26); g.restore(); } });
    },
    update(B, c) { const ib = B.inner(); if (every(c, 20)) B.spawn({ img: bspr('puff'), x: U.rnd(ib.x + 4, ib.x2 - 4), y: ib.y - 6, vy: 1.6, r: 4, dmg: c.e.atk - 3, clip: true }); },
  },
};
const _flipX = new WeakMap();
function flipCachedX(img) { let c = _flipX.get(img); if (!c) { c = flipX(img); _flipX.set(img, c); } return c; }

/* ---------- Ajudantes para falas no meio da batalha ---------- */
async function enemySays(B, e, text, auto) {
  await B.showBubbles([B.makeBubble(e.x - 30, e.y - 54, text, 'left', e.def.voice || 'monster')], { auto });
}
async function memberSays(B, id, text, auto) {
  const m = B.member(id); if (!m) return;
  await B.showBubbles([B.makeBubble(m.x + 18, m.y - 34, text, 'right', id)], { auto });
}

/* ---------- Inimigos ---------- */
const ENEMIES = {
  srchapeu: {
    name: 'Sr. Chapéu', hp: 70, atk: 5, def: 0, money: 0, voice: 'hat', tiredAt: 0.4,
    check: '* SR. CHAPÉU - ATK 5 DEF 0\n* Um boneco de treino. Já foi de um professor.',
    intro: '* O Sr. Chapéu bloqueia o caminho!\n* (É só um boneco de treino.)',
    flavor: ['* O Sr. Chapéu encara o vazio.', '* O Sr. Chapéu ajeita a cartola.', '* Cheiro de serragem.'],
    acts: [{ name: 'Conversar', fn: async (B, e) => { await B.say('* Você puxou papo com o Sr. Chapéu.\n* Ele parece gostar de você.'); B.addMercy(e, 50); } }],
    talk: (B, e) => U.pick(['...', 'Mm-hmm.', 'Que coisa, hein?', '(silêncio de boneco)']),
    patterns: ['hat_rain', 'hat_line'],
  },
  cheesinho: {
    name: 'Cheesinho', hp: 140, atk: 9, def: 0, money: 18, voice: 'monster',
    check: '* CHEESINHO - ATK 9 DEF 0\n* Um salgadinho de queijo bravo. Odeia ser mastigado.',
    intro: '* Cheesinho rolou até você!',
    flavor: ['* Cheesinho espalha farelos laranjas por todo lado.', '* Cheiro de queijo processado.', '* Cheesinho está crocante de raiva.'],
    art: (B, e, f) => Spr.enemy('cheesinho', f, e.tired ? 'tired' : e.mercy >= 100 ? 'happy' : 'angry'),
    acts: [
      { name: 'Elogiar', fn: async (B, e) => { await B.say('* Você elogiou a crocância do Cheesinho.'); B.addMercy(e, 35); e.data.praised = true; } },
      { name: 'Prometer', fn: async (B, e) => { await B.say('* Você prometeu nunca, jamais, comer o Cheesinho.\n* (Isso vai ser difícil.)'); B.addMercy(e, 30); } },
      { name: 'Ler rótulo', req: ['kyle'], fn: async (B, e) => { await memberSays(B, 'kyle', 'Sódio: 900%. Corante: SIM. Queijo: ...não consta.'); await B.say('* Cheesinho ficou envergonhado com a própria tabela nutricional.'); B.addMercy(e, 65); B.tire(e); } },
    ],
    talk: (B, e) => e.mercy >= 100 ? 'Tá bom... vocês são legais.' : e.data.praised ? 'Para com isso... (crunch)' : U.pick(['Crunch! Crunch!', 'Ninguém me mastiga!', 'Sou 100% queijo artificial!', 'Laranja é a cor da raiva!']),
    patterns: ['puff_rain', 'fork_stab', 'crumb_spray'],
  },
  peru: {
    name: 'Peru Mutante', hp: 170, atk: 11, def: 1, money: 24, voice: 'goomba',
    check: '* PERU MUTANTE - ATK 11 DEF 1\n* Fugiu de uma fazenda bem estranha. Odeia feriados.',
    intro: '* Um Peru Mutante surgiu gritando!',
    flavor: ['* O Peru Mutante gorgoleja de forma ameaçadora.', '* Penas voam por todo lado.', '* Um dos olhos do Peru Mutante te encara. O outro, não.'],
    acts: [
      { name: 'Imitar', fn: async (B, e) => { await B.say('* Você fez "GLU GLU GLU".\n* O Peru Mutante achou que você é da família.'); B.addMercy(e, 35); } },
      { name: 'Agradecer', fn: async (B, e) => { await B.say('* Você desejou um feliz Dia de Ação de Graças.\n* O Peru Mutante ficou {r}MUITO{w} ofendido.'); e.atk += 2; e.data.offended = true; } },
      { name: 'Dar milho', req: ['kenny'], fn: async (B, e) => { await B.say('* Kenny tirou um milho do bolso.\n* (Ninguém quer saber de onde.)'); B.addMercy(e, 60); } },
    ],
    talk: (B, e) => e.data.offended ? (e.data.offended = false, 'EU NÃO VOU PRO FORNO!!') : e.mercy >= 100 ? 'glu... glu? (feliz)' : U.pick(['GLU GLU!', 'GLUGLUGLU?!', 'Penas pra todo lado!']),
    patterns: ['feather_fan', 'turkey_charge', 'gobble_ring'],
  },
  clyde: {
    name: 'Sapo Clyde', hp: 150, atk: 10, def: 0, money: 20, voice: 'butters',
    check: '* SAPO CLYDE - ATK 10 DEF 0\n* Bicho de pelúcia do Cartman. Ganhou vida no Mundo Sombrio.',
    intro: '* O Sapo Clyde quer tomar chá com você!',
    flavor: ['* O Sapo Clyde serve chá invisível.', '* Cheiro de pelúcia guardada no armário.', '* O Sapo Clyde ajeita a gravata imaginária.'],
    art: (B, e, f) => Spr.enemy('clyde', f, e.mercy >= 100 ? 'happy' : e.data.mad ? 'angry' : 'neutral'),
    acts: [
      { name: 'Tomar chá', fn: async (B, e) => { await B.say('* Você aceitou uma xícara de chá imaginário.\n* Estava... imaginariamente bom.'); B.addMercy(e, 40); } },
      { name: 'Conversar', fn: async (B, e) => { await B.say('* Você perguntou como é ser um bicho de pelúcia.'); B.addMercy(e, 25); e.data.talked = true; } },
      { name: 'Elogiar chá', req: ['kyle'], fn: async (B, e) => { await memberSays(B, 'kyle', 'Hum! Que chá sofisticado, senhor Clyde.'); B.addMercy(e, 55); } },
    ],
    talk: (B, e) => e.data.talked ? (e.data.talked = false, 'O Cartman me deixava no armário...') : e.mercy >= 100 ? 'Que visita agradável!' : U.pick(['Ribbit... mais chá?', 'Chá das cinco!', 'Mindinho levantado, por favor.']),
    patterns: ['frog_hop', 'tea_pour'],
  },
  mbp: {
    name: 'ManBearPig', hp: 720, atk: 14, def: 2, money: 80, voice: 'mbp', tiredAt: 0.25,
    check: '* MANBEARPIG - ATK 14 DEF 2\n* Meio homem, meio urso, meio porco. Ninguém o leva a sério.',
    intro: '* MANBEARPIG apareceu!\n* (Isso é sério. Super sério.)',
    flavor: (B, e) => U.pick(['* ManBearPig rosna em três idiomas.', '* ManBearPig está meio bravo, meio faminto, meio confuso.', '* Cheiro de floresta, chiqueiro e colônia barata.']),
    art: (B, e, f) => Spr.enemy('mbp', f),
    acts: [
      { name: 'Levar a sério', fn: async (B, e) => { await B.say('* Você olhou fundo nos olhos do ManBearPig e disse: "Eu levo você a sério."'); B.addMercy(e, 25); e.data.serious = true; } },
      { name: 'Fazer conta', fn: async (B, e) => { await B.say('* Você tentou somar meio + meio + meio.\n* Deu um e meio. ManBearPig ficou confuso.'); B.addMercy(e, 15); B.tire(e); } },
      { name: 'Super cereal', req: ['kyle'], fn: async (B, e) => { await memberSays(B, 'kyle', 'Pessoal... isso é SÉRIO. Super cereal!'); await B.say('* ManBearPig se sentiu respeitado pela primeira vez na vida.'); B.addMercy(e, 40); } },
      { name: 'Fingir morte', req: ['kenny'], fn: async (B, e) => { await B.say('* Kenny se fingiu de morto.\n* Ele é muito, MUITO bom nisso.'); B.addMercy(e, 30); } },
    ],
    talk: (B, e) => e.data.serious ? (e.data.serious = false, 'GRRR... (ninguém nunca disse isso)') : e.mercy >= 100 ? '...grrrunk. (paz)' : U.pick(['MEIO HOMEM!', 'MEIO URSO!', 'MEIO PORCO!', 'GRRROINK!']),
    patterns: ['claw_sweep', 'mud_rain', 'half_triple'],
  },
  goomba1: {
    name: 'Goomba', sprite: 'goomba', hp: 320, atk: 9, def: 1, money: 0, voice: 'goomba', tiredAt: 0,
    check: '* GOOMBA - ATK 9 DEF 1\n* Cavaleiro do Imperador. Veio de um reino de cogumelos.',
    intro: '* SIR GOOMBA ataca!',
    flavor: ['* Goomba balança a capa de forma dramática.', '* Goomba tenta parecer ameaçador.', '* Goomba ensaia sua risada maligna.'],
    art: (B, e, f) => Spr.enemy('goomba', f, e.data.squash > 0 ? 'squash' : e.mercy >= 60 ? 'happy' : 'angry'),
    acts: [
      { name: 'Elogiar capa', fn: async (B, e) => { await B.say('* Você disse que a capa do Goomba é muito estilosa.'); await enemySays(B, e, 'VERDADE?! Q-quer dizer... É CLARO que é!'); B.addMercy(e, 30); } },
      { name: 'Pular nele', fn: async (B, e) => { Sfx.play('jump'); await wait(10); Sfx.play('stomp'); e.data.squash = 30; await B.say('* Stan pulou na cabeça do Goomba!\n* Ele ficou achatado... e desachatou.'); B.damageEnemy(e, 30, B.member('stan')); B.addMercy(e, 15); } },
      { name: 'Rir junto', req: ['kyle'], fn: async (B, e) => { await B.say('* Kyle e Stan riram da risada maligna do Goomba.'); await enemySays(B, e, 'Vocês... gostaram da minha risada?! HO HO!'); B.addMercy(e, 40); } },
    ],
    onTurnEnd: async (B, e) => { e.data.squash = 0; },
    talk: (B, e) => U.pick(['HO HO HO! Tremam!', 'Pela CAPA do Imperador!', 'Eu sou um Goomba, NÃO um cogumelo!', 'Prepare-se para ser... PISOTEADO!']),
    patterns: ['goomba_march', 'cape_slash'],
  },
  goomba: {
    name: 'Goomba', sprite: 'goomba', hp: 800, atk: 12, def: 2, money: 0, voice: 'goomba', tiredAt: 0,
    check: '* GOOMBA - ATK 12 DEF 2\n* O cavaleiro fiel do Imperador. Prometeram a ele uma capa maior.',
    flavor: ['* Goomba protege o Imperador.', '* A capa do Goomba ondula sem vento.'],
    art: (B, e, f) => Spr.enemy('goomba', f, e.data.squash > 0 ? 'squash' : e.data.sad ? 'sad' : e.mercy >= 60 ? 'happy' : 'angry'),
    acts: [
      { name: 'Elogiar capa', fn: async (B, e) => { await B.say('* Você elogiou a capa do Goomba de novo.\n* Ele ficou vermelho. Mais vermelho que a capa.'); B.addMercy(e, 20); } },
      { name: 'Pular nele', fn: async (B, e) => { Sfx.play('jump'); await wait(10); Sfx.play('stomp'); e.data.squash = 30; await B.say('* Stan pulou no Goomba! BOING!'); B.damageEnemy(e, 40, B.member('stan')); B.addMercy(e, 10); } },
      { name: 'Capa maior?', req: ['kyle'], fn: async (B, e) => {
        await memberSays(B, 'kyle', 'Goomba... o Cartman já te deu ALGUMA coisa que prometeu?');
        await enemySays(B, e, '...ele prometeu uma CAPA MAIOR...');
        const c = B.enemies.find((x) => x.id === 'cartman' && !x.gone);
        if (c) await enemySays(B, c, 'NÃO ESCUTA ELES, GOOMBA!');
        e.data.sad = true; B.addMercy(e, 35);
      } },
      { name: 'Afagar', req: ['kenny'], fn: async (B, e) => { await B.say('* Kenny deu tapinhas carinhosos no chapéu do Goomba.\n* (Era a cabeça dele.)'); B.addMercy(e, 20); } },
    ],
    onTurnEnd: async (B, e) => { e.data.squash = 0; },
    talk: (B, e) => e.data.sad ? 'Majestade... é verdade?' : U.pick(['Pela glória do Imperador!', 'HO HO HO!', 'Minha capa vai ficar MAIOR!']),
    onSpare: async (B, e) => {
      await enemySays(B, e, 'Majestade... você MENTIU pra mim. EU ME DEMITO!');
      const c = B.enemies.find((x) => x.id === 'cartman' && !x.gone);
      if (c) { c.data.alone = true; await enemySays(B, c, 'Ah, é?! Então EU MESMO acabo com vocês!'); }
    },
    onDefeat: (B, e) => {
      (async () => { await wait(10); const c = B.enemies.find((x) => x.id === 'cartman' && !x.gone); if (c) c.data.alone = true; })();
    },
    patterns: ['goomba_march', 'cape_slash', 'mushroom_bounce'],
  },
  cartman: {
    name: 'Cartman', hp: 2000, atk: 15, def: 3, money: 0, voice: 'cartman', tiredAt: 0,
    check: '* CARTMAN - ATK 15 DEF 3\n* O Imperador do Mundo Sombrio. Diz que não é gordo, tem ossos largos.',
    flavor: (B, e) => e.data.alone ? U.pick(['* Cartman bate o pé no chão.', '* Cartman está ficando vermelho de raiva.', '* O Imperador perdeu o cavaleiro. E a paciência.'])
      : U.pick(['* O Imperador Cartman ergue o cetro de Cheesy Poof.', '* Cartman exige que todos respeitem sua autoridade.', '* Cheiro de frango frito e arrogância.']),
    art: (B, e, f) => {
      let expr = e.data.alone ? 'angry' : 'smug';
      if (e.mercy >= 100) expr = 'sad';
      if (e.tired) expr = 'tired';
      if (e.data.cry) expr = 'cry';
      if (e.data.laugh > 0) expr = 'laugh';
      return Spr.enemy('cartman', f, expr, e.data.attack > 0 ? 'attack' : 'idle');
    },
    acts: [
      { name: 'Respeitar', fn: async (B, e) => { await B.say('* Você se curvou e respeitou a autoridade do Cartman.'); e.data.laugh = 40; await enemySays(B, e, 'ISSO! Finalmente alguém com bom senso!'); B.addMercy(e, 12); } },
      { name: 'Ossos largos', fn: async (B, e) => { await B.say('* Você disse que o Cartman não é gordo.\n* Ele só tem ossos largos.'); await enemySays(B, e, '...você... você entende!'); B.addMercy(e, 22); } },
      { name: 'Dar Cheesy Poofs', fn: async (B, e) => {
        const i = G.items.indexOf('cheesy');
        if (i >= 0) { G.items.splice(i, 1); await B.say('* Você ofereceu um saco de Cheesy Poofs.\n* Cartman devorou tudo em 2 segundos.'); await enemySays(B, e, 'Hmm... CHEESY POOFS!'); B.addMercy(e, 30); }
        else { await B.say('* Você procurou nos bolsos, mas não tinha Cheesy Poofs.\n* (A loja do Butters vende.)'); B.addMercy(e, 3); }
      } },
      { name: 'Discutir', req: ['kyle'], fn: async (B, e) => {
        await memberSays(B, 'kyle', 'CARTMAN, SEU GORDO EGOÍSTA!');
        await enemySays(B, e, 'EU NÃO SOU GORDO, KYLE! EU TENHO OSSOS LARGOS!');
        await B.say('* Os dois gritaram um com o outro por cinco minutos.\n* Cartman ficou exausto.');
        B.tire(e);
      } },
      { name: 'Ligar pra mãe', req: ['kenny'], fn: async (B, e) => {
        await B.say('* Kenny pegou o celular e ligou para a mãe do Cartman.');
        await enemySays(B, e, 'MÃE?! Não, mãe, eu tô OCUPADO! ...Sim, eu vou comer legumes.');
        B.addMercy(e, 25);
      } },
    ],
    canSpare: (B, e) => !B.enemies.some((x) => (x.id === 'goomba') && !x.gone),
    onSpareFail: async (B, e, m) => {
      if (B.enemies.some((x) => x.id === 'goomba' && !x.gone)) await B.say('* Cartman se esconde atrás do Goomba.\n* Ele não vai desistir enquanto tiver um cavaleiro!');
      else await B.say('* Você tentou poupar o Cartman.\n* Mas o nome dele não estava {y}AMARELO{w}...');
    },
    onTurnEnd: async (B, e) => { if (e.data.laugh > 0) e.data.laugh = 0; if (e.data.attack > 0) e.data.attack = 0; },
    talk: (B, e) => {
      if (e.mercy >= 100) return 'Tá... talvez eu tenha exagerado um pouquinho.';
      if (e.tired) return 'Hff... hff... vocês... não... respeitam...';
      if (e.data.alone) return U.pick(['VOCÊS VÃO PAGAR!', 'Sem o Goomba eu sou ainda MAIS forte!', 'Isso é contra as regras do MEU mundo!']);
      return U.pick(['RESPEITEM MINHA AUTORIDADE!', 'Goomba, ACABA com eles!', 'Neste mundo EU sou o rei!', 'Por que vocês nunca me deixam ganhar?!']);
    },
    onDefeat: (B, e) => { e.data.cry = true; e.gone = 'defeated'; return false; },
    pickPattern: (B, e) => U.pick(e.data.alone ? ['belly_wave', 'screw_you', 'scepter_beam', 'kfc_buckets', 'authority'] : ['cheesy_storm', 'authority', 'kfc_buckets', 'scepter_beam']),
  },
};
