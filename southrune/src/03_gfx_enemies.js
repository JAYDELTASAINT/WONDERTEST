'use strict';
/* Inimigos, chefões e personagens secundários (sprites e retratos). */

function eyesAt(p, cx, ey, r, expr, o = {}) { drawEyes(p, cx, ey, r, expr, o); }

/* ---------- Cheesinho: monstro de salgadinho de queijo ---------- */
function drawCheesinho(p, f, expr = 'angry') {
  const sq = f === 1 ? 1 : 0;
  const c = '#f59a2a', cd = '#c96a14', cl = '#ffc860';
  for (const x of [14, 26]) { p.rect(x, 29, 1, 5, '#5a3010'); p.ellipse(x + (x < 20 ? -1 : 1), 35, 3.4, 1.7, '#5a3010'); }
  const blobs = [[20, 21 + sq, 12.5, 10 - sq], [10.5, 18 + sq, 6.5, 6], [29.5, 18 + sq, 6.5, 6], [14.5, 11 + sq * 2, 6, 5.5], [25.5, 11 + sq * 2, 6, 5.5], [20, 7.5 + sq * 2, 5, 4.5]];
  for (const [x, y, rx, ry] of blobs) p.ellipse(x, y, rx, ry, c);
  for (const [x, y, rx, ry] of blobs) p.ellipse(x, y, rx, ry, cd, y + ry * 0.45, 1e9);
  for (let i = 0; i < 16; i++) p.px(7 + U.hash(i, 1, 3) * 26, 5 + U.hash(i, 2, 3) * 24, cl);
  // braço e garfo
  p.line(31, 22, 36, 20, '#5a3010', 1);
  p.line(37, 10, 37, 27, PAL.steelD, 1);
  p.rect(35, 9, 5, 2, PAL.steel);
  for (const x of [35, 37, 39]) p.rect(x, 6, 1, 3, PAL.steel);
  p.line(9, 22, 4, 25, '#5a3010', 1);
  eyesAt(p, 20, 18 + sq, 11, expr);
  drawMouth(p, 20, 25 + sq, 11, expr === 'happy' ? 'smile' : expr === 'tired' ? 'wavy' : 'grit');
}

/* ---------- Peru Mutante ---------- */
function drawPeru(p, f, expr = 'shock') {
  const cx = 24, cy = 27, R = 20 + (f === 1 ? 1 : 0);
  const cols = ['#7a4a22', '#c0782c', '#b02a2a', '#e8a840', '#7a4a22', '#c0782c', '#b02a2a', '#e8a840', '#7a4a22'];
  const n = cols.length, a0 = Math.PI * 1.05, a1 = Math.PI * 1.95;
  for (let i = 0; i < n; i++) {
    const s = a0 + ((a1 - a0) * i) / n, e = a0 + ((a1 - a0) * (i + 1)) / n;
    const m = (s + e) / 2;
    p.poly([[cx, cy], [cx + Math.cos(s) * R, cy + Math.sin(s) * R], [cx + Math.cos(m) * (R + 2), cy + Math.sin(m) * (R + 2)], [cx + Math.cos(e) * R, cy + Math.sin(e) * R]], cols[i]);
    p.px(cx + Math.cos(m) * (R + 0.5), cy + Math.sin(m) * (R + 0.5), '#fff0d0');
  }
  for (const x of [19, 29]) { p.line(x, 38, x + (x < 24 ? -1 : 1), 44, '#f0a020', 1); p.rect(x - 2 + (x < 24 ? -1 : 1), 44, 5, 1, '#f0a020'); }
  p.ellipse(cx, 31, 11.5, 10, '#6e4422');
  p.ellipse(cx, 31, 11.5, 10, '#553218', 31 + 4, 1e9);
  p.ellipse(cx, 34, 7, 5.5, '#946238');
  p.ellipse(cx + 1, 18 - (f === 1 ? 1 : 0), 6.5, 6.5, '#d27466');
  p.ellipse(cx + 1, 23, 3, 3, '#d27466');
  const hy = 17 - (f === 1 ? 1 : 0);
  p.ellipse(21, hy - 1, 3.6, 3.8, PAL.ol); p.ellipse(21, hy - 1, 2.9, 3.1, '#fff'); p.px(21, hy - 1, '#000');
  p.ellipse(28, hy, 2.4, 2.4, PAL.ol); p.ellipse(28, hy, 1.7, 1.7, '#fff'); p.px(28, hy, '#000');
  p.poly([[23, hy + 2], [29, hy + 3], [23, hy + 5]], '#f6c030');
  p.ellipse(25, hy + 7, 1.4, 3.2, '#e02020');
  if (expr === 'happy') p.line(19, hy - 6, 23, hy - 5, PAL.ol); else { p.line(18, hy - 6, 23, hy - 4, PAL.ol); p.line(26, hy - 4, 30, hy - 5, PAL.ol); }
  for (let i = 0; i < 6; i++) p.px(17 + i * 3, 27 + (i % 2), '#4a2a10');
}

