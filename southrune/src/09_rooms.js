'use strict';
/* Salas, mapas e cutscenes da história do Capítulo 1. */

/* Mapa a partir de retângulos "esculpidos" num fundo vazio. ops: [char, x0, y0, x1, y1] */
function carve(w, h, ops, fill = '#') {
  const m = Array.from({ length: h }, () => Array(w).fill(fill));
  for (const [ch, x0, y0, x1, y1] of ops) for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (m[y] && x < w) m[y][x] = ch;
  return m.map((r) => r.join(''));
}
function painterFor(g) { const p = Object.create(Painter.prototype); p.g = g; p.c = g.canvas; p.w = g.canvas.width; p.h = g.canvas.height; return p; }
const kidObj = (who, x, y, facing = 'down', o = {}) => Object.assign({ type: 'kid', kind: 'kid', who, x, y, facing, name_: who }, o);
const T = (tx, ty) => [tx * 16 + 8, ty * 16 + 12];
function lyingSprite(who) { return Spr.get('lying:' + who, () => rotate90(Spr.kid(who, true, 'down', 0), false)); }
function treeObj(x, y) { return { type: 'prop', name: 'tree', x, y, solid: [10, 6] }; }

/* ---------- Pintura do Mundo da Luz ---------- */
function drawHouse(p, x, base, w, h, wall, wallD, roof) {
  const top = base - h;
  p.rect(x - 1, top - 1, w + 2, h + 1, PAL.ol);
  p.rect(x, top, w, h, wall);
  p.rect(x + w - 12, top, 12, h, wallD);
  p.poly([[x - 9, top + 2], [x + w / 2, top - h * 0.62 - 1], [x + w + 9, top + 2]], PAL.ol);
  p.poly([[x - 7, top + 1], [x + w / 2, top - h * 0.62], [x + w + 7, top + 1]], roof);
  p.poly([[x - 7, top + 1], [x + w / 2, top - h * 0.62], [x + w + 7, top + 1], [x + w + 3, top - 2], [x + w / 2, top - h * 0.62 + 6], [x - 3, top - 2]], '#f4f8ff');
  const dx = Math.round(x + w * 0.42);
  p.rect(dx - 1, base - 27, 16, 27, PAL.ol); p.rect(dx, base - 26, 14, 26, '#6a4428'); p.px(dx + 10, base - 13, PAL.gold);
  for (const wx of [x + 8, x + w - 32]) {
    p.rect(wx - 1, top + 13, 20, 16, PAL.ol); p.rect(wx, top + 14, 18, 14, '#ffe9a8');
    p.rect(wx + 8, top + 14, 1, 14, '#6a5040'); p.rect(wx, top + 20, 18, 1, '#6a5040');
  }
  p.rect(x - 4, base - 4, w + 8, 4, '#e4ecf8');
}
function paintTown(g, w) {
  const p = painterFor(g);
  for (let x = -10; x < w; x += 46) g.drawImage(Spr.prop('pine'), x + ((x / 46) % 2) * 14, 58);
  drawHouse(p, 22, 112, 100, 58, '#9cbad8', '#7a98bc', '#5a4a6a');
  drawHouse(p, 190, 112, 82, 50, '#e0a8a0', '#c08880', '#4a3a5a');
  drawHouse(p, 330, 112, 100, 58, '#e8d8a8', '#c8b888', '#6a3a3a');
  p.rect(0, 108, w, 4, '#e4ecf8');
}
function paintSchool(g, w) {
  const p = painterFor(g);
  for (let x = -10; x < w; x += 52) g.drawImage(Spr.prop('pine'), x, 58);
  const x0 = 56, x1 = 424, top = 22, base = 112;
  p.rect(x0 - 1, top - 1, x1 - x0 + 2, base - top + 1, PAL.ol);
  p.rect(x0, top, x1 - x0, base - top, '#b85a48');
  for (let y = top + 4; y < base; y += 6) { p.rect(x0, y, x1 - x0, 1, '#9a4436'); for (let x = x0 + ((y / 6) % 2) * 8; x < x1; x += 16) p.rect(x, y - 5, 1, 5, '#9a4436'); }
  p.rect(x0 - 4, top - 6, x1 - x0 + 8, 7, '#7a3a30');
  p.rect(150, 28, 180, 16, '#f4f0e0'); p.rect(150, 28, 180, 1, PAL.ol); p.rect(150, 43, 180, 1, PAL.ol);
  Font.draw(g, 'ESCOLA DE SOUTH PARK', 240, 27, '#2a3a8a', { align: 'center' });
  for (const wx of [76, 120, 330, 374]) for (const wy of [52, 80]) { p.rect(wx - 1, wy - 1, 28, 20, PAL.ol); p.rect(wx, wy, 26, 18, '#a8d0f0'); p.rect(wx + 12, wy, 1, 18, '#f4f0e0'); }
  p.rect(219, 64, 42, 48, PAL.ol); p.rect(220, 65, 40, 47, '#5a3a24');
  p.rect(222, 67, 17, 45, '#7a5434'); p.rect(241, 67, 17, 45, '#7a5434'); p.px(236, 90, PAL.gold); p.px(244, 90, PAL.gold);
  p.rect(210, 108, 60, 4, '#c8c8d0');
  p.rect(450, 20, 2, 92, '#9a9aa8'); p.rect(452, 22, 18, 12, '#e23030'); p.rect(452, 26, 18, 2, '#fff'); p.rect(452, 30, 18, 2, '#fff');
  p.rect(0, 108, w, 4, '#e4ecf8');
}
function paintHall(g, w) {
  const p = painterFor(g);
  p.rect(0, 0, w, 96, '#8e9ec4');
  p.rect(0, 0, w, 10, '#6e7ea4');
  p.rect(0, 92, w, 4, '#5a4a3a');
  for (let x = 8; x < w - 60; x += 18) {
    if ((x > 100 && x < 150) || (x > 290 && x < 340)) continue;
    p.rect(x, 34, 16, 58, '#3e5e92'); p.rect(x, 34, 16, 1, '#2a4270'); p.rect(x + 15, 34, 1, 58, '#2a4270');
    for (let i = 0; i < 3; i++) p.rect(x + 4, 40 + i * 3, 8, 1, '#2a4270');
    p.rect(x + 12, 62, 2, 4, '#c8d0e0');
  }
  for (const dx of [112, 302]) { p.rect(dx - 1, 30, 30, 62, PAL.ol); p.rect(dx, 31, 28, 61, '#8a6a46'); p.rect(dx + 6, 38, 16, 14, '#a8d0f0'); p.px(dx + 23, 62, PAL.gold); }
  p.rect(178, 14, 52, 16, '#f4f0e0'); Mini.draw(g, 'DROGAS FAZEM', 204, 16, '#c02020', { align: 'center' }); Mini.draw(g, "MAL, M'KAY", 204, 23, '#c02020', { align: 'center' });
  p.rect(372, 16, 40, 14, '#ffe060'); Mini.draw(g, 'VAI TIME!', 392, 21, '#2a3a8a', { align: 'center' });
}

/* ---------- MUNDO DA LUZ ---------- */
const LIGHT_ROWS = (w) => carve(w, 15, [['.', 0, 7, w - 1, 9], ['-', 0, 10, w - 1, 10], ['=', 0, 11, w - 1, 11], ['+', 0, 12, w - 1, 12], ['=', 0, 13, w - 1, 13]]);

