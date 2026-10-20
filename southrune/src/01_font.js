'use strict';
/* Texto: fonte principal (Unifont 8x16 em negrito, parecida com a do DELTARUNE),
   fonte mini 3x5 para números/rótulos, texto rico com cores, pausas e tremor. */

const COLORS = {
  w: '#ffffff', y: '#ffff00', r: '#ff3030', b: '#5ad2ff', g: '#3cff4c', o: '#ff9a1f',
  p: '#ff70d8', gr: '#9a9a9a', k: '#000000', c: '#3ff0f0', pu: '#c08aff', dk: '#4a4a4a',
};

const Font = {
  CW: 8, LH: 16, cols: 32,
  map: new Map(),
  atlas: null,
  tints: new Map(),
  icons: {}, // caracteres especiais desenhados como ícones (♥, ★...) — preenchido em gfx
  init() {
    const n = FONT_CHARS.length;
    const rows = Math.ceil(n / this.cols);
    const c = makeCanvas(this.cols * 10, rows * 16);
    const x = c.getContext('2d');
    x.fillStyle = '#fff';
    for (let i = 0; i < n; i++) {
      const gx = (i % this.cols) * 10, gy = Math.floor(i / this.cols) * 16;
      for (let r = 0; r < 16; r++) {
        const byte = parseInt(FONT_HEX.substr((i * 16 + r) * 2, 2), 16);
        for (let b = 0; b < 8; b++) if (byte & (0x80 >> b)) x.fillRect(gx + b, gy + r, 2, 1);
      }
      this.map.set(FONT_CHARS[i], i);
    }
    this.atlas = c;
  },
  tinted(color) {
    let c = this.tints.get(color);
    if (!c) {
      c = makeCanvas(this.atlas.width, this.atlas.height);
      const x = c.getContext('2d');
      x.drawImage(this.atlas, 0, 0);
      x.globalCompositeOperation = 'source-in';
      x.fillStyle = color;
      x.fillRect(0, 0, c.width, c.height);
      this.tints.set(color, c);
    }
    return c;
  },
  char(ctx, ch, x, y, color = '#fff', scale = 1) {
    if (ch === ' ' || ch === undefined) return;
    const ic = this.icons[ch];
    if (ic) {
      const img = typeof ic === 'function' ? ic(color) : ic;
      ctx.drawImage(img, Math.round(x), Math.round(y + 4 * scale), img.width * scale, img.height * scale);
      return;
    }
    let i = this.map.get(ch);
    if (i === undefined) i = this.map.get('?');
    const sx = (i % this.cols) * 10, sy = Math.floor(i / this.cols) * 16;
    ctx.drawImage(this.tinted(color), sx, sy, 10, 16, Math.round(x), Math.round(y), 10 * scale, 16 * scale);
  },
  /* opt: align ('left'|'center'|'right'), scale, outline (cor), shadow (cor) */
  draw(ctx, str, x, y, color = '#fff', opt = {}) {
    str = String(str);
    const scale = opt.scale || 1;
    const w = str.length * this.CW * scale;
    if (opt.align === 'center') x -= Math.round(w / 2);
    else if (opt.align === 'right') x -= w;
    x = Math.round(x); y = Math.round(y);
    if (opt.outline) {
      for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [1, -1], [-1, 1], [1, 1]]) {
        for (let i = 0; i < str.length; i++) this.char(ctx, str[i], x + i * this.CW * scale + dx * scale, y + dy * scale, opt.outline, scale);
      }
    }
    if (opt.shadow) for (let i = 0; i < str.length; i++) this.char(ctx, str[i], x + i * this.CW * scale + scale, y + scale, opt.shadow, scale);
    for (let i = 0; i < str.length; i++) this.char(ctx, str[i], x + i * this.CW * scale, y, color, scale);
    return w;
  },
  width(str, scale = 1) { return String(str).length * this.CW * scale; },

  /* ---- texto rico ----
     Códigos: {y} {r} {b} {g} {o} {p} {gr} {w} cores · {shake} {wave} alternam efeitos
     {p15} pausa de 15 quadros · {spd2} velocidade · {sfx:nome} toca som */
  parse(text) {
    const out = [];
    let color = COLORS.w, shake = false, wave = false;
    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      if (c === '{') {
        const j = text.indexOf('}', i);
        if (j > i) {
          const code = text.slice(i + 1, j);
          i = j;
          if (COLORS[code]) color = COLORS[code];
          else if (code === 'shake') shake = !shake;
          else if (code === 'wave') wave = !wave;
          else if (/^p\d+$/.test(code)) out.push({ pause: +code.slice(1) });
          else if (/^spd\d+$/.test(code)) out.push({ speed: +code.slice(3) });
          else if (code.startsWith('sfx:')) out.push({ sfx: code.slice(4) });
          continue;
        }
      }
      out.push({ ch: c, color, shake, wave });
    }
    return out;
  },
  wrap(tokens, cols) {
    const lines = [];
    let line = [], col = 0, indent = 0, start = 0, word = [], wlen = 0, space = null, paraStart = true;
    const newLine = () => {
      lines.push(line);
      line = []; col = 0;
      for (let i = 0; i < indent; i++) { line.push({ ch: ' ', color: COLORS.w, pad: true }); col++; }
      start = indent;
    };
    const flush = () => {
      if (!word.length) return;
      const gap = space && col > start ? 1 : 0;
      if (wlen > 0 && col + gap + wlen > cols && col > start) { newLine(); space = null; }
      if (space && col > start) { line.push(space); col++; }
      space = null;
      for (const t of word) { line.push(t); if (t.ch !== undefined) col++; }
      word = []; wlen = 0;
    };
    for (const t of tokens) {
      if (t.ch === '\n') {
        flush();
        lines.push(line);
        line = []; col = 0; indent = 0; start = 0; space = null; paraStart = true;
        continue;
      }
      if (t.ch === ' ') {
        flush();
        if (col > 0 || line.length) space = t;
        continue;
      }
      if (t.ch !== undefined && paraStart) {
        paraStart = false;
        if (t.ch === '*') indent = 2;
      }
      word.push(t);
      if (t.ch !== undefined) wlen++;
    }
    flush();
    if (line.length) lines.push(line);
    return lines;
  },
  /* Desenha linhas de tokens; reveal = quantos caracteres mostrar (Infinity = tudo). */
  drawRich(ctx, lines, x, y, reveal = Infinity, opt = {}) {
    const lh = opt.lh || this.LH, scale = opt.scale || 1;
    let n = 0;
    for (let li = 0; li < lines.length; li++) {
      let col = 0;
      for (const t of lines[li]) {
        if (t.ch === undefined) continue;
        if (n >= reveal) return;
        n++;
        if (!t.pad) {
          let dx = 0, dy = 0;
          if (t.shake && frame % 2 === 0) { dx = U.irnd(-1, 1) * 0.5; dy = U.irnd(-1, 1) * 0.5; }
          if (t.wave) dy = Math.round(Math.sin(frame * 0.25 + (li * 40 + col) * 0.6) * 2);
          const color = opt.color && t.color === COLORS.w ? opt.color : t.color;
          this.char(ctx, t.ch, x + col * this.CW * scale + dx, y + li * lh + dy, color, scale);
        }
        col++;
      }
    }
  },
  count(lines) { let n = 0; for (const l of lines) for (const t of l) if (t.ch !== undefined) n++; return n; },
  /* Atalho: quebra e desenha um texto rico completo. */
  block(ctx, text, x, y, cols, opt = {}) {
    const lines = this.wrap(this.parse(text), cols);
    this.drawRich(ctx, lines, x, y, Infinity, opt);
    return lines.length;
  },
};

