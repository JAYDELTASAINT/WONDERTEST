// Cenários de teste usados por tools/play.mjs (rodam no Chromium com Playwright).
const ALL_FLAGS = ['intro_done', 'mackey', 'fell', 'arrived', 'kenny_met', 'kenny_joined', 'tutorial_done', 'goomba_intro', 'puzzle_taunt'];
const PARTY = ['stan', 'kyle', 'kenny'];

async function waitMode(ctx, mode, ms = 8000) {
  const t0 = Date.now();
  while (Date.now() - t0 < ms) { const s = await ctx.state(); if (s && s.mode === mode) return true; await ctx.sleep(100); }
  return false;
}
async function waitIdle(ctx, ms = 15000, onDialog = true) {
  const t0 = Date.now();
  while (Date.now() - t0 < ms) {
    const s = await ctx.state();
    if (s.mode === 'field' && !s.dlg && s.busy === 0) return true;
    if (onDialog && s.dlg) await ctx.press('z', 1, 60); else await ctx.sleep(120);
  }
  return false;
}
/* Joga um turno inteiro de batalha só com LUTAR e acertando o minigame. */
async function fightTurn(ctx, n) {
  for (let i = 0; i < n; i++) { await ctx.press('z', 1, 120); await ctx.press('z', 1, 160); }
  for (let i = 0; i < n; i++) { await ctx.sleep(i === 0 ? 1250 : 380); await ctx.press('z', 1, 40); }
}

