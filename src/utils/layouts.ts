import { BoardCoordinate, LevelLayoutTemplate } from '../types/mahjong';

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

  // Ensure total is even and exactly scaled
  return trimOrPadCoordinates(coords, 144);
}

// 2. Pyramid Layout (72 tiles)
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

// 3. Mini Starter Layout (36 tiles - Level 1)
export function getMiniStarterLayout(): BoardCoordinate[] {
  const coords: BoardCoordinate[] = [];
  // 4x4 layer 0 (16)
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      coords.push({ x: c * 2 + 2, y: r * 2 + 2, layer: 0 });
    }
  }
  // 3x3 layer 1 (9) -> trimmed to 8
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
  // 4 corner pillars
  coords.push({ x: 0, y: 0, layer: 0 });
  coords.push({ x: 10, y: 0, layer: 0 });
  coords.push({ x: 0, y: 10, layer: 0 });
  coords.push({ x: 10, y: 10, layer: 0 });
  coords.push({ x: 5, y: 5, layer: 3 });
  coords.push({ x: 5, y: 7, layer: 3 });

  return trimOrPadCoordinates(coords, 36);
}

// 4. Fortress Layout (108 tiles)
export function getFortressLayout(): BoardCoordinate[] {
  const coords: BoardCoordinate[] = [];
  // Outer perimeter & towers
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const isWall = r === 0 || r === 7 || c === 0 || c === 7;
      const isTower = (r === 0 || r === 7) && (c === 0 || c === 7);
      if (isWall) {
        coords.push({ x: c * 2, y: r * 2, layer: 0 });
        if (isTower) {
          coords.push({ x: c * 2, y: r * 2, layer: 1 });
          coords.push({ x: c * 2, y: r * 2, layer: 2 });
        }
      } else if (r >= 2 && r <= 5 && c >= 2 && c <= 5) {
        coords.push({ x: c * 2, y: r * 2, layer: 0 });
        coords.push({ x: c * 2, y: r * 2, layer: 1 });
      }
    }
  }
  return trimOrPadCoordinates(coords, 108);
}

// 5. Butterfly / Wings Layout (96 tiles)
export function getButterflyLayout(): BoardCoordinate[] {
  const coords: BoardCoordinate[] = [];
  // Central body
  for (let r = 0; r < 6; r++) {
    coords.push({ x: 6, y: r * 2, layer: 0 });
    coords.push({ x: 8, y: r * 2, layer: 0 });
    coords.push({ x: 7, y: r * 2, layer: 1 });
  }
  // Left Wing
  for (let r = 0; r < 6; r++) {
    const width = (r === 0 || r === 5) ? 2 : 3;
    for (let c = 0; c < width; c++) {
      coords.push({ x: (3 - c) * 2, y: r * 2, layer: 0 });
      if (c === 1) coords.push({ x: (3 - c) * 2, y: r * 2, layer: 1 });
    }
  }
  // Right Wing
  for (let r = 0; r < 6; r++) {
    const width = (r === 0 || r === 5) ? 2 : 3;
    for (let c = 0; c < width; c++) {
      coords.push({ x: (4 + c) * 2 + 2, y: r * 2, layer: 0 });
      if (c === 1) coords.push({ x: (4 + c) * 2 + 2, y: r * 2, layer: 1 });
    }
  }
  return trimOrPadCoordinates(coords, 96);
}

// Utility: Trim or pad coordinates to exact target count (must be even)
function trimOrPadCoordinates(coords: BoardCoordinate[], targetCount: number): BoardCoordinate[] {
  const target = targetCount % 2 === 0 ? targetCount : targetCount + 1;
  
  if (coords.length > target) {
    // Symmetrically trim
    const trimmed = coords.slice(0, target);
    return trimmed;
  }
  
  // Symmetrically pad if needed
  const res = [...coords];
  let step = 0;
  while (res.length < target) {
    res.push({ x: (step % 6) * 2 + 1, y: Math.floor(step / 6) * 2 + 1, layer: 0 });
    res.push({ x: (step % 6) * 2 + 3, y: Math.floor(step / 6) * 2 + 1, layer: 0 });
    step += 2;
  }
  return res.slice(0, target);
}

// Dynamic 500 Campaign Levels Generator
export function getLevelLayout(levelId: number): LevelLayoutTemplate {
  const safeId = Math.max(1, Math.min(500, levelId));
  
  // Scaling tile count: Level 1 = 36 tiles -> Level 500 = 144 tiles
  const progressRatio = (safeId - 1) / 499;
  // Step in multiples of 4 or 2
  const rawTileCount = Math.round(36 + progressRatio * (144 - 36));
  const tileCount = rawTileCount % 2 === 0 ? rawTileCount : rawTileCount + 1;

  const archetypeIndex = safeId % 8;
  let coords: BoardCoordinate[];
  let name = `Level ${safeId}`;
  let category: LevelLayoutTemplate['category'] = 'Classic';

  switch (archetypeIndex) {
    case 0:
      coords = getClassicTurtleLayout();
      name = `Great Turtle ${safeId}`;
      category = 'Classic';
      break;
    case 1:
      coords = getPyramidLayout();
      name = `Solar Pyramid ${safeId}`;
      category = 'Geometric';
      break;
    case 2:
      coords = getFortressLayout();
      name = `Imperial Fortress ${safeId}`;
      category = 'Structures';
      break;
    case 3:
      coords = getButterflyLayout();
      name = `Jade Butterfly ${safeId}`;
      category = 'Animals';
      break;
    case 4:
      coords = getMiniStarterLayout();
      name = `Lotus Blossom ${safeId}`;
      category = 'Symbols';
      break;
    case 5:
      coords = getClassicTurtleLayout();
      name = `Dragon Crest ${safeId}`;
      category = 'Animals';
      break;
    case 6:
      coords = getPyramidLayout();
      name = `Mountain Bridge ${safeId}`;
      category = 'Structures';
      break;
    default:
      coords = getButterflyLayout();
      name = `Celestial Arena ${safeId}`;
      category = 'Geometric';
      break;
  }

  // Adjust coordinates to match the scaled level tileCount
  const scaledCoords = trimOrPadCoordinates(coords, tileCount);

  return {
    id: safeId,
    name,
    nameEn: name,
    category,
    tileCount: scaledCoords.length,
    coordinates: scaledCoords
  };
}
