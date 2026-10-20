'use strict';
/* Sistema de batalha no estilo DELTARUNE:
   LUTAR / AGIR (ou MAGIA) / ITEM / POUPAR / DEFENDER, barra de TP, raspão (graze),
   minigame de ataque, PIEDADE, inimigos CANSADOS, ações em dupla, caixa de balas e alma. */

const PANEL_Y = 168;
const BOX_CX = 160, BOX_CY = 98;
const BTN_LABEL = { fight: 'FIGHT', act: 'ACT', magic: 'MAGIC', item: 'ITEM', spare: 'SPARE', defend: 'DEFEND' };
const PARTY_POS = { 1: [[60, 122]], 2: [[66, 100], [50, 138]], 3: [[70, 86], [52, 118], [70, 150]] };
const ENEMY_POS = { 1: [[240, 128]], 2: [[226, 98], [268, 146]], 3: [[218, 84], [270, 118], [226, 152]] };
const ATTACK_COLORS = { stan: '#5ab4ff', kyle: '#5cdd5c', kenny: '#ffa232' };

function makeEnemy(id, i, n, pos) {
  const d = ENEMIES[id];
  const p = pos || ENEMY_POS[Math.min(3, n)][i] || [240, 120];
  return {
    id, def: d, name: d.name, hp: d.hp, maxHp: d.hp, atk: d.atk, defv: d.def || 0,
    mercy: 0, tired: false, x: p[0], y: p[1], off: 90, shake: 0, flash: 0, alpha: 1,
    gone: null, fleeX: 0, f: 0, expr: null, pose: null, data: {}, idx: i,
  };
}

