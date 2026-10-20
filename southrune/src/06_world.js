'use strict';
/* Motor de campo: salas em tiles, colisão, câmera, grupo que segue o líder,
   NPCs, objetos interativos, inimigos visíveis e utilidades de cutscene. */

const ROOMS = {};
const FOLLOW_GAP = 11;

class Actor {
  constructor(o) {
    Object.assign(this, {
      x: 0, y: 0, facing: 'down', frame: 0, animT: 0, moving: false, visible: true,
      kind: 'kid', who: 'stan', solid: true, bw: 12, bh: 6, z: 0, alpha: 1, dy: 0, extra: '',
    }, o);
  }
  sprite() {
    switch (this.kind) {
      case 'kid': return Spr.kid(this.who, G.dark || this.forceDark, this.facing, this.moving ? this.frame : 0, this.extra);
      case 'npc': return Spr.npc(this.who, this.moving ? this.frame % 2 : 0, this.expr || 'happy');
      case 'goomba': {
        const s = Spr.goombaField(this.moving ? (this.frame % 2 ? 2 : 3) : (Math.floor(frame / 12) % 2), this.expr || 'angry');
        return s;
      }
      case 'enemy': return Spr.enemy(this.sprite_, Math.floor((frame + this.seed * 7) / 15) % 2);
      case 'prop': return Spr.prop(this.name);
      case 'save': return ICON.save[Math.floor(frame / 10) % 2];
      case 'chest': return Spr.prop(hasFlag(this.flag) ? 'chestOpen' : 'chest');
      case 'switch': return Spr.prop(this.isOn() ? 'switchOn' : 'switchOff');
      case 'img': return this.img;
      default: return null;
    }
  }
  box() { return { x: this.x - this.bw / 2, y: this.y - this.bh, w: this.bw, h: this.bh }; }
  hitArea() {
    if (this.area) return { x: this.x + this.area.x, y: this.y + this.area.y, w: this.area.w, h: this.area.h };
    return { x: this.x - 12, y: this.y - 18, w: 24, h: 20 };
  }
  draw(g, cx, cy) {
    if (!this.visible) return;
    if (this.drawFn) { this.drawFn(g, Math.round(this.x - cx), Math.round(this.y - cy), this); return; }
    if (this.kind === 'spikes') {
      const img = Spr.prop(this.isUp() ? 'spikesUp' : 'spikesDown');
      for (let i = 0; i < this.tilesW; i++) for (let j = 0; j < (this.tilesH || 1); j++) g.drawImage(img, Math.round(this.x - cx + i * 16 - 1), Math.round(this.y - cy + j * 16 - 17));
      return;
    }
    let img = this.sprite();
    if (!img) return;
    if (this.kind === 'goomba' && this.facing === 'left') img = flipCachedX(img);
    const dx = Math.round(this.x - img.width / 2 - cx), dy = Math.round(this.y - img.height + 2 + this.dy - cy);
    if (this.alpha < 1) g.globalAlpha = Math.max(0, this.alpha);
    if (this.flashT > 0) { g.drawImage(silhouetteCached(img, '#ffffff'), dx, dy); this.flashT--; }
    else g.drawImage(img, dx, dy);
    g.globalAlpha = 1;
    if (this.emote && this.emote.t > 0) {
      this.emote.t--;
      g.drawImage(ICON.bang, dx + Math.round(img.width / 2) - 2, dy - 12);
    }
  }
  /* Caminha até (tx, ty) em linha reta. */
  walkTo(tx, ty, speed = 2) {
    return new Promise((res) => {
      this.path = { tx, ty, speed, res };
    });
  }
  stepPath() {
    if (!this.path) return;
    const { tx, ty, speed } = this.path;
    const dx = tx - this.x, dy = ty - this.y, d = Math.hypot(dx, dy);
    if (d <= speed) {
      this.x = tx; this.y = ty; this.moving = false;
      const r = this.path.res; this.path = null; r();
      return;
    }
    this.x += (dx / d) * speed; this.y += (dy / d) * speed;
    this.moving = true;
    if (!this.lockFacing) this.facing = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up');
  }
  animate() {
    if (this.moving) { this.animT++; if (this.animT >= 6) { this.animT = 0; this.frame = (this.frame + 1) % 4; } }
    else { this.animT = 0; this.frame = 0; }
  }
}
const _silCache = new WeakMap();
function silhouetteCached(img, color) {
  let m = _silCache.get(img);
  if (!m) { m = new Map(); _silCache.set(img, m); }
  let c = m.get(color);
  if (!c) { c = silhouette(img, color); m.set(color, c); }
  return c;
}

