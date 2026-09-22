import React from 'react';
import { Sparkles, Clock, Flame, Pause, Volume2, VolumeX, ArrowLeft } from 'lucide-react';
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
  onToggleSound: () => void;
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
  onToggleSound,
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
    <header className="w-full bg-white/90 backdrop-blur-md border-b border-[#E8E1D5] px-4 py-2.5 shadow-sm sticky top-0 z-30 select-none">
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-2">
        {/* Left: Back & Level title */}
        <div className="flex items-center gap-2">
          <button
            onClick={onBackClick}
            className="p-2 rounded-xl bg-vita-sage/50 hover:bg-vita-sage text-vita-wood transition-colors active:scale-95"
            title="Return to Menu"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              {mode === 'SOLO_CAMPAIGN' ? `Level ${levelId}` : mode === 'CLASH_SHARED' ? 'Clash Mode' : 'Speed Sprint'}
            </span>
            <div className="text-xs font-semibold text-vita-woodDark flex items-center gap-1.5 mt-0.5">
              <span>{pairsRemaining} pairs left</span>
              <span className="text-gray-300">•</span>
              <span className="text-emerald-600 font-bold">{progressPercent}%</span>
            </div>
          </div>
        </div>

        {/* Center: Timer & Combo */}
        <div className="flex items-center gap-3">
          {/* Timer */}
          <div className="flex items-center gap-1.5 bg-amber-50/80 border border-amber-200/80 px-3 py-1 rounded-xl text-amber-900 font-bold text-sm shadow-inner">
            <Clock className="w-4 h-4 text-amber-600 animate-spin-slow" />
            <span className="font-mono text-base">{formatTime(timeSeconds)}</span>
          </div>

          {/* Combo Multiplier */}
          {combo > 1 && (
            <div className="flex items-center gap-1 bg-gradient-to-r from-orange-500 to-red-500 text-white px-2.5 py-1 rounded-xl font-bold text-xs shadow-md animate-bounce-short">
              <Flame className="w-3.5 h-3.5 fill-current" />
              <span>{combo}x Combo</span>
            </div>
          )}
        </div>

        {/* Right: Score & Actions */}
        <div className="flex items-center gap-2">
          {/* Score Badge */}
          <div className="bg-gradient-to-r from-vita-wood to-vita-woodDark text-white px-3.5 py-1 rounded-xl shadow text-right">
            <div className="text-[9px] uppercase tracking-wider text-amber-300 font-medium">Score</div>
            <div className="text-base font-black leading-tight tracking-tight text-amber-100">{score.toLocaleString()}</div>
          </div>

          {/* Sound Toggle */}
          <button
            onClick={onToggleSound}
            className="p-2 rounded-xl bg-vita-sage/50 hover:bg-vita-sage text-vita-wood transition-colors active:scale-95"
            title={soundEnabled ? 'Mute Sound' : 'Enable Sound'}
          >
            {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5 text-gray-400" />}
          </button>

          {/* Pause Button */}
          <button
            onClick={onPauseClick}
            className="p-2 rounded-xl bg-vita-sage/50 hover:bg-vita-sage text-vita-wood transition-colors active:scale-95"
            title="Pause & Settings"
          >
            <Pause className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Mini Progress Line */}
      <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden mt-2 max-w-5xl mx-auto">
        <div 
          className="bg-gradient-to-r from-emerald-500 via-teal-500 to-amber-500 h-full transition-all duration-300 rounded-full"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </header>
  );
};
