import React from 'react';
import { BoardTile } from '../../types/mahjong';
import { ArrowDownToLine, Undo2, AlertCircle } from 'lucide-react';
import { soundFx } from '../../utils/audio';

interface StorageDockProps {
  storedTiles: BoardTile[];
  maxCapacity?: number;
  selectedTileId: string | null;
  isDarkMode?: boolean;
  onTileClick: (tile: BoardTile) => void;
  onStoreSelectedTile: () => void;
  onRecallTile: (tile: BoardTile) => void;
  canStore: boolean;
}

export const StorageDock: React.FC<StorageDockProps> = ({
  storedTiles,
  maxCapacity = 4,
  selectedTileId,
  isDarkMode = false,
  onTileClick,
  onStoreSelectedTile,
  onRecallTile,
  canStore
}) => {
  // 4 slot array
  const slots: (BoardTile | null)[] = [null, null, null, null];
  storedTiles.forEach((tile, index) => {
    if (index < maxCapacity) {
      slots[index] = tile;
    }
  });

  const isFull = storedTiles.length >= maxCapacity;

  return (
    <div className="w-full max-w-xl mx-auto px-3 py-1.5 select-none">
      {/* Storage Header & Status Banner */}
      <div className="flex items-center justify-between mb-1 px-1">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-emerald-700/20 text-emerald-800 dark:text-emerald-300 text-sm font-black">
            📥
          </div>
          <span className="text-xs sm:text-sm font-black tracking-tight opacity-90">
            Holding Rack (Up to 4 Cards)
          </span>
        </div>

        <div className="flex items-center gap-2">
          {canStore && (
            <button
              onClick={onStoreSelectedTile}
              className="flex items-center gap-1 text-xs font-black bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-3 py-1 rounded-xl shadow-md transition-all active:scale-95 animate-pulse"
            >
              <ArrowDownToLine className="w-3.5 h-3.5" />
              <span>Store Selected</span>
            </button>
          )}

          <span 
            className={`text-[11px] font-black px-2 py-0.5 rounded-full border ${
              isFull 
                ? 'bg-red-500/20 text-red-700 dark:text-red-300 border-red-400 animate-bounce-short' 
                : storedTiles.length > 0 
                  ? 'bg-amber-500/20 text-amber-800 dark:text-amber-300 border-amber-400'
                  : 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border-emerald-400/40'
            }`}
          >
            {storedTiles.length}/{maxCapacity} {isFull ? 'FULL' : 'SLOTS'}
          </span>
        </div>
      </div>

      {/* 4 Card Slot Containers */}
      <div className={`grid grid-cols-4 gap-2.5 p-2.5 rounded-2xl border-2 shadow-inner transition-colors ${
        isDarkMode 
          ? 'bg-slate-900/90 border-slate-800 shadow-slate-950/50' 
          : 'bg-gradient-to-b from-[#EFE8DC] to-[#E3D8C6] border-[#D8CABA]'
      }`}>
        {slots.map((tile, slotIndex) => {
          if (!tile) {
            // Empty Slot
            return (
              <div
                key={`empty-slot-${slotIndex}`}
                onClick={() => {
                  if (canStore) {
                    onStoreSelectedTile();
                  } else {
                    soundFx.playTileClick();
                  }
                }}
                className={`
                  h-20 sm:h-24 rounded-xl border-2 border-dashed flex flex-col items-center justify-center transition-all cursor-pointer select-none
                  ${canStore 
                    ? 'border-amber-400 bg-amber-400/15 hover:bg-amber-400/25 shadow-md ring-2 ring-amber-400' 
                    : isDarkMode 
                      ? 'border-slate-800 bg-slate-950/40 hover:bg-slate-950/60'
                      : 'border-vita-wood/30 bg-white/30 hover:bg-white/50'
                  }
                `}
                title={canStore ? 'Click to park selected tile in this slot' : `Storage Slot ${slotIndex + 1}`}
              >
                <span className="text-xl opacity-30">
                  {canStore ? '📥' : '🀄'}
                </span>
                <span className="text-[10px] font-bold opacity-50 mt-0.5">
                  Slot {slotIndex + 1}
                </span>
                {canStore && (
                  <span className="text-[9px] font-black text-amber-500 dark:text-amber-300 mt-0.5">
                    Tap to Store
                  </span>
                )}
              </div>
            );
          }

          // Occupied Tile Slot
          const isSelected = tile.id === selectedTileId;
          const isHinted = tile.isHinted;

          return (
            <div
              key={tile.id}
              onClick={(e) => {
                e.stopPropagation();
                onTileClick(tile);
              }}
              className={`
                relative h-20 sm:h-24 rounded-xl cursor-pointer select-none transition-all flex flex-col items-center justify-between p-1.5 shadow-tile group border
                ${isDarkMode 
                  ? 'bg-gradient-to-b from-slate-800 to-slate-950 border-slate-700 text-slate-100' 
                  : 'bg-gradient-to-b from-white via-[#FAF6F0] to-[#EFE7D8] border-[#D5C9B8] text-vita-charcoal'
                }
                ${isSelected ? 'ring-4 ring-amber-400 shadow-tile-selected scale-105 z-10' : 'hover:scale-102'}
                ${isHinted && !isSelected ? 'ring-4 ring-emerald-500 animate-pulse' : ''}
              `}
            >
              {/* Special Gold Badge */}
              {tile.specialType === 'gold' && (
                <div className="absolute -top-1.5 -right-1.5 bg-amber-400 text-amber-950 text-[9px] font-black px-1.5 py-0.2 rounded-full border border-white shadow">
                  2X
                </div>
              )}

              {/* Slot Indicator Top */}
              <div className="w-full flex justify-between items-center px-1">
                <span className="text-[10px] font-black text-red-500">
                  {tile.definition.suit === 'character' || tile.definition.suit === 'bamboo' || tile.definition.suit === 'circle' 
                    ? tile.definition.value 
                    : ''}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRecallTile(tile);
                  }}
                  className="opacity-60 hover:opacity-100 hover:text-red-500 p-0.5 rounded transition-colors"
                  title="Return to board"
                >
                  <Undo2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Main Symbol */}
              <div className="flex-1 flex flex-col items-center justify-center my-[-2px]">
                <span className="text-2xl font-chinese font-black tracking-tight">
                  {tile.definition.symbol}
                </span>
                <span className="text-[9px] font-bold opacity-75 truncate max-w-[50px]">
                  {tile.definition.label}
                </span>
              </div>

              {/* Action Prompt */}
              <div className="w-full text-center pb-0.5">
                <span className="text-[8px] font-black text-emerald-800 dark:text-emerald-200 bg-emerald-100 dark:bg-emerald-950 px-1.5 py-0.2 rounded-full">
                  {isSelected ? 'Selected' : 'Stored'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Full Storage Warning */}
      {isFull && (
        <div className="mt-1 flex items-center justify-center gap-1.5 text-[11px] font-bold text-amber-900 dark:text-amber-200 bg-amber-100/90 dark:bg-amber-950/80 py-1 px-2.5 rounded-xl border border-amber-300 dark:border-amber-700">
          <AlertCircle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
          <span>Storage full (4/4)! Match tiles or return cards back to the board.</span>
        </div>
      )}
    </div>
  );
};
