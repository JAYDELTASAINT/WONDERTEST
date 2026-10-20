'use strict';
/* Interface: caixas, diálogo (retratos + vozes), escolhas, faixa de "entrou no grupo",
   transições, tremor de tela, caixas de grupo, menu de campo e menu de salvar. */

const UI = {
  box(g, x, y, w, h, style = 'dark') {
    g.fillStyle = '#000'; g.fillRect(x, y, w, h);
    g.fillStyle = '#fff';
    if (style === 'light') {
      g.fillRect(x, y, w, 3); g.fillRect(x, y + h - 3, w, 3); g.fillRect(x, y, 3, h); g.fillRect(x + w - 3, y, 3, h);
      return;
    }
    g.fillRect(x + 2, y, w - 4, 2); g.fillRect(x + 2, y + h - 2, w - 4, 2);
    g.fillRect(x, y + 2, 2, h - 4); g.fillRect(x + w - 2, y + 2, 2, h - 4);
    g.fillRect(x + 1, y + 1, 2, 2); g.fillRect(x + w - 3, y + 1, 2, 2); g.fillRect(x + 1, y + h - 3, 2, 2); g.fillRect(x + w - 3, y + h - 3, 2, 2);
    g.fillStyle = '#3a3a4e';
    g.fillRect(x + 4, y + 3, w - 8, 1); g.fillRect(x + 4, y + h - 4, w - 8, 1); g.fillRect(x + 3, y + 4, 1, h - 8); g.fillRect(x + w - 4, y + 4, 1, h - 8);
  },
  heart(g, x, y) { g.drawImage(ICON.heart, Math.round(x), Math.round(y)); },
  bar(g, x, y, w, h, frac, fill, back = '#7a0000') {
    g.fillStyle = back; g.fillRect(x, y, w, h);
    g.fillStyle = fill; g.fillRect(x, y, Math.max(0, Math.round(w * U.clamp(frac, 0, 1))), h);
  },
  /* Navegação em grade: devolve o novo índice (toca o som de mover). */
  nav(idx, n, cols = 1) {
    if (n <= 0) return 0;
    let i = idx;
    if (Input.take('up')) i -= cols;
    if (Input.take('down')) i += cols;
    if (cols > 1) { if (Input.take('left')) i -= 1; if (Input.take('right')) i += 1; }
    if (i < 0 || i >= n) i = idx;
    if (i !== idx) Sfx.play('move');
    return i;
  },
  /* Caixa de membro do grupo (usada no menu e na batalha). */
  partyBox(g, id, x, y, w, opts = {}) {
    const m = MEMBERS[id];
    const hp = G.hp[id], max = maxHp(id);
    const h = opts.h || 20;
    g.fillStyle = '#000'; g.fillRect(x, y, w, h);
    if (opts.active) {
      g.fillStyle = m.color;
      g.fillRect(x, y, w, 1); g.fillRect(x, y + h - 1, w, 1); g.fillRect(x, y, 1, h); g.fillRect(x + w - 1, y, 1, h);
    } else if (opts.border !== false) {
      g.fillStyle = m.dark; g.fillRect(x, y, w, 1);
    }
    if (opts.selected) { g.fillStyle = m.color; g.fillRect(x + 1, y + 1, w - 2, 1); g.fillRect(x + 1, y + h - 2, w - 2, 1); }
    const head = Spr.head(id, 6, hp <= 0 ? 'x' : 'neutral');
    g.drawImage(head, x + 1, y + 2);
    Font.draw(g, m.name, x + 17, y + 0, hp <= 0 ? '#ff4040' : '#fff');
    Mini.draw(g, 'HP', x + w - 46, y + 4, '#fff');
    UI.bar(g, x + w - 36, y + 4, 33, 5, hp / max, m.color, '#800000');
    const t = hp <= 0 ? 'DOWN' : `${Math.max(0, hp)}/${max}`;
    Mini.draw(g, t, x + w - 3, y + 12, hp <= 0 ? '#ff4040' : hp < max * 0.25 ? '#ffff00' : '#fff', { align: 'right' });
  },
};

