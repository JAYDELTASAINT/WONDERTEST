'use strict';
/* =====================================================================
   SOUTHRUNE — jogo de fã inspirado em DELTARUNE (Toby Fox),
   estrelando Stan, Kyle, Kenny e Cartman (South Park) e um Goomba de capa.
   Núcleo: constantes, utilidades, corrotinas, entrada (teclado/toque), tela.
   ===================================================================== */

const W = 320, H = 240, FPS = 30, STEP_MS = 1000 / FPS;

const U = {
  clamp: (v, a, b) => (v < a ? a : v > b ? b : v),
  lerp: (a, b, t) => a + (b - a) * t,
  rnd: (a, b) => a + Math.random() * (b - a),
  irnd: (a, b) => Math.floor(a + Math.random() * (b - a + 1)),
  pick: (arr) => arr[Math.floor(Math.random() * arr.length)],
  dist: (x1, y1, x2, y2) => Math.hypot(x2 - x1, y2 - y1),
  ang: (x1, y1, x2, y2) => Math.atan2(y2 - y1, x2 - x1),
  sign: (v) => (v > 0 ? 1 : v < 0 ? -1 : 0),
  approach: (v, t, s) => (v < t ? Math.min(v + s, t) : Math.max(v - s, t)),
  overlap: (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y,
  hash(x, y, s = 0) {
    let h = (x * 374761393 + y * 668265263 + s * 2147483647) | 0;
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
  },
  shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  },
  pad: (n, len, ch = ' ') => String(n).padStart(len, ch),
};

function makeCanvas(w, h) {
  const c = document.createElement('canvas');
  c.width = Math.max(1, w | 0); c.height = Math.max(1, h | 0);
  const x = c.getContext('2d');
  x.imageSmoothingEnabled = false;
  return c;
}

/* ---------- Corrotinas: esperas e tweens dirigidos pelo laço do jogo ---------- */
let frame = 0;
const _waiters = [];
function wait(n = 1) {
  return new Promise((res) => _waiters.push({ at: frame + Math.max(1, Math.round(n)), res }));
}
function waitFor(cond) { return new Promise((res) => _waiters.push({ cond, res })); }
function _tickWaiters() {
  for (let i = 0; i < _waiters.length; i++) {
    const w = _waiters[i];
    let ok = false;
    try { ok = w.cond ? w.cond() : frame >= w.at; } catch (e) { ok = true; }
    if (ok) { _waiters.splice(i--, 1); w.res(); }
  }
}
const Ease = {
  lin: (t) => t,
  out: (t) => 1 - (1 - t) * (1 - t),
  in: (t) => t * t,
  inout: (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2),
  back: (t) => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); },
};
const _tweens = [];
function tween(obj, props, frames, ease = Ease.out) {
  return new Promise((res) => {
    const from = {};
    for (const k in props) from[k] = obj[k];
    _tweens.push({ obj, from, to: props, n: Math.max(1, Math.round(frames)), t: 0, ease, res });
  });
}
function _tickTweens() {
  for (let i = 0; i < _tweens.length; i++) {
    const tw = _tweens[i];
    tw.t++;
    const k = tw.ease(Math.min(1, tw.t / tw.n));
    for (const p in tw.to) tw.obj[p] = tw.from[p] + (tw.to[p] - tw.from[p]) * k;
    if (tw.t >= tw.n) { _tweens.splice(i--, 1); tw.res(); }
  }
}
/* Abandona todas as corrotinas pendentes (usado ao voltar ao título / game over). */
function abandonAsync() { _waiters.length = 0; _tweens.length = 0; }

