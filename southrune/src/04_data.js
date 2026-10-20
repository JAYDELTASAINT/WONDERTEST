'use strict';
/* Dados do jogo: itens, equipamentos, magias, membros do grupo e estado salvo (textos em inglês). */

const ITEMS = {
  cheesy: { name: 'Cheesy Poofs', type: 'heal', heal: 40, price: 30, sell: 12, desc: "Cheesy Poofs! You're gonna eat 'em up. Heals 40 HP." },
  snacky: { name: 'Snacky Cake', type: 'heal', heal: 70, price: 60, sell: 25, desc: "Cartman's favorite. He'd kill for one. Heals 70 HP." },
  choco: { name: 'Hot Cocoa', type: 'heal', heal: 30, all: true, price: 50, sell: 20, desc: 'With tiny marshmallows. Heals 30 HP to everyone.' },
  sopa: { name: 'Pot Pie', type: 'heal', heal: 100, price: 0, sell: 40, desc: "Made by Cartman's mom. She's so sweet. Heals 100 HP." },
  bala: { name: 'Weight Gain 4000', type: 'heal', revive: 0.6, heal: 50, price: 80, sell: 30, desc: 'BEEFCAKE! Revives a downed ally, or heals 50 HP.' },
  bandaid: { name: 'Band-Aid', type: 'heal', heal: 20, price: 15, sell: 5, desc: 'It has dinosaurs on it. Heals 20 HP.' },
  espada: { name: 'Wooden Sword', type: 'weapon', who: ['stan'], atk: 2, sell: 5, desc: 'Not the Stick of Truth. Just a stick. ATK +2.' },
  taco: { name: 'Hockey Stick', type: 'weapon', who: ['stan'], atk: 5, sell: 40, desc: 'From the school team. Go Cows! ATK +5.' },
  cajado: { name: 'Green Staff', type: 'weapon', who: ['kyle'], atk: 1, mag: 2, sell: 5, desc: 'Glows when Kyle gets mad. ATK +1 MAG +2.' },
  foice: { name: 'Toy Scythe', type: 'weapon', who: ['kenny'], atk: 1, mag: 1, sell: 5, desc: 'From a costume store. Fitting. ATK +1 MAG +1.' },
  luvas: { name: 'Wool Mittens', type: 'armor', def: 1, sell: 5, desc: 'Warm and fuzzy. DEF +1.' },
  cachecol: { name: 'Striped Scarf', type: 'armor', def: 2, sell: 30, desc: "Knitted by Stan's grandpa. He'd rather be dead. DEF +2." },
  gorro: { name: 'Spare Beanie', type: 'armor', def: 1, mag: 1, sell: 20, desc: 'Always good to have one. DEF +1 MAG +1.' },
};

const SPELLS = {
  furia: { name: 'Jersey Rage', tp: 50, target: 'enemy', desc: 'Kyle goes full Jersey. Huge magic damage.' },
  licao: { name: 'Moral Speech', tp: 32, target: 'none', desc: '"I learned something today." +20% MERCY to all.' },
  cura: { name: 'Hell Prayer', tp: 32, target: 'ally', desc: 'Kenny prays to a friend from Hell. Heals a lot.' },
  pacificar: { name: 'Pacify', tp: 16, target: 'enemy', desc: 'Spares a TIRED (blue) enemy.' },
};

const MEMBERS = {
  stan: { name: 'STAN', color: '#5ab4ff', dark: '#1e3c6a', hp: 90, atk: 10, def: 2, mag: 0, spells: [], weapon: 'espada', armor: ['luvas', null],
    title: 'Beanie Knight', desc: 'The leader. Throws up when he gets nervous.' },
  kyle: { name: 'KYLE', color: '#5cdd5c', dark: '#1e5a24', hp: 110, atk: 12, def: 1, mag: 3, spells: ['furia', 'licao'], weapon: 'cajado', armor: [null, null],
    title: 'Green Hat Mage', desc: 'Hot-headed. Loves a good moral speech.' },
  kenny: { name: 'KENNY', color: '#ffa232', dark: '#6a3a0a', hp: 70, atk: 7, def: 1, mag: 7, spells: ['cura', 'pacificar'], weapon: 'foice', armor: [null, null],
    title: 'Hooded Immortal', desc: 'Dies all the time. Always comes back.' },
};

/* Estado do jogo (salvo em localStorage) */
let G = null;
function newGame() {
  G = {
    party: ['stan'],
    hp: { stan: 90, kyle: 110, kenny: 70 },
    equip: {
      stan: { weapon: 'espada', armor: ['luvas', null] },
      kyle: { weapon: 'cajado', armor: [null, null] },
      kenny: { weapon: 'foice', armor: [null, null] },
    },
    items: [],
    money: 0,
    flags: {},
    room: 'ponto', x: 0, y: 0, facing: 'down',
    time: 0,
    dark: false,
  };
  return G;
}
function stat(id, key) {
  const m = MEMBERS[id];
  let v = m[key] || 0;
  const e = G.equip[id];
  for (const it of [e.weapon, ...e.armor]) if (it && ITEMS[it] && ITEMS[it][key]) v += ITEMS[it][key];
  return v;
}
const maxHp = (id) => MEMBERS[id].hp;
function healMember(id, amt) {
  const before = G.hp[id];
  G.hp[id] = Math.min(maxHp(id), G.hp[id] + amt);
  return G.hp[id] - before;
}
function healAll() { for (const id of G.party) G.hp[id] = maxHp(id); }
function addItem(id) {
  if (G.items.length >= 12) return false;
  G.items.push(id); return true;
}
function removeItemAt(i) { G.items.splice(i, 1); }
function hasFlag(f) { return !!G.flags[f]; }
function setFlag(f, v = true) { G.flags[f] = v; }

const SAVE_KEY = 'southrune_save_v1', CONF_KEY = 'southrune_conf_v1';
const Save = {
  exists() { return !!Store.get(SAVE_KEY); },
  info() { return Store.get(SAVE_KEY); },
  write() {
    const data = JSON.parse(JSON.stringify(G));
    data.savedAt = Date.now();
    return Store.set(SAVE_KEY, data);
  },
  load() {
    const d = Store.get(SAVE_KEY);
    if (!d) return false;
    newGame();
    Object.assign(G, d);
    return true;
  },
};
function fmtTime(frames) {
  const s = Math.floor(frames / FPS), m = Math.floor(s / 60), h = Math.floor(m / 60);
  return h > 0 ? `${h}:${U.pad(m % 60, 2, '0')}:${U.pad(s % 60, 2, '0')}` : `${m}:${U.pad(s % 60, 2, '0')}`;
}
