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
  Font.draw(g, 'SOUTH PARK ELEMENTARY', 240, 27, '#2a3a8a', { align: 'center' });
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
  p.rect(178, 14, 52, 16, '#f4f0e0'); Mini.draw(g, 'DRUGS ARE', 204, 16, '#c02020', { align: 'center' }); Mini.draw(g, "BAD, M'KAY", 204, 23, '#c02020', { align: 'center' });
  p.rect(372, 16, 40, 14, '#ffe060'); Mini.draw(g, 'GO COWS!', 392, 21, '#2a3a8a', { align: 'center' });
}

/* ---------- MUNDO DA LUZ ---------- */
const LIGHT_ROWS = (w) => carve(w, 15, [['.', 0, 7, w - 1, 9], ['-', 0, 10, w - 1, 10], ['=', 0, 11, w - 1, 11], ['+', 0, 12, w - 1, 12], ['=', 0, 13, w - 1, 13]]);

ROOMS.ponto = {
  name: 'Bus Stop', tileset: 'light', dark: false, music: 'town',
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
      interact: () => Dlg.say(['* (A snowman. Someone gave it a mustache.)', '* (A note on it says: "PROPERTY OF ERIC CARTMAN. HANDS OFF, KAHL.")']) },
    { type: 'look', kind: 'look', visible: false, solid: false, x: 236, y: 172, area: { x: -10, y: -30, w: 20, h: 32 },
      interact: () => Dlg.say(['* (BUS STOP. The school bus comes here... sometimes.)', '* (You can almost hear Ms. Crabtree yelling "SIT DOWN!")']) },
    { type: 'look', kind: 'look', visible: false, solid: false, x: 70, y: 116, area: { x: -30, y: -10, w: 60, h: 12 },
      interact: () => Dlg.say(['* (Your house. Through the window, you can see your dad yelling at the TV.)', '* ("I THOUGHT THIS WAS AMERICA!")']) },
    { type: 'look', kind: 'look', visible: false, solid: false, x: 231, y: 116, area: { x: -30, y: -10, w: 60, h: 12 },
      interact: () => Dlg.say(["* (Kyle's house. Somebody inside is yelling.)", '* ("WHAT? WHAT? WHAAAAAT?!")']) },
    { type: 'look', kind: 'look', visible: false, solid: false, x: 384, y: 116, area: { x: -30, y: -10, w: 60, h: 12 },
      interact: () => Dlg.say(["* (Cartman's house. There's a sign on the door.)", '* ("KEEP OUT! NO HIPPIES! NO KAHLS!")']) },
    kidObj('kyle', 266, 170, 'left', { cond: () => !hasFlag('intro_done') && !hasFlag('ending'), talk: () => Dlg.say(["kyle: Come on, Stan! School's this way."]) }),
    { type: 'exit', x: 468, y: 104, w: 20, h: 120, to: 'escola', tx: 20, ty: 'same', facing: 'right', cond: () => !hasFlag('ending') },
  ],
  async enter() {
    if (hasFlag('ending')) { await endingBusStop(); return; }
    if (hasFlag('intro_done')) return;
    const kyle = World.find('kyle');
    await wait(24);
    await Dlg.say([
      'kyle: Hey, Stan.',
      'stan: Hey, Kyle.',
      "kyle/annoyed: Where's Cartman? He never misses the bus. He loves the back seat.",
      'stan: What about Kenny?',
      'kyle: Kenny died yesterday. Again.',
      'stan: Oh, right.',
      "kyle: ...{p10}He'll be back.",
    ]);
    await wait(10);
    Cut.face(kyle, 'down');
    await Dlg.say([
      'kyle/worried: But it\'s weird. Yesterday Cartman kept saying he found a "secret kingdom" in the school supply closet.',
      'kyle/annoyed: He said he was gonna be EMPEROR, and we\'d all have to respect his "authoritah."',
      'stan: Typical Cartman.',
      '* (The bus never came.)',
      "kyle: Screw it, let's walk. Come on, Stan!",
    ]);
    setFlag('intro_done');
    Cut.face(kyle, 'right');
    await Cut.walk(kyle, 520, 170, 2.6);
    World.remove(kyle);
  },
};

