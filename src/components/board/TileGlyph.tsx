import React from 'react';
import { TileDefinition } from '../../types/mahjong';

interface TileGlyphProps {
  definition: TileDefinition;
  charColor: string;
}

// Crisp Vector Bamboo Stalk
const BambooStalk: React.FC<{ color?: string; className?: string; height?: number }> = ({
  color = '#15803D',
  className = '',
  height = 18
}) => (
  <svg width="6" height={height} viewBox="0 0 6 18" className={`flex-shrink-0 ${className}`}>
    <rect x="2" y="1" width="2" height="16" rx="1" fill={color} />
    {/* Nodes */}
    <circle cx="3" cy="4" r="1.5" fill="#166534" />
    <circle cx="3" cy="9" r="1.5" fill="#166534" />
    <circle cx="3" cy="14" r="1.5" fill="#166534" />
    {/* Highlight */}
    <line x1="2.5" y1="2" x2="2.5" y2="16" stroke="#4ADE80" strokeWidth="0.6" strokeLinecap="round" opacity="0.7" />
  </svg>
);

// Crisp Vector Circle Pip
const CirclePip: React.FC<{ color?: string; size?: number; innerColor?: string }> = ({
  color = '#1D4ED8',
  size = 11,
  innerColor = '#DC2626'
}) => (
  <svg width={size} height={size} viewBox="0 0 12 12" className="flex-shrink-0">
    <circle cx="6" cy="6" r="5.2" fill={color} />
    <circle cx="6" cy="6" r="3.4" fill="#FFFFFF" opacity="0.4" />
    <circle cx="6" cy="6" r="2.2" fill={innerColor} />
    <circle cx="6" cy="6" r="0.8" fill="#FFFFFF" />
  </svg>
);

// 1 Circle: Concentric Lotus Rosette Medallion
const OneCircleRosette: React.FC<{ size?: number }> = ({ size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" className="flex-shrink-0 drop-shadow-sm">
    <circle cx="16" cy="16" r="14.5" fill="#1D4ED8" stroke="#1E40AF" strokeWidth="1" />
    {/* Outer 8 Petals */}
    {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
      <circle
        key={i}
        cx={16 + 8.5 * Math.cos((angle * Math.PI) / 180)}
        cy={16 + 8.5 * Math.sin((angle * Math.PI) / 180)}
        r="3"
        fill="#15803D"
        opacity="0.9"
      />
    ))}
    {/* Inner Sun Ring */}
    <circle cx="16" cy="16" r="6.5" fill="#FFFFFF" />
    <circle cx="16" cy="16" r="4.5" fill="#DC2626" />
    <circle cx="16" cy="16" r="2" fill="#FBBF24" />
  </svg>
);

