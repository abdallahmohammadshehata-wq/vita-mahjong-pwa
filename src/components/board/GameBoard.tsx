import React, { useMemo } from 'react';
import { BoardTile } from '../../types/mahjong';
import { MahjongTile } from './MahjongTile';

interface GameBoardProps {
  board: BoardTile[];
  onTileClick: (tile: BoardTile) => void;
  scale?: number;
}

export const GameBoard: React.FC<GameBoardProps> = ({
  board,
  onTileClick,
  scale = 1
}) => {
  // Tile dimensions in pixels
  const tileSize = { width: 56, height: 72 };

  // Calculate layout bounding box
  const bounds = useMemo(() => {
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;
    let maxLayer = 0;

    board.forEach(tile => {
      if (tile.isMatched) return;
      if (tile.x < minX) minX = tile.x;
      if (tile.x > maxX) maxX = tile.x;
      if (tile.y < minY) minY = tile.y;
      if (tile.y > maxY) maxY = tile.y;
      if (tile.layer > maxLayer) maxLayer = tile.layer;
    });

    if (minX === Infinity) {
      return { width: 400, height: 400, minX: 0, minY: 0 };
    }

    const width = (maxX - minX + 2) * (tileSize.width / 2) + 60;
    const height = (maxY - minY + 2) * (tileSize.height / 2) + 80;

    return { width, height, minX, minY, maxLayer };
  }, [board]);

  const activeTiles = board.filter(t => !t.isMatched);

  if (activeTiles.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[300px]">
        <div className="text-center p-8 bg-white/80 backdrop-blur rounded-2xl shadow-xl border border-vita-sage">
          <span className="text-5xl">🎉</span>
          <h3 className="text-2xl font-bold text-vita-wood mt-3">Board Cleared!</h3>
          <p className="text-sm text-vita-textMuted mt-1">Magnificent Mahjong mastery.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 w-full h-full flex items-center justify-center p-2 overflow-hidden touch-none select-none">
      <div 
        className="relative transition-transform duration-300 ease-out origin-center"
        style={{
          width: `${bounds.width}px`,
          height: `${bounds.height}px`,
          transform: `scale(${scale})`,
        }}
      >
        {board.map((tile) => (
          <MahjongTile
            key={tile.id}
            tile={tile}
            onTileClick={onTileClick}
            tileSize={tileSize}
          />
        ))}
      </div>
    </div>
  );
};