ROOMS.ponto = {
  name: 'Ponto de Ônibus', tileset: 'light', dark: false, music: 'town',
  map: LIGHT_ROWS(30),
  bg(g, cx) {
    if (hasFlag('ending')) BG.sky(g, '#f08a5a', '#ffd0a0', 130); else BG.sky(g);
    BG.mountains(g, cx, 18, hasFlag('ending') ? ['#c48a9a', '#9a6a8a'] : null);
  },
  paint: (g, w) => paintTown(g, w),
  fg(g) { if (!hasFlag('ending')) BG.snowfall(g, 35, 0.5); },
  objects: () => [
    { type: 'prop', name: 'busstop', x: 236, y: 172, solid: [6, 4] },
    { type: 'prop', name: 'snowman', x: 96, y: 150, solid: [14, 6], name_: 'snowman' },
    { type: 'prop', name: 'mailbox', x: 66, y: 126, solid: [10, 4] },
    { type: 'prop', name: 'mailbox', x: 370, y: 126, solid: [10, 4] },
    { type: 'prop', name: 'pine', x: 452, y: 150, solid: [10, 6] },
    { type: 'look', kind: 'look', visible: false, solid: false, x: 96, y: 150, area: { x: -12, y: -20, w: 24, h: 24 },
      interact: () => Dlg.say(['* (Um boneco de neve. Alguém desenhou um bigode nele.)']) },
    { type: 'look', kind: 'look', visible: false, solid: false, x: 236, y: 172, area: { x: -10, y: -30, w: 20, h: 32 },
      interact: () => Dlg.say(['* (PONTO DE ÔNIBUS. O ônibus da escola passa aqui... às vezes.)']) },
    { type: 'look', kind: 'look', visible: false, solid: false, x: 70, y: 116, area: { x: -30, y: -10, w: 60, h: 12 },
      interact: () => Dlg.say(['* (A sua casa. Sua mãe deve estar fazendo panquecas.)', '* (Ou seu pai deve estar fazendo alguma besteira.)']) },
    kidObj('kyle', 266, 170, 'left', { cond: () => !hasFlag('intro_done') && !hasFlag('ending'), talk: () => Dlg.say(['kyle: Vamos, Stan! A escola é pra direita.']) }),
    { type: 'exit', x: 468, y: 104, w: 20, h: 120, to: 'escola', tx: 20, ty: 'same', facing: 'right', cond: () => !hasFlag('ending') },
  ],
  async enter() {
    if (hasFlag('ending')) { await endingBusStop(); return; }
    if (hasFlag('intro_done')) return;
    const kyle = World.find('kyle');
    await wait(24);
    await Dlg.say([
      'kyle: E aí, Stan.',
      'stan: E aí, Kyle.',
      'kyle/annoyed: Cadê o Cartman? Ele nunca perde o ônibus. Ele adora o banco do fundo.',
      'stan: E o Kenny?',
      'kyle: O Kenny morreu ontem. De novo.',
      'stan: Ah, é.',
      'kyle: ...{p10}Ele volta.',
    ]);
    await wait(10);
    Cut.face(kyle, 'down');
    await Dlg.say([
      'kyle/worried: Mas é estranho. Ontem o Cartman passou o dia dizendo que achou um "reino secreto" no armário de materiais da escola.',
      'kyle/annoyed: Disse que ia virar IMPERADOR e que a gente ia ter que respeitar a autoridade dele.',
      'stan: Típico do Cartman.',
      '* (O ônibus não veio.)',
      'kyle: Que se dane, vamos a pé. Vem, Stan!',
    ]);
    setFlag('intro_done');
    Cut.face(kyle, 'right');
    await Cut.walk(kyle, 520, 170, 2.6);
    World.remove(kyle);
  },
};

ROOMS.escola = {
  name: 'Escola de South Park', tileset: 'light', dark: false, music: 'town',
  map: LIGHT_ROWS(30),
  bg(g, cx) { BG.sky(g); BG.mountains(g, cx, 14); },
  paint: (g, w) => paintSchool(g, w),
  fg(g) { BG.snowfall(g, 30, 0.5); },
  objects: () => [
    { type: 'npc', kind: 'npc', who: 'barbrady', x: 120, y: 150, facing: 'down', name_: 'barbrady', bw: 12,
      talk: async () => {
        await Dlg.say([{ who: 'barbrady', text: '* Ok, pessoal, circulando! Nada pra ver aqui!' }]);
        if (!hasFlag('barb2')) { setFlag('barb2'); await Dlg.say([{ who: 'barbrady', text: '* Isto é uma ES-CO-LA. É onde as crianças vão para... é... aprender a ler?' }, { who: 'barbrady', text: '* Eu acho que eu deveria tentar isso um dia.' }]); }
      } },
    kidObj('kyle', 278, 128, 'down', { cond: () => !hasFlag('fell'), talk: () => Dlg.say(['kyle: O armário de materiais fica no fim do corredor. Vamos!']) }),
    { type: 'prop', name: 'trash', x: 196, y: 124, solid: [12, 5] },
    { type: 'prop', name: 'bench', x: 360, y: 128, solid: [30, 5] },
    { type: 'exit', x: 224, y: 104, w: 32, h: 10, to: 'corredor', tx: 40, ty: 156, facing: 'right' },
    { type: 'exit', x: -12, y: 104, w: 20, h: 120, to: 'ponto', tx: 448, ty: 'same', facing: 'left' },
  ],
};

ROOMS.corredor = {
  name: 'Corredor da Escola', tileset: 'school', dark: false, music: 'town',
  map: carve(32, 15, [['f', 0, 6, 31, 12]]),
  bgColor: '#2a2a34',
  paint: (g, w) => paintHall(g, w),
  objects: () => [
    { type: 'npc', kind: 'npc', who: 'mackey', x: 212, y: 136, facing: 'down', name_: 'mackey', bw: 14,
      cond: () => !hasFlag('ending'),
      talk: async () => {
        if (!hasFlag('mackey')) {
          setFlag('mackey');
          await Dlg.say([
            'mackey: Ah, Stan. Bom dia, m\'kay.',
            'mackey/worried: O Eric entrou no armário de materiais faz uma hora e não saiu mais, m\'kay?',
            'mackey: Vá lá chamar ele. A aula já vai começar, m\'kay?',
            'mackey/happy: E lembre-se: drogas fazem mal, m\'kay.',
          ]);
        } else await Dlg.say(['mackey: O armário fica no fim do corredor, m\'kay?']);
      } },
    kidObj('kyle', 444, 128, 'right', { cond: () => !hasFlag('fell'), talk: () => closetScene() }),
    { type: 'prop', name: hasFlag('fell') ? 'closetOpen' : 'closet', x: 484, y: 98, name_: 'closet', solid: null, area: { x: -16, y: -4, w: 32, h: 30 },
      interact: () => (hasFlag('fell') ? Dlg.say(['* (O armário de materiais. Lá dentro só tem esfregões.)']) : closetScene()) },
    { type: 'look', kind: 'look', visible: false, solid: false, x: 204, y: 100, area: { x: -28, y: -6, w: 56, h: 14 },
      interact: () => Dlg.say(['* (Um cartaz: "DROGAS FAZEM MAL, M\'KAY".)', '* (Alguém escreveu embaixo: "o Cartman também".)']) },
    { type: 'exit', x: -12, y: 96, w: 20, h: 120, to: 'escola', tx: 240, ty: 124, facing: 'down' },
  ],
};
PROPS.closetOpen = (p) => {
  p.rect(0, 0, 26, 42, '#5a4a3a'); p.rect(2, 2, 22, 40, '#0a0612');
  for (let i = 0; i < 6; i++) p.rect(4 + i * 3, 30 - i * 2, 2, 12 + i * 2, i % 2 ? '#3a1a5a' : '#24103a');
  p.rect(2, 2, 22, 1, '#8a4ac0');
};
PROP_SIZE.closetOpen = [26, 42];