/* ---------- Sapo Clyde (pelúcia do Cartman) ---------- */
function drawClyde(p, f, expr = 'neutral') {
  const g = '#5ec25e', gd = '#3e8e3e', gl = '#9ee09a';
  const b = f === 1 ? 1 : 0;
  p.ellipse(11, 37, 5, 2, gd); p.ellipse(31, 37, 5, 2, gd);
  p.ellipse(21, 30, 11, 8, g);
  p.ellipse(21, 31, 6, 5, gl);
  p.ellipse(21, 17 + b, 15, 10, g);
  p.ellipse(21, 17 + b, 15, 10, gd, 17 + b + 5, 1e9);
  for (const x of [13, 29]) { p.circle(x, 9 + b, 5.5, g); p.circle(x, 9 + b, 4.2, '#fff'); }
  const look = expr === 'happy' ? 0 : f === 1 ? 0.6 : -0.3;
  for (const x of [13, 29]) { p.circle(x + look * 1.5, 9.5 + b, 1.8, '#000'); p.px(x + look * 1.5 - 1, 8.5 + b, '#fff'); }
  if (expr === 'angry') { p.line(8, 3 + b, 16, 6 + b, PAL.ol); p.line(26, 6 + b, 34, 3 + b, PAL.ol); }
  p.line(9, 21 + b, 33, 21 + b, PAL.ol, 1);
  if (expr === 'happy') { p.px(8, 20 + b, PAL.ol); p.px(34, 20 + b, PAL.ol); }
  for (let x = 11; x <= 31; x += 4) p.rect(x, 20 + b, 1, 3, '#a03a3a');
  for (let y = 12; y <= 26; y += 3) p.px(21, y + b, gd);
  // xícara de chá
  p.ellipse(35, 28, 2.4, 2.4, g);
  p.rect(33, 23, 7, 5, '#ffffff'); p.rect(33, 27, 7, 1, '#c8d0e0'); p.rect(35, 24, 3, 1, '#7aa0ff');
  p.px(40, 24, '#fff'); p.px(41, 25, '#fff'); p.px(40, 26, '#fff');
  if (f === 1) { p.px(35, 21, '#c8d0e0'); p.px(37, 20, '#c8d0e0'); }
}

/* ---------- Sr. Chapéu: boneco de treino ---------- */
function drawSrChapeu(p, f, expr = 'neutral') {
  const t = f === 1 ? 1 : 0;
  p.rect(16, 37, 3, 11, PAL.wood); p.rect(9, 46, 17, 3, PAL.woodD);
  p.ellipse(17, 27 + t, 8.5, 11, '#ead8b6');
  p.ellipse(17, 27 + t, 8.5, 11, '#d0b890', 27 + t + 5, 1e9);
  p.ellipse(13.5, 23 + t, 1.8, 1.8, '#000'); p.ellipse(20.5, 23 + t, 1.8, 1.8, '#000');
  p.px(13, 22 + t, '#fff'); p.px(20, 22 + t, '#fff');
  if (expr === 'happy' || f === 1) { p.rect(12, 29 + t, 11, 3, PAL.ol); p.rect(13, 30 + t, 9, 1, '#c03040'); }
  else p.rect(12, 30 + t, 11, 1, PAL.ol);
  p.rect(6, 15 + t, 22, 2, '#3a2052');
  p.rect(9, 3 + t, 16, 12, '#4a2a66');
  p.rect(9, 11 + t, 16, 2, '#d03a3a');
  p.rect(10, 4 + t, 2, 6, '#6a4a8a');
}

