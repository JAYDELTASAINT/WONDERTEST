'use strict';
/* Cenas: abertura, título, queda, lenda, loja do Butters, game over, retorno e créditos. */

const Scenes = {
  fountainK: 1,
  /* Executa uma cena de tela cheia: draw(g, t) por quadro até done() ser verdadeiro. */
  async custom(draw, frames, opts = {}) {
    const prev = Game.mode;
    Game.mode = 'custom';
    let t = 0;
    Game.customDraw = (g) => { draw(g, t); };
    await waitFor(() => { t++; return t >= frames || (opts.skippable && Input.take('cancel')); });
    Game.customDraw = null;
    Game.mode = opts.after || prev;
  },

  /* Queda pelo armário até o Mundo Sombrio */
  async fall() {
    Sfx.play('fall');
    const parts = Array.from({ length: 40 }, (_, i) => ({ x: U.rnd(0, W), y: U.rnd(0, H), s: U.rnd(2, 6) }));
    Fade.a = 0;
    await this.custom((g, t) => {
      g.fillStyle = '#000'; g.fillRect(0, 0, W, H);
      for (const p of parts) {
        p.y -= p.s; if (p.y < -10) { p.y = H + 10; p.x = U.rnd(0, W); }
        g.fillStyle = t > 70 ? '#8a4ac0' : '#5a5a7a';
        g.fillRect(Math.round(p.x), Math.round(p.y), 1, Math.round(p.s * 2));
      }
      const dark = t > 70;
      const y = -40 + Math.min(1, t / 90) * 150;
      const sway = Math.sin(t * 0.05) * 6;
      const s1 = Spr.kid('stan', dark, t % 40 < 20 ? 'down' : 'left', 0), s2 = Spr.kid('kyle', dark, t % 40 < 20 ? 'right' : 'down', 0);
      g.drawImage(s1, Math.round(130 + sway - s1.width / 2), Math.round(y));
      g.drawImage(s2, Math.round(186 - sway - s2.width / 2), Math.round(y + 14));
      if (t === 70) { Flash.go('#ffffff', 1); Sfx.play('bell'); }
      if (t > 120) { g.globalAlpha = Math.min(1, (t - 120) / 30); g.fillStyle = '#fff'; g.fillRect(0, 0, W, H); g.globalAlpha = 1; }
    }, 150);
    Fade.color = '#ffffff'; Fade.a = 1;
  },

  /* A lenda contada pelo Kenny */
  async legend() {
    const steps = [
      { img: 'fountain', text: 'QUANDO UM IMPERADOR GULOSO ABRIR A FONTE DA ESCURIDÃO...' },
      { img: 'trio', text: '...TRÊS HERÓIS VIRÃO PARA FECHÁ-LA.' },
      { img: 'stan', text: 'UM CAVALEIRO DE GORRO.' },
      { img: 'kyle', text: 'UM MAGO DE CHAPÉU VERDE.' },
      { img: 'kenny', text: 'E UM IMORTAL ENCAPUZADO.' },
      { img: 'trio2', text: 'JUNTOS, ELES TRARÃO O EQUILÍBRIO DE VOLTA.' },
    ];
    Music.play('intro', { fadeIn: 20 });
    await Fade.out(14);
    for (const s of steps) {
      const lines = Font.wrap(Font.parse(s.text), 30);
      const total = Font.count(lines);
      let shown = 0, t = 0, done = false;
      Fade.a = 0;
      const prev = Game.mode;
      Game.mode = 'custom';
      Game.customDraw = (g) => {
        g.fillStyle = '#000'; g.fillRect(0, 0, W, H);
        const a = Math.min(1, t / 20);
        g.globalAlpha = a;
        g.strokeStyle = '#ffffff'; g.lineWidth = 2; g.strokeRect(80, 24, 160, 120);
        g.fillStyle = '#0c0614'; g.fillRect(81, 25, 158, 118);
        g.save(); g.beginPath(); g.rect(81, 25, 158, 118); g.clip();
        this.legendImage(g, s.img, 160, 84, t);
        g.restore();
        g.globalAlpha = 1;
        Font.drawRich(g, lines, 160 - 15 * 8, 162, shown);
      };
      await waitFor(() => {
        t++;
        if (t > 20 && shown < total && t % 2 === 0) { shown++; Sfx.blip('narr'); }
        if (shown >= total) { if (Input.take('confirm') || t > 20 + total * 2 + 70) done = true; }
        else if (Input.take('cancel')) shown = total;
        return done;
      });
      Game.customDraw = null;
      Game.mode = prev;
    }
    await Fade.out(1);
    Music.play(World.def.music || 'field', { fadeIn: 20 });
    await Fade.in(16);
  },
  legendImage(g, kind, cx, cy, t) {
    const big = (img, x, y, s = 2) => g.drawImage(img, Math.round(x - (img.width * s) / 2), Math.round(y - (img.height * s) / 2), img.width * s, img.height * s);
    if (kind === 'fountain') {
      drawFountain(g, cx, cy + 30, 1);
      const p = new Painter(20, 14); drawCrown(p, 10, 12, 12);
      big(p.c, cx, cy - 40 + Math.sin(t * 0.08) * 2, 2);
    } else if (kind === 'trio' || kind === 'trio2') {
      const ids = ['kyle', 'stan', 'kenny'];
      ids.forEach((id, i) => {
        const img = Spr.kid(id, true, 'down', 0);
        const s = kind === 'trio' ? silhouetteCached(img, '#ffffff') : img;
        big(s, cx - 44 + i * 44, cy + 10, 2);
      });
      if (kind === 'trio2') for (let i = 0; i < 8; i++) { const a = t * 0.02 + (i * Math.PI) / 4; g.fillStyle = '#ffff80'; g.fillRect(Math.round(cx + Math.cos(a) * 60), Math.round(cy + Math.sin(a) * 40), 2, 2); }
    } else {
      big(Spr.battle(kind, 'victory', 0), cx + 12, cy + 4, 2);
    }
  },

  /* Volta ao Mundo da Luz depois de selar a fonte */
  async lightReturn() {
    G.dark = false;
    setFlag('ending');
    const party = G.party.slice();
    G.party = ['stan'];
    World.load('corredor', 452, 150, 'down');
    G.party = party;
    const p = World.player;
    p.visible = false;
    Music.stop();
    const lay = [['stan', 452, 150], ['kyle', 420, 162], ['kenny', 484, 166], ['cartman', 392, 140]];
    const lying = lay.map(([who, x, y]) => World.addObject({ type: 'img', kind: 'img', img: Spr.get('lyingL:' + who, () => rotate90(Spr.kid(who, false, 'down', 0), false)), x, y, solid: false }));
    Fade.color = '#ffffff';
    await Fade.to(0, 50);
    await wait(30);
    const mack = World.addObject({ type: 'npc', kind: 'npc', who: 'mackey', x: 300, y: 140, facing: 'right', name_: 'mackey2' });
    await Cut.walk(mack, 360, 140, 1.5);
    await Dlg.say([
      'mackey/surprised: Garotos?! O que vocês estão fazendo deitados no chão do armário, m\'kay?',
    ]);
    const kids = {};
    lay.forEach(([who, x, y], i) => {
      World.remove(lying[i]);
      if (who === 'stan') { p.x = x; p.y = y; p.visible = true; p.facing = 'left'; kids.stan = p; }
      else kids[who] = World.addObject(kidObj(who, x, y, 'left', { bw: who === 'cartman' ? 22 : 14 }));
    });
    Sfx.play('appear');
    await wait(16);
    await Dlg.say([
      'cartman/annoyed: Eu tava... é... fazendo um trabalho da escola.',
      'mackey: Um trabalho no armário de materiais, m\'kay?',
      'cartman/smug: É um trabalho sobre... esfregões.',
      'mackey: ...M\'kay. Vão pra casa, garotos. A aula acabou faz tempo.',
      'kyle/surprised: Já é de tarde?!',
    ]);
    await Fade.out(30);
    World.load('ponto', 210, 170, 'down');
    G.party = ['stan'];
    World.setParty(['stan']);
    G.party = party;
    await wait(2);
    await Fade.in(30);
    await endingBusStop();
  },

  /* Créditos e epílogo */
  async credits() {
    Music.play('ending');
    const lines = [
      ['SOUTHRUNE', '#ffffff', 2], ['Capítulo 1: A Fonte do Imperador', '#ffff00'], [''],
      ['Um jogo de fã sem fins lucrativos.'], [''],
      ['Inspirado em DELTARUNE, de Toby Fox.'], ['South Park foi criado por'], ['Trey Parker e Matt Stone.'], ['Goomba é um personagem da Nintendo.'], [''],
      ['ELENCO', '#ffff00'],
      ['STAN ........ Cavaleiro de Gorro'], ['KYLE ........ Mago de Chapéu Verde'], ['KENNY ....... Imortal Encapuzado'], ['CARTMAN ..... o Imperador'], ['SIR GOOMBA .. Cavaleiro da Capa'],
      ['BUTTERS ..... Lojista'], ['SR. MACKEY .. Orientador, m\'kay'], ['MANBEARPIG .. super cereal'], [''],
      ['Roteiro, arte, música e código'], ['feitos com Claude (Anthropic).'], ['Texto em GNU Unifont.'], [''],
      ['OBRIGADO POR JOGAR!', '#ff9a1f'],
    ];
    const ys = [];
    let acc = 0;
    for (const [, , sc = 1] of lines) { ys.push(acc); acc += 18 * sc + (sc > 1 ? 6 : 0); }
    const total = acc + H + 40;
    await Fade.to(0, 1);
    await this.custom((g, t) => {
      g.fillStyle = '#000'; g.fillRect(0, 0, W, H);
      const y0 = H - t * 0.55;
      lines.forEach(([txt, col = '#ffffff', sc = 1], i) => {
        const y = y0 + ys[i];
        if (y < -40 || y > H + 10) return;
        Font.draw(g, txt, W / 2, y, col, { align: 'center', scale: sc });
      });
      const k = Math.floor(t / 20) % 2;
      g.drawImage(Spr.goombaField(k ? 2 : 3), 8 + ((t * 0.4) % (W + 40)) - 20, H - 40);
    }, Math.round(total / 0.55), { skippable: true });
    // epílogo
    Music.stop(20);
    await this.custom((g, t) => {
      g.fillStyle = '#000'; g.fillRect(0, 0, W, H);
      const a = Math.min(1, t / 40);
      g.globalAlpha = a;
      Font.draw(g, '* Mais tarde, naquela noite...', W / 2, 60, '#ffffff', { align: 'center' });
      if (t > 80) {
        g.drawImage(Spr.prop('closetOpen'), 147, 100);
        if (Math.floor(t / 10) % 3 === 0) { g.fillStyle = '#8a4ac0'; g.fillRect(150, 141, 20, 2); }
        if (t > 150) Font.draw(g, '* (A porta do armário rangeu sozinha.)', W / 2, 160, '#c0c0c0', { align: 'center' });
      }
      if (t > 230) Font.draw(g, 'CAPÍTULO 2: EM BREVE?', W / 2, 200, '#ffff00', { align: 'center' });
      g.globalAlpha = 1;
    }, 330, { skippable: true });
    await Fade.out(30);
    Store.set('southrune_cleared', true);
    Game.toTitle();
  },
};