async function closetScene() {
  if (hasFlag('fell')) return;
  if (!hasFlag('mackey')) { await Dlg.say(['kyle: Melhor falar com o Sr. Mackey antes, cara. Ele tá ali no meio do corredor.']); return; }
  const kyle = World.find('kyle'), closet = World.find('closet');
  Music.stop(20);
  Cut.face(kyle, 'right');
  await Dlg.say(['kyle: Cartman? Você tá aí dentro?']);
  await wait(24);
  await Dlg.say(['* (Silêncio.)']);
  await Dlg.say(['kyle/worried: ...Tem uma luz estranha saindo por baixo da porta.', 'kyle: Stan... abre você.']);
  await Cut.walk(World.player, 476, 116, 1.5);
  World.player.facing = 'up';
  await wait(10);
  Sfx.play('door');
  closet.name = 'closetOpen';
  await wait(24);
  Sfx.play('rumble'); Shake.start(2, 50);
  Music.play('tension');
  await Dlg.say(['kyle/surprised: Stan, espera! Tem alguma coisa—']);
  Sfx.play('whoosh');
  await Fade.out(14);
  Music.stop();
  await Scenes.fall();
  setFlag('fell');
  G.dark = true;
  World.load('queda', 150, 116, 'down');
  await arrivalScene();
}

/* ---------- MUNDO SOMBRIO ---------- */
function darkBg(g, cx, cy, opts = {}) {
  BG.stars(g, cx, cy, opts.seed || 1, 46);
  if (opts.land !== false) BG.cartmanland(g, cx, cy, opts.alpha ?? 1);
}

ROOMS.queda = {
  name: 'Lugar da Queda', tileset: 'dark', dark: true, music: 'field',
  map: carve(20, 15, [['.', 5, 3, 14, 9], ['.', 4, 4, 15, 8], ['.', 15, 5, 19, 8], [',', 14, 6, 19, 7]]),
  bg: (g, cx, cy) => darkBg(g, cx, cy, { seed: 2 }),
  objects: () => [
    { type: 'save', x: 104, y: 96, text: ['* (Você caiu num mundo estranho e escuro.)', '* (Mesmo assim, isso te enche de DETERMINAÇÃO.)'] },
    { type: 'exit', x: 310, y: 80, w: 20, h: 64, to: 'campo1', tx: 12, ty: 'same', facing: 'right' },
  ],
};

async function arrivalScene() {
  const p = World.player;
  p.visible = false;
  const stanL = World.addObject({ type: 'img', kind: 'img', img: lyingSprite('stan'), x: 150, y: 120, solid: false });
  const kyleL = World.addObject({ type: 'img', kind: 'img', img: lyingSprite('kyle'), x: 196, y: 134, solid: false });
  Fade.color = '#ffffff';
  await Fade.to(0, 50);
  await wait(30);
  await Dlg.say(['* ...', '* (Está tudo escuro e silencioso.)']);
  World.remove(stanL);
  p.x = 150; p.y = 120; p.visible = true; p.facing = 'down';
  Sfx.play('appear');
  await wait(20);
  p.facing = 'right'; await wait(10);
  World.remove(kyleL);
  const kyle = World.addObject(kidObj('kyle', 196, 134, 'left'));
  Sfx.play('appear');
  await wait(16);
  await Dlg.say([
    'kyle/hurt: Ugh... Stan? Você tá bem?',
    'kyle/surprised: ...Cara. Por que você tá de ARMADURA?',
    'stan: Por que VOCÊ tá vestido de mago?',
  ]);
  Cut.face(kyle, 'down'); await wait(16); Cut.face(kyle, 'left');
  await Dlg.say([
    'kyle/shock: ...QUE DIABOS?!',
    'kyle/worried: Onde a gente tá? Isso não parece o armário da escola.',
    'kyle/annoyed: Deve ser o tal "reino secreto" do Cartman.',
    'kyle/determined: Vamos achar aquele gordo e dar o fora daqui.',
  ]);
  await Cut.join('kyle');
  World.adopt(kyle);
  setFlag('arrived');
  Music.play('field', { fadeIn: 20 });
}

ROOMS.campo1 = {
  name: 'Campos de Cheesy Poofs', tileset: 'dark', dark: true, music: 'field',
  map: carve(40, 15, [['.', 0, 4, 39, 8], [',', 0, 5, 39, 7], ['.', 9, 2, 15, 3], ['.', 26, 2, 33, 3], ['.', 7, 9, 15, 10], ['.', 25, 9, 32, 10]]),
  bg: (g, cx, cy) => darkBg(g, cx, cy, { seed: 3 }),
  objects: () => [
    treeObj(...T(10, 3)), treeObj(...T(14, 3)), treeObj(...T(9, 10)), treeObj(...T(27, 3)), treeObj(...T(32, 10)),
    { type: 'prop', name: 'bag', x: 200, y: 160, solid: [22, 6] },
    { type: 'prop', name: 'candy', x: 440, y: 52, solid: [6, 4] },
    { type: 'sign', x: 72, y: 76, text: ['* "BEM-VINDO AO MUNDO SOMBRIO DO IMPERADOR CARTMAN."', '* "REGRA Nº 1: RESPEITEM MINHA AUTORIDADE."', '* "REGRA Nº 2: NÃO EXISTE REGRA Nº 2."'] },
    kidObj('kenny', 476, 108, 'left', { extra: 'mystery', cond: () => !hasFlag('kenny_joined'), lockFacing: false }),
    { type: 'trigger', x: 320, y: 60, w: 12, h: 100, once: 'kenny_met', run: () => kennyScene() },
    { type: 'exit', x: 630, y: 60, w: 20, h: 100, to: 'campo2', tx: 12, ty: 'same', facing: 'right', cond: () => true },
  ],
  update(w) {
    // impede seguir antes do tutorial
    if (!hasFlag('kenny_joined') && w.player.x > 440) w.player.x = 440;
  },
};

