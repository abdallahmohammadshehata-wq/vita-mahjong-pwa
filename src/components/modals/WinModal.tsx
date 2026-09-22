import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Star, Trophy, ArrowRight, RotateCcw, Home, Sparkles } from 'lucide-react';
import { soundFx } from '../../utils/audio';

interface WinModalProps {
  isOpen: boolean;
  levelId: number;
  timeSeconds: number;
  score: number;
  stars: number;
  maxCombo: number;
  onNextLevel: () => void;
  onReplay: () => void;
  onMenu: () => void;
}

export const WinModal: React.FC<WinModalProps> = ({
  isOpen,
  levelId,
  timeSeconds,
  score,
  stars,
  maxCombo,
  onNextLevel,
  onReplay,
  onMenu
}) => {
  useEffect(() => {
    if (isOpen) {
      soundFx.playVictoryFanfare();
      confetti({
        particleCount: 90,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins}:${remainder.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in select-none">
      <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 border border-[#E8E1D5] shadow-2xl text-center transform animate-scale-up">
        {/* Top Trophy Banner */}
        <div className="relative inline-block mb-3">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-400 to-yellow-300 flex items-center justify-center shadow-lg mx-auto">
            <Trophy className="w-10 h-10 text-amber-900 fill-current" />
          </div>
          <div className="absolute -top-2 -right-2 text-2xl animate-spin-slow">✨</div>
        </div>

        <h2 className="text-3xl font-black text-vita-wood tracking-tight">Level Complete!</h2>
        <p className="text-xs text-vita-textMuted mt-1">Level {levelId} Solved Successfully</p>

        {/* 3 Stars Animation */}
        <div className="flex items-center justify-center gap-3 my-5">
          {[1, 2, 3].map((starIdx) => (
            <div
              key={starIdx}
              className={`p-2 rounded-2xl border transition-all duration-500 ${
                starIdx <= stars
                  ? 'bg-amber-50 border-amber-300 scale-110 shadow-md'
                  : 'bg-gray-50 border-gray-200 opacity-40'
              }`}
            >
              <Star
                className={`w-8 h-8 ${
                  starIdx <= stars
                    ? 'fill-amber-400 text-amber-500 animate-bounce-short'
                    : 'text-gray-300 fill-transparent'
                }`}
              />
            </div>
          ))}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2.5 bg-gray-50/80 p-3.5 rounded-2xl border border-gray-200/80 mb-6">
          <div className="p-2 bg-white rounded-xl shadow-2xs border border-gray-100">
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Time</div>
            <div className="text-base font-black text-vita-wood mt-0.5">{formatTime(timeSeconds)}</div>
          </div>
          <div className="p-2 bg-white rounded-xl shadow-2xs border border-gray-100">
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Score</div>
            <div className="text-base font-black text-emerald-700 mt-0.5">{score.toLocaleString()}</div>
          </div>
          <div className="p-2 bg-white rounded-xl shadow-2xs border border-gray-100">
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Combo</div>
            <div className="text-base font-black text-orange-600 mt-0.5">{maxCombo}x</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2.5">
          {levelId < 500 && (
            <button
              onClick={onNextLevel}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-700 to-teal-800 hover:from-emerald-800 hover:to-teal-900 text-white font-black text-base shadow-lg transition-all active:scale-98 flex items-center justify-center gap-2"
            >
              <span>Next Level {levelId + 1}</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          )}

          <div className="flex gap-2">
            <button
              onClick={onReplay}
              className="flex-1 py-3 rounded-2xl bg-vita-sage/50 hover:bg-vita-sage border border-vita-sage text-vita-wood font-bold text-sm shadow-xs transition-colors flex items-center justify-center gap-1.5"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Replay</span>
            </button>

            <button
              onClick={onMenu}
              className="flex-1 py-3 rounded-2xl bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 font-bold text-sm shadow-xs transition-colors flex items-center justify-center gap-1.5"
            >
              <Home className="w-4 h-4" />
              <span>Menu</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