/* ---------- Prólogo (estilo "VOCÊ ESTÁ AÍ?") ---------- */
const Intro = {
  lines: ['ESTÁ ME OUVINDO?', 'ÓTIMO.', 'ESTA É UMA CIDADEZINHA TRANQUILA, LÁ NAS MONTANHAS.', 'ONDE NADA DE ESTRANHO ACONTECE.', '(QUASE NADA.)', 'MAS HOJE, DENTRO DE UM ARMÁRIO ESCURO...', 'UMA FONTE DE ESCURIDÃO SE ABRIU.', 'E ALGUÉM VAI PRECISAR FECHÁ-LA.'],
  i: 0, t: 0, shown: 0,
  enter() { this.i = 0; this.t = 0; this.shown = 0; this.prep(); Music.play('intro'); Fade.a = 0; },
  prep() { this.wrapped = Font.wrap(Font.parse(this.lines[this.i]), 30); this.total = Font.count(this.wrapped); this.shown = 0; this.t = 0; },
  update() {
    this.t++;
    if (Input.take('menu')) { Game.toTitle(); return; }
    if (this.shown < this.total) {
      if (this.t % 3 === 0) { this.shown++; Sfx.blip('narr'); }
      if (Input.take('cancel')) this.shown = this.total;
    } else if (Input.take('confirm') || this.t > this.total * 3 + 80) {
      this.i++;
      if (this.i >= this.lines.length) { Game.toTitle(); return; }
      this.prep();
    }
  },
  draw(g) {
    g.fillStyle = '#000'; g.fillRect(0, 0, W, H);
    const n = this.wrapped.length;
    Font.drawRich(g, this.wrapped, 160 - 15 * 8, 112 - n * 8, this.shown);
    Mini.draw(g, 'C: PULAR', W - 6, H - 10, '#4a4a5a', { align: 'right' });
  },
};

