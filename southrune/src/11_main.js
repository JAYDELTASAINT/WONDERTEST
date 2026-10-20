'use strict';
/* Gerenciador do jogo: modos, laço principal, salvar/continuar, nova tentativa e configurações. */

const Game = {
  mode: 'boot', customDraw: null, retry: null,
  conf: { touch: 0 },
  hot: null,

  init(hotData) {
    Screen.init();
    Font.init(); Mini.init(); buildIcons();
    Input.init(); Touch.init();
    const c = Store.get(CONF_KEY);
    if (c) {
      if (typeof c.touch === 'number') this.conf.touch = c.touch;
      if (c.vol) Object.assign(Sfx.vol, c.vol);
    }
    this.applyConf();
    this.hot = hotData && hotData.save ? hotData : null;
    this.mode = 'boot';
    const fs = document.getElementById('fs');
    if (fs) fs.addEventListener('click', (e) => { e.preventDefault(); this.toggleFullscreen(); });
    let last = performance.now(), acc = 0;
    const loop = (now) => {
      requestAnimationFrame(loop);
      let dt = now - last; last = now;
      if (dt > 250) dt = 250;
      acc += dt;
      let n = 0;
      while (acc >= STEP_MS && n < 4) { acc -= STEP_MS; this.tick(); n++; }
      if (n) this.draw();
    };
    requestAnimationFrame(loop);
  },
  afterBoot() {
    if (this.hot) { const d = this.hot; this.hot = null; newGame(); Object.assign(G, JSON.parse(JSON.stringify(d.save))); this.enterField(G.room, G.x, G.y, G.facing); return; }
    if (Store.get('southrune_seen_intro')) this.toTitle();
    else { Store.set('southrune_seen_intro', true); this.mode = 'intro'; Intro.enter(); }
  },
  tick() {
    Input.update();
    frame++;
    Shake.update(); Flash.update();
    if (Dlg.active) Dlg.update();
    else if (Banner.text) Banner.update();
    else if (SaveMenu.active) SaveMenu.update();
    else if (FieldMenu.active) FieldMenu.update();
    switch (this.mode) {
      case 'boot': Boot.update(); break;
      case 'intro': Intro.update(); break;
      case 'title': Title.update(); break;
      case 'field': World.update(); break;
      case 'battle': Battle.update(); break;
      case 'shop': Shop.update(); break;
      case 'gameover': GameOver.update(); break;
      default: break;
    }
    _tickTweens();
    _tickWaiters();
    Music.update();
  },
  draw() {
    const g = Screen.ctx;
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.globalAlpha = 1;
    switch (this.mode) {
      case 'boot': Boot.draw(g); break;
      case 'intro': Intro.draw(g); break;
      case 'title': Title.draw(g); break;
      case 'field': World.draw(g); break;
      case 'battle': Battle.draw(g); break;
      case 'shop': Shop.draw(g); break;
      case 'gameover': GameOver.draw(g); break;
      case 'custom': if (this.customDraw) this.customDraw(g); else { g.fillStyle = '#000'; g.fillRect(0, 0, W, H); } break;
      default: g.fillStyle = '#000'; g.fillRect(0, 0, W, H);
    }
    Banner.draw(g);
    SaveMenu.draw(g);
    FieldMenu.draw(g);
    Dlg.draw(g);
    Fade.draw(g);
    Flash.draw(g);
    Screen.present();
  },
  resetUI() {
    Dlg.active = false; Dlg.resolve = null; Dlg.queue = [];
    Banner.text = null; Banner.resolve = null;
    SaveMenu.active = false; FieldMenu.active = false;
    Battle.active = false; this.customDraw = null;
    World.busy = 0; World.epoch++; World.camLock = null;
    Scenes.fountainK = 1;
    Input.clear();
  },
  toTitle() {
    abandonAsync();
    this.resetUI();
    Music.stop(10);
    this.mode = 'title';
    Fade.color = '#000';
    Title.enter();
  },
  async newGameFlow() {
    Music.stop(20);
    await Fade.out(20);
    newGame();
    this.resetUI();
    this.enterField('ponto', 214, 170, 'right', true);
  },
  async continueGame() {
    Music.stop(20);
    await Fade.out(20);
    if (!Save.load()) { this.toTitle(); return; }
    this.resetUI();
    this.enterField(G.room, G.x, G.y, G.facing, false);
  },
  enterField(room, x, y, facing, runEnter) {
    this.mode = 'field';
    Fade.color = '#000'; Fade.a = 1;
    World.load(room, x, y, facing);
    Fade.in(24);
    if (runEnter) World.enterRoom();
  },
  /* GAME OVER → "SIM": volta ao momento em que a batalha começou. */
  retryBattle() {
    const r = this.retry;
    abandonAsync();
    this.resetUI();
    if (!r) { this.toTitle(); return; }
    newGame();
    Object.assign(G, JSON.parse(r.save));
    const pos = r.pos || [G.x, G.y];
    this.enterField(r.room, pos[0], pos[1], G.facing, false);
  },
  saveConf() { Store.set(CONF_KEY, { touch: this.conf.touch, vol: Sfx.vol }); },
  applyConf() {
    const on = this.conf.touch === 1 || (this.conf.touch === 0 && Touch.enabled);
    document.body.classList.toggle('touch', on);
    this.saveConf();
    Screen.layout();
  },
  toggleFullscreen() {
    const d = document, el = d.documentElement;
    try {
      if (d.fullscreenElement || d.webkitFullscreenElement) (d.exitFullscreen || d.webkitExitFullscreen).call(d);
      else (el.requestFullscreen || el.webkitRequestFullscreen).call(el).catch?.(() => {});
    } catch (e) { /* sem tela cheia neste aparelho */ }
    setTimeout(() => Screen.layout(), 300);
  },
  snapshot() { return this.mode === 'field' && G ? { save: JSON.parse(JSON.stringify(G)) } : {}; },
};

/* Retenta a batalha a partir de uma posição segura quando a cutscene pede. */
const _battleStart = Battle.start.bind(Battle);
Battle.start = function (cfg) {
  const p = _battleStart(cfg);
  if (Game.retry) { Game.retry.pos = cfg.retryAt || null; }
  return p;
};

/* ---------- Inicialização (com suporte ao recarregamento do visualizador) ---------- */
window.SR = {
  Game, World, Battle, Input, Sfx, Music, Scenes, Dlg,
  get G() { return G; },
  /* Atalhos de teste: SR.debug.start('campo2', 100, 104, { party: [...], flags: [...] }) */
  debug: {
    start(room, x, y, o = {}) {
      abandonAsync(); newGame(); Game.resetUI();
      if (o.party) G.party = o.party;
      for (const f of o.flags || []) setFlag(f);
      if (o.items) G.items = o.items.slice();
      if (o.money) G.money = o.money;
      G.dark = ROOMS[room].dark !== false;
      Game.enterField(room, x, y, o.facing || 'down', !!o.enter);
    },
    battle(enemies, cfg = {}) { return Battle.start(Object.assign({ enemies }, cfg)); },
  },
};
(function boot() {
  const hot = window.claude && window.claude.hot;
  try { if (hot && hot.snapshot) hot.snapshot(() => Game.snapshot()); } catch (e) { /* opcional */ }
  const start = (data) => Game.init(data || {});
  if (hot && hot.ready) hot.ready(start); else start((hot && hot.data) || {});
})();
