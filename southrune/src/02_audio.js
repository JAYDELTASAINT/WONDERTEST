'use strict';
/* Áudio 100% sintetizado (WebAudio): efeitos, "vozes" do texto e um sequenciador chiptune
   com trilhas originais compostas para o jogo. */

const Sfx = {
  ctx: null, master: null, sfxBus: null, musBus: null, waves: {}, noiseBuf: null,
  vol: { master: 0.8, music: 0.75, sfx: 0.9 },
  _lastBlip: 0,
  unlock() {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    if (!this.ctx) {
      try { this.ctx = new AC(); } catch (e) { return; }
      try { if (navigator.audioSession) navigator.audioSession.type = 'playback'; } catch (e) { /* ok */ }
      const c = this.ctx;
      const comp = c.createDynamicsCompressor();
      comp.threshold.value = -14; comp.knee.value = 10; comp.ratio.value = 4;
      comp.attack.value = 0.004; comp.release.value = 0.15;
      this.master = c.createGain();
      this.master.connect(comp); comp.connect(c.destination);
      this.sfxBus = c.createGain(); this.sfxBus.connect(this.master);
      this.musBus = c.createGain(); this.musBus.connect(this.master);
      for (const [k, d] of [['p12', 0.125], ['p25', 0.25], ['p50', 0.5]]) this.waves[k] = this.pulse(d);
      const len = c.sampleRate;
      this.noiseBuf = c.createBuffer(1, len, c.sampleRate);
      const data = this.noiseBuf.getChannelData(0);
      for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
      this.applyVolume();
      try { // toca um buffer silencioso para destravar o áudio no iOS
        const b = c.createBuffer(1, 1, 22050), src = c.createBufferSource();
        src.buffer = b; src.connect(c.destination); src.start(0);
      } catch (e) { /* ok */ }
      Music._onUnlock();
    }
    if (this.ctx.state === 'suspended') this.ctx.resume().catch(() => {});
  },
  applyVolume() {
    if (!this.ctx) return;
    this.master.gain.value = this.vol.master;
    this.sfxBus.gain.value = this.vol.sfx;
    this.musBus.gain.value = this.vol.music;
  },
  pulse(d) {
    const n = 48, re = new Float32Array(n), im = new Float32Array(n);
    for (let i = 1; i < n; i++) {
      re[i] = Math.sin(2 * Math.PI * i * d) / (Math.PI * i);
      im[i] = (1 - Math.cos(2 * Math.PI * i * d)) / (Math.PI * i);
    }
    return this.ctx.createPeriodicWave(re, im);
  },
  ok() { return this.ctx && this.ctx.state === 'running'; },
  tone(o) {
    if (!this.ctx) return;
    const c = this.ctx;
    const { f = 440, f2 = 0, dur = 0.1, type = 'p50', vol = 0.2, a = 0.002, d = 0, s = 1, r = 0.03, at = 0, dest = null, t = 0 } = o;
    const t0 = (t || c.currentTime) + at;
    const osc = c.createOscillator();
    if (this.waves[type]) osc.setPeriodicWave(this.waves[type]); else osc.type = type;
    osc.frequency.setValueAtTime(f, t0);
    if (f2) osc.frequency.exponentialRampToValueAtTime(Math.max(20, f2), t0 + dur);
    if (o.vib) {
      const lfo = c.createOscillator(), lg = c.createGain();
      lfo.frequency.value = o.vib; lg.gain.value = f * 0.012;
      lfo.connect(lg); lg.connect(osc.frequency);
      lfo.start(t0 + 0.12); lfo.stop(t0 + dur + r + 0.05);
    }
    const g = c.createGain();
    const hold = Math.max(dur, a + d);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.linearRampToValueAtTime(vol, t0 + a);
    if (d) g.gain.linearRampToValueAtTime(Math.max(0.0001, vol * s), t0 + a + d);
    g.gain.setValueAtTime(Math.max(0.0001, d ? vol * s : vol), t0 + hold);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + hold + r);
    let node = osc;
    if (o.lp) { const fl = c.createBiquadFilter(); fl.type = 'lowpass'; fl.frequency.value = o.lp; osc.connect(fl); node = fl; }
    node.connect(g);
    g.connect(dest || this.sfxBus);
    osc.start(t0);
    osc.stop(t0 + hold + r + 0.03);
  },
  noise(o) {
    if (!this.ctx) return;
    const c = this.ctx;
    const { dur = 0.1, vol = 0.2, type = 'highpass', f = 1000, f2 = 0, q = 0.8, at = 0, a = 0.001, r = 0.04, dest = null, t = 0 } = o;
    const t0 = (t || c.currentTime) + at;
    const src = c.createBufferSource();
    src.buffer = this.noiseBuf;
    const fl = c.createBiquadFilter();
    fl.type = type; fl.frequency.setValueAtTime(f, t0); fl.Q.value = q;
    if (f2) fl.frequency.exponentialRampToValueAtTime(Math.max(30, f2), t0 + dur);
    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.linearRampToValueAtTime(vol, t0 + a);
    g.gain.setValueAtTime(vol, t0 + Math.max(a, dur * 0.3));
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur + r);
    src.connect(fl); fl.connect(g); g.connect(dest || this.sfxBus);
    src.start(t0, Math.random() * 0.5);
    src.stop(t0 + dur + r + 0.03);
  },
  play(name, arg) {
    if (!this.ctx) return;
    const fn = SFX[name];
    if (fn) { try { fn(arg); } catch (e) { /* som não é crítico */ } }
  },
  /* "Voz" do texto: um bipe curto por letra, timbre por personagem. */
  blip(voice) {
    if (!this.ctx) return;
    const v = VOICES[voice] || VOICES.default;
    const f = v.f * (1 + (Math.random() * 2 - 1) * (v.v || 0));
    if (v.noise) { this.noise({ dur: 0.04, vol: v.vol, type: 'bandpass', f: v.f, q: 2 }); return; }
    this.tone({ f, dur: v.dur || 0.035, type: v.type, vol: v.vol, r: 0.02, lp: v.lp });
  },
};

