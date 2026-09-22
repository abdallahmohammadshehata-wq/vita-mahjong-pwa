import { TileDefinition, TileSuit } from '../types/mahjong';

// 1. Character Suit (萬 Wan) 1-9
const CHAR_NUMERALS = ['一', '二', '三', '四', '五', '六', '七', '八', '九'];
const CHARACTER_TILES: TileDefinition[] = Array.from({ length: 9 }, (_, i) => ({
  suit: 'character' as TileSuit,
  value: i + 1,
  label: `${CHAR_NUMERALS[i]}萬`,
  symbol: CHAR_NUMERALS[i],
  pinyin: `${CHAR_NUMERALS[i]} wàn`,
  nameEn: `${i + 1} Character`
}));

// 2. Bamboo Suit (條 Tiao) 1-9
const BAMBOO_TILES: TileDefinition[] = Array.from({ length: 9 }, (_, i) => ({
  suit: 'bamboo' as TileSuit,
  value: i + 1,
  label: `${i + 1}條`,
  symbol: `${i + 1}🎋`,
  pinyin: `${i + 1} tiáo`,
  nameEn: `${i + 1} Bamboo`
}));

// 3. Circle/Dot Suit (筒 Tong) 1-9
const CIRCLE_TILES: TileDefinition[] = Array.from({ length: 9 }, (_, i) => ({
  suit: 'circle' as TileSuit,
  value: i + 1,
  label: `${i + 1}筒`,
  symbol: `${i + 1}🔴`,
  pinyin: `${i + 1} tǒng`,
  nameEn: `${i + 1} Circle`
}));

// 4. Winds (風 Feng) 4 types
const WIND_SYMBOLS = [
  { val: 1, char: '東', name: 'East Wind' },
  { val: 2, char: '南', name: 'South Wind' },
  { val: 3, char: '西', name: 'West Wind' },
  { val: 4, char: '北', name: 'North Wind' }
];
const WIND_TILES: TileDefinition[] = WIND_SYMBOLS.map(w => ({
  suit: 'wind' as TileSuit,
  value: w.val,
  label: w.char,
  symbol: w.char,
  nameEn: w.name
}));

// 5. Dragons (三元牌 Sanyuan) 3 types
const DRAGON_SYMBOLS = [
  { val: 1, char: '中', name: 'Red Dragon' },
  { val: 2, char: '發', name: 'Green Dragon' },
  { val: 3, char: '白', name: 'White Dragon' }
];
const DRAGON_TILES: TileDefinition[] = DRAGON_SYMBOLS.map(d => ({
  suit: 'dragon' as TileSuit,
  value: d.val,
  label: d.char,
  symbol: d.char,
  nameEn: d.name
}));

// 6. Seasons (四季) 4 types (match each other)
const SEASON_SYMBOLS = [
  { val: 1, char: '春', name: 'Spring' },
  { val: 2, char: '夏', name: 'Summer' },
  { val: 3, char: '秋', name: 'Autumn' },
  { val: 4, char: '冬', name: 'Winter' }
];
const SEASON_TILES: TileDefinition[] = SEASON_SYMBOLS.map(s => ({
  suit: 'season' as TileSuit,
  value: s.val,
  label: s.char,
  symbol: s.char,
  nameEn: s.name
}));

// 7. Flowers (四君子) 4 types (match each other)
const FLOWER_SYMBOLS = [
  { val: 1, char: '梅', name: 'Plum Blossom' },
  { val: 2, char: '蘭', name: 'Orchid' },
  { val: 3, char: '竹', name: 'Bamboo Flower' },
  { val: 4, char: '菊', name: 'Chrysanthemum' }
];
const FLOWER_TILES: TileDefinition[] = FLOWER_SYMBOLS.map(f => ({
  suit: 'flower' as TileSuit,
  value: f.val,
  label: f.char,
  symbol: f.char,
  nameEn: f.name
}));

// Generate complete 144-tile standard Mahjong set
export function getStandardTilePool(): { definition: TileDefinition; typeId: string }[] {
  const pool: { definition: TileDefinition; typeId: string }[] = [];

  // 4 of each Character (36 tiles)
  for (const def of CHARACTER_TILES) {
    for (let i = 0; i < 4; i++) {
      pool.push({ definition: def, typeId: `char-${def.value}` });
    }
  }

  // 4 of each Bamboo (36 tiles)
  for (const def of BAMBOO_TILES) {
    for (let i = 0; i < 4; i++) {
      pool.push({ definition: def, typeId: `bamboo-${def.value}` });
    }
  }

  // 4 of each Circle (36 tiles)
  for (const def of CIRCLE_TILES) {
    for (let i = 0; i < 4; i++) {
      pool.push({ definition: def, typeId: `circle-${def.value}` });
    }
  }

  // 4 of each Wind (16 tiles)
  for (const def of WIND_TILES) {
    for (let i = 0; i < 4; i++) {
      pool.push({ definition: def, typeId: `wind-${def.value}` });
    }
  }

  // 4 of each Dragon (12 tiles)
  for (const def of DRAGON_TILES) {
    for (let i = 0; i < 4; i++) {
      pool.push({ definition: def, typeId: `dragon-${def.value}` });
    }
  }

  // 1 of each Season (4 tiles - all match under 'season-any')
  for (const def of SEASON_TILES) {
    pool.push({ definition: def, typeId: 'season-any' });
  }

  // 1 of each Flower (4 tiles - all match under 'flower-any')
  for (const def of FLOWER_TILES) {
    pool.push({ definition: def, typeId: 'flower-any' });
  }

  return pool;
}

// Generate scaled pairs for smaller boards (e.g. 36 to 144 tiles)
export function getPairsForTileCount(count: number): { definition: TileDefinition; typeId: string }[] {
  const targetPairs = Math.floor(count / 2);
  const fullPool = getStandardTilePool();
  
  // Group full pool into matching pairs
  const pairMap: Record<string, { definition: TileDefinition; typeId: string }[]> = {};
  for (const item of fullPool) {
    if (!pairMap[item.typeId]) pairMap[item.typeId] = [];
    pairMap[item.typeId].push(item);
  }

  const allAvailablePairs: { definition: TileDefinition; typeId: string }[][] = [];
  for (const typeId in pairMap) {
    const list = pairMap[typeId];
    while (list.length >= 2) {
      allAvailablePairs.push([list.pop()!, list.pop()!]);
    }
  }

  // Shuffle available pairs
  for (let i = allAvailablePairs.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [allAvailablePairs[i], allAvailablePairs[j]] = [allAvailablePairs[j], allAvailablePairs[i]];
  }

  const selectedPairs = allAvailablePairs.slice(0, targetPairs);
  const result: { definition: TileDefinition; typeId: string }[] = [];
  for (const pair of selectedPairs) {
    result.push(pair[0], pair[1]);
  }

  return result;
}