const World = {
  id: null, def: null, map: null, cols: 0, rows: 0, layer: null, ts: null,
  actors: [], player: null, followers: [], trail: [], cam: { x: 0, y: 0 },
  busy: 0, epoch: 0, triggersOn: true, encounterOn: true, camLock: null,

  load(id, x, y, facing = 'down') {
    const def = ROOMS[id];
    if (!def) throw new Error('Sala desconhecida: ' + id);
    this.id = id; this.def = def;
    G.room = id;
    if (def.dark !== undefined) G.dark = def.dark;
    this.map = def.map;
    this.rows = def.map.length; this.cols = Math.max(...def.map.map((r) => r.length));
    this.ts = TILESETS[def.tileset || (G.dark ? 'dark' : 'light')];
    this.layer = this.renderLayer();
    this.actors = [];
    this.camLock = null;
    // grupo (se a posição cair dentro de uma parede, procura o chão livre mais próximo)
    const probe = new Actor({ bw: 12, bh: 6 });
    if (this.blocked(x, y, probe)) {
      search: for (let r = 4; r <= 96; r += 4) {
        for (let a = 0; a < 16; a++) {
          const nx = x + Math.round(Math.cos((a / 16) * Math.PI * 2) * r), ny = y + Math.round(Math.sin((a / 16) * Math.PI * 2) * r);
          if (!this.blocked(nx, ny, probe)) { x = nx; y = ny; break search; }
        }
      }
    }
    this.player = new Actor({ kind: 'kid', who: G.party[0], x, y, facing, isPlayer: true });
    this.actors.push(this.player);
    this.followers = G.party.slice(1).map((who) => {
      const a = new Actor({ kind: 'kid', who, x, y, facing, follower: true, solid: false });
      this.actors.push(a);
      return a;
    });
    this.resetTrail(true);
    // objetos da sala
    const objs = typeof def.objects === 'function' ? def.objects() : def.objects || [];
    for (const o of objs) this.addObject(o);
    this.updateCamera(true);
    if (def.music !== undefined) { if (def.music) Music.play(def.music, { fadeIn: 8 }); else Music.stop(15); }
    G.x = x; G.y = y; G.facing = facing;
  },
  addObject(o) {
    if (o.cond && !o.cond()) return null;
    let a;
    switch (o.type) {
      case 'exit': case 'trigger':
        a = new Actor(Object.assign({ kind: 'zone', solid: false, visible: false }, o));
        break;
      case 'prop':
        a = new Actor(Object.assign({ kind: 'prop', bw: o.solid ? o.solid[0] : 0, bh: o.solid ? o.solid[1] : 0 }, o, { solid: !!o.solid }));
        break;
      case 'save':
        a = new Actor(Object.assign({ kind: 'save', bw: 12, bh: 8, area: { x: -12, y: -18, w: 24, h: 22 } }, o));
        a.interact = async () => {
          healAll();
          await Dlg.say(o.text || ['* (A strange light shines here.)', '* (It fills you with DETERMINATION.)']);
          await SaveMenu.open(this.def.name || '');
        };
        break;
      case 'chest':
        a = new Actor(Object.assign({ kind: 'chest', bw: 18, bh: 8, flag: 'chest_' + o.id }, o));
        a.interact = async () => {
          if (hasFlag(a.flag)) { await Dlg.say('* (The chest is empty.)'); return; }
          if (G.items.length >= 12) { await Dlg.say('* (Your pockets are full.)'); return; }
          setFlag(a.flag); Sfx.play('item');
          if (o.money) { G.money += o.money; await Dlg.say(`* (Inside the chest was ${o.money} D$.)`); return; }
          addItem(o.item);
          await Dlg.say(`* (You opened the chest.)\n* (Inside was: {y}${ITEMS[o.item].name}{w}.)`);
        };
        break;
      case 'sign':
        a = new Actor(Object.assign({ kind: 'prop', name: 'sign', bw: 14, bh: 6 }, o));
        a.interact = async () => { await Dlg.say(o.text); };
        break;
      case 'switch':
        a = new Actor(Object.assign({ kind: 'switch', solid: false, z: -1, area: { x: -8, y: -14, w: 16, h: 14 } }, o));
        a.isOn = () => hasFlag('sw_' + o.id);
        break;
      case 'spikes':
        a = new Actor(Object.assign({ kind: 'spikes', z: -1, tilesW: o.w || 1, tilesH: o.h || 1 }, o));
        a.isUp = () => !(o.down && o.down());
        a.bw = (o.w || 1) * 16; a.bh = (o.h || 1) * 16;
        a.box = () => ({ x: a.x, y: a.y - 16, w: a.bw, h: a.bh });
        a.solid = true;
        a.isSolidNow = () => a.isUp();
        break;
      case 'enemy': {
        if (hasFlag('foe_' + o.id)) return null;
        const { sprite, ...rest } = o;
        a = new Actor(Object.assign({ kind: 'enemy', sprite_: sprite || o.group[0], solid: false, seed: Math.random() * 10 | 0, state: 'idle', homeX: o.x, homeY: o.y }, rest));
        break;
      }
      default: // npc, kid, goomba, custom
        a = new Actor(Object.assign({ bw: 14, bh: 6 }, o));
        if (o.talk) a.interact = async () => {
          const old = a.facing;
          if (a.kind !== 'prop' && !a.lockFacing) a.facing = faceToward(a, this.player);
          await o.talk(a);
          if (!a.lockFacing && o.turnBack !== false) a.facing = old;
        };
    }
    if (o.interact) a.interact = o.interact;
    this.actors.push(a);
    if (o.name_) a.tag = o.name_;
    return a;
  },
  find(tag) { return this.actors.find((a) => a.tag === tag || a.id === tag); },
  remove(a) { const i = this.actors.indexOf(a); if (i >= 0) this.actors.splice(i, 1); },

  renderLayer() {
    const c = makeCanvas(this.cols * TS, this.rows * TS), g = c.getContext('2d');
    const at = (x, y) => (y < 0 || y >= this.rows || x < 0 || x >= this.cols ? '#' : this.map[y][x] || '#');
    for (let ty = 0; ty < this.rows; ty++) for (let tx = 0; tx < this.cols; tx++) this.ts.draw(g, at(tx, ty), tx * TS, ty * TS, tx, ty, at);
    if (this.def.paint) this.def.paint(g, c.width, c.height);
    return c;
  },
  tileAt(px, py) {
    const tx = Math.floor(px / TS), ty = Math.floor(py / TS);
    if (ty < 0 || ty >= this.rows || tx < 0 || tx >= this.cols) return '#';
    return this.map[ty][tx] || '#';
  },
  solidTile(ch) { return !this.ts.floor(ch) || ch === 'x'; },
  blocked(x, y, self) {
    const b = { x: x - (self ? self.bw / 2 : 6), y: y - (self ? self.bh : 5), w: self ? self.bw : 12, h: self ? self.bh : 5 };
    const pts = [[b.x, b.y], [b.x + b.w - 0.01, b.y], [b.x, b.y + b.h - 0.01], [b.x + b.w - 0.01, b.y + b.h - 0.01], [b.x + b.w / 2, b.y], [b.x + b.w / 2, b.y + b.h - 0.01]];
    for (const [px, py] of pts) if (this.solidTile(this.tileAt(px, py))) return true;
    for (const a of this.actors) {
      if (a === self || !a.solid || a.follower || a.isPlayer || a.kind === 'zone' || a.bw <= 0) continue;
      if (a.isSolidNow && !a.isSolidNow()) continue;
      if (U.overlap(b, a.box())) return true;
    }
    return false;
  },
  resetTrail(snap = false) {
    const lead = this.player;
    this.trail = [];
    const pts = [lead, ...this.followers];
    if (snap) {
      const back = { down: [0, -1], up: [0, 1], left: [1, 0], right: [-1, 0] }[lead.facing] || [0, -1];
      this.followers.forEach((f, i) => {
        const d = 18 * (i + 1);
        const tries = [[back[0] * d, back[1] * d], [back[1] * d, back[0] * d], [-back[1] * d, -back[0] * d], [back[0] * 10, back[1] * 10]];
        let fx = lead.x, fy = lead.y;
        for (const [ox, oy] of tries) { if (!this.blocked(lead.x + ox, lead.y + oy, f)) { fx = lead.x + ox; fy = lead.y + oy; break; } }
        f.x = fx; f.y = fy; f.facing = lead.facing;
      });
    }
    for (let k = 0; k < pts.length; k++) {
      const a = pts[k], b = pts[k + 1];
      if (!b) { this.trail.push({ x: a.x, y: a.y, facing: a.facing }); break; }
      for (let s = 0; s < FOLLOW_GAP; s++) {
        const t = s / FOLLOW_GAP;
        this.trail.push({ x: U.lerp(a.x, b.x, t), y: U.lerp(a.y, b.y, t), facing: b === lead ? a.facing : faceDir(b.x, b.y, a.x, a.y, a.facing) });
      }
    }
  },
  /* Transforma um NPC já na sala em seguidor do grupo (sem teleporte). */
  adopt(a) {
    if (!a) return;
    a.follower = true; a.solid = false; a.interact = null; a.kind = 'kid'; a.extra = '';
    if (!this.followers.includes(a)) this.followers.push(a);
    this.resetTrail();
  },
  setParty(ids) {
    // recria seguidores a partir do grupo atual
    for (const f of this.followers) this.remove(f);
    this.player.who = ids[0];
    this.followers = ids.slice(1).map((who) => {
      const a = new Actor({ kind: 'kid', who, x: this.player.x, y: this.player.y, facing: this.player.facing, follower: true, solid: false });
      this.actors.push(a); return a;
    });
    this.resetTrail(true);
  },

  update() {
    G.time++;
    for (const a of this.actors) { a.stepPath(); }
    const free = this.busy === 0 && !Dlg.active && !FieldMenu.active && !SaveMenu.active && !Banner.text && Game.mode === 'field';
    const p = this.player;
    let moved = false;
    if (free) {
      if (Input.take('menu')) { FieldMenu.open(); return; }
      let dx = (Input.h('right') ? 1 : 0) - (Input.h('left') ? 1 : 0);
      let dy = (Input.h('down') ? 1 : 0) - (Input.h('up') ? 1 : 0);
      const spd = Input.h('cancel') ? 3.5 : 2;
      if (dx || dy) {
        if (dx && !dy) p.facing = dx > 0 ? 'right' : 'left';
        else if (dy && !dx) p.facing = dy > 0 ? 'down' : 'up';
        else {
          const h = dx > 0 ? 'right' : 'left', v = dy > 0 ? 'down' : 'up';
          if (p.facing !== h && p.facing !== v) p.facing = v;
        }
        const ox = p.x, oy = p.y;
        // anda o máximo possível até encostar no obstáculo
        const tryMove = (ax, ay) => {
          for (let s = spd; s > 0.01; s -= 0.5) {
            if (!this.blocked(p.x + ax * s, p.y + ay * s, p)) { p.x += ax * s; p.y += ay * s; return; }
          }
        };
        if (dx) tryMove(dx, 0);
        if (dy) tryMove(0, dy);
        moved = p.x !== ox || p.y !== oy;
      }
      p.moving = moved;
      if (Input.take('confirm')) this.tryInteract();
    } else if (!p.path) p.moving = false;
    // rastro dos seguidores
    if (moved) {
      this.trail.unshift({ x: p.x, y: p.y, facing: p.facing });
      const max = (this.followers.length + 1) * FOLLOW_GAP + 2;
      if (this.trail.length > max) this.trail.length = max;
    }
    if (this.busy === 0 || moved) {
      this.followers.forEach((f, i) => {
        if (f.path) return;
        const t = this.trail[Math.min(this.trail.length - 1, (i + 1) * FOLLOW_GAP)];
        if (!t) return;
        f.moving = moved;
        f.x = t.x; f.y = t.y; f.facing = t.facing;
      });
    }
    for (const a of this.actors) a.animate();
    // zonas (saídas e gatilhos)
    if (free) {
      const pb = p.box();
      for (const a of this.actors) {
        if (a.kind !== 'zone') continue;
        if (!U.overlap(pb, { x: a.x, y: a.y, w: a.w, h: a.h })) continue;
        if (a.type === 'exit') { this.exitTo(a); break; }
        if (a.type === 'trigger' && this.triggersOn) {
          if (a.once && hasFlag(a.once)) continue;
          if (a.cond2 && !a.cond2()) continue;
          if (a.once) setFlag(a.once);
          this.run(a.run);
          break;
        }
      }
    }
    // inimigos
    for (const a of this.actors) if (a.kind === 'enemy' && !a.dead) this.updateEnemy(a, free);
    if (this.def.update) this.def.update(this);
    this.updateCamera();
    G.x = p.x; G.y = p.y; G.facing = p.facing;
  },
  updateEnemy(a, free) {
    const p = this.player;
    const d = U.dist(a.x, a.y, p.x, p.y);
    if (!free) { a.moving = false; return; }
    if (a.state === 'idle') {
      a.dy = Math.round(Math.sin(frame * 0.12 + a.seed) * 1.5);
      if (d < (a.sight || 90)) { a.state = 'notice'; a.t = 0; a.emote = { t: 14 }; Sfx.play('encounter'); }
    } else if (a.state === 'notice') {
      a.t++;
      if (a.t > 14) a.state = 'chase';
    } else if (a.state === 'chase') {
      const sp = a.speed || 1.6;
      const nx = a.x + ((p.x - a.x) / d) * sp, ny = a.y + ((p.y - a.y) / d) * sp;
      if (!this.blocked(nx, a.y, a)) a.x = nx;
      if (!this.blocked(a.x, ny, a)) a.y = ny;
      a.dy = -Math.abs(Math.round(Math.sin(frame * 0.5) * 2));
      if (d > (a.sight || 90) * 2.2) { a.state = 'return'; }
    } else if (a.state === 'return') {
      const hd = U.dist(a.x, a.y, a.homeX, a.homeY);
      if (hd < 2) { a.state = 'idle'; }
      else { a.x += ((a.homeX - a.x) / hd) * 1.2; a.y += ((a.homeY - a.y) / hd) * 1.2; }
      if (d < (a.sight || 90) * 0.8) a.state = 'chase';
    }
    if (d < 14 && a.state !== 'idle') this.encounter(a);
  },
  async encounter(a) {
    if (a.dead) return;
    a.dead = true;
    this.busy++;
    Sfx.play('battlestart');
    a.emote = { t: 10 };
    await wait(8);
    const ep = this.epoch;
    const res = await Battle.start({ enemies: a.group, music: a.music, from: a });
    if (ep !== this.epoch) return;
    if (res === 'lose') { this.busy = Math.max(0, this.busy - 1); return; }
    setFlag('foe_' + a.id);
    this.remove(a);
    this.busy = Math.max(0, this.busy - 1);
    if (a.after) await this.run(a.after);
  },
  tryInteract() {
    const p = this.player;
    const v = { down: [0, 1], up: [0, -1], left: [-1, 0], right: [1, 0] }[p.facing];
    const probe = { x: p.x + v[0] * 14 - 6, y: p.y - 4 + v[1] * 15 - 6, w: 12, h: 12 };
    let best = null, bd = 1e9;
    for (const a of this.actors) {
      if (!a.interact || a === p || a.follower || (!a.visible && a.kind !== 'look')) continue;
      const r = a.hitArea();
      if (!U.overlap(probe, r)) continue;
      const d = U.dist(p.x, p.y, a.x, a.y);
      if (d < bd) { bd = d; best = a; }
    }
    if (best) this.run(() => best.interact(best));
  },
  async run(fn) {
    const ep = this.epoch;
    this.busy++;
    try { await fn(); } catch (e) { console.error(e); }
    if (ep !== this.epoch) return;
    this.busy = Math.max(0, this.busy - 1);
    if (this.busy === 0) this.resetTrail();
  },
  async exitTo(z) {
    const ep = this.epoch;
    this.busy++;
    Sfx.play('door');
    await Fade.out(8);
    await this.goNow(z.to, z.tx, z.ty === 'same' ? this.player.y : z.ty, z.facing || this.player.facing);
    if (ep !== this.epoch) return;
    this.busy = Math.max(0, this.busy - 1);
    await Fade.in(8);
    this.enterRoom();
  },
  async goNow(id, x, y, facing) {
    this.load(id, x, y, facing);
    await wait(1);
  },
  /* Troca de sala com fade (usada em cutscenes). */
  async go(id, x, y, facing = 'down', frames = 10) {
    const ep = this.epoch;
    this.busy++;
    await Fade.out(frames);
    this.load(id, x, y, facing);
    await wait(2);
    await Fade.in(frames);
    if (ep !== this.epoch) return;
    this.busy = Math.max(0, this.busy - 1);
    this.enterRoom();
  },
  enterRoom() {
    const d = this.def;
    if (d.enter) this.run(d.enter);
  },
  updateCamera(snap) {
    const p = this.player;
    const rw = this.cols * TS, rh = this.rows * TS;
    let tx, ty;
    if (this.camLock) { tx = this.camLock.x - W / 2; ty = this.camLock.y - H / 2; }
    else { tx = p.x - W / 2; ty = p.y - 20 - H / 2; }
    tx = rw <= W ? (rw - W) / 2 : U.clamp(tx, 0, rw - W);
    ty = rh <= H ? (rh - H) / 2 : U.clamp(ty, 0, rh - H);
    if (snap || !this.camLock) { this.cam.x = tx; this.cam.y = ty; }
    else { this.cam.x = U.approach(this.cam.x, tx, 4); this.cam.y = U.approach(this.cam.y, ty, 4); }
  },
  screenY(a) { return a.y - this.cam.y; },
  draw(g) {
    const cx = Math.round(this.cam.x) - Shake.x, cy = Math.round(this.cam.y) - Shake.y;
    g.fillStyle = this.def.bgColor || '#000'; g.fillRect(0, 0, W, H);
    if (this.def.bg) this.def.bg(g, cx, cy);
    g.drawImage(this.layer, -cx, -cy);
    if (this.def.under) this.def.under(g, cx, cy);
    const vis = this.actors.filter((a) => a.visible && a.kind !== 'zone');
    vis.sort((a, b) => (a.z - b.z) || (a.y - b.y));
    for (const a of vis) a.draw(g, cx, cy);
    if (this.def.fg) this.def.fg(g, cx, cy);
  },
};
function faceDir(fx, fy, tx, ty, fallback = 'down') {
  const dx = tx - fx, dy = ty - fy;
  if (Math.abs(dx) < 0.01 && Math.abs(dy) < 0.01) return fallback;
  return Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up');
}
function faceToward(a, b) { return faceDir(a.x, a.y, b.x, b.y, a.facing); }
Dlg.autoPos = () => (Game.mode === 'field' && World.player && World.screenY(World.player) > 150 ? 'top' : 'bottom');