ROOMS.escola = {
  name: 'South Park Elementary', tileset: 'light', dark: false, music: 'town',
  map: LIGHT_ROWS(30),
  bg(g, cx) { BG.sky(g); BG.mountains(g, cx, 14); },
  paint: (g, w) => paintSchool(g, w),
  fg(g) { BG.snowfall(g, 30, 0.5); },
  objects: () => [
    { type: 'npc', kind: 'npc', who: 'barbrady', x: 120, y: 150, facing: 'down', name_: 'barbrady', bw: 12,
      talk: async () => {
        await Dlg.say([{ who: 'barbrady', text: '* Okay, move along, people! Nothing to see here!' }]);
        if (!hasFlag('barb2')) { setFlag('barb2'); await Dlg.say([{ who: 'barbrady', text: "* This is a SCH... SKUH-OOL. It's where kids go to... uh... learn how to read?" }, { who: 'barbrady', text: '* Maybe I should try that someday.' }]); }
      } },
    kidObj('kyle', 278, 128, 'down', { cond: () => !hasFlag('fell'), talk: () => Dlg.say(["kyle: The supply closet is at the end of the hall. Let's go!"]) }),
    { type: 'prop', name: 'trash', x: 196, y: 124, solid: [12, 5] },
    { type: 'prop', name: 'bench', x: 360, y: 128, solid: [30, 5] },
    { type: 'look', kind: 'look', visible: false, solid: false, x: 196, y: 124, area: { x: -10, y: -14, w: 20, h: 18 },
      interact: () => Dlg.say(["* (A trash can. There's a towel inside.)", '* (It whispers: "Don\'t forget to bring a towel!")']) },
    { type: 'look', kind: 'look', visible: false, solid: false, x: 360, y: 128, area: { x: -18, y: -14, w: 36, h: 18 },
      interact: () => Dlg.say(['* (Someone carved "TWEEK WAS HERE" into the bench.)', '* (The letters are very, very shaky.)']) },
    { type: 'exit', x: 224, y: 104, w: 32, h: 10, to: 'corredor', tx: 40, ty: 156, facing: 'right' },
    { type: 'exit', x: -12, y: 104, w: 20, h: 120, to: 'ponto', tx: 448, ty: 'same', facing: 'left' },
  ],
};

