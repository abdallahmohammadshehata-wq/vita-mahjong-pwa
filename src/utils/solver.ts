import { BoardTile } from '../types/mahjong';

// Check if tile A is covered from directly above (layer + 1)
export function isCoveredAbove(
  tile: { x: number; y: number; layer: number }, 
  activeBoardTiles: { x: number; y: number; layer: number }[]
): boolean {
  for (const other of activeBoardTiles) {
    if (other === tile) continue;
    if (other.layer === tile.layer + 1) {
      // Overlap condition: both width (2 units) and height (2 units) overlap
      if (Math.abs(other.x - tile.x) < 2 && Math.abs(other.y - tile.y) < 2) {
        return true;
      }
    }
  }
  return false;
}

// Check if tile A is blocked on its left side (same layer)
export function isBlockedOnLeft(
  tile: { x: number; y: number; layer: number }, 
  activeBoardTiles: { x: number; y: number; layer: number }[]
): boolean {
  for (const other of activeBoardTiles) {
    if (other === tile) continue;
    if (other.layer === tile.layer) {
      if (other.x < tile.x && other.x >= tile.x - 2 && Math.abs(other.y - tile.y) < 2) {
        return true;
      }
    }
  }
  return false;
}

// Check if tile A is blocked on its right side (same layer)
export function isBlockedOnRight(
  tile: { x: number; y: number; layer: number }, 
  activeBoardTiles: { x: number; y: number; layer: number }[]
): boolean {
  for (const other of activeBoardTiles) {
    if (other === tile) continue;
    if (other.layer === tile.layer) {
      if (other.x > tile.x && other.x <= tile.x + 2 && Math.abs(other.y - tile.y) < 2) {
        return true;
      }
    }
  }
  return false;
}

// Core Free Tile Rule: Not covered above AND (Not blocked left OR Not blocked right)
export function isTileFree(
  tile: { x: number; y: number; layer: number }, 
  activeBoardTiles: { x: number; y: number; layer: number }[]
): boolean {
  if (isCoveredAbove(tile, activeBoardTiles)) return false;
  const leftBlocked = isBlockedOnLeft(tile, activeBoardTiles);
  const rightBlocked = isBlockedOnRight(tile, activeBoardTiles);
  return !leftBlocked || !rightBlocked;
}

// Update `isFree` status on an entire board (considering both board & 4-card storage dock)
export function updateBoardFreeStates(board: BoardTile[]): BoardTile[] {
  // Only non-matched, non-stored tiles physically occupy space on the board
  const activeBoardTiles = board.filter(t => !t.isMatched && !t.isStored);

  return board.map(tile => {
    if (tile.isMatched) {
      return { ...tile, isFree: false };
    }
    // If tile is in the 4-card storage dock, it is always free/selectable
    if (tile.isStored) {
      return { ...tile, isFree: true };
    }
    // Check if locked
    if (tile.isLocked) {
      return { ...tile, isFree: false };
    }
    const free = isTileFree(tile, activeBoardTiles);
    return { ...tile, isFree: free };
  });
}

// Find all currently available matching pairs (Board-to-Board, Board-to-Storage, Storage-to-Storage)
export function findAvailableMatches(board: BoardTile[]): { tile1: BoardTile; tile2: BoardTile; source: 'BOARD' | 'STORAGE' | 'HYBRID' }[] {
  const freeBoardTiles = board.filter(t => !t.isMatched && !t.isStored && t.isFree);
  const storedTiles = board.filter(t => !t.isMatched && t.isStored);
  const matches: { tile1: BoardTile; tile2: BoardTile; source: 'BOARD' | 'STORAGE' | 'HYBRID' }[] = [];

  // 1. Board <-> Storage matches (highest priority assist)
  for (const stored of storedTiles) {
    for (const boardTile of freeBoardTiles) {
      if (stored.typeId === boardTile.typeId) {
        matches.push({ tile1: stored, tile2: boardTile, source: 'HYBRID' });
      }
    }
  }

  // 2. Storage <-> Storage matches
  for (let i = 0; i < storedTiles.length; i++) {
    for (let j = i + 1; j < storedTiles.length; j++) {
      if (storedTiles[i].typeId === storedTiles[j].typeId) {
        matches.push({ tile1: storedTiles[i], tile2: storedTiles[j], source: 'STORAGE' });
      }
    }
  }

  // 3. Board <-> Board matches
  for (let i = 0; i < freeBoardTiles.length; i++) {
    for (let j = i + 1; j < freeBoardTiles.length; j++) {
      const t1 = freeBoardTiles[i];
      const t2 = freeBoardTiles[j];
      if (t1.typeId === t2.typeId) {
        matches.push({ tile1: t1, tile2: t2, source: 'BOARD' });
      }
    }
  }

  return matches;
}

// Get best Hint pair
export function getHintPair(board: BoardTile[]): [string, string] | null {
  const matches = findAvailableMatches(board);
  if (matches.length === 0) return null;
  return [matches[0].tile1.id, matches[0].tile2.id];
}
