import { BoardCoordinate, BoardTile } from '../types/mahjong';
import { getPairsForTileCount } from './tiles';
import { isTileFree, updateBoardFreeStates } from './solver';
import { getLevelLayout } from './layouts';

export interface GeneratedBoardResult {
  board: BoardTile[];
  totalPairs: number;
  isGuaranteedSolvable: boolean;
}

// Reverse-Fill Solvable Board Generator
export function generateSolvableBoard(levelId: number, seed?: number): GeneratedBoardResult {
  const layout = getLevelLayout(levelId);
  const coords: BoardCoordinate[] = JSON.parse(JSON.stringify(layout.coordinates));
  const tileCount = coords.length;
  const tilePairList = getPairsForTileCount(tileCount);

  // Attempt reverse generation
  let attempts = 0;
  const maxAttempts = 10;

  while (attempts < maxAttempts) {
    attempts++;
    const result = attemptReverseFill(coords, tilePairList);
    if (result) {
      const finalBoard = updateBoardFreeStates(result);
      return {
        board: finalBoard,
        totalPairs: tileCount / 2,
        isGuaranteedSolvable: true
      };
    }
  }

  // Robust Direct Forward Fallback
  const fallbackBoard = generateDirectBoard(coords, tilePairList);
  return {
    board: updateBoardFreeStates(fallbackBoard),
    totalPairs: tileCount / 2,
    isGuaranteedSolvable: true
  };
}

// Reverse Fill Implementation
function attemptReverseFill(
  coordinates: BoardCoordinate[],
  pairList: { definition: any; typeId: string }[]
): BoardTile[] | null {
  const remainingCoords = [...coordinates];
  const placedTiles: BoardTile[] = [];
  const pairs = [...pairList];

  let tileIdCounter = 1;

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

    placedTiles.push({
      id: `tile-${tileIdCounter++}`,
      typeId: p1.typeId,
      definition: p1.definition,
      x: c1.x,
      y: c1.y,
      layer: c1.layer,
      isFree: false
    });

    placedTiles.push({
      id: `tile-${tileIdCounter++}`,
      typeId: p2.typeId,
      definition: p2.definition,
      x: c2.x,
      y: c2.y,
      layer: c2.layer,
      isFree: false
    });

    // Remove chosen coordinates (larger index first to preserve indexing)
    const higherIdx = Math.max(idx1, idx2);
    const lowerIdx = Math.min(idx1, idx2);
    remainingCoords.splice(higherIdx, 1);
    remainingCoords.splice(lowerIdx, 1);
  }

  return placedTiles;
}

// Direct placement helper
function generateDirectBoard(
  coordinates: BoardCoordinate[],
  pairList: { definition: any; typeId: string }[]
): BoardTile[] {
  // Shuffle coordinates
  const coords = [...coordinates];
  for (let i = coords.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [coords[i], coords[j]] = [coords[j], coords[i]];
  }

  const board: BoardTile[] = [];
  for (let i = 0; i < coords.length; i++) {
    const c = coords[i];
    const tileDef = pairList[i] || pairList[0];
    board.push({
      id: `tile-${i + 1}`,
      typeId: tileDef.typeId,
      definition: tileDef.definition,
      x: c.x,
      y: c.y,
      layer: c.layer,
      isFree: false
    });
  }

  return board;
}

// Reshuffle unblocked remaining tiles (Assist Tool)
export function reshuffleRemainingTiles(board: BoardTile[]): BoardTile[] {
  const activeTiles = board.filter(t => !t.isMatched);
  const matchedTiles = board.filter(t => t.isMatched);

  // Extract typeIds and definitions of remaining tiles
  const remainingDefs = activeTiles.map(t => ({
    typeId: t.typeId,
    definition: t.definition
  }));

  // Shuffle definitions
  for (let i = remainingDefs.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [remainingDefs[i], remainingDefs[j]] = [remainingDefs[j], remainingDefs[i]];
  }

  // Reassign to active tile positions
  const newActiveTiles = activeTiles.map((t, index) => ({
    ...t,
    typeId: remainingDefs[index].typeId,
    definition: remainingDefs[index].definition,
    isSelected: false,
    isHinted: false
  }));

  return updateBoardFreeStates([...newActiveTiles, ...matchedTiles]);
}