ROOMS.corredor = {
  name: 'School Hallway', tileset: 'school', dark: false, music: 'town',
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
            "mackey: Ah, Stan. Good morning, m'kay.",
            "mackey/worried: Eric went into the supply closet an hour ago, and he never came out, m'kay?",
            "mackey: Go get him. Class is about to start, m'kay?",
            "mackey/happy: And remember: drugs are bad, m'kay. You shouldn't do drugs, m'kay.",
          ]);
        } else await Dlg.say(["mackey: The closet is at the end of the hall, m'kay? Mmmkay."]);
      } },
    kidObj('kyle', 444, 128, 'right', { cond: () => !hasFlag('fell'), talk: () => closetScene() }),
    { type: 'prop', name: hasFlag('fell') ? 'closetOpen' : 'closet', x: 484, y: 98, name_: 'closet', solid: null, area: { x: -16, y: -4, w: 32, h: 30 },
      interact: () => (hasFlag('fell') ? Dlg.say(['* (The supply closet. Just mops in there now.)']) : closetScene()) },
    { type: 'look', kind: 'look', visible: false, solid: false, x: 204, y: 100, area: { x: -28, y: -6, w: 56, h: 14 },
      interact: () => Dlg.say(['* (A poster: "DRUGS ARE BAD, M\'KAY.")', '* (Someone wrote underneath it: "SO IS CARTMAN.")']) },
    { type: 'look', kind: 'look', visible: false, solid: false, x: 392, y: 100, area: { x: -22, y: -6, w: 44, h: 14 },
      interact: () => Dlg.say(['* (A banner: "GO COWS!")', '* (The South Park Cows have never won a single game.)']) },
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
  if (!hasFlag('mackey')) { await Dlg.say(["kyle: We should talk to Mr. Mackey first, dude. He's in the middle of the hall."]); return; }
  const kyle = World.find('kyle'), closet = World.find('closet');
  Music.stop(20);
  Cut.face(kyle, 'right');
  await Dlg.say(['kyle: Cartman? You in there?']);
  await wait(24);
  await Dlg.say(['* (Silence.)']);
  await Dlg.say(["kyle/worried: ...There's a weird light coming from under the door.", 'kyle: Stan... you open it.']);
  await Cut.walk(World.player, 476, 116, 1.5);
  World.player.facing = 'up';
  await wait(10);
  Sfx.play('door');
  closet.name = 'closetOpen';
  await wait(24);
  Sfx.play('rumble'); Shake.start(2, 50);
  Music.play('tension');
  await Dlg.say(["kyle/surprised: Stan, wait! There's something—"]);
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
  name: 'Landing Spot', tileset: 'dark', dark: true, music: 'field',
  map: carve(20, 15, [['.', 5, 3, 14, 9], ['.', 4, 4, 15, 8], ['.', 15, 5, 19, 8], [',', 14, 6, 19, 7]]),
  bg: (g, cx, cy) => darkBg(g, cx, cy, { seed: 2 }),
  objects: () => [
    { type: 'save', x: 104, y: 96, text: ['* (You fell into a strange, dark world.)', '* (Somehow, this fills you with DETERMINATION.)'] },
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
  await Dlg.say(['* ...', '* (Everything is dark and quiet.)']);
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
    'kyle/hurt: Ugh... Stan? You okay?',
    'kyle/surprised: ...Dude. Why are you wearing ARMOR?',
    'stan: Why are YOU dressed like a wizard?',
  ]);
  Cut.face(kyle, 'down'); await wait(16); Cut.face(kyle, 'left');
  await Dlg.say([
    'kyle/shock: ...WHAT THE HELL?!',
    'stan: Dude, this is pretty messed up right here.',
    "kyle/worried: Where are we? This isn't the school closet.",
    'kyle/annoyed: This must be Cartman\'s stupid "secret kingdom."',
    "kyle/determined: Let's find that fatass and get out of here.",
  ]);
  await Cut.join('kyle');
  World.adopt(kyle);
  setFlag('arrived');
  Music.play('field', { fadeIn: 20 });
}

