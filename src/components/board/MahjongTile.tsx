import React from 'react';
import { BoardTile } from '../../types/mahjong';
import { soundFx } from '../../utils/audio';

interface MahjongTileProps {
  tile: BoardTile;
  onTileClick: (tile: BoardTile) => void;
  scale?: number;
  tileSize?: { width: number; height: number };
}

export const MahjongTile: React.FC<MahjongTileProps> = ({
  tile,
  onTileClick,
  scale = 1,
  tileSize = { width: 52, height: 68 }
}) => {
  const { definition, x, y, layer, isFree, isSelected, isHinted, isMatched } = tile;

  if (isMatched) return null;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isFree) {
      soundFx.playBlockedTap();
      return;
    }
    soundFx.playTileClick();
    onTileClick(tile);
  };

  // Suit Color Schemes for High-Contrast Senior-Friendly Legibility
  const getSuitStyles = () => {
    switch (definition.suit) {
      case 'character': // Red & Black
        return {
          charColor: '#B91C1C', // Deep Crimson
          subColor: '#1F2937',
          iconColor: '#B91C1C'
        };
      case 'bamboo': // Emerald Green
        return {
          charColor: '#15803D',
          subColor: '#166534',
          iconColor: '#15803D'
        };
      case 'circle': // Sapphire Blue
        return {
          charColor: '#1D4ED8',
          subColor: '#1E40AF',
          iconColor: '#1D4ED8'
        };
      case 'dragon':
        if (definition.value === 1) return { charColor: '#DC2626', subColor: '#991B1B', iconColor: '#DC2626' }; // 中 Red
        if (definition.value === 2) return { charColor: '#16A34A', subColor: '#15803D', iconColor: '#16A34A' }; // 發 Green
        return { charColor: '#2563EB', subColor: '#1D4ED8', iconColor: '#2563EB' }; // 白 White
      case 'wind': // Deep Navy
        return {
          charColor: '#0F172A',
          subColor: '#334155',
          iconColor: '#0F172A'
        };
      case 'season': // Gold / Amber
        return {
          charColor: '#B45309',
          subColor: '#D97706',
          iconColor: '#B45309'
        };
      case 'flower': // Magenta / Violet
        return {
          charColor: '#BE185D',
          subColor: '#9D174D',
          iconColor: '#BE185D'
        };
      default:
        return { charColor: '#1F2937', subColor: '#4B5563', iconColor: '#1F2937' };
    }
  };

  const colors = getSuitStyles();

  // 3D Stacking Offset: each layer elevates up and left slightly
  const layerOffsetX = layer * 4;
  const layerOffsetY = layer * 4;

  const posX = (x * (tileSize.width / 2)) - layerOffsetX;
  const posY = (y * (tileSize.height / 2)) - layerOffsetY;
  const zIndex = layer * 20 + Math.floor(y * 2) + Math.floor(x);

  return (
    <div
      onClick={handleClick}
      style={{
        position: 'absolute',
        left: `${posX}px`,
        top: `${posY}px`,
        width: `${tileSize.width}px`,
        height: `${tileSize.height}px`,
        zIndex: isSelected ? zIndex + 200 : isHinted ? zIndex + 150 : zIndex,
        transform: `scale(${scale}) ${isSelected ? 'translateY(-6px)' : ''}`,
        transition: 'transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.15s ease'
      }}
      className={`
        cursor-pointer rounded-lg select-none group
        ${isSelected ? 'ring-4 ring-vita-gold shadow-tile-selected animate-bounce-short' : ''}
        ${isHinted && !isSelected ? 'ring-4 ring-emerald-500 shadow-tile-hint animate-pulse' : ''}
      `}
      title={`${definition.nameEn} (${definition.label}) - ${isFree ? 'Free to match' : 'Blocked'}`}
    >
      {/* 3D Tile Side/Base (Jade/Wood Backing) */}
      <div 
        className="absolute inset-0 rounded-lg bg-gradient-to-br from-emerald-800 to-teal-950 translate-x-[3px] translate-y-[5px] shadow-md pointer-events-none"
      />

      {/* Front Ivory/Cream Face */}
      <div 
        className={`
          relative w-full h-full rounded-lg border border-[#D5C9B8] 
          bg-gradient-to-b from-[#FFFFFF] via-[#FAF6F0] to-[#EFE7D8]
          flex flex-col items-center justify-between p-1 shadow-inner
          ${!isFree ? 'brightness-[0.88] saturate-[0.85]' : 'hover:brightness-105'}
        `}
      >
        {/* Top-Left Tiny Label */}
        <div className="w-full flex justify-between items-center px-1">
          <span 
            className="text-[10px] font-bold tracking-tighter opacity-80"
            style={{ color: colors.charColor }}
          >
            {definition.suit === 'character' || definition.suit === 'bamboo' || definition.suit === 'circle' 
              ? definition.value 
              : ''}
          </span>
          <span className="text-[9px] opacity-40 font-mono">
            {definition.suit[0].toUpperCase()}
          </span>
        </div>

        {/* Main High-Contrast Symbol / Character */}
        <div className="flex-1 flex items-center justify-center my-[-2px]">
          {definition.suit === 'character' && (
            <div className="flex flex-col items-center leading-none">
              <span 
                className="text-[22px] font-chinese font-black tracking-tight"
                style={{ color: colors.charColor }}
              >
                {definition.symbol}
              </span>
              <span className="text-[12px] font-chinese font-bold text-red-700">
                萬
              </span>
            </div>
          )}

          {definition.suit === 'bamboo' && (
            <div className="flex flex-col items-center leading-none">
              <span 
                className="text-[22px] font-black tracking-tight"
                style={{ color: colors.charColor }}
              >
                {definition.value === 1 ? '🦚' : `${definition.value}🎋`}
              </span>
            </div>
          )}

          {definition.suit === 'circle' && (
            <div className="flex flex-col items-center leading-none">
              <span 
                className="text-[20px] font-black tracking-tight"
                style={{ color: colors.charColor }}
              >
                {definition.value === 1 ? '🎯' : `${definition.value}⚪`}
              </span>
            </div>
          )}

          {(definition.suit === 'wind' || definition.suit === 'dragon' || definition.suit === 'season' || definition.suit === 'flower') && (
            <div className="flex flex-col items-center justify-center">
              <span 
                className="text-[26px] font-chinese font-black leading-none"
                style={{ color: colors.charColor }}
              >
                {definition.symbol}
              </span>
              <span className="text-[9px] font-bold text-gray-600 mt-0.5 tracking-tight truncate max-w-[44px]">
                {definition.label}
              </span>
            </div>
          )}
        </div>

        {/* Bottom indicator for senior-friendly clarity */}
        <div className="w-full flex justify-center pb-0.5">
          <div 
            className="h-[2.5px] w-6 rounded-full opacity-60"
            style={{ backgroundColor: colors.charColor }}
          />
        </div>

        {/* Lock Overlay when Blocked */}
        {!isFree && (
          <div className="absolute inset-0 rounded-lg bg-black/10 pointer-events-none flex items-start justify-end p-1">
            <div className="w-2 h-2 rounded-full bg-black/20" />
          </div>
        )}
      </div>
    </div>
  );
};