/* ---- Fonte mini 3x5 (HP, TP, rótulos) ---- */
const MINI_GLYPHS = {
  '0': '###/#.#/#.#/#.#/###', '1': '.#./##./.#./.#./###', '2': '###/..#/###/#../###', '3': '###/..#/.##/..#/###',
  '4': '#.#/#.#/###/..#/..#', '5': '###/#../###/..#/###', '6': '###/#../###/#.#/###', '7': '###/..#/..#/.#./.#.',
  '8': '###/#.#/###/#.#/###', '9': '###/#.#/###/..#/###',
  A: '.#./#.#/###/#.#/#.#', B: '##./#.#/##./#.#/##.', C: '.##/#../#../#../.##', D: '##./#.#/#.#/#.#/##.',
  E: '###/#../##./#../###', F: '###/#../##./#../#..', G: '.##/#../#.#/#.#/.##', H: '#.#/#.#/###/#.#/#.#',
  I: '###/.#./.#./.#./###', J: '..#/..#/..#/#.#/.#.', K: '#.#/#.#/##./#.#/#.#', L: '#../#../#../#../###',
  M: '#...#/##.##/#.#.#/#...#/#...#', N: '#..#/##.#/#.##/#..#/#..#', O: '.#./#.#/#.#/#.#/.#.', P: '##./#.#/##./#../#..',
  Q: '.#./#.#/#.#/##./.##', R: '##./#.#/##./#.#/#.#', S: '.##/#../.#./..#/##.', T: '###/.#./.#./.#./.#.',
  U: '#.#/#.#/#.#/#.#/###', V: '#.#/#.#/#.#/#.#/.#.', W: '#...#/#...#/#.#.#/##.##/#...#', X: '#.#/#.#/.#./#.#/#.#',
  Y: '#.#/#.#/.#./.#./.#.', Z: '###/..#/.#./#../###',
  '/': '..#/..#/.#./#../#..', '%': '#.#/..#/.#./#../#.#', '-': '.../.../###/.../...', '+': '.../.#./###/.#./...',
  ':': './#/./#/.', '.': '././././#', ',': './././#/#', '!': '#/#/#/./#', '?': '###/..#/.#./.../.#.', '$': '.##/##./.#./.##/##.',
  ' ': '../../../../..', '(': '.#/#./#./#./.#', ')': '#./.#/.#/.#/#.', "'": '#/#/./././',
  'Ã': '.#./#.#/###/#.#/#.#', 'Ç': '.##/#../#../.##/.#.', 'É': '###/#../##./#../###', 'Á': '.#./#.#/###/#.#/#.#',
  'Ó': '.#./#.#/#.#/#.#/.#.', 'Í': '###/.#./.#./.#./###', 'Ú': '#.#/#.#/#.#/#.#/###', 'Ê': '###/#../##./#../###',
  'Õ': '.#./#.#/#.#/#.#/.#.', 'Â': '.#./#.#/###/#.#/#.#',
};