ROOMS.campo1 = {
  name: 'Cheesy Poof Fields', tileset: 'dark', dark: true, music: 'field',
  map: carve(40, 15, [['.', 0, 4, 39, 8], [',', 0, 5, 39, 7], ['.', 9, 2, 15, 3], ['.', 26, 2, 33, 3], ['.', 7, 9, 15, 10], ['.', 25, 9, 32, 10]]),
  bg: (g, cx, cy) => darkBg(g, cx, cy, { seed: 3 }),
  objects: () => [
    treeObj(...T(10, 3)), treeObj(...T(14, 3)), treeObj(...T(9, 10)), treeObj(...T(27, 3)), treeObj(...T(32, 10)),
    { type: 'prop', name: 'bag', x: 200, y: 160, solid: [22, 6] },
    { type: 'prop', name: 'candy', x: 440, y: 52, solid: [6, 4] },
    { type: 'sign', x: 72, y: 76, text: ['* "WELCOME TO THE DARK WORLD OF EMPEROR CARTMAN."', '* "RULE #1: RESPECT MY AUTHORITAH."', '* "RULE #2: NO HIPPIES."', '* "RULE #3: SEE RULE #1."'] },
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
  await Dlg.say(['kyle/surprised: Who are you?!']);
  await Cut.walk(kenny, 400, 108, 1.2);
  await wait(10);
  await Dlg.say(['* (The hooded figure lowers its hood a little...)']);
  kenny.extra = '';
  Sfx.play('appear');
  await wait(14);
  await Dlg.say([
    'stan/surprised: KENNY?!',
    'kenny/happy: Mmph! (Hey, guys!)',
    'kyle/angry: Dude, you DIED yesterday!',
    'kenny: Mmph mmph mmph. (Yeah. Then I woke up here.)',
    "kenny: Mmmph... (Every time I die, I end up somewhere weird. This one's way better than Hell. Satan says hi.)",
    'kenny: Mmph. (This place is a {pu}DARK WORLD{w}.)',
    'kenny/worried: Mmph mmph. (Cartman found a {pu}DARK FOUNTAIN{w} in the school closet and opened it.)',
    'kenny/annoyed: Mmmph. (Now he thinks he\'s the EMPEROR down here. And he got himself a really weird knight.)',
    "kenny/worried: Mmph mmph! (If the fountain isn't sealed, darkness will cover all of South Park!)",
    "kyle/annoyed: Great. Another one of Cartman's stupid plans.",
    "stan: Dude, that's like the fifth one this month.",
    "kenny: Mmph... (But there's a legend...)",
  ]);
  await Scenes.legend();
  await Dlg.say([
    "stan: ...There's a beanie in the legend, Kyle.",
    'kyle/annoyed: This is ridiculous.',
    'kenny/happy: Mmph! (Before we go, you need to learn how to fight down here. I brought a friend!)',
  ]);
  const dummy = World.addObject({ type: 'prop', name: 'dummyStand', x: 456, y: 108, solid: [10, 6] });
  Sfx.play('appear');
  await wait(10);
  await Dlg.say(['* (Kenny pulled a training dummy out of his hood.)', '* (Nobody asked how.)']);
  await Cut.join('kenny');
  await Cut.walk(kenny, World.player.x + 22, World.player.y + 8, 2);
  World.adopt(kenny);
  setFlag('kenny_joined');
  await Dlg.say(["kenny: Mmph! (Let's go! It's just practice!)"]);
  const res = await Battle.start({
    enemies: ['srchapeu'], music: 'battle', money: 0,
    intro: '* Mr. Hat blocks the way!\n* (Kenny is gonna teach you how to fight.)',
    onTurn: async (B) => {
      const tips = {
        1: "* (Kenny: FIGHT attacks. ACT does stuff to the enemy. SPARE works when the enemy's name is {y}YELLOW{w}.)",
        2: "* (Kenny: On the enemy's turn, move your {r}SOUL{w}. Grazing bullets fills up the {o}TP{w} bar!)",
        3: '* (Kenny: TP is for MAGIC. Kyle and I know spells. Now spare Mr. Hat or beat him up!)',
      };
      if (tips[B.turn]) await B.say(tips[B.turn]);
    },
  });
  if (res === 'lose') return;
  World.remove(dummy);
  await Dlg.say([
    'kenny/happy: Mmph mmph! (Nice! You guys are naturals!)',
    '* (Kenny gave you 2 {y}Cheesy Poofs{w} and 30 D$.)',
    'stan: Dude, since when do you have money?',
    "kenny/happy: Mmph mmph. (Dark World money. Down here, I'm practically rich.)",
  ]);
  addItem('cheesy'); addItem('cheesy'); G.money += 30;
  Sfx.play('item');
  setFlag('tutorial_done');
  Music.play('field', { fadeIn: 20 });
}

ROOMS.campo2 = {
  name: 'Cheesy Fields - East', tileset: 'dark', dark: true, music: 'field',
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
    'goomba/angry: HALT, HEROES!',
    'goomba: I AM {r}SIR GOOMBA{w}! THE CAPED KNIGHT!',
    'goomba: MOST LOYAL SERVANT OF THE GREAT {y}EMPEROR CARTMAN{w}!',
    'kyle/annoyed: ...Is that a mushroom?',
    "goomba/shock: I'M NOT A MUSHROOM! I'M A GOOMBA! IT'S COMPLETELY DIFFERENT!",
    'goomba: I fell here from a faraway kingdom of mushrooms and green pipes. A plumber kept jumping on my head!',
    'stan: Dude, that explains a lot.',
    "goomba/happy: The Emperor promised that if I destroy you, he'll give me an {y}EVEN BIGGER CAPE{w}!",
    'stan: You already have a cape.',
    'goomba/angry: A {shake}BIGGER{shake} CAPE, I SAID!!',
    "goomba: But today I'm far too busy. My MINIONS will deal with you! HO HO HO!",
  ]);
  Sfx.play('jump');
  await Cut.walk(gb, 840, 104, 4);
  World.remove(gb);
  Music.play('field', { fadeIn: 20 });
}

