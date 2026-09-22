import { BoardCoordinate, LevelLayoutTemplate } from '../types/mahjong';

// Helper: Trim or pad coordinates to exactly targetCount (must be even)
function trimOrPadCoordinates(coords: BoardCoordinate[], targetCount: number): BoardCoordinate[] {
  let list = [...coords];
  // Filter duplicates
  const seen = new Set<string>();
  list = list.filter(c => {
    const key = `${c.x},${c.y},${c.layer}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  if (list.length > targetCount) {
    list = list.slice(0, targetCount);
  } else if (list.length < targetCount) {
    // Mirror or pad
    let i = 0;
    while (list.length < targetCount) {
      const base = list[i % list.length];
      const newCoord: BoardCoordinate = {
        x: base.x + 0.5,
        y: base.y + 0.5,
        layer: base.layer + 1
      };
      const key = `${newCoord.x},${newCoord.y},${newCoord.layer}`;
      if (!seen.has(key)) {
        seen.add(key);
        list.push(newCoord);
      }
      i++;
    }
  }

  // Ensure even count
  if (list.length % 2 !== 0) {
    list.pop();
  }

  return list;
}

// 1. Classic Turtle (144 tiles - 5 layers)
export function getClassicTurtleLayout(): BoardCoordinate[] {
  const coords: BoardCoordinate[] = [];

  // Layer 0: 8x12 base + extended wings
  const baseLayout = [
    "  111111111111  ",
    " 11111111111111 ",
    "1111111111111111",
    "1111111111111111",
    "1111111111111111",
    " 11111111111111 ",
    "  111111111111  "
  ];

  for (let r = 0; r < baseLayout.length; r++) {
    for (let c = 0; c < baseLayout[r].length; c += 2) {
      if (baseLayout[r][c] === '1') {
        coords.push({ x: c, y: r * 2, layer: 0 });
      }
    }
  }

  // Layer 1: 6x6 mid-structure
  for (let r = 1; r <= 5; r++) {
    for (let c = 4; c <= 10; c += 2) {
      coords.push({ x: c, y: r * 2, layer: 1 });
    }
  }

  // Layer 2: 4x4 inner shell
  for (let r = 2; r <= 4; r++) {
    for (let c = 6; c <= 8; c += 2) {
      coords.push({ x: c, y: r * 2, layer: 2 });
    }
  }

  // Layer 3: 2x2 top crown
  coords.push({ x: 7, y: 5, layer: 3 });
  coords.push({ x: 7, y: 7, layer: 3 });

  // Layer 4: 1 top pinnacle
  coords.push({ x: 7, y: 6, layer: 4 });

  return trimOrPadCoordinates(coords, 144);
}

// 2. Celestial 6-Layer Dragon Pagoda (Complex 6-Tier Architecture - 144 tiles)
export function getCelestialDragonPagodaLayout(): BoardCoordinate[] {
  const coords: BoardCoordinate[] = [];

  // Layer 0: Wide octagon foundation (10x10)
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 10; c++) {
      if ((r === 0 || r === 7) && (c < 2 || c > 7)) continue;
      coords.push({ x: c * 2, y: r * 2, layer: 0 });
    }
  }

  // Layer 1: Concentric Fortress Ring
  for (let r = 1; r < 7; r++) {
    for (let c = 2; c < 8; c++) {
      coords.push({ x: c * 2, y: r * 2, layer: 1 });
    }
  }

  // Layer 2: Quad Corner Towers + Central Spire
  for (let r = 2; r < 6; r++) {
    for (let c = 3; c < 7; c++) {
      coords.push({ x: c * 2, y: r * 2, layer: 2 });
    }
  }

  // Layer 3: Inner Sanctum (3x3)
  for (let r = 3; r < 6; r++) {
    for (let c = 4; c < 7; c++) {
      coords.push({ x: c * 2, y: r * 2, layer: 3 });
    }
  }

  // Layer 4: High Spires (2x2)
  coords.push({ x: 8, y: 6, layer: 4 });
  coords.push({ x: 10, y: 6, layer: 4 });
  coords.push({ x: 8, y: 8, layer: 4 });
  coords.push({ x: 10, y: 8, layer: 4 });

  // Layer 5: Apex Dragon Pearl
  coords.push({ x: 9, y: 7, layer: 5 });
  coords.push({ x: 9, y: 9, layer: 5 });

  return trimOrPadCoordinates(coords, 144);
}

// 3. Forbidden Palace Citadel (5 Layers - 128 tiles)
export function getForbiddenPalaceLayout(): BoardCoordinate[] {
  const coords: BoardCoordinate[] = [];

  // Outer Courtyard Base
  for (let r = 0; r < 7; r++) {
    for (let c = 0; c < 12; c++) {
      if (r > 1 && r < 5 && c > 2 && c < 9) continue; // Hollow courtyard
      coords.push({ x: c * 2, y: r * 2, layer: 0 });
    }
  }

  // Inner Gate Pillars (Layer 1)
  for (let r = 1; r < 6; r++) {
    for (let c = 2; c < 10; c++) {
      coords.push({ x: c * 2, y: r * 2, layer: 1 });
    }
  }

  // Grand Hall (Layer 2)
  for (let r = 2; r < 5; r++) {
    for (let c = 4; c < 8; c++) {
      coords.push({ x: c * 2, y: r * 2, layer: 2 });
    }
  }

  // Throne Dais (Layer 3 & 4)
  coords.push({ x: 10, y: 6, layer: 3 });
  coords.push({ x: 12, y: 6, layer: 3 });
  coords.push({ x: 11, y: 6, layer: 4 });

  return trimOrPadCoordinates(coords, 128);
}

// 4. Labyrinth Maze Matrix (4 Layers - 108 tiles)
export function getLabyrinthMazeLayout(): BoardCoordinate[] {
  const coords: BoardCoordinate[] = [];

  // Maze Base Grid
  for (let r = 0; r < 6; r++) {
    for (let c = 0; c < 10; c++) {
      if ((r + c) % 2 === 0 || r === 0 || r === 5 || c === 0 || c === 9) {
        coords.push({ x: c * 2, y: r * 2, layer: 0 });
      }
    }
  }

  // Bridge Overpasses (Layer 1)
  for (let r = 1; r < 5; r++) {
    for (let c = 2; c < 8; c += 2) {
      coords.push({ x: c * 2 + 1, y: r * 2, layer: 1 });
    }
  }

  // Central Towers (Layer 2 & 3)
  for (let r = 2; r < 4; r++) {
    for (let c = 4; c < 6; c++) {
      coords.push({ x: c * 2, y: r * 2, layer: 2 });
      coords.push({ x: c * 2 + 0.5, y: r * 2 + 0.5, layer: 3 });
    }
  }

  return trimOrPadCoordinates(coords, 108);
}

// 5. Pyramid Layout (72 tiles)
export function getPyramidLayout(): BoardCoordinate[] {
  const coords: BoardCoordinate[] = [];
  
  // Layer 0 (Base 6x6)
  for (let r = 0; r < 6; r++) {
    for (let c = 0; c < 6; c++) {
      coords.push({ x: c * 2, y: r * 2, layer: 0 });
    }
  }
  // Layer 1 (4x4)
  for (let r = 1; r < 5; r++) {
    for (let c = 1; c < 5; c++) {
      coords.push({ x: c * 2, y: r * 2, layer: 1 });
    }
  }
  // Layer 2 (2x2)
  for (let r = 2; r < 4; r++) {
    for (let c = 2; c < 4; c++) {
      coords.push({ x: c * 2, y: r * 2, layer: 2 });
    }
  }
  // Layer 3 (1x1)
  coords.push({ x: 5, y: 5, layer: 3 });
  coords.push({ x: 5, y: 7, layer: 3 });

  return trimOrPadCoordinates(coords, 72);
}

// 6. Mini Starter Layout (36 tiles - Level 1)
export function getMiniStarterLayout(): BoardCoordinate[] {
  const coords: BoardCoordinate[] = [];
  // 4x4 layer 0 (16)
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      coords.push({ x: c * 2 + 2, y: r * 2 + 2, layer: 0 });
    }
  }
  // 3x3 layer 1 (9)
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      coords.push({ x: c * 2 + 3, y: r * 2 + 3, layer: 1 });
    }
  }
  // 2x2 layer 2 (4)
  for (let r = 0; r < 2; r++) {
    for (let c = 0; c < 2; c++) {
      coords.push({ x: c * 2 + 4, y: r * 2 + 4, layer: 2 });
    }
  }
  return trimOrPadCoordinates(coords, 36);
}

// Generate Layout for any Level ID (1 to 500)
export function getLayoutForLevel(levelId: number): LevelLayoutTemplate {
  // Scaling tile count from 36 (Level 1) to 144 (Level 500)
  const clampedLevel = Math.max(1, Math.min(500, levelId));
  const rawTileCount = Math.round(36 + ((clampedLevel - 1) / 499) * (144 - 36));
  const tileCount = rawTileCount % 2 === 0 ? rawTileCount : rawTileCount + 1;

  // Archetype rotation
  const archetypeIndex = (levelId - 1) % 6;

  let baseCoords: BoardCoordinate[];
  let nameEn = '';
  let name = '';
  let category: LevelLayoutTemplate['category'] = 'Classic';
  let maxLayers = 4;

  switch (archetypeIndex) {
    case 0:
      baseCoords = getCelestialDragonPagodaLayout();
      name = '九龍寶塔 (Celestial Pagoda)';
      nameEn = 'Celestial Dragon Pagoda';
      category = 'Pagodas';
      maxLayers = 6;
      break;
    case 1:
      baseCoords = getForbiddenPalaceLayout();
      name = '紫禁宮闕 (Forbidden Palace)';
      nameEn = 'Forbidden Palace Citadel';
      category = 'Structures';
      maxLayers = 5;
      break;
    case 2:
      baseCoords = getLabyrinthMazeLayout();
      name = '八卦迷宮 (Eight Trigrams Maze)';
      nameEn = 'Labyrinth Maze Matrix';
      category = 'Mazes';
      maxLayers = 4;
      break;
    case 3:
      baseCoords = getClassicTurtleLayout();
      name = '金龜祝壽 (Immortal Turtle)';
      nameEn = 'Immortal Turtle';
      category = 'Classic';
      maxLayers = 5;
      break;
    case 4:
      baseCoords = getPyramidLayout();
      name = '天壇層樓 (Temple of Heaven)';
      nameEn = 'Temple of Heaven Pyramid';
      category = 'Complex';
      maxLayers = 4;
      break;
    default:
      baseCoords = getMiniStarterLayout();
      name = '太極初成 (Taiji Genesis)';
      nameEn = 'Taiji Genesis';
      category = 'Classic';
      maxLayers = 3;
      break;
  }

  const coordinates = trimOrPadCoordinates(baseCoords, tileCount);

  return {
    id: levelId,
    name,
    nameEn,
    category,
    tileCount: coordinates.length,
    coordinates,
    maxLayers
  };
}

export const getLevelLayout = getLayoutForLevel;