/* ---------- ManBearPig ---------- */
function drawMBP(p, f, expr = 'angry') {
  const fur = '#6b4423', furD = '#4e2f16', furL = '#8a5a30', pink = '#f2a0b4';
  const up = f === 1;
  for (const x of [25, 39]) { p.ellipse(x, 56, 5, 6, fur); for (let i = -2; i <= 2; i += 2) p.rect(x + i, 61, 1, 2, '#fff'); }
  p.rect(18, 44, 28, 9, '#3c5c9c');
  for (let x = 18; x < 46; x += 3) p.rect(x, 52, 2, 1 + (x % 2), '#3c5c9c');
  p.rect(18, 44, 28, 1, '#2a4070');
  p.ellipse(32, 36, 17, 13, fur);
  p.ellipse(32, 36, 17, 13, furD, 36 + 6, 1e9);
  for (let i = 0; i < 18; i++) p.px(18 + U.hash(i, 5) * 28, 26 + U.hash(i, 6) * 18, furD);
  p.ellipse(32, 39, 9, 7, furL);
  // braços
  const armL = up ? [[16, 30], [8, 18]] : [[16, 30], [9, 44]];
  const armR = [[48, 30], [55, 44]];
  for (const [[x0, y0], [x1, y1]] of [armL, armR]) {
    p.line(x0, y0, x1, y1, fur, 6);
    for (let i = -2; i <= 2; i += 2) p.line(x1 + i, y1 + (y1 > y0 ? 3 : -3), x1 + i * 1.4, y1 + (y1 > y0 ? 6 : -6), '#ffffff', 1);
  }
  p.ellipse(32, 15, 12.5, 11, fur);
  for (const x of [22, 42]) { p.circle(x, 6, 3.6, fur); p.circle(x, 6, 1.8, pink); }
  p.ellipse(32, 21, 6.5, 4.2, pink);
  p.ellipse(30, 21, 1.1, 1.6, '#7a2a3a'); p.ellipse(34, 21, 1.1, 1.6, '#7a2a3a');
  p.rect(25, 12, 4, 3, '#ff2020'); p.rect(35, 12, 4, 3, '#ff2020'); p.px(26, 13, '#ffff80'); p.px(36, 13, '#ffff80');
  p.line(23, 9, 29, 11, PAL.ol, 1); p.line(35, 11, 41, 9, PAL.ol, 1);
  p.line(26, 26, 38, 26, PAL.ol, 1);
  p.poly([[26, 26], [28, 26], [27, 22]], '#fff'); p.poly([[36, 26], [38, 26], [37, 22]], '#fff');
}

