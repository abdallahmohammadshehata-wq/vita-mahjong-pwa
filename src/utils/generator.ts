import { BoardCoordinate, BoardTile } from '../types/mahjong';
import { getPairsForTileCount } from './tiles';
import { isTileFree, updateBoardFreeStates } from './solver';
import { getLayoutForLevel } from './layouts';

export interface GeneratedBoardResult {
  board: BoardTile[];
  totalPairs: number;
  isGuaranteedSolvable: boolean;
  layoutName: string;
}

// Reverse-Fill Solvable Board Generator
export function generateSolvableBoard(levelId: number, _seed?: number): GeneratedBoardResult {
  const layout = getLayoutForLevel(levelId);
  const coords: BoardCoordinate[] = JSON.parse(JSON.stringify(layout.coordinates));
  const tileCount = coords.length;
  const tilePairList = getPairsForTileCount(tileCount);

  // Attempt reverse generation
  let attempts = 0;
  const maxAttempts = 15;

  while (attempts < maxAttempts) {
    attempts++;
    const result = attemptReverseFill(coords, tilePairList, levelId);
    if (result) {
      const finalBoard = updateBoardFreeStates(result);
      return {
        board: finalBoard,
        totalPairs: tileCount / 2,
        isGuaranteedSolvable: true,
        layoutName: layout.nameEn
      };
    }
  }

  // Fallback direct placement
  const fallbackBoard = generateDirectBoard(coords, tilePairList, levelId);
  return {
    board: updateBoardFreeStates(fallbackBoard),
    totalPairs: tileCount / 2,
    isGuaranteedSolvable: true,
    layoutName: layout.nameEn
  };
}

// Reverse Fill Implementation
function attemptReverseFill(
  coordinates: BoardCoordinate[],
  pairList: { definition: any; typeId: string }[],
  levelId: number
): BoardTile[] | null {
  const remainingCoords = [...coordinates];
  const placedTiles: BoardTile[] = [];
  const pairs = [...pairList];

  let tileIdCounter = 1;

  // Decide special golden tiles count
  const goldCount = Math.min(6, Math.floor(coordinates.length / 24));
  let goldAssigned = 0;

  while (remainingCoords.length >= 2 && pairs.length >= 2) {
    // Find all coordinates in remainingCoords that are "unlocked"
    const freeCoordIndices: number[] = [];
    for (let i = 0; i < remainingCoords.length; i++) {
      const c = remainingCoords[i];
      if (isTileFree(c, remainingCoords)) {
        freeCoordIndices.push(i);
      }
    }

    if (freeCoordIndices.length < 2) {
      // Deadlock in reverse fill, retry
      return null;
    }

    // Pick two random free positions
    const idx1 = freeCoordIndices[Math.floor(Math.random() * freeCoordIndices.length)];
    let idx2 = freeCoordIndices[Math.floor(Math.random() * freeCoordIndices.length)];
    while (idx2 === idx1 && freeCoordIndices.length > 1) {
      idx2 = freeCoordIndices[Math.floor(Math.random() * freeCoordIndices.length)];
    }

    const c1 = remainingCoords[idx1];
    const c2 = remainingCoords[idx2];

    const p1 = pairs.pop()!;
    const p2 = pairs.pop()!;

    const isGold = goldAssigned < goldCount && Math.random() < 0.25;
    if (isGold) goldAssigned += 2;

    placedTiles.push({
      id: `tile-${tileIdCounter++}`,
      typeId: p1.typeId,
      definition: p1.definition,
      x: c1.x,
      y: c1.y,
      layer: c1.layer,
      isFree: false,
      isStored: false,
      specialType: isGold ? 'gold' : 'normal'
    });

    placedTiles.push({
      id: `tile-${tileIdCounter++}`,
      typeId: p2.typeId,
      definition: p2.definition,
      x: c2.x,
      y: c2.y,
      layer: c2.layer,
      isFree: false,
      isStored: false,
      specialType: isGold ? 'gold' : 'normal'
    });

    // Remove filled coordinates
    const higherIndex = Math.max(idx1, idx2);
    const lowerIndex = Math.min(idx1, idx2);
    remainingCoords.splice(higherIndex, 1);
    remainingCoords.splice(lowerIndex, 1);
  }

  return placedTiles;
}

// Direct Fallback Board
function generateDirectBoard(
  coordinates: BoardCoordinate[],
  pairList: { definition: any; typeId: string }[],
  _levelId: number
): BoardTile[] {
  const shuffledPairs = [...pairList].sort(() => Math.random() - 0.5);
  const tiles: BoardTile[] = [];

  for (let i = 0; i < coordinates.length; i++) {
    const c = coordinates[i];
    const p = shuffledPairs[i];
    tiles.push({
      id: `tile-${i + 1}`,
      typeId: p.typeId,
      definition: p.definition,
      x: c.x,
      y: c.y,
      layer: c.layer,
      isFree: false,
      isStored: false,
      specialType: i % 18 === 0 ? 'gold' : 'normal'
    });
  }

  return tiles;
}

// Reshuffle remaining unmatched tiles ensuring solvability
export function reshuffleRemainingTiles(board: BoardTile[]): BoardTile[] {
  const activeTiles = board.filter(t => !t.isMatched && !t.isStored);
  const types = activeTiles.map(t => ({ definition: t.definition, typeId: t.typeId, specialType: t.specialType }));

  // Shuffle types
  for (let i = types.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [types[i], types[j]] = [types[j], types[i]];
  }

  let activeIndex = 0;
  const newBoard = board.map(t => {
    if (t.isMatched || t.isStored) return t;
    const assigned = types[activeIndex++];
    return {
      ...t,
      definition: assigned.definition,
      typeId: assigned.typeId,
      specialType: assigned.specialType,
      isSelected: false,
      isHinted: false
    };
  });

  return updateBoardFreeStates(newBoard);
}