export default {
  async opening({ press, shot, sleep, state, advance }) {
    await shot('boot');
    await press('z');
    await sleep(900);
    await shot('intro');
    await press('c');
    await sleep(1200);
    await shot('title');
    await press('z');
    await sleep(1800);
    await shot('busstop_start');
    await press('z', 3, 300);
    await shot('dialog_kyle');
    await advance(40);
    await sleep(2500);
    await shot('after_intro');
  },

  async school(ctx) {
    const { ev, sleep, shot, press, hold, page } = ctx;
    await press('z'); await sleep(300);
    await ev(() => SR.debug.start('ponto', 214, 170, { facing: 'right', flags: ['intro_done'] }));
    await sleep(900);
    await shot('ponto_field');
    await page.keyboard.down('Shift'); await hold('ArrowRight', 2600); await page.keyboard.up('Shift');
    await sleep(900);
    await shot('escola');
    await hold('ArrowUp', 900); await hold('ArrowRight', 1200);
    await sleep(300);
    await shot('escola_walk');
    await ev(() => SR.debug.start('corredor', 212, 160, { facing: 'up', flags: ['intro_done'] }));
    await sleep(700);
    await shot('corredor');
    await press('z'); await sleep(900);
    await shot('mackey_talk');
    await waitIdle(ctx);
    await ev(() => SR.debug.start('corredor', 420, 150, { facing: 'right', flags: ['intro_done', 'mackey'] }));
    await sleep(700);
    await shot('corredor_closet');
    await ev(() => { SR.World.run(() => closetScene()); });
    await sleep(600);
    for (let i = 0; i < 7; i++) { await press('z', 1, 350); }
    await sleep(1200);
    await shot('closet_open');
    for (let i = 0; i < 3; i++) { await press('z', 1, 350); }
    await sleep(1500);
    await shot('falling');
    await sleep(2400);
    await shot('falling2');
    await sleep(2600);
    await shot('arrival');
    for (let i = 0; i < 4; i++) { await press('z', 1, 500); }
    await sleep(800);
    await shot('arrival_talk');
    await waitIdle(ctx, 25000);
    await sleep(500);
    await shot('dark_world_party');
  },

  async kenny(ctx) {
    const { ev, sleep, shot, press, hold, state } = ctx;
    await press('z'); await sleep(300);
    await ev((f) => SR.debug.start('campo1', 240, 104, { facing: 'right', party: ['stan', 'kyle'], flags: f }), ['intro_done', 'mackey', 'fell', 'arrived']);
    await sleep(800);
    await shot('campo1');
    await hold('ArrowRight', 1600);
    await sleep(600);
    let shotReveal = false;
    for (let i = 0; i < 120; i++) {
      const s = await state();
      if (s.mode === 'custom') break;
      if (s.dlg) { await press('x', 1, 40); if (i === 6 && !shotReveal) { shotReveal = true; await shot('kenny_reveal'); } await press('z', 1, 100); } else await sleep(120);
    }
    await sleep(1800);
    await shot('legend');
    await press('x', 1, 60); await press('z', 1, 1500);
    await shot('legend2');
    for (let i = 0; i < 160; i++) {
      const s = await state();
      if (s.mode === 'battle') break;
      await press('x', 1, 40); await press('z', 1, 120);
    }
    await sleep(1600);
    await shot('tutorial_battle');
    for (let i = 0; i < 6; i++) await press('z', 1, 250);
    await shot('tutorial_tip');
    await press('ArrowRight'); await press('z'); await press('z'); await sleep(250);
    await shot('tutorial_act');
    await press('ArrowRight'); await press('z'); await sleep(200);
    await press('z'); await press('z'); await sleep(200);
    await shot('tutorial_menu3');
    await press('z'); await press('z'); await sleep(1000);
    await shot('tutorial_qte');
    await press('z', 1, 30); await sleep(350); await press('z', 1, 30);
    for (let i = 0; i < 8; i++) await press('z', 1, 450);
    await sleep(1000);
    await shot('tutorial_wave');
    await sleep(4000);
    await shot('tutorial_after');
  },

  async battle(ctx) {
    const { ev, sleep, shot, press } = ctx;
    await press('z'); await sleep(300);
    await ev((f) => SR.debug.start('campo2', 200, 104, { party: ['stan', 'kyle', 'kenny'], flags: f, items: ['cheesy', 'snacky', 'choco'] }), ALL_FLAGS);
    await sleep(500);
    await ev(() => { SR.debug.battle(['cheesinho', 'peru']); });
    await sleep(1400);
    await shot('battle_start');
    await press('ArrowRight'); await sleep(150);
    await shot('btn_act');
    await press('z'); await sleep(200);
    await shot('enemy_select');
    await press('z'); await sleep(200);
    await shot('act_list');
    await press('ArrowRight'); await press('ArrowDown'); await sleep(100);
    await shot('act_list2');
    await press('z'); await sleep(250);
    await shot('kyle_menu');
    await press('ArrowRight'); await press('z'); await sleep(200);
    await shot('kyle_magic');
    await press('x'); await press('ArrowLeft'); await press('z'); await press('z'); await sleep(200);
    await shot('kenny_menu');
    await press('z'); await press('z'); await sleep(900);
    await shot('qte');
    await press('z', 1, 30); await sleep(380); await press('z', 1, 30);
    await sleep(600);
    await shot('after_qte');
    for (let i = 0; i < 6; i++) { await press('z', 1, 450); }
    await sleep(800);
    await shot('wave1');
    await ctx.page.keyboard.down('ArrowUp'); await sleep(700); await ctx.page.keyboard.up('ArrowUp');
    await shot('wave2');
    await sleep(3500);
    await shot('after_wave');
  },

  async boss(ctx) {
    const { ev, sleep, shot, press, hold } = ctx;
    await press('z'); await sleep(300);
    await ev((f) => SR.debug.start('trono', 160, 214, { facing: 'up', party: ['stan', 'kyle', 'kenny'], flags: f, items: ['cheesy', 'snacky'] }), ALL_FLAGS.concat(['goomba_fight1', 'puzzle1', 'mbp_done', 'gate_open', 'chandelier']));
    await sleep(900);
    await shot('throne_room');
    await hold('ArrowUp', 900);
    await sleep(1500);
    await shot('boss_intro');
    for (let i = 0; i < 120; i++) { const s = await ctx.state(); if (s.mode === 'battle') break; await press('x', 1, 30); await press('z', 1, 110); }
    await sleep(1800);
    await shot('boss_battle');
    // Stan: AGIR no Goomba -> "Capa maior?" (com Kyle)
    await press('ArrowRight'); await press('z'); await press('ArrowDown'); await press('z'); await sleep(150);
    await shot('boss_acts');
    await press('ArrowDown'); await press('z'); await sleep(200);
    await shot('xaction_kyle_busy');
    await press('z'); await press('z'); await sleep(1000);
    await shot('boss_qte');
    await press('z', 1, 30); await sleep(300); await press('z', 1, 30);
    for (let i = 0; i < 14; i++) { await press('x', 1, 30); await press('z', 1, 260); }
    await shot('boss_mid');
    await sleep(1200);
    await shot('boss_wave');
    await ctx.page.keyboard.down('ArrowLeft'); await sleep(900); await ctx.page.keyboard.up('ArrowLeft');
    await shot('boss_wave2');
    await sleep(2500);
    await shot('boss_wave3');
  },

  async shop(ctx) {
    const { ev, sleep, shot, press } = ctx;
    await press('z'); await sleep(300);
    await ev((f) => SR.debug.start('campo3', 120, 104, { party: ['stan', 'kyle', 'kenny'], flags: f, money: 200 }), ALL_FLAGS);
    await sleep(700);
    await shot('campo3');
    await ev(() => { SR.World.run(() => Shop.open()); });
    await sleep(1600);
    await shot('shop');
    await press('z'); await sleep(200);
    await shot('shop_buy');
    await press('z'); await sleep(400);
    await shot('shop_bought');
    await press('x'); await press('ArrowDown'); await press('ArrowDown'); await press('z'); await sleep(200);
    await press('z'); await sleep(1200);
    await shot('shop_talk');
  },

  async menu(ctx) {
    const { ev, sleep, shot, press } = ctx;
    await press('z'); await sleep(300);
    await ev((f) => SR.debug.start('campo2', 200, 104, { party: ['stan', 'kyle', 'kenny'], flags: f, items: ['cheesy', 'snacky', 'taco', 'cachecol'], money: 77 }), ALL_FLAGS);
    await sleep(700);
    await shot('field_dark');
    await press('c'); await sleep(200);
    await shot('menu_top');
    await press('z'); await sleep(200);
    await shot('menu_items');
    await press('x'); await press('ArrowRight'); await press('z'); await press('z'); await sleep(200);
    await shot('menu_equip');
    await press('z'); await sleep(200);
    await shot('menu_equip_list');
    await press('x'); await press('x'); await press('x'); await press('ArrowRight'); await press('z'); await press('ArrowRight'); await press('z'); await sleep(200);
    await shot('menu_power');
    await press('x'); await press('x'); await press('ArrowRight'); await press('z'); await sleep(200);
    await shot('menu_config');
  },

  async gameover(ctx) {
    const { ev, sleep, shot, press } = ctx;
    await press('z'); await sleep(300);
    await ev((f) => SR.debug.start('campo2', 200, 104, { party: ['stan'], flags: f }), ALL_FLAGS);
    await sleep(400);
    await ev(() => { SR.G.hp.stan = 1; SR.debug.battle(['cheesinho']); });
    await sleep(1300);
    await press('ArrowLeft'); await press('z'); await sleep(600);
    for (let i = 0; i < 4; i++) await press('z', 1, 500);
    for (let i = 0; i < 40; i++) { const s = await ctx.state(); if (s.mode === 'gameover') break; await sleep(250); }
    await sleep(300);
    await shot('soul_crack');
    await sleep(2500);
    await shot('game_over');
    await sleep(3500);
    await shot('continue');
    for (let i = 0; i < 20; i++) { const s = await ctx.state(); if (s.mode !== 'gameover') break; await press('z', 1, 300); }
    await sleep(1500);
    await shot('retry');
  },

  async ending(ctx) {
    const { ev, sleep, shot, press, state } = ctx;
    await press('z'); await sleep(300);
    await ev((f) => SR.debug.start('fonte', 160, 200, { facing: 'up', party: ['stan', 'kyle', 'kenny'], flags: f, enter: true }), ['intro_done', 'mackey', 'fell', 'arrived', 'kenny_met', 'kenny_joined', 'tutorial_done', 'boss_done']);
    await sleep(2600);
    await shot('fountain');
    const seen = {};
    for (let i = 0; i < 400; i++) {
      const s = await state();
      if (s.mode === 'custom' && !seen.credits) { seen.credits = 1; await sleep(1500); await shot('credits'); await press('x', 1, 100); await sleep(4000); await shot('epilogue'); }
      if (s.mode === 'title') { await sleep(800); await shot('back_to_title'); break; }
      if (s.room === 'corredor' && !seen.hall) { seen.hall = 1; await sleep(1500); await shot('return_hall'); }
      if (s.room === 'ponto' && !seen.bus) { seen.bus = 1; await sleep(2500); await shot('ending_busstop'); }
      if (s.dlg) { await press('x', 1, 30); await press('z', 1, 90); } else await sleep(150);
      if (i === 30 && !seen.seal) { seen.seal = 1; await shot('sealing'); }
    }
  },
  async tour1(ctx) {
    const { ev, sleep, shot, press, hold, state } = ctx;
    const base = ['intro_done', 'mackey', 'fell', 'arrived', 'kenny_met', 'kenny_joined', 'tutorial_done'];
    const P = ['stan', 'kyle', 'kenny'];
    const skip = async (until, max = 200) => { for (let i = 0; i < max; i++) { const s = await state(); if (until(s)) return s; if (s.dlg) { await press('x', 1, 30); await press('z', 1, 90); } else await sleep(120); } return null; };
    await press('z'); await sleep(300);
    await ev((a) => SR.debug.start('campo2', 100, 104, { facing: 'right', party: a.P, flags: a.f }), { P, f: base });
    await sleep(700); await shot('campo2');
    await hold('ArrowRight', 900);
    await sleep(1800); await shot('goomba_intro');
    await press('x', 1, 30); await press('z', 1, 200);
    await sleep(800); await shot('goomba_intro2');
    await skip((s) => !s.dlg && s.busy === 0, 150);
    await sleep(300); await shot('goomba_left');
    await ev((a) => SR.debug.start('campo3', 250, 104, { facing: 'right', party: a.P, flags: a.f }), { P, f: base.concat(['goomba_intro', 'puzzle_taunt']) });
    await sleep(700); await shot('campo3_puzzle');
    await ev(() => { SR.World.run(() => pressSwitch('money')); }); await sleep(400);
    await shot('puzzle_wrong');
    await skip((s) => !s.dlg && s.busy === 0, 60);
    for (const sw of ['food', 'money', 'crown']) { await ev((w) => { SR.World.run(() => pressSwitch(w)); }, sw); await sleep(500); }
    await sleep(600); await shot('puzzle_solved');
    await skip((s) => s.mode === 'battle', 150);
    await sleep(1600); await shot('goomba_battle');
  },
  async tour2(ctx) {
    const { ev, sleep, shot, press, hold, state } = ctx;
    const base = ['intro_done', 'mackey', 'fell', 'arrived', 'kenny_met', 'kenny_joined', 'tutorial_done', 'goomba_intro', 'puzzle_taunt', 'puzzle1', 'goomba_fight1'];
    const P = ['stan', 'kyle', 'kenny'];
    const skip = async (until, max = 200) => { for (let i = 0; i < max; i++) { const s = await state(); if (until(s)) return s; if (s.dlg) { await press('x', 1, 30); await press('z', 1, 90); } else await sleep(120); } return null; };
    await press('z'); await sleep(300);
    await ev((a) => SR.debug.start('bosque', 400, 104, { facing: 'right', party: a.P, flags: a.f }), { P, f: base });
    await sleep(700); await shot('bosque');
    await hold('ArrowRight', 1400);
    await sleep(1200); await shot('mbp_appears');
    await skip((s) => s.mode === 'battle', 150);
    await sleep(1600); await shot('mbp_battle');
    await ev((a) => SR.debug.start('portao', 240, 160, { facing: 'up', party: a.P, flags: a.f }), { P, f: base.concat(['mbp_done', 'mbp_seen']) });
    await sleep(700); await shot('portao');
    await hold('ArrowUp', 1300);
    await sleep(600);
    for (let i = 0; i < 40; i++) { const s = await state(); if (await ctx.ev(() => SR.Dlg.choosing)) break; if (s.dlg) { await press('x', 1, 30); await press('z', 1, 90); } else await sleep(120); }
    await sleep(300); await shot('password_choice');
    await press('ArrowRight'); await press('z'); await sleep(900);
    await shot('password_answer');
    await skip((s) => !s.dlg && s.busy === 0, 150);
    await sleep(500); await shot('gate_open');
    await ev((a) => SR.debug.start('salao', 160, 330, { facing: 'up', party: a.P, flags: a.f }), { P, f: base.concat(['mbp_done', 'gate_open']) });
    await sleep(700); await shot('salao');
    await hold('ArrowUp', 1700);
    await sleep(900); await shot('chandelier');
    await skip((s) => !s.dlg && s.busy === 0, 150);
    await sleep(400); await shot('after_chandelier');
  },
  async mobile(ctx) {
    const { ev, sleep, shot, page } = ctx;
    await shot('boot_full', true);
    const box = await page.locator('#screen').boundingBox();
    await page.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2);
    await sleep(800);
    await ev(() => SR.debug.start('campo2', 200, 104, { party: ['stan', 'kyle', 'kenny'], flags: ['intro_done', 'mackey', 'fell', 'arrived', 'kenny_met', 'kenny_joined', 'tutorial_done', 'goomba_intro'] }));
    await sleep(800);
    // segura o direcional para a direita com toque (ponteiro)
    const pad = await page.locator('#dpad').boundingBox();
    if (pad) {
      await page.mouse.move(pad.x + pad.width * 0.85, pad.y + pad.height / 2);
      await page.mouse.down(); await sleep(600);
      await shot('field_touch_full', true);
      await page.mouse.up();
    } else await shot('field_touch_full', true);
    await ev(() => { SR.debug.battle(['cheesinho', 'peru']); });
    await sleep(1600);
    await shot('battle_full', true);
  },
  async save(ctx) {
    const { ev, sleep, shot, press, page, state } = ctx;
    await press('z'); await sleep(300);
    const audio1 = await ev(() => ({ ctx: SR.Sfx.ctx && SR.Sfx.ctx.state, music: SR.Music.name, step: SR.Music.step }));
    await sleep(1000);
    const audio2 = await ev(() => ({ ctx: SR.Sfx.ctx && SR.Sfx.ctx.state, music: SR.Music.name, step: SR.Music.step }));
    console.log('AUDIO', JSON.stringify(audio1), JSON.stringify(audio2));
    await ev(() => SR.debug.start('queda', 104, 112, { facing: 'up', party: ['stan', 'kyle'], flags: ['intro_done', 'mackey', 'fell', 'arrived'], items: ['cheesy'], money: 42 }));
    await sleep(700);
    await press('z'); await sleep(200);
    for (let i = 0; i < 6; i++) { const s = await state(); if (!s.dlg) break; await press('x', 1, 30); await press('z', 1, 120); }
    await sleep(300);
    await shot('save_menu');
    await press('z'); await sleep(400);
    await shot('saved');
    await press('z'); await sleep(300);
    await page.reload();
    await sleep(600);
    await press('z'); await sleep(1200);
    await shot('title_continue');
    await press('z'); await sleep(1500);
    await shot('continued');
    console.log('AFTER', JSON.stringify(await ev(() => ({ room: SR.World.id, money: SR.G.money, items: SR.G.items, party: SR.G.party }))));
  },
  async audio(ctx) {
    const { ev, press, sleep } = ctx;
    await press('z'); await sleep(300);
    const res = await ev(async () => {
      const out = {};
      const realCtx = Sfx.ctx, realWaves = Sfx.waves, realNoise = Sfx.noiseBuf, realS = Sfx.sfxBus, realM = Sfx.musBus;
      for (const name of Object.keys(SONGS)) {
        const sr = 22050, secs = 6;
        const oc = new OfflineAudioContext(1, sr * secs, sr);
        Sfx.ctx = oc;
        Sfx.waves = {};
        for (const [k, d] of [['p12', 0.125], ['p25', 0.25], ['p50', 0.5]]) Sfx.waves[k] = Sfx.pulse(d);
        Sfx.noiseBuf = oc.createBuffer(1, sr, sr);
        const nd = Sfx.noiseBuf.getChannelData(0); for (let i = 0; i < sr; i++) nd[i] = Math.random() * 2 - 1;
        const comp = oc.createDynamicsCompressor(); comp.threshold.value = -14; comp.knee.value = 10; comp.ratio.value = 4; comp.attack.value = 0.004; comp.release.value = 0.15;
        const g = oc.createGain(); g.gain.value = 0.8 * 0.75 * (SONGS[name].vol || 1);
        g.connect(comp); comp.connect(oc.destination);
        const song = Music.compile(SONGS[name]);
        const sd = 60 / song.bpm / 4;
        const prevCur = Music.cur, prevGain = Music.gain;
        Music.cur = song; Music.gain = g;
        for (let i = 0, t = 0.01; t < secs - 0.5; i++, t += sd) Music.playStep(i % song.len, t, sd);
        Music.cur = prevCur; Music.gain = prevGain;
        const buf = await oc.startRendering();
        const d = buf.getChannelData(0);
        let peak = 0, sum = 0;
        for (let i = 0; i < d.length; i++) { const v = Math.abs(d[i]); if (v > peak) peak = v; sum += d[i] * d[i]; }
        out[name] = { peak: +peak.toFixed(3), rms: +Math.sqrt(sum / d.length).toFixed(3), len: song.len, bpm: song.bpm };
      }
      Sfx.ctx = realCtx; Sfx.waves = realWaves; Sfx.noiseBuf = realNoise; Sfx.sfxBus = realS; Sfx.musBus = realM;
      return out;
    });
    for (const [k, v] of Object.entries(res)) console.log('SONG', k.padEnd(9), JSON.stringify(v));
  },
};
