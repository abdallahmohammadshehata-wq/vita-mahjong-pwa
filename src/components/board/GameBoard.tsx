import React, { useMemo } from 'react';
import { BoardTile } from '../../types/mahjong';
import { MahjongTile } from './MahjongTile';

interface GameBoardProps {
  board: BoardTile[];
  onTileClick: (tile: BoardTile) => void;
  scale?: number;
  is3DView?: boolean;
  isDarkMode?: boolean;
}

export const GameBoard: React.FC<GameBoardProps> = ({
  board,
  onTileClick,
  scale = 1,
  is3DView = true,
  isDarkMode = false
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
      if (tile.isMatched || tile.isStored) return;
      if (tile.x < minX) minX = tile.x;
      if (tile.x > maxX) maxX = tile.x;
      if (tile.y < minY) minY = tile.y;
      if (tile.y > maxY) maxY = tile.y;
      if (tile.layer > maxLayer) maxLayer = tile.layer;
    });

    if (minX === Infinity) {
      return { width: 400, height: 400, minX: 0, minY: 0, maxLayer: 0 };
    }

    const width = (maxX - minX + 2) * (tileSize.width / 2) + 80;
    const height = (maxY - minY + 2) * (tileSize.height / 2) + 90;

    return { width, height, minX, minY, maxLayer };
  }, [board]);

  const activeTiles = board.filter(t => !t.isMatched && !t.isStored);

  if (activeTiles.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[300px]">
        <div className={`text-center p-8 rounded-3xl shadow-2xl border ${isDarkMode ? 'bg-slate-900/90 border-slate-700 text-white' : 'bg-white/90 border-[#E8E1D5] text-vita-wood'}`}>
          <span className="text-6xl animate-bounce-short inline-block">🀄</span>
          <h3 className="text-3xl font-black mt-3">Board Cleared!</h3>
          <p className="text-sm opacity-70 mt-1">Magnificent Mahjong mastery.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 w-full h-full flex items-center justify-center p-4 overflow-hidden touch-none select-none perspective-board">
      <div 
        className={`relative transition-transform duration-300 ease-out origin-center ${is3DView ? 'board-surface-3d' : 'board-surface-2d'}`}
        style={{
          width: `${bounds.width}px`,
          height: `${bounds.height}px`,
          transform: `${is3DView ? 'rotateX(20deg) rotateZ(0deg)' : 'rotateX(0deg)'} scale(${scale})`,
        }}
      >
        {board.map((tile) => (
          <MahjongTile
            key={tile.id}
            tile={tile}
            onTileClick={onTileClick}
            tileSize={tileSize}
            isDarkMode={isDarkMode}
          />
        ))}
      </div>
    </div>
  );
};