/* ---------- Atalhos para cutscenes ---------- */
const Cut = {
  say: (lines, opts) => Dlg.say(lines, opts),
  ask: (t, o, opts) => Dlg.ask(t, o, opts),
  wait: (n) => wait(n),
  actor: (tag) => World.find(tag),
  party: (who) => (World.player.who === who ? World.player : World.followers.find((f) => f.who === who)),
  async walk(a, x, y, speed = 2) { if (a) await a.walkTo(x, y, speed); },
  async walkAll(list) { await Promise.all(list.map(([a, x, y, s]) => (a ? a.walkTo(x, y, s || 2) : null))); },
  face(a, dir) { if (a) a.facing = typeof dir === 'string' ? dir : faceToward(a, dir); },
  emote(a, t = 18) { if (a) { a.emote = { t }; Sfx.play('encounter'); } },
  async camTo(x, y, frames = 30) {
    const from = { x: World.cam.x + W / 2, y: World.cam.y + H / 2 };
    World.camLock = { x: from.x, y: from.y };
    await tween(World.camLock, { x, y }, frames, Ease.inout);
  },
  camFree() { World.camLock = null; },
  async banner(t, c) { await Banner.show(t, c); },
  async join(who) {
    if (!G.party.includes(who)) G.party.push(who);
    G.hp[who] = maxHp(who);
    await Banner.show(`${MEMBERS[who].name} JOINED THE PARTY!`, MEMBERS[who].color);
  },
};