async function kennyScene() {
  const kenny = World.find('kenny');
  Music.stop(15);
  Cut.emote(kenny);
  await wait(20);
  await Dlg.say([{ who: 'kenny', noFace: true, text: '* Mmmph! Mmph mmph!' }]);
  await Dlg.say(['kyle/surprised: Quem é você?!']);
  await Cut.walk(kenny, 400, 108, 1.2);
  await wait(10);
  await Dlg.say(['* (A figura encapuzada abaixa um pouco o capuz...)']);
  kenny.extra = '';
  Sfx.play('appear');
  await wait(14);
  await Dlg.say([
    'stan/surprised: KENNY?!',
    'kenny/happy: Mmph! (Oi, gente!)',
    'kyle/angry: Você morreu ontem, cara!',
    'kenny: Mmph mmph mmph. (É. E acordei aqui.)',
    'kenny: Mmmph... (Toda vez que eu morro eu vou parar num lugar esquisito. Esse aqui é dos legais.)',
    'kenny: Mmph. (Isso aqui é um {pu}MUNDO SOMBRIO{w}.)',
    'kenny/worried: Mmph mmph. (O Cartman achou uma {pu}FONTE SOMBRIA{w} no armário da escola e abriu ela.)',
    'kenny/annoyed: Mmmph. (Agora ele se acha o IMPERADOR daqui. E arranjou um cavaleiro muito esquisito.)',
    'kenny/worried: Mmph mmph! (Se a fonte não for fechada, a escuridão vai cobrir South Park inteira!)',
    'kyle/annoyed: Ótimo. Mais um plano idiota do Cartman.',
    'kenny: Mmph... (Mas existe uma lenda...)',
  ]);
  await Scenes.legend();
  await Dlg.say([
    'stan: ...Tem um gorro na lenda, Kyle.',
    'kyle/annoyed: Isso é ridículo.',
    'kenny/happy: Mmph! (Antes de seguir, vocês precisam aprender a lutar aqui. Eu trouxe um amigo!)',
  ]);
  const dummy = World.addObject({ type: 'prop', name: 'dummyStand', x: 456, y: 108, solid: [10, 6] });
  Sfx.play('appear');
  await wait(10);
  await Dlg.say(['* (Kenny tirou um boneco de treino de dentro do capuz.)', '* (Ninguém perguntou como.)']);
  await Cut.join('kenny');
  await Cut.walk(kenny, World.player.x + 22, World.player.y + 8, 2);
  World.adopt(kenny);
  setFlag('kenny_joined');
  await Dlg.say(['kenny: Mmph! (Vamos lá! É só um treino!)']);
  const res = await Battle.start({
    enemies: ['srchapeu'], music: 'battle', money: 0,
    intro: '* O Sr. Chapéu bloqueia o caminho!\n* (Kenny vai te ensinar a lutar.)',
    onTurn: async (B) => {
      const tips = {
        1: '* (Kenny: LUTAR ataca. AGIR faz coisas diferentes com o inimigo. POUPAR funciona quando o nome dele estiver {y}AMARELO{w}.)',
        2: '* (Kenny: No turno do inimigo, mova a sua {r}ALMA{w}. Passar raspando nas balas enche a barra de {o}TP{w}!)',
        3: '* (Kenny: TP serve para MAGIA. Kyle e eu temos magias. Agora poupe ou derrote o Sr. Chapéu!)',
      };
      if (tips[B.turn]) await B.say(tips[B.turn]);
    },
  });
  if (res === 'lose') return;
  World.remove(dummy);
  await Dlg.say(['kenny/happy: Mmph mmph! (Muito bem! Vocês são naturais!)', '* (Kenny te deu 2 {y}Cheesy Poofs{w} e 30 D$.)']);
  addItem('cheesy'); addItem('cheesy'); G.money += 30;
  Sfx.play('item');
  setFlag('tutorial_done');
  Music.play('field', { fadeIn: 20 });
}

ROOMS.campo2 = {
  name: 'Campos de Cheesy - Leste', tileset: 'dark', dark: true, music: 'field',
  map: carve(50, 15, [['.', 0, 4, 49, 8], [',', 0, 5, 49, 7], ['.', 11, 2, 19, 3], ['.', 27, 2, 40, 3], ['.', 7, 9, 19, 11], ['.', 26, 9, 39, 11]]),
  bg: (g, cx, cy) => darkBg(g, cx, cy, { seed: 4 }),
  objects: () => [
    treeObj(...T(12, 3)), treeObj(...T(18, 2)), treeObj(...T(8, 10)), treeObj(...T(28, 3)), treeObj(...T(39, 2)), treeObj(...T(38, 11)),
    { type: 'prop', name: 'lamp', x: 120, y: 76, solid: [4, 4] }, { type: 'prop', name: 'lamp', x: 520, y: 76, solid: [4, 4] },
    { type: 'prop', name: 'bag', x: 300, y: 172, solid: [22, 6] },
    { type: 'chest', id: 'c2', item: 'snacky', ...xy(15, 2) },
    { type: 'enemy', id: 'c2a', group: ['cheesinho'], x: 380, y: 104 },
    { type: 'enemy', id: 'c2b', group: ['peru'], x: 520, y: 168, sprite: 'peru' },
    { type: 'enemy', id: 'c2c', group: ['cheesinho', 'cheesinho'], x: 700, y: 104 },
    { type: 'trigger', x: 150, y: 60, w: 12, h: 100, once: 'goomba_intro', run: () => goombaIntro() },
    { type: 'exit', x: 790, y: 60, w: 20, h: 100, to: 'campo3', tx: 12, ty: 'same', facing: 'right' },
  ],
};
function xy(tx, ty) { return { x: tx * 16 + 8, y: ty * 16 + 12 }; }

async function goombaIntro() {
  Music.play('goomba');
  const gb = World.addObject({ type: 'goomba', kind: 'goomba', x: 330, y: 104, facing: 'left', name_: 'goomba', bw: 16 });
  Sfx.play('jump');
  await Cut.walk(gb, 250, 104, 3);
  await Dlg.say([
    'goomba/angry: ALTO LÁ, HERÓIS!',
    'goomba: EU SOU {r}SIR GOOMBA{w}! O CAVALEIRO DA CAPA!',
    'goomba: SERVO MAIS LEAL DO GRANDE {y}IMPERADOR CARTMAN{w}!',
    'kyle/annoyed: ...Isso é um cogumelo?',
    'goomba/shock: EU NÃO SOU UM COGUMELO! SOU UM GOOMBA! É COMPLETAMENTE DIFERENTE!',
    'goomba: Eu caí aqui vindo de um reino distante... um reino de cogumelos e canos verdes. Mas isso não importa!',
    'goomba/happy: O Imperador prometeu que, se eu acabar com vocês, ele me dá uma {y}CAPA AINDA MAIOR{w}!',
    'stan: Você já tem uma capa.',
    'goomba/angry: UMA CAPA {shake}MAIOR{shake}, EU DISSE!!',
    'goomba: Mas hoje estou ocupado demais. Meus LACAIOS cuidarão de vocês! HO HO HO!',
  ]);
  Sfx.play('jump');
  await Cut.walk(gb, 840, 104, 4);
  World.remove(gb);
  Music.play('field', { fadeIn: 20 });
}

