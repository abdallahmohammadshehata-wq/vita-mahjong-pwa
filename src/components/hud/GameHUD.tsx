import React, { useState } from 'react';
import { Sparkles, Clock, Flame, Pause, Volume2, VolumeX, ArrowLeft, Sun, Moon, Layers, Palette, Eye, EyeOff, Check } from 'lucide-react';
import { GameMode } from '../../types/multiplayer';
import { BoardBackground } from '../../types/mahjong';

interface GameHUDProps {
  mode: GameMode;
  levelId?: number;
  score: number;
  timeSeconds: number;
  pairsRemaining: number;
  totalPairs: number;
  combo: number;
  availableMatches?: number;
  soundEnabled: boolean;
  isDarkMode: boolean;
  is3DView: boolean;
  dimBlocked?: boolean;
  currentBackground?: BoardBackground;
  onToggleSound: () => void;
  onToggleTheme: () => void;
  onToggle3DView: () => void;
  onToggleDimBlocked?: () => void;
  onChangeBackground?: (bg: BoardBackground) => void;
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
  availableMatches,
  soundEnabled,
  isDarkMode,
  is3DView,
  dimBlocked = true,
  currentBackground = 'zen-felt',
  onToggleSound,
  onToggleTheme,
  onToggle3DView,
  onToggleDimBlocked,
  onChangeBackground,
  onPauseClick,
  onBackClick
}) => {
  const [showBgPicker, setShowBgPicker] = useState(false);

  const bgOptions: { id: BoardBackground; name: string; icon: string; previewClass: string }[] = [
    { id: 'zen-felt', name: 'Zen Emerald Felt', icon: '🌿', previewClass: 'bg-zen-felt' },
    { id: 'teak-wood', name: 'Imperial Teak Wood', icon: '🪵', previewClass: 'bg-teak-wood' },
    { id: 'midnight-silk', name: 'Midnight Silk', icon: '🌌', previewClass: 'bg-midnight-silk' },
    { id: 'tatami', name: 'Japanese Tatami', icon: '🎋', previewClass: 'bg-tatami' },
    { id: 'misty-mountain', name: 'Misty Ink Wash', icon: '🏔️', previewClass: 'bg-misty-mountain' }
  ];

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins}:${remainder.toString().padStart(2, '0')}`;
  };

  const progressPercent = Math.round(((totalPairs - pairsRemaining) / totalPairs) * 100);

  return (
    <header className={`w-full backdrop-blur-md px-2.5 sm:px-4 py-2 shadow-md sticky top-0 z-30 select-none border-b relative ${isDarkMode ? 'bg-slate-900/95 border-slate-800 text-slate-100' : 'bg-white/95 border-[#E8E1D5] text-vita-charcoal'}`}>
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-1.5 sm:gap-2">
        {/* Left: Back & Level title */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={onBackClick}
            className={`p-1.5 sm:p-2 rounded-xl transition-all active:scale-95 border ${isDarkMode ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700' : 'bg-vita-sage/40 hover:bg-vita-sage text-vita-wood border-[#D5C9B8]'}`}
            title="Return to Menu"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          
          <div>
            <div className="flex items-center gap-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/80 px-1.5 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-700">
                {mode === 'SOLO_CAMPAIGN' ? `Lvl ${levelId}` : mode === 'CLASH_SHARED' ? 'Clash' : 'Sprint'}
              </span>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{progressPercent}%</span>
            </div>
            <div className="text-[10px] sm:text-[11px] font-semibold opacity-70 mt-0.5 whitespace-nowrap">
              {pairsRemaining} pairs left
            </div>
          </div>
        </div>

        {/* Center: Timer & Available Matches & Combo */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {/* Timer */}
          <div className={`flex items-center gap-1 px-2.5 py-1 rounded-xl font-bold text-xs sm:text-sm shadow-inner border ${isDarkMode ? 'bg-slate-800 border-slate-700 text-amber-300' : 'bg-amber-50 border-amber-200 text-amber-900'}`}>
            <Clock className="w-3.5 h-3.5 text-amber-500 animate-spin-slow" />
            <span className="font-mono">{formatTime(timeSeconds)}</span>
          </div>

          {/* Available Playable Matches */}
          {availableMatches !== undefined && (
            <div 
              className={`hidden xs:flex items-center gap-1 px-2 py-1 rounded-xl text-xs font-black border transition-all ${
                availableMatches > 0
                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-700 dark:text-emerald-300'
                  : 'bg-red-500/20 border-red-500/50 text-red-600 dark:text-red-300 animate-pulse'
              }`}
              title={availableMatches > 0 ? `${availableMatches} free matching pairs available right now` : 'No valid moves available on current board — shuffle or use storage!'}
            >
              <span>🀄</span>
              <span>{availableMatches > 0 ? `${availableMatches} moves` : 'No moves!'}</span>
            </div>
          )}

          {/* Combo Multiplier */}
          {combo > 1 && (
            <div className="flex items-center gap-1 bg-gradient-to-r from-orange-500 to-red-500 text-white px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-xl font-black text-xs shadow-md animate-bounce-short">
              <Flame className="w-3.5 h-3.5 fill-current" />
              <span>{combo}x</span>
            </div>
          )}
        </div>

        {/* Right: Score, Background Switcher, 3D, Theme & Sound */}
        <div className="flex items-center gap-1 sm:gap-1.5">
          {/* Score Badge */}
          <div className="bg-gradient-to-r from-emerald-800 to-teal-950 text-white px-2.5 py-0.5 sm:py-1 rounded-xl shadow text-right border border-emerald-700">
            <div className="text-[7px] uppercase tracking-wider text-amber-300 font-bold leading-tight">Score</div>
            <div className="text-xs sm:text-sm font-black leading-tight tracking-tight text-amber-200">{score.toLocaleString()}</div>
          </div>

          {/* Background Theme Switcher */}
          {onChangeBackground && (
            <div className="relative">
              <button
                onClick={() => setShowBgPicker(!showBgPicker)}
                className={`p-1.5 sm:p-2 rounded-xl transition-all active:scale-95 border flex items-center gap-1 text-xs font-bold ${
                  showBgPicker
                    ? 'bg-emerald-600 text-white border-emerald-500 shadow'
                    : isDarkMode ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700' : 'bg-vita-sage/40 hover:bg-vita-sage text-vita-wood border-[#D5C9B8]'
                }`}
                title="Change Table Background"
              >
                <Palette className="w-4 h-4" />
              </button>

              {/* Background Theme Dropdown */}
              {showBgPicker && (
                <div className={`absolute right-0 top-full mt-2 w-52 rounded-2xl shadow-2xl border p-2 z-50 animate-in fade-in zoom-in-95 duration-150 ${isDarkMode ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-[#E8E1D5] text-vita-charcoal'}`}>
                  <div className="text-[10px] font-black uppercase tracking-wider px-2 py-1 opacity-60">
                    Table Background
                  </div>
                  <div className="flex flex-col gap-1 mt-1">
                    {bgOptions.map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => {
                          onChangeBackground(opt.id);
                          setShowBgPicker(false);
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all text-left ${
                          currentBackground === opt.id
                            ? 'bg-emerald-600 text-white shadow-sm'
                            : isDarkMode ? 'hover:bg-slate-800 text-slate-200' : 'hover:bg-vita-sage/50 text-vita-charcoal'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{opt.icon}</span>
                          <span>{opt.name}</span>
                        </div>
                        {currentBackground === opt.id && <Check className="w-3.5 h-3.5" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Dim Blocked Toggle */}
          {onToggleDimBlocked && (
            <button
              onClick={onToggleDimBlocked}
              className={`p-1.5 sm:p-2 rounded-xl transition-all active:scale-95 border ${
                dimBlocked
                  ? 'bg-emerald-600 text-white border-emerald-500 shadow'
                  : isDarkMode ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700 opacity-60' : 'bg-vita-sage/40 hover:bg-vita-sage text-vita-wood border-[#D5C9B8] opacity-60'
              }`}
              title={dimBlocked ? 'Dim Blocked Tiles: Enabled (Tap to show full)' : 'Dim Blocked Tiles: Disabled (Tap to dim)'}
            >
              {dimBlocked ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </button>
          )}

          {/* 3D / 2D Perspective Switcher */}
          <button
            onClick={onToggle3DView}
            className={`p-1.5 sm:p-2 rounded-xl transition-all active:scale-95 border flex items-center gap-1 text-xs font-bold ${
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
            className={`p-1.5 sm:p-2 rounded-xl transition-all active:scale-95 border ${isDarkMode ? 'bg-amber-400 hover:bg-amber-300 text-amber-950 border-amber-300 shadow' : 'bg-slate-800 hover:bg-slate-900 text-amber-300 border-slate-700'}`}
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Sound Toggle */}
          <button
            onClick={onToggleSound}
            className={`p-1.5 sm:p-2 rounded-xl transition-all active:scale-95 border ${isDarkMode ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700' : 'bg-vita-sage/40 hover:bg-vita-sage text-vita-wood border-[#D5C9B8]'}`}
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
