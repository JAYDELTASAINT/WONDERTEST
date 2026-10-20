// Jogada completa automatizada: anda pelos mapas de verdade, do título até os créditos.
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import { mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = process.argv[2] || '/tmp/sr-full';
mkdirSync(out, { recursive: true });
const browser = await chromium.launch();
const page = await (await browser.newContext({ viewport: { width: 960, height: 760 } })).newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
await page.goto('file://' + join(root, 'dist', 'southrune.html'));
const sleep = (ms) => page.waitForTimeout(ms);
const press = async (k, gap = 80) => { await page.keyboard.down(k); await sleep(60); await page.keyboard.up(k); await sleep(gap); };
const st = () => page.evaluate(() => ({
  mode: SR.Game.mode, room: SR.World.id, dlg: SR.Dlg.active, choosing: SR.Dlg.choosing, busy: SR.World.busy,
  x: SR.World.player ? Math.round(SR.World.player.x) : 0, y: SR.World.player ? Math.round(SR.World.player.y) : 0,
  bc: SR.Battle.choosing, bms: SR.Battle.ms, flags: SR.G ? Object.keys(SR.G.flags).filter((k) => SR.G.flags[k]) : [],
}));
let n = 0;
const shot = async (name) => { await page.locator('#screen').screenshot({ path: join(out, `${String(++n).padStart(2, '0')}_${name}.png`) }); };
const log = (...a) => console.log(new Date().toISOString().slice(14, 19), ...a);

async function battle() {
  log('  batalha');
  const t0 = Date.now();
  let lastMs = null;
  while (Date.now() - t0 < 10 * 60 * 1000) {
    const s = await st();
    if (s.mode !== 'battle') { log('  fim da batalha'); return; }
    if (s.bms === 'qte' && lastMs !== 'qte') log('   HP', await page.evaluate(() => SR.Battle.enemies.map((e) => `${e.id}:${Math.max(0, e.hp)}${e.gone ? '(' + e.gone + ')' : ''}`).join(' ')));
    lastMs = s.bms;
    await page.evaluate(() => { for (const id of SR.G.party) SR.G.hp[id] = Math.max(SR.G.hp[id], 60); });
    if (s.bc && (s.bms === 'btn' || s.bms === 'enemy')) await press('z', 60);
    else if (s.bms === 'qte') {
      // aperta quando a barra mais próxima chega perto do alvo (x = 84)
      const x = await page.evaluate(() => { const q = SR.Battle.qte; if (!q) return null; const live = q.rows.filter((r) => !r.done && r.x < 300).sort((a, b) => a.x - b.x); return live.length ? live[0].x : null; });
      if (x !== null && x <= 96) await page.keyboard.press('z'); else await sleep(5);
    }
    else if (s.bms === 'wave') await sleep(300);
    else await press('z', 150);
  }
  throw new Error('batalha não terminou');
}
async function settle(max = 400) {
  for (let i = 0; i < max; i++) {
    const s = await st();
    if (s.mode === 'battle') { await battle(); continue; }
    if (s.mode === 'custom') { await press('z', 150); continue; }
    if (s.dlg) {
      if (s.choosing) return s;
      await press('x', 30);
      const s2 = await st();
      if (s2.choosing) return s2;
      await press('z', 80);
      continue;
    }
    if ((s.mode === 'field' && s.busy === 0) || s.mode === 'title') return s;
    if (s.mode === 'shop') { await press('x', 100); continue; }
    await sleep(120);
  }
  throw new Error('não estabilizou');
}
async function walkTo(tx, ty, opts = {}) {
  let stuck = 0, last = '';
  for (let i = 0; i < (opts.max || 500); i++) {
    const s = await st();
    if (opts.room && s.room !== opts.room) return s;
    if (s.mode !== 'field' || s.dlg || s.busy) { if (opts.stopOnEvent) return s; await settle(); continue; }
    const dx = tx - s.x, dy = ty - s.y;
    if (Math.abs(dx) <= 3 && Math.abs(dy) <= 3) return s;
    const keys = [];
    if (dx > 3) keys.push('ArrowRight'); if (dx < -3) keys.push('ArrowLeft');
    if (dy > 3) keys.push('ArrowDown'); if (dy < -3) keys.push('ArrowUp');
    const pos = s.x + ',' + s.y;
    if (pos === last) stuck++; else stuck = 0;
    last = pos;
    if (stuck > 3) { // contorna obstáculos
      const alt = Math.abs(dx) > Math.abs(dy) ? (Math.random() < 0.5 ? 'ArrowUp' : 'ArrowDown') : (Math.random() < 0.5 ? 'ArrowLeft' : 'ArrowRight');
      await page.keyboard.down(alt); await sleep(250); await page.keyboard.up(alt); stuck = 0; continue;
    }
    await page.keyboard.down('Shift');
    for (const k of keys) await page.keyboard.down(k);
    await sleep(Math.min(220, Math.max(60, (Math.abs(dx) + Math.abs(dy)) * 2)));
    for (const k of keys) await page.keyboard.up(k);
    await page.keyboard.up('Shift');
  }
  throw new Error(`não chegou em ${tx},${ty}`);
}
async function face(dir) { await press('Arrow' + dir, 40); }
async function step(name, fn) { log('>>', name); await fn(); const s = await st(); log('   ok', s.room, s.x, s.y, s.mode); }

const fromGate = process.argv[3] === 'portao';
try {
  await sleep(500);
  if (fromGate) {
    await press('z', 600);
    await page.evaluate(() => SR.debug.start('portao', 16, 106, { facing: 'right', party: ['stan', 'kyle', 'kenny'],
      flags: ['intro_done', 'mackey', 'fell', 'arrived', 'kenny_met', 'kenny_joined', 'tutorial_done', 'goomba_intro', 'puzzle1', 'goomba_fight1', 'mbp_seen', 'mbp_done'] }));
    await sleep(800);
  } else {
  await step('início', async () => { await press('z', 600); await press('c', 1500); await press('z', 2000); await shot('busstop'); await settle(); });
  await step('para a escola', async () => { await walkTo(300, 200); await walkTo(490, 200, { room: 'ponto' }); });
  await step('porta da escola', async () => { await settle(); await shot('escola'); await walkTo(240, 118, { room: 'escola' }); });
  await step('Sr. Mackey', async () => { await settle(); await walkTo(212, 156); await face('Up'); await press('z', 300); await settle(); });
  await step('armário', async () => { await walkTo(470, 124); await face('Right'); await press('z', 400); await settle(600); await shot('queda'); });
  await step('lugar da queda', async () => { await walkTo(330, 104, { room: 'queda' }); });
  await step('Kenny e tutorial', async () => { await settle(); await walkTo(340, 104, { stopOnEvent: true }); await settle(800); await shot('campo1_after'); });
  await step('campo1 → campo2', async () => { await walkTo(650, 104, { room: 'campo1' }); });
  await step('campo2', async () => { await settle(); await walkTo(760, 104, { stopOnEvent: false }); await walkTo(810, 104, { room: 'campo2' }); });
  await step('quebra-cabeça', async () => {
    await settle(); await shot('campo3');
    await walkTo(280, 98); await face('Up'); await press('z', 300); await settle();
    await walkTo(328, 124); await face('Down'); await press('z', 300); await settle();
    await walkTo(376, 98); await face('Up'); await press('z', 300); await settle(600);
    await walkTo(400, 104); await settle(600);
  });
  await step('campo3 → bosque', async () => { await walkTo(780, 104, { room: 'campo3' }); });
  await step('ManBearPig', async () => { await settle(); await walkTo(480, 104, { stopOnEvent: true }); await settle(800); });
  await step('bosque → portão', async () => { await walkTo(715, 104, { room: 'bosque' }); });
  }
  await step('senha', async () => {
    await settle(); await shot('portao');
    await walkTo(240, 112, { stopOnEvent: true });
    const s0 = await settle();
    if (!s0.choosing) throw new Error('a pergunta da senha não apareceu');
    await shot('password_choice');
    await press('ArrowRight', 120); await press('z', 300); await settle(600); await shot('gate_open');
  });
  await step('entrar no castelo', async () => { await walkTo(240, 64, { room: 'portao' }); });
  await step('salão', async () => { await settle(); await walkTo(160, 300); await walkTo(160, 240); await settle(); await walkTo(160, 60, { room: 'salao' }); });
  await step('chefão', async () => { await settle(); await shot('trono'); await walkTo(160, 170, { stopOnEvent: true }); await settle(2000); await shot('after_boss'); });
  await step('final', async () => {
    for (let i = 0; i < 900; i++) { const s = await st(); if (s.mode === 'title') break; if (s.mode === 'custom') await press('x', 300); else if (s.dlg) { await press('x', 20); await press('z', 80); } else await sleep(150); }
    await shot('title_end');
  });
} catch (e) { errors.push('FALHA: ' + e.message); try { await shot('falha'); console.log(JSON.stringify(await st())); } catch (e2) { /* ok */ } }
console.log(errors.length ? 'ERROS:\n' + errors.join('\n') : 'SEM ERROS');
await browser.close();