ROOMS.campo3 = {
  name: 'Encruzilhada dos Botões', tileset: 'dark', dark: true, music: 'field',
  map: carve(48, 15, [['.', 0, 4, 47, 8], [',', 0, 5, 47, 7], ['.', 5, 2, 14, 3], ['.', 31, 2, 40, 3], ['.', 6, 9, 15, 10], ['.', 31, 9, 40, 10]]),
  bg: (g, cx, cy) => darkBg(g, cx, cy, { seed: 5 }),
  under(g, cx, cy) {
    const icons = [['FOOD', 280, 72], ['MONEY', 328, 136], ['CROWN', 376, 72]];
    for (const [k, x, y] of icons) g.drawImage(PUZ_ICON[k](), Math.round(x - 6 - cx), Math.round(y - 30 - cy));
  },
  objects: () => [
    { type: 'prop', name: 'tent', x: 152, y: 60, solid: [56, 8], name_: 'tent', area: { x: -14, y: -10, w: 28, h: 16 }, interact: () => Shop.open() },
    { type: 'save', x: 60, y: 100 },
    treeObj(...T(6, 2)), treeObj(...T(13, 10)), treeObj(...T(39, 3)), treeObj(...T(32, 10)),
    { type: 'sign', x: 232, y: 76, text: ['* "PARA PASSAR, PISE NOS BOTÕES NA ORDEM DO QUE O IMPERADOR MAIS AMA:"', '* "PRIMEIRO, {y}COMIDA{w}. DEPOIS, {y}DINHEIRO{w}. E POR ÚLTIMO... {y}ELE MESMO{w}."'] },
    { type: 'switch', id: 'food', x: 280, y: 80, interact: () => pressSwitch('food') },
    { type: 'switch', id: 'money', x: 328, y: 144, interact: () => pressSwitch('money') },
    { type: 'switch', id: 'crown', x: 376, y: 80, interact: () => pressSwitch('crown') },
    { type: 'spikes', id: 'gate1', x: 416, y: 80, w: 1, h: 5, down: () => hasFlag('puzzle1') },
    { type: 'goomba', kind: 'goomba', x: 470, y: 104, facing: 'left', name_: 'goomba', bw: 16, cond: () => !hasFlag('goomba_fight1') },
    { type: 'enemy', id: 'c3a', group: ['clyde'], x: 200, y: 150 },
    { type: 'enemy', id: 'c3b', group: ['clyde', 'cheesinho'], x: 620, y: 104 },
    { type: 'chest', id: 'c3', item: 'taco', ...xy(36, 2) },
    { type: 'trigger', x: 240, y: 60, w: 12, h: 100, once: 'puzzle_taunt', run: () => goombaTaunt() },
    { type: 'trigger', x: 392, y: 60, w: 12, h: 100, cond2: () => hasFlag('puzzle1') && !hasFlag('goomba_fight1'), run: () => goombaFight1() },
    { type: 'exit', x: 758, y: 60, w: 20, h: 100, to: 'bosque', tx: 12, ty: 'same', facing: 'right' },
  ],
};
const PUZ_ICON = {
  FOOD: () => Spr.get('pz:food', () => { const p = new Painter(12, 12); p.ellipse(5, 5, 4, 3.5, '#c8822a'); p.line(7, 7, 10, 10, '#f4e8d8', 2); return p.outline().c; }),
  MONEY: () => Spr.get('pz:money', () => { const p = new Painter(12, 12); p.circle(6, 6, 5, PAL.gold); p.rect(5, 3, 2, 6, '#8a6a10'); p.rect(4, 4, 4, 1, '#8a6a10'); p.rect(4, 7, 4, 1, '#8a6a10'); return p.outline().c; }),
  CROWN: () => Spr.get('pz:crown', () => { const p = new Painter(12, 12); drawCrown(p, 6, 10, 7); return p.outline().c; }),
};
async function goombaTaunt() {
  const gb = World.find('goomba');
  if (!gb) return;
  await Dlg.say(['goomba/happy: HO HO HO! Vocês nunca vão resolver o MEU quebra-cabeça!', 'goomba: Eu levei TRÊS DIAS pra fazer! E ainda não sei a resposta!']);
}
async function pressSwitch(id) {
  if (hasFlag('puzzle1')) { await Dlg.say(['* (O botão já está afundado.)']); return; }
  const order = ['food', 'money', 'crown'];
  const pressed = order.filter((o) => hasFlag('sw_' + o));
  if (hasFlag('sw_' + id)) return;
  if (order[pressed.length] === id) {
    setFlag('sw_' + id); Sfx.play('switch');
    if (pressed.length === 2) {
      await wait(10);
      Sfx.play('save'); setFlag('puzzle1'); Shake.start(1, 10);
      await Dlg.say(['* (Os espinhos afundaram no chão!)']);
      await goombaFight1();
    }
  } else {
    Sfx.play('error');
    for (const o of order) G.flags['sw_' + o] = false;
    await Dlg.say(['* (Bzzzt! Os botões voltaram ao lugar.)']);
    if (World.find('goomba')) await Dlg.say(['goomba/happy: HO HO HO! Errado!']);
  }
}
async function goombaFight1() {
  const gb = World.find('goomba');
  if (!gb || hasFlag('goomba_fight1')) return;
  Music.play('goomba');
  await Dlg.say(['goomba/shock: O QUÊ?! Vocês resolveram?!', 'goomba/angry: Isso não estava nos planos! Então eu mesmo vou cuidar de vocês! EM GUARDA!']);
  const res = await Battle.start({
    enemies: ['goomba1'], music: 'goomba', money: 40, retryAt: [360, 104],
    endCheck: (B) => { const e = B.enemies[0]; return (e.hp <= e.maxHp * 0.45 || e.mercy >= 100 || B.turn > 6) && !B.choosing ? 'goomba_flee' : null; },
    onEnd: async (B, r) => {
      if (r !== 'goomba_flee') return;
      const e = B.enemies[0];
      await enemySays(B, e, 'Argh! VOCÊS VENCERAM... DESTA VEZ!');
      await enemySays(B, e, 'Isso não vai ficar assim! HO HO HO!');
      Sfx.play('flee');
      await tween(e, { fleeX: 200, alpha: 0 }, 20, Ease.in);
      G.money += 40;
      await B.say('* Goomba fugiu!\n* Ganhou 0 XP e 40 D$.');
    },
  });
  if (res === 'lose') return;
  setFlag('goomba_fight1');
  World.remove(gb);
  Music.play('field', { fadeIn: 20 });
}