/* ---------- Tela de título ---------- */
const Title = {
  idx: 0, t: 0, opts: [], conf: false,
  enter() {
    this.t = 0; this.idx = 0; this.conf = false;
    this.opts = Save.exists() ? ['CONTINUAR', 'NOVO JOGO', 'CONFIG'] : ['COMEÇAR', 'CONFIG'];
    Music.play('intro', { fadeIn: 30 });
    Fade.a = 1; Fade.in(30);
  },
  update() {
    this.t++;
    if (this.conf) { this.updateConf(); return; }
    if (this.t < 20) return;
    if (Input.take('up') && this.idx > 0) { this.idx--; Sfx.play('move'); }
    if (Input.take('down') && this.idx < this.opts.length - 1) { this.idx++; Sfx.play('move'); }
    if (Input.take('confirm')) {
      const o = this.opts[this.idx];
      Sfx.play('select');
      if (o === 'CONFIG') { this.conf = true; this.cidx = 0; return; }
      if (o === 'CONTINUAR') Game.continueGame();
      else if (o === 'NOVO JOGO') { this.confirmNew = true; Game.newGameFlow(); }
      else Game.newGameFlow();
    }
  },
  updateConf() {
    const n = 4;
    if (Input.take('up') && this.cidx > 0) { this.cidx--; Sfx.play('move'); }
    if (Input.take('down') && this.cidx < n - 1) { this.cidx++; Sfx.play('move'); }
    const lr = (Input.take('right') ? 1 : 0) - (Input.take('left') ? 1 : 0);
    if (lr && this.cidx <= 1) {
      const k = this.cidx === 0 ? 'master' : 'music';
      Sfx.vol[k] = U.clamp(Math.round((Sfx.vol[k] + lr * 0.1) * 10) / 10, 0, 1); Sfx.applyVolume(); Sfx.play('move'); Game.saveConf();
    }
    if (Input.take('confirm')) {
      if (this.cidx === 2) { Game.conf.touch = (Game.conf.touch + 1) % 3; Game.applyConf(); Sfx.play('select'); }
      if (this.cidx === 3) { this.conf = false; Sfx.play('cancel'); }
    }
    if (Input.take('cancel')) { this.conf = false; Sfx.play('cancel'); }
  },
  drawLogo(g, cx, cy) {
    const t = this.t;
    // emblema: círculo com asas e montanhas (a "Runa do Sul")
    g.save();
    g.globalAlpha = 0.9;
    g.strokeStyle = '#ffffff'; g.lineWidth = 1;
    g.beginPath(); g.arc(cx, cy - 46, 12, 0, Math.PI * 2); g.stroke();
    g.fillStyle = '#ffffff';
    g.beginPath(); g.moveTo(cx - 9, cy - 40); g.lineTo(cx - 3, cy - 50); g.lineTo(cx, cy - 46); g.lineTo(cx + 4, cy - 52); g.lineTo(cx + 9, cy - 40); g.closePath(); g.fill();
    for (const s of [-1, 1]) {
      g.beginPath(); g.moveTo(cx + s * 13, cy - 48); g.lineTo(cx + s * 34, cy - 58); g.lineTo(cx + s * 30, cy - 50); g.lineTo(cx + s * 38, cy - 50); g.lineTo(cx + s * 30, cy - 44); g.lineTo(cx + s * 14, cy - 43); g.closePath(); g.fill();
    }
    g.drawImage(ICON.soul, cx - 4, cy - 30);
    g.restore();
    Font.draw(g, 'SOUTHRUNE', cx + 2, cy - 18 + 2, '#3a1d5c', { align: 'center', scale: 3 });
    Font.draw(g, 'SOUTHRUNE', cx, cy - 18, '#ffffff', { align: 'center', scale: 3 });
    Font.draw(g, 'CAPÍTULO 1: A FONTE DO IMPERADOR', cx, cy + 28, '#c0c0d0', { align: 'center' });
    void t;
  },
  draw(g) {
    g.fillStyle = '#000'; g.fillRect(0, 0, W, H);
    // partículas subindo (como pó de escuridão)
    for (let i = 0; i < 40; i++) {
      const x = (U.hash(i, 3) * W + Math.sin(this.t * 0.01 + i) * 10 + W) % W;
      const y = H - ((this.t * (0.2 + U.hash(i, 4) * 0.5) + U.hash(i, 5) * H) % (H + 20));
      g.fillStyle = i % 4 === 0 ? '#8a4ac0' : '#3a1d5c';
      g.fillRect(Math.round(x), Math.round(y), 1, 2);
    }
    // silhuetas dos heróis
    const heads = ['stan', 'kyle', 'kenny', 'cartman'];
    heads.forEach((h, i) => {
      const img = Spr.kid(h, true, 'down', 0);
      g.globalAlpha = 0.35;
      g.drawImage(silhouetteCached(img, '#3a1d5c'), 52 + i * 62 - img.width / 2, 178 - img.height);
      g.globalAlpha = 1;
    });
    this.drawLogo(g, W / 2, 92);
    if (this.conf) { this.drawConf(g); return; }
    this.opts.forEach((o, i) => {
      const y = 152 + i * 18;
      Font.draw(g, o, W / 2, y, i === this.idx ? '#ffff00' : '#ffffff', { align: 'center' });
      if (i === this.idx) UI.heart(g, W / 2 - Font.width(o) / 2 - 14, y + 5);
    });
    if (Save.exists() && this.opts[this.idx] === 'CONTINUAR') {
      const s = Save.info();
      Mini.draw(g, `${(s.saveRoomName || '').toUpperCase().slice(0, 34)}  ${fmtTime(s.time || 0)}`, W / 2, 210, '#8a8aa0', { align: 'center' });
    }
    Mini.draw(g, 'JOGO DE FÃ NÃO OFICIAL - INSPIRADO EM DELTARUNE', W / 2, H - 14, '#5a5a6a', { align: 'center' });
  },
  drawConf(g) {
    UI.box(g, 40, 140, 240, 88, 'dark');
    const touchLbl = ['AUTOMÁTICO', 'SEMPRE', 'NUNCA'][Game.conf.touch];
    const rows = [['Volume geral', `< ${Math.round(Sfx.vol.master * 100)}% >`], ['Música', `< ${Math.round(Sfx.vol.music * 100)}% >`], ['Controles na tela', touchLbl], ['Voltar', '']];
    rows.forEach(([a, b], i) => {
      const y = 148 + i * 18;
      Font.draw(g, a, 66, y, i === this.cidx ? '#ffff00' : '#fff');
      Font.draw(g, b, 270, y, '#fff', { align: 'right' });
      if (i === this.cidx) UI.heart(g, 52, y + 5);
    });
  },
};