const Battle = {
  active: false,

  async start(cfg) {
    this.cfg = cfg;
    Game.retry = { save: JSON.stringify(G), room: World.id };
    this.tp = cfg.tp || 0;
    this.turn = 0;
    this.bullets = []; this.popups = []; this.fx = []; this.bubbles = [];
    this.box = null; this.soul = null; this.qte = null; this.ms = null; this.choosing = false;
    this.panelLines = null; this.panelReveal = 0; this.waveRuns = [];
    this.kennyDied = false;
    const n = G.party.length;
    this.party = G.party.map((id, i) => ({
      id, i, x: PARTY_POS[n][i][0], y: PARTY_POS[n][i][1], pose: 'idle', poseT: 0, animF: 0,
      shake: 0, off: -100, defending: false, flash: 0,
    }));
    this.enemies = cfg.enemies.map((eid, i) => makeEnemy(eid, i, cfg.enemies.length, cfg.positions && cfg.positions[i]));
    this.bgA = 0;
    this.active = true;
    const prevMusic = World.def ? World.def.music : null;
    Game.mode = 'battle';
    Music.play(cfg.music || 'battle', { restart: false });
    const result = await this.main();
    if (result === 'lose') return 'lose';
    await Fade.out(10);
    this.active = false;
    Game.mode = 'field';
    for (const id of G.party) if (G.hp[id] <= 0) G.hp[id] = 1;
    if (cfg.afterMusic !== undefined) { if (cfg.afterMusic) Music.play(cfg.afterMusic); else Music.stop(); }
    else if (prevMusic) Music.play(prevMusic, { fadeIn: 10 });
    await Fade.in(10);
    return result;
  },

  async main() {
    Flash.go('#ffffff', 0.5);
    tween(this, { bgA: 1 }, 12);
    for (const m of this.party) tween(m, { off: 0 }, 14, Ease.out);
    for (const e of this.enemies) tween(e, { off: 0 }, 14, Ease.out);
    await wait(14);
    this.setText(this.cfg.intro || this.enemies[0].def.intro || `* ${this.enemies[0].name} blocks the way!`);
    if (this.cfg.onStart) await this.cfg.onStart(this);
    for (;;) {
      this.turn++;
      if (this.cfg.onTurn) await this.cfg.onTurn(this);
      let end = this.checkEnd(); if (end) return this.finish(end);
      await this.playerTurn();
      await this.resolve();
      end = this.checkEnd(); if (end) return this.finish(end);
      await this.enemyTalk();
      end = this.checkEnd(); if (end) return this.finish(end);
      await this.enemyAttack();
      if (this.allDown()) return this.finish('lose');
      await this.endTurn();
      end = this.checkEnd(); if (end) return this.finish(end);
    }
  },

  /* ---------- utilidades ---------- */
  alive() { return this.enemies.filter((e) => !e.gone); },
  aliveParty() { return this.party.filter((m) => G.hp[m.id] > 0); },
  member(id) { return this.party.find((m) => m.id === id); },
  allDown() { return this.party.every((m) => G.hp[m.id] <= 0); },
  checkEnd() {
    if (this.cfg.endCheck) { const r = this.cfg.endCheck(this); if (r) return r; }
    return this.alive().length === 0 ? 'win' : null;
  },
  addTP(v) { this.tp = U.clamp(this.tp + v, 0, 100); },
  /* Quebra o texto em páginas de 3 linhas (o painel só tem espaço para 3). */
  pages(text) {
    const lines = Font.wrap(Font.parse(text), 34);
    const out = [];
    for (let i = 0; i < lines.length; i += 3) out.push(lines.slice(i, i + 3));
    return out.length ? out : [[]];
  },
  setLines(lines) {
    this.panelLines = lines;
    this.panelReveal = 0;
    this.panelTotal = Font.count(lines);
  },
  setText(text) { this.setLines(this.pages(text)[0]); },
  /* Mostra um texto no painel e espera Z (ou avanço automático). */
  async say(text, opts = {}) {
    const list = Array.isArray(text) ? text : [text];
    for (const t of list) {
      for (const page of this.pages(t)) {
        this.setLines(page);
        this.waitingText = true;
        let n = 0;
        await waitFor(() => {
          n++;
          if (this.panelReveal < this.panelTotal) { if (Input.take('cancel')) this.panelReveal = this.panelTotal; return false; }
          if (opts.auto && n > opts.auto) return true;
          return Input.take('confirm');
        });
        this.waitingText = false;
      }
    }
  },
  popup(x, y, text, color = '#fff', opts = {}) {
    this.popups.push({ x, y, y0: y, text: String(text), color, t: 0, vy: opts.vy ?? -3.2, big: opts.big, mini: opts.mini });
  },
  pose(m, pose, frames = 0) { if (!m) return; m.pose = pose; m.poseT = frames; m.animF = 0; },

  /* ---------- turno do jogador ---------- */
  async playerTurn() {
    this.acts = this.party.map(() => null);
    this.busyBy = this.party.map(() => null);
    for (const m of this.party) { m.defending = false; if (G.hp[m.id] > 0 && m.pose !== 'hurt') m.pose = 'idle'; }
    this.cur = this.nextChooser(-1);
    if (this.cur < 0) return;
    this.ms = 'btn'; this.btn = 0;
    this.setText(this.flavor());
    this.choosing = true;
    await waitFor(() => !this.choosing);
    this.ms = null;
  },
  flavor() {
    const al = this.alive();
    if (this.cfg.flavor) { const f = this.cfg.flavor(this); if (f) return f; }
    const spare = al.find((e) => e.mercy >= 100);
    if (spare && Math.random() < 0.6) return `* ${spare.name} doesn't want to fight anymore.`;
    const tired = al.find((e) => e.tired);
    if (tired && Math.random() < 0.5) return `* ${tired.name} looks {b}TIRED{w}.`;
    const e = U.pick(al);
    if (!e) return '* ...';
    const fl = e.def.flavor;
    return typeof fl === 'function' ? fl(this, e) : U.pick(fl || [`* ${e.name} is here.`]);
  },
  nextChooser(from) { for (let i = from + 1; i < this.party.length; i++) if (G.hp[this.party[i].id] > 0 && this.busyBy[i] === null) return i; return -1; },
  prevChooser(from) { for (let i = from - 1; i >= 0; i--) if (G.hp[this.party[i].id] > 0 && this.busyBy[i] === null) return i; return -1; },
  btnsOf(m) { return ['fight', m.id === 'stan' ? 'act' : 'magic', 'item', 'spare', 'defend']; },
  setAct(a) {
    this.acts[this.cur] = a;
    const nx = this.nextChooser(this.cur);
    if (nx < 0) { this.choosing = false; return; }
    this.cur = nx; this.ms = 'btn'; this.btn = 0;
  },
  undo() {
    const pv = this.prevChooser(this.cur);
    if (pv < 0) return;
    Sfx.play('cancel');
    const a = this.acts[pv];
    if (a) {
      if (a.tp) this.addTP(a.tp);
      if (a.item) G.items.splice(a.itemIdx, 0, a.item);
      if (a.partners) for (const pi of a.partners) this.busyBy[pi] = null;
    }
    this.acts[pv] = null;
    this.cur = pv; this.ms = 'btn';
  },
  updateMenu() {
    const m = this.party[this.cur];
    if (!m) return;
    const btns = this.btnsOf(m);
    switch (this.ms) {
      case 'btn': {
        if (Input.take('left')) { this.btn = (this.btn + 4) % 5; Sfx.play('move'); }
        if (Input.take('right')) { this.btn = (this.btn + 1) % 5; Sfx.play('move'); }
        if (Input.take('confirm')) {
          const b = btns[this.btn];
          if (b === 'item' && !G.items.length) { Sfx.play('error'); break; }
          Sfx.play('select');
          if (b === 'fight' || b === 'act' || b === 'spare') { this.purpose = b; this.ms = 'enemy'; this.sel = this.firstEnemyIdx(); }
          else if (b === 'magic') { this.ms = 'magic'; this.sel = 0; }
          else if (b === 'item') { this.ms = 'item'; this.sel = 0; }
          else if (b === 'defend') { this.setAct({ type: 'defend' }); }
        } else if (Input.take('cancel')) this.undo();
        break;
      }
      case 'enemy': {
        const list = this.alive();
        let i = list.indexOf(this.enemies[this.sel]);
        if (i < 0) i = 0;
        if (Input.take('up') && i > 0) { i--; Sfx.play('move'); }
        if (Input.take('down') && i < list.length - 1) { i++; Sfx.play('move'); }
        this.sel = this.enemies.indexOf(list[i]);
        if (Input.take('confirm')) {
          Sfx.play('select');
          const e = list[i];
          if (this.purpose === 'act') { this.actTarget = e; this.ms = 'act'; this.sel2 = 0; }
          else if (this.purpose === 'spell') this.setAct({ type: 'spell', spell: this.spell, target: e, tp: SPELLS[this.spell].tp });
          else this.setAct({ type: this.purpose, target: e });
        } else if (Input.take('cancel')) {
          Sfx.play('cancel');
          if (this.purpose === 'spell') { this.addTP(SPELLS[this.spell].tp); this.ms = 'magic'; } else this.ms = 'btn';
        }
        break;
      }
      case 'act': {
        const acts = this.actsFor(this.actTarget);
        this.sel2 = UI.nav(this.sel2, acts.length, 2);
        if (Input.take('confirm')) {
          const a = acts[this.sel2];
          if (!a.ok) { Sfx.play('error'); break; }
          if (a.tp && this.tp < a.tp) { Sfx.play('error'); break; }
          Sfx.play('select');
          if (a.tp) this.addTP(-a.tp);
          const partners = (a.req || []).map((id) => this.party.findIndex((pm) => pm.id === id)).filter((pi) => pi >= 0);
          for (const pi of partners) this.busyBy[pi] = this.cur;
          this.setAct({ type: 'act', target: this.actTarget, act: a, tp: a.tp || 0, partners });
        } else if (Input.take('cancel')) { Sfx.play('cancel'); this.ms = 'enemy'; }
        break;
      }
      case 'magic': {
        const sp = MEMBERS[m.id].spells;
        this.sel = UI.nav(this.sel, sp.length, 1);
        if (Input.take('confirm')) {
          const s = SPELLS[sp[this.sel]];
          if (this.tp < s.tp) { Sfx.play('error'); break; }
          Sfx.play('select');
          this.spell = sp[this.sel];
          this.addTP(-s.tp);
          if (s.target === 'enemy') { this.purpose = 'spell'; this.ms = 'enemy'; this.sel = this.firstEnemyIdx(); }
          else if (s.target === 'ally') { this.ms = 'ally'; this.allyFor = 'spell'; this.sel = 0; }
          else this.setAct({ type: 'spell', spell: this.spell, tp: s.tp });
        } else if (Input.take('cancel')) { Sfx.play('cancel'); this.ms = 'btn'; }
        break;
      }
      case 'item': {
        this.sel = UI.nav(this.sel, G.items.length, 2);
        if (Input.take('confirm')) {
          Sfx.play('select');
          const it = ITEMS[G.items[this.sel]];
          if (it.type !== 'heal') { Sfx.play('error'); break; }
          if (it.all) { const id = G.items[this.sel]; const idx = this.sel; G.items.splice(idx, 1); this.setAct({ type: 'item', item: id, itemIdx: idx }); }
          else { this.ms = 'ally'; this.allyFor = 'item'; this.itemSel = this.sel; this.sel = 0; }
        } else if (Input.take('cancel')) { Sfx.play('cancel'); this.ms = 'btn'; }
        break;
      }
      case 'ally': {
        this.sel = UI.nav(this.sel, this.party.length, 1);
        if (Input.take('confirm')) {
          Sfx.play('select');
          const target = this.party[this.sel];
          if (this.allyFor === 'item') {
            const id = G.items[this.itemSel]; G.items.splice(this.itemSel, 1);
            this.setAct({ type: 'item', item: id, itemIdx: this.itemSel, ally: target });
          } else this.setAct({ type: 'spell', spell: this.spell, ally: target, tp: SPELLS[this.spell].tp });
        } else if (Input.take('cancel')) {
          Sfx.play('cancel');
          if (this.allyFor === 'spell') { this.addTP(SPELLS[this.spell].tp); this.ms = 'magic'; this.sel = 0; }
          else { this.ms = 'item'; this.sel = this.itemSel; }
        }
        break;
      }
      default: break;
    }
  },
  firstEnemyIdx() { const a = this.alive()[0]; return a ? this.enemies.indexOf(a) : 0; },
  actsFor(e) {
    const list = [{ name: 'Check', check: true, ok: true }];
    for (const a of e.def.acts || []) {
      if (a.cond && !a.cond(this, e)) continue;
      const ok = (a.req || []).every((id) => {
        const pi = this.party.findIndex((pm) => pm.id === id);
        return pi >= 0 && pi !== this.cur && G.hp[id] > 0 && this.busyBy[pi] === null && !this.acts[pi];
      });
      list.push(Object.assign({ ok }, a));
    }
    return list;
  },

  /* ---------- resolução das ações ---------- */
  async resolve() {
    const fighters = [];
    this.acts.forEach((a, i) => { if (a && a.type === 'fight') fighters.push(i); });
    if (fighters.length) await this.runQTE(fighters);
    for (let i = 0; i < this.party.length; i++) {
      const a = this.acts[i];
      if (!a || a.type === 'fight') continue;
      if (this.checkEnd()) break;
      if (G.hp[this.party[i].id] <= 0) continue;
      await this.doAction(this.party[i], a);
    }
  },
  retarget(e) { if (e && !e.gone) return e; return this.alive()[0] || null; },
  async doAction(m, a) {
    const name = MEMBERS[m.id].name;
    const cap = name[0] + name.slice(1).toLowerCase();
    switch (a.type) {
      case 'defend':
        this.pose(m, 'defend'); m.defending = true; this.addTP(16);
        return;
      case 'spare': {
        const e = this.retarget(a.target); if (!e) return;
        this.pose(m, 'act', 20);
        if (e.mercy >= 100 && (!e.def.canSpare || e.def.canSpare(this, e))) { await this.spareEnemy(e, `* ${cap} spared ${e.name}!`); }
        else {
          if (e.def.onSpareFail) await e.def.onSpareFail(this, e, m);
          else await this.say(`* ${cap} spared ${e.name}.\n* But its name wasn't {y}YELLOW{w}...`);
        }
        return;
      }
      case 'act': {
        const e = this.retarget(a.target); if (!e) return;
        this.pose(m, 'act');
        for (const pi of a.partners || []) this.pose(this.party[pi], 'act');
        if (a.act.check) await this.say(e.def.check || `* ${e.name} - ATK ${e.atk} DEF ${e.defv}`);
        else await a.act.fn(this, e, m);
        this.pose(m, 'idle');
        for (const pi of a.partners || []) if (G.hp[this.party[pi].id] > 0) this.pose(this.party[pi], 'idle');
        return;
      }
      case 'item': {
        const it = ITEMS[a.item];
        this.pose(m, 'item', 24);
        if (it.all) {
          for (const pm of this.party) this.healMember(pm, it.heal);
          await this.say(`* ${cap} shared the ${it.name}!\n* Everyone recovered ${it.heal} HP!`);
        } else {
          const t = a.ally;
          if (it.revive && G.hp[t.id] <= 0) { G.hp[t.id] = 0; this.healMember(t, Math.round(maxHp(t.id) * it.revive)); }
          else this.healMember(t, it.heal);
          const who = t === m ? '' : ` on ${MEMBERS[t.id].name[0] + MEMBERS[t.id].name.slice(1).toLowerCase()}`;
          await this.say(`* ${cap} used the ${it.name}${who}!`);
        }
        return;
      }
      case 'spell': await this.castSpell(m, a); return;
      default: break;
    }
  },
  healMember(pm, amt) {
    const wasDown = G.hp[pm.id] <= 0;
    if (wasDown) G.hp[pm.id] = Math.max(G.hp[pm.id], 0);
    const got = healMember(pm.id, amt);
    this.popup(pm.x + 4, pm.y - 30, got >= 0 && G.hp[pm.id] >= maxHp(pm.id) ? 'MAX' : got, '#3cff4c');
    Sfx.play('heal');
    this.fx.push({ type: 'heal', x: pm.x, y: pm.y - 18, t: 0 });
    if (wasDown && G.hp[pm.id] > 0) this.pose(pm, 'idle');
    return got;
  },
  async castSpell(m, a) {
    this.pose(m, 'spell');
    Sfx.play('spell');
    this.fx.push({ type: 'cast', x: m.x + 10, y: m.y - 30, t: 0, color: ATTACK_COLORS[m.id] });
    switch (a.spell) {
      case 'furia': {
        const e = this.retarget(a.target); if (!e) break;
        await this.say(`* Kyle went full Jersey!\n* {g}JERSEY RAGE{w}!`, { auto: 22 });
        Sfx.play('magic');
        this.fx.push({ type: 'beam', x0: m.x + 16, y0: m.y - 22, x1: e.x, y1: e.y - 24, t: 0, color: '#5cff6a' });
        await wait(14);
        const dmg = Math.round((stat('kyle', 'mag') * 28 + stat('kyle', 'atk') * 7) * U.rnd(0.92, 1.08));
        this.damageEnemy(e, dmg, m, true);
        await wait(24);
        break;
      }
      case 'licao': {
        await this.say('* Kyle stood on a crate.\n* "You know, I learned something today..."', {});
        for (const e of this.alive()) this.addMercy(e, 20);
        await this.say('* Everyone feels a little thoughtful.');
        break;
      }
      case 'cura': {
        const t = a.ally;
        await this.say(`* Kenny prayed to a friend he made in Hell.\n* Mmmph mmph...`, { auto: 26 });
        this.healMember(t, stat('kenny', 'mag') * 6 + 24);
        await wait(16);
        break;
      }
      case 'pacificar': {
        const e = this.retarget(a.target); if (!e) break;
        if (e.tired && (!e.def.canSpare || e.def.canSpare(this, e))) {
          await this.say(`* Kenny sang a muffled lullaby...`, { auto: 24 });
          await this.spareEnemy(e, `* ${e.name} fell asleep!`);
        } else {
          await this.say(`* Kenny tried to calm ${e.name} down...\n* But it wasn't {b}TIRED{w}.`);
        }
        break;
      }
      default: break;
    }
    if (G.hp[m.id] > 0) this.pose(m, 'idle');
  },
  addMercy(e, v) {
    if (e.gone) return;
    const before = e.mercy;
    e.mercy = U.clamp(e.mercy + v, 0, 100);
    if (e.mercy !== before) this.popup(e.x, e.y - 44, `+${e.mercy - before}%`, '#ffff00', { mini: true });
    if (e.mercy >= 100 && before < 100) Sfx.play('spare');
  },
  tire(e) { if (!e.gone && !e.tired) { e.tired = true; this.popup(e.x, e.y - 62, 'TIRED', '#5ad2ff', { mini: true }); } },

  /* ---------- minigame de ataque ---------- */
  async runQTE(fighters) {
    this.qte = { rows: fighters.map((pi, k) => ({ pi, x: 296 + k * 34 + U.irnd(0, 26), done: false, res: null, flash: 0 })) };
    this.ms = 'qte';
    await waitFor(() => this.qte.rows.every((r) => r.done));
    await wait(20);
    this.ms = null;
    this.qte = null;
  },
  updateQTE() {
    const q = this.qte; if (!q) return;
    const TX = 84;
    for (const r of q.rows) {
      if (r.flash > 0) r.flash--;
      if (r.done) continue;
      r.x -= 4.5;
      if (r.x < TX - 26) { r.done = true; r.res = 'miss'; this.attackHit(r, 0); }
    }
    if (Input.take('confirm')) {
      const live = q.rows.filter((r) => !r.done && r.x < 300).sort((a, b) => a.x - b.x);
      const r = live[0];
      if (r) {
        const d = Math.abs(r.x - TX);
        const mult = d <= 2.5 ? 1.5 : d <= 12 ? 1.15 : Math.max(0.35, 1 - (d - 12) / 90);
        r.done = true; r.res = d <= 2.5 ? 'perfect' : 'hit'; r.flash = 12;
        this.attackHit(r, mult);
      }
    }
  },
  attackHit(r, mult) {
    const m = this.party[r.pi];
    const a = this.acts[r.pi];
    const e = this.retarget(a.target);
    if (!e) return;
    if (mult <= 0) { this.popup(e.x, e.y - 30, 'MISS', '#9a9a9a'); Sfx.play('miss'); return; }
    (async () => {
      this.pose(m, 'attack'); m.animF = 0;
      Sfx.play('swing');
      for (let f = 0; f < 3; f++) { m.animF = f; await wait(3); }
      Sfx.play('slash');
      this.fx.push({ type: 'slash', x: e.x, y: e.y - 26, t: 0, color: ATTACK_COLORS[m.id], who: m.id });
      await wait(5);
      const dmg = Math.max(1, Math.round((stat(m.id, 'atk') * 7.5 * mult - e.defv * 3) * U.rnd(0.92, 1.08)));
      this.damageEnemy(e, dmg, m, mult >= 1.5);
      await wait(10);
      if (G.hp[m.id] > 0) this.pose(m, 'idle');
    })();
  },
  damageEnemy(e, dmg, by, crit) {
    if (e.gone) return;
    if (e.def.onHit) { const r = e.def.onHit(this, e, dmg, by); if (r === false) return; if (typeof r === 'number') dmg = r; }
    e.hp -= dmg;
    e.shake = 14; e.flash = 4;
    Sfx.play(crit ? 'crit' : 'hit');
    this.popup(e.x + U.irnd(-6, 6), e.y - 30, dmg, by ? ATTACK_COLORS[by.id] || '#fff' : '#fff', { big: true });
    if (e.hp <= 0) { e.hp = 0; this.defeatEnemy(e); }
    else if (!e.tired && e.def.tiredAt !== 0 && e.hp <= e.maxHp * (e.def.tiredAt || 0.3)) this.tire(e);
  },
  defeatEnemy(e) {
    if (e.def.onDefeat) { const r = e.def.onDefeat(this, e); if (r === false) return; }
    e.gone = 'defeated';
    (async () => {
      await wait(12);
      Sfx.play('flee');
      await tween(e, { fleeX: 200, alpha: 0 }, 22, Ease.in);
    })();
  },
  async spareEnemy(e, text) {
    e.gone = 'spared';
    Sfx.play('spare');
    for (let i = 0; i < 10; i++) this.fx.push({ type: 'spark', x: e.x + U.rnd(-18, 18), y: e.y - U.rnd(5, 45), vx: U.rnd(-1.5, 1.5), vy: U.rnd(-2, -0.5), t: 0 });
    e.spareFade = true;
    tween(e, { alpha: 0 }, 24, Ease.lin);
    if (e.def.onSpare) await e.def.onSpare(this, e);
    if (text) await this.say(text, { auto: 40 });
  },

  /* ---------- turno inimigo ---------- */
  async enemyTalk() {
    const list = [];
    for (const e of this.alive()) {
      const line = e.def.talk ? e.def.talk(this, e) : null;
      if (line) list.push(this.makeBubble(e.x - 30, e.y - 54, line, 'left', e.def.voice || 'monster'));
    }
    if (!list.length) return;
    await this.showBubbles(list);
  },
  makeBubble(x, y, text, side = 'left', voice = 'monster') {
    const lines = Font.wrap(Font.parse(text), 15);
    const w = Math.max(...lines.map((l) => l.filter((t) => t.ch !== undefined).length)) * 8 + 12;
    const h = lines.length * 14 + 8;
    let bx = side === 'left' ? x - w : x, by = Math.max(4, Math.min(PANEL_Y - h - 4, y - h / 2));
    bx = U.clamp(bx, 4, W - w - 4);
    return { lines, x: bx, y: by, w, h, side, px: x, py: y, reveal: 0, total: Font.count(lines), voice };
  },
  async showBubbles(list, opts = {}) {
    this.bubbles = list;
    let t = 0;
    await waitFor(() => {
      t++;
      let all = true;
      for (const b of this.bubbles) {
        if (b.reveal < b.total) { all = false; b.reveal = Math.min(b.total, b.reveal + 1); if (t % 2 === 0) Sfx.blip(b.voice); }
      }
      if (!all) { if (Input.take('cancel')) for (const b of this.bubbles) b.reveal = b.total; return false; }
      if (opts.auto && t > opts.auto) return true;
      return Input.take('confirm');
    });
    this.bubbles = [];
  },
  async enemyAttack() {
    const alive = this.alive();
    if (!alive.length) return;
    let pats;
    if (this.cfg.patterns) pats = this.cfg.patterns(this);
    else {
      const pick = U.shuffle(alive.slice()).slice(0, 2);
      pats = pick.map((e) => ({ e, id: e.def.pickPattern ? e.def.pickPattern(this, e) : U.pick(e.def.patterns) }));
    }
    pats = pats.filter((p) => p && PATTERNS[p.id]);
    if (!pats.length) return;
    const density = pats.length > 1 ? 0.65 : 1;
    const bw = Math.max(...pats.map((p) => PATTERNS[p.id].w || 76)), bh = Math.max(...pats.map((p) => PATTERNS[p.id].h || 76));
    this.box = { cx: BOX_CX, cy: BOX_CY, w: bw, h: bh, k: 0 };
    Sfx.play('appear');
    tween(this.box, { k: 1 }, 8, Ease.out);
    const lead = this.aliveParty()[0] || this.party[0];
    this.soul = { x: lead.x + 6, y: lead.y - 18, inv: 0, graze: 0 };
    await tween(this.soul, { x: BOX_CX, y: BOX_CY + (pats[0] && PATTERNS[pats[0].id].soulY || 0) }, 10, Ease.out);
    this.bullets = [];
    this.waveRuns = pats.map((p) => {
      const P = PATTERNS[p.id];
      const ctx = { e: p.e, density, t: 0, d: {}, dur: P.dur || 180 };
      if (P.init) P.init(this, ctx);
      return { P, ctx };
    });
    this.waveT = 0;
    this.waveDur = Math.max(...this.waveRuns.map((r) => r.ctx.dur));
    this.ms = 'wave';
    await waitFor(() => this.waveT >= this.waveDur || this.allDown());
    this.ms = null;
    this.lastSoul = { x: this.soul.x, y: this.soul.y };
    if (this.allDown()) { this.bullets = []; return; }
    for (const b of this.bullets) b.fade = true;
    await tween(this.box, { k: 0 }, 7, Ease.in);
    this.bullets = [];
    this.box = null; this.soul = null;
  },
  /* Área interna da caixa */
  inner() {
    const b = this.box;
    return { x: b.cx - b.w / 2, y: b.cy - b.h / 2, w: b.w, h: b.h, x2: b.cx + b.w / 2, y2: b.cy + b.h / 2, cx: b.cx, cy: b.cy };
  },
  spawn(b) {
    const o = Object.assign({ x: 0, y: 0, vx: 0, vy: 0, ax: 0, ay: 0, r: 4, t: 0, dmg: 10, rot: 0, vr: 0, alpha: 1 }, b);
    this.bullets.push(o);
    return o;
  },
  updateWave() {
    this.waveT++;
    for (const r of this.waveRuns) { r.ctx.t++; if (r.ctx.t <= r.ctx.dur) r.P.update(this, r.ctx); }
    const s = this.soul, ib = this.inner();
    if (s) {
      const sp = 2.2;
      const dx = (Input.h('right') ? 1 : 0) - (Input.h('left') ? 1 : 0);
      const dy = (Input.h('down') ? 1 : 0) - (Input.h('up') ? 1 : 0);
      s.x = U.clamp(s.x + dx * sp, ib.x + 5, ib.x2 - 5);
      s.y = U.clamp(s.y + dy * sp, ib.y + 5, ib.y2 - 5);
      if (s.inv > 0) s.inv--;
      if (s.graze > 0) s.graze--;
    }
    for (const b of this.bullets) {
      if (b.wait > 0) { b.wait--; continue; }
      if (b.update) b.update(b, this);
      else { b.vx += b.ax; b.vy += b.ay; b.x += b.vx; b.y += b.vy; }
      b.rot += b.vr;
      b.t++;
      if (b.life && b.t >= b.life) b.dead = true;
      if (b.x < -60 || b.x > W + 60 || b.y < -80 || b.y > H + 60) b.dead = true;
      if (!s || b.dead || b.harmless || b.wait > 0) continue;
      // colisão e raspão
      let dist;
      if (b.hw) {
        const ddx = Math.max(Math.abs(s.x - b.x) - b.hw, 0), ddy = Math.max(Math.abs(s.y - b.y) - b.hh, 0);
        dist = Math.hypot(ddx, ddy);
      } else dist = Math.max(0, U.dist(s.x, s.y, b.x, b.y) - b.r);
      if (dist < 3) {
        if (s.inv <= 0) { this.hitParty(b.dmg, b.target); if (b.breakOnHit) b.dead = true; }
      } else if (dist < 15 && b.graze !== false) {
        if (!b.grazed) { b.grazed = true; this.addTP(2.2); Sfx.play('graze'); }
        else this.addTP(0.18);
        s.graze = 6;
      }
    }
    this.bullets = this.bullets.filter((b) => !b.dead);
  },
  hitParty(base, target) {
    const alive = this.aliveParty();
    if (!alive.length) return;
    const targets = target === 'all' ? alive : [target && G.hp[target.id] > 0 ? target : U.pick(alive)];
    for (const m of targets) {
      let d = Math.round(base * U.rnd(0.9, 1.1) - stat(m.id, 'def') * 1.5);
      if (m.defending) d = Math.round(d * 0.6);
      d = Math.max(1, d);
      G.hp[m.id] -= d;
      this.popup(m.x + 6, m.y - 34, d, '#ffffff', { big: true });
      m.shake = 10; this.pose(m, 'hurt', 16);
      if (G.hp[m.id] <= 0) this.downMember(m);
    }
    if (this.soul) this.soul.inv = 36;
    Sfx.play('hurt');
    Shake.start(2, 6);
  },
  downMember(m) {
    G.hp[m.id] = Math.min(G.hp[m.id], -Math.round(maxHp(m.id) * 0.25));
    this.pose(m, 'down');
    Sfx.play('down');
    this.popup(m.x + 6, m.y - 46, 'DOWN', '#ff4040', { mini: true });
    if (m.id === 'kenny') { this.kennyDied = true; Sfx.play('splat'); }
  },
  async endTurn() {
    if (this.kennyDied) {
      this.kennyDied = false;
      const stan = this.member('stan'), kyle = this.member('kyle');
      const bubbles = [];
      if (stan && G.hp.stan > 0) bubbles.push(this.makeBubble(stan.x + 18, stan.y - 40, 'OH MY GOD! THEY KILLED KENNY!', 'right', 'stan'));
      if (kyle && G.hp.kyle > 0) bubbles.push(this.makeBubble(kyle.x + 18, kyle.y - 26, 'YOU BASTARDS!', 'right', 'kyle'));
      if (bubbles.length) await this.showBubbles(bubbles, { auto: 80 });
      const k = this.member('kenny');
      if (k && G.hp.kenny <= 0) {
        G.hp.kenny = Math.round(maxHp('kenny') * 0.5);
        this.pose(k, 'idle'); Sfx.play('revive');
        this.fx.push({ type: 'heal', x: k.x, y: k.y - 18, t: 0 });
        await this.say('* Kenny came back to life.\n* Nobody knows how. Nobody asks.', { auto: 60 });
      }
    }
    for (const m of this.party) {
      if (G.hp[m.id] <= 0) {
        G.hp[m.id] += Math.ceil(maxHp(m.id) / 8);
        if (G.hp[m.id] > 0) { this.pose(m, 'idle'); this.popup(m.x + 6, m.y - 40, 'UP', '#3cff4c', { mini: true }); Sfx.play('revive'); }
      } else if (m.pose !== 'idle') this.pose(m, 'idle');
      m.defending = false;
    }
    for (const e of this.alive()) if (e.def.onTurnEnd) await e.def.onTurnEnd(this, e);
  },

  async finish(result) {
    this.choosing = false; this.ms = null;
    if (result === 'lose') {
      const s = this.soul || this.lastSoul || { x: this.party[0].x + 6, y: this.party[0].y - 18 };
      await GameOver.run(s.x, s.y);
      return 'lose';
    }
    if (result === 'win') {
      let money = 0;
      for (const e of this.enemies) if (e.gone) money += e.def.money || 0;
      if (this.cfg.money !== undefined) money = this.cfg.money;
      G.money += money;
      Music.stop(4);
      Sfx.play('victory');
      for (const m of this.party) if (G.hp[m.id] > 0) this.pose(m, 'victory');
      if (!this.cfg.noVictoryText) await this.say(`* YOU WON!\n* Got 0 EXP and ${money} D$.`);
    }
    if (this.cfg.onEnd) await this.cfg.onEnd(this, result);
    return result;
  },

  /* ---------- atualização e desenho ---------- */
  update() {
    if (!this.active) return;
    if (this.panelLines && this.panelReveal < this.panelTotal) {
      this.panelReveal = Math.min(this.panelTotal, this.panelReveal + 1);
      if (this.panelReveal % 2 === 0 && this.waitingText) Sfx.blip('default');
    }
    if (this.choosing) this.updateMenu();
    if (this.ms === 'qte') this.updateQTE();
    if (this.ms === 'wave') this.updateWave();
    for (const m of this.party) {
      if (m.shake > 0) m.shake--;
      if (m.poseT > 0) { m.poseT--; if (m.poseT === 0 && G.hp[m.id] > 0 && (m.pose === 'hurt' || m.pose === 'item' || m.pose === 'act')) m.pose = m.defending ? 'defend' : 'idle'; }
    }
    for (const e of this.enemies) { if (e.shake > 0) e.shake--; if (e.flash > 0) e.flash--; }
    for (const p of this.popups) {
      p.t++;
      if (p.t < 30) { p.y += p.vy; p.vy += 0.45; if (p.y > p.y0) { p.y = p.y0; p.vy = p.vy > 1.2 ? -p.vy * 0.4 : 0; } }
      else p.y -= 0.6;
    }
    this.popups = this.popups.filter((p) => p.t < 52);
    for (const f of this.fx) { f.t++; if (f.type === 'spark') { f.x += f.vx; f.y += f.vy; f.vy += 0.06; } }
    this.fx = this.fx.filter((f) => f.t < (f.type === 'spark' ? 40 : f.type === 'beam' ? 26 : f.type === 'heal' ? 30 : 18));
  },
  draw(g) {
    BG.battleGrid(g, frame, this.bgA);
    if (this.cfg.drawBg) this.cfg.drawBg(g, this);
    for (const e of this.enemies) this.drawEnemy(g, e);
    for (const m of this.party) this.drawMember(g, m);
    this.drawFx(g);
    if (this.box) this.drawBox(g);
    this.drawTP(g);
    this.drawPanel(g);
    for (const b of this.bubbles) this.drawBubble(g, b);
    for (const p of this.popups) {
      const a = p.t > 40 ? 1 - (p.t - 40) / 12 : 1;
      g.globalAlpha = Math.max(0, a);
      if (p.mini) Mini.draw(g, p.text, p.x, p.y, p.color, { align: 'center', outline: '#000' });
      else Font.draw(g, p.text, p.x, p.y - 8, p.color, { align: 'center', outline: '#000' });
      g.globalAlpha = 1;
    }
  },
  drawMember(g, m) {
    const hp = G.hp[m.id];
    let pose = hp <= 0 ? 'down' : m.pose;
    let f = 0;
    if (pose === 'idle') f = Math.floor((frame + m.i * 9) / 18) % 2;
    if (pose === 'attack') f = m.animF;
    if (pose === 'act' || pose === 'spell') f = Math.floor(frame / 10) % 2;
    const img = Spr.battle(m.id, pose, f);
    const sx = m.shake > 0 ? (m.shake % 2 ? 2 : -2) : 0;
    const dx = Math.round(m.x + m.off - 18 + sx), dy = Math.round(m.y - 41);
    g.drawImage(img, dx, dy);
    if (m.defending && hp > 0) {
      g.globalAlpha = 0.35 + Math.sin(frame * 0.3) * 0.15;
      g.strokeStyle = '#5ad2ff'; g.lineWidth = 1;
      g.strokeRect(dx + 6, dy + 4, 26, 38);
      g.globalAlpha = 1;
    }
  },
  enemyImg(e) {
    const f = Math.floor((frame + e.idx * 11) / 16) % 2;
    if (e.def.art) return e.def.art(this, e, f);
    return Spr.enemy(e.def.sprite || e.id, f);
  },
  drawEnemy(g, e) {
    if (e.alpha <= 0.01) return;
    const img = this.enemyImg(e);
    const sx = e.shake > 0 ? (e.shake % 2 ? 3 : -3) * (e.shake / 14) : 0;
    const dx = Math.round(e.x + e.off + e.fleeX - img.width / 2 + sx), dy = Math.round(e.y - img.height + (e.dy || 0));
    g.globalAlpha = e.alpha;
    if (e.spareFade) g.drawImage(silhouetteCached(img, '#ffffff'), dx, dy);
    else if (e.flash > 0) g.drawImage(silhouetteCached(img, '#ffffff'), dx, dy);
    else g.drawImage(img, dx, dy);
    g.globalAlpha = 1;
  },
  drawFx(g) {
    for (const f of this.fx) {
      if (f.type === 'slash') {
        const k = f.t / 18;
        g.strokeStyle = f.t % 4 < 2 ? '#ffffff' : f.color; g.lineWidth = 2;
        if (f.who === 'kyle') {
          g.globalAlpha = 1 - k; g.fillStyle = '#5cff6a';
          g.beginPath(); g.arc(f.x, f.y, 6 + k * 14, 0, Math.PI * 2); g.fill(); g.globalAlpha = 1;
        } else {
          g.beginPath();
          const len = 34 * Math.min(1, f.t / 5);
          g.moveTo(f.x - 17, f.y - 17); g.lineTo(f.x - 17 + len, f.y - 17 + len);
          if (f.who === 'kenny') { g.moveTo(f.x + 17, f.y - 17); g.lineTo(f.x + 17 - len, f.y - 17 + len); }
          g.stroke();
        }
      } else if (f.type === 'spark') {
        g.globalAlpha = 1 - f.t / 40; g.drawImage(ICON.star, Math.round(f.x - 3), Math.round(f.y - 3)); g.globalAlpha = 1;
      } else if (f.type === 'heal') {
        g.globalAlpha = 1 - f.t / 30; g.fillStyle = '#3cff4c';
        for (let i = 0; i < 6; i++) g.fillRect(Math.round(f.x - 12 + i * 5), Math.round(f.y + 10 - f.t * 1.2 - (i % 2) * 6), 2, 2);
        g.globalAlpha = 1;
      } else if (f.type === 'cast') {
        g.globalAlpha = 1 - f.t / 18; g.strokeStyle = f.color;
        g.beginPath(); g.arc(f.x, f.y, f.t * 1.5, 0, Math.PI * 2); g.stroke(); g.globalAlpha = 1;
      } else if (f.type === 'beam') {
        const k = Math.min(1, f.t / 10);
        g.globalAlpha = f.t > 16 ? 1 - (f.t - 16) / 10 : 1;
        g.strokeStyle = f.color; g.lineWidth = 6 - Math.min(4, f.t / 5);
        g.beginPath(); g.moveTo(f.x0, f.y0); g.lineTo(U.lerp(f.x0, f.x1, k), U.lerp(f.y0, f.y1, k)); g.stroke();
        g.strokeStyle = '#ffffff'; g.lineWidth = 1;
        g.beginPath(); g.moveTo(f.x0, f.y0); g.lineTo(U.lerp(f.x0, f.x1, k), U.lerp(f.y0, f.y1, k)); g.stroke();
        g.globalAlpha = 1;
      }
    }
  },
  drawBox(g) {
    const b = this.box, k = b.k;
    const w = Math.max(2, b.w * k), h = Math.max(2, b.h * k);
    g.save();
    g.translate(b.cx, b.cy);
    g.rotate((1 - k) * Math.PI * 0.5);
    g.fillStyle = '#000'; g.fillRect(-w / 2 - 2, -h / 2 - 2, w + 4, h + 4);
    g.strokeStyle = '#2fd12f'; g.lineWidth = 2;
    g.strokeRect(Math.round(-w / 2) - 1, Math.round(-h / 2) - 1, Math.round(w) + 2, Math.round(h) + 2);
    g.restore();
    if (k < 0.98) return;
    for (const r of this.waveRuns) if (r.P.drawUnder) r.P.drawUnder(g, this, r.ctx);
    const ib = this.inner();
    for (const bl of this.bullets) {
      if (bl.wait > 0 && !bl.showWaiting) continue;
      if (bl.clip) { g.save(); g.beginPath(); g.rect(ib.x, ib.y, ib.w, ib.h); g.clip(); }
      g.globalAlpha = bl.fade ? 0.4 : bl.alpha;
      if (bl.draw) bl.draw(g, bl, this);
      else if (bl.img) {
        if (bl.rot) { g.save(); g.translate(Math.round(bl.x), Math.round(bl.y)); g.rotate(bl.rot); g.drawImage(bl.img, -Math.round(bl.img.width / 2), -Math.round(bl.img.height / 2)); g.restore(); }
        else g.drawImage(bl.img, Math.round(bl.x - bl.img.width / 2), Math.round(bl.y - bl.img.height / 2));
      } else { g.fillStyle = bl.color || '#fff'; g.beginPath(); g.arc(bl.x, bl.y, bl.r, 0, Math.PI * 2); g.fill(); }
      g.globalAlpha = 1;
      if (bl.clip) g.restore();
    }
    for (const r of this.waveRuns) if (r.P.drawOver) r.P.drawOver(g, this, r.ctx);
    const s = this.soul;
    if (s && !(s.inv > 0 && Math.floor(s.inv / 3) % 2 === 0)) {
      if (s.graze > 0) for (const [ox, oy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) g.drawImage(ICON.soulW, Math.round(s.x - 4 + ox), Math.round(s.y - 3 + oy));
      g.drawImage(ICON.soul, Math.round(s.x - 4), Math.round(s.y - 3));
    }
  },
  drawTP(g) {
    const x = 9, y = 30, w = 11, h = 112;
    Mini.draw(g, 'TP', x + 2, y - 8, '#fff');
    g.fillStyle = '#fff'; g.fillRect(x - 1, y - 1, w + 2, h + 2);
    g.fillStyle = '#3a0a0a'; g.fillRect(x, y, w, h);
    const fh = Math.round((this.tp / 100) * h);
    const full = this.tp >= 100;
    g.fillStyle = full ? '#ffd23a' : '#ff8a1a'; g.fillRect(x, y + h - fh, w, fh);
    if (fh > 1) { g.fillStyle = full ? '#fff6a0' : '#ffc070'; g.fillRect(x, y + h - fh, w, 1); }
    Mini.draw(g, full ? 'MAX' : `${Math.floor(this.tp)}%`, x + w / 2, y + h + 4, full ? '#ffd23a' : '#fff', { align: 'center' });
  },
  drawPanel(g) {
    g.fillStyle = '#000'; g.fillRect(0, PANEL_Y, W, H - PANEL_Y);
    g.fillStyle = '#3a1d5c'; g.fillRect(0, PANEL_Y, W, 1);
    const n = this.party.length, bw = 106, x0 = Math.round((W - n * bw) / 2);
    this.party.forEach((m, i) => {
      const bx = x0 + i * bw;
      const active = this.choosing && i === this.cur;
      if (active) this.drawActiveBox(g, m, bx);
      else {
        UI.partyBox(g, m.id, bx, PANEL_Y + 1, bw, { border: true });
        const a = this.acts && this.acts[i];
        if (this.choosing && a) {
          const icon = { fight: 'fight', act: 'act', spell: 'magic', item: 'item', spare: 'spare', defend: 'defend' }[a.type];
          if (icon) g.drawImage(silhouetteCached(ICON.btn[icon], '#ffff00'), bx + bw - 15, PANEL_Y - 12);
        }
        if (this.choosing && this.busyBy && this.busyBy[i] !== null) Mini.draw(g, 'HELPING', bx + bw - 4, PANEL_Y - 8, '#ffff00', { align: 'right' });
      }
    });
    const ty = 189;
    if (this.ms === 'qte' && this.qte) { this.drawQTE(g); return; }
    if (this.choosing && this.ms !== 'btn') { this.drawMenuList(g, ty); return; }
    if (this.panelLines) Font.drawRich(g, this.panelLines, 14, ty, this.panelReveal, { lh: 16 });
  },
  drawActiveBox(g, m, bx) {
    const md = MEMBERS[m.id], by = PANEL_Y - 16, bw = 106, h = 37;
    g.fillStyle = '#000'; g.fillRect(bx, by, bw, h);
    g.fillStyle = md.color; g.fillRect(bx, by, bw, 1); g.fillRect(bx, by + h - 1, bw, 1); g.fillRect(bx, by, 1, h); g.fillRect(bx + bw - 1, by, 1, h);
    UI.partyBox(g, m.id, bx + 1, by + 1, bw - 2, { border: false });
    const btns = this.btnsOf(m);
    btns.forEach((b, k) => {
      const x = bx + 5 + k * 20, y = by + 20;
      const sel = k === this.btn;
      const c = sel ? '#ffff00' : '#ff8a1a';
      g.fillStyle = c; g.fillRect(x, y, 17, 1); g.fillRect(x, y + 14, 17, 1); g.fillRect(x, y, 1, 15); g.fillRect(x + 16, y, 1, 15);
      g.drawImage(silhouetteCached(ICON.btn[b], c), x + 2, y + 2);
    });
    if (this.ms === 'btn') {
      const lbl = BTN_LABEL[btns[this.btn]];
      Font.draw(g, lbl, bx + bw / 2, by - 15, '#ffff00', { align: 'center', outline: '#000' });
    }
  },
  drawMenuList(g, ty) {
    const m = this.party[this.cur];
    const heart = (x, y) => UI.heart(g, x, y + 5);
    if (this.ms === 'enemy') {
      Mini.draw(g, 'HP', 220, ty + 1, '#9a9aa8', { align: 'center' }); Mini.draw(g, 'MERCY', 274, ty + 1, '#9a9aa8', { align: 'center' });
      this.alive().forEach((e, i) => {
        const y = ty + 5 + i * 15;
        const col = e.mercy >= 100 ? '#ffff00' : e.tired ? '#5ad2ff' : '#fff';
        Font.draw(g, e.name, 30, y, col);
        if (this.enemies[this.sel] === e) heart(16, y);
        UI.bar(g, 196, y + 5, 48, 7, e.hp / e.maxHp, '#3cff4c', '#7a0000');
        Mini.draw(g, `${Math.ceil((e.hp / e.maxHp) * 100)}%`, 220, y + 6, '#000', { align: 'center' });
        UI.bar(g, 250, y + 5, 48, 7, e.mercy / 100, '#ffff00', '#ff6a00');
        Mini.draw(g, `${e.mercy}%`, 274, y + 6, '#7a2a00', { align: 'center' });
      });
    } else if (this.ms === 'act') {
      const acts = this.actsFor(this.actTarget);
      acts.forEach((a, i) => {
        const x = 30 + (i % 2) * 146, y = ty + Math.floor(i / 2) * 16;
        Font.draw(g, a.name, x, y, a.ok ? (a.tp && this.tp < a.tp ? '#808080' : '#fff') : '#606060');
        let ix = x + Font.width(a.name) + 3;
        for (const r of a.req || []) { g.drawImage(Spr.head(r, 4), ix, y + 3); ix += 13; }
        if (a.tp) Mini.draw(g, `${a.tp}%`, ix + 2, y + 6, '#ff8a1a');
        if (i === this.sel2) heart(x - 14, y);
      });
    } else if (this.ms === 'magic') {
      const sp = MEMBERS[m.id].spells;
      sp.forEach((id, i) => {
        const s = SPELLS[id], y = ty + i * 16;
        Font.draw(g, s.name, 30, y, this.tp >= s.tp ? '#fff' : '#808080');
        Mini.draw(g, `${s.tp}% TP`, 154, y + 6, '#ff8a1a', { align: 'right' });
        if (i === this.sel) heart(16, y);
      });
      const s = SPELLS[sp[this.sel]];
      if (s) Font.block(g, s.desc, 168, ty, 18, { color: '#a0a0a0' });
    } else if (this.ms === 'item') {
      G.items.forEach((it, i) => {
        if (i >= 6) return;
        const x = 30 + (i % 2) * 146, y = ty + Math.floor(i / 2) * 16;
        Font.draw(g, ITEMS[it].name, x, y, '#fff');
        if (i === this.sel) heart(x - 14, y);
      });
    } else if (this.ms === 'ally') {
      this.party.forEach((pm, i) => {
        const y = ty + i * 16;
        Font.draw(g, MEMBERS[pm.id].name, 30, y, G.hp[pm.id] <= 0 ? '#ff4040' : '#fff');
        UI.bar(g, 150, y + 5, 60, 7, Math.max(0, G.hp[pm.id]) / maxHp(pm.id), MEMBERS[pm.id].color, '#7a0000');
        Mini.draw(g, `${Math.max(0, G.hp[pm.id])}/${maxHp(pm.id)}`, 216, y + 6, '#fff');
        if (i === this.sel) heart(16, y);
      });
    }
  },
  drawQTE(g) {
    const TX = 84, q = this.qte;
    q.rows.forEach((r, k) => {
      const m = this.party[r.pi], y = 192 + k * 16;
      g.drawImage(Spr.head(m.id, 5), 14, y - 1);
      g.fillStyle = '#1a1a2a'; g.fillRect(40, y + 2, 270, 11);
      g.fillStyle = '#ffffff'; g.fillRect(TX - 1, y, 1, 15); g.fillRect(TX + 4, y, 1, 15);
      g.fillStyle = '#5a5a7a'; g.fillRect(TX - 6, y + 2, 1, 11); g.fillRect(TX + 9, y + 2, 1, 11);
      if (!r.done || r.flash > 0) {
        const c = r.flash > 0 ? (r.res === 'perfect' ? '#ffff00' : '#ffffff') : ATTACK_COLORS[m.id];
        g.fillStyle = c; g.fillRect(Math.round(r.x), y + 1, 4, 13);
      }
      if (r.done && r.res === 'perfect' && r.flash > 0) Mini.draw(g, 'PERFECT!', TX + 14, y + 5, '#ffff00');
    });
  },
  drawBubble(g, b) {
    g.fillStyle = '#fff';
    g.fillRect(b.x + 2, b.y, b.w - 4, b.h); g.fillRect(b.x, b.y + 2, b.w, b.h - 4); g.fillRect(b.x + 1, b.y + 1, b.w - 2, b.h - 2);
    const py = U.clamp(b.py, b.y + 4, b.y + b.h - 4);
    if (b.side === 'left') { g.beginPath(); g.moveTo(b.x + b.w - 1, py - 3); g.lineTo(b.x + b.w + 6, py); g.lineTo(b.x + b.w - 1, py + 3); g.fill(); }
    else { g.beginPath(); g.moveTo(b.x + 1, py - 3); g.lineTo(b.x - 6, py); g.lineTo(b.x + 1, py + 3); g.fill(); }
    Font.drawRich(g, b.lines, b.x + 6, b.y + 3, b.reveal, { lh: 14, color: '#000' });
  },
};
