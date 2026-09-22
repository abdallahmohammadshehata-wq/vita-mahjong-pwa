export type TileSuit = 
  | 'character' // 萬 Wan (1-9)
  | 'bamboo'    // 條 Tiao (1-9)
  | 'circle'    // 筒 Tong (1-9)
  | 'wind'      // 東 南 西 北
  | 'dragon'    // 中 發 白
  | 'season'    // 春 夏 秋 冬 (Any matches any season)
  | 'flower';   // 梅 蘭 竹 菊 (Any matches any flower)

export interface TileDefinition {
  suit: TileSuit;
  value: number; // 1-9 for numbered, 1-4 for winds/seasons/flowers, 1-3 for dragons
  label: string; // e.g. "1萬", "5條", "中", "春"
  symbol: string; // Unicode character or graphical representation
  pinyin?: string;
  nameEn: string;
}

export interface BoardTile {
  id: string; // Unique instance ID: e.g. "tile-12-character-5"
  typeId: string; // Matching type key: e.g. "char-5" or "season-all"
  definition: TileDefinition;
  x: number; // 0.5 grid step units for half-tile offsets
  y: number;
  layer: number; // 0 = base layer, 1, 2, 3...
  isFree: boolean;
  isSelected?: boolean;
  isHinted?: boolean;
  isMatched?: boolean;
}

export interface BoardCoordinate {
  x: number;
  y: number;
  layer: number;
}

export interface LevelLayoutTemplate {
  id: number;
  name: string;
  nameEn: string;
  category: 'Classic' | 'Geometric' | 'Animals' | 'Structures' | 'Symbols';
  tileCount: number;
  coordinates: BoardCoordinate[];
}

export interface MoveRecord {
  tile1: BoardTile;
  tile2: BoardTile;
  timestamp: number;
  pointsEarned: number;
}

export type GameTheme = 'ivory' | 'sage' | 'wood' | 'dark';

export interface LevelProgress {
  levelId: number;
  unlocked: boolean;
  completed: boolean;
  stars: number; // 1-3
  bestTime: number; // seconds
  bestScore: number;
  highCombo: number;
}