/* ---------- Tela de toque inicial (libera o áudio) ---------- */
const Boot = {
  t: 0,
  update() { this.t++; if (this.t > 10 && Input.takeAny()) { Sfx.unlock(); Game.afterBoot(); } },
  draw(g) {
    g.fillStyle = '#000'; g.fillRect(0, 0, W, H);
    g.drawImage(ICON.soul, W / 2 - 4, 92 + Math.round(Math.sin(this.t * 0.08) * 2));
    const msg = Touch.enabled ? 'TOQUE PARA COMEÇAR' : 'CLIQUE OU APERTE Z PARA COMEÇAR';
    if (Math.floor(this.t / 25) % 2 === 0) Font.draw(g, msg, W / 2, 118, '#ffffff', { align: 'center' });
    Mini.draw(g, 'USE FONES DE OUVIDO PARA A MELHOR EXPERIÊNCIA', W / 2, 150, '#5a5a6a', { align: 'center' });
  },
};

/* ---------- Game Over ---------- */
const GameOver = {
  t: 0, x: 0, y: 0, phase: 0, shards: [], idx: 0, resolve: null,
  run(x, y) {
    return new Promise((res) => {
      this.resolve = res;
      this.x = x; this.y = y; this.t = 0; this.phase = 0; this.idx = 0; this.shards = [];
      Music.stop();
      Game.mode = 'gameover';
    });
  },
  update() {
    this.t++;
    if (this.phase === 0 && this.t === 25) { Sfx.play('crack'); this.phase = 1; }
    if (this.phase === 1 && this.t === 60) {
      Sfx.play('shatter'); this.phase = 2;
      for (let i = 0; i < 7; i++) this.shards.push({ x: this.x, y: this.y, vx: U.rnd(-2.2, 2.2), vy: U.rnd(-3.5, -1), r: Math.random() * 6 });
    }
    if (this.phase === 2) for (const s of this.shards) { s.x += s.vx; s.y += s.vy; s.vy += 0.15; s.r += 0.2; }
    if (this.phase === 2 && this.t === 110) { this.phase = 3; Music.play('gameover'); }
    if (this.phase === 3 && this.t > 170) this.phase = 4;
    if (this.phase === 4) {
      if (Input.take('left') || Input.take('right')) { this.idx = 1 - this.idx; Sfx.play('move'); }
      if (Input.take('confirm')) {
        Sfx.play('select');
        if (this.idx === 0) { this.phase = 6; Game.retryBattle(); }
        else { this.phase = 5; this.t2 = 0; Music.stop(30); }
      }
    }
    if (this.phase === 5) { this.t2++; if (this.t2 > 140 || (this.t2 > 30 && Input.take('confirm'))) { this.phase = 6; Game.toTitle(); } }
  },
  draw(g) {
    g.fillStyle = '#000'; g.fillRect(0, 0, W, H);
    if (this.phase <= 1) {
      if (this.phase === 0) g.drawImage(ICON.soul, Math.round(this.x - 4), Math.round(this.y - 3));
      else {
        g.save(); g.beginPath(); g.rect(0, 0, Math.round(this.x), H); g.clip(); g.drawImage(ICON.soul, Math.round(this.x - 5), Math.round(this.y - 3)); g.restore();
        g.save(); g.beginPath(); g.rect(Math.round(this.x), 0, W, H); g.clip(); g.drawImage(ICON.soul, Math.round(this.x - 3), Math.round(this.y - 3)); g.restore();
      }
    } else if (this.phase === 2) {
      for (const s of this.shards) { g.fillStyle = '#ff0000'; g.fillRect(Math.round(s.x), Math.round(s.y), 2, 2); g.fillRect(Math.round(s.x + 1), Math.round(s.y - 1), 1, 1); }
    }
    if (this.phase >= 3 && this.phase < 5) {
      const a = Math.min(1, (this.t - 110) / 50);
      g.globalAlpha = a;
      Font.draw(g, 'GAME', W / 2, 46, '#ffffff', { align: 'center', scale: 4 });
      Font.draw(g, 'OVER', W / 2, 102, '#ffffff', { align: 'center', scale: 4 });
      g.globalAlpha = 1;
    }
    if (this.phase === 4) {
      Font.draw(g, 'CONTINUAR?', W / 2, 176, '#ffffff', { align: 'center' });
      ['SIM', 'NÃO'].forEach((o, i) => {
        const x = W / 2 - 44 + i * 88;
        Font.draw(g, o, x, 198, i === this.idx ? '#ffff00' : '#ffffff', { align: 'center' });
        if (i === this.idx) UI.heart(g, x - 26, 203);
      });
    }
    if (this.phase === 5) {
      const a = Math.min(1, this.t2 / 40);
      g.globalAlpha = a;
      Font.draw(g, 'O MUNDO FOI COBERTO', W / 2, 100, '#ffffff', { align: 'center' });
      Font.draw(g, 'PELA ESCURIDÃO...', W / 2, 120, '#ffffff', { align: 'center' });
      g.globalAlpha = 1;
    }
  },
};