ROOMS.campo3 = {
  name: 'Button Crossroads', tileset: 'dark', dark: true, music: 'field',
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
    { type: 'sign', x: 232, y: 76, text: ['* "TO PASS, STEP ON THE BUTTONS IN THE ORDER OF WHAT THE EMPEROR LOVES MOST:"', '* "FIRST, {y}FOOD{w}. THEN, {y}MONEY{w}. AND LAST BUT NOT LEAST... {y}HIMSELF{w}."'] },
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
  await Dlg.say(["goomba/happy: HO HO HO! You'll never solve MY puzzle!", "goomba: It took me THREE DAYS to make! And I still don't know the answer!"]);
}
async function pressSwitch(id) {
  if (hasFlag('puzzle1')) { await Dlg.say(['* (The button is already pressed down.)']); return; }
  const order = ['food', 'money', 'crown'];
  const pressed = order.filter((o) => hasFlag('sw_' + o));
  if (hasFlag('sw_' + id)) return;
  if (order[pressed.length] === id) {
    setFlag('sw_' + id); Sfx.play('switch');
    if (pressed.length === 2) {
      await wait(10);
      Sfx.play('save'); setFlag('puzzle1'); Shake.start(1, 10);
      await Dlg.say(['* (The spikes sank into the ground!)']);
      await goombaFight1();
    }
  } else {
    Sfx.play('error');
    for (const o of order) G.flags['sw_' + o] = false;
    await Dlg.say(['* (Bzzzt! The buttons popped back up.)']);
    if (World.find('goomba')) await Dlg.say(['goomba/happy: HO HO HO! WRONG!']);
  }
}
async function goombaFight1() {
  const gb = World.find('goomba');
  if (!gb || hasFlag('goomba_fight1')) return;
  Music.play('goomba');
  await Dlg.say(['goomba/shock: WHAT?! You solved it?!', "goomba/angry: That was NOT part of the plan! Fine, I'll handle you myself! EN GARDE!"]);
  const res = await Battle.start({
    enemies: ['goomba1'], music: 'goomba', money: 40, retryAt: [360, 104],
    endCheck: (B) => { const e = B.enemies[0]; return (e.hp <= e.maxHp * 0.45 || e.mercy >= 100 || B.turn > 6) && !B.choosing ? 'goomba_flee' : null; },
    onEnd: async (B, r) => {
      if (r !== 'goomba_flee') return;
      const e = B.enemies[0];
      await enemySays(B, e, 'Argh! YOU WIN... THIS TIME!');
      await enemySays(B, e, "This isn't over! HO HO HO!");
      Sfx.play('flee');
      await tween(e, { fleeX: 200, alpha: 0 }, 20, Ease.in);
      G.money += 40;
      await B.say('* Sir Goomba ran away!\n* Got 0 EXP and 40 D$.');
    },
  });
  if (res === 'lose') return;
  setFlag('goomba_fight1');
  World.remove(gb);
  Music.play('field', { fadeIn: 20 });
}

ROOMS.bosque = {
  name: 'Snack Forest', tileset: 'dark', dark: true, music: 'field',
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
    await Dlg.say(['* (Something HUGE is moving between the trees...)']);
    if (mbp) await Cut.walk(mbp, 560, 112, 2);
    Sfx.play('growl');
    await Dlg.say([
      'kyle/shock: What is THAT?!',
      "kenny/worried: Mmph mmph mmph! (It's MANBEARPIG! Half man, half bear, half pig!)",
      "stan: That's like one and a half...",
      "kyle/angry: This isn't the time for math, Stan!",
    ]);
  } else await Dlg.say(["kyle/worried: It's back! Careful, guys!"]);
  const res = await Battle.start({ enemies: ['mbp'], music: 'mbp', positions: [[244, 140]], retryAt: [430, 104] });
  if (res === 'lose') return;
  const spared = res === 'win' && Battle.enemies[0].gone === 'spared';
  if (mbp) World.remove(mbp);
  setFlag('mbp_done');
  await Dlg.say(spared
    ? ['* (ManBearPig went back into the forest, much calmer.)', 'kyle/happy: I guess nobody ever took him seriously before.', "stan: Dude, Al Gore is never gonna let us hear the end of this."]
    : ['* (ManBearPig ran away, kind of humiliated.)', "kyle: Glad that's over.", "stan: Dude, Al Gore is never gonna let us hear the end of this."]);
  Music.play('field', { fadeIn: 20 });
}

