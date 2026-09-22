import { BoardTile } from '../types/mahjong';

// Check if tile A is covered from directly above (layer + 1)
export function isCoveredAbove(tile: { x: number; y: number; layer: number }, activeTiles: { x: number; y: number; layer: number }[]): boolean {
  for (const other of activeTiles) {
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
export function isBlockedOnLeft(tile: { x: number; y: number; layer: number }, activeTiles: { x: number; y: number; layer: number }[]): boolean {
  for (const other of activeTiles) {
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
export function isBlockedOnRight(tile: { x: number; y: number; layer: number }, activeTiles: { x: number; y: number; layer: number }[]): boolean {
  for (const other of activeTiles) {
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
export function isTileFree(tile: { x: number; y: number; layer: number }, activeTiles: { x: number; y: number; layer: number }[]): boolean {
  if (isCoveredAbove(tile, activeTiles)) return false;
  const leftBlocked = isBlockedOnLeft(tile, activeTiles);
  const rightBlocked = isBlockedOnRight(tile, activeTiles);
  return !leftBlocked || !rightBlocked;
}

// Update `isFree` status on an entire active board
export function updateBoardFreeStates(board: BoardTile[]): BoardTile[] {
  const active = board.filter(t => !t.isMatched);
  return board.map(tile => {
    if (tile.isMatched) {
      return { ...tile, isFree: false };
    }
    const free = isTileFree(tile, active);
    return { ...tile, isFree: free };
  });
}

// Find all currently available matching pairs
export function findAvailableMatches(board: BoardTile[]): { tile1: BoardTile; tile2: BoardTile }[] {
  const freeTiles = board.filter(t => !t.isMatched && t.isFree);
  const matches: { tile1: BoardTile; tile2: BoardTile }[] = [];

  for (let i = 0; i < freeTiles.length; i++) {
    for (let j = i + 1; j < freeTiles.length; j++) {
      const t1 = freeTiles[i];
      const t2 = freeTiles[j];
      if (t1.typeId === t2.typeId) {
        matches.push({ tile1: t1, tile2: t2 });
      }
    }
  }

  return matches;
}

// Get best Hint pair
export function getHintPair(board: BoardTile[]): [string, string] | null {
  const matches = findAvailableMatches(board);
  if (matches.length === 0) return null;
  // Pick first available match
  return [matches[0].tile1.id, matches[0].tile2.id];
}
