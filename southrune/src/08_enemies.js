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
    drawOver(g, B, c) { const lbl = ['MAN', 'BEAR', 'PIG'][Math.min(2, Math.floor(c.t / 70))]; const ib = B.inner(); Mini.draw(g, lbl, ib.cx, ib.y - 9, '#ff5050', { align: 'center' }); },
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
        const word = U.pick(['AUTHORITAH', 'RESPECT', 'OBEY ME']);
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
      const phrase = "SCREW YOU GUYS! I'M GOING HOME!";
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
    name: 'Mr. Hat', hp: 70, atk: 5, def: 0, money: 0, voice: 'hat', tiredAt: 0.4,
    check: "* MR. HAT - ATK 5 DEF 0\n* Mr. Garrison's old puppet. Has strong opinions.",
    intro: "* Mr. Hat blocks the way!\n* (It's just a training dummy.)",
    flavor: ['* Mr. Hat stares into the void.', '* Mr. Hat adjusts his top hat.', '* Smells like sawdust and teacher lounge.'],
    acts: [{ name: 'Talk', fn: async (B, e) => { await B.say('* You made small talk with Mr. Hat.\n* He seems to like you more than Mr. Garrison.'); B.addMercy(e, 50); } }],
    talk: (B, e) => U.pick(['...', 'Mm-hmm.', "That's what I said!", '(puppet silence)']),
    patterns: ['hat_rain', 'hat_line'],
  },
  cheesinho: {
    name: 'Poofling', hp: 140, atk: 9, def: 0, money: 18, voice: 'monster',
    check: '* POOFLING - ATK 9 DEF 0\n* An angry Cheesy Poof. Hates being chewed.',
    intro: '* A Poofling rolls up to you!',
    flavor: ['* Poofling leaves orange dust everywhere.', '* Smells like processed cheese.', '* Poofling is crunchy with rage.'],
    art: (B, e, f) => Spr.enemy('cheesinho', f, e.tired ? 'tired' : e.mercy >= 100 ? 'happy' : 'angry'),
    acts: [
      { name: 'Compliment', fn: async (B, e) => { await B.say("* You told Poofling it has a great crunch."); B.addMercy(e, 35); e.data.praised = true; } },
      { name: 'Promise', fn: async (B, e) => { await B.say('* You promised to never, ever eat Poofling.\n* (Cartman would never.)'); B.addMercy(e, 30); } },
      { name: 'Read Label', req: ['kyle'], fn: async (B, e) => { await memberSays(B, 'kyle', 'Sodium: 900%. Cheese: ...not listed. Dude.'); await B.say('* Poofling is embarrassed by its own nutrition facts.'); B.addMercy(e, 65); B.tire(e); } },
    ],
    talk: (B, e) => e.mercy >= 100 ? "Fine... you guys are cool." : e.data.praised ? 'Stop it... (crunch)' : U.pick(['Crunch! Crunch!', 'Nobody chews ME!', '100% artificial cheese!', "You're gonna... NOT eat me!"]),
    patterns: ['puff_rain', 'fork_stab', 'crumb_spray'],
  },
  peru: {
    name: 'Mutant Turkey', hp: 170, atk: 11, def: 1, money: 24, voice: 'goomba',
    check: '* MUTANT TURKEY - ATK 11 DEF 1\n* Genetically engineered. Still mad about Thanksgiving.',
    intro: '* A Mutant Turkey attacks, gobbling!',
    flavor: ['* The Mutant Turkey gobbles menacingly.', '* Feathers everywhere.', '* One eye stares at you. The other one does not.'],
    acts: [
      { name: 'Gobble', fn: async (B, e) => { await B.say('* You went "GOBBLE GOBBLE GOBBLE."\n* The Mutant Turkey thinks you are family.'); B.addMercy(e, 35); } },
      { name: 'Thank', fn: async (B, e) => { await B.say('* You wished it a Happy Thanksgiving.\n* The Mutant Turkey is {r}VERY{w} offended.'); e.atk += 2; e.data.offended = true; } },
      { name: 'Give Corn', req: ['kenny'], fn: async (B, e) => { await B.say('* Kenny pulled some corn out of his hood.\n* (Nobody wants to know where it came from.)'); B.addMercy(e, 60); } },
    ],
    talk: (B, e) => e.data.offended ? (e.data.offended = false, "I'M NOT GOING IN THE OVEN!!") : e.mercy >= 100 ? 'gobble... (happy)' : U.pick(['GOBBLE GOBBLE!', 'GOBBLEGOBBLE?!', 'Feathers for EVERYONE!']),
    patterns: ['feather_fan', 'turkey_charge', 'gobble_ring'],
  },
  clyde: {
    name: 'Clyde Frog', hp: 150, atk: 10, def: 0, money: 20, voice: 'butters',
    check: "* CLYDE FROG - ATK 10 DEF 0\n* Cartman's stuffed frog. Came to life in the Dark World.",
    intro: '* Clyde Frog invites you to a tea party!',
    flavor: ['* Clyde Frog pours invisible tea.', '* Smells like a toy box.', '* Clyde Frog adjusts his imaginary bow tie.'],
    art: (B, e, f) => Spr.enemy('clyde', f, e.mercy >= 100 ? 'happy' : e.data.mad ? 'angry' : 'neutral'),
    acts: [
      { name: 'Drink Tea', fn: async (B, e) => { await B.say('* You accepted a cup of imaginary tea.\n* It was... imaginarily delicious.'); B.addMercy(e, 40); } },
      { name: 'Chat', fn: async (B, e) => { await B.say('* You asked what it is like being a stuffed animal.'); B.addMercy(e, 25); e.data.talked = true; } },
      { name: 'Praise Tea', req: ['kyle'], fn: async (B, e) => { await memberSays(B, 'kyle', 'Mmm! Very fancy tea, Mr. Clyde.'); B.addMercy(e, 55); } },
    ],
    talk: (B, e) => e.data.talked ? (e.data.talked = false, 'Cartman used to lock me in the closet...') : e.mercy >= 100 ? 'What lovely guests!' : U.pick(['Ribbit... more tea?', 'Polly Prissypants was NOT invited.', 'Pinkies up, please.']),
    patterns: ['frog_hop', 'tea_pour'],
  },
  mbp: {
    name: 'ManBearPig', hp: 720, atk: 14, def: 2, money: 80, voice: 'mbp', tiredAt: 0.25,
    check: "* MANBEARPIG - ATK 14 DEF 2\n* Half man, half bear, half pig. Nobody takes it seriously.",
    intro: "* MANBEARPIG appears!\n* (This is serious. Super cereal.)",
    flavor: (B, e) => U.pick(['* ManBearPig growls in three languages.', '* ManBearPig is half angry, half hungry, half confused.', '* Smells like forest, pigpen and cheap cologne.']),
    art: (B, e, f) => Spr.enemy('mbp', f),
    acts: [
      { name: 'Take Seriously', fn: async (B, e) => { await B.say('* You looked ManBearPig in the eyes and said: "I take you seriously."'); B.addMercy(e, 25); e.data.serious = true; } },
      { name: 'Do the Math', fn: async (B, e) => { await B.say('* You tried adding half + half + half.\n* That is one and a half. ManBearPig is confused.'); B.addMercy(e, 15); B.tire(e); } },
      { name: 'Super Cereal', req: ['kyle'], fn: async (B, e) => { await memberSays(B, 'kyle', "Guys... this is SERIOUS. I'm super cereal!"); await B.say('* ManBearPig feels respected for the first time in its life.'); B.addMercy(e, 40); } },
      { name: 'Play Dead', req: ['kenny'], fn: async (B, e) => { await B.say("* Kenny played dead.\n* He's had a LOT of practice."); B.addMercy(e, 30); } },
    ],
    talk: (B, e) => e.data.serious ? (e.data.serious = false, 'GRRR... (nobody ever said that)') : e.mercy >= 100 ? '...grrrunk. (peace)' : U.pick(['HALF MAN!', 'HALF BEAR!', 'HALF PIG!', 'GRRROINK!']),
    patterns: ['claw_sweep', 'mud_rain', 'half_triple'],
  },
  goomba1: {
    name: 'Sir Goomba', sprite: 'goomba', hp: 320, atk: 9, def: 1, money: 0, voice: 'goomba', tiredAt: 0,
    check: "* SIR GOOMBA - ATK 9 DEF 1\n* The Emperor's knight. Came from a mushroom kingdom. A plumber kept jumping on him.",
    intro: '* SIR GOOMBA attacks!',
    flavor: ['* Sir Goomba swishes his cape dramatically.', '* Sir Goomba tries to look scary.', '* Sir Goomba practices his evil laugh.'],
    art: (B, e, f) => Spr.enemy('goomba', f, e.data.squash > 0 ? 'squash' : e.mercy >= 60 ? 'happy' : 'angry'),
    acts: [
      { name: 'Praise Cape', fn: async (B, e) => { await B.say("* You told Sir Goomba his cape looks super cool."); await enemySays(B, e, 'REALLY?! I-I mean... OF COURSE it does!'); B.addMercy(e, 30); } },
      { name: 'Stomp', fn: async (B, e) => { Sfx.play('jump'); await wait(10); Sfx.play('stomp'); e.data.squash = 30; await B.say('* Stan jumped on Sir Goomba\'s head!\n* He got flattened... then un-flattened.'); B.damageEnemy(e, 30, B.member('stan')); B.addMercy(e, 15); } },
      { name: 'Laugh Along', req: ['kyle'], fn: async (B, e) => { await B.say("* Kyle and Stan laughed at Sir Goomba's evil laugh."); await enemySays(B, e, 'You guys... like my laugh?! HO HO!'); B.addMercy(e, 40); } },
    ],
    onTurnEnd: async (B, e) => { e.data.squash = 0; },
    talk: (B, e) => U.pick(['HO HO HO! Tremble!', 'For the Emperor\'s CAPE!', "I'm a Goomba, NOT a mushroom!", 'Prepare to be STOMPED! ...wait, that usually happens to ME.']),
    patterns: ['goomba_march', 'cape_slash'],
  },
  goomba: {
    name: 'Sir Goomba', sprite: 'goomba', hp: 800, atk: 12, def: 2, money: 0, voice: 'goomba', tiredAt: 0,
    check: "* SIR GOOMBA - ATK 12 DEF 2\n* The Emperor's loyal knight. Was promised a bigger cape.",
    flavor: ['* Sir Goomba protects the Emperor.', '* Sir Goomba\'s cape flutters with no wind.'],
    art: (B, e, f) => Spr.enemy('goomba', f, e.data.squash > 0 ? 'squash' : e.data.sad ? 'sad' : e.mercy >= 60 ? 'happy' : 'angry'),
    acts: [
      { name: 'Praise Cape', fn: async (B, e) => { await B.say('* You praised Sir Goomba\'s cape again.\n* He blushed. Redder than the cape.'); B.addMercy(e, 20); } },
      { name: 'Stomp', fn: async (B, e) => { Sfx.play('jump'); await wait(10); Sfx.play('stomp'); e.data.squash = 30; await B.say('* Stan jumped on Sir Goomba! BOING!\n* (Old habits.)'); B.damageEnemy(e, 40, B.member('stan')); B.addMercy(e, 10); } },
      { name: 'Bigger Cape?', req: ['kyle'], fn: async (B, e) => {
        await memberSays(B, 'kyle', 'Goomba... has Cartman EVER given you anything he promised?');
        await enemySays(B, e, '...he promised me a BIGGER CAPE...');
        const c = B.enemies.find((x) => x.id === 'cartman' && !x.gone);
        if (c) await enemySays(B, c, "DON'T LISTEN TO HIM, GOOMBA! HE'S A JERSEY GUY!");
        e.data.sad = true; B.addMercy(e, 35);
      } },
      { name: 'Pat', req: ['kenny'], fn: async (B, e) => { await B.say("* Kenny gave Sir Goomba a gentle pat on the hat.\n* (It was his head.)"); B.addMercy(e, 20); } },
    ],
    onTurnEnd: async (B, e) => { e.data.squash = 0; },
    talk: (B, e) => e.data.sad ? 'Your Majesty... is it true?' : U.pick(['For the glory of the Emperor!', 'HO HO HO!', 'My cape will be BIGGER!']),
    onSpare: async (B, e) => {
      await enemySays(B, e, 'Your Majesty... you LIED to me. I QUIT!');
      await enemySays(B, e, 'First the Koopas took my job, now this... DEY TOOK ER JERBS!');
      const c = B.enemies.find((x) => x.id === 'cartman' && !x.gone);
      if (c) { c.data.alone = true; await enemySays(B, c, "Oh, yeah?! Then I'LL beat you guys MYSELF!"); }
    },
    onDefeat: (B, e) => {
      (async () => { await wait(10); const c = B.enemies.find((x) => x.id === 'cartman' && !x.gone); if (c) c.data.alone = true; })();
    },
    patterns: ['goomba_march', 'cape_slash', 'mushroom_bounce'],
  },
  cartman: {
    name: 'Cartman', hp: 2000, atk: 15, def: 3, money: 0, voice: 'cartman', tiredAt: 0,
    check: "* CARTMAN - ATK 15 DEF 3\n* Emperor of the Dark World. He's not fat, he's big-boned.",
    flavor: (B, e) => e.data.alone ? U.pick(['* Cartman stomps his feet.', '* Cartman is turning red with rage.', '* The Emperor lost his knight. And his patience.'])
      : U.pick(['* Emperor Cartman raises his Cheesy Poof scepter.', '* Cartman demands that everyone respect his authoritah.', '* Smells like fried chicken and arrogance.']),
    art: (B, e, f) => {
      let expr = e.data.alone ? 'angry' : 'smug';
      if (e.mercy >= 100) expr = 'sad';
      if (e.tired) expr = 'tired';
      if (e.data.cry) expr = 'cry';
      if (e.data.laugh > 0) expr = 'laugh';
      return Spr.enemy('cartman', f, expr, e.data.attack > 0 ? 'attack' : 'idle');
    },
    acts: [
      { name: 'Respect', fn: async (B, e) => { await B.say('* You bowed and respected Cartman\'s authoritah.'); e.data.laugh = 40; await enemySays(B, e, 'YES! FINALLY someone with common sense!'); B.addMercy(e, 12); } },
      { name: 'Big-Boned', fn: async (B, e) => { await B.say("* You told Cartman he isn't fat.\n* He's just big-boned."); await enemySays(B, e, '...You... you GET me!'); B.addMercy(e, 22); } },
      { name: 'Cheesy Poofs', fn: async (B, e) => {
        const i = G.items.indexOf('cheesy');
        if (i >= 0) { G.items.splice(i, 1); await B.say('* You offered a bag of Cheesy Poofs.\n* Cartman ate the whole thing in two seconds.'); await enemySays(B, e, 'Mmm... CHEESY POOFS!'); B.addMercy(e, 30); }
        else { await B.say("* You checked your pockets. No Cheesy Poofs.\n* (Butters' shop sells them.)"); B.addMercy(e, 3); }
      } },
      { name: 'Argue', req: ['kyle'], fn: async (B, e) => {
        await memberSays(B, 'kyle', 'CARTMAN, YOU FATASS!');
        await enemySays(B, e, "I'M NOT FAT, I'M BIG-BONED, KAHL!");
        await B.say('* They screamed at each other for five minutes.\n* Cartman is exhausted.');
        B.tire(e);
      } },
      { name: 'Call Mom', req: ['kenny'], fn: async (B, e) => {
        await B.say("* Kenny pulled out a phone and called Cartman's mom.");
        await enemySays(B, e, "MOOOM! No, Mom, I'm BUSY! ...Yes, I'll eat my vegetables.");
        B.addMercy(e, 25);
      } },
    ],
    canSpare: (B, e) => !B.enemies.some((x) => (x.id === 'goomba') && !x.gone),
    onSpareFail: async (B, e, m) => {
      if (B.enemies.some((x) => x.id === 'goomba' && !x.gone)) await B.say('* Cartman hides behind Sir Goomba.\n* He won\'t give up while he still has a knight!');
      else await B.say("* You tried to spare Cartman.\n* But his name wasn't {y}YELLOW{w}...");
    },
    onTurnEnd: async (B, e) => { if (e.data.laugh > 0) e.data.laugh = 0; if (e.data.attack > 0) e.data.attack = 0; },
    talk: (B, e) => {
      if (e.mercy >= 100) return 'Fine... maybe I went a LITTLE too far.';
      if (e.tired) return 'Hff... hff... you guys... suck...';
      if (e.data.alone) return U.pick(['BEEFCAKE! BEEEEFCAKE!', 'Whatever! I do what I want!', "This is MY world! I make the rules!"]);
      return U.pick(['RESPECT MY AUTHORITAH!', 'Goomba, GET THEM!', "In this world, I'M the king!", 'Why do you guys never let me win?!', 'Screw you guys!']);
    },
    onDefeat: (B, e) => { e.data.cry = true; e.gone = 'defeated'; return false; },
    pickPattern: (B, e) => U.pick(e.data.alone ? ['belly_wave', 'screw_you', 'scepter_beam', 'kfc_buckets', 'authority'] : ['cheesy_storm', 'authority', 'kfc_buckets', 'scepter_beam']),
  },
};