const VOICES = {
  default: { f: 560, type: 'p50', vol: 0.07, v: 0.0 },
  narr: { f: 98, type: 'triangle', vol: 0.22, dur: 0.06 },
  stan: { f: 470, type: 'p50', vol: 0.07, v: 0.04 },
  kyle: { f: 620, type: 'p25', vol: 0.07, v: 0.05 },
  kenny: { f: 210, type: 'triangle', vol: 0.18, v: 0.12, lp: 600, dur: 0.05 },
  cartman: { f: 300, type: 'p50', vol: 0.08, v: 0.08 },
  goomba: { f: 880, type: 'p12', vol: 0.07, v: 0.18 },
  butters: { f: 760, type: 'p25', vol: 0.065, v: 0.06 },
  mackey: { f: 360, type: 'p50', vol: 0.07, v: 0.03 },
  barbrady: { f: 250, type: 'p25', vol: 0.07, v: 0.04 },
  mbp: { f: 180, noise: true, vol: 0.12 },
  hat: { f: 980, type: 'p25', vol: 0.06, v: 0.2 },
  monster: { f: 400, type: 'p25', vol: 0.06, v: 0.3 },
};

const tn = (o) => Sfx.tone(o), nz = (o) => Sfx.noise(o);
const SFX = {
  move: () => tn({ f: 1046, dur: 0.025, type: 'p25', vol: 0.09 }),
  select: () => { tn({ f: 784, dur: 0.035, type: 'p25', vol: 0.11 }); tn({ f: 1175, dur: 0.05, type: 'p25', vol: 0.11, at: 0.035 }); },
  cancel: () => tn({ f: 523, f2: 330, dur: 0.06, type: 'p25', vol: 0.1 }),
  hurt: () => { tn({ f: 360, f2: 80, dur: 0.18, type: 'p50', vol: 0.18 }); nz({ dur: 0.12, vol: 0.18, type: 'lowpass', f: 1800 }); },
  graze: () => tn({ f: 1568, f2: 2349, dur: 0.035, type: 'p12', vol: 0.05 }),
  slash: () => nz({ dur: 0.16, vol: 0.26, type: 'bandpass', f: 3500, f2: 500, q: 1.1 }),
  hit: () => { tn({ f: 190, f2: 55, dur: 0.12, type: 'p50', vol: 0.22 }); nz({ dur: 0.08, vol: 0.22, type: 'lowpass', f: 2500 }); },
  crit: () => { SFX.hit(); tn({ f: 1318, dur: 0.05, type: 'p25', vol: 0.1, at: 0.02 }); tn({ f: 1976, dur: 0.09, type: 'p25', vol: 0.1, at: 0.07 }); },
  miss: () => tn({ f: 300, f2: 200, dur: 0.08, type: 'triangle', vol: 0.12 }),
  heal: () => [523, 659, 784, 1046, 1318].forEach((f, i) => tn({ f, dur: 0.06, type: 'triangle', vol: 0.17, at: i * 0.045 })),
  spare: () => [1318, 1568, 2093, 2637, 3136].forEach((f, i) => tn({ f, dur: 0.05, type: 'p12', vol: 0.08, at: i * 0.035 })),
  flee: () => tn({ f: 300, f2: 1600, dur: 0.28, type: 'p50', vol: 0.1 }),
  encounter: () => { tn({ f: 988, dur: 0.05, type: 'p50', vol: 0.15 }); tn({ f: 1976, dur: 0.12, type: 'p50', vol: 0.15, at: 0.05 }); },
  battlestart: () => { nz({ dur: 0.35, vol: 0.14, type: 'bandpass', f: 300, f2: 3500 }); tn({ f: 110, f2: 520, dur: 0.3, type: 'sawtooth', vol: 0.08 }); },
  save: () => [784, 988, 1175, 1568].forEach((f, i) => tn({ f, dur: 0.12, type: 'triangle', vol: 0.14, at: i * 0.08, r: 0.2 })),
  item: () => [659, 784, 1046].forEach((f, i) => tn({ f, dur: 0.06, type: 'p25', vol: 0.1, at: i * 0.055 })),
  error: () => tn({ f: 110, dur: 0.18, type: 'p50', vol: 0.15 }),
  door: () => { tn({ f: 240, f2: 110, dur: 0.08, type: 'triangle', vol: 0.2 }); nz({ dur: 0.05, vol: 0.08, type: 'lowpass', f: 900, at: 0.02 }); },
  fall: () => { tn({ f: 900, f2: 55, dur: 2.2, type: 'sine', vol: 0.16 }); nz({ dur: 2.2, vol: 0.05, type: 'bandpass', f: 2200, f2: 150 }); },
  shatter: () => { nz({ dur: 0.3, vol: 0.28, type: 'highpass', f: 2500 }); tn({ f: 600, f2: 120, dur: 0.3, type: 'p12', vol: 0.12 }); },
  crack: () => { nz({ dur: 0.07, vol: 0.3, type: 'highpass', f: 3000 }); tn({ f: 200, dur: 0.05, type: 'p50', vol: 0.1 }); },
  swing: () => nz({ dur: 0.1, vol: 0.13, type: 'bandpass', f: 1200, f2: 4500, q: 0.8 }),
  spell: () => [880, 1108, 1318, 1760, 2217].forEach((f, i) => tn({ f, dur: 0.07, type: 'p25', vol: 0.07, at: i * 0.035 })),
  magic: () => { tn({ f: 220, f2: 1760, dur: 0.35, type: 'sawtooth', vol: 0.06 }); nz({ dur: 0.4, vol: 0.12, type: 'bandpass', f: 600, f2: 5000 }); },
  boom: () => { nz({ dur: 0.5, vol: 0.32, type: 'lowpass', f: 1400, f2: 90 }); tn({ f: 120, f2: 30, dur: 0.4, type: 'sine', vol: 0.32 }); },
  jump: () => tn({ f: 280, f2: 980, dur: 0.12, type: 'p50', vol: 0.12 }),
  stomp: () => { tn({ f: 520, f2: 110, dur: 0.1, type: 'p50', vol: 0.16 }); nz({ dur: 0.06, vol: 0.16, type: 'lowpass', f: 1500, at: 0.02 }); },
  switch: () => { tn({ f: 1200, dur: 0.025, type: 'p50', vol: 0.1 }); tn({ f: 600, dur: 0.04, type: 'p50', vol: 0.1, at: 0.03 }); },
  bell: () => { tn({ f: 1046, dur: 0.05, type: 'sine', vol: 0.14, r: 0.9 }); tn({ f: 2093, dur: 0.05, type: 'sine', vol: 0.05, r: 0.6 }); },
  appear: () => tn({ f: 200, f2: 820, dur: 0.15, type: 'p25', vol: 0.1 }),
  vanish: () => tn({ f: 820, f2: 160, dur: 0.2, type: 'p25', vol: 0.1 }),
  splat: () => { nz({ dur: 0.18, vol: 0.3, type: 'lowpass', f: 900, f2: 120 }); tn({ f: 160, f2: 40, dur: 0.2, type: 'p50', vol: 0.18 }); },
  thud: () => { tn({ f: 140, f2: 50, dur: 0.12, type: 'sine', vol: 0.3 }); nz({ dur: 0.06, vol: 0.12, type: 'lowpass', f: 600 }); },
  tp: () => tn({ f: 1760, dur: 0.04, type: 'p25', vol: 0.08 }),
  down: () => { tn({ f: 440, f2: 110, dur: 0.4, type: 'p50', vol: 0.14 }); },
  revive: () => [392, 523, 659, 784].forEach((f, i) => tn({ f, dur: 0.07, type: 'p50', vol: 0.1, at: i * 0.06 })),
  bite: () => { nz({ dur: 0.06, vol: 0.18, type: 'bandpass', f: 1500 }); tn({ f: 300, dur: 0.05, type: 'p50', vol: 0.1 }); },
  growl: () => { nz({ dur: 0.5, vol: 0.2, type: 'bandpass', f: 220, f2: 140, q: 3 }); tn({ f: 70, f2: 55, dur: 0.5, type: 'sawtooth', vol: 0.08 }); },
  squeak: () => tn({ f: 1400, f2: 2000, dur: 0.08, type: 'p12', vol: 0.08 }),
  rumble: () => nz({ dur: 1.2, vol: 0.18, type: 'lowpass', f: 200 }),
  whoosh: () => nz({ dur: 0.3, vol: 0.14, type: 'bandpass', f: 400, f2: 3000, q: 0.7 }),
  seal: () => { [523, 659, 784, 1046, 1318, 1568, 2093].forEach((f, i) => tn({ f, dur: 0.18, type: 'triangle', vol: 0.12, at: i * 0.09, r: 0.4 })); nz({ dur: 1.4, vol: 0.08, type: 'highpass', f: 4000, at: 0.2 }); },
  laugh: (voice = 'cartman') => { for (let i = 0; i < 5; i++) setTimeout(() => Sfx.blip(voice), i * 90); },
  join: () => {
    const seq = [[392, 0], [523, 0.1], [659, 0.2], [784, 0.3], [1046, 0.45]];
    seq.forEach(([f, at]) => tn({ f, dur: at === 0.45 ? 0.45 : 0.09, type: 'p25', vol: 0.12, at, r: 0.15 }));
    seq.forEach(([f, at]) => tn({ f: f / 2, dur: at === 0.45 ? 0.45 : 0.09, type: 'triangle', vol: 0.15, at }));
  },
  victory: () => {
    const seq = [[523, 0, 0.08], [523, 0.1, 0.08], [523, 0.2, 0.08], [659, 0.3, 0.3], [587, 0.62, 0.12], [659, 0.75, 0.12], [784, 0.88, 0.5]];
    seq.forEach(([f, at, d]) => { tn({ f, dur: d, type: 'p25', vol: 0.12, at, r: 0.1 }); tn({ f: f / 2, dur: d, type: 'triangle', vol: 0.14, at }); });
  },
};