/* ---------- Loja do Butters ---------- */
const SHOP_STOCK = ['cheesy', 'snacky', 'choco', 'bandaid', 'bala', 'gorro'];
const SHOP_PRICE = { cheesy: 30, snacky: 60, choco: 50, bandaid: 15, bala: 80, gorro: 40 };
const Shop = {
  mode: 'menu', idx: 0, resolve: null, expr: 'happy', t: 0, note: null,
  open() {
    return new Promise((res) => {
      this.resolve = res;
      Game.mode = 'shop';
      this.mode = 'menu'; this.idx = 0; this.t = 0; this.note = null;
      Music.play('shop');
      this.setText(hasFlag('shop_met') ? '* Olá de novo, amigos! O que vão querer?' : '* Ah, olá, amigos! Bem-vindos à {y}Loja do Butters{w}!\n* Eu caí aqui ontem e resolvi abrir um negócio!');
      setFlag('shop_met');
    });
  },
  setText(t, expr = 'happy') { this.lines = Font.wrap(Font.parse(t), 22); this.total = Font.count(this.lines); this.shown = 0; this.expr = expr; },
  say(t, expr = 'happy') { this.note = { lines: Font.wrap(Font.parse(t), 13), t: 0 }; this.expr = expr; },
  close() {
    Game.mode = 'field';
    Music.play(World.def.music);
    const r = this.resolve; this.resolve = null; if (r) r();
  },
  back(text = '* Mais alguma coisa?') { this.mode = 'menu'; this.note = null; this.setText(text); },
  update() {
    this.t++;
    if (this.note) this.note.t++;
    if (this.shown < this.total) {
      this.shown++;
      if (this.shown % 2 === 0) Sfx.blip('butters');
      if (Input.take('cancel') || Input.take('confirm')) this.shown = this.total;
      if (this.mode !== 'buy' && this.mode !== 'sell') return;
    }
    switch (this.mode) {
      case 'menu': {
        this.idx = UI.nav(this.idx, 4, 1);
        if (Input.take('cancel')) { this.bye(); break; }
        if (!Input.take('confirm')) break;
        Sfx.play('select');
        if (this.idx === 0) { this.mode = 'buy'; this.sel = 0; this.note = null; }
        else if (this.idx === 1) {
          if (!G.items.length) { Sfx.play('error'); this.setText('* Você não tem nada pra vender, amigo.', 'sad'); }
          else { this.mode = 'sell'; this.sel = 0; this.note = null; }
        } else if (this.idx === 2) { this.mode = 'talk'; this.sel = 0; }
        else this.bye();
        break;
      }
      case 'buy': {
        this.sel = UI.nav(this.sel, SHOP_STOCK.length + 1, 1);
        if (Input.take('cancel')) { Sfx.play('cancel'); this.back(); break; }
        if (!Input.take('confirm')) break;
        if (this.sel === SHOP_STOCK.length) { Sfx.play('cancel'); this.back(); break; }
        const id = SHOP_STOCK[this.sel], price = SHOP_PRICE[id];
        if (G.money < price) { Sfx.play('error'); this.say('* Ah, puxa... falta dinheiro.', 'sad'); }
        else if (G.items.length >= 12) { Sfx.play('error'); this.say('* Seus bolsos estão cheios!', 'worried'); }
        else { G.money -= price; addItem(id); Sfx.play('item'); this.say(U.pick(['* Obrigado! Ah, hambúrgueres!', '* Valeu! Volte sempre!', '* Uau, um cliente de verdade!'])); }
        break;
      }
      case 'sell': {
        if (!G.items.length) { this.back(); break; }
        this.sel = UI.nav(this.sel, G.items.length, 1);
        if (Input.take('cancel')) { Sfx.play('cancel'); this.back(); break; }
        if (!Input.take('confirm')) break;
        const id = G.items[this.sel], val = ITEMS[id].sell || 5;
        removeItemAt(this.sel); G.money += val; Sfx.play('item');
        this.say(`* Fechado! Aqui estão ${val} D$.`);
        this.sel = Math.max(0, Math.min(this.sel, G.items.length - 1));
        break;
      }
      case 'talk': {
        const topics = this.topics();
        this.sel = UI.nav(this.sel, topics.length, 1);
        if (Input.take('cancel')) { Sfx.play('cancel'); this.back(); break; }
        if (!Input.take('confirm')) break;
        Sfx.play('select');
        const tp = topics[this.sel];
        if (tp.back) { this.back(); break; }
        this.mode = 'talkText';
        this.setText(tp.text, tp.expr || 'happy');
        break;
      }
      case 'talkText': if (Input.take('confirm') || Input.take('cancel')) { this.mode = 'talk'; this.expr = 'happy'; } break;
      case 'bye': this.byeT++; if (this.byeT > 20 && (Input.take('confirm') || this.byeT > 100)) this.close(); break;
      default: break;
    }
  },
  bye() { this.mode = 'bye'; this.byeT = 0; this.note = null; this.setText('* Volte sempre! E... não conta pros meus pais, tá?'); },
  topics() {
    return [
      { name: 'Sobre você', text: '* Eu caí aqui ontem procurando o meu hamster.\n* Se os meus pais souberem, eu vou ficar de CASTIGO!', expr: 'worried' },
      { name: 'Mundo Sombrio', text: '* Aqui é tudo escuro e roxo... mas os salgadinhos falam!\n* Isso é bem legal, né?' },
      { name: 'O Cartman', text: '* O Eric disse que agora é imperador.\n* Ele me fez assinar um contrato de "súdito leal". Eu nem sei o que é súdito.', expr: 'worried' },
      { name: 'O Goomba', text: '* Ele é muito educado! Sempre pede "por favor" antes de gritar HO HO HO.' },
      { name: 'Voltar', back: true },
    ];
  },
  draw(g) {
    g.fillStyle = '#10183a'; g.fillRect(0, 0, W, 128);
    for (let x = 0; x < W; x += 32) { g.fillStyle = '#1a2a5a'; g.fillRect(x, 0, 16, 128); }
    g.fillStyle = '#f6c832'; g.fillRect(0, 0, W, 4);
    g.fillStyle = '#5a3a1c'; g.fillRect(20, 44, 90, 4); g.fillRect(210, 44, 90, 4);
    g.drawImage(Spr.prop('bag'), 30, 10); g.drawImage(Spr.prop('bag'), 70, 10);
    g.drawImage(bspr('bucket'), 222, 26); g.drawImage(bspr('cup'), 252, 34); g.drawImage(bspr('puff'), 278, 32);
    const b = Spr.npc('butters', Math.floor(this.t / 30) % 2, this.expr);
    g.drawImage(b, 160 - b.width, 22, b.width * 2, b.height * 2);
    g.fillStyle = '#8a5a2c'; g.fillRect(60, 96, 200, 32); g.fillStyle = '#a06a34'; g.fillRect(60, 96, 200, 4);
    Font.draw(g, 'LOJA DO BUTTERS', 160, 106, '#f6c832', { align: 'center', outline: '#3a2010' });
    UI.box(g, 0, 128, 196, 112, 'dark');
    UI.box(g, 196, 128, 124, 112, 'dark');
    if (this.mode === 'buy') this.drawList(g, SHOP_STOCK.map((id) => [ITEMS[id].name, `${SHOP_PRICE[id]}`]).concat([['Sair', '']]), this.sel);
    else if (this.mode === 'sell') this.drawList(g, G.items.map((id) => [ITEMS[id].name, `${ITEMS[id].sell || 5}`]), this.sel);
    else if (this.mode === 'talk') this.drawList(g, this.topics().map((t) => [t.name, '']), this.sel);
    else Font.drawRich(g, this.lines, 12, 138, this.shown);
    if (this.mode === 'menu' || this.mode === 'bye' || this.mode === 'talkText') {
      ['COMPRAR', 'VENDER', 'CONVERSAR', 'SAIR'].forEach((o, i) => {
        const on = i === this.idx && this.mode === 'menu';
        Font.draw(g, o, 222, 140 + i * 18, on ? '#ffff00' : '#ffffff');
        if (on) UI.heart(g, 208, 145 + i * 18);
      });
    } else if (this.note && this.note.t < 90) {
      Font.drawRich(g, this.note.lines, 206, 138, Infinity);
    } else {
      const id = this.mode === 'buy' ? SHOP_STOCK[this.sel] : this.mode === 'sell' ? G.items[this.sel] : null;
      if (id) Font.block(g, ITEMS[id].desc, 206, 138, 13, { color: '#c0c0c0' });
    }
    Font.draw(g, `D$ ${G.money}`, 206, 216, '#ffffff');
    Mini.draw(g, `${G.items.length}/12`, 310, 224, '#8a8aa0', { align: 'right' });
  },
  drawList(g, rows, sel) {
    rows.forEach(([a, b], i) => {
      const y = 136 + i * 16;
      if (y > 222) return;
      Font.draw(g, a, 26, y, i === sel ? '#ffff00' : '#ffffff');
      if (b) Font.draw(g, b, 184, y, '#ffffff', { align: 'right' });
      if (i === sel) UI.heart(g, 12, y + 5);
    });
  },
};
