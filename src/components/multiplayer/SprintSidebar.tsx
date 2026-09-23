import React from 'react';
import { Zap, Trophy, Crown, Flame, CheckCircle, Medal, Layers } from 'lucide-react';
import { PlayerInfo } from '../../types/multiplayer';

interface SprintSidebarProps {
  players: PlayerInfo[];
  myPlayerId: string;
}

export const SprintSidebar: React.FC<SprintSidebarProps> = ({
  players,
  myPlayerId
}) => {
  // Sort players by score / progress
  const sortedPlayers = [...players].sort((a, b) => {
    if (a.isFinished && !b.isFinished) return -1;
    if (!a.isFinished && b.isFinished) return 1;
    if (b.progressPercent !== a.progressPercent) return b.progressPercent - a.progressPercent;
    return b.score - a.score;
  });

  return (
    <div className="w-full bg-white/95 backdrop-blur-md border border-[#E8E1D5] rounded-3xl p-4 shadow-sm select-none">
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-100">
        <div className="flex items-center gap-1.5 text-emerald-800 font-black text-sm">
          <Zap className="w-4 h-4 text-emerald-600 fill-current" />
          <span>Live Sprint Leaderboard</span>
        </div>
        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
          {players.length} Racers
        </span>
      </div>

      <div className="flex flex-col gap-2.5">
        {sortedPlayers.map((player, index) => {
          const isMe = player.id === myPlayerId;
          const isLeader = index === 0;

          return (
            <div
              key={player.id}
              className={`p-2.5 rounded-2xl border transition-all ${
                isMe
                  ? 'bg-amber-50/70 border-amber-300 ring-1 ring-amber-300 shadow-2xs'
                  : 'bg-gray-50/60 border-gray-200'
              }`}
            >
              {/* Top Row: Rank, Avatar, Name, Score */}
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="w-5 flex items-center justify-center font-black text-xs">
                    {isLeader ? (
                      <Crown className="w-4 h-4 fill-amber-500 text-amber-500" />
                    ) : index === 1 ? (
                      <Medal className="w-4 h-4 text-slate-400" />
                    ) : index === 2 ? (
                      <Medal className="w-4 h-4 text-amber-700" />
                    ) : (
                      <span className="text-gray-400 font-bold">#{index + 1}</span>
                    )}
                  </span>
                  
                  <div
                    className="w-7 h-7 rounded-xl flex items-center justify-center text-white shadow-2xs"
                    style={{ backgroundColor: player.avatarColor || '#2D6A4F' }}
                  >
                    <Layers className="w-3.5 h-3.5 text-white" />
                  </div>

                  <div className="flex flex-col">
                    <div className="text-xs font-bold text-vita-wood flex items-center gap-1">
                      <span className="truncate max-w-[90px]">{player.name}</span>
                      {isMe && (
                        <span className="text-[9px] font-extrabold bg-emerald-100 text-emerald-800 px-1 rounded">
                          YOU
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-mono font-black text-xs text-vita-woodDark">
                    {player.score.toLocaleString()} <span className="text-[10px] text-gray-500 font-normal">pts</span>
                  </div>
                  {player.currentCombo > 1 && (
                    <div className="text-[9px] font-bold text-orange-600 flex items-center justify-end gap-0.5">
                      <Flame className="w-2.5 h-2.5 fill-current" />
                      <span>{player.currentCombo}x</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Progress Bar Row */}
              <div className="w-full flex items-center gap-2">
                <div className="flex-1 bg-gray-200 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 rounded-full ${
                      player.isFinished 
                        ? 'bg-emerald-500' 
                        : isMe 
                        ? 'bg-gradient-to-r from-amber-400 to-amber-600' 
                        : 'bg-teal-600'
                    }`}
                    style={{ width: `${player.progressPercent}%` }}
                  />
                </div>
                <span className="text-[10px] font-mono font-bold text-gray-600 w-8 text-right">
                  {player.isFinished ? '100% 🏁' : `${player.progressPercent}%`}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