ROOMS.portao = {
  name: 'Cartmanland Gates', tileset: 'dark', dark: true, music: 'castle',
  map: carve(30, 15, [['.', 0, 6, 29, 12], [',', 12, 4, 17, 12], ['.', 0, 13, 29, 13]]),
  bg: (g, cx, cy) => { darkBg(g, cx, cy, { seed: 7, land: false }); BG.cartmanland(g, cx - 120, cy, 1); },
  fg(g, cx, cy) {
    const on = Math.floor(frame / 20) % 2 === 0;
    g.fillStyle = '#1a0a2a'; g.fillRect(Math.round(184 - cx), Math.round(4 - cy), 112, 17);
    g.fillStyle = on ? '#ff5ad8' : '#ffd040'; g.fillRect(Math.round(184 - cx), Math.round(4 - cy), 112, 1); g.fillRect(Math.round(184 - cx), Math.round(20 - cy), 112, 1);
    Font.draw(g, 'CARTMANLAND', 240 - cx, 3 - cy, on ? '#ff5ad8' : '#ffd040', { align: 'center' });
  },
  objects: () => [
    { type: 'prop', name: hasFlag('gate_open') ? 'gateOpen' : 'gate', x: 240, y: 70, solid: null, name_: 'gate' },
    { type: 'prop', name: 'pillar', x: 176, y: 100, solid: [18, 8] }, { type: 'prop', name: 'pillar', x: 304, y: 100, solid: [18, 8] },
    { type: 'prop', name: 'lamp', x: 150, y: 120, solid: [4, 4] }, { type: 'prop', name: 'lamp', x: 330, y: 120, solid: [4, 4] },
    { type: 'save', x: 72, y: 150 },
    { type: 'sign', x: 112, y: 148, text: ['* "CARTMANLAND! THE GREATEST THEME PARK IN THE WHOLE DARK WORLD!"', '* "ADMISSION: FREE!"', '* "...BUT YOU CAN\'T COME."'] },
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
    'goomba/angry: STOP RIGHT THERE! Nobody enters the castle without the {y}PASSWORD{w}!',
    "kyle/annoyed: ...And what's the password?",
    "goomba: I can't tell you! It's a SECRET!",
    "goomba/happy: But it's something EVERYBODY knows is true!",
  ]);
  for (;;) {
    const i = await Dlg.ask('goomba: Finish it! "Cartman is..."', ['COOL', 'FAT', 'IN CHARGE', 'BIG-BONED']);
    if (i === 1) {
      await Dlg.say(['goomba/happy: ...CORRECT! You may pass.', "goomba/shock: Oops. I wasn't supposed to let you in, was I?", 'goomba/angry: W-well! See you in the THRONE ROOM! HO HO HO!']);
      break;
    }
    if (i === 0) await Dlg.say(['goomba/happy: HA! Nobody believes that. Not even the Emperor.']);
    else if (i === 2) await Dlg.say(["goomba: Close! But no. That's what he YELLS, not what's TRUE."]);
    else await Dlg.say(["goomba: That's what his MOM says."]);
  }
  Sfx.play('jump');
  await Cut.walk(gb, 240, 70, 3);
  Sfx.play('door');
  World.remove(gb);
  setFlag('gate_open');
  const gate = World.find('gate'); if (gate) gate.name = 'gateOpen';
  Shake.start(2, 16); Sfx.play('rumble');
  await Dlg.say(['* (The gates of Cartmanland creaked open.)']);
  Music.play('castle', { fadeIn: 20 });
}
PROPS.gateOpen = (p) => { PROPS.gate(p); p.rect(12, 30, 48, 42, '#140a20'); p.rect(12, 30, 6, 42, '#5a2a1c'); p.rect(54, 30, 6, 42, '#5a2a1c'); };
PROP_SIZE.gateOpen = [72, 72];