ROOMS.bosque = {
  name: 'Bosque dos Salgadinhos', tileset: 'dark', dark: true, music: 'field',
  map: carve(44, 15, [['.', 0, 4, 43, 8], [',', 0, 6, 43, 6], ['.', 8, 2, 16, 3], ['.', 20, 9, 30, 11], ['.', 28, 2, 40, 3], ['.', 30, 3, 43, 11]]),
  bg: (g, cx, cy) => darkBg(g, cx, cy, { seed: 6, alpha: 0.6 }),
  objects: () => {
    const o = [];
    for (const [tx, ty] of [[9, 2], [12, 3], [15, 2], [21, 10], [24, 11], [27, 10], [3, 8], [18, 4], [40, 3], [42, 10], [31, 11], [33, 3]]) o.push(treeObj(...T(tx, ty)));
    o.push({ type: 'save', x: 216, y: 100 });
    o.push({ type: 'chest', id: 'c4', item: 'cachecol', ...xy(10, 2) });
    o.push({ type: 'enemy', id: 'mbp', group: ['mbp'], x: 580, y: 112, sprite: 'mbp', cond: () => !hasFlag('mbp_done'), sight: 0 });
    o.push({ type: 'trigger', x: 470, y: 40, w: 12, h: 160, cond2: () => !hasFlag('mbp_done'), run: () => mbpScene() });
    o.push({ type: 'exit', x: 694, y: 40, w: 20, h: 160, to: 'portao', tx: 16, ty: 'same', facing: 'right' });
    return o;
  },
  update(w) { if (!hasFlag('mbp_done') && w.player.x > 520) w.player.x = 520; },
};
async function mbpScene() {
  const mbp = World.actors.find((a) => a.kind === 'enemy' && a.id === 'mbp');
  Music.stop(10);
  Sfx.play('growl'); Shake.start(3, 30);
  if (mbp) { mbp.state = 'frozen'; }
  if (!hasFlag('mbp_seen')) {
    setFlag('mbp_seen');
    await Dlg.say(['* (Algo ENORME se mexe entre as árvores...)']);
    if (mbp) await Cut.walk(mbp, 560, 112, 2);
    Sfx.play('growl');
    await Dlg.say([
      'kyle/shock: O que é ISSO?!',
      'kenny/worried: Mmph mmph mmph! (É o MANBEARPIG! Meio homem, meio urso, meio porco!)',
      'stan: Isso dá um e meio...',
      'kyle/angry: Não é hora pra matemática, Stan!',
    ]);
  } else await Dlg.say(['kyle/worried: Ele voltou! Cuidado, gente!']);
  const res = await Battle.start({ enemies: ['mbp'], music: 'mbp', positions: [[244, 140]], retryAt: [430, 104] });
  if (res === 'lose') return;
  const spared = res === 'win' && Battle.enemies[0].gone === 'spared';
  if (mbp) World.remove(mbp);
  setFlag('mbp_done');
  await Dlg.say(spared ? ['* (O ManBearPig voltou para a floresta, mais calmo.)', 'kyle/happy: Acho que ninguém nunca tinha levado ele a sério.'] : ['* (O ManBearPig fugiu, meio humilhado.)', 'kyle: Ainda bem que acabou.']);
  Music.play('field', { fadeIn: 20 });
}

ROOMS.portao = {
  name: 'Portões da Cartmanlândia', tileset: 'dark', dark: true, music: 'castle',
  map: carve(30, 15, [['.', 0, 6, 29, 12], [',', 12, 4, 17, 12], ['.', 0, 13, 29, 13]]),
  bg: (g, cx, cy) => { darkBg(g, cx, cy, { seed: 7, land: false }); BG.cartmanland(g, cx - 120, cy, 1); },
  fg(g, cx, cy) {
    const on = Math.floor(frame / 20) % 2 === 0;
    g.fillStyle = '#1a0a2a'; g.fillRect(Math.round(184 - cx), Math.round(4 - cy), 112, 17);
    g.fillStyle = on ? '#ff5ad8' : '#ffd040'; g.fillRect(Math.round(184 - cx), Math.round(4 - cy), 112, 1); g.fillRect(Math.round(184 - cx), Math.round(20 - cy), 112, 1);
    Font.draw(g, 'CARTMANLÂNDIA', 240 - cx, 3 - cy, on ? '#ff5ad8' : '#ffd040', { align: 'center' });
  },
  objects: () => [
    { type: 'prop', name: hasFlag('gate_open') ? 'gateOpen' : 'gate', x: 240, y: 70, solid: null, name_: 'gate' },
    { type: 'prop', name: 'pillar', x: 176, y: 100, solid: [18, 8] }, { type: 'prop', name: 'pillar', x: 304, y: 100, solid: [18, 8] },
    { type: 'prop', name: 'lamp', x: 150, y: 120, solid: [4, 4] }, { type: 'prop', name: 'lamp', x: 330, y: 120, solid: [4, 4] },
    { type: 'save', x: 72, y: 150 },
    { type: 'enemy', id: 'p1', group: ['peru', 'clyde'], x: 400, y: 170 },
    { type: 'goomba', kind: 'goomba', x: 240, y: 92, facing: 'down', name_: 'goomba', bw: 18, cond: () => !hasFlag('gate_open'), talk: () => gateScene() },
    { type: 'trigger', x: 180, y: 100, w: 120, h: 10, once: 'gate_talk', cond2: () => !hasFlag('gate_open'), run: () => gateScene() },
    { type: 'exit', x: 222, y: 60, w: 36, h: 12, to: 'salao', tx: 160, ty: 390, facing: 'up', cond: () => true },
  ],
  update(w) {
    if (!hasFlag('gate_open') && w.player.y < 100 && w.player.x > 200 && w.player.x < 280) w.player.y = 100;
  },
};
async function gateScene() {
  if (hasFlag('gate_open')) return;
  const gb = World.find('goomba');
  Music.play('goomba');
  await Dlg.say([
    'goomba/angry: PAREM AÍ! Ninguém entra no castelo sem a {y}SENHA{w}!',
    'kyle/annoyed: ...E qual é a senha?',
    'goomba: Eu não posso contar! É SECRETA!',
    'goomba/happy: Mas é uma frase que TODO MUNDO sabe que é verdade!',
  ]);
  for (;;) {
    const i = await Dlg.ask('goomba: Então? Qual é a senha?', ['Cartman é legal', 'Cartman é gordo', 'Respeitem a autoridade']);
    if (i === 1) {
      await Dlg.say(['goomba/happy: ...CORRETO! Podem passar.', 'goomba/shock: Opa. Eu não devia ter deixado vocês passarem, né?', 'goomba/angry: B-bom! A gente se vê na SALA DO TRONO! HO HO HO!']);
      break;
    }
    if (i === 0) await Dlg.say(['goomba/happy: HA! Ninguém acredita nisso. Nem o próprio Imperador.']);
    else await Dlg.say(['goomba: Quase! Mas não. Isso é o que ele GRITA, não o que é verdade.']);
  }
  Sfx.play('jump');
  await Cut.walk(gb, 240, 70, 3);
  Sfx.play('door');
  World.remove(gb);
  setFlag('gate_open');
  const gate = World.find('gate'); if (gate) gate.name = 'gateOpen';
  Shake.start(2, 16); Sfx.play('rumble');
  await Dlg.say(['* (Os portões da Cartmanlândia se abriram com um rangido.)']);
  Music.play('castle', { fadeIn: 20 });
}
PROPS.gateOpen = (p) => { PROPS.gate(p); p.rect(12, 30, 48, 42, '#140a20'); p.rect(12, 30, 6, 42, '#5a2a1c'); p.rect(54, 30, 6, 42, '#5a2a1c'); };
PROP_SIZE.gateOpen = [72, 72];