const Mini = {
  map: new Map(), atlas: null, tints: new Map(),
  init() {
    const keys = Object.keys(MINI_GLYPHS);
    const c = makeCanvas(keys.length * 6, 6);
    const x = c.getContext('2d');
    x.fillStyle = '#fff';
    keys.forEach((k, i) => {
      const rows = MINI_GLYPHS[k].split('/');
      const w = Math.max(...rows.map((r) => r.length));
      rows.forEach((r, y) => { for (let px = 0; px < r.length; px++) if (r[px] === '#') x.fillRect(i * 6 + px, y, 1, 1); });
      this.map.set(k, { sx: i * 6, w });
    });
    this.atlas = c;
  },
  tinted(color) {
    let c = this.tints.get(color);
    if (!c) {
      c = makeCanvas(this.atlas.width, this.atlas.height);
      const x = c.getContext('2d');
      x.drawImage(this.atlas, 0, 0);
      x.globalCompositeOperation = 'source-in';
      x.fillStyle = color; x.fillRect(0, 0, c.width, c.height);
      this.tints.set(color, c);
    }
    return c;
  },
  width(str) {
    let w = 0;
    for (const ch of String(str).toUpperCase()) { const g = this.map.get(ch) || this.map.get('?'); w += g.w + 1; }
    return Math.max(0, w - 1);
  },
  draw(ctx, str, x, y, color = '#fff', opt = {}) {
    str = String(str).toUpperCase();
    const s = opt.scale || 1;
    const w = this.width(str) * s;
    if (opt.align === 'center') x -= Math.round(w / 2);
    else if (opt.align === 'right') x -= w;
    x = Math.round(x); y = Math.round(y);
    const img = this.tinted(color);
    const out = opt.outline ? this.tinted(opt.outline) : null;
    let cx = x;
    for (const ch of str) {
      const g = this.map.get(ch) || this.map.get('?');
      if (out) for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) ctx.drawImage(out, g.sx, 0, g.w, 5, cx + dx * s, y + dy * s, g.w * s, 5 * s);
      ctx.drawImage(img, g.sx, 0, g.w, 5, cx, y, g.w * s, 5 * s);
      cx += (g.w + 1) * s;
    }
    return w;
  },
};
