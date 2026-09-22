import React from 'react';
import { BoardTile } from '../../types/mahjong';
import { soundFx } from '../../utils/audio';

interface MahjongTileProps {
  tile: BoardTile;
  onTileClick: (tile: BoardTile) => void;
  scale?: number;
  tileSize?: { width: number; height: number };
  isDarkMode?: boolean;
}

export const MahjongTile: React.FC<MahjongTileProps> = ({
  tile,
  onTileClick,
  scale = 1,
  tileSize = { width: 54, height: 72 },
  isDarkMode = false
}) => {
  const { definition, x, y, layer, isFree, isSelected, isHinted, isMatched, isStored, specialType } = tile;

  // Stored or Matched tiles are not drawn on the main board surface
  if (isMatched || isStored) return null;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isFree) {
      soundFx.playBlockedTap();
      return;
    }
    soundFx.playTileClick();
    onTileClick(tile);
  };

  // High-Contrast Senior-Friendly Color Schemes
  const getSuitStyles = () => {
    if (isDarkMode) {
      switch (definition.suit) {
        case 'character': return { charColor: '#F87171', subColor: '#FCA5A5', iconColor: '#EF4444' };
        case 'bamboo': return { charColor: '#4ADE80', subColor: '#86EFAC', iconColor: '#22C55E' };
        case 'circle': return { charColor: '#60A5FA', subColor: '#93C5FD', iconColor: '#3B82F6' };
        case 'dragon':
          if (definition.value === 1) return { charColor: '#EF4444', subColor: '#F87171', iconColor: '#EF4444' };
          if (definition.value === 2) return { charColor: '#22C55E', subColor: '#4ADE80', iconColor: '#22C55E' };
          return { charColor: '#38BDF8', subColor: '#7DD3FC', iconColor: '#38BDF8' };
        case 'wind': return { charColor: '#E2E8F0', subColor: '#94A3B8', iconColor: '#E2E8F0' };
        case 'season': return { charColor: '#FBBF24', subColor: '#FDE68A', iconColor: '#F59E0B' };
        case 'flower': return { charColor: '#F472B6', subColor: '#FBCFE8', iconColor: '#EC4899' };
        default: return { charColor: '#F3F4F6', subColor: '#9CA3AF', iconColor: '#F3F4F6' };
      }
    }

    switch (definition.suit) {
      case 'character': return { charColor: '#B91C1C', subColor: '#1F2937', iconColor: '#B91C1C' };
      case 'bamboo': return { charColor: '#15803D', subColor: '#166534', iconColor: '#15803D' };
      case 'circle': return { charColor: '#1D4ED8', subColor: '#1E40AF', iconColor: '#1D4ED8' };
      case 'dragon':
        if (definition.value === 1) return { charColor: '#DC2626', subColor: '#991B1B', iconColor: '#DC2626' };
        if (definition.value === 2) return { charColor: '#16A34A', subColor: '#15803D', iconColor: '#16A34A' };
        return { charColor: '#2563EB', subColor: '#1D4ED8', iconColor: '#2563EB' };
      case 'wind': return { charColor: '#0F172A', subColor: '#334155', iconColor: '#0F172A' };
      case 'season': return { charColor: '#B45309', subColor: '#D97706', iconColor: '#B45309' };
      case 'flower': return { charColor: '#BE185D', subColor: '#9D174D', iconColor: '#BE185D' };
      default: return { charColor: '#1F2937', subColor: '#4B5563', iconColor: '#1F2937' };
    }
  };

  const colors = getSuitStyles();

  // True 3D Layer Elevation Offset:
  // Each higher layer is stepped up and slightly left, plus elevated zIndex
  const layerOffsetX = layer * 5;
  const layerOffsetY = layer * 6;

  const posX = (x * (tileSize.width / 2)) - layerOffsetX;
  const posY = (y * (tileSize.height / 2)) - layerOffsetY;
  const zIndex = layer * 50 + Math.floor(y * 4) + Math.floor(x * 2);

  const layerShadowClass = 
    layer >= 3 ? 'tile-layer-3' :
    layer === 2 ? 'tile-layer-2' :
    layer === 1 ? 'tile-layer-1' : 'tile-layer-0';

  return (
    <div
      onClick={handleClick}
      style={{
        position: 'absolute',
        left: `${posX}px`,
        top: `${posY}px`,
        width: `${tileSize.width}px`,
        height: `${tileSize.height}px`,
        zIndex: isSelected ? zIndex + 300 : isHinted ? zIndex + 200 : zIndex,
        transform: `scale(${scale}) ${isSelected ? 'translateY(-10px) translateZ(20px)' : ''}`,
        transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.2s ease'
      }}
      className={`
        cursor-pointer rounded-xl select-none group ${layerShadowClass}
        ${isSelected ? 'ring-4 ring-amber-400 shadow-tile-selected animate-bounce-short z-50' : ''}
        ${isHinted && !isSelected ? 'ring-4 ring-emerald-500 shadow-tile-hint animate-pulse' : ''}
        ${specialType === 'gold' ? 'animate-gold-glow' : ''}
      `}
      title={`${definition.nameEn} (${definition.label}) - Layer ${layer + 1} - ${isFree ? 'Free to match' : 'Blocked'}`}
    >
      {/* 3D Tile Thickness Side/Base (Green Jade or Dark Obsidian back) */}
      <div 
        className={`
          absolute inset-0 rounded-xl translate-x-[4px] translate-y-[6px] shadow-lg pointer-events-none border
          ${isDarkMode
            ? specialType === 'gold' 
              ? 'bg-gradient-to-br from-amber-700 to-yellow-950 border-amber-500/50' 
              : 'bg-gradient-to-br from-emerald-900 to-slate-950 border-emerald-800/40'
            : specialType === 'gold' 
              ? 'bg-gradient-to-br from-amber-600 via-amber-700 to-yellow-900 border-amber-400' 
              : 'bg-gradient-to-br from-emerald-800 via-emerald-900 to-teal-950 border-emerald-700'
          }
        `}
      />

      {/* Front Face of Mahjong Tile */}
      <div 
        className={`
          relative w-full h-full rounded-xl border flex flex-col items-center justify-between p-1.5 shadow-inner transition-colors
          ${isDarkMode 
            ? specialType === 'gold'
              ? 'bg-gradient-to-b from-amber-950 via-yellow-900 to-amber-900 border-amber-400 text-amber-100'
              : 'bg-gradient-to-b from-slate-800 via-slate-900 to-slate-950 border-slate-700 text-slate-100'
            : specialType === 'gold'
              ? 'bg-gradient-to-b from-amber-50 via-amber-100 to-yellow-100 border-amber-400 text-amber-950'
              : 'bg-gradient-to-b from-white via-[#FAF7F2] to-[#ECE5D8] border-[#D5C9B8] text-vita-charcoal'
          }
          ${!isFree ? 'brightness-[0.82] opacity-90' : 'hover:brightness-105'}
        `}
      >
        {/* Top Header Row */}
        <div className="w-full flex justify-between items-center px-0.5 leading-none">
          <span 
            className="text-[11px] font-black tracking-tighter"
            style={{ color: colors.charColor }}
          >
            {definition.suit === 'character' || definition.suit === 'bamboo' || definition.suit === 'circle' 
              ? definition.value 
              : ''}
          </span>

          {specialType === 'gold' ? (
            <span className="text-[8px] font-black bg-amber-400 text-amber-950 px-1 rounded-md shadow-xs">
              2X
            </span>
          ) : (
            <span className="text-[9px] font-mono opacity-50">
              L{layer + 1}
            </span>
          )}
        </div>

        {/* Center Main Symbol */}
        <div className="flex-1 flex items-center justify-center my-[-2px]">
          {definition.suit === 'character' && (
            <div className="flex flex-col items-center leading-none">
              <span 
                className="text-[24px] font-chinese font-black tracking-tight drop-shadow-xs"
                style={{ color: colors.charColor }}
              >
                {definition.symbol}
              </span>
              <span className="text-[12px] font-chinese font-bold text-red-600">
                萬
              </span>
            </div>
          )}

          {definition.suit === 'bamboo' && (
            <div className="flex flex-col items-center leading-none">
              <span 
                className="text-[22px] font-black tracking-tight drop-shadow-xs"
                style={{ color: colors.charColor }}
              >
                {definition.value === 1 ? '🦚' : `${definition.value}🎋`}
              </span>
            </div>
          )}

          {definition.suit === 'circle' && (
            <div className="flex flex-col items-center leading-none">
              <span 
                className="text-[20px] font-black tracking-tight drop-shadow-xs"
                style={{ color: colors.charColor }}
              >
                {definition.value === 1 ? '🎯' : `${definition.value}⚪`}
              </span>
            </div>
          )}

          {(definition.suit === 'wind' || definition.suit === 'dragon' || definition.suit === 'season' || definition.suit === 'flower') && (
            <div className="flex flex-col items-center justify-center">
              <span 
                className="text-[26px] font-chinese font-black leading-none drop-shadow-xs"
                style={{ color: colors.charColor }}
              >
                {definition.symbol}
              </span>
              <span className="text-[9px] font-bold mt-0.5 tracking-tight truncate max-w-[46px] opacity-80">
                {definition.label}
              </span>
            </div>
          )}
        </div>

        {/* Bottom Accent Bar */}
        <div className="w-full flex justify-center pb-0.5">
          <div 
            className="h-[3px] w-7 rounded-full shadow-xs opacity-75"
            style={{ backgroundColor: colors.charColor }}
          />
        </div>

        {/* Subtle Blocked Indicator */}
        {!isFree && (
          <div className="absolute inset-0 rounded-xl bg-black/15 pointer-events-none flex items-start justify-end p-1">
            <div className="w-2 h-2 rounded-full bg-black/30 ring-1 ring-white/30" />
          </div>
        )}
      </div>
    </div>
  );
};