/* ---------- Entrada ---------- */
const Input = {
  BUTTONS: ['up', 'down', 'left', 'right', 'confirm', 'cancel', 'menu'],
  held: {},
  pressed: {},
  _pressed: {},
  keyMap: {
    ArrowUp: 'up', KeyW: 'up', ArrowDown: 'down', KeyS: 'down',
    ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right',
    KeyZ: 'confirm', Enter: 'confirm', NumpadEnter: 'confirm', Space: 'confirm',
    KeyX: 'cancel', ShiftLeft: 'cancel', ShiftRight: 'cancel', Backspace: 'cancel', Escape: 'cancel',
    KeyC: 'menu', ControlLeft: 'menu', ControlRight: 'menu',
  },
  down(b) { if (!this.held[b]) this._pressed[b] = true; this.held[b] = true; },
  up(b) { this.held[b] = false; },
  update() { this.pressed = this._pressed; this._pressed = {}; },
  p(b) { return !!this.pressed[b]; },
  h(b) { return !!this.held[b]; },
  take(b) { if (this.pressed[b]) { this.pressed[b] = false; return true; } return false; },
  any() { return this.BUTTONS.some((b) => this.pressed[b]); },
  takeAny() { const a = this.any(); if (a) this.pressed = {}; return a; },
  clear() { this.held = {}; this.pressed = {}; this._pressed = {}; },
  init() {
    window.addEventListener('keydown', (e) => {
      const b = this.keyMap[e.code];
      if (b) {
        e.preventDefault();
        Sfx.unlock();
        if (!e.repeat) this.down(b);
      }
    });
    window.addEventListener('keyup', (e) => {
      const b = this.keyMap[e.code];
      if (b) { e.preventDefault(); this.up(b); }
    });
    for (const ev of ['touchend', 'click', 'mousedown']) document.addEventListener(ev, () => Sfx.unlock(), { passive: true });
    window.addEventListener('blur', () => this.clear());
    document.addEventListener('visibilitychange', () => { if (document.hidden) this.clear(); });
  },
};

/* ---------- Controles de toque (direcional + botões Z/X/C) ---------- */
const Touch = {
  enabled: false,
  dirs: { up: false, down: false, left: false, right: false },
  setDirs(nd) {
    for (const d in this.dirs) {
      if (nd[d] && !this.dirs[d]) Input.down(d);
      else if (!nd[d] && this.dirs[d]) Input.up(d);
      this.dirs[d] = !!nd[d];
    }
    const pad = document.getElementById('dpad');
    if (pad) for (const d in this.dirs) pad.classList.toggle('on-' + d, this.dirs[d]);
  },
  init() {
    const coarse = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
    this.enabled = !!(coarse || 'ontouchstart' in window || (navigator.maxTouchPoints || 0) > 0);
    document.body.classList.toggle('touch', this.enabled);
    const pad = document.getElementById('dpad');
    const knob = pad && pad.querySelector('.knob');
    let pid = null;
    const aim = (e) => {
      const r = pad.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
      const len = Math.hypot(dx, dy), max = r.width / 2;
      const nd = { up: false, down: false, left: false, right: false };
      if (len > max * 0.18) {
        const sector = ((Math.round(Math.atan2(dy, dx) / (Math.PI / 4)) % 8) + 8) % 8;
        // 0 dir, 1 baixo-dir, 2 baixo, 3 baixo-esq, 4 esq, 5 cima-esq, 6 cima, 7 cima-dir
        if (sector === 7 || sector === 0 || sector === 1) nd.right = true;
        if (sector >= 1 && sector <= 3) nd.down = true;
        if (sector >= 3 && sector <= 5) nd.left = true;
        if (sector >= 5 && sector <= 7) nd.up = true;
      }
      const k = Math.min(1, len / max) * max * 0.45;
      if (knob) knob.style.transform = len > 1 ? `translate(${(dx / len) * k}px, ${(dy / len) * k}px)` : '';
      this.setDirs(nd);
    };
    const release = () => {
      pid = null;
      if (knob) knob.style.transform = '';
      this.setDirs({});
    };
    if (pad) {
      pad.addEventListener('pointerdown', (e) => {
        e.preventDefault(); Sfx.unlock();
        pid = e.pointerId;
        try { pad.setPointerCapture(pid); } catch (err) { /* ok */ }
        aim(e);
      });
      pad.addEventListener('pointermove', (e) => { if (e.pointerId === pid) aim(e); });
      pad.addEventListener('pointerup', (e) => { if (e.pointerId === pid) release(); });
      pad.addEventListener('pointercancel', (e) => { if (e.pointerId === pid) release(); });
      pad.addEventListener('lostpointercapture', (e) => { if (e.pointerId === pid) release(); });
    }
    document.querySelectorAll('[data-b]').forEach((el) => {
      const b = el.dataset.b;
      el.addEventListener('pointerdown', (e) => {
        e.preventDefault(); Sfx.unlock();
        try { el.setPointerCapture(e.pointerId); } catch (err) { /* ok */ }
        Input.down(b); el.classList.add('on');
        if (navigator.vibrate) { try { navigator.vibrate(8); } catch (err) { /* ok */ } }
      });
      const up = () => { Input.up(b); el.classList.remove('on'); };
      el.addEventListener('pointerup', up);
      el.addEventListener('pointercancel', up);
      el.addEventListener('lostpointercapture', up);
      el.addEventListener('contextmenu', (e) => e.preventDefault());
    });
    // Toque na própria tela do jogo = confirmar (ajuda muito nos diálogos).
    const cv = document.getElementById('screen');
    cv.addEventListener('pointerdown', (e) => {
      e.preventDefault(); Sfx.unlock();
      try { cv.focus({ preventScroll: true }); } catch (err) { /* ok */ }
      Input.down('confirm');
      const lift = () => { Input.up('confirm'); window.removeEventListener('pointerup', lift); window.removeEventListener('pointercancel', lift); };
      window.addEventListener('pointerup', lift);
      window.addEventListener('pointercancel', lift);
    });
    // Evita zoom/rolagem acidentais no iOS.
    ['gesturestart', 'gesturechange', 'gestureend'].forEach((ev) => document.addEventListener(ev, (e) => e.preventDefault()));
    document.addEventListener('touchmove', (e) => { if (e.target.closest && e.target.closest('#app')) e.preventDefault(); }, { passive: false });
    let lastTouchEnd = 0;
    document.addEventListener('touchend', (e) => {
      const now = Date.now();
      if (now - lastTouchEnd < 350 && e.target.closest && e.target.closest('#app')) e.preventDefault();
      lastTouchEnd = now;
    }, { passive: false });
  },
};