/* ---------- Goomba de capa ---------- */
function drawGoomba(p, cx, base, k = 1, o = {}) {
  const f = o.frame || 0, expr = o.expr || 'angry', squash = o.squash ? 0.55 : 1;
  const fl = f % 2 ? 1 : 0;
  const Y = (v) => base - v * k * squash;
  // capa
  if (!o.noCape) {
    const wv = fl ? 1.5 : -1;
    p.poly([[cx - 13 * k, Y(20)], [cx + 13 * k, Y(20)], [cx + 18 * k + wv, Y(1)], [cx + 6 * k, Y(3) ], [cx - 6 * k, Y(1)], [cx - 18 * k - wv, Y(3)]], PAL.cape);
    p.poly([[cx + 4 * k, Y(20)], [cx + 13 * k, Y(20)], [cx + 18 * k + wv, Y(1)], [cx + 6 * k, Y(3)]], PAL.capeD);
  }
  // pés
  const lift = (i) => (f === 2 && i === 0) || (f === 3 && i === 1) ? 1 : 0;
  p.ellipse(cx - 7.5 * k, Y(2.8 + lift(0)), 6.4 * k, 3.4 * k * squash, PAL.goomFeet);
  p.ellipse(cx + 7.5 * k, Y(2.8 + lift(1)), 6.4 * k, 3.4 * k * squash, PAL.goomFeet);
  // tronco curto
  p.rect(cx - 6 * k, Y(17), 12 * k, 13 * k * squash, PAL.goomFace);
  p.rect(cx + 1 * k, Y(17), 5 * k, 13 * k * squash, PAL.goomFaceD);
  // abas da frente da capa
  if (!o.noCape) {
    p.poly([[cx - 13 * k, Y(20)], [cx - 4.5 * k, Y(18)], [cx - 6 * k, Y(1.5)], [cx - 17 * k, Y(2.5)]], PAL.cape);
    p.poly([[cx + 13 * k, Y(20)], [cx + 4.5 * k, Y(18)], [cx + 6 * k, Y(1.5)], [cx + 17 * k, Y(2.5)]], PAL.capeD);
    p.ellipse(cx, Y(17.5), 2.3 * k, 2 * k * squash, PAL.gold); p.px(cx - 1, Y(18.2), PAL.goldL);
  }
  // cabeça de cogumelo
  const hy = Y(29);
  p.ellipse(cx, hy, 20 * k, 14 * k * squash, PAL.goom, -1e9, Y(19));
  p.ellipse(cx - 6 * k, hy - 6 * k * squash, 9 * k, 5 * k * squash, PAL.goomL, -1e9, Y(19));
  p.ellipse(cx, hy, 20 * k, 14 * k * squash, PAL.goomD, Y(24.5), Y(19));
  // rosto (parte clara de baixo)
  p.ellipse(cx, Y(21), 14 * k, 6 * k * squash, PAL.goomFace, Y(24), Y(19));
  // olhos
  const ey = Y(28.6), er = 3.4 * k, ery = 5.2 * k * squash;
  const look = o.look || 0;
  for (const s of [-1, 1]) {
    const ex = cx + s * 5.8 * k;
    p.ellipse(ex, ey, er + 0.9, ery + 0.9, PAL.ol);
    p.ellipse(ex, ey, er, ery, '#ffffff');
    if (expr === 'x') { p.line(ex - 2, ey - 2, ex + 2, ey + 2, PAL.ol); p.line(ex + 2, ey - 2, ex - 2, ey + 2, PAL.ol); }
    else {
      const pr = expr === 'shock' ? 0.9 : 1.6 * k + 0.3;
      p.ellipse(ex + look * 1.4 - s * 0.6 * k, ey + 1 * k, pr, pr * 1.6, '#000');
      p.px(ex + look * 1.4 - s * 0.6 * k - 1, ey - 1 * k, '#ffffff');
    }
  }
  // sobrancelhas grossas
  const bw = Math.max(1, Math.round(2 * k));
  if (expr === 'happy' || expr === 'sad' || expr === 'worried') {
    for (const s of [-1, 1]) p.line(cx + s * 2.5 * k, ey - ery - 1.5 * k, cx + s * 9.5 * k, ey - ery + 0.5 * k, PAL.ol, bw);
  } else if (expr !== 'shock') {
    for (const s of [-1, 1]) p.line(cx + s * 2 * k, ey - ery + 1.5 * k, cx + s * 10 * k, ey - ery - 2.2 * k, PAL.ol, bw);
  }
  // boca com presas
  const my = Y(20.6);
  if (expr === 'shock' || expr === 'shout') p.ellipse(cx, my, 3.2 * k, 2 * k, PAL.mouth);
  else if (expr === 'happy') { p.line(cx - 5 * k, my - 1, cx, my + 1 * k, PAL.ol); p.line(cx, my + 1 * k, cx + 5 * k, my - 1, PAL.ol); }
  else p.line(cx - 5.5 * k, my, cx + 5.5 * k, my, PAL.ol, 1);
  if (expr !== 'shock' && expr !== 'shout') for (const s of [-1, 1]) {
    const fx = cx + s * 3.4 * k, fh = Math.max(2, 3.2 * k), fw = Math.max(1.4, 1.6 * k);
    p.poly([[fx - fw - 0.8, my + 0.5], [fx + fw + 0.8, my + 0.5], [fx, my - fh - 1]], PAL.ol);
    p.poly([[fx - fw, my], [fx + fw, my], [fx, my - fh]], '#ffffff');
  }
}

