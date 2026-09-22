import React, { useState } from 'react';
import { Star, Lock, Play, ChevronLeft, ChevronRight, Trophy, ArrowLeft } from 'lucide-react';
import { LevelProgress } from '../../types/mahjong';
import { getLevelLayout } from '../../utils/layouts';

interface CampaignLevelSelectProps {
  progress: Record<number, LevelProgress>;
  currentSelectedLevel: number;
  onSelectLevel: (levelId: number) => void;
  onBackToMenu: () => void;
}

export const CampaignLevelSelect: React.FC<CampaignLevelSelectProps> = ({
  progress,
  currentSelectedLevel,
  onSelectLevel,
  onBackToMenu
}) => {
  const [page, setPage] = useState(Math.floor((currentSelectedLevel - 1) / 25));
  const [jumpInput, setJumpInput] = useState('');

  const LEVELS_PER_PAGE = 25;
  const TOTAL_LEVELS = 500;
  const totalPages = Math.ceil(TOTAL_LEVELS / LEVELS_PER_PAGE);

  const startLevel = page * LEVELS_PER_PAGE + 1;
  const endLevel = Math.min(TOTAL_LEVELS, startLevel + LEVELS_PER_PAGE - 1);

  const levelList = Array.from({ length: endLevel - startLevel + 1 }, (_, i) => startLevel + i);

  // Total stars earned
  const totalStarsEarned = Object.values(progress).reduce((acc, curr) => acc + (curr.stars || 0), 0);
  const completedCount = Object.values(progress).filter(p => p.completed).length;

  const handleJump = (e: React.FormEvent) => {
    e.preventDefault();
    const target = parseInt(jumpInput, 10);
    if (!isNaN(target) && target >= 1 && target <= TOTAL_LEVELS) {
      setPage(Math.floor((target - 1) / LEVELS_PER_PAGE));
      setJumpInput('');
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6 flex flex-col min-h-[90vh]">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <button
          onClick={onBackToMenu}
          className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white hover:bg-vita-sage border border-[#E8E1D5] text-vita-wood font-bold text-sm shadow-sm transition-all active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Menu</span>
        </button>

        <div className="text-center">
          <h1 className="text-2xl sm:text-3xl font-black text-vita-wood tracking-tight">Campaign Map</h1>
          <p className="text-xs text-vita-textMuted mt-0.5">500 Solvable Master Layouts</p>
        </div>

        {/* Stats Badge */}
        <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 px-3.5 py-1.5 rounded-2xl shadow-xs">
          <div className="flex items-center gap-1 text-amber-600 font-bold text-sm">
            <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
            <span>{totalStarsEarned}</span>
          </div>
          <span className="text-gray-300">|</span>
          <div className="flex items-center gap-1 text-emerald-800 font-bold text-xs">
            <Trophy className="w-3.5 h-3.5 text-emerald-600" />
            <span>{completedCount}/500</span>
          </div>
        </div>
      </div>

      {/* Pagination & Jump Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-[#E8E1D5] shadow-sm mb-6">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0}
            className="p-2 rounded-xl bg-vita-sage/40 hover:bg-vita-sage text-vita-wood disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-xs font-bold text-vita-wood px-2">
            Page {page + 1} of {totalPages} (Levels {startLevel}-{endLevel})
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
            disabled={page === totalPages - 1}
            className="p-2 rounded-xl bg-vita-sage/40 hover:bg-vita-sage text-vita-wood disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Jump Form */}
        <form onSubmit={handleJump} className="flex items-center gap-1.5">
          <input
            type="number"
            min="1"
            max="500"
            placeholder="Go to level..."
            value={jumpInput}
            onChange={(e) => setJumpInput(e.target.value)}
            className="w-28 px-3 py-1.5 text-xs rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
          />
          <button
            type="submit"
            className="px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs"
          >
            Go
          </button>
        </form>
      </div>

      {/* 5x5 Level Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-3.5 mb-8">
        {levelList.map((lvl) => {
          const info = progress[lvl] || { unlocked: lvl === 1, completed: false, stars: 0, bestTime: 0 };
          const layout = getLevelLayout(lvl);
          const isUnlocked = info.unlocked || lvl === 1;

          return (
            <button
              key={lvl}
              disabled={!isUnlocked}
              onClick={() => onSelectLevel(lvl)}
              className={`
                relative flex flex-col items-center justify-between p-3.5 rounded-2xl border transition-all duration-200 select-none
                ${isUnlocked 
                  ? 'bg-gradient-to-b from-white to-[#FBF9F5] hover:to-amber-50/60 border-[#E5DEC9] hover:border-amber-400 hover:shadow-md active:scale-95 cursor-pointer' 
                  : 'bg-gray-100/80 border-gray-200 opacity-60 cursor-not-allowed'}
              `}
            >
              {/* Level Number */}
              <div className="w-full flex items-center justify-between">
                <span className={`text-base font-black ${isUnlocked ? 'text-vita-wood' : 'text-gray-400'}`}>
                  {lvl}
                </span>
                {!isUnlocked && <Lock className="w-4 h-4 text-gray-400" />}
                {info.completed && (
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/80 px-1.5 py-0.5 rounded-md">
                    ✓ Done
                  </span>
                )}
              </div>

              {/* Layout Archetype preview icon */}
              <div className="my-2 flex flex-col items-center">
                <span className="text-2xl filter drop-shadow-xs">
                  {layout.category === 'Classic' ? '🐢' :
                   layout.category === 'Geometric' ? '🔺' :
                   layout.category === 'Animals' ? '🦋' :
                   layout.category === 'Structures' ? '🏰' : '🌸'}
                </span>
                <span className="text-[10px] font-semibold text-gray-500 mt-1 truncate max-w-[80px]">
                  {layout.tileCount} Tiles
                </span>
              </div>

              {/* Stars Rating */}
              <div className="flex items-center gap-1 mt-1">
                {[1, 2, 3].map((starIdx) => (
                  <Star
                    key={starIdx}
                    className={`w-3.5 h-3.5 ${
                      starIdx <= info.stars
                        ? 'fill-amber-400 text-amber-500'
                        : 'text-gray-300 fill-transparent'
                    }`}
                  />
                ))}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