/* ------------------------- Sequenciador ------------------------- */
const NOTE_IDX = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
function midiOf(name) {
  const m = /^([A-G])(#|b)?(-?\d)$/.exec(name);
  if (!m) return null;
  return 12 * (+m[3] + 1) + NOTE_IDX[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0);
}
const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);
const CHORD_Q = {
  '': [0, 4, 7], m: [0, 3, 7], '7': [0, 4, 7, 10], m7: [0, 3, 7, 10], maj7: [0, 4, 7, 11], sus4: [0, 5, 7],
  sus2: [0, 2, 7], dim: [0, 3, 6], aug: [0, 4, 8], '6': [0, 4, 7, 9], m6: [0, 3, 7, 9],
};
function chordInfo(name) {
  const m = /^([A-G])(#|b)?(.*)$/.exec(name);
  const root = NOTE_IDX[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0);
  return { root, iv: CHORD_Q[m[3]] || CHORD_Q[''] };
}
function noteName(midi) {
  const N = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  return N[((midi % 12) + 12) % 12] + (Math.floor(midi / 12) - 1);
}
/* Gera uma linha de baixo a partir dos acordes. pat (16 chars): R raiz, F quinta, O oitava, T terça, L quinta abaixo, - sustenta, . pausa */
function genBass(chords, pat, oct = 2) {
  const out = [];
  for (const ch of chords) {
    const { root, iv } = chordInfo(ch);
    const base = 12 * (oct + 1) + root;
    for (const p of pat) {
      if (p === 'R') out.push(noteName(base));
      else if (p === 'F') out.push(noteName(base + 7));
      else if (p === 'O') out.push(noteName(base + 12));
      else if (p === 'T') out.push(noteName(base + iv[1]));
      else if (p === 'L') out.push(noteName(base - 5));
      else out.push(p);
    }
  }
  return out.join(' ');
}
/* Arpejo: dígitos indexam as notas do acorde (subindo oitavas), - sustenta, . pausa */
function genArp(chords, pat, oct = 4) {
  const out = [];
  for (const ch of chords) {
    const { root, iv } = chordInfo(ch);
    const base = 12 * (oct + 1) + root;
    for (const p of pat) {
      if (p >= '0' && p <= '9') {
        const k = +p, o = Math.floor(k / iv.length);
        out.push(noteName(base + iv[k % iv.length] + 12 * o));
      } else out.push(p);
    }
  }
  return out.join(' ');
}
const rep = (s, n) => Array(n).fill(s).join(' ');

const INST = {
  lead: { type: 'p25', vol: 0.085, a: 0.004, d: 0.1, s: 0.6, r: 0.05 },
  leadB: { type: 'p50', vol: 0.07, a: 0.004, d: 0.12, s: 0.55, r: 0.05 },
  leadV: { type: 'p25', vol: 0.08, a: 0.01, d: 0.1, s: 0.7, r: 0.08, vib: 5.5 },
  soft: { type: 'triangle', vol: 0.15, a: 0.02, d: 0.2, s: 0.6, r: 0.15 },
  bell: { type: 'sine', vol: 0.13, a: 0.003, d: 0.5, s: 0.2, r: 0.5 },
  bass: { type: 'triangle', vol: 0.2, a: 0.003, d: 0.05, s: 0.85, r: 0.03 },
  bassP: { type: 'p50', vol: 0.05, a: 0.003, d: 0.05, s: 0.6, r: 0.02, lp: 900 },
  arp: { type: 'p12', vol: 0.04, a: 0.002, d: 0.05, s: 0.35, r: 0.02 },
  pluck: { type: 'p25', vol: 0.055, a: 0.002, d: 0.14, s: 0.12, r: 0.05 },
  pad: { type: 'triangle', vol: 0.07, a: 0.2, d: 0.3, s: 0.8, r: 0.5 },
  brass: { type: 'sawtooth', vol: 0.045, a: 0.02, d: 0.1, s: 0.8, r: 0.08, lp: 2200 },
};

const Music = {
  cur: null, name: null, step: 0, next: 0, gain: null, pending: null, vol: 1,
  compile(song) {
    if (song.events) return song;
    const len = song.bars * 16;
    song.len = len;
    song.events = Array.from({ length: len }, () => []);
    for (const ch of song.ch) {
      const toks = [];
      for (const raw of ch.d.split(/\s+/)) {
        if (!raw || raw === '|') continue;
        const [t, n] = raw.split(':');
        const k = n ? +n : 1;
        toks.push(t);
        for (let i = 1; i < k; i++) toks.push(t === '.' || t === 'r' ? '.' : '-');
      }
      for (let i = 0; i < len; i++) {
        const t = toks[i % Math.max(1, toks.length)];
        if (!t || t === '-' || t === '.' || t === 'r') continue;
        if (ch.drum) {
          for (const d of t) song.events[i].push({ drum: d, vol: ch.vol || 1 });
          continue;
        }
        const m = midiOf(t);
        if (m === null) continue;
        let durSteps = 1;
        while (toks[(i + durSteps) % toks.length] === '-' && durSteps < len) durSteps++;
        song.events[i].push({ inst: INST[ch.i], f: mtof(m + (ch.tr || 0)), dur: durSteps, vol: ch.vol || 1 });
      }
    }
    return song;
  },
  _onUnlock() { if (this.pending) { const p = this.pending; this.pending = null; this.play(p.name, p.opt); } },
  play(name, opt = {}) {
    if (this.name === name && this.cur && !opt.restart) return;
    const song = SONGS[name];
    if (!song) { this.stop(opt.fadeOut ?? 10); return; }
    if (!Sfx.ctx) { this.pending = { name, opt }; this.name = name; return; }
    this.stop(opt.fadeOut ?? 6);
    this.compile(song);
    const c = Sfx.ctx;
    this.cur = song; this.name = name; this.step = 0;
    this.gain = c.createGain();
    const v = (song.vol || 1) * this.vol;
    if (opt.fadeIn) {
      this.gain.gain.setValueAtTime(0.0001, c.currentTime);
      this.gain.gain.linearRampToValueAtTime(v, c.currentTime + opt.fadeIn / FPS);
    } else this.gain.gain.value = v;
    this.gain.connect(Sfx.musBus);
    this.next = c.currentTime + 0.06;
  },
  stop(fadeFrames = 0) {
    this.pending = null;
    if (!this.cur || !Sfx.ctx) { this.cur = null; this.name = null; return; }
    const g = this.gain, c = Sfx.ctx;
    if (fadeFrames > 0) {
      g.gain.cancelScheduledValues(c.currentTime);
      g.gain.setValueAtTime(g.gain.value, c.currentTime);
      g.gain.linearRampToValueAtTime(0.0001, c.currentTime + fadeFrames / FPS);
      setTimeout(() => { try { g.disconnect(); } catch (e) { /* ok */ } }, (fadeFrames / FPS) * 1000 + 600);
    } else { try { g.disconnect(); } catch (e) { /* ok */ } }
    this.cur = null; this.name = null; this.gain = null;
  },
  /* Abaixa/volta o volume da música atual (ex.: durante diálogos importantes). */
  duck(level, frames = 10) {
    if (!this.gain || !Sfx.ctx) return;
    const c = Sfx.ctx, g = this.gain.gain, v = (this.cur.vol || 1) * level;
    g.cancelScheduledValues(c.currentTime); g.setValueAtTime(g.value, c.currentTime);
    g.linearRampToValueAtTime(Math.max(0.0001, v), c.currentTime + frames / FPS);
  },
  update() {
    if (!this.cur || !Sfx.ctx) return;
    const c = Sfx.ctx;
    const stepDur = 60 / this.cur.bpm / 4;
    if (this.next < c.currentTime - 0.25) this.next = c.currentTime + 0.05;
    while (this.next < c.currentTime + 0.15) {
      this.playStep(this.step, this.next, stepDur);
      this.next += stepDur * (this.cur.swing && this.step % 2 === 0 ? 1 + this.cur.swing : this.cur.swing ? 1 - this.cur.swing : 1);
      this.step = (this.step + 1) % this.cur.len;
      if (this.step === 0 && this.cur.once) { this.stop(20); return; }
    }
  },
  playStep(i, t, sd) {
    const dest = this.gain;
    for (const e of this.cur.events[i]) {
      if (e.drum) { this.drum(e.drum, t, dest, e.vol); continue; }
      const ins = e.inst;
      Sfx.tone({ t, f: e.f, dur: Math.max(0.03, e.dur * sd - 0.01), type: ins.type, vol: ins.vol * e.vol, a: ins.a, d: ins.d, s: ins.s, r: ins.r, lp: ins.lp, vib: ins.vib, dest });
    }
  },
  drum(d, t, dest, v = 1) {
    switch (d) {
      case 'K': Sfx.tone({ t, f: 130, f2: 42, dur: 0.11, type: 'sine', vol: 0.32 * v, r: 0.04, dest }); break;
      case 'S': Sfx.noise({ t, dur: 0.1, vol: 0.13 * v, type: 'bandpass', f: 1900, q: 0.7, r: 0.05, dest }); Sfx.tone({ t, f: 200, f2: 120, dur: 0.05, type: 'triangle', vol: 0.1 * v, dest }); break;
      case 'H': Sfx.noise({ t, dur: 0.025, vol: 0.045 * v, type: 'highpass', f: 7500, r: 0.015, dest }); break;
      case 'O': Sfx.noise({ t, dur: 0.12, vol: 0.045 * v, type: 'highpass', f: 6500, r: 0.06, dest }); break;
      case 'C': Sfx.noise({ t, dur: 0.5, vol: 0.06 * v, type: 'highpass', f: 4500, r: 0.4, dest }); break;
      case 'T': Sfx.tone({ t, f: 190, f2: 95, dur: 0.12, type: 'sine', vol: 0.22 * v, dest }); break;
      case 'B': Sfx.tone({ t, f: 90, f2: 35, dur: 0.25, type: 'sine', vol: 0.3 * v, dest }); break;
      default: break;
    }
  },
};

/* ------------------------- Trilhas originais ------------------------- */
const SONGS = {};
(() => {
  // Abertura / título — misteriosa (Ré menor)
  const introCh = ['Dm', 'Bb', 'F', 'C', 'Dm', 'Bb', 'Gm', 'A'];
  SONGS.intro = {
    bpm: 72, bars: 8, vol: 0.9,
    ch: [
      { i: 'bell', d: 'A4:6 F4:2 D5:8 | C5:6 Bb4:2 F4:8 | A4:6 C5:2 F5:8 | E5:6 D5:2 C5:8 | A4:6 F4:2 D5:6 E5:2 | F5:6 E5:2 D5:8 | Bb4:4 D5:4 G5:8 | E5:4 C#5:4 A4:8' },
      { i: 'arp', d: genArp(introCh, '0-1-2-3-2-1-2-1-', 4), vol: 1.2 },
      { i: 'pad', d: genBass(introCh, 'R---------------', 3) },
      { i: 'bass', d: genBass(introCh, 'R-------F-------', 2), vol: 0.8 },
    ],
  };
  // Cidade (Mundo da Luz) — calma, folk (Sol maior)
  const townCh = ['G', 'Em', 'C', 'D', 'G', 'Em', 'Am', 'D'];
  SONGS.town = {
    bpm: 104, bars: 8, vol: 0.85,
    ch: [
      { i: 'leadB', d: 'B4:2 D5:2 G5:4 F#5:2 E5:2 D5:4 | E5:2 G5:2 B4:4 r:2 B4:2 A4:2 G4:2 | C5:2 E5:2 G5:4 A5:2 G5:2 E5:4 | D5:4 F#5:4 A5:6 r:2 | B5:2 A5:2 G5:4 D5:2 E5:2 G5:4 | E5:4 D5:2 B4:2 G4:4 B4:4 | A4:2 C5:2 E5:4 D5:2 C5:2 A4:4 | D5:6 F#4:2 A4:4 D5:4', vol: 0.9 },
      { i: 'pluck', d: genArp(townCh, '0.2.1.2.0.2.1.2.', 4) },
      { i: 'bass', d: genBass(townCh, 'R-..F-..O-..F-..', 2) },
      { drum: true, d: rep('K . . . H . . . S . . . H . . .', 8), vol: 0.6 },
    ],
  };
  // Mundo Sombrio — campo (Dó menor)
  const fieldA = ['Cm', 'Ab', 'Eb', 'Bb', 'Cm', 'Ab', 'Bb', 'G'];
  const fieldB = ['Ab', 'Bb', 'Gm', 'Cm', 'Fm', 'Bb', 'Eb', 'G'];
  const fieldCh = fieldA.concat(fieldB);
  SONGS.field = {
    bpm: 118, bars: 16, vol: 0.85,
    ch: [
      { i: 'lead', d: 'G4:2 C5:2 D5:2 Eb5:4 D5:2 C5:2 G4:2 | Ab4:2 C5:2 Eb5:2 F5:4 Eb5:2 C5:4 | Bb4:2 Eb5:2 G5:4 F5:2 Eb5:2 D5:4 | D5:6 C5:2 Bb4:8 | G4:2 C5:2 D5:2 Eb5:4 F5:2 G5:4 | Ab5:4 G5:2 F5:2 Eb5:4 C5:4 | D5:2 Eb5:2 F5:4 Eb5:2 D5:2 Bb4:4 | B4:8 D5:4 G5:4 | C6:6 Bb5:2 Ab5:8 | Bb5:6 Ab5:2 G5:8 | G5:4 F5:2 D5:2 Bb4:4 D5:4 | Eb5:6 D5:2 C5:8 | F5:4 Ab5:4 C6:4 Ab5:4 | G5:4 F5:4 D5:4 Bb4:4 | Eb5:4 G5:4 Bb5:6 Ab5:2 | G5:6 F5:2 D5:4 B4:4' },
      { i: 'arp', d: genArp(fieldCh, '0123212301232123', 4) },
      { i: 'bass', d: genBass(fieldCh, 'R-R-O-R-F-R-O-R-', 2) },
      { drum: true, d: rep('K . H . S . H . K . H K S . H .', 16), vol: 0.7 },
    ],
  };
  // Batalha — enérgica (Lá menor)
  const batA = ['Am', 'F', 'G', 'E', 'Am', 'F', 'G', 'E'];
  const batB = ['Dm', 'Am', 'Bb', 'E', 'Dm', 'Am', 'Bb', 'E'];
  const batCh = batA.concat(batB);
  SONGS.battle = {
    bpm: 142, bars: 16, vol: 0.85,
    ch: [
      { i: 'leadB', d: 'A4:2 C5:2 E5:2 A5:2 G5:2 E5:2 C5:2 E5:2 | F5:4 E5:2 C5:2 A4:4 C5:4 | D5:2 G5:2 B5:4 A5:2 G5:2 D5:4 | E5:2 G#5:2 B5:4 r:2 B5:2 C6:2 B5:2 | A5:3 G5:1 E5:2 C5:2 A4:2 C5:2 E5:4 | F5:2 A5:2 C6:4 B5:2 A5:2 F5:4 | G5:2 F5:2 D5:4 B4:2 D5:2 G5:4 | G#5:6 B5:2 E6:8 | D5:4 F5:4 A5:4 D6:4 | C6:4 B5:2 A5:2 E5:8 | D6:4 C6:2 Bb5:2 F5:4 D5:4 | E5:2 F5:2 G#5:4 B5:8 | A5:2 G5:2 F5:4 D5:4 F5:4 | E5:2 D5:2 C5:4 A4:8 | Bb4:4 D5:4 F5:4 Bb5:4 | B5:4 G#5:4 E5:4 B4:4' },
      { i: 'arp', d: genArp(batCh, '0.1.2.1.0.1.2.3.', 4) },
      { i: 'bass', d: genBass(batCh, 'R-.RR-.RO-.RF-RO', 2) },
      { i: 'bassP', d: genBass(batCh, 'R-.RR-.RO-.RF-RO', 2) },
      { drum: true, d: rep('K . H . S . H . K K H . S . H .', 15) + ' K . S . S . S S K . S S C . S S', vol: 0.8 },
    ],
  };
  // Tema do Goomba — marcha boba (Fá maior)
  const goomCh = ['F', 'C7', 'F', 'C7', 'Bb', 'F', 'C7', 'F'];
  SONGS.goomba = {
    bpm: 132, bars: 8, vol: 0.85,
    ch: [
      { i: 'lead', d: 'C5 r C5 r F5:2 A5:2 G5:2 F5:2 E5:2 F5:2 | G5:2 E5:2 C5:2 E5:2 G5:4 Bb5:4 | A5:2 G5:2 F5:2 A5:2 C6:4 A5:4 | G5:2 F5:2 E5:2 D5:2 C5:8 | D5:2 F5:2 Bb5:4 A5:2 G5:2 F5:4 | C5:2 F5:2 A5:4 G#5:2 A5:2 F5:4 | E5:2 G5:2 C6:2 Bb5:2 G5:2 E5:2 C5:4 | F5:4 C5:2 A4:2 F4:8' },
      { i: 'pluck', d: genArp(goomCh, '..0-..1-..0-..1-', 4), vol: 1.3 },
      { i: 'bass', d: genBass(goomCh, 'R-..F-..R-..F-..', 2) },
      { drum: true, d: rep('K . . . S . . . K . K . S . . .', 8), vol: 0.7 },
    ],
  };
  // Loja do Butters — tranquila (Si bemol maior)
  const shopCh = ['Bbmaj7', 'Gm7', 'Cm7', 'F7', 'Bbmaj7', 'Gm7', 'Cm7', 'F7'];
  SONGS.shop = {
    bpm: 96, bars: 8, vol: 0.85, swing: 0.12,
    ch: [
      { i: 'leadB', d: 'D5:4 F5:2 A5:2 F5:8 | Bb5:4 A5:2 G5:2 D5:8 | Eb5:4 G5:2 Bb5:2 A5:4 G5:4 | A5:6 F5:2 Eb5:8 | D5:2 F5:2 A5:2 C6:2 Bb5:8 | G5:2 Bb5:2 D6:4 C6:2 Bb5:2 G5:4 | Eb5:2 F5:2 G5:4 F5:2 Eb5:2 C5:4 | F5:4 Eb5:4 D5:8', vol: 0.8 },
      { i: 'pluck', d: genArp(shopCh, '0.1.2.3.2.1.0.1.', 4) },
      { i: 'bass', d: genBass(shopCh, 'R---T---F---O---', 2) },
      { drum: true, d: rep('K . H . . . H . K . H . . . H H', 8), vol: 0.5 },
    ],
  };
  // Chefão final — Cartman e Goomba (Ré menor)
  const bossA = ['Dm', 'Bb', 'C', 'A', 'Dm', 'Bb', 'Gm', 'A'];
  const bossB = ['F', 'C', 'Dm', 'A', 'Bb', 'C', 'Dm', 'A'];
  const bossCh = bossA.concat(bossB);
  SONGS.boss = {
    bpm: 160, bars: 16, vol: 0.85,
    ch: [
      { i: 'lead', d: 'D5:2 F5:2 A5:2 D6:2 C6:2 A5:2 F5:2 A5:2 | Bb5:4 A5:2 F5:2 D5:4 F5:4 | E5:2 G5:2 C6:4 Bb5:2 A5:2 G5:4 | A5:6 C#6:2 E6:8 | F6:2 E6:2 D6:2 A5:2 F5:2 D5:2 A4:4 | Bb4:2 D5:2 F5:2 Bb5:2 A5:4 F5:4 | G5:2 Bb5:2 D6:4 C6:2 Bb5:2 G5:4 | E5:2 F5:2 G5:2 A5:2 C#6:4 E6:4 | A5:4 C6:4 F6:8 | E6:4 D6:4 C6:8 | D6:4 A5:4 F5:4 D5:4 | C#6:6 B5:2 A5:8 | Bb5:4 D6:4 F6:4 D6:4 | E6:4 C6:4 G5:4 E5:4 | F5:4 A5:4 D6:4 F6:4 | E6:8 C#6:4 A5:4' },
      { i: 'brass', d: 'D4:8 A4:8 | Bb4:8 F4:8 | C5:8 G4:8 | A4:8 E4:8 | D4:8 A4:8 | Bb4:8 F4:8 | G4:8 D5:8 | A4:8 C#5:8 | F4:8 C5:8 | E4:8 G4:8 | F4:8 A4:8 | E4:8 A4:8 | D4:8 F4:8 | E4:8 G4:8 | F4:8 A4:8 | E4:8 A4:8' },
      { i: 'arp', d: genArp(bossCh, '0123012301230123', 4) },
      { i: 'bass', d: genBass(bossCh, 'R.RO.RR.RO.RF.RO', 2) },
      { i: 'bassP', d: genBass(bossCh, 'R.RO.RR.RO.RF.RO', 2) },
      { drum: true, d: rep('K . H K S . H . K K H . S . H S', 15) + ' K . S S K . S S K K S S C S S S', vol: 0.85 },
    ],
  };
  // ManBearPig — pesado (Mi menor)
  const mbpCh = ['Em', 'C', 'D', 'B', 'Em', 'C', 'D', 'B'];
  SONGS.mbp = {
    bpm: 126, bars: 8, vol: 0.9,
    ch: [
      { i: 'leadB', d: 'E4:4 G4:4 B4:4 A4:2 G4:2 | E4:4 G4:2 C5:6 B4:4 | F#4:4 A4:4 D5:4 C5:2 B4:2 | D#5:8 B4:4 F#4:4 | E5:2 D5:2 B4:4 G4:2 A4:2 B4:4 | C5:2 B4:2 G4:4 E4:4 G4:4 | A4:2 B4:2 D5:4 F#5:4 E5:4 | D#5:4 F#5:4 B5:8' },
      { i: 'brass', d: genBass(mbpCh, 'R-------F-------', 3) },
      { i: 'bass', d: genBass(mbpCh, 'R---.RR-R---.RO-', 2) },
      { i: 'bassP', d: genBass(mbpCh, 'R---.RR-R---.RO-', 1), vol: 1.3 },
      { drum: true, d: rep('K . . K S . . . K . K . S . . T', 8), vol: 0.9 },
    ],
  };
  // Castelo do Cartman — marcha pomposa (Dó maior)
  const castCh = ['C', 'G', 'Am', 'F', 'C', 'G', 'F', 'G'];
  SONGS.castle = {
    bpm: 100, bars: 8, vol: 0.85,
    ch: [
      { i: 'brass', d: 'C5:4 E5:4 G5:6 E5:2 | D5:4 G5:4 B5:6 G5:2 | C6:4 B5:2 A5:2 E5:4 A5:4 | F5:4 A5:4 C6:8 | E6:4 D6:2 C6:2 G5:4 E5:4 | D5:4 B4:4 G4:8 | A4:4 C5:4 F5:4 A5:4 | G5:6 F5:2 D5:4 B4:4', vol: 1.6 },
      { i: 'lead', d: 'C5:4 E5:4 G5:6 E5:2 | D5:4 G5:4 B5:6 G5:2 | C6:4 B5:2 A5:2 E5:4 A5:4 | F5:4 A5:4 C6:8 | E6:4 D6:2 C6:2 G5:4 E5:4 | D5:4 B4:4 G4:8 | A4:4 C5:4 F5:4 A5:4 | G5:6 F5:2 D5:4 B4:4', vol: 0.6 },
      { i: 'arp', d: genArp(castCh, '0.1.2.1.0.1.2.1.', 4) },
      { i: 'bass', d: genBass(castCh, 'R---R---F---O---', 2) },
      { drum: true, d: rep('K . . . S . S . K . . . S . S .', 8), vol: 0.7 },
    ],
  };
  // Fonte Sombria — etérea (Mi menor)
  const fontCh = ['Em', 'C', 'Am', 'B'];
  SONGS.fountain = {
    bpm: 60, bars: 4, vol: 1.5,
    ch: [
      { i: 'bell', d: 'B5:16 | G5:8 E5:8 | C6:8 A5:8 | D#6:8 B5:8' },
      { i: 'arp', d: genArp(fontCh, '0-1-2-3-4-3-2-1-', 4), vol: 1.3 },
      { i: 'pad', d: genBass(fontCh, 'R---------------', 3) },
    ],
  };
  // Game over — triste (Dó menor)
  const goCh = ['Cm', 'Ab', 'Eb', 'G', 'Cm', 'Ab', 'Eb', 'G'];
  SONGS.gameover = {
    bpm: 72, bars: 8, vol: 0.9,
    ch: [
      { i: 'leadV', d: 'G4:4 C5:4 Eb5:8 | D5:4 C5:4 Ab4:8 | G4:4 Bb4:4 Eb5:4 F5:4 | D5:8 B4:8 | Eb5:4 D5:4 C5:8 | Ab4:4 C5:4 F5:8 | G5:4 F5:4 Eb5:4 D5:4 | G4:8 B4:4 D5:4' },
      { i: 'arp', d: genArp(goCh, '0-1-2-1-0-1-2-1-', 4) },
      { i: 'bass', d: genBass(goCh, 'R-------F-------', 2) },
    ],
  };
  // Final — acolhedor (Fá maior)
  const endCh = ['F', 'Dm', 'Bb', 'C', 'F', 'Am', 'Bb', 'C7'];
  SONGS.ending = {
    bpm: 96, bars: 8, vol: 0.85,
    ch: [
      { i: 'leadB', d: 'A4:2 C5:2 F5:4 E5:2 F5:2 A5:4 | D5:4 F5:4 A5:6 G5:2 | F5:4 D5:4 Bb4:4 D5:4 | E5:4 G5:4 C6:8 | A5:4 G5:2 F5:2 C5:8 | E5:4 A5:4 C6:6 B5:2 | Bb5:4 A5:2 G5:2 F5:4 D5:4 | C5:4 E5:4 G5:4 Bb5:4' },
      { i: 'pluck', d: genArp(endCh, '0.1.2.1.3.1.2.1.', 4) },
      { i: 'bass', d: genBass(endCh, 'R-..F-..O-..F-..', 2) },
      { drum: true, d: rep('K . H . S . H . K . H . S . H H', 8), vol: 0.55 },
    ],
  };
  // Tensão — cenas dramáticas (Ré menor)
  const tenCh = ['Dm', 'Dm', 'Bb', 'A'];
  SONGS.tension = {
    bpm: 88, bars: 4, vol: 0.9,
    ch: [
      { i: 'bass', d: genBass(tenCh, 'R.R.R.R.R.R.R.R.', 2) },
      { i: 'pad', d: genBass(tenCh, 'R---------------', 3) },
      { i: 'bell', d: 'r:8 A5:4 G5:4 | F5:8 E5:8 | r:8 D5:4 F5:4 | E5:8 C#5:8' },
      { drum: true, d: rep('B . . . . . . . . . . . . . . .', 4), vol: 0.8 },
    ],
  };
})();
