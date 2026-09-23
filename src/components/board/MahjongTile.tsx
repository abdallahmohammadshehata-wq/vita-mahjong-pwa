import React from 'react';
import { BoardTile } from '../../types/mahjong';
import { soundFx } from '../../utils/audio';
import { TileGlyph } from './TileGlyph';

interface MahjongTileProps {
  tile: BoardTile;
  onTileClick: (tile: BoardTile) => void;
  scale?: number;
  tileSize?: { width: number; height: number };
  isDarkMode?: boolean;
  minX?: number;
  minY?: number;
  paddingLeft?: number;
  paddingTop?: number;
  dimBlocked?: boolean;
}

export const MahjongTile: React.FC<MahjongTileProps> = ({
  tile,
  onTileClick,
  scale = 1,
  tileSize = { width: 56, height: 72 },
  isDarkMode = false,
  minX = 0,
  minY = 0,
  paddingLeft = 32,
  paddingTop = 32,
  dimBlocked = true
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
  // Each higher layer is stepped slightly up and left to produce natural physical depth
  const layerOffsetX = layer * 4;
  const layerOffsetY = layer * 5;

  const posX = paddingLeft + ((x - minX) * (tileSize.width / 2)) - layerOffsetX;
  const posY = paddingTop + ((y - minY) * (tileSize.height / 2)) - layerOffsetY;
  
  // Strict z-index hierarchy:
  // Higher layers always sit on top of lower layers
  // Tiles lower on screen (larger Y) overlap tiles behind them
  const zIndex = (layer * 200) + Math.floor(y * 8) + Math.floor(x * 2);

  const layerShadowClass = 
    layer >= 3 ? 'tile-elev-3' :
    layer === 2 ? 'tile-elev-2' :
    layer === 1 ? 'tile-elev-1' : 'tile-elev-0';

  return (
    <div
      onClick={handleClick}
      style={{
        position: 'absolute',
        left: `${posX}px`,
        top: `${posY}px`,
        width: `${tileSize.width}px`,
        height: `${tileSize.height}px`,
        zIndex: isSelected ? zIndex + 1000 : isHinted ? zIndex + 500 : zIndex,
        transform: `scale(${scale}) ${isSelected ? 'translateY(-12px) translateZ(30px)' : ''}`,
        transition: 'transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.2s ease, filter 0.2s ease'
      }}
      className={`
        cursor-pointer rounded-xl select-none group ${layerShadowClass}
        ${dimBlocked && !isFree ? 'tile-blocked-dimmed' : ''}
        ${dimBlocked && isFree && !isSelected ? 'tile-free-glow' : ''}
        ${isSelected ? 'ring-4 ring-amber-400 shadow-tile-selected animate-bounce-short z-50' : ''}
        ${isHinted && !isSelected ? 'ring-4 ring-emerald-500 shadow-tile-hint animate-pulse' : ''}
        ${specialType === 'gold' ? 'animate-gold-glow' : ''}
      `}
      title={`${definition.nameEn} (${definition.label}) - Layer ${layer + 1} - ${isFree ? 'Free to match' : 'Blocked'}`}
    >
      {/* 3D Tile Thickness Side/Base (Green Bamboo / Jade backing) */}
      <div 
        className={`
          absolute inset-0 rounded-xl translate-x-[3.5px] translate-y-[5px] pointer-events-none border
          ${isDarkMode
            ? specialType === 'gold' 
              ? 'bg-gradient-to-br from-amber-700 to-yellow-950 border-amber-600/50' 
              : 'bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-950 border-emerald-900/60'
            : specialType === 'gold' 
              ? 'bg-gradient-to-br from-amber-600 via-amber-700 to-yellow-900 border-amber-500' 
              : 'bg-gradient-to-br from-[#1b6b3e] via-[#14532d] to-[#0a311b] border-[#166534]'
          }
        `}
      />

      {/* Front Face of Mahjong Tile (Porcelain Ivory with beveled highlight) */}
      <div 
        className={`
          relative w-full h-full rounded-xl flex flex-col items-center justify-between p-1.5 transition-colors
          ${isDarkMode 
            ? specialType === 'gold'
              ? 'bg-gradient-to-b from-amber-950 via-yellow-900 to-amber-900 border border-amber-400 text-amber-100 shadow-inner'
              : 'tile-ivory-face-dark text-slate-100'
            : specialType === 'gold'
              ? 'bg-gradient-to-b from-amber-50 via-amber-100 to-yellow-100 border border-amber-400 text-amber-950 shadow-inner'
              : 'tile-ivory-face text-vita-charcoal'
          }
          ${!isFree ? '' : 'hover:brightness-105 active:scale-98'}
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
            <span className="text-[9px] font-mono font-bold opacity-40">
              L{layer + 1}
            </span>
          )}
        </div>

        {/* Center Main Symbol */}
        <div className="flex-1 flex items-center justify-center my-[-2px]">
          <TileGlyph definition={definition} charColor={colors.charColor} />
        </div>

        {/* Bottom Accent Bar */}
        <div className="w-full flex justify-center pb-0.5">
          <div 
            className="h-[3px] w-7 rounded-full shadow-xs opacity-80"
            style={{ backgroundColor: colors.charColor }}
          />
        </div>

        {/* Blocked Indicator dot when dimming is active */}
        {dimBlocked && !isFree && (
          <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-slate-900/40 ring-1 ring-white/30 pointer-events-none" />
        )}
      </div>
    </div>
  );
};