// 1 Bamboo: Elegant Vector Peacock / Jade Bird
const OneBambooPeacock: React.FC<{ size?: number }> = ({ size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" className="flex-shrink-0 drop-shadow-sm">
    {/* Tail Feathers */}
    <path
      d="M16 4 C11 4 7 10 7 17 C7 24 12 28 16 28 C20 28 25 24 25 17 C25 10 21 4 16 4 Z"
      fill="#15803D"
      stroke="#166534"
      strokeWidth="0.8"
    />
    <path d="M16 6 C13 9 10 14 10 18" stroke="#4ADE80" strokeWidth="1.2" strokeLinecap="round" fill="none" />
    <path d="M16 6 C19 9 22 14 22 18" stroke="#4ADE80" strokeWidth="1.2" strokeLinecap="round" fill="none" />
    {/* Tail Eye spots */}
    <circle cx="12" cy="12" r="1.8" fill="#DC2626" />
    <circle cx="20" cy="12" r="1.8" fill="#DC2626" />
    <circle cx="16" cy="10" r="1.8" fill="#FBBF24" />
    {/* Body */}
    <path d="M16 14 C14 14 13 18 14 22 C15 25 17 25 18 22 C19 18 18 14 16 14 Z" fill="#1D4ED8" />
    {/* Head & Crest */}
    <circle cx="16" cy="13" r="2.4" fill="#1D4ED8" />
    <path d="M17.5 13 L20 12.5 L17.5 13.8 Z" fill="#FBBF24" />
    <circle cx="16.5" cy="12.5" r="0.6" fill="#FFFFFF" />
    <line x1="16" y1="11" x2="16" y2="7.5" stroke="#FBBF24" strokeWidth="1" strokeLinecap="round" />
    <circle cx="16" cy="7" r="1.2" fill="#DC2626" />
  </svg>
);

export const TileGlyph: React.FC<TileGlyphProps> = ({ definition, charColor }) => {
  const { suit, value, symbol, label } = definition;

  // 1. CHARACTER (Wan)
  if (suit === 'character') {
    return (
      <div className="flex flex-col items-center justify-center leading-none">
        <span
          className="text-[23px] font-chinese font-black tracking-tight drop-shadow-xs"
          style={{ color: charColor }}
        >
          {symbol}
        </span>
        <span className="text-[12px] font-chinese font-bold text-red-600 mt-[-1px]">
          萬
        </span>
      </div>
    );
  }

  // 2. BAMBOO (Sou)
  if (suit === 'bamboo') {
    if (value === 1) {
      return <OneBambooPeacock size={28} />;
    }

    // Bamboo 2 to 9 layouts
    if (value === 2) {
      return (
        <div className="flex flex-col items-center gap-1.5">
          <BambooStalk color="#15803D" height={13} />
          <BambooStalk color="#1D4ED8" height={13} />
        </div>
      );
    }
    if (value === 3) {
      return (
        <div className="flex flex-col items-center gap-1">
          <BambooStalk color="#1D4ED8" height={11} />
          <div className="flex gap-2">
            <BambooStalk color="#15803D" height={11} />
            <BambooStalk color="#15803D" height={11} />
          </div>
        </div>
      );
    }
    if (value === 4) {
      return (
        <div className="grid grid-cols-2 gap-x-2 gap-y-1">
          <BambooStalk color="#15803D" height={12} />
          <BambooStalk color="#1D4ED8" height={12} />
          <BambooStalk color="#1D4ED8" height={12} />
          <BambooStalk color="#15803D" height={12} />
        </div>
      );
    }
    if (value === 5) {
      return (
        <div className="relative w-7 h-7 flex items-center justify-center">
          <div className="grid grid-cols-2 gap-x-3 gap-y-1 absolute inset-0">
            <BambooStalk color="#15803D" height={11} />
            <BambooStalk color="#1D4ED8" height={11} />
            <BambooStalk color="#1D4ED8" height={11} />
            <BambooStalk color="#15803D" height={11} />
          </div>
          <BambooStalk color="#DC2626" height={12} className="relative z-10" />
        </div>
      );
    }
    if (value === 6) {
      return (
        <div className="grid grid-cols-3 gap-x-1.5 gap-y-1">
          <BambooStalk color="#15803D" height={11} />
          <BambooStalk color="#15803D" height={11} />
          <BambooStalk color="#15803D" height={11} />
          <BambooStalk color="#1D4ED8" height={11} />
          <BambooStalk color="#1D4ED8" height={11} />
          <BambooStalk color="#1D4ED8" height={11} />
        </div>
      );
    }
    if (value === 7) {
      return (
        <div className="flex flex-col items-center gap-0.5">
          <BambooStalk color="#DC2626" height={10} />
          <div className="grid grid-cols-3 gap-x-1">
            <BambooStalk color="#15803D" height={8} />
            <BambooStalk color="#15803D" height={8} />
            <BambooStalk color="#15803D" height={8} />
          </div>
          <div className="grid grid-cols-3 gap-x-1">
            <BambooStalk color="#1D4ED8" height={8} />
            <BambooStalk color="#1D4ED8" height={8} />
            <BambooStalk color="#1D4ED8" height={8} />
          </div>
        </div>
      );
    }
    if (value === 8) {
      return (
        <div className="grid grid-cols-4 gap-x-1 gap-y-1">
          <BambooStalk color="#15803D" height={10} />
          <BambooStalk color="#15803D" height={10} />
          <BambooStalk color="#15803D" height={10} />
          <BambooStalk color="#15803D" height={10} />
          <BambooStalk color="#1D4ED8" height={10} />
          <BambooStalk color="#1D4ED8" height={10} />
          <BambooStalk color="#1D4ED8" height={10} />
          <BambooStalk color="#1D4ED8" height={10} />
        </div>
      );
    }
    // 9 Bamboo
    return (
      <div className="grid grid-cols-3 gap-x-1.5 gap-y-0.5">
        <BambooStalk color="#15803D" height={9} />
        <BambooStalk color="#1D4ED8" height={9} />
        <BambooStalk color="#DC2626" height={9} />
        <BambooStalk color="#15803D" height={9} />
        <BambooStalk color="#1D4ED8" height={9} />
        <BambooStalk color="#DC2626" height={9} />
        <BambooStalk color="#15803D" height={9} />
        <BambooStalk color="#1D4ED8" height={9} />
        <BambooStalk color="#DC2626" height={9} />
      </div>
    );
  }

  // 3. CIRCLE (Pin / Tong)
  if (suit === 'circle') {
    if (value === 1) {
      return <OneCircleRosette size={28} />;
    }
    if (value === 2) {
      return (
        <div className="flex flex-col items-center gap-1.5">
          <CirclePip color="#15803D" size={11} innerColor="#FFFFFF" />
          <CirclePip color="#1D4ED8" size={11} innerColor="#DC2626" />
        </div>
      );
    }
    if (value === 3) {
      return (
        <div className="flex items-center gap-1 transform rotate-45">
          <CirclePip color="#1D4ED8" size={9} />
          <CirclePip color="#DC2626" size={9} />
          <CirclePip color="#15803D" size={9} />
        </div>
      );
    }
    if (value === 4) {
      return (
        <div className="grid grid-cols-2 gap-1.5">
          <CirclePip color="#1D4ED8" size={9} />
          <CirclePip color="#15803D" size={9} />
          <CirclePip color="#15803D" size={9} />
          <CirclePip color="#1D4ED8" size={9} />
        </div>
      );
    }
    if (value === 5) {
      return (
        <div className="relative w-7 h-7 flex items-center justify-center">
          <div className="grid grid-cols-2 gap-2 absolute inset-0">
            <CirclePip color="#1D4ED8" size={8} />
            <CirclePip color="#15803D" size={8} />
            <CirclePip color="#15803D" size={8} />
            <CirclePip color="#1D4ED8" size={8} />
          </div>
          <CirclePip color="#DC2626" size={9} innerColor="#FBBF24" />
        </div>
      );
    }
    if (value === 6) {
      return (
        <div className="grid grid-cols-2 gap-x-2 gap-y-0.5">
          <CirclePip color="#15803D" size={8} />
          <CirclePip color="#15803D" size={8} />
          <CirclePip color="#DC2626" size={8} />
          <CirclePip color="#DC2626" size={8} />
          <CirclePip color="#DC2626" size={8} />
          <CirclePip color="#DC2626" size={8} />
        </div>
      );
    }
    if (value === 7) {
      return (
        <div className="flex flex-col items-center gap-0.5">
          <div className="flex gap-1 transform rotate-12">
            <CirclePip color="#15803D" size={7} />
            <CirclePip color="#15803D" size={7} />
            <CirclePip color="#15803D" size={7} />
          </div>
          <div className="grid grid-cols-2 gap-1 mt-0.5">
            <CirclePip color="#DC2626" size={7} />
            <CirclePip color="#DC2626" size={7} />
            <CirclePip color="#DC2626" size={7} />
            <CirclePip color="#DC2626" size={7} />
          </div>
        </div>
      );
    }
    if (value === 8) {
      return (
        <div className="grid grid-cols-2 gap-x-2 gap-y-0.5">
          <CirclePip color="#1D4ED8" size={7} />
          <CirclePip color="#1D4ED8" size={7} />
          <CirclePip color="#1D4ED8" size={7} />
          <CirclePip color="#1D4ED8" size={7} />
          <CirclePip color="#1D4ED8" size={7} />
          <CirclePip color="#1D4ED8" size={7} />
          <CirclePip color="#1D4ED8" size={7} />
          <CirclePip color="#1D4ED8" size={7} />
        </div>
      );
    }
    // 9 Circle
    return (
      <div className="grid grid-cols-3 gap-0.5">
        <CirclePip color="#15803D" size={7} />
        <CirclePip color="#1D4ED8" size={7} />
        <CirclePip color="#DC2626" size={7} />
        <CirclePip color="#15803D" size={7} />
        <CirclePip color="#1D4ED8" size={7} />
        <CirclePip color="#DC2626" size={7} />
        <CirclePip color="#15803D" size={7} />
        <CirclePip color="#1D4ED8" size={7} />
        <CirclePip color="#DC2626" size={7} />
      </div>
    );
  }

  // 4. DRAGONS, WINDS, SEASONS, FLOWERS
  return (
    <div className="flex flex-col items-center justify-center">
      <span
        className="text-[25px] font-chinese font-black leading-none drop-shadow-xs"
        style={{ color: charColor }}
      >
        {symbol}
      </span>
      <span className="text-[9px] font-bold mt-0.5 tracking-tight truncate max-w-[46px] opacity-80">
        {label}
      </span>
    </div>
  );
};
