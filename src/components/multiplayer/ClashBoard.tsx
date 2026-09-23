import React from 'react';
import { Clock, Trophy, Crown, Flame, Layers, Gamepad2 } from 'lucide-react';
import { PlayerInfo, RoomState } from '../../types/multiplayer';

interface ClashHUDProps {
  room: RoomState;
  myPlayerId: string;
  turnTimeRemaining: number;
}

export const ClashHUD: React.FC<ClashHUDProps> = ({
  room,
  myPlayerId,
  turnTimeRemaining
}) => {
  const activeIndex = room.activePlayerIndex || 0;
  const activePlayer = room.players[activeIndex] || room.players[0];
  const isMyTurn = activePlayer?.id === myPlayerId;

  const timerPercent = Math.max(0, Math.min(100, (turnTimeRemaining / 15) * 100));

  return (
    <div className="w-full bg-white/95 backdrop-blur-md border-b border-[#E8E1D5] px-4 py-3 shadow-md sticky top-0 z-30 select-none">
      <div className="max-w-5xl mx-auto flex flex-col gap-2.5">
        {/* Top Active Turn Banner */}
        <div className="flex items-center justify-between gap-3">
          {/* Active Player Info */}
          <div className="flex items-center gap-2.5">
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white font-bold shadow-md transition-transform ${
                isMyTurn ? 'ring-4 ring-amber-400 scale-105 animate-bounce-short' : ''
              }`}
              style={{ backgroundColor: activePlayer?.avatarColor || '#D99B26' }}
            >
              <Layers className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-black text-vita-wood">
                  {isMyTurn ? 'YOUR TURN!' : `${activePlayer?.name}'s Turn`}
                </span>
                {isMyTurn && (
                  <span className="text-[10px] bg-amber-500 text-white font-black px-2 py-0.5 rounded-full shadow-xs animate-pulse">
                    ACT NOW
                  </span>
                )}
              </div>
              <div className="text-[11px] text-gray-500 font-medium">
                Make a pair before timer runs out (+100 base + 10x sec)!
              </div>
            </div>
          </div>

          {/* 15s Turn Timer Badge */}
          <div
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl border font-black shadow-inner transition-colors ${
              turnTimeRemaining <= 5
                ? 'bg-red-50 border-red-300 text-red-700 animate-pulse'
                : 'bg-amber-50 border-amber-200 text-amber-900'
            }`}
          >
            <Clock className={`w-5 h-5 ${turnTimeRemaining <= 5 ? 'text-red-600' : 'text-amber-600'}`} />
            <span className="font-mono text-xl">{turnTimeRemaining}s</span>
          </div>
        </div>

        {/* Turn Timer Progress Bar */}
        <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden shadow-inner">
          <div
            className={`h-full transition-all duration-1000 ease-linear rounded-full ${
              turnTimeRemaining <= 5
                ? 'bg-gradient-to-r from-red-500 to-orange-500'
                : 'bg-gradient-to-r from-emerald-500 via-amber-500 to-yellow-400'
            }`}
            style={{ width: `${timerPercent}%` }}
          />
        </div>

        {/* Mini Scoreboard of all players */}
        <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none">
          {room.players.map((p, idx) => {
            const isActive = idx === activeIndex;
            return (
              <div
                key={p.id}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all text-xs shrink-0 ${
                  isActive
                    ? 'bg-amber-100/90 border-amber-400 font-bold text-amber-950 shadow-xs'
                    : 'bg-gray-50 border-gray-200 text-gray-700'
                }`}
              >
                <span className="p-1 rounded bg-amber-500/20 text-amber-700">
                  <Gamepad2 className="w-3.5 h-3.5" />
                </span>
                <span className="font-semibold truncate max-w-[90px]">{p.name}</span>
                <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/50">
                  {p.score} pts
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