ROOMS.salao = {
  name: 'Castle - Great Hall', tileset: 'castle', dark: true, music: 'castle',
  map: carve(20, 26, [['W', 0, 0, 19, 0], ['w', 1, 1, 18, 3], ['c', 4, 4, 15, 24], ['=', 8, 4, 11, 24], ['c', 2, 10, 17, 14]]),
  objects: () => {
    const o = [];
    for (const y of [120, 200, 280, 360]) { o.push({ type: 'prop', name: 'pillar', x: 74, y, solid: [16, 8] }); o.push({ type: 'prop', name: 'pillar', x: 246, y, solid: [16, 8] }); }
    for (const x of [40, 88, 232, 280]) o.push({ type: 'prop', name: 'banner', x, y: 50, solid: null, z: -1 });
    o.push({ type: 'save', x: 104, y: 92, text: ['* (The smell of extra crispy fried chicken fills the hall.)', '* (It fills you with DETERMINATION.)'] });
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
  await Dlg.say(['stan/shock: OH MY GOD! THEY KILLED KENNY!', 'kyle/angry: YOU BASTARDS!']);
  await wait(16);
  await Dlg.say(['stan: ...Wait. Who\'s "they"? It was a chandelier.', 'kyle/annoyed: Dude. Just let me have this.']);
  await wait(30);
  await Dlg.say(['* ...']);
  room.chY = null; room.chX = 160;
  G.flags.chandelier_down = false;
  kenny.x = 160; kenny.y = 400; kenny.visible = true;
  Sfx.play('revive');
  await Cut.walk(kenny, World.player.x, World.player.y + 30, 2.5);
  await Dlg.say(["kenny/annoyed: Mmph. (I'm back.)", "kyle: ...Okay. Let's keep going."]);
}

ROOMS.trono = {
  name: 'Castle - Throne Room', tileset: 'castle', dark: true, music: 'castle',
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
      'cartman/smug: Ah. Finally. Stan. Kahl.',
      "cartman/surprised: ...Kenny? Weren't you dead?",
      'kenny/annoyed: Mmph. (I was.)',
      'cartman/happy: Welcome to {y}DARK CARTMANLAND{w}! MY kingdom!',
      'cartman/smug: Down here, everybody does what I say. Everybody RESPECTS MY AUTHORITAH!',
      'kyle/angry: Cartman, you have to seal that fountain! The darkness is gonna swallow the whole town!',
      'cartman/smug: Whatever, whatever! I do what I want!',
      'cartman/smug: Besides, I like the dark, Kahl. In the dark, nobody sees me eat the last Cheesy Poof.',
      'stan: Cartman, we just wanna go home.',
      "cartman/angry: Then you'll have to get through ME... and my loyal knight!",
      'goomba/happy: HO HO HO! SIR GOOMBA, AT YOUR SERVICE, YOUR MAJESTY!',
      'cartman/angry: Goomba! ATTACK!',
      'goomba: But... what about the bigger cape you promised me?',
      'cartman/grit: LATER, Goomba! {shake}ATTACK!{shake}',
    ]);
  } else {
    await Dlg.say(['cartman/smug: Back for more? RESPECT MY AUTHORITAH!', 'goomba/angry: HO HO HO! En garde!']);
  }
  const res = await Battle.start({
    enemies: ['cartman', 'goomba'], music: 'boss', positions: [[272, 132], [228, 160]], money: 0, retryAt: [160, 214],
    intro: '* Emperor Cartman and Sir Goomba block the way!',
    noVictoryText: true,
    onEnd: async (B, r) => {
      if (r !== 'win') return;
      const c = B.enemies.find((e) => e.id === 'cartman');
      G.flags.boss_spared = c.gone === 'spared';
      const goom = B.enemies.find((e) => e.id === 'goomba');
      G.flags.goomba_spared = goom.gone === 'spared';
      c.alpha = 1; c.spareFade = false; c.fleeX = 0; c.data.cry = !G.flags.boss_spared;
      await enemySays(B, c, G.flags.boss_spared ? 'Fine... FINE. You guys win.' : 'OWWW! Fine! FINE! YOU GUYS WIN!');
      await B.say('* YOU WON!\n* Got 0 EXP and 0 D$.\n* (The Emperor had no money. He spent it all on snacks.)');
    },
  });
  if (res === 'lose') return;
  setFlag('boss_done');
  await afterBoss(cart);
}
async function afterBoss(cart) {
  Music.play('tension');
  await Dlg.say([
    "cartman/sad: Screw you guys... I'm going home!",
  ]);
  await Cut.walk(cart, 120, 140, 2);
  await Dlg.say([
    "kyle/angry: You CAN'T go home, Cartman! The fountain is still open!",
    'cartman/surprised: ...Oh.',
  ]);
  if (G.flags.goomba_spared) {
    await Dlg.say([
      'goomba/sad: Your Majesty... what about my bigger cape?',
      'cartman/annoyed: There is no bigger cape, Goomba. There never was.',
      'goomba/sad: ...',
      "kyle/angry: You're a horrible person, Cartman.",
      "stan: Goomba... your cape is already pretty sweet the way it is.",
      'goomba/happy: ...You really think so?! HO HO... ho.',
    ]);
  } else {
    await Dlg.say(['goomba/sad: (Sir Goomba is sitting in a corner, rethinking his life choices.)']);
  }
  await Dlg.say([
    'kenny/worried: Mmph mmph! (Guys! The fountain is behind the throne!)',
    "cartman/annoyed: Fine, fine. Let's go. But I'm NOT helping.",
  ]);
  await World.go('fonte', 160, 200, 'up', 16);
}