/* ---------- Tela: buffer 320x240 ampliado sem suavização ---------- */
const Screen = {
  canvas: null, dctx: null, buf: null, ctx: null,
  init() {
    this.canvas = document.getElementById('screen');
    this.dctx = this.canvas.getContext('2d');
    this.buf = makeCanvas(W, H);
    this.ctx = this.buf.getContext('2d');
    this.ctx.imageSmoothingEnabled = false;
    const re = () => this.layout();
    window.addEventListener('resize', re);
    window.addEventListener('orientationchange', () => setTimeout(re, 120));
    if (window.visualViewport) window.visualViewport.addEventListener('resize', re);
    this.layout();
    setTimeout(re, 300);
  },
  layout() {
    const app = document.getElementById('app');
    const stage = document.getElementById('stage');
    if (!app || !stage) return;
    const vw = app.clientWidth, vh = app.clientHeight;
    const portrait = vh > vw * 1.08;
    document.body.classList.toggle('portrait', portrait);
    document.body.classList.toggle('landscape', !portrait);
    if (document.body.classList.contains('touch') && portrait) {
      // Retrato: jogo em cima (4:3), controles embaixo.
      const sh = Math.min(Math.round(vw * 0.75), Math.round(vh * 0.6));
      stage.style.height = sh + 'px';
    } else {
      stage.style.height = '';
    }
    const sw = stage.clientWidth, sh = stage.clientHeight;
    let s = Math.min(sw / W, sh / H);
    if (s >= 2) { const f = Math.floor(s); if (s - f < 0.35) s = f; }
    const cw = Math.max(1, Math.floor(W * s)), ch = Math.max(1, Math.floor(H * s));
    this.canvas.style.width = cw + 'px';
    this.canvas.style.height = ch + 'px';
    const dpr = Math.min(window.devicePixelRatio || 1, 3);
    this.canvas.width = Math.round(cw * dpr);
    this.canvas.height = Math.round(ch * dpr);
    this.dctx.imageSmoothingEnabled = false;
  },
  present() {
    const d = this.dctx;
    d.imageSmoothingEnabled = false;
    d.drawImage(this.buf, 0, 0, this.canvas.width, this.canvas.height);
  },
};

/* ---------- Armazenamento local (protegido contra falhas) ---------- */
const Store = {
  get(key, fallback = null) {
    try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch (e) { return fallback; }
  },
  set(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); return true; } catch (e) { return false; }
  },
  del(key) { try { localStorage.removeItem(key); } catch (e) { /* ok */ } },
};
