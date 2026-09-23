import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { io, Socket } from 'socket.io-client';
import { Play, Swords, Zap, Settings, Trophy, HelpCircle, Star, Sparkles, Download, ArrowDownToLine, Sun, Moon, Layers } from 'lucide-react';
import { BoardTile, GameTheme, BoardBackground, LevelProgress, MoveRecord } from './types/mahjong';
import { GameMode, RoomState, PlayerInfo } from './types/multiplayer';
import { generateSolvableBoard, reshuffleRemainingTiles } from './utils/generator';
import { updateBoardFreeStates, getHintPair, findAvailableMatches } from './utils/solver';
import { soundFx } from './utils/audio';
import { p2pManager } from './utils/p2pMultiplayer';
import { 
  getCampaignProgress, 
  saveLevelResult, 
  getSavedTheme, 
  saveTheme, 
  getSavedSound, 
  saveSound, 
  getSavedPlayerProfile,
  getSavedBackground,
  saveBackground,
  getSavedDimBlocked,
  saveDimBlocked
} from './utils/storage';

import { GameBoard } from './components/board/GameBoard';
import { StorageDock } from './components/board/StorageDock';
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
  const [background, setBackground] = useState<BoardBackground>(getSavedBackground());
  const [dimBlocked, setDimBlocked] = useState<boolean>(getSavedDimBlocked());
  const [soundEnabled, setSoundEnabled] = useState<boolean>(getSavedSound());
  const [playerProfile, setPlayerProfile] = useState(getSavedPlayerProfile());
  const [is3DView, setIs3DView] = useState<boolean>(true);

  const isDarkMode = theme === 'dark' || theme === 'wood';

  // Campaign State
  const [campaignProgress, setCampaignProgress] = useState<Record<number, LevelProgress>>(getCampaignProgress());
  const [currentLevelId, setCurrentLevelId] = useState<number>(1);
  const [currentLayoutName, setCurrentLayoutName] = useState<string>('Celestial Dragon Pagoda');

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
  const [room, setRoom] = useState<RoomState | null>(null);
  const [myPlayerId, setMyPlayerId] = useState<string>(p2pManager.myPlayerId);
  const [turnTimeRemaining, setTurnTimeRemaining] = useState<number>(15);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);

  // PWA Install Prompt
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [pwaInstallable, setPwaInstallable] = useState<boolean>(false);

  // Timers
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const clashTimerRef = useRef<NodeJS.Timeout | null>(null);
  const botTurnRef = useRef<NodeJS.Timeout | null>(null);

  // Toggle Theme (Light / Dark)
  const handleToggleTheme = () => {
    const nextTheme: GameTheme = isDarkMode ? 'ivory' : 'dark';
    setTheme(nextTheme);
    saveTheme(nextTheme);
  };

  // Initialize Sound & PWA prompt listener & P2P Event Listeners
  useEffect(() => {
    soundFx.setSoundEnabled(soundEnabled);

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setPwaInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // Register P2P Listeners
    p2pManager.on('ROOM_UPDATE', ({ room: updatedRoom }: { room: RoomState }) => {
      setRoom(updatedRoom);
    });

    p2pManager.on('GAME_START', ({ room: startedRoom, board: initialBoard }: { room: RoomState; board: BoardTile[] }) => {
      setRoom(startedRoom);
      setGameMode(startedRoom.mode);
      setBoard(initialBoard);
      setTotalPairs(initialBoard.length / 2);
      setScore(0);
      setCombo(1);
      setTimerSeconds(0);
      setView('GAME_MULTIPLAYER');
    });

    p2pManager.on('CLASH_MOVE_MADE', ({ board: newBoard, room: updatedRoom }: { board: BoardTile[]; room: RoomState }) => {
      setBoard(updateBoardFreeStates(newBoard));
      setRoom(updatedRoom);
      soundFx.playMatchSuccess(1);
    });

    p2pManager.on('SPRINT_PROGRESS_UPDATE', ({ players }: { players: PlayerInfo[] }) => {
      setRoom(r => r ? { ...r, players } : null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
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

  // Turn Clash Timer (15s) in multiplayer
  useEffect(() => {
    if (view === 'GAME_MULTIPLAYER' && gameMode === 'CLASH_SHARED' && room?.status === 'PLAYING') {
      clashTimerRef.current = setInterval(() => {
        setTurnTimeRemaining(t => {
          if (t <= 1) {
            // Advance to next player
            setRoom(r => {
              if (!r) return null;
              const nextIndex = ((r.activePlayerIndex || 0) + 1) % r.players.length;
              return { ...r, activePlayerIndex: nextIndex };
            });
            return 15;
          }
          return t - 1;
        });
      }, 1000);
    } else {
      if (clashTimerRef.current) clearInterval(clashTimerRef.current);
    }

    return () => {
      if (clashTimerRef.current) clearInterval(clashTimerRef.current);
    };
  }, [view, gameMode, room?.status]);

  // Stored tiles in the 4-card holding rack
  const storedTiles = useMemo(() => {
    return board.filter(t => t.isStored && !t.isMatched);
  }, [board]);

  const selectedTile = useMemo(() => {
    return board.find(t => t.id === selectedTileId) || null;
  }, [board, selectedTileId]);

  const canStoreSelected = useMemo(() => {
    return selectedTile !== null && !selectedTile.isStored && storedTiles.length < 4;
  }, [selectedTile, storedTiles]);

  // Execute Match
  const executeMatch = useCallback((tileA: BoardTile, tileB: BoardTile) => {
    const isGold = tileA.specialType === 'gold' || tileB.specialType === 'gold';
    const basePoints = isGold ? 250 : 100;
    const pointsEarned = basePoints * combo;
    const nextCombo = combo + 1;
    const newMaxCombo = Math.max(maxCombo, nextCombo);

    if (isGold) {
      soundFx.playGoldBonus();
    } else {
      soundFx.playMatchSuccess(combo);
    }

    const newBoard = board.map(t => {
      if (t.id === tileA.id || t.id === tileB.id) {
        return { 
          ...t, 
          isMatched: true, 
          isStored: false, 
          isSelected: false, 
          isFree: false 
        };
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
        type: tileA.isStored || tileB.isStored ? 'MATCH_FROM_STORAGE' : 'MATCH_BOARD',
        tile1: tileA,
        tile2: tileB,
        timestamp: Date.now(),
        pointsEarned
      }
    ]);

    // Mode 2 Clash Broadcast
    if (view === 'GAME_MULTIPLAYER' && gameMode === 'CLASH_SHARED' && room) {
      const remainingSeconds = turnTimeRemaining;
      const turnBonus = 100 + (remainingSeconds * 10);
      p2pManager.sendClashMove(tileA.id, tileB.id, updatedBoard, turnBonus);
      setTurnTimeRemaining(15);
    }

    // Mode 3 Speed Sprint Broadcast
    const remainingPairs = updatedBoard.filter(t => !t.isMatched).length / 2;
    const progressPercent = Math.round(((totalPairs - remainingPairs) / totalPairs) * 100);

    if (view === 'GAME_MULTIPLAYER' && gameMode === 'SPEED_SPRINT' && room) {
      p2pManager.sendSprintProgress(
        totalPairs - remainingPairs,
        progressPercent,
        score + pointsEarned,
        nextCombo,
        remainingPairs === 0
      );
    }

    // Check Victory
    if (remainingPairs === 0) {
      if (gameMode === 'SOLO_CAMPAIGN') {
        const { stars } = saveLevelResult(currentLevelId, timerSeconds, score + pointsEarned, newMaxCombo);
        setWinStars(stars);
        setCampaignProgress(getCampaignProgress());
        soundFx.playVictoryFanfare();
        setIsWinModalOpen(true);
      } else {
        soundFx.playVictoryFanfare();
        setIsWinModalOpen(true);
      }
    }
  }, [board, combo, maxCombo, score, totalPairs, view, gameMode, room, currentLevelId, timerSeconds, turnTimeRemaining]);

  // AI Bot Turn Loop in Clash Mode
  useEffect(() => {
    if (view === 'GAME_MULTIPLAYER' && gameMode === 'CLASH_SHARED' && room?.status === 'PLAYING') {
      const activePlayer = room.players[room.activePlayerIndex || 0];
      if (activePlayer && activePlayer.id !== myPlayerId) {
        botTurnRef.current = setTimeout(() => {
          const availableMatches = findAvailableMatches(board);
          if (availableMatches.length > 0) {
            const match = availableMatches[0];
            executeMatch(match.tile1, match.tile2);
          } else {
            setRoom(r => {
              if (!r) return null;
              const nextIdx = ((r.activePlayerIndex || 0) + 1) % r.players.length;
              return { ...r, activePlayerIndex: nextIdx };
            });
            setTurnTimeRemaining(15);
          }
        }, 2200);
      }
    }
    return () => {
      if (botTurnRef.current) clearTimeout(botTurnRef.current);
    };
  }, [view, gameMode, room?.activePlayerIndex, room?.status, board, executeMatch, myPlayerId]);

  // Start Solo Campaign Level
  const startSoloLevel = useCallback((levelId: number) => {
    setCurrentLevelId(levelId);
    setGameMode('SOLO_CAMPAIGN');
    const result = generateSolvableBoard(levelId);
    setBoard(result.board);
    setTotalPairs(result.totalPairs);
    setCurrentLayoutName(result.layoutName);
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

    if (view === 'GAME_MULTIPLAYER' && gameMode === 'CLASH_SHARED' && room) {
      const activePlayer = room.players[room.activePlayerIndex || 0];
      if (activePlayer?.id !== myPlayerId) {
        soundFx.playBlockedTap();
        return;
      }
    }

    if (!selectedTileId) {
      setSelectedTileId(tile.id);
      setBoard(b => b.map(t => ({
        ...t,
        isSelected: t.id === tile.id,
        isHinted: false
      })));
      return;
    }

    if (selectedTileId === tile.id) {
      setSelectedTileId(null);
      setBoard(b => b.map(t => ({ ...t, isSelected: false })));
      return;
    }

    const firstTile = board.find(t => t.id === selectedTileId);
    if (!firstTile) return;

    if (firstTile.typeId === tile.typeId) {
      executeMatch(firstTile, tile);
    } else {
      soundFx.playTileClick();
      setSelectedTileId(tile.id);
      setBoard(b => b.map(t => ({
        ...t,
        isSelected: t.id === tile.id,
        isHinted: false
      })));
    }
  }, [selectedTileId, board, view, gameMode, room, myPlayerId, executeMatch]);

  // Move Selected Tile into 4-Slot Storage Dock
  const handleStoreSelectedTile = useCallback(() => {
    if (!selectedTile || selectedTile.isStored || storedTiles.length >= 4) {
      soundFx.playBlockedTap();
      return;
    }

    soundFx.playStoreTile();

    const matchingStored = storedTiles.find(t => t.typeId === selectedTile.typeId);
    if (matchingStored) {
      executeMatch(selectedTile, matchingStored);
      return;
    }

    const nextSlot = storedTiles.length;
    const newBoard = board.map(t => {
      if (t.id === selectedTile.id) {
        return {
          ...t,
          isStored: true,
          storageSlot: nextSlot,
          isSelected: false,
          isHinted: false
        };
      }
      return { ...t, isSelected: false };
    });

    const updatedBoard = updateBoardFreeStates(newBoard);
    setBoard(updatedBoard);
    setSelectedTileId(null);

    setMoveHistory(h => [
      ...h,
      {
        type: 'MOVE_TO_STORAGE',
        tile1: selectedTile,
        storedSlot: nextSlot,
        timestamp: Date.now(),
        pointsEarned: 0
      }
    ]);
  }, [selectedTile, storedTiles, board, executeMatch]);

  // Recall Tile from Storage Back to Board
  const handleRecallTile = useCallback((tile: BoardTile) => {
    if (!tile.isStored) return;

    soundFx.playRecallTile();

    const newBoard = board.map(t => {
      if (t.id === tile.id) {
        return {
          ...t,
          isStored: false,
          storageSlot: undefined,
          isSelected: false,
          isHinted: false
        };
      }
      return t;
    });

    const updatedBoard = updateBoardFreeStates(newBoard);
    setBoard(updatedBoard);
    setSelectedTileId(null);

    setMoveHistory(h => [
      ...h,
      {
        type: 'RECALL_FROM_STORAGE',
        tile1: tile,
        timestamp: Date.now(),
        pointsEarned: 0
      }
    ]);
  }, [board]);

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

    if (lastMove.type === 'MATCH_BOARD' || lastMove.type === 'MATCH_FROM_STORAGE') {
      const revertedBoard = board.map(t => {
        if (t.id === lastMove.tile1.id) {
          return { ...t, isMatched: false, isStored: lastMove.tile1.isStored };
        }
        if (lastMove.tile2 && t.id === lastMove.tile2.id) {
          return { ...t, isMatched: false, isStored: lastMove.tile2.isStored };
        }
        return { ...t, isSelected: false, isHinted: false };
      });
      setBoard(updateBoardFreeStates(revertedBoard));
    } else if (lastMove.type === 'MOVE_TO_STORAGE') {
      const revertedBoard = board.map(t => {
        if (t.id === lastMove.tile1.id) {
          return { ...t, isStored: false, storageSlot: undefined };
        }
        return t;
      });
      setBoard(updateBoardFreeStates(revertedBoard));
    } else if (lastMove.type === 'RECALL_FROM_STORAGE') {
      const revertedBoard = board.map(t => {
        if (t.id === lastMove.tile1.id) {
          return { ...t, isStored: true };
        }
        return t;
      });
      setBoard(updateBoardFreeStates(revertedBoard));
    }

    setSelectedTileId(null);
  }, [moveHistory, board]);

  // Multiplayer Room Handlers (Instant 24/7 WebRTC / P2P)
  const handleCreateRoom = async (mode: GameMode) => {
    setIsConnecting(true);
    const newRoom = await p2pManager.createRoom(mode, {
      name: playerProfile.name || 'Master Player',
      avatar: playerProfile.avatar || '🀄'
    });
    setRoom(newRoom);
    setGameMode(mode);
    setIsConnecting(false);
  };

  const handleAddBot = () => {
    const updated = p2pManager.addBot();
    if (updated) {
      setRoom(updated);
      soundFx.playTileClick();
    }
  };

  const handleJoinRoom = async (code: string) => {
    setIsConnecting(true);
    const joinedRoom = await p2pManager.joinRoom(code, {
      name: playerProfile.name || 'Challenger',
      avatar: playerProfile.avatar || '🀄'
    });
    setRoom(joinedRoom);
    setGameMode(joinedRoom.mode);
    setIsConnecting(false);
  };

  const handleStartMultiplayerGame = () => {
    const result = p2pManager.startGame();
    if (result) {
      setBoard(result.board);
      setTotalPairs(result.board.length / 2);
      setScore(0);
      setCombo(1);
      setTimerSeconds(0);
      setTurnTimeRemaining(15);
      setView('GAME_MULTIPLAYER');
      soundFx.playVictoryFanfare();
    }
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

  const availableMatchesCount = useMemo(() => {
    return findAvailableMatches(board).length;
  }, [board]);

  const handleChangeBackground = (newBg: BoardBackground) => {
    setBackground(newBg);
    saveBackground(newBg);
  };

  const handleToggleDimBlocked = () => {
    setDimBlocked(d => {
      const next = !d;
      saveDimBlocked(next);
      return next;
    });
  };

  const getBackgroundClass = () => {
    switch (background) {
      case 'teak-wood': return 'bg-teak-wood';
      case 'midnight-silk': return 'bg-midnight-silk';
      case 'tatami': return 'bg-tatami';
      case 'misty-mountain': return 'bg-misty-mountain';
      case 'zen-felt':
      default: return 'bg-zen-felt';
    }
  };

  // Render Current View
  return (
    <div className={`min-h-screen flex flex-col justify-between font-display theme-${theme} transition-colors duration-300 ${isDarkMode ? 'dark bg-slate-950 text-slate-100' : 'bg-vita-bg text-vita-charcoal'}`}>
      {/* 1. Main Menu Screen */}
      {view === 'MENU' && (
        <main className="flex-1 flex flex-col items-center justify-center p-4 max-w-xl mx-auto w-full text-center">
          {/* Top Quick Theme Switcher */}
          <div className="w-full flex justify-end mb-2">
            <button
              onClick={handleToggleTheme}
              className={`p-2.5 rounded-2xl border flex items-center gap-2 text-xs font-bold transition-all active:scale-95 shadow-sm ${
                isDarkMode ? 'bg-slate-900 border-slate-700 text-amber-300' : 'bg-white border-[#E8E1D5] text-slate-700'
              }`}
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
              <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
            </button>
          </div>

          {/* Logo Header */}
          <div className="relative mb-6">
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-emerald-600 via-emerald-800 to-teal-950 flex items-center justify-center text-5xl shadow-2xl mx-auto border-4 border-white/20 ring-4 ring-emerald-500/30">
              🀄
            </div>
            <div className="absolute -bottom-2 -right-2 bg-amber-400 text-amber-950 font-black text-xs px-2.5 py-0.5 rounded-full border-2 border-white shadow">
              ONLINE P2P
            </div>
          </div>

          <h1 className="text-4xl sm:text-5xl font-black tracking-tight">
            Vita Mahjong Pro
          </h1>
          <p className="text-sm font-semibold opacity-75 mt-1 max-w-md mx-auto">
            3D Multi-Layer Solitaire • 4-Card Holding Dock • 24/7 Online P2P Arena
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
                  <div className="text-xs font-normal text-emerald-200">500 Solvable Levels + 4-Slot Rack (100% Offline)</div>
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
                  <div className="text-lg leading-tight">Multiplayer Arena (Online P2P)</div>
                  <div className="text-xs font-normal text-amber-200">24/7 Free Room Codes, Turn Clash & Speed Sprint</div>
                </div>
              </div>
              <Swords className="w-6 h-6 text-amber-200" />
            </button>

            {/* Settings & Install */}
            <div className="grid grid-cols-2 gap-3 mt-2">
              <button
                onClick={() => setIsSettingsOpen(true)}
                className={`py-3.5 px-4 rounded-2xl border font-bold text-sm shadow-sm transition-all active:scale-95 flex items-center justify-center gap-2 ${
                  isDarkMode ? 'bg-slate-900 border-slate-700 text-slate-100 hover:bg-slate-800' : 'bg-white border-[#E8E1D5] text-vita-wood hover:bg-vita-sage'
                }`}
              >
                <Settings className="w-4 h-4 text-emerald-600" />
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
                  className={`py-3.5 px-4 rounded-2xl border font-bold text-sm shadow-sm transition-all active:scale-95 flex items-center justify-center gap-2 ${
                    isDarkMode ? 'bg-slate-900 border-slate-700 text-slate-100 hover:bg-slate-800' : 'bg-white border-[#E8E1D5] text-vita-wood hover:bg-vita-sage'
                  }`}
                >
                  <Trophy className="w-4 h-4 text-amber-500" />
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
          isDarkMode={isDarkMode}
          onCreateRoom={handleCreateRoom}
          onJoinRoom={handleJoinRoom}
          onAddBot={handleAddBot}
          onStartGame={handleStartMultiplayerGame}
          onBackToMenu={() => {
            setRoom(null);
            setView('MENU');
          }}
        />
      )}

      {/* 4. Active Game Screen */}
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
              availableMatches={availableMatchesCount}
              soundEnabled={soundEnabled}
              isDarkMode={isDarkMode}
              is3DView={is3DView}
              dimBlocked={dimBlocked}
              currentBackground={background}
              onToggleSound={() => {
                const next = !soundEnabled;
                setSoundEnabled(next);
                saveSound(next);
                soundFx.setSoundEnabled(next);
              }}
              onToggleTheme={handleToggleTheme}
              onToggle3DView={() => setIs3DView(v => !v)}
              onToggleDimBlocked={handleToggleDimBlocked}
              onChangeBackground={handleChangeBackground}
              onPauseClick={() => setIsSettingsOpen(true)}
              onBackClick={() => setView(gameMode === 'SOLO_CAMPAIGN' ? 'CAMPAIGN_MAP' : 'MULTIPLAYER_LOBBY')}
            />
          )}

          {/* Center Play Area with Atmospheric Table Background */}
          <div className={`flex-1 flex flex-col items-center justify-between relative w-full overflow-hidden transition-all duration-500 ${getBackgroundClass()}`}>
            {/* Speed Sprint Sidebar for multiplayer opponents */}
            {view === 'GAME_MULTIPLAYER' && gameMode === 'SPEED_SPRINT' && room && (
              <div className="w-full md:w-64 p-2">
                <SprintSidebar players={room.players} myPlayerId={myPlayerId} />
              </div>
            )}

            {/* 3D Mahjong Board */}
            <div className="flex-1 w-full h-full flex items-center justify-center min-h-[350px]">
              <GameBoard
                board={board}
                onTileClick={handleTileClick}
                scale={boardScale}
                is3DView={is3DView}
                isDarkMode={isDarkMode}
                dimBlocked={dimBlocked}
                onToggle3DView={() => setIs3DView(v => !v)}
                onToggleDimBlocked={handleToggleDimBlocked}
                onResetZoom={() => setBoardScale(1)}
                onZoomIn={() => setBoardScale(s => Math.min(1.5, Math.round((s + 0.1) * 10) / 10))}
                onZoomOut={() => setBoardScale(s => Math.max(0.6, Math.round((s - 0.1) * 10) / 10))}
              />
            </div>

            {/* 4-Card Holding Rack / Storage Dock */}
            <StorageDock
              storedTiles={storedTiles}
              maxCapacity={4}
              selectedTileId={selectedTileId}
              isDarkMode={isDarkMode}
              onTileClick={handleTileClick}
              onStoreSelectedTile={handleStoreSelectedTile}
              onRecallTile={handleRecallTile}
              canStore={canStoreSelected}
            />
          </div>

          {/* Bottom Assist Bar */}
          <AssistBar
            hintsLeft={hintsLeft}
            shufflesLeft={shufflesLeft}
            undosLeft={moveHistory.length}
            canUndo={moveHistory.length > 0 && (gameMode === 'SOLO_CAMPAIGN' || gameMode === 'SPEED_SPRINT')}
            scale={boardScale}
            isDarkMode={isDarkMode}
            onHint={handleHint}
            onShuffle={handleShuffle}
            onUndo={handleUndo}
            onZoomIn={() => setBoardScale(s => Math.min(1.5, Math.round((s + 0.1) * 10) / 10))}
            onZoomOut={() => setBoardScale(s => Math.max(0.6, Math.round((s - 0.1) * 10) / 10))}
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