ROOMS.salao = {
  name: 'Castelo - Grande Salão', tileset: 'castle', dark: true, music: 'castle',
  map: carve(20, 26, [['W', 0, 0, 19, 0], ['w', 1, 1, 18, 3], ['c', 4, 4, 15, 24], ['=', 8, 4, 11, 24], ['c', 2, 10, 17, 14]]),
  objects: () => {
    const o = [];
    for (const y of [120, 200, 280, 360]) { o.push({ type: 'prop', name: 'pillar', x: 74, y, solid: [16, 8] }); o.push({ type: 'prop', name: 'pillar', x: 246, y, solid: [16, 8] }); }
    for (const x of [40, 88, 232, 280]) o.push({ type: 'prop', name: 'banner', x, y: 50, solid: null, z: -1 });
    o.push({ type: 'save', x: 104, y: 92, text: ['* (O cheiro de frango frito enche o salão.)', '* (Isso te enche de DETERMINAÇÃO.)'] });
    o.push({ type: 'chest', id: 'c5', item: 'bala', x: 224, y: 196 });
    o.push({ type: 'trigger', x: 64, y: 236, w: 192, h: 10, once: 'chandelier', run: () => chandelierScene() });
    o.push({ type: 'exit', x: 144, y: 60, w: 32, h: 12, to: 'trono', tx: 160, ty: 214, facing: 'up' });
    return o;
  },
  chY: null, chX: 160,
  fg(g, cx, cy) {
    const y = this.chY !== null ? this.chY : hasFlag('chandelier') ? null : 270;
    if (y !== null) drawChandelier(g, Math.round(this.chX - cx), Math.round(y - cy), this.chY !== null && hasFlag('chandelier_down'));
  },
};
function drawChandelier(g, x, y, fallen = false) {
  if (!fallen) { g.fillStyle = '#c8941c'; g.fillRect(x - 1, y - 260, 2, 240); }
  g.fillStyle = PAL.gold; g.fillRect(x - 18, y - 22, 36, 4); g.fillRect(x - 2, y - 30, 4, 10);
  for (const dx of [-16, -6, 6, 16]) { g.fillStyle = '#fff6c0'; g.fillRect(x + dx - 1, y - 28, 2, 6); g.fillStyle = '#ff9a2a'; g.fillRect(x + dx - 1, y - 31, 2, 3); }
}
async function chandelierScene() {
  const kenny = Cut.party('kenny');
  const room = ROOMS.salao;
  if (!kenny) return;
  Sfx.play('crack');
  room.chX = 160; room.chY = 270;
  await Dlg.say(['* (Crack!)']);
  Cut.face(kenny, 'up');
  await wait(12);
  Sfx.play('whoosh');
  await tween(room, { chX: kenny.x, chY: kenny.y + 6 }, 10, Ease.in);
  setFlag('chandelier_down');
  Sfx.play('splat'); Shake.start(4, 14);
  kenny.visible = false;
  await wait(20);
  await Dlg.say(['stan/shock: AH, MEU DEUS! ELES MATARAM O KENNY!', 'kyle/angry: SEUS DESGRAÇADOS!']);
  await wait(30);
  await Dlg.say(['* ...']);
  room.chY = null; room.chX = 160;
  G.flags.chandelier_down = false;
  kenny.x = 160; kenny.y = 400; kenny.visible = true;
  Sfx.play('revive');
  await Cut.walk(kenny, World.player.x, World.player.y + 30, 2.5);
  await Dlg.say(['kenny/annoyed: Mmph. (Já voltei.)', 'kyle: ...Ok. Vamos em frente.']);
}

ROOMS.trono = {
  name: 'Castelo - Sala do Trono', tileset: 'castle', dark: true, music: 'castle',
  map: carve(20, 15, [['W', 0, 0, 19, 0], ['w', 0, 1, 19, 3], ['c', 2, 4, 17, 13], ['=', 8, 4, 11, 13]]),
  objects: () => [
    { type: 'prop', name: 'throne', x: 160, y: 98, solid: [40, 10] },
    { type: 'prop', name: 'banner', x: 64, y: 46, solid: null }, { type: 'prop', name: 'banner', x: 256, y: 46, solid: null },
    { type: 'prop', name: 'pillar', x: 52, y: 150, solid: [16, 8] }, { type: 'prop', name: 'pillar', x: 268, y: 150, solid: [16, 8] },
    kidObj('cartman', 160, 118, 'down', { cond: () => !hasFlag('boss_done'), name_: 'cartman', bw: 22 }),
    { type: 'goomba', kind: 'goomba', x: 206, y: 122, facing: 'left', name_: 'goomba', bw: 16, cond: () => !hasFlag('boss_done') },
    { type: 'trigger', x: 64, y: 176, w: 192, h: 10, cond2: () => !hasFlag('boss_done'), run: () => bossScene() },
  ],
};
async function bossScene() {
  const cart = World.find('cartman');
  const p = World.player, kyle = Cut.party('kyle'), kenny = Cut.party('kenny');
  Music.stop(20);
  await Cut.walkAll([[p, 160, 170], [kyle, 136, 182], [kenny, 184, 182]]);
  for (const a of [p, kyle, kenny]) Cut.face(a, 'up');
  if (!hasFlag('boss_intro')) {
    setFlag('boss_intro');
    await Dlg.say([
      'cartman/smug: Ah. Finalmente. Stan. Kyle.',
      'cartman/surprised: ...Kenny? Você não tinha morrido?',
      'kenny/annoyed: Mmph. (Morri.)',
      'cartman/happy: Bem-vindos à {y}CARTMANLÂNDIA SOMBRIA{w}! O MEU reino!',
      'cartman/smug: Aqui todo mundo faz o que eu mando. Todo mundo RESPEITA A MINHA AUTORIDADE!',
      'kyle/angry: Cartman, você tem que fechar essa fonte! A escuridão vai engolir a cidade inteira!',
      'cartman/smug: Eu gosto do escuro, Kyle. No escuro ninguém vê quando eu como o último Cheesy Poof.',
      'stan: Cartman, a gente só quer ir pra casa.',
      'cartman/angry: Então vocês vão ter que passar por MIM... e pelo meu fiel cavaleiro!',
      'goomba/happy: HO HO HO! SIR GOOMBA, ÀS SUAS ORDENS, MAJESTADE!',
      'cartman/angry: Goomba! ATAQUE!',
      'goomba: Mas... e a capa maior que o senhor me prometeu?',
      'cartman/grit: DEPOIS, Goomba! {shake}ATAQUE!{shake}',
    ]);
  } else {
    await Dlg.say(['cartman/smug: Voltaram pra apanhar de novo? RESPEITEM MINHA AUTORIDADE!', 'goomba/angry: HO HO HO! Em guarda!']);
  }
  const res = await Battle.start({
    enemies: ['cartman', 'goomba'], music: 'boss', positions: [[272, 132], [228, 160]], money: 0, retryAt: [160, 214],
    intro: '* O Imperador Cartman e Sir Goomba bloqueiam o caminho!',
    noVictoryText: true,
    onEnd: async (B, r) => {
      if (r !== 'win') return;
      const c = B.enemies.find((e) => e.id === 'cartman');
      G.flags.boss_spared = c.gone === 'spared';
      const goom = B.enemies.find((e) => e.id === 'goomba');
      G.flags.goomba_spared = goom.gone === 'spared';
      c.alpha = 1; c.spareFade = false; c.fleeX = 0; c.data.cry = !G.flags.boss_spared;
      await enemySays(B, c, G.flags.boss_spared ? 'Tá bom... TÁ BOM. Vocês venceram.' : 'AAAAI! Tá bom! TÁ BOM! VOCÊS VENCERAM!');
      await B.say('* VOCÊ VENCEU!\n* Ganhou 0 XP e 0 D$.\n* (O Imperador não tinha dinheiro. Ele gastou tudo em salgadinho.)');
    },
  });
  if (res === 'lose') return;
  setFlag('boss_done');
  await afterBoss(cart);
}
async function afterBoss(cart) {
  Music.play('tension');
  await Dlg.say([
    'cartman/sad: Danem-se vocês. Eu vou pra casa!',
  ]);
  await Cut.walk(cart, 120, 140, 2);
  await Dlg.say([
    'kyle/angry: Você NÃO pode ir pra casa, Cartman! A fonte ainda tá aberta!',
    'cartman/surprised: ...Ah.',
  ]);
  if (G.flags.goomba_spared) {
    await Dlg.say([
      'goomba/sad: Majestade... e a minha capa maior?',
      'cartman/annoyed: Não existe capa maior, Goomba. Nunca existiu.',
      'goomba/sad: ...',
      'kyle/angry: Você é horrível, Cartman.',
      'stan: Goomba... sua capa já é bem legal do jeito que é.',
      'goomba/happy: ...Você acha mesmo?! HO HO... ho.',
    ]);
  } else {
    await Dlg.say(['goomba/sad: (Sir Goomba está sentado num canto, pensando na vida.)']);
  }
  await Dlg.say([
    'kenny/worried: Mmph mmph! (Gente! A fonte fica atrás do trono!)',
    'cartman/annoyed: Tá, tá. Vamos lá. Mas eu NÃO vou ajudar.',
  ]);
  await World.go('fonte', 160, 200, 'up', 16);
}

