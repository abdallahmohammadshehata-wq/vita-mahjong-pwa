import { BoardTile } from './mahjong';

export type GameMode = 'SOLO_CAMPAIGN' | 'CLASH_SHARED' | 'SPEED_SPRINT';

export interface PlayerInfo {
  id: string;
  name: string;
  avatar: string;
  avatarColor: string;
  isHost: boolean;
  score: number;
  matchedPairs: number;
  maxCombo: number;
  currentCombo: number;
  progressPercent: number; // 0-100
  isFinished: boolean;
  finishTime?: number;
  connected: boolean;
}

export interface RoomState {
  roomId: string;
  mode: GameMode;
  hostId: string;
  isStarted: boolean;
  isFinished: boolean;
  winnerId?: string;
  levelId: number;
  seed: number;
  players: PlayerInfo[];
  
  // Mode 2 (Clash Shared Board) state
  activePlayerIndex?: number;
  turnTimeRemaining?: number; // 15s countdown
  sharedBoard?: BoardTile[];
  
  // Mode 3 (Speed Sprint) state
  startTime?: number;
  durationSeconds?: number;
}

export interface SocketMessagePayloads {
  ROOM_CREATED: { roomId: string; room: RoomState };
  ROOM_JOINED: { roomId: string; room: RoomState };
  ROOM_UPDATE: { room: RoomState };
  GAME_START: { room: RoomState; board: BoardTile[] };
  CLASH_MOVE_MADE: { 
    playerId: string; 
    tileId1: string; 
    tileId2: string; 
    pointsEarned: number; 
    nextPlayerIndex: number;
    turnTimeRemaining: number;
    board: BoardTile[];
  };
  SPRINT_PROGRESS_UPDATE: {
    playerId: string;
    matchedPairs: number;
    progressPercent: number;
    score: number;
    currentCombo: number;
    isFinished: boolean;
  };
  GAME_OVER: {
    winner: PlayerInfo;
    rankings: PlayerInfo[];
  };
  ERROR: { message: string };
}