/* ---------- Cartman, o Imperador (chefão) ---------- */
function drawCartmanBoss(p, f, expr = 'smug', pose = 'idle') {
  const cx = 36, base = 78, bob = f % 2;
  // capa roxa
  p.poly([[cx - 22, 44 + bob], [cx + 22, 44 + bob], [cx + 31, base - 1], [cx - 31, base - 1]], PAL.purple);
  p.poly([[cx + 6, 44 + bob], [cx + 22, 44 + bob], [cx + 31, base - 1], [cx + 10, base - 1]], PAL.purpleD);
  p.rect(cx - 31, base - 3, 62, 2, PAL.gold);
  // pés e calça
  p.ellipse(cx - 10, base - 3, 7, 3, PAL.shoe); p.ellipse(cx + 10, base - 3, 7, 3, PAL.shoe);
  p.rect(cx - 17, base - 10, 34, 7, PAL.cartPants);
  p.rect(cx - 0.5, base - 8, 1, 5, PAL.cartPantsD);
  // jaqueta
  p.ellipse(cx, 59 + bob, 23, 15, PAL.cartJacket, -1e9, base - 9);
  p.ellipse(cx, 59 + bob, 23, 15, PAL.cartJacketD, -1e9, base - 9, cx + 9, 1e9);
  p.rect(cx - 0.5, 50 + bob, 1, base - 60 - bob, PAL.cartJacketD);
  // gola de arminho
  p.ellipse(cx, 46 + bob, 21, 4, PAL.ermine);
  for (let i = -18; i <= 18; i += 5) p.px(cx + i, 46 + bob + ((i / 5) % 2 ? 1 : 0), PAL.ol);
  // braços/luvas e cetro
  const raise = pose === 'attack';
  const hR = raise ? [cx + 25, 36 + bob] : [cx + 24, 58 + bob];
  const hL = [cx - 24, 58 + bob];
  const top = [hR[0] + (raise ? 2 : 4), hR[1] - 22];
  p.line(hR[0], hR[1] + 8, top[0], top[1] + 4, PAL.goldD, 2);
  p.line(hR[0] - 1, hR[1] + 8, top[0] - 1, top[1] + 4, PAL.gold, 1);
  // orbe de Cheesy Poof no cetro
  for (const [dx, dy, r] of [[0, 0, 4.5], [-3, -2, 3], [3, -2, 3], [0, -4, 3]]) p.circle(top[0] + dx, top[1] + dy, r, '#f59a2a');
  p.px(top[0] - 1, top[1] - 3, '#ffd080'); p.px(top[0] + 2, top[1] - 1, '#ffd080');
  p.circle(hL[0], hL[1], 4.6, PAL.cartYellow); p.circle(hR[0], hR[1], 4.6, PAL.cartYellow);
  p.circle(hL[0] + 1.5, hL[1] + 1, 3, PAL.cartYellowD);
  p.circle(hL[0], hL[1], 4.6, PAL.cartYellow);
  // cabeça
  drawHead(p, 'cartman', cx, 30 + bob, 18, { expr: expr === 'cry' ? 'sad' : expr, crown: true, mouth: expr === 'cry' ? 'shout' : undefined });
  if (expr === 'cry') {
    for (const s of [-1, 1]) { p.rect(cx + s * 6 - 1, 36 + bob, 2, 9, '#7ad0ff'); p.px(cx + s * 6, 46 + bob, '#7ad0ff'); }
  }
}