ROOMS.fonte = {
  name: 'A Fonte Sombria', tileset: 'dark', dark: true, music: 'fountain',
  map: carve(20, 15, [['.', 4, 3, 15, 13], ['.', 3, 5, 16, 11], [',', 9, 8, 10, 13]]),
  bg(g, cx, cy) {
    const gr = g.createRadialGradient(160 - cx, 90 - cy, 10, 160 - cx, 90 - cy, 200);
    gr.addColorStop(0, '#3a1a5a'); gr.addColorStop(1, '#000');
    g.fillStyle = gr; g.fillRect(0, 0, W, H);
    BG.stars(g, cx, cy, 9, 30);
  },
  under(g, cx, cy) { drawFountain(g, 160 - cx, 104 - cy, Scenes.fountainK); },
  objects: () => [
    { type: 'prop', name: 'rock', x: 0, y: 0, solid: null, cond: () => false },
    { type: 'look', kind: 'look', visible: false, solid: true, bw: 40, bh: 18, x: 160, y: 110, area: { x: -24, y: -24, w: 48, h: 36 }, interact: () => sealScene() },
  ],
  async enter() {
    if (hasFlag('sealed')) return;
    const p = World.player, kyle = Cut.party('kyle'), kenny = Cut.party('kenny');
    const cart = World.addObject(kidObj('cartman', 200, 206, 'up', { name_: 'cartman', bw: 22 }));
    await Cut.walkAll([[p, 160, 170], [kyle, 132, 178], [kenny, 188, 178], [cart, 214, 196]]);
    await Dlg.say([
      'kenny: Mmph. (Essa é a {pu}FONTE SOMBRIA{w}.)',
      'kenny/worried: Mmph mmph. (Só quem tem uma {r}ALMA{w} de verdade pode fechar ela. Um herói do Mundo da Luz.)',
      'cartman/smug: Bom, então tá explicado por que o Kenny não pode. Ele nem tá vivo.',
      'kenny/annoyed: Mmph.',
      'kyle: Vai lá, Stan. Você consegue.',
    ]);
    await sealScene();
  },
};
async function sealScene() {
  if (hasFlag('sealed')) return;
  const p = World.player;
  await Cut.walk(p, 160, 138, 1);
  p.facing = 'up';
  await Dlg.say(['* (Você estende a mão em direção à escuridão...)']);
  Music.stop(30);
  Sfx.play('seal');
  await tween(Scenes, { fountainK: 0 }, 60, Ease.in);
  setFlag('sealed');
  await Fade.out(40, '#ffffff');
  await wait(20);
  await Scenes.lightReturn();
}
function drawFountain(g, x, y, k = 1) {
  if (k <= 0.01) return;
  g.save();
  g.fillStyle = '#000';
  g.beginPath(); g.ellipse(x, y + 6, 26 * k + 4, 8 * k + 2, 0, 0, Math.PI * 2); g.fill();
  g.strokeStyle = '#d0d0f0'; g.lineWidth = 1;
  g.beginPath(); g.ellipse(x, y + 6, 26 * k + 4, 8 * k + 2, 0, 0, Math.PI * 2); g.stroke();
  const wdt = 18 * k;
  for (let yy = y + 4; yy > -10; yy -= 2) {
    const off = Math.sin(yy * 0.12 + frame * 0.15) * 2.5 * k;
    g.fillStyle = '#000'; g.fillRect(Math.round(x - wdt + off), yy, Math.round(wdt * 2), 2);
    g.fillStyle = '#e8e8ff'; g.fillRect(Math.round(x - wdt + off) - 1, yy, 1, 2); g.fillRect(Math.round(x + wdt + off), yy, 1, 2);
  }
  for (let i = 0; i < 14; i++) {
    const py = (y - ((frame * 1.5 + i * 23) % (y + 20)));
    const px = x + Math.sin(i * 2.1 + frame * 0.05) * wdt * 0.8;
    g.fillStyle = i % 3 ? '#ffffff' : '#a080ff';
    g.fillRect(Math.round(px), Math.round(py), 1, 2);
  }
  g.restore();
}

/* ---------- Final no Mundo da Luz ---------- */
async function endingBusStop() {
  const p = World.player;
  p.x = 206; p.y = 170; p.facing = 'down';
  World.addObject(kidObj('kyle', 262, 170, 'down'));
  World.addObject(kidObj('cartman', 294, 170, 'down', { bw: 22 }));
  const kenny = World.addObject(kidObj('kenny', 178, 170, 'down'));
  await wait(30);
  await Dlg.say([
    'kyle: Sabe, Stan... eu aprendi uma coisa hoje.',
    'kyle: Às vezes, o mundo mais escuro é aquele que a gente cria quando só pensa em si mesmo.',
    'stan: É. E que um cogumelo de capa pode ser mais leal do que muito amigo por aí.',
    'cartman/annoyed: Que lição idiota.',
    'kenny/happy: Mmph mmph! (Pelo menos hoje eu não morri!)',
  ]);
  await wait(20);
  Sfx.play('fall');
  await Dlg.say(['* (Fiiiiiiiiuuuuuuu...)'], { pos: 'top' });
  const gb = World.addObject({ type: 'goomba', kind: 'goomba', x: kenny.x, y: -40, facing: 'down', name_: 'goomba', solid: false });
  await tween(gb, { y: kenny.y }, 18, Ease.in);
  Sfx.play('splat'); Shake.start(4, 12);
  kenny.visible = false;
  await wait(24);
  await Dlg.say([
    'goomba/shock: ...Ops.',
    'stan/shock: AH, MEU DEUS! ELES MATARAM O KENNY!',
    'kyle/angry: SEUS DESGRAÇADOS!',
    'goomba/worried: Eu só vim devolver a capa! Desculpa! HO... ho?',
  ]);
  await wait(20);
  Music.stop(30);
  await Fade.out(40);
  await Scenes.credits();
}