/* ---------- Diálogo ---------- */
const HAS_FACE = (who) => !!(who && (KIDS[who] || PORTRAITS[who]));
function parseLine(s) {
  if (typeof s === 'object') return Object.assign({}, s);
  const m = /^([a-z]+)(?:\/([a-z0-9]+))?:\s?([\s\S]*)$/.exec(s);
  if (m) return { who: m[1], expr: m[2] || 'neutral', text: m[3] };
  return { who: null, text: s };
}
const Dlg = {
  active: false, queue: [], pages: [], cur: null, resolve: null, opts: {},
  reveal: 0, total: 0, speed: 1, acc: 0, pause: 0, done: false, autoT: 0,
  choice: null,
  autoPos: () => 'bottom',
  say(lines, opts = {}) {
    if (!Array.isArray(lines)) lines = [lines];
    return new Promise((res) => {
      this.queue = lines.map(parseLine);
      this.opts = opts;
      this.resolve = res;
      this.active = true;
      this.pos = opts.pos || this.autoPos();
      this.style = opts.style || (G && G.dark === false ? 'light' : 'dark');
      this.nextEntry();
    });
  },
  /* Pergunta com opções (coração vermelho como cursor). Devolve o índice. */
  ask(text, options, opts = {}) {
    return new Promise((res) => {
      const e = parseLine(text);
      e.choice = options;
      e.onChoose = res;
      this.say([e], opts);
    });
  },
  nextEntry() {
    const e = this.queue.shift();
    if (!e) { this.close(); return; }
    this.entry = e;
    let text = e.text || '';
    if (!e.raw && !/^[*(\[]/.test(text)) text = '* ' + text;
    this.face = HAS_FACE(e.who) && !e.noFace ? e.who : null;
    this.voice = e.voice || (VOICES[e.who] ? e.who : 'default');
    const cols = this.face ? 29 : 35;
    const lines = Font.wrap(Font.parse(text), cols);
    this.pages = [];
    const per = e.choice ? 2 : 3;
    for (let i = 0; i < lines.length; i += per) this.pages.push(lines.slice(i, i + per));
    if (!this.pages.length) this.pages.push([]);
    this.nextPage();
  },
  nextPage() {
    this.lines = this.pages.shift();
    this.reveal = 0; this.acc = 0; this.pause = 0; this.done = false; this.autoT = 0;
    this.total = Font.count(this.lines);
    this.speed = this.entry.speed || this.opts.speed || 1;
    this.choosing = false;
    // primeiros tokens de controle
    this.flat = [];
    for (const l of this.lines) for (const t of l) this.flat.push(t);
    this.ti = 0;
  },
  close() {
    this.active = false;
    const r = this.resolve; this.resolve = null;
    if (r) r();
  },
  update() {
    if (!this.active) return;
    if (this.choosing) { this.updateChoice(); return; }
    if (!this.done) {
      if (Input.take('cancel') && !this.entry.noSkip) { this.reveal = this.total; this.done = true; Input.take('confirm'); }
      else {
        if (this.pause > 0) { this.pause--; return; }
        this.acc += this.speed;
        while (this.acc >= 1 && this.reveal < this.total) {
          // processa tokens até o próximo caractere
          while (this.ti < this.flat.length && this.flat[this.ti].ch === undefined) {
            const t = this.flat[this.ti++];
            if (t.pause) { this.pause = t.pause; }
            if (t.speed) this.speed = t.speed / 2;
            if (t.sfx) Sfx.play(t.sfx);
          }
          if (this.pause > 0) break;
          const t = this.flat[this.ti++];
          this.reveal++; this.acc -= 1;
          if (t && t.ch !== ' ' && !t.pad && this.voice !== 'none') {
            if (this.blipT <= 0 || this.speed < 1) { Sfx.blip(this.voice); this.blipT = 1; }
          }
          this.blipT--;
        }
        if (this.reveal >= this.total) this.done = true;
      }
      return;
    }
    // página completa
    if (this.entry.choice && !this.pages.length) { this.choosing = true; this.cidx = 0; return; }
    if (this.entry.auto) {
      this.autoT++;
      if (this.autoT >= this.entry.auto) this.advance();
      return;
    }
    if (Input.take('confirm')) this.advance();
  },
  advance() {
    if (this.pages.length) this.nextPage();
    else this.nextEntry();
  },
  updateChoice() {
    const n = this.entry.choice.length;
    const cols = n === 2 ? 2 : n === 4 ? 2 : 1;
    let i = this.cidx;
    if (cols === 2) {
      if (Input.take('left') && i % 2 === 1) i--;
      if (Input.take('right') && i % 2 === 0 && i + 1 < n) i++;
      if (Input.take('up') && i >= 2) i -= 2;
      if (Input.take('down') && i + 2 < n) i += 2;
    } else {
      if (Input.take('up') && i > 0) i--;
      if (Input.take('down') && i < n - 1) i++;
    }
    if (i !== this.cidx) { Sfx.play('move'); this.cidx = i; }
    if (Input.take('confirm')) {
      Sfx.play('select');
      const cb = this.entry.onChoose, idx = this.cidx;
      this.choosing = false;
      this.nextEntry();
      if (cb) cb(idx);
    }
  },
  rect() {
    const h = 76, w = 304, x = 8;
    const y = this.pos === 'top' ? 6 : H - h - 6;
    return { x, y, w, h };
  },
  draw(g) {
    if (!this.active || !this.lines) return;
    const { x, y, w, h } = this.rect();
    UI.box(g, x, y, w, h, this.style);
    let tx = x + 14;
    if (this.face) {
      const img = Spr.face(this.face, this.entry.expr || 'neutral');
      g.drawImage(img, x + 6, y + 14);
      tx = x + 58;
    }
    Font.drawRich(g, this.lines, tx, y + 8, this.reveal);
    if (this.choosing) {
      const opts = this.entry.choice, n = opts.length;
      const grid = n === 2 || n === 4;
      const step = grid ? 16 : 14;
      const baseY = y + 8 + this.lines.length * 16 + (grid ? 4 : 0);
      opts.forEach((o, i) => {
        let ox, oy;
        if (grid) { ox = tx + 18 + (i % 2) * 120; oy = baseY + Math.floor(i / 2) * step; }
        else { ox = tx + 18; oy = baseY + i * step; }
        Font.draw(g, o, ox, oy, i === this.cidx ? '#ffff00' : '#fff');
        if (i === this.cidx) UI.heart(g, ox - 13, oy + 5);
      });
    }
  },
};

/* ---------- Faixa "X entrou para o grupo!" ---------- */
const Banner = {
  text: null, t: 0, resolve: null, color: '#ffff00',
  show(text, color = '#ffff00', sfx = 'join') {
    Sfx.play(sfx);
    return new Promise((res) => { this.text = text; this.t = 0; this.resolve = res; this.color = color; });
  },
  update() {
    if (!this.text) return;
    this.t++;
    if ((this.t > 40 && Input.take('confirm')) || this.t > 120) {
      const r = this.resolve; this.text = null; this.resolve = null; if (r) r();
    }
  },
  draw(g) {
    if (!this.text) return;
    const k = Math.min(1, this.t / 10);
    const hh = Math.round(22 * k);
    g.fillStyle = 'rgba(0,0,0,0.85)'; g.fillRect(0, 120 - hh, W, hh * 2);
    g.fillStyle = this.color; g.fillRect(0, 120 - hh, W, 1); g.fillRect(0, 120 + hh - 1, W, 1);
    if (k >= 1) {
      Font.draw(g, this.text, W / 2, 112, this.color, { align: 'center', outline: '#000' });
      for (let i = 0; i < 8; i++) {
        const a = this.t * 0.05 + (i * Math.PI) / 4;
        const sx = W / 2 + Math.cos(a) * (130 + (i % 2) * 8), sy = 120 + Math.sin(a) * 14;
        g.drawImage(ICON.star, Math.round(sx - 3), Math.round(sy - 3));
      }
    }
  },
};

/* ---------- Transições e efeitos de tela ---------- */
const Fade = {
  a: 0, color: '#000',
  to(target, frames = 12, color = '#000') { this.color = color; return tween(this, { a: target }, frames, Ease.lin); },
  out(frames = 12, color = '#000') { return this.to(1, frames, color); },
  in(frames = 12) { return this.to(0, frames); },
  draw(g) {
    if (this.a <= 0.001) return;
    g.globalAlpha = Math.min(1, this.a); g.fillStyle = this.color; g.fillRect(0, 0, W, H); g.globalAlpha = 1;
  },
};
const Flash = {
  a: 0, color: '#fff',
  go(color = '#fff', a = 1) { this.color = color; this.a = a; },
  update() { this.a = Math.max(0, this.a - 0.08); },
  draw(g) { if (this.a > 0) { g.globalAlpha = this.a; g.fillStyle = this.color; g.fillRect(0, 0, W, H); g.globalAlpha = 1; } },
};
const Shake = {
  mag: 0, t: 0, x: 0, y: 0,
  start(mag = 3, t = 10) { this.mag = Math.max(this.mag, mag); this.t = Math.max(this.t, t); },
  update() {
    if (this.t > 0) { this.t--; this.x = U.irnd(-this.mag, this.mag); this.y = U.irnd(-this.mag, this.mag); if (this.t === 0) this.mag = 0; }
    else { this.x = 0; this.y = 0; }
  },
};

/* ---------- Menu de salvar (pontos de salvamento) ---------- */
const SaveMenu = {
  active: false, idx: 0, saved: false, resolve: null, roomName: '',
  open(roomName) {
    return new Promise((res) => { this.active = true; this.idx = 0; this.saved = false; this.resolve = res; this.roomName = roomName; });
  },
  update() {
    if (!this.active) return;
    if (this.saved) { if (Input.take('confirm') || Input.take('cancel')) this.close(); return; }
    if (Input.take('left') || Input.take('right')) { this.idx = 1 - this.idx; Sfx.play('move'); }
    if (Input.take('cancel')) { this.close(); return; }
    if (Input.take('confirm')) {
      if (this.idx === 0) {
        G.saveRoomName = this.roomName;
        Save.write(); this.saved = true; Sfx.play('save');
      } else this.close();
    }
  },
  close() { this.active = false; const r = this.resolve; this.resolve = null; if (r) r(this.saved); },
  draw(g) {
    if (!this.active) return;
    const x = 40, y = 64, w = 240, h = 96;
    UI.box(g, x, y, w, h, G.dark ? 'dark' : 'light');
    const info = this.saved ? Save.info() : Object.assign({}, G, { saveRoomName: this.roomName });
    const col = this.saved ? '#ffff00' : '#fff';
    Font.draw(g, 'STAN', x + 16, y + 10, col);
    Font.draw(g, 'LV1', x + 104, y + 10, col);
    Font.draw(g, fmtTime(info.time || 0), x + w - 16, y + 10, col, { align: 'right' });
    Font.draw(g, (info.saveRoomName || '').slice(0, 26), x + 16, y + 30, col);
    if (this.saved) {
      Font.draw(g, 'Arquivo salvo.', x + 16, y + 62, '#ffff00');
    } else {
      ['Salvar', 'Voltar'].forEach((t, i) => {
        const ox = x + 40 + i * 100;
        Font.draw(g, t, ox, y + 62, i === this.idx ? '#ffff00' : '#fff');
        if (i === this.idx) UI.heart(g, ox - 13, y + 67);
      });
    }
  },
};

/* ---------- Menu de campo (C): ITEM / EQUIP / PODER / CONFIG ---------- */
const GEAR_ICON = () => fromRows(['....##....', '.#.####.#.', '.########.', '..##..##..', '###....###', '###....###', '..##..##..', '.########.', '.#.####.#.', '....##....'], { '#': '#ffffff' });
const FieldMenu = {
  active: false, sel: 0, mode: 'top', idx: 0, who: 0, slot: 0, list: [], msg: null, conf: 0,
  labels: ['ITEM', 'EQUIP', 'PODER', 'CONFIG'],
  open() { this.active = true; this.sel = 0; this.mode = 'top'; this.msg = null; Sfx.play('select'); },
  close() { this.active = false; Sfx.play('cancel'); },
  icons() {
    if (!this._icons) this._icons = [ICON.btn.item, ICON.btn.fight, ICON.btn.magic, GEAR_ICON()];
    return this._icons;
  },
  update() {
    if (!this.active) return;
    if (this.msg) { this.msg.t++; if (this.msg.t > 8 && (Input.take('confirm') || Input.take('cancel'))) this.msg = null; return; }
    switch (this.mode) {
      case 'top': {
        if (Input.take('left') && this.sel > 0) { this.sel--; Sfx.play('move'); }
        if (Input.take('right') && this.sel < 3) { this.sel++; Sfx.play('move'); }
        if (Input.take('cancel') || Input.take('menu')) { this.close(); return; }
        if (Input.take('confirm')) {
          Sfx.play('select');
          if (this.sel === 0) { if (!G.items.length) { Sfx.play('error'); return; } this.mode = 'items'; this.idx = 0; }
          if (this.sel === 1) { this.mode = 'equipWho'; this.who = 0; }
          if (this.sel === 2) { this.mode = 'powerWho'; this.who = 0; }
          if (this.sel === 3) { this.mode = 'config'; this.idx = 0; }
        }
        break;
      }
      case 'items': {
        this.idx = UI.nav(this.idx, G.items.length, 2);
        if (Input.take('cancel')) { this.mode = 'top'; Sfx.play('cancel'); }
        else if (Input.take('confirm')) { Sfx.play('select'); this.mode = 'itemAct'; this.slot = 0; }
        break;
      }
      case 'itemAct': {
        if (Input.take('left') || Input.take('right')) { this.slot = 1 - this.slot; Sfx.play('move'); }
        if (Input.take('cancel')) { this.mode = 'items'; Sfx.play('cancel'); }
        else if (Input.take('confirm')) {
          const it = ITEMS[G.items[this.idx]];
          if (this.slot === 1) { // jogar fora
            removeItemAt(this.idx); Sfx.play('select');
            this.msg = { t: 0, text: `* Você jogou fora ${it.name}.` };
            this.mode = G.items.length ? 'items' : 'top'; this.idx = Math.min(this.idx, G.items.length - 1);
          } else if (it.type !== 'heal') {
            Sfx.play('error'); this.msg = { t: 0, text: '* Isso é um equipamento. Use o menu EQUIP.' };
          } else if (it.all || G.party.length === 1) {
            this.useItem(this.idx, it.all ? null : G.party[0]);
          } else { this.mode = 'itemWho'; this.who = 0; }
        }
        break;
      }
      case 'itemWho': {
        this.who = this.navWho(this.who);
        if (Input.take('cancel')) { this.mode = 'itemAct'; Sfx.play('cancel'); }
        else if (Input.take('confirm')) this.useItem(this.idx, G.party[this.who]);
        break;
      }
      case 'equipWho': case 'powerWho': {
        this.who = this.navWho(this.who);
        if (Input.take('cancel')) { this.mode = 'top'; Sfx.play('cancel'); }
        else if (Input.take('confirm')) { Sfx.play('select'); this.mode = this.mode === 'equipWho' ? 'equipSlot' : 'power'; this.slot = 0; }
        break;
      }
      case 'power': if (Input.take('cancel') || Input.take('confirm')) { this.mode = 'powerWho'; Sfx.play('cancel'); } break;
      case 'equipSlot': {
        this.slot = UI.nav(this.slot, 3, 1);
        if (Input.take('cancel')) { this.mode = 'equipWho'; Sfx.play('cancel'); }
        else if (Input.take('confirm')) {
          const id = G.party[this.who];
          const want = this.slot === 0 ? 'weapon' : 'armor';
          this.list = [];
          G.items.forEach((it, i) => { const d = ITEMS[it]; if (d.type === want && (!d.who || d.who.includes(id))) this.list.push(i); });
          if (want === 'armor') this.list.push(-1);
          if (!this.list.length) { Sfx.play('error'); this.msg = { t: 0, text: '* Você não tem nada para equipar aí.' }; }
          else { Sfx.play('select'); this.mode = 'equipItem'; this.idx = 0; }
        }
        break;
      }
      case 'equipItem': {
        this.idx = UI.nav(this.idx, this.list.length, 1);
        if (Input.take('cancel')) { this.mode = 'equipSlot'; Sfx.play('cancel'); }
        else if (Input.take('confirm')) {
          const id = G.party[this.who], e = G.equip[id], invIdx = this.list[this.idx];
          const newIt = invIdx >= 0 ? G.items[invIdx] : null;
          let old;
          if (this.slot === 0) { old = e.weapon; e.weapon = newIt; } else { old = e.armor[this.slot - 1]; e.armor[this.slot - 1] = newIt; }
          if (invIdx >= 0) G.items.splice(invIdx, 1);
          if (old) G.items.push(old);
          Sfx.play('item'); this.mode = 'equipSlot';
        }
        break;
      }
      case 'config': {
        this.idx = UI.nav(this.idx, 5, 1);
        const lr = (Input.take('right') ? 1 : 0) - (Input.take('left') ? 1 : 0);
        if (lr && this.idx <= 1) {
          const k = this.idx === 0 ? 'master' : 'music';
          Sfx.vol[k] = U.clamp(Math.round((Sfx.vol[k] + lr * 0.1) * 10) / 10, 0, 1);
          Sfx.applyVolume(); Sfx.play('move'); Game.saveConf();
        }
        if (Input.take('cancel')) { this.mode = 'top'; Sfx.play('cancel'); }
        else if (Input.take('confirm')) {
          if (this.idx === 2) { Game.conf.touch = (Game.conf.touch + 1) % 3; Game.applyConf(); Sfx.play('select'); }
          if (this.idx === 3) { Game.toggleFullscreen(); Sfx.play('select'); }
          if (this.idx === 4) { this.mode = 'quit'; this.conf = 1; Sfx.play('select'); }
        }
        break;
      }
      case 'quit': {
        if (Input.take('left') || Input.take('right')) { this.conf = 1 - this.conf; Sfx.play('move'); }
        if (Input.take('cancel')) { this.mode = 'config'; Sfx.play('cancel'); }
        else if (Input.take('confirm')) {
          if (this.conf === 0) { this.active = false; Game.toTitle(); } else { this.mode = 'config'; Sfx.play('cancel'); }
        }
        break;
      }
      default: break;
    }
  },
  navWho(i) {
    const n = G.party.length;
    let j = i;
    if (Input.take('left')) j--; if (Input.take('right')) j++;
    j = U.clamp(j, 0, n - 1);
    if (j !== i) Sfx.play('move');
    return j;
  },
  useItem(idx, who) {
    const it = ITEMS[G.items[idx]];
    let text;
    if (it.all) { for (const id of G.party) healMember(id, it.heal); text = `* O grupo usou ${it.name}. HP recuperado!`; }
    else {
      const got = healMember(who, it.heal);
      text = got >= maxHp(who) - 0 && G.hp[who] === maxHp(who) && got > 0 ? `* ${MEMBERS[who].name} usou ${it.name}. HP no máximo!` : `* ${MEMBERS[who].name} usou ${it.name}. +${got} HP.`;
    }
    removeItemAt(idx);
    Sfx.play('heal');
    this.msg = { t: 0, text };
    this.mode = G.items.length ? 'items' : 'top';
    this.idx = Math.max(0, Math.min(this.idx, G.items.length - 1));
  },
  draw(g) {
    if (!this.active) return;
    const style = G.dark ? 'dark' : 'light';
    // faixa de cima
    UI.box(g, 4, 4, W - 8, 42, style);
    Font.draw(g, `D$ ${G.money}`, 18, 9, '#fff');
    Mini.draw(g, fmtTime(G.time), 18, 30, '#9a9a9a');
    const ic = this.icons();
    for (let i = 0; i < 4; i++) {
      const bx = 128 + i * 44, by = 10;
      const on = this.sel === i;
      const c = on ? '#ffff00' : '#ff9a1f';
      g.fillStyle = c; g.fillRect(bx, by, 26, 1); g.fillRect(bx, by + 19, 26, 1); g.fillRect(bx, by, 1, 20); g.fillRect(bx + 25, by, 1, 20);
      g.drawImage(silhouette(ic[i], c), bx + 7, by + 4);
      if (on) Font.draw(g, this.labels[i], bx + 13, by + 18, '#fff', { align: 'center' });
    }
    // caixas do grupo embaixo
    const n = G.party.length, bw = 106, x0 = Math.round((W - n * bw) / 2);
    G.party.forEach((id, i) => {
      const sel = ['itemWho', 'equipWho', 'powerWho', 'equipSlot', 'equipItem', 'power'].includes(this.mode) && this.who === i;
      UI.partyBox(g, id, x0 + i * bw, H - 24, bw, { active: sel });
    });
    // painéis
    const px = 16, py = 52, pw = W - 32, ph = 156;
    if (this.mode === 'items' || this.mode === 'itemAct' || this.mode === 'itemWho') {
      UI.box(g, px, py, pw, ph, style);
      G.items.forEach((it, i) => {
        const cx = px + 22 + (i % 2) * 140, cy = py + 8 + Math.floor(i / 2) * 16;
        Font.draw(g, ITEMS[it].name, cx, cy, i === this.idx ? '#ffff00' : '#fff');
        if (i === this.idx && this.mode === 'items') UI.heart(g, cx - 13, cy + 5);
      });
      const it = ITEMS[G.items[this.idx]];
      if (it) { g.fillStyle = '#fff'; g.fillRect(px + 8, py + ph - 42, pw - 16, 1); Font.block(g, it.desc, px + 12, py + ph - 38, 34, { color: '#c0c0c0' }); }
      if (this.mode === 'itemAct' || this.mode === 'itemWho') {
        UI.box(g, px + 60, py + 50, 150, 40, style);
        ['USAR', 'JOGAR FORA'].forEach((t, i) => {
          const ox = px + 82 + i * 56;
          Font.draw(g, t, ox, py + 62, i === this.slot ? '#ffff00' : '#fff');
          if (i === this.slot && this.mode === 'itemAct') UI.heart(g, ox - 12, py + 67);
        });
        if (this.mode === 'itemWho') Font.draw(g, 'Em quem?', px + 72, py + 74, '#9a9a9a');
      }
    } else if (['equipWho', 'equipSlot', 'equipItem'].includes(this.mode)) {
      UI.box(g, px, py, pw, ph, style);
      const id = G.party[this.who], e = G.equip[id];
      Font.draw(g, `${MEMBERS[id].name}  ${MEMBERS[id].title}`, px + 12, py + 6, MEMBERS[id].color);
      const slots = [['ARMA', e.weapon], ['ARMADURA', e.armor[0]], ['ARMADURA', e.armor[1]]];
      slots.forEach(([lbl, it], i) => {
        const cy = py + 30 + i * 18;
        Mini.draw(g, lbl, px + 24, cy + 6, '#9a9a9a');
        Font.draw(g, it ? ITEMS[it].name : '(nada)', px + 86, cy, this.mode === 'equipSlot' && this.slot === i ? '#ffff00' : '#fff');
        if (this.mode === 'equipSlot' && this.slot === i) UI.heart(g, px + 10, cy + 5);
      });
      const sy = py + 92;
      Font.draw(g, `ATK ${stat(id, 'atk')}  DEF ${stat(id, 'def')}  MAG ${stat(id, 'mag')}`, px + 12, sy, '#fff');
      if (this.mode === 'equipItem') {
        UI.box(g, px + 120, py + 26, 150, 18 + this.list.length * 16, style);
        this.list.forEach((invIdx, i) => {
          const t = invIdx >= 0 ? ITEMS[G.items[invIdx]].name : '(tirar)';
          Font.draw(g, t, px + 140, py + 32 + i * 16, i === this.idx ? '#ffff00' : '#fff');
          if (i === this.idx) UI.heart(g, px + 128, py + 37 + i * 16);
        });
        const invIdx = this.list[this.idx];
        if (invIdx >= 0) Font.block(g, ITEMS[G.items[invIdx]].desc, px + 12, py + 112, 34, { color: '#c0c0c0' });
      } else if (this.mode === 'equipWho') Font.draw(g, '< escolha quem >', px + pw / 2, py + 124, '#9a9a9a', { align: 'center' });
    } else if (this.mode === 'powerWho' || this.mode === 'power') {
      UI.box(g, px, py, pw, ph, style);
      const id = G.party[this.who], m = MEMBERS[id];
      g.drawImage(Spr.face(id, 'neutral'), px + 8, py + 8);
      Font.draw(g, m.name, px + 62, py + 8, m.color);
      Font.draw(g, m.title, px + 62, py + 24, '#fff');
      Font.draw(g, `LV 1   HP ${G.hp[id]}/${maxHp(id)}`, px + 62, py + 40, '#fff');
      Font.draw(g, `ATK ${stat(id, 'atk')}  DEF ${stat(id, 'def')}  MAG ${stat(id, 'mag')}`, px + 12, py + 62, '#fff');
      Font.block(g, m.desc, px + 12, py + 80, 34, { color: '#c0c0c0' });
      if (m.spells.length) {
        m.spells.forEach((s, i) => {
          const sp = SPELLS[s];
          Font.draw(g, sp.name, px + 12, py + 116 + i * 16, '#fff');
          Font.draw(g, `${sp.tp}% TP`, px + pw - 12, py + 116 + i * 16, '#ff9a1f', { align: 'right' });
        });
      } else Font.draw(g, 'Usa AGIR: conversa e age.', px + 12, py + 116, '#fff');
    } else if (this.mode === 'config' || this.mode === 'quit') {
      UI.box(g, px, py, pw, ph, style);
      const touchLbl = ['Automático', 'Sempre', 'Nunca'][Game.conf.touch];
      const rows = [
        ['Volume geral', `${Math.round(Sfx.vol.master * 100)}%`],
        ['Música', `${Math.round(Sfx.vol.music * 100)}%`],
        ['Controles na tela', touchLbl],
        ['Tela cheia', ''],
        ['Voltar ao título', ''],
      ];
      rows.forEach(([a, b], i) => {
        const cy = py + 12 + i * 20;
        Font.draw(g, a, px + 26, cy, i === this.idx ? '#ffff00' : '#fff');
        if (b) Font.draw(g, (i <= 1 ? '< ' + b + ' >' : b), px + pw - 14, cy, '#fff', { align: 'right' });
        if (i === this.idx) UI.heart(g, px + 12, cy + 5);
      });
      if (this.mode === 'quit') {
        UI.box(g, px + 30, py + 60, pw - 60, 56, style);
        Font.draw(g, 'Voltar ao título?', px + pw / 2, py + 68, '#fff', { align: 'center' });
        ['Sim', 'Não'].forEach((t, i) => {
          const ox = px + 90 + i * 70;
          Font.draw(g, t, ox, py + 90, i === this.conf ? '#ffff00' : '#fff');
          if (i === this.conf) UI.heart(g, ox - 13, py + 95);
        });
      }
    }
    if (this.msg) {
      UI.box(g, 8, 150, W - 16, 40, style);
      Font.block(g, this.msg.text, 22, 158, 34);
    }
  },
};