/* ---------- Butters ---------- */
function drawButtersHead(p, cx, cy, r, expr) {
  p.ellipse(cx, cy, r, r, PAL.skin);
  drawEyes(p, cx, cy + r * 0.07, r, expr, {});
  drawMouth(p, cx, cy + r * 0.58, r, EXPR_MOUTH[expr] || 'line');
  // cabelo loiro
  const hair = '#f8e070', hairD = '#d8b840';
  p.ellipse(cx, cy, r + 0.6, r + 0.6, hair, -1e9, cy - r * 0.42);
  p.ellipse(cx, cy, r + 0.6, r + 0.6, hairD, -1e9, cy - r * 0.42, cx + r * 0.5, 1e9);
  const t = Math.max(1, r * 0.12);
  p.ellipse(cx - r * 0.1, cy - r - t, t * 1.4, t * 1.6, hair);
  p.ellipse(cx + r * 0.25, cy - r - t * 0.6, t, t * 1.2, hair);
}
PORTRAITS.butters = (expr) => {
  const p = new Painter(48, 48);
  p.ellipse(24, 52, 15, 14, '#36b4a4'); p.ellipse(24, 52, 15, 14, '#248878', -1e9, 1e9, 26, 1e9);
  drawButtersHead(p, 24, 25, 17.5, expr);
  return p.outline().c;
};
function drawButtersKid(p, cx, base, expr = 'happy', f = 0) {
  const tw = 7, torsoTop = base - 14 - (f === 1 ? 1 : 0), torsoBot = base - 5;
  for (const s of [-1, 1]) p.ellipse(cx + s * 3.6, base - 2, 3.1, 1.7, PAL.shoe);
  p.rect(cx - tw + 1, torsoBot - 1, (tw - 1) * 2, 3, '#2a3c80');
  p.rect(cx - tw, torsoTop + 1, tw * 2, torsoBot - torsoTop - 1, '#36b4a4');
  p.rect(cx + 2, torsoTop + 1, tw - 2, torsoBot - torsoTop - 1, '#248878');
  p.ellipse(cx - tw - 0.6, torsoTop + 5, 2.2, 2.2, PAL.skin);
  p.ellipse(cx + tw + 0.6, torsoTop + 5 - (f === 1 ? 3 : 0), 2.2, 2.2, PAL.skin);
  drawButtersHead(p, cx, base - 21 - (f === 1 ? 1 : 0), 9.5, expr);
}

/* ---------- Sr. Mackey (orientador) ---------- */
function drawMackeyHead(p, cx, cy, r, expr) {
  const rx = r * 1.32, ry = r * 1.0;
  p.ellipse(cx, cy, rx, ry, PAL.skin);
  // cabelo castanho repartido
  p.ellipse(cx, cy, rx + 0.6, ry + 0.6, '#7a4a26', -1e9, cy - ry * 0.5);
  p.line(cx, cy - ry - 0.5, cx, cy - ry * 0.55, '#5a3418', 1);
  drawEyes(p, cx, cy + ry * 0.02, r, expr, {});
  drawMouth(p, cx, cy + ry * 0.55, r, EXPR_MOUTH[expr] || 'line');
}
PORTRAITS.mackey = (expr) => {
  const p = new Painter(48, 48);
  p.ellipse(24, 54, 14, 12, '#dde8f4');
  p.poly([[22, 43], [26, 43], [27, 48], [21, 48]], '#7a2a8a');
  drawMackeyHead(p, 24, 24, 13.5, expr);
  return p.outline().c;
};
function drawMackey(p, cx, base, f = 0) {
  for (const s of [-1, 1]) p.ellipse(cx + s * 3, base - 2, 3.2, 1.6, '#3a2a1a');
  p.rect(cx - 5, base - 14, 4, 12, '#6a5040'); p.rect(cx + 1, base - 14, 4, 12, '#5a4030');
  if (f % 2) { p.rect(cx - 5, base - 14, 4, 11, '#6a5040'); }
  p.rect(cx - 7, base - 28, 14, 15, '#dde8f4');
  p.rect(cx + 2, base - 28, 5, 15, '#c0cce0');
  p.poly([[cx - 1, base - 28], [cx + 1, base - 28], [cx + 2, base - 18], [cx, base - 16], [cx - 2, base - 18]], '#7a2a8a');
  p.ellipse(cx - 8, base - 15, 1.8, 2, PAL.skin); p.ellipse(cx + 8, base - 15, 1.8, 2, PAL.skin);
  p.rect(cx - 8.5, base - 27, 2, 11, '#dde8f4'); p.rect(cx + 6.5, base - 27, 2, 11, '#c0cce0');
  drawMackeyHead(p, cx, base - 38, 9, 'neutral');
}