ROOMS.fonte = {
  name: 'The Dark Fountain', tileset: 'dark', dark: true, music: 'fountain',
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
      'kenny: Mmph. (This is the {pu}DARK FOUNTAIN{w}.)',
      'kenny/worried: Mmph mmph. (Only someone with a real {r}SOUL{w} can seal it. A hero from the Light World.)',
      "cartman/smug: Well, that explains why Kenny can't do it. He's barely even alive.",
      'kenny/annoyed: Mmph.',
      'kyle: Go on, Stan. You can do this.',
    ]);
    await sealScene();
  },
};
async function sealScene() {
  if (hasFlag('sealed')) return;
  const p = World.player;
  await Cut.walk(p, 160, 138, 1);
  p.facing = 'up';
  await Dlg.say(['* (You reach out toward the darkness...)']);
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
    'kyle: You know, Stan... I learned something today.',
    'kyle: Sometimes the darkest world is the one we make when we only think about ourselves.',
    'stan: Yeah. And a mushroom in a cape can be more loyal than a lot of so-called friends.',
    "cartman/annoyed: That's the lamest lesson ever.",
    "kenny/happy: Mmph mmph! (At least I didn't die today!)",
  ]);
  await wait(20);
  Sfx.play('fall');
  await Dlg.say(['* (Fwiiiiiiiiiiiiiiiioooo...)'], { pos: 'top' });
  const gb = World.addObject({ type: 'goomba', kind: 'goomba', x: kenny.x, y: -40, facing: 'down', name_: 'goomba', solid: false });
  await tween(gb, { y: kenny.y }, 18, Ease.in);
  Sfx.play('splat'); Shake.start(4, 12);
  kenny.visible = false;
  await wait(24);
  await Dlg.say([
    'goomba/shock: ...Oops.',
    'stan/shock: OH MY GOD! THEY KILLED KENNY!',
    'kyle/angry: YOU BASTARDS!',
    "goomba/worried: I just came through the closet to say goodbye! I didn't think about the landing! HO... ho?",
    'cartman/happy: Hehehe. Sweet.',
  ]);
  await wait(20);
  Music.stop(30);
  await Fade.out(40);
  await Scenes.credits();
}
