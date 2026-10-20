'use strict';
/* Arte em pixel gerada por código: pintor de pixels, personagens (campo e batalha),
   retratos com expressões e ícones de interface. */

const PAL = {
  ol: '#140c18', skin: '#ffdcb8', skinD: '#efbe96', eye: '#ffffff', pupil: '#000000', mouth: '#4a1414', tongue: '#e0606a',
  stanHat: '#3c64cc', stanHatD: '#2a4898', stanRed: '#e2322c', stanRedD: '#a81e1a', stanJacket: '#93603a', stanJacketD: '#6e4628',
  stanPants: '#3a64bc', stanPantsD: '#2a4890',
  kyleHat: '#40b050', kyleHatD: '#2a7e38', kyleHatL: '#62cc6e', kyleJacket: '#f68c2c', kyleJacketD: '#c86a16',
  kylePants: '#2a7a3c', kylePantsD: '#1e5a2c',
  kenny: '#f6922e', kennyD: '#c86c16', kennyL: '#ffb060', kennyFur: '#8c5c34', kennyFurD: '#684222', kennyGlove: '#7c4c26',
  cartHat: '#30bec6', cartHatD: '#1f8c94', cartYellow: '#f6d23c', cartYellowD: '#caa420', cartJacket: '#e2322e', cartJacketD: '#aa1e1e',
  cartPants: '#7c4c28', cartPantsD: '#5a3418',
  shoe: '#1c1c22',
  goom: '#a8602e', goomD: '#7a4220', goomL: '#c88050', goomFace: '#f4d2a2', goomFaceD: '#d8ac78', goomFeet: '#3c2410',
  cape: '#d4202e', capeD: '#8e1220', capeL: '#f05060', gold: '#f6c832', goldD: '#c8941c', goldL: '#fff0a0',
  steel: '#c8d2e6', steelD: '#8894b2', steelL: '#f2f6ff', wood: '#8a5a2c', woodD: '#5e3a18',
  purple: '#6a2c9a', purpleD: '#46186a', ermine: '#f4f4f4',
  robeG: '#1f6e3a', robeGD: '#154c28', magic: '#62ff8a', magicD: '#20b050',
};