/* ---------- Oficial Barbrady ---------- */
function drawBarbrady(p, cx, base, f = 0) {
  for (const s of [-1, 1]) p.ellipse(cx + s * 3, base - 2, 3.2, 1.6, '#111');
  p.rect(cx - 5, base - 15, 4, 13, '#22305a'); p.rect(cx + 1, base - 15, 4, 13, '#1a2648');
  p.rect(cx - 8, base - 31, 16, 17, '#2c3c70'); p.rect(cx + 2, base - 31, 6, 17, '#22305a');
  p.px(cx - 4, base - 27, PAL.gold); p.px(cx - 3, base - 27, PAL.gold); p.px(cx - 4, base - 26, PAL.gold);
  p.rect(cx - 8, base - 17, 16, 2, '#111');
  p.ellipse(cx - 9, base - 17, 1.8, 2, PAL.skin); p.ellipse(cx + 9, base - 17, 1.8, 2, PAL.skin);
  p.ellipse(cx, base - 39, 7.5, 8, PAL.skin);
  p.rect(cx - 6, base - 41, 12, 3, '#111');
  p.rect(cx - 0.5, base - 41, 1, 1, '#555');
  p.rect(cx - 3, base - 34, 6, 1, PAL.ol);
  p.rect(cx - 8, base - 47, 16, 4, '#22305a'); p.rect(cx - 9, base - 44, 18, 2, '#111');
  p.px(cx, base - 46, PAL.gold);
}

/* ---------- Retrato do Goomba ---------- */
PORTRAITS.goomba = (expr) => {
  const p = new Painter(48, 48);
  p.poly([[6, 48], [42, 48], [36, 38], [12, 38]], PAL.cape);
  p.poly([[26, 48], [42, 48], [36, 38], [28, 38]], PAL.capeD);
  drawGoomba(p, 24, 62, 1.1, { expr, noCape: true });
  p.ellipse(24, 45, 2.6, 2.2, PAL.gold);
  return p.outline().c;
};

/* ---------- Construtores com cache ---------- */
const ENEMY_ART = {
  cheesinho: { w: 42, h: 40, draw: drawCheesinho, frames: 2 },
  peru: { w: 48, h: 48, draw: drawPeru, frames: 2 },
  clyde: { w: 44, h: 42, draw: drawClyde, frames: 2 },
  srchapeu: { w: 34, h: 50, draw: drawSrChapeu, frames: 2 },
  mbp: { w: 64, h: 66, draw: drawMBP, frames: 2 },
  goomba: { w: 52, h: 52, draw: (p, f, expr) => drawGoomba(p, 26, 50, 1, { frame: f, expr, squash: expr === 'squash' }), frames: 4 },
  cartman: { w: 76, h: 80, draw: (p, f, expr, pose) => drawCartmanBoss(p, f, expr, pose), frames: 2 },
};
Spr.enemy = function (id, f = 0, expr, pose) {
  const a = ENEMY_ART[id];
  return this.get(`en:${id}:${f}:${expr || ''}:${pose || ''}`, () => {
    const p = new Painter(a.w, a.h);
    if (expr === undefined) a.draw(p, f); else a.draw(p, f, expr, pose);
    return p.outline().c;
  });
};
Spr.goombaField = function (f = 0, expr = 'angry') {
  return this.get(`gf:${f}:${expr}`, () => {
    const p = new Painter(36, 38);
    drawGoomba(p, 18, 36, 0.66, { frame: f, expr });
    return p.outline().c;
  });
};
Spr.npc = function (id, f = 0, expr = 'happy') {
  return this.get(`npc:${id}:${f}:${expr}`, () => {
    let p;
    if (id === 'mackey') { p = new Painter(34, 56); drawMackey(p, 17, 54, f); }
    else if (id === 'barbrady') { p = new Painter(30, 54); drawBarbrady(p, 15, 52, f); }
    else if (id === 'butters') { p = new Painter(28, 40); drawButtersKid(p, 14, 38, expr, f); }
    else { p = new Painter(8, 8); }
    return p.outline().c;
  });
};
