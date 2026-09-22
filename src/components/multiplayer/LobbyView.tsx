import React, { useState } from 'react';
import { Swords, Zap, Users, Copy, Check, Play, ArrowLeft, RefreshCw, Bot, UserPlus } from 'lucide-react';
import { GameMode, RoomState, PlayerInfo } from '../../types/multiplayer';

interface LobbyViewProps {
  currentMode: GameMode;
  room: RoomState | null;
  playerId: string;
  isConnecting: boolean;
  isDarkMode?: boolean;
  onCreateRoom: (mode: GameMode) => void;
  onJoinRoom: (roomCode: string) => void;
  onAddBot: () => void;
  onStartGame: () => void;
  onBackToMenu: () => void;
}

export const LobbyView: React.FC<LobbyViewProps> = ({
  currentMode,
  room,
  playerId,
  isConnecting,
  isDarkMode = false,
  onCreateRoom,
  onJoinRoom,
  onAddBot,
  onStartGame,
  onBackToMenu
}) => {
  const [inputCode, setInputCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [selectedMode, setSelectedMode] = useState<GameMode>(currentMode === 'SOLO_CAMPAIGN' ? 'CLASH_SHARED' : currentMode);

  const handleCopyCode = () => {
    if (!room?.roomId) return;
    navigator.clipboard.writeText(room.roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isHost = room ? room.hostId === playerId : false;
  const canStart = isHost && room && room.players.length >= 1;

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-8 flex flex-col items-center select-none">
      {/* Back button */}
      <div className="w-full flex items-center justify-between mb-6">
        <button
          onClick={onBackToMenu}
          className={`flex items-center gap-2 px-4 py-2 rounded-2xl border font-bold text-sm shadow-sm transition-all active:scale-95 ${
            isDarkMode 
              ? 'bg-slate-800 hover:bg-slate-700 text-slate-100 border-slate-700' 
              : 'bg-white hover:bg-vita-sage border-[#E8E1D5] text-vita-wood'
          }`}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Main Menu</span>
        </button>
        <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950 px-3 py-1 rounded-full border border-emerald-300 dark:border-emerald-700">
          Multiplayer Arena
        </span>
      </div>

      {!room ? (
        /* Create or Join Room Card */
        <div className={`w-full rounded-3xl p-6 sm:p-8 border shadow-xl ${
          isDarkMode 
            ? 'bg-slate-900 border-slate-800 text-slate-100' 
            : 'bg-white border-[#E8E1D5] text-vita-charcoal'
        }`}>
          <h2 className="text-2xl sm:text-3xl font-black text-center tracking-tight mb-2">
            Multiplayer Arena
          </h2>
          <p className="text-sm text-center opacity-70 mb-8">
            Challenge your friends or AI bots in turn clashes & high-speed board races!
          </p>

          {/* Mode Selection Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            {/* Mode 2: Turn-Based Clash */}
            <button
              onClick={() => setSelectedMode('CLASH_SHARED')}
              className={`
                p-5 rounded-2xl border-2 text-left transition-all relative overflow-hidden
                ${selectedMode === 'CLASH_SHARED' 
                  ? 'border-amber-500 bg-amber-500/10 shadow-md ring-2 ring-amber-400/30' 
                  : isDarkMode ? 'border-slate-800 bg-slate-950/40 hover:border-slate-700' : 'border-gray-200 hover:border-gray-300 bg-gray-50/50'}
              `}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="p-2.5 rounded-xl bg-amber-500 text-white shadow-xs">
                  <Swords className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-200">
                  2-6 Players
                </span>
              </div>
              <h3 className="text-base font-bold">Turn-Based Clash</h3>
              <p className="text-xs opacity-70 mt-1 leading-relaxed">
                Shared live board. 15-second timer per turn. Score = 100 base + (remaining sec × 10).
              </p>
            </button>

            {/* Mode 3: Speed Sprint */}
            <button
              onClick={() => setSelectedMode('SPEED_SPRINT')}
              className={`
                p-5 rounded-2xl border-2 text-left transition-all relative overflow-hidden
                ${selectedMode === 'SPEED_SPRINT' 
                  ? 'border-emerald-500 bg-emerald-500/10 shadow-md ring-2 ring-emerald-400/30' 
                  : isDarkMode ? 'border-slate-800 bg-slate-950/40 hover:border-slate-700' : 'border-gray-200 hover:border-gray-300 bg-gray-50/50'}
              `}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="p-2.5 rounded-xl bg-emerald-600 text-white shadow-xs">
                  <Zap className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200">
                  2-8 Players
                </span>
              </div>
              <h3 className="text-base font-bold">Parallel Speed Sprint</h3>
              <p className="text-xs opacity-70 mt-1 leading-relaxed">
                Identical board seed. Everyone races simultaneously. Live opponent % progress tracker.
              </p>
            </button>
          </div>

          {/* Action 1: Create Room Button */}
          <button
            onClick={() => onCreateRoom(selectedMode)}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-700 to-emerald-800 hover:from-emerald-700 hover:to-teal-900 text-white font-black text-base shadow-xl hover:shadow-2xl transition-all active:scale-98 flex items-center justify-center gap-2 mb-6"
          >
            <Users className="w-5 h-5" />
            <span>Create New Game Room</span>
          </button>

          {/* Divider */}
          <div className="relative flex py-2 items-center mb-6">
            <div className="flex-grow border-t border-gray-300 dark:border-slate-800"></div>
            <span className="flex-shrink mx-4 text-xs font-bold opacity-40 uppercase tracking-widest">Or Join With Code</span>
            <div className="flex-grow border-t border-gray-300 dark:border-slate-800"></div>
          </div>

          {/* Action 2: Join by 6-character Code */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const code = inputCode.trim() || (document.getElementById('room-input-code') as HTMLInputElement)?.value.trim() || '';
              if (code.length >= 3) onJoinRoom(code.toUpperCase());
            }}
            className="flex gap-2"
          >
            <input
              id="room-input-code"
              type="text"
              maxLength={8}
              placeholder="Room Code (e.g. CL1234)"
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value.toUpperCase())}
              className={`flex-1 px-4 py-3.5 rounded-2xl border-2 font-mono font-bold text-center tracking-widest uppercase text-lg focus:outline-none ${
                isDarkMode 
                  ? 'bg-slate-950 border-slate-700 focus:border-emerald-500 text-white' 
                  : 'bg-white border-gray-200 focus:border-emerald-500 text-vita-charcoal'
              }`}
            />
            <button
              type="submit"
              onClick={(e) => {
                e.preventDefault();
                const code = inputCode.trim() || (document.getElementById('room-input-code') as HTMLInputElement)?.value.trim() || '';
                if (code.length >= 3) onJoinRoom(code.toUpperCase());
              }}
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-600 to-orange-700 hover:from-amber-700 hover:to-orange-800 text-white font-bold text-sm shadow-md transition-all active:scale-95"
            >
              Join Room
            </button>
          </form>
        </div>
      ) : (
        /* Active Room Waiting Lobby */
        <div className={`w-full rounded-3xl p-6 sm:p-8 border shadow-xl text-center ${
          isDarkMode 
            ? 'bg-slate-900 border-slate-800 text-slate-100' 
            : 'bg-white border-[#E8E1D5] text-vita-charcoal'
        }`}>
          <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950 px-3 py-1 rounded-full border border-emerald-300 dark:border-emerald-700">
            {room.mode === 'CLASH_SHARED' ? 'Turn-Based Clash Room' : 'Speed Sprint Room'}
          </span>

          <h2 className="text-2xl font-black mt-2 mb-1">Room Code</h2>
          
          {/* Room Code Badge with Copy */}
          <div className="inline-flex items-center gap-3 bg-amber-500/15 border-2 border-amber-400/50 px-6 py-3 rounded-2xl shadow-inner my-3">
            <span className="font-mono text-3xl sm:text-4xl font-black tracking-widest text-amber-600 dark:text-amber-300">
              {room.roomId}
            </span>
            <button
              onClick={handleCopyCode}
              className="p-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-amber-100 text-amber-900 dark:text-amber-300 transition-colors shadow-xs"
              title="Copy Room Code"
            >
              {copied ? <Check className="w-5 h-5 text-emerald-600" /> : <Copy className="w-5 h-5" />}
            </button>
          </div>

          <p className="text-xs opacity-70 mb-4">
            Share this code with your friends or add AI Challenger Bots!
          </p>

          {/* Add Bot Action */}
          <div className="flex justify-center mb-6">
            <button
              onClick={onAddBot}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500/15 hover:bg-blue-500/25 border border-blue-400 text-blue-700 dark:text-blue-300 font-bold text-xs shadow-sm transition-all active:scale-95"
            >
              <Bot className="w-4 h-4" />
              <span>+ Add AI Challenger Bot</span>
            </button>
          </div>

          {/* Connected Players List */}
          <div className={`rounded-2xl p-4 border mb-6 text-left ${
            isDarkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-gray-50/80 border-gray-200/80'
          }`}>
            <h4 className="text-xs font-bold opacity-60 uppercase tracking-wider mb-3">
              Connected Players ({room.players.length})
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {room.players.map((p) => (
                <div
                  key={p.id}
                  className={`flex items-center justify-between p-2.5 rounded-xl border shadow-2xs ${
                    isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-lg text-white font-bold shadow-xs"
                      style={{ backgroundColor: p.avatarColor || '#2D6A4F' }}
                    >
                      {p.avatar || '🀄'}
                    </div>
                    <div>
                      <div className="text-sm font-bold flex items-center gap-1.5">
                        <span>{p.name}</span>
                        {p.isHost && (
                          <span className="text-[9px] bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-200 font-bold px-1.5 py-0.2 rounded">
                            Host 👑
                          </span>
                        )}
                        {p.id === playerId && (
                          <span className="text-[9px] bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 font-bold px-1.5 py-0.2 rounded">
                            You
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                        Ready
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Start Button (Host only) */}
          {isHost ? (
            <button
              onClick={onStartGame}
              disabled={!canStart}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-700 to-emerald-800 hover:from-emerald-700 hover:to-teal-900 text-white font-black text-lg shadow-xl hover:shadow-2xl transition-all active:scale-98 flex items-center justify-center gap-2"
            >
              <Play className="w-6 h-6 fill-current text-amber-300" />
              <span>Start Game Now</span>
            </button>
          ) : (
            <div className="p-4 rounded-2xl bg-amber-500/15 border border-amber-400 text-amber-900 dark:text-amber-200 font-bold text-sm flex items-center justify-center gap-2">
              <RefreshCw className="w-5 h-5 animate-spin text-amber-600" />
              <span>Waiting for room host to start the game...</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