/* ---------- Pintor de pixels ---------- */
class Painter {
  constructor(w, h) { this.c = makeCanvas(w, h); this.g = this.c.getContext('2d'); this.w = w; this.h = h; }
  col(c) { if (c) this.g.fillStyle = c; }
  px(x, y, c) { this.col(c); this.g.fillRect(Math.floor(x), Math.floor(y), 1, 1); }
  rect(x, y, w, h, c) { this.col(c); this.g.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); }
  /* Elipse preenchida por amostragem no centro do pixel; y0/y1 opcionais limitam as linhas. */
  ellipse(cx, cy, rx, ry, c, y0 = -1e9, y1 = 1e9, x0 = -1e9, x1 = 1e9) {
    this.col(c);
    const ys = Math.max(Math.floor(cy - ry - 1), Math.ceil(y0)), ye = Math.min(Math.ceil(cy + ry + 1), Math.floor(y1));
    for (let y = ys; y <= ye; y++) {
      const dy = (y + 0.5 - cy) / ry;
      if (dy * dy > 1) continue;
      const hw = rx * Math.sqrt(1 - dy * dy);
      let xs = Math.ceil(cx - hw - 0.5), xe = Math.floor(cx + hw - 0.5);
      xs = Math.max(xs, Math.ceil(x0)); xe = Math.min(xe, Math.floor(x1));
      if (xe >= xs) this.g.fillRect(xs, y, xe - xs + 1, 1);
    }
  }
  circle(cx, cy, r, c) { this.ellipse(cx, cy, r, r, c); }
  line(x0, y0, x1, y1, c, th = 1) {
    this.col(c);
    x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1);
    const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
    let err = dx + dy, o = Math.floor((th - 1) / 2);
    for (let i = 0; i < 400; i++) {
      this.g.fillRect(x0 - o, y0 - o, th, th);
      if (x0 === x1 && y0 === y1) break;
      const e2 = 2 * err;
      if (e2 >= dy) { err += dy; x0 += sx; }
      if (e2 <= dx) { err += dx; y0 += sy; }
    }
  }
  poly(pts, c) {
    this.col(c);
    let minX = 1e9, maxX = -1e9, minY = 1e9, maxY = -1e9;
    for (const [x, y] of pts) { minX = Math.min(minX, x); maxX = Math.max(maxX, x); minY = Math.min(minY, y); maxY = Math.max(maxY, y); }
    for (let y = Math.floor(minY); y <= Math.ceil(maxY); y++) {
      for (let x = Math.floor(minX); x <= Math.ceil(maxX); x++) {
        const px = x + 0.5, py = y + 0.5;
        let inside = false;
        for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
          const [xi, yi] = pts[i], [xj, yj] = pts[j];
          if ((yi > py) !== (yj > py) && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) inside = !inside;
        }
        if (inside) this.g.fillRect(x, y, 1, 1);
      }
    }
  }
  /* Contorno automático: pinta os pixels vazios vizinhos à silhueta. */
  outline(color = PAL.ol, diag = false) {
    const { w, h } = this;
    const id = this.g.getImageData(0, 0, w, h), d = id.data;
    const solid = new Uint8Array(w * h);
    for (let i = 0; i < w * h; i++) solid[i] = d[i * 4 + 3] > 0 ? 1 : 0;
    const [r, g, b] = hexRgb(color);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const i = y * w + x;
      if (solid[i]) continue;
      let n = (x > 0 && solid[i - 1]) || (x < w - 1 && solid[i + 1]) || (y > 0 && solid[i - w]) || (y < h - 1 && solid[i + w]);
      if (!n && diag) n = (x > 0 && y > 0 && solid[i - w - 1]) || (x < w - 1 && y > 0 && solid[i - w + 1]) || (x > 0 && y < h - 1 && solid[i + w - 1]) || (x < w - 1 && y < h - 1 && solid[i + w + 1]);
      if (n) { d[i * 4] = r; d[i * 4 + 1] = g; d[i * 4 + 2] = b; d[i * 4 + 3] = 255; }
    }
    this.g.putImageData(id, 0, 0);
    return this;
  }
  get canvas() { return this.c; }
}
function hexRgb(hex) {
  const h = hex.replace('#', '');
  const n = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
/* Recolore uma imagem inteira (silhueta) — usado em flashes de dano/poupar. */
function silhouette(img, color) {
  const c = makeCanvas(img.width, img.height), x = c.getContext('2d');
  x.drawImage(img, 0, 0);
  x.globalCompositeOperation = 'source-in';
  x.fillStyle = color; x.fillRect(0, 0, c.width, c.height);
  return c;
}
function flipX(img) {
  const c = makeCanvas(img.width, img.height), x = c.getContext('2d');
  x.translate(img.width, 0); x.scale(-1, 1); x.drawImage(img, 0, 0);
  return c;
}
function rotate90(img, ccw = true) {
  const c = makeCanvas(img.height, img.width), x = c.getContext('2d');
  if (ccw) { x.translate(0, img.width); x.rotate(-Math.PI / 2); } else { x.translate(img.height, 0); x.rotate(Math.PI / 2); }
  x.drawImage(img, 0, 0);
  return c;
}
/* Desenha de uma "bitmap" em texto: cada caractere é uma cor do mapa. */
function fromRows(rows, map) {
  const h = rows.length, w = Math.max(...rows.map((r) => r.length));
  const p = new Painter(w, h);
  rows.forEach((r, y) => { for (let x = 0; x < r.length; x++) { const c = map[r[x]]; if (c) p.px(x, y, c); } });
  return p.c;
}

/* ---------- Rostos estilo South Park ---------- */
/* Corta a parte de cima do olho (pálpebra/sobrancelha) acima da linha lim(x). */
function cutEye(p, ex, ey, erx, ery, lim, skin, ol, th) {
  for (let y = Math.floor(ey - ery - 1); y <= Math.ceil(ey + ery + 1); y++) {
    for (let x = Math.floor(ex - erx - 1); x <= Math.ceil(ex + erx + 1); x++) {
      const dx = (x + 0.5 - ex) / (erx + 0.9), dy = (y + 0.5 - ey) / (ery + 0.9);
      if (dx * dx + dy * dy > 1) continue;
      const l = lim(x + 0.5);
      if (y + 0.5 < l) p.px(x, y, skin);
      else if (y + 0.5 < l + th) p.px(x, y, ol);
    }
  }
}
function drawEyes(p, cx, ey, r, expr, o) {
  if (expr === 'laugh') expr = 'happy2';
  const big = r >= 13;
  const ex = r * 0.27, erx = r * 0.29, ery = r * (expr === 'surprised' || expr === 'shock' ? 0.36 : 0.33);
  const lw = big ? 1.1 : 0.85;
  const skin = o.skin || PAL.skin, ol = PAL.ol;
  const xs = [cx - ex, cx + ex];
  if (expr === 'closed' || expr === 'happy2' || expr === 'hurt') {
    for (const [i, x] of xs.entries()) {
      if (expr === 'happy2') { // ^ ^
        p.line(x - erx, ey + 1, x, ey - ery * 0.5, ol, big ? 2 : 1); p.line(x, ey - ery * 0.5, x + erx, ey + 1, ol, big ? 2 : 1);
      } else if (expr === 'hurt') { // > <
        const s = i === 0 ? 1 : -1;
        p.line(x - erx * s, ey - ery * 0.6, x + erx * 0.6 * s, ey, ol, big ? 2 : 1); p.line(x + erx * 0.6 * s, ey, x - erx * s, ey + ery * 0.6, ol, big ? 2 : 1);
      } else p.line(x - erx, ey + 0.5, x + erx, ey + 0.5, ol, big ? 2 : 1);
    }
    return;
  }
  for (const x of xs) p.ellipse(x, ey, erx + lw, ery + lw, ol);
  for (const x of xs) p.ellipse(x, ey, erx, ery, PAL.eye);
  // pupilas
  const look = o.look || 0, lookY = o.lookY || 0;
  const pw = big ? 2 : 1, ph = big ? 3 : 2;
  if (expr === 'x') {
    for (const x of xs) { p.line(x - erx * 0.6, ey - ery * 0.6, x + erx * 0.6, ey + ery * 0.6, ol); p.line(x + erx * 0.6, ey - ery * 0.6, x - erx * 0.6, ey + ery * 0.6, ol); }
  } else {
    const small = expr === 'surprised' || expr === 'shock';
    xs.forEach((x, i) => {
      const inward = (i === 0 ? 1 : -1) * r * 0.07;
      const px = x + inward + look * erx * 0.45, py = ey + lookY * ery * 0.4 + (big ? 0 : 0);
      if (small) p.rect(Math.round(px - (big ? 1 : 0.5)), Math.round(py - (big ? 1 : 0.5)), big ? 2 : 1, big ? 2 : 1, PAL.pupil);
      else p.rect(Math.round(px - pw / 2), Math.round(py - ph / 2), pw, ph, PAL.pupil);
    });
  }
  // pálpebras e sobrancelhas (cortes diagonais)
  const th = big ? 2 : 1;
  xs.forEach((x, i) => {
    const s = i === 0 ? 1 : -1; // s=1 olho esquerdo (centro à direita)
    let lim = null;
    if (expr === 'angry' || expr === 'grit' || expr === 'determined') {
      const k = expr === 'determined' ? 0.22 : 0.42;
      lim = (X) => ey - ery * 0.55 + ((X - x) * s) * k * (ery / erx);
    } else if (expr === 'sad' || expr === 'worried') {
      lim = (X) => ey - ery * 0.55 - ((X - x) * s) * 0.38 * (ery / erx);
    } else if (expr === 'smug' || expr === 'annoyed' || expr === 'tired') {
      lim = () => ey - ery * (expr === 'tired' ? -0.05 : 0.12);
    }
    if (lim) cutEye(p, x, ey, erx, ery, lim, skin, ol, th);
  });
}
function drawMouth(p, mx, my, r, type) {
  const big = r >= 13, s = r / 9.5, ol = PAL.ol;
  const w = Math.max(3, Math.round(r * 0.34));
  const x0 = Math.round(mx - w / 2), y = Math.round(my);
  switch (type) {
    case 'none': return;
    case 'smile':
      if (big) {
        p.ellipse(mx, my - 1, w * 0.6, r * 0.2, PAL.mouth, my - 1, 1e9);
        p.ellipse(mx, my + r * 0.12, w * 0.3, r * 0.06, PAL.tongue);
        p.line(mx - w * 0.6, my - 1, mx + w * 0.6, my - 1, ol, 1);
      } else { p.px(x0 - 1, y - 1, ol); p.rect(x0, y, w, 1, ol); p.px(x0 + w, y - 1, ol); }
      return;
    case 'frown':
      if (big) { p.line(mx - w * 0.6, my + 2, mx - w * 0.2, my, ol, 2); p.line(mx - w * 0.2, my, mx + w * 0.2, my, ol, 2); p.line(mx + w * 0.2, my, mx + w * 0.6, my + 2, ol, 2); }
      else { p.px(x0 - 1, y + 1, ol); p.rect(x0, y, w, 1, ol); p.px(x0 + w, y + 1, ol); }
      return;
    case 'open':
      p.ellipse(mx, my + s * 0.5, Math.max(1.6, r * 0.16), Math.max(1.4, r * 0.15), PAL.mouth);
      if (big) p.ellipse(mx, my + s * 0.5 + r * 0.08, r * 0.1, r * 0.06, PAL.tongue);
      return;
    case 'shout':
      p.ellipse(mx, my + s, Math.max(2.4, r * 0.26), Math.max(2, r * 0.22), PAL.mouth);
      if (big) p.ellipse(mx, my + s + r * 0.12, r * 0.15, r * 0.07, PAL.tongue);
      return;
    case 'grit':
      if (big) { p.rect(mx - w * 0.65, my - 2, w * 1.3, 5, ol); p.rect(mx - w * 0.65 + 1, my - 1, w * 1.3 - 2, 3, '#fff'); for (let i = 1; i < 4; i++) p.rect(mx - w * 0.65 + (w * 1.3 * i) / 4, my - 1, 1, 3, ol); }
      else { p.rect(x0 - 1, y - 1, w + 2, 3, ol); p.rect(x0, y, w, 1, '#fff'); }
      return;
    case 'smirk':
      if (big) { p.line(mx - w * 0.6, my + 1, mx + w * 0.2, my + 1, ol, 2); p.line(mx + w * 0.2, my + 1, mx + w * 0.7, my - 2, ol, 2); }
      else { p.rect(x0, y, w - 1, 1, ol); p.px(x0 + w - 1, y - 1, ol); }
      return;
    case 'wavy':
      for (let i = 0; i < w + 2; i++) p.px(x0 - 1 + i, y + ((i % 2) ? 0 : 1) * (big ? 1 : 0), ol);
      return;
    default: // linha
      p.rect(x0, y, w, big ? 2 : 1, ol);
  }
}
/* Faixa de chapéu: preenche as linhas [y0,y1] da elipse do chapéu. */
function hatFill(p, cx, cy, rx, ry, y0, y1, c, cd) {
  p.ellipse(cx, cy, rx, ry, c, y0, y1);
  if (cd) p.ellipse(cx, cy, rx, ry, cd, y0, y1, cx + rx * 0.5, 1e9);
}
function drawHat(p, who, cx, cy, rx, ry, facing, o) {
  const top = cy - ry, up = facing === 'up';
  const hrx = rx + 0.7, hry = ry + 0.7;
  const bandTop = up ? cy + ry * 0.0 : cy - ry * 0.48, bandBot = up ? cy + ry * 0.22 : cy - ry * 0.24;
  if (who === 'stan' || who === 'cartman') {
    const [main, mainD, band, bandD] = who === 'stan' ? [PAL.stanHat, PAL.stanHatD, PAL.stanRed, PAL.stanRedD] : [PAL.cartHat, PAL.cartHatD, PAL.cartYellow, PAL.cartYellowD];
    hatFill(p, cx, cy, hrx, hry, top - 2, bandTop, main, mainD);
    hatFill(p, cx, cy, hrx + 0.4, hry + 0.4, bandTop, bandBot, band, bandD);
    if (!o.crown) {
      const pr = Math.max(2, ry * 0.25);
      p.ellipse(cx, top - pr * 0.25, pr, pr * 0.95, band);
      p.ellipse(cx + pr * 0.35, top - pr * 0.25, pr * 0.55, pr * 0.8, bandD, -1e9, 1e9, cx + pr * 0.2, 1e9);
    } else drawCrown(p, cx, top - 1, rx);
  } else if (who === 'kyle') {
    hatFill(p, cx, cy, hrx, hry, top - 2, bandTop, PAL.kyleHat, PAL.kyleHatD);
    if (!up) hatFill(p, cx, cy, hrx + 0.4, hry + 0.4, bandTop, bandBot, PAL.kyleHatL, PAL.kyleHat);
    // abas laterais da ushanka
    const fy0 = bandTop, fy1 = cy + ry * 0.62, fw = Math.max(2.5, rx * 0.32);
    for (const s of [-1, 1]) {
      if ((facing === 'left' && s === 1) || (facing === 'right' && s === -1)) continue;
      const fx = cx + s * (rx - fw * 0.35);
      p.ellipse(fx, (fy0 + fy1) / 2, fw, (fy1 - fy0) / 2, s === 1 ? PAL.kyleHatD : PAL.kyleHat);
    }
    if (up) hatFill(p, cx, cy, hrx, hry, top - 2, bandBot, PAL.kyleHat, PAL.kyleHatD);
  }
}
function drawCrown(p, cx, y, rx) {
  const w = Math.max(7, Math.round(rx * 1.1)), x0 = Math.round(cx - w / 2), h = Math.max(4, Math.round(rx * 0.55));
  p.rect(x0, y - h * 0.45, w, h * 0.55, PAL.gold);
  for (let i = 0; i < 3; i++) {
    const px = x0 + (w - 1) * (i / 2);
    p.poly([[px - 1.6, y - h * 0.4], [px + 1.6, y - h * 0.4], [px, y - h - 0.5]], PAL.gold);
  }
  p.rect(x0, y - h * 0.15, w, 1, PAL.goldD);
  p.px(Math.round(cx), Math.round(y - h * 0.32), PAL.cape);
}
function drawKennyHood(p, cx, cy, rx, ry, facing, expr, o) {
  const fdx = facing === 'left' ? -1 : facing === 'right' ? 1 : 0;
  p.ellipse(cx, cy, rx * 1.05, ry * 1.02, PAL.kenny);
  p.ellipse(cx, cy, rx * 1.05, ry * 1.02, PAL.kennyD, -1e9, 1e9, cx + rx * 0.55, 1e9);
  if (facing === 'up') { p.line(cx, cy - ry * 0.8, cx, cy + ry * 0.6, PAL.kennyD); return; }
  const ox = cx + fdx * rx * 0.28, oy = cy + ry * 0.1;
  const orx = rx * 0.64, ory = ry * 0.5;
  const big = ry >= 13;
  p.ellipse(ox, oy, orx + (big ? 2.4 : 1.4), ory + (big ? 2.2 : 1.3), PAL.kennyFur);
  p.ellipse(ox, oy, orx + (big ? 2.4 : 1.4), ory + (big ? 2.2 : 1.3), PAL.kennyFurD, oy + ory * 0.4, 1e9);
  if (o.mystery) {
    p.ellipse(ox, oy, orx, ory, '#120a18');
    p.rect(Math.round(ox - orx * 0.45), Math.round(oy - 1), big ? 2 : 1, big ? 2 : 1, '#ffffff');
    p.rect(Math.round(ox + orx * 0.35), Math.round(oy - 1), big ? 2 : 1, big ? 2 : 1, '#ffffff');
    return;
  }
  p.ellipse(ox, oy, orx, ory, PAL.skin);
  // olhos dentro do capuz (um pouco menores)
  const er = ry * 0.86;
  drawEyes(p, ox, oy - ory * 0.02, er * 0.92, expr, { look: o.look ?? fdx * 0.6, lookY: o.lookY });
  // cordões do capuz
  p.px(Math.round(ox - 2), Math.round(oy + ory + (big ? 3 : 2)), PAL.kennyFurD);
  p.px(Math.round(ox + 1), Math.round(oy + ory + (big ? 3 : 2)), PAL.kennyFurD);
}
/* Cabeça completa: pele, rosto e chapéu. */
function drawHead(p, who, cx, cy, r, o = {}) {
  const facing = o.facing || 'down', expr = o.expr || 'neutral';
  const wide = who === 'cartman' ? 1.14 : 1;
  const rx = r * wide, ry = r;
  if (who === 'kenny') { drawKennyHood(p, cx, cy, rx, ry, facing, expr, o); return; }
  const fdx = facing === 'left' ? -1 : facing === 'right' ? 1 : 0;
  p.ellipse(cx, cy, rx, ry, o.skin || PAL.skin);
  if (who === 'cartman') { // bochechas
    p.ellipse(cx, cy + ry * 0.35, rx * 0.98, ry * 0.62, o.skin || PAL.skin);
  }
  if (facing !== 'up') {
    const fx = cx + fdx * rx * 0.3;
    drawEyes(p, fx, cy + ry * 0.07, r, expr, { look: o.look ?? fdx * 0.7, lookY: o.lookY, skin: o.skin });
    const mt = o.mouth || EXPR_MOUTH[expr] || 'line';
    drawMouth(p, fx + fdx * r * 0.08, cy + ry * (who === 'cartman' ? 0.6 : 0.58), r, mt);
    if (who === 'cartman' && r >= 13) { // queixo duplo
      p.line(cx - rx * 0.3, cy + ry * 0.86, cx + rx * 0.3, cy + ry * 0.86, PAL.skinD, 1);
    }
  }
  drawHat(p, who, cx, cy, rx, ry, facing, o);
}
const EXPR_MOUTH = {
  neutral: 'line', happy: 'smile', happy2: 'smile', angry: 'frown', grit: 'grit', sad: 'frown', worried: 'wavy',
  surprised: 'open', shock: 'shout', smug: 'smirk', annoyed: 'line', tired: 'line', determined: 'line', closed: 'line',
  hurt: 'open', x: 'open', shout: 'shout', laugh: 'shout',
};

/* ---------- Corpos das crianças ---------- */
const KIDS = {
  stan: { jacket: [PAL.stanJacket, PAL.stanJacketD], pants: [PAL.stanPants, PAL.stanPantsD], glove: PAL.stanRed, wf: 1, zip: true },
  kyle: { jacket: [PAL.kyleJacket, PAL.kyleJacketD], pants: [PAL.kylePants, PAL.kylePantsD], glove: PAL.kyleHat, wf: 1, zip: true },
  kenny: { jacket: [PAL.kenny, PAL.kennyD], pants: [PAL.kenny, PAL.kennyD], glove: PAL.kennyGlove, wf: 1, zip: false },
  cartman: { jacket: [PAL.cartJacket, PAL.cartJacketD], pants: [PAL.cartPants, PAL.cartPantsD], glove: PAL.cartYellow, wf: 1.55, zip: true },
};

/* o: {facing, frame, dark, expr, handL:[x,y], handR:[x,y], weapon:{type, ang, hand:'R'}, bob, crouch, look} */
function drawKid(p, who, cx, base, o = {}) {
  const k = KIDS[who];
  const facing = o.facing || 'down', fr = o.frame || 0;
  const walkBob = fr === 1 || fr === 3 ? -1 : 0;
  const bob = walkBob + (o.bob || 0) + (o.crouch ? 1 : 0);
  const wf = k.wf;
  const tw = Math.round(7 * wf);
  const dark = !!o.dark;
  const fdx = facing === 'left' ? -1 : facing === 'right' ? 1 : 0;
  const footY = base - 2;
  const torsoTop = base - 14 + bob, torsoBot = base - 5;
  const headCy = base - 21 + bob + (who === 'cartman' ? 0 : 0), headR = who === 'cartman' ? 10 : 9.5;
  const [jc, jcd] = k.jacket, [pc, pcd] = k.pants;

  // capa (atrás)
  if (dark && (who === 'stan' || who === 'cartman') && facing !== 'up') {
    const capeC = who === 'stan' ? PAL.cape : PAL.purple, capeD = who === 'stan' ? PAL.capeD : PAL.purpleD;
    p.poly([[cx - tw - 1, torsoTop + 1], [cx + tw + 1, torsoTop + 1], [cx + tw + 3, base - 1], [cx - tw - 3, base - 1]], capeC);
    p.poly([[cx + tw * 0.4, torsoTop + 1], [cx + tw + 1, torsoTop + 1], [cx + tw + 3, base - 1], [cx + tw * 0.5, base - 1]], capeD);
  }
  // pés
  const lift = (i) => (fr === 1 && i === 0) || (fr === 3 && i === 1) ? -1 : 0;
  for (let i = 0; i < 2; i++) {
    const fx = cx + (i === 0 ? -3.6 : 3.6) * Math.min(1.25, wf) + fdx * 1.2;
    p.ellipse(fx, footY + lift(i), 3.1, 1.7, PAL.shoe);
  }
  // pernas/calça
  p.rect(cx - tw + 1, torsoBot - 1, (tw - 1) * 2, 3 - (o.crouch ? 1 : 0), pc);
  p.rect(cx - 0.5, torsoBot, 1, 2, pcd);
  // robe longo (mago/ceifador) cobre as pernas
  if (dark && (who === 'kyle' || who === 'kenny')) {
    const rc = who === 'kyle' ? PAL.robeG : PAL.kenny, rcd = who === 'kyle' ? PAL.robeGD : PAL.kennyD;
    p.poly([[cx - tw, torsoTop + 3], [cx + tw, torsoTop + 3], [cx + tw + 1.5, base - 2], [cx - tw - 1.5, base - 2]], rc);
    p.poly([[cx + tw * 0.35, torsoTop + 3], [cx + tw, torsoTop + 3], [cx + tw + 1.5, base - 2], [cx + tw * 0.45, base - 2]], rcd);
    p.rect(cx - tw - 1, base - 3, tw * 2 + 3, 1, who === 'kyle' ? PAL.gold : PAL.purple);
  }
  // tronco
  p.rect(cx - tw + 1, torsoTop, (tw - 1) * 2, 1, jc);
  p.rect(cx - tw, torsoTop + 1, tw * 2, torsoBot - torsoTop - 1, jc);
  p.rect(cx + tw * 0.35, torsoTop + 1, tw * 0.65, torsoBot - torsoTop - 1, jcd);
  if (k.zip && facing !== 'up') p.rect(cx + fdx * 2 - 0.5, torsoTop + 2, 1, torsoBot - torsoTop - 3, jcd);
  if (who === 'kenny' && facing !== 'up') { p.px(cx - 2 + fdx, torsoTop + 1, PAL.kennyFurD); p.px(cx + 1 + fdx, torsoTop + 1, PAL.kennyFurD); }
  // armadura do Stan / detalhes do Mundo Sombrio
  if (dark && who === 'stan') {
    p.rect(cx - tw + 1, torsoTop + 1, (tw - 1) * 2, 6, PAL.steel);
    p.rect(cx + 1, torsoTop + 1, tw - 2, 6, PAL.steelD);
    p.rect(cx - tw + 2, torsoTop + 2, 2, 2, PAL.steelL);
    p.rect(cx - tw, torsoBot - 2, tw * 2, 1, PAL.woodD);
    for (const s of [-1, 1]) p.ellipse(cx + s * (tw - 0.5), torsoTop + 1.5, 2.6, 2, s < 0 ? PAL.steel : PAL.steelD);
    if (facing === 'up') { p.rect(cx - tw - 1, torsoTop + 1, tw * 2 + 2, base - torsoTop - 3, PAL.cape); p.rect(cx, torsoTop + 1, tw + 1, base - torsoTop - 3, PAL.capeD); }
  }
  if (dark && who === 'kyle') {
    p.rect(cx - tw - 1, torsoTop, tw * 2 + 2, 3, PAL.robeG);
    p.rect(cx + 1, torsoTop, tw, 3, PAL.robeGD);
    if (facing !== 'up') { p.px(cx + fdx * 2, torsoTop + 4, PAL.gold); p.px(cx + fdx * 2 - 1, torsoTop + 5, PAL.gold); p.px(cx + fdx * 2 + 1, torsoTop + 5, PAL.gold); p.px(cx + fdx * 2, torsoTop + 6, PAL.gold); }
    if (facing === 'up') p.rect(cx - tw - 1, torsoTop, tw * 2 + 2, base - torsoTop - 3, PAL.robeG);
  }
  if (dark && who === 'kenny') {
    p.rect(cx - tw, torsoBot - 3, tw * 2, 1, PAL.purple);
    p.px(cx + fdx * 2 + 1, torsoBot - 2, PAL.purple);
  }
  if (dark && who === 'cartman') {
    p.rect(cx - tw - 1, torsoTop, tw * 2 + 2, 2, PAL.ermine);
    for (let i = -tw; i <= tw; i += 3) p.px(cx + i, torsoTop + 1, PAL.ol);
    if (facing === 'up') { p.rect(cx - tw - 2, torsoTop + 1, tw * 2 + 4, base - torsoTop - 2, PAL.purple); p.rect(cx, torsoTop + 1, tw + 2, base - torsoTop - 2, PAL.purpleD); }
  }
  // mãos (luvas)
  const hb = fr === 1 ? -1 : fr === 3 ? 1 : 0;
  const hL = o.handL || [cx - tw - 0.6, torsoTop + 5 + hb], hR = o.handR || [cx + tw + 0.6, torsoTop + 5 - hb];
  // arma atrás da mão direita
  if (o.weapon) drawWeapon(p, o.weapon.type, hR[0], hR[1], o.weapon.ang, 'back');
  p.ellipse(hL[0], hL[1], 2.3, 2.3, k.glove);
  // cabeça
  drawHead(p, who, cx + (o.headDx || 0), headCy, headR, { facing, expr: o.expr, crown: dark && who === 'cartman', look: o.look, lookY: o.lookY, mystery: o.mystery });
  if (o.weapon) drawWeapon(p, o.weapon.type, hR[0], hR[1], o.weapon.ang, 'front');
  p.ellipse(hR[0], hR[1], 2.3, 2.3, k.glove);
  if (o.weapon && o.weapon.type === 'sword') drawWeapon(p, 'sword', hR[0], hR[1], o.weapon.ang, 'guard');
}

function drawWeapon(p, type, hx, hy, ang, layer) {
  const c = Math.cos(ang), s = Math.sin(ang), nx = -s, ny = c;
  if (type === 'sword') {
    if (layer === 'front') {
      for (let i = 3; i <= 14; i++) {
        p.px(hx + c * i, hy + s * i, PAL.steelL);
        p.px(hx + c * i + nx, hy + s * i + ny, PAL.steelD);
      }
      p.px(hx + c * 15, hy + s * 15, PAL.steelL);
    } else if (layer === 'back') {
      p.line(hx - c * 3, hy - s * 3, hx, hy, PAL.woodD, 2);
      p.px(hx - c * 4, hy - s * 4, PAL.gold);
    } else if (layer === 'guard') {
      p.line(hx + c * 2.5 + nx * 3, hy + s * 2.5 + ny * 3, hx + c * 2.5 - nx * 3, hy + s * 2.5 - ny * 3, PAL.gold, 1);
    }
  } else if (type === 'staff') {
    if (layer === 'back') p.line(hx - c * 6, hy - s * 6, hx + c * 11, hy + s * 11, PAL.wood, 1);
    if (layer === 'front') {
      p.line(hx - c * 6, hy - s * 6, hx + c * 11, hy + s * 11, PAL.wood, 1);
      p.circle(hx + c * 13, hy + s * 13, 2.8, PAL.magicD);
      p.circle(hx + c * 13 - 0.4, hy + s * 13 - 0.4, 1.9, PAL.magic);
      p.px(hx + c * 13 - 1, hy + s * 13 - 1, '#ffffff');
    }
  } else if (type === 'scythe') {
    if (layer === 'back') p.line(hx - c * 6, hy - s * 6, hx + c * 12, hy + s * 12, PAL.woodD, 1);
    if (layer === 'front') {
      p.line(hx - c * 6, hy - s * 6, hx + c * 12, hy + s * 12, PAL.wood, 1);
      const tx = hx + c * 12, ty = hy + s * 12;
      for (let t = 0; t <= 9; t++) {
        const bx = tx - nx * t - c * t * t * 0.07, by = ty - ny * t - s * t * t * 0.07;
        p.px(bx, by, PAL.steelL);
        p.px(bx - c, by - s, PAL.steelD);
      }
    }
  }
}

/* ---------- Cache de sprites ---------- */
const Spr = {
  cache: new Map(),
  get(key, build) {
    let c = this.cache.get(key);
    if (!c) { c = build(); this.cache.set(key, c); }
    return c;
  },
  /* Sprite de campo: who, mundo ('light'|'dark'), direção, quadro 0-3 */
  kid(who, dark, facing, frame, extra = '') {
    return this.get(`kid:${who}:${dark ? 1 : 0}:${facing}:${frame}:${extra}`, () => {
      const wide = who === 'cartman';
      const p = new Painter(wide ? 36 : 28, 40);
      drawKid(p, who, wide ? 18 : 14, 38, { facing, frame, dark, mystery: extra === 'mystery', expr: extra && extra !== 'mystery' ? extra : 'neutral' });
      return p.outline().c;
    });
  },
  /* Sprite de batalha com pose */
  battle(who, pose, f = 0) {
    return this.get(`bat:${who}:${pose}:${f}`, () => buildBattleSprite(who, pose, f));
  },
  face(who, expr = 'neutral') {
    return this.get(`face:${who}:${expr}`, () => buildPortrait(who, expr));
  },
  head(who, size = 7, expr = 'neutral') {
    return this.get(`head:${who}:${size}:${expr}`, () => {
      const p = new Painter(size * 2 + 6, size * 2 + 6);
      drawHead(p, who, size + 3, size + 3.5, size, { expr, crown: false });
      return p.outline().c;
    });
  },
};

const WEAPON_OF = { stan: 'sword', kyle: 'staff', kenny: 'scythe' };
function buildBattleSprite(who, pose, f) {
  const p = new Painter(48, 44);
  const cx = 18, base = 41;
  const wt = WEAPON_OF[who];
  const o = { facing: 'right', dark: true, expr: 'neutral', frame: 0 };
  const torsoTop = base - 14;
  const D = (deg) => (deg * Math.PI) / 180;
  switch (pose) {
    case 'idle':
      o.bob = f % 2 ? 0 : 0; o.expr = 'neutral';
      o.handR = [cx + 8, torsoTop + 6 + (f % 2)];
      o.weapon = { type: wt, ang: wt === 'sword' ? D(55) : D(-80) };
      if (f % 2) o.bob = 1;
      break;
    case 'attack': {
      const angs = wt === 'sword' ? [-125, -40, 35] : wt === 'staff' ? [-120, -30, 10] : [-130, -50, 25];
      const hands = [[cx - 2, torsoTop - 2], [cx + 9, torsoTop + 1], [cx + 10, torsoTop + 6]];
      o.handR = hands[f]; o.weapon = { type: wt, ang: D(angs[f]) }; o.expr = 'determined'; o.headDx = f === 2 ? 1 : 0;
      break;
    }
    case 'act':
      o.handR = [cx + 10, torsoTop - 1 + (f % 2)]; o.expr = f % 2 ? 'happy' : 'neutral'; o.mouth = 'open';
      break;
    case 'spell':
      o.handR = [cx + 7, torsoTop - 5 + (f % 2)]; o.weapon = { type: wt || 'staff', ang: D(-75) }; o.expr = 'determined';
      break;
    case 'defend':
      o.crouch = true; o.handR = [cx + 7, torsoTop + 4]; o.handL = [cx + 4, torsoTop + 5]; o.expr = 'determined';
      o.weapon = { type: wt, ang: D(wt === 'sword' ? -95 : -100) };
      break;
    case 'hurt':
      o.expr = 'hurt'; o.headDx = -1; o.handR = [cx + 6, torsoTop + 2]; o.handL = [cx - 9, torsoTop + 2];
      break;
    case 'item':
      o.handR = [cx + 9, torsoTop + 2]; o.expr = 'happy';
      break;
    case 'victory':
      o.handR = [cx + 8, torsoTop - 6]; o.handL = [cx - 8, torsoTop - 6]; o.expr = 'happy';
      o.weapon = { type: wt, ang: D(-80) };
      break;
    case 'down': {
      const q = new Painter(48, 44);
      drawKid(q, who, cx, base, { facing: 'right', dark: true, expr: 'x', handR: [cx + 8, torsoTop + 6] });
      q.outline();
      const r = rotate90(q.c, false);
      const c = makeCanvas(48, 44), x = c.getContext('2d');
      x.drawImage(r, 2, 44 - 30, r.width, r.height);
      return c;
    }
    default: break;
  }
  drawKid(p, who, cx, base, o);
  return p.outline().c;
}

function buildPortrait(who, expr) {
  if (PORTRAITS[who]) return PORTRAITS[who](expr);
  const p = new Painter(48, 48);
  const kid = KIDS[who];
  if (kid) {
    const [jc, jcd] = kid.jacket;
    const ww = who === 'cartman' ? 22 : 15;
    p.ellipse(24, 52, ww, 14, jc);
    p.ellipse(24, 52, ww, 14, jcd, -1e9, 1e9, 26, 1e9);
    if (who === 'kenny') { p.ellipse(24, 52, ww, 14, PAL.kenny); }
  }
  drawHead(p, who, 24, 25, who === 'cartman' ? 17 : 17.5, { expr, facing: 'down' });
  return p.outline().c;
}
const PORTRAITS = {}; // retratos especiais (Goomba, Butters, Mackey...) — definidos em gfx_enemies

/* ---------- Ícones ---------- */
const ICON = {};
function buildIcons() {
  const heart = ['.##..##.', '########', '########', '########', '.######.', '..####..', '...##...'];
  ICON.heart = fromRows(heart, { '#': '#ff0000' });
  ICON.soul = fromRows(heart.slice().reverse(), { '#': '#ff0000' });
  ICON.soulW = fromRows(heart.slice().reverse(), { '#': '#ffffff' });
  ICON.heartY = fromRows(heart, { '#': '#ffff00' });
  ICON.star = fromRows(['...#...', '...#...', '..###..', '#######', '.#####.', '.##.##.', '##...##'], { '#': '#ffff40' });
  ICON.bang = fromRows(['.###.', '#!!!#', '#!!!#', '#!!!#', '.#!#.', '.#!#.', '..#..', '.###.', '.#!#.', '.###.'], { '#': '#000000', '!': '#ffffff' });
  ICON.dollar = fromRows(['.##.', '##..', '.##.', '..##', '.##.'], { '#': '#ffffff' });
  // botões de batalha (12x12 desenhados em branco; coloridos na hora)
  const B = (rows) => fromRows(rows, { '#': '#ffffff' });
  ICON.btn = {
    fight: B(['.........##.', '........###.', '.......###..', '......###...', '.....###....', '#...###.....', '.#.###......', '..###.......', '..##........', '.#..#.......', '#....#......', '............']),
    act: B(['............', '.#########..', '#.........#.', '#..#.#.#..#.', '#..#.#.#..#.', '#.........#.', '.######..#..', '......#.#...', '......##....', '.......#....', '............', '............']),
    magic: B(['.....#......', '.....#......', '....###.....', '#############', '...#####....', '...##.##....', '..##...##...', '.#.......#..', '............', '...#....#...', '..###..###..', '...#....#...']),
    item: B(['....####....', '...#....#...', '....####....', '..########..', '.#........#.', '#..######..#', '#..#....#..#', '#..######..#', '#..........#', '#..........#', '.##########.', '............']),
    spare: B(['............', '.##......##.', '.###....###.', '..###..###..', '...######...', '....####....', '....####....', '...######...', '..###..###..', '.###....###.', '.##......##.', '............']),
    defend: B(['.##########.', '.#........#.', '.#.######.#.', '.#.######.#.', '.#.######.#.', '.#..####..#.', '..#.####.#..', '..#..##..#..', '...#....#...', '....#..#....', '.....##.....', '............']),
  };
  ICON.save = [
    fromRows(['.....#.....', '.....#.....', '....###....', '...#####...', '###########', '.#########.', '...#####...', '....###....', '.....#.....', '.....#.....'], { '#': '#ffff00' }),
    fromRows(['...........', '.....#.....', '.....#.....', '....###....', '..#######..', '...#####...', '....###....', '.....#.....', '.....#.....', '...........'], { '#': '#ffffa0' }),
  ];
  Font.icons['♥'] = ICON.heart;
  Font.icons['♡'] = ICON.soul;
  Font.icons['★'] = ICON.star;
}
