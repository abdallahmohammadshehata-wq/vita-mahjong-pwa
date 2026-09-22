import React from 'react';
import { Sparkles, Clock, Flame, Pause, Volume2, VolumeX, ArrowLeft, Sun, Moon, Layers } from 'lucide-react';
import { GameMode } from '../../types/multiplayer';

interface GameHUDProps {
  mode: GameMode;
  levelId?: number;
  score: number;
  timeSeconds: number;
  pairsRemaining: number;
  totalPairs: number;
  combo: number;
  soundEnabled: boolean;
  isDarkMode: boolean;
  is3DView: boolean;
  onToggleSound: () => void;
  onToggleTheme: () => void;
  onToggle3DView: () => void;
  onPauseClick: () => void;
  onBackClick: () => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  mode,
  levelId = 1,
  score,
  timeSeconds,
  pairsRemaining,
  totalPairs,
  combo,
  soundEnabled,
  isDarkMode,
  is3DView,
  onToggleSound,
  onToggleTheme,
  onToggle3DView,
  onPauseClick,
  onBackClick
}) => {
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins}:${remainder.toString().padStart(2, '0')}`;
  };

  const progressPercent = Math.round(((totalPairs - pairsRemaining) / totalPairs) * 100);

  return (
    <header className={`w-full backdrop-blur-md px-3 sm:px-4 py-2 shadow-md sticky top-0 z-30 select-none border-b ${isDarkMode ? 'bg-slate-900/95 border-slate-800 text-slate-100' : 'bg-white/95 border-[#E8E1D5] text-vita-charcoal'}`}>
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-2">
        {/* Left: Back & Level title */}
        <div className="flex items-center gap-2">
          <button
            onClick={onBackClick}
            className={`p-2 rounded-xl transition-all active:scale-95 border ${isDarkMode ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700' : 'bg-vita-sage/40 hover:bg-vita-sage text-vita-wood border-[#D5C9B8]'}`}
            title="Return to Menu"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-700">
                {mode === 'SOLO_CAMPAIGN' ? `Level ${levelId}` : mode === 'CLASH_SHARED' ? 'Clash' : 'Sprint'}
              </span>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{progressPercent}%</span>
            </div>
            <div className="text-[11px] font-semibold opacity-70 mt-0.5">
              {pairsRemaining} pairs left
            </div>
          </div>
        </div>

        {/* Center: Timer & Combo */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Timer */}
          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-xl font-bold text-xs sm:text-sm shadow-inner border ${isDarkMode ? 'bg-slate-800 border-slate-700 text-amber-300' : 'bg-amber-50 border-amber-200 text-amber-900'}`}>
            <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500 animate-spin-slow" />
            <span className="font-mono text-sm sm:text-base">{formatTime(timeSeconds)}</span>
          </div>

          {/* Combo Multiplier */}
          {combo > 1 && (
            <div className="flex items-center gap-1 bg-gradient-to-r from-orange-500 to-red-500 text-white px-2.5 py-1 rounded-xl font-black text-xs shadow-md animate-bounce-short">
              <Flame className="w-3.5 h-3.5 fill-current" />
              <span>{combo}x Combo</span>
            </div>
          )}
        </div>

        {/* Right: Score, 3D Toggle, Theme Toggle & Sound */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Score Badge */}
          <div className="bg-gradient-to-r from-emerald-800 to-teal-950 text-white px-3 py-1 rounded-xl shadow text-right border border-emerald-700">
            <div className="text-[8px] uppercase tracking-wider text-amber-300 font-bold">Score</div>
            <div className="text-sm sm:text-base font-black leading-tight tracking-tight text-amber-200">{score.toLocaleString()}</div>
          </div>

          {/* 3D / 2D Perspective Switcher */}
          <button
            onClick={onToggle3DView}
            className={`p-2 rounded-xl transition-all active:scale-95 border flex items-center gap-1 text-xs font-bold ${
              is3DView
                ? 'bg-amber-500 hover:bg-amber-600 text-white border-amber-400 shadow'
                : isDarkMode ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700' : 'bg-vita-sage/40 hover:bg-vita-sage text-vita-wood border-[#D5C9B8]'
            }`}
            title={is3DView ? 'Switch to 2D Top View' : 'Switch to 3D Angled View'}
          >
            <Layers className="w-4 h-4" />
            <span className="hidden sm:inline">{is3DView ? '3D' : '2D'}</span>
          </button>

          {/* Light / Dark Mode Toggle */}
          <button
            onClick={onToggleTheme}
            className={`p-2 rounded-xl transition-all active:scale-95 border ${isDarkMode ? 'bg-amber-400 hover:bg-amber-300 text-amber-950 border-amber-300 shadow' : 'bg-slate-800 hover:bg-slate-900 text-amber-300 border-slate-700'}`}
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Sound Toggle */}
          <button
            onClick={onToggleSound}
            className={`p-2 rounded-xl transition-all active:scale-95 border ${isDarkMode ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700' : 'bg-vita-sage/40 hover:bg-vita-sage text-vita-wood border-[#D5C9B8]'}`}
            title={soundEnabled ? 'Mute Sound' : 'Enable Sound'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-gray-400" />}
          </button>
        </div>
      </div>

      {/* Mini Progress Line */}
      <div className={`w-full h-1.5 rounded-full overflow-hidden mt-1.5 max-w-5xl mx-auto ${isDarkMode ? 'bg-slate-800' : 'bg-gray-100'}`}>
        <div 
          className="bg-gradient-to-r from-emerald-500 via-teal-500 to-amber-500 h-full transition-all duration-300 rounded-full shadow-xs"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </header>
  );
};
