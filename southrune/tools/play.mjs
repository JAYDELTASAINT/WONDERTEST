// Testes de fumaça: abre o jogo no Chromium, executa passos e tira capturas da tela do jogo.
// Uso: node tools/play.mjs <cenário> <pasta-de-saída>
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import { mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const [,, scenario = 'opening', out = '/tmp/sr-shots', vw = '960', vh = '760', touch = ''] = process.argv;
mkdirSync(out, { recursive: true });
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: +vw, height: +vh }, hasTouch: !!touch, isMobile: !!touch, deviceScaleFactor: touch ? 3 : 1 });
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push('pageerror: ' + e.message + '\n' + (e.stack || '').split('\n').slice(0, 4).join('\n')));
page.on('console', (m) => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
await page.goto('file://' + join(root, 'dist', 'southrune.html'));
await page.waitForTimeout(400);

const sleep = (ms) => page.waitForTimeout(ms);
const press = async (k, n = 1, gap = 90) => { for (let i = 0; i < n; i++) { await page.keyboard.down(k); await sleep(70); await page.keyboard.up(k); await sleep(gap); } };
const hold = async (k, ms) => { await page.keyboard.down(k); await sleep(ms); await page.keyboard.up(k); };
let shotN = 0;
const shot = async (name, full = false) => {
  const file = join(out, `${String(++shotN).padStart(2, '0')}_${name}.png`);
  if (full) await page.screenshot({ path: file });
  else await page.locator('#screen').screenshot({ path: file });
  console.log('shot', file);
};
const ev = (fn, arg) => page.evaluate(fn, arg);
const state = () => ev(() => window.SR && ({ mode: SR.Game.mode, room: SR.World.id, dlg: SR.Dlg.active, busy: SR.World.busy, x: SR.World.player && Math.round(SR.World.player.x), y: SR.World.player && Math.round(SR.World.player.y), party: SR.G && SR.G.party, flags: SR.G && Object.keys(SR.G.flags) }));
/* Avança diálogos até não haver mais (ou até o limite) */
const advance = async (max = 60) => { for (let i = 0; i < max; i++) { const s = await state(); if (!s.dlg) return; await press('z', 1, 120); } };

const scenarios = (await import(join(root, 'tools', 'scenarios.mjs'))).default;
try {
  await scenarios[scenario]({ page, press, hold, shot, sleep, ev, state, advance });
} catch (e) {
  errors.push('scenario error: ' + e.message);
}
try { console.log('STATE', JSON.stringify(await state())); } catch (e) { errors.push('state: ' + e.message); }
console.log(errors.length ? 'ERRORS:\n' + errors.join('\n') : 'NO ERRORS');
await browser.close();
