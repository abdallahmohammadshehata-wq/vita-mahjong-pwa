import React, { useState, useEffect, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { Play, Swords, Zap, Settings, Trophy, HelpCircle, Star, Sparkles, Download } from 'lucide-react';
import { BoardTile, GameTheme, LevelProgress, MoveRecord } from './types/mahjong';
import { GameMode, RoomState, PlayerInfo } from './types/multiplayer';
import { generateSolvableBoard, reshuffleRemainingTiles } from './utils/generator';
import { updateBoardFreeStates, getHintPair } from './utils/solver';
import { soundFx } from './utils/audio';
import { 
  getCampaignProgress, 
  saveLevelResult, 
  getSavedTheme, 
  saveTheme, 
  getSavedSound, 
  saveSound, 
  getSavedPlayerProfile 
} from './utils/storage';

import { GameBoard } from './components/board/GameBoard';
import { GameHUD } from './components/hud/GameHUD';
import { AssistBar } from './components/hud/AssistBar';
import { CampaignLevelSelect } from './components/campaign/CampaignLevelSelect';
import { LobbyView } from './components/multiplayer/LobbyView';
import { ClashHUD } from './components/multiplayer/ClashBoard';
import { SprintSidebar } from './components/multiplayer/SprintSidebar';
import { WinModal } from './components/modals/WinModal';
import { SettingsModal } from './components/modals/SettingsModal';

type ViewState = 'MENU' | 'CAMPAIGN_MAP' | 'GAME_SOLO' | 'MULTIPLAYER_LOBBY' | 'GAME_MULTIPLAYER';

export function App() {
  // Navigation & Profile
  const [view, setView] = useState<ViewState>('MENU');
  const [theme, setTheme] = useState<GameTheme>(getSavedTheme());
  const [soundEnabled, setSoundEnabled] = useState<boolean>(getSavedSound());
  const [playerProfile, setPlayerProfile] = useState(getSavedPlayerProfile());

  // Campaign State
  const [campaignProgress, setCampaignProgress] = useState<Record<number, LevelProgress>>(getCampaignProgress());
  const [currentLevelId, setCurrentLevelId] = useState<number>(1);

  // Active Game State
  const [gameMode, setGameMode] = useState<GameMode>('SOLO_CAMPAIGN');
  const [board, setBoard] = useState<BoardTile[]>([]);
  const [selectedTileId, setSelectedTileId] = useState<string | null>(null);
  const [score, setScore] = useState<number>(0);
  const [combo, setCombo] = useState<number>(1);
  const [maxCombo, setMaxCombo] = useState<number>(1);
  const [timerSeconds, setTimerSeconds] = useState<number>(0);
  const [totalPairs, setTotalPairs] = useState<number>(18);
  const [moveHistory, setMoveHistory] = useState<MoveRecord[]>([]);

  // Assist Tools State
  const [hintsLeft, setHintsLeft] = useState<number>(3);
  const [shufflesLeft, setShufflesLeft] = useState<number>(3);
  const [boardScale, setBoardScale] = useState<number>(1);

  // Modals
  const [isWinModalOpen, setIsWinModalOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [winStars, setWinStars] = useState<number>(3);

  // Multiplayer State
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [room, setRoom] = useState<RoomState | null>(null);
  const [myPlayerId, setMyPlayerId] = useState<string>('');
  const [turnTimeRemaining, setTurnTimeRemaining] = useState<number>(15);

  // PWA Install Prompt
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [pwaInstallable, setPwaInstallable] = useState<boolean>(false);

  // Timer Ref
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize Sound & PWA prompt listener
  useEffect(() => {
    soundFx.setSoundEnabled(soundEnabled);

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setPwaInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  // Connect Socket.io for multiplayer
  useEffect(() => {
    const s = io(window.location.origin, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5
    });

    s.on('connect', () => {
      console.log('Connected to Multiplayer Socket Server');
    });

    s.on('ROOM_UPDATE', ({ room: updatedRoom }: { room: RoomState }) => {
      setRoom(updatedRoom);
    });

    s.on('GAME_START', ({ room: startedRoom, board: initialBoard }: { room: RoomState; board: BoardTile[] }) => {
      setRoom(startedRoom);
      setGameMode(startedRoom.mode);
      setBoard(initialBoard);
      setTotalPairs(initialBoard.length / 2);
      setScore(0);
      setCombo(1);
      setTimerSeconds(0);
      setView('GAME_MULTIPLAYER');
    });

    s.on('CLASH_TIMER_TICK', ({ turnTimeRemaining: time }: { turnTimeRemaining: number }) => {
      setTurnTimeRemaining(time);
    });

    s.on('CLASH_TURN_CHANGED', ({ activePlayerIndex, turnTimeRemaining: time, room: updatedRoom }) => {
      setTurnTimeRemaining(time);
      setRoom(updatedRoom);
    });

    s.on('CLASH_MOVE_MADE', ({ board: newBoard, room: updatedRoom, pointsEarned }) => {
      setBoard(updateBoardFreeStates(newBoard));
      setRoom(updatedRoom);
      soundFx.playMatchSuccess(1);
    });

    s.on('SPRINT_PROGRESS_UPDATE', ({ players }: { players: PlayerInfo[] }) => {
      setRoom(r => r ? { ...r, players } : null);
    });

    s.on('GAME_OVER', ({ room: finishedRoom }: { room: RoomState }) => {
      setRoom(finishedRoom);
      setIsWinModalOpen(true);
    });

    setSocket(s);

    return () => {
      s.disconnect();
    };
  }, []);

  // Timer Tick during active game
  useEffect(() => {
    if (view === 'GAME_SOLO' || (view === 'GAME_MULTIPLAYER' && gameMode === 'SPEED_SPRINT')) {
      timerIntervalRef.current = setInterval(() => {
        setTimerSeconds(s => s + 1);
      }, 1000);
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [view, gameMode]);

  // Start Solo Campaign Level
  const startSoloLevel = useCallback((levelId: number) => {
    setCurrentLevelId(levelId);
    setGameMode('SOLO_CAMPAIGN');
    const result = generateSolvableBoard(levelId);
    setBoard(result.board);
    setTotalPairs(result.totalPairs);
    setSelectedTileId(null);
    setScore(0);
    setCombo(1);
    setMaxCombo(1);
    setTimerSeconds(0);
    setMoveHistory([]);
    setHintsLeft(3);
    setShufflesLeft(3);
    setIsWinModalOpen(false);
    setView('GAME_SOLO');
  }, []);

  // Tile Selection & Matching Logic
  const handleTileClick = useCallback((tile: BoardTile) => {
    if (!tile.isFree || tile.isMatched) return;

    // Mode 2 Clash validation: only active player can move
    if (view === 'GAME_MULTIPLAYER' && gameMode === 'CLASH_SHARED' && room) {
      const activePlayer = room.players[room.activePlayerIndex || 0];
      if (activePlayer?.id !== myPlayerId) {
        soundFx.playBlockedTap();
        return;
      }
    }

    // First Tile Selection
    if (!selectedTileId) {
      setSelectedTileId(tile.id);
      setBoard(b => b.map(t => ({
        ...t,
        isSelected: t.id === tile.id,
        isHinted: false
      })));
      return;
    }

    // Clicking same tile deselects it
    if (selectedTileId === tile.id) {
      setSelectedTileId(null);
      setBoard(b => b.map(t => ({ ...t, isSelected: false })));
      return;
    }

    const firstTile = board.find(t => t.id === selectedTileId);
    if (!firstTile) return;

    // Check if Type Matches!
    if (firstTile.typeId === tile.typeId) {
      // SUCCESSFUL MATCH!
      const pointsEarned = 100 * combo;
      const nextCombo = combo + 1;
      const newMaxCombo = Math.max(maxCombo, nextCombo);

      soundFx.playMatchSuccess(combo);

      const newBoard = board.map(t => {
        if (t.id === firstTile.id || t.id === tile.id) {
          return { ...t, isMatched: true, isSelected: false, isFree: false };
        }
        return { ...t, isSelected: false, isHinted: false };
      });

      const updatedBoard = updateBoardFreeStates(newBoard);
      setBoard(updatedBoard);
      setSelectedTileId(null);
      setScore(s => s + pointsEarned);
      setCombo(nextCombo);
      setMaxCombo(newMaxCombo);

      // Record move for Undo
      setMoveHistory(h => [
        ...h,
        {
          tile1: firstTile,
          tile2: tile,
          timestamp: Date.now(),
          pointsEarned
        }
      ]);

      // Mode 2 Clash: Broadcast Move to Server
      if (view === 'GAME_MULTIPLAYER' && gameMode === 'CLASH_SHARED' && socket && room) {
        socket.emit('CLASH_MOVE', {
          roomId: room.roomId,
          playerId: myPlayerId,
          tileId1: firstTile.id,
          tileId2: tile.id
        });
      }

      // Mode 3 Speed Sprint: Broadcast Progress to Server
      const remainingPairs = updatedBoard.filter(t => !t.isMatched).length / 2;
      const progressPercent = Math.round(((totalPairs - remainingPairs) / totalPairs) * 100);

      if (view === 'GAME_MULTIPLAYER' && gameMode === 'SPEED_SPRINT' && socket && room) {
        socket.emit('SPRINT_PROGRESS', {
          roomId: room.roomId,
          playerId: myPlayerId,
          progressData: {
            matchedPairs: totalPairs - remainingPairs,
            progressPercent,
            score: score + pointsEarned,
            currentCombo: nextCombo,
            isFinished: remainingPairs === 0
          }
        });
      }

      // Check Victory Condition
      if (remainingPairs === 0) {
        if (gameMode === 'SOLO_CAMPAIGN') {
          const { stars } = saveLevelResult(currentLevelId, timerSeconds, score + pointsEarned, newMaxCombo);
          setWinStars(stars);
          setCampaignProgress(getCampaignProgress());
          setIsWinModalOpen(true);
        } else if (gameMode === 'SPEED_SPRINT') {
          setIsWinModalOpen(true);
        }
      }
    } else {
      // MISMATCH: Reset selection
      soundFx.playBlockedTap();
      setSelectedTileId(null);
      setCombo(1);
      setBoard(b => b.map(t => ({ ...t, isSelected: false })));
    }
  }, [selectedTileId, board, combo, maxCombo, score, totalPairs, view, gameMode, room, myPlayerId, socket, currentLevelId, timerSeconds]);

  // Assist: Hint
  const handleHint = useCallback(() => {
    if (hintsLeft <= 0) return;
    const pair = getHintPair(board);
    if (!pair) {
      soundFx.playBlockedTap();
      return;
    }

    setHintsLeft(h => h - 1);
    soundFx.playTileClick();
    setBoard(b => b.map(t => ({
      ...t,
      isHinted: t.id === pair[0] || t.id === pair[1],
      isSelected: false
    })));
  }, [hintsLeft, board]);

  // Assist: Shuffle
  const handleShuffle = useCallback(() => {
    if (shufflesLeft <= 0) return;
    setShufflesLeft(s => s - 1);
    soundFx.playShuffle();
    setBoard(b => reshuffleRemainingTiles(b));
    setSelectedTileId(null);
  }, [shufflesLeft]);

  // Assist: Undo
  const handleUndo = useCallback(() => {
    if (moveHistory.length === 0) return;
    const lastMove = moveHistory[moveHistory.length - 1];
    setMoveHistory(h => h.slice(0, -1));

    soundFx.playShuffle();
    setScore(s => Math.max(0, s - lastMove.pointsEarned));
    setCombo(1);

    const revertedBoard = board.map(t => {
      if (t.id === lastMove.tile1.id || t.id === lastMove.tile2.id) {
        return { ...t, isMatched: false };
      }
      return { ...t, isSelected: false, isHinted: false };
    });

    setBoard(updateBoardFreeStates(revertedBoard));
    setSelectedTileId(null);
  }, [moveHistory, board]);

  // Multiplayer Actions
  const handleCreateRoom = (mode: GameMode) => {
    if (!socket) return;
    setIsConnecting(true);
    socket.emit('CREATE_ROOM', { mode, profile: playerProfile }, (res: any) => {
      setIsConnecting(false);
      if (res.success) {
        setRoom(res.room);
        setMyPlayerId(res.playerId);
      }
    });
  };

  const handleJoinRoom = (code: string) => {
    if (!socket) return;
    setIsConnecting(true);
    socket.emit('JOIN_ROOM', { roomId: code, profile: playerProfile }, (res: any) => {
      setIsConnecting(false);
      if (res.success) {
        setRoom(res.room);
        setMyPlayerId(res.playerId);
      } else {
        alert(res.error || 'Failed to join room');
      }
    });
  };

  const handleStartMultiplayerGame = () => {
    if (!socket || !room) return;
    socket.emit('START_GAME', { roomId: room.roomId, playerId: myPlayerId }, (res: any) => {
      if (!res.success) alert(res.error || 'Failed to start game');
    });
  };

  const handleInstallPwa = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setPwaInstallable(false);
    }
    setDeferredPrompt(null);
  };

  const remainingPairs = board.filter(t => !t.isMatched).length / 2;

  // Render Current View
  return (
    <div className={`min-h-screen flex flex-col justify-between font-display theme-${theme} bg-vita-bg text-vita-charcoal transition-colors duration-300`}>
      {/* 1. Main Menu Screen */}
      {view === 'MENU' && (
        <main className="flex-1 flex flex-col items-center justify-center p-4 max-w-xl mx-auto w-full text-center">
          {/* Logo Header */}
          <div className="relative mb-6">
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-emerald-700 via-emerald-800 to-teal-950 flex items-center justify-center text-5xl shadow-2xl mx-auto border-4 border-[#FAF7F2] ring-4 ring-emerald-600/30">
              🀄
            </div>
            <div className="absolute -bottom-2 -right-2 bg-amber-400 text-amber-950 font-black text-xs px-2.5 py-0.5 rounded-full border-2 border-white shadow">
              PWA
            </div>
          </div>

          <h1 className="text-4xl sm:text-5xl font-black text-vita-wood tracking-tight">
            Vita Mahjong
          </h1>
          <p className="text-sm font-semibold text-emerald-800/80 mt-1 max-w-sm mx-auto">
            Accessible, Senior-Friendly Solitaire & Real-Time Multiplayer
          </p>

          {/* Menu Action Cards */}
          <div className="w-full flex flex-col gap-3.5 mt-8">
            {/* Mode 1: Solo Campaign */}
            <button
              onClick={() => setView('CAMPAIGN_MAP')}
              className="w-full p-4.5 rounded-2xl bg-gradient-to-r from-emerald-700 to-teal-800 hover:from-emerald-800 hover:to-teal-900 text-white font-black text-lg shadow-xl hover:shadow-2xl transition-all active:scale-98 flex items-center justify-between px-6 group"
            >
              <div className="flex items-center gap-3.5 text-left">
                <div className="p-2.5 rounded-xl bg-white/20 text-2xl group-hover:scale-110 transition-transform">
                  🗺️
                </div>
                <div>
                  <div className="text-lg leading-tight">Solo Campaign</div>
                  <div className="text-xs font-normal text-emerald-200">500 Solvable Levels (100% Offline)</div>
                </div>
              </div>
              <Play className="w-6 h-6 fill-current text-amber-300" />
            </button>

            {/* Mode 2 & 3: Multiplayer Hub */}
            <button
              onClick={() => {
                setRoom(null);
                setView('MULTIPLAYER_LOBBY');
              }}
              className="w-full p-4.5 rounded-2xl bg-gradient-to-r from-amber-600 to-orange-700 hover:from-amber-700 hover:to-orange-800 text-white font-black text-lg shadow-xl hover:shadow-2xl transition-all active:scale-98 flex items-center justify-between px-6 group"
            >
              <div className="flex items-center gap-3.5 text-left">
                <div className="p-2.5 rounded-xl bg-white/20 text-2xl group-hover:scale-110 transition-transform">
                  ⚔️
                </div>
                <div>
                  <div className="text-lg leading-tight">Multiplayer Arena</div>
                  <div className="text-xs font-normal text-amber-200">Turn Clash & Parallel Speed Sprint</div>
                </div>
              </div>
              <Swords className="w-6 h-6 text-amber-200" />
            </button>

            {/* Settings & Install */}
            <div className="grid grid-cols-2 gap-3 mt-2">
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="py-3.5 px-4 rounded-2xl bg-white hover:bg-vita-sage border border-[#E8E1D5] text-vita-wood font-bold text-sm shadow-sm transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <Settings className="w-4 h-4 text-emerald-700" />
                <span>Settings</span>
              </button>

              {pwaInstallable ? (
                <button
                  onClick={handleInstallPwa}
                  className="py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-sm shadow-sm transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Install App</span>
                </button>
              ) : (
                <button
                  onClick={() => setIsSettingsOpen(true)}
                  className="py-3.5 px-4 rounded-2xl bg-white hover:bg-vita-sage border border-[#E8E1D5] text-vita-wood font-bold text-sm shadow-sm transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <Trophy className="w-4 h-4 text-amber-600" />
                  <span>Profile</span>
                </button>
              )}
            </div>
          </div>
        </main>
      )}

      {/* 2. Campaign Level Selection Screen */}
      {view === 'CAMPAIGN_MAP' && (
        <CampaignLevelSelect
          progress={campaignProgress}
          currentSelectedLevel={currentLevelId}
          onSelectLevel={startSoloLevel}
          onBackToMenu={() => setView('MENU')}
        />
      )}

      {/* 3. Multiplayer Lobby Screen */}
      {view === 'MULTIPLAYER_LOBBY' && (
        <LobbyView
          currentMode={gameMode}
          room={room}
          playerId={myPlayerId}
          isConnecting={isConnecting}
          onCreateRoom={handleCreateRoom}
          onJoinRoom={handleJoinRoom}
          onStartGame={handleStartMultiplayerGame}
          onBackToMenu={() => {
            setRoom(null);
            setView('MENU');
          }}
        />
      )}

      {/* 4. Active Game Screen (Solo or Multiplayer) */}
      {(view === 'GAME_SOLO' || view === 'GAME_MULTIPLAYER') && (
        <div className="flex-1 flex flex-col justify-between h-full">
          {/* Top HUD */}
          {view === 'GAME_MULTIPLAYER' && gameMode === 'CLASH_SHARED' && room ? (
            <ClashHUD
              room={room}
              myPlayerId={myPlayerId}
              turnTimeRemaining={turnTimeRemaining}
            />
          ) : (
            <GameHUD
              mode={gameMode}
              levelId={currentLevelId}
              score={score}
              timeSeconds={timerSeconds}
              pairsRemaining={remainingPairs}
              totalPairs={totalPairs}
              combo={combo}
              soundEnabled={soundEnabled}
              onToggleSound={() => {
                const next = !soundEnabled;
                setSoundEnabled(next);
                saveSound(next);
                soundFx.setSoundEnabled(next);
              }}
              onPauseClick={() => setIsSettingsOpen(true)}
              onBackClick={() => setView(gameMode === 'SOLO_CAMPAIGN' ? 'CAMPAIGN_MAP' : 'MULTIPLAYER_LOBBY')}
            />
          )}

          {/* Center Play Area */}
          <div className="flex-1 flex flex-col md:flex-row items-center justify-center relative w-full overflow-hidden p-2">
            {/* Speed Sprint Sidebar for multiplayer opponents */}
            {view === 'GAME_MULTIPLAYER' && gameMode === 'SPEED_SPRINT' && room && (
              <div className="w-full md:w-64 md:h-full p-2">
                <SprintSidebar players={room.players} myPlayerId={myPlayerId} />
              </div>
            )}

            {/* 3D Mahjong Board */}
            <div className="flex-1 w-full h-full flex items-center justify-center min-h-[420px]">
              <GameBoard
                board={board}
                onTileClick={handleTileClick}
                scale={boardScale}
              />
            </div>
          </div>

          {/* Bottom Assist Bar */}
          <AssistBar
            hintsLeft={hintsLeft}
            shufflesLeft={shufflesLeft}
            undosLeft={moveHistory.length}
            canUndo={moveHistory.length > 0 && (gameMode === 'SOLO_CAMPAIGN' || gameMode === 'SPEED_SPRINT')}
            scale={boardScale}
            onHint={handleHint}
            onShuffle={handleShuffle}
            onUndo={handleUndo}
            onZoomIn={() => setBoardScale(s => Math.min(1.5, s + 0.1))}
            onZoomOut={() => setBoardScale(s => Math.max(0.6, s - 0.1))}
            onResetZoom={() => setBoardScale(1)}
          />
        </div>
      )}

      {/* Modals */}
      <WinModal
        isOpen={isWinModalOpen}
        levelId={currentLevelId}
        timeSeconds={timerSeconds}
        score={score}
        stars={winStars}
        maxCombo={maxCombo}
        onNextLevel={() => startSoloLevel(currentLevelId + 1)}
        onReplay={() => startSoloLevel(currentLevelId)}
        onMenu={() => {
          setIsWinModalOpen(false);
          setView('MENU');
        }}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        theme={theme}
        soundEnabled={soundEnabled}
        playerProfile={playerProfile}
        pwaInstallable={pwaInstallable}
        onInstallPwa={handleInstallPwa}
        onThemeChange={(newTheme) => {
          setTheme(newTheme);
          saveTheme(newTheme);
        }}
        onSoundToggle={() => {
          const next = !soundEnabled;
          setSoundEnabled(next);
          saveSound(next);
          soundFx.setSoundEnabled(next);
        }}
        onProfileChange={(newProf) => setPlayerProfile(newProf)}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
}
export default App;
