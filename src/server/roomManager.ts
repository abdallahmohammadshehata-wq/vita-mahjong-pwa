import { Server, Socket } from 'socket.io';
import { GameMode, PlayerInfo, RoomState } from '../types/multiplayer';
import { BoardTile } from '../types/mahjong';
import { generateSolvableBoard } from '../utils/generator';

export class RoomManager {
  private rooms: Map<string, RoomState> = new Map();
  private socketToPlayer: Map<string, { roomId: string; playerId: string }> = new Map();
  private turnIntervals: Map<string, NodeJS.Timeout> = new Map();
  private io: Server;

  constructor(io: Server) {
    this.io = io;
  }

  public generateRoomCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return this.rooms.has(code) ? this.generateRoomCode() : code;
  }

  public createRoom(
    socket: Socket,
    mode: GameMode,
    playerProfile: { name: string; avatar: string; color: string }
  ): RoomState {
    const roomId = this.generateRoomCode();
    const playerId = `p_${socket.id.substring(0, 6)}`;

    const hostPlayer: PlayerInfo = {
      id: playerId,
      name: playerProfile.name || 'Host Player',
      avatar: playerProfile.avatar || '🀄',
      avatarColor: playerProfile.color || '#2D6A4F',
      isHost: true,
      score: 0,
      matchedPairs: 0,
      maxCombo: 0,
      currentCombo: 0,
      progressPercent: 0,
      isFinished: false,
      connected: true
    };

    const room: RoomState = {
      roomId,
      mode,
      hostId: playerId,
      isStarted: false,
      isFinished: false,
      levelId: 1,
      seed: Math.floor(Math.random() * 100000),
      players: [hostPlayer],
      activePlayerIndex: 0,
      turnTimeRemaining: 15
    };

    this.rooms.set(roomId, room);
    this.socketToPlayer.set(socket.id, { roomId, playerId });
    socket.join(roomId);

    return room;
  }

  public joinRoom(
    socket: Socket,
    roomId: string,
    playerProfile: { name: string; avatar: string; color: string }
  ): { success: boolean; room?: RoomState; error?: string } {
    const upperCode = roomId.toUpperCase();
    const room = this.rooms.get(upperCode);

    if (!room) {
      return { success: false, error: 'Room not found. Please verify the 6-character code.' };
    }

    if (room.isStarted) {
      return { success: false, error: 'Game is already in progress in this room.' };
    }

    if (room.players.length >= 8) {
      return { success: false, error: 'Room is full (Maximum 8 players).' };
    }

    const playerId = `p_${socket.id.substring(0, 6)}`;
    const newPlayer: PlayerInfo = {
      id: playerId,
      name: playerProfile.name || `Player ${room.players.length + 1}`,
      avatar: playerProfile.avatar || '🀄',
      avatarColor: playerProfile.color || '#D99B26',
      isHost: false,
      score: 0,
      matchedPairs: 0,
      maxCombo: 0,
      currentCombo: 0,
      progressPercent: 0,
      isFinished: false,
      connected: true
    };

    room.players.push(newPlayer);
    this.socketToPlayer.set(socket.id, { roomId: upperCode, playerId });
    socket.join(upperCode);

    return { success: true, room };
  }

  public startGame(roomId: string, hostPlayerId: string): { success: boolean; room?: RoomState; board?: BoardTile[]; error?: string } {
    const room = this.rooms.get(roomId);
    if (!room) return { success: false, error: 'Room not found' };
    if (room.hostId !== hostPlayerId) return { success: false, error: 'Only room host can start the game' };

    room.isStarted = true;
    room.startTime = Date.now();

    // Generate shared seed board
    const genResult = generateSolvableBoard(room.levelId, room.seed);
    room.sharedBoard = genResult.board;

    if (room.mode === 'CLASH_SHARED') {
      room.activePlayerIndex = 0;
      room.turnTimeRemaining = 15;
      this.startClashTurnTimer(roomId);
    }

    return { success: true, room, board: genResult.board };
  }

  // Mode 2: 15-second Turn Timer Loop
  private startClashTurnTimer(roomId: string) {
    if (this.turnIntervals.has(roomId)) {
      clearInterval(this.turnIntervals.get(roomId)!);
    }

    const interval = setInterval(() => {
      const room = this.rooms.get(roomId);
      if (!room || !room.isStarted || room.isFinished) {
        clearInterval(interval);
        this.turnIntervals.delete(roomId);
        return;
      }

      if (room.turnTimeRemaining && room.turnTimeRemaining > 1) {
        room.turnTimeRemaining -= 1;
        this.io.to(roomId).emit('CLASH_TIMER_TICK', {
          activePlayerIndex: room.activePlayerIndex,
          turnTimeRemaining: room.turnTimeRemaining
        });
      } else {
        // Turn Timeout -> Rotate to next player with 0 points
        this.rotateClashTurn(roomId);
      }
    }, 1000);

    this.turnIntervals.set(roomId, interval);
  }

  public rotateClashTurn(roomId: string) {
    const room = this.rooms.get(roomId);
    if (!room || !room.isStarted) return;

    room.activePlayerIndex = ((room.activePlayerIndex || 0) + 1) % room.players.length;
    room.turnTimeRemaining = 15;

    this.io.to(roomId).emit('CLASH_TURN_CHANGED', {
      activePlayerIndex: room.activePlayerIndex,
      turnTimeRemaining: 15,
      room
    });
  }

  // Mode 2: Player made a pair move
  public handleClashMove(
    roomId: string,
    playerId: string,
    tileId1: string,
    tileId2: string
  ): boolean {
    const room = this.rooms.get(roomId);
    if (!room || !room.isStarted || !room.sharedBoard) return false;

    const activeIndex = room.activePlayerIndex || 0;
    const activePlayer = room.players[activeIndex];
    if (activePlayer?.id !== playerId) return false;

    // Calculate score: 100 base + (remainingSeconds * 10)
    const bonus = (room.turnTimeRemaining || 0) * 10;
    const pointsEarned = 100 + bonus;

    activePlayer.score += pointsEarned;
    activePlayer.matchedPairs += 1;

    // Mark matched on shared board
    room.sharedBoard = room.sharedBoard.map((t: BoardTile) => 
      (t.id === tileId1 || t.id === tileId2) ? { ...t, isMatched: true, isFree: false } : t
    );

    const remaining = room.sharedBoard.filter((t: BoardTile) => !t.isMatched);
    const isBoardCleared = remaining.length === 0;

    if (isBoardCleared) {
      room.isFinished = true;
      if (this.turnIntervals.has(roomId)) {
        clearInterval(this.turnIntervals.get(roomId)!);
        this.turnIntervals.delete(roomId);
      }
      this.io.to(roomId).emit('GAME_OVER', { room });
      return true;
    }

    // Rotate turn and reset timer
    room.activePlayerIndex = (activeIndex + 1) % room.players.length;
    room.turnTimeRemaining = 15;

    this.io.to(roomId).emit('CLASH_MOVE_MADE', {
      playerId,
      tileId1,
      tileId2,
      pointsEarned,
      nextPlayerIndex: room.activePlayerIndex,
      turnTimeRemaining: 15,
      board: room.sharedBoard,
      room
    });

    return true;
  }

  // Mode 3: Player updated sprint progress
  public handleSprintProgress(
    roomId: string,
    playerId: string,
    data: { matchedPairs: number; progressPercent: number; score: number; currentCombo: number; isFinished: boolean }
  ) {
    const room = this.rooms.get(roomId);
    if (!room || !room.isStarted) return;

    const player = room.players.find((p: PlayerInfo) => p.id === playerId);
    if (player) {
      player.matchedPairs = data.matchedPairs;
      player.progressPercent = data.progressPercent;
      player.score = data.score;
      player.currentCombo = data.currentCombo;
      player.isFinished = data.isFinished;

      if (data.isFinished && !player.finishTime) {
        player.finishTime = Date.now();
      }

      this.io.to(roomId).emit('SPRINT_PROGRESS_UPDATE', {
        playerId,
        players: room.players
      });

      // If all players finished
      if (room.players.every((p: PlayerInfo) => p.isFinished)) {
        room.isFinished = true;
        this.io.to(roomId).emit('GAME_OVER', { room });
      }
    }
  }

  public handleDisconnect(socketId: string) {
    const mapping = this.socketToPlayer.get(socketId);
    if (!mapping) return;

    const { roomId, playerId } = mapping;
    const room = this.rooms.get(roomId);
    if (room) {
      const player = room.players.find((p: PlayerInfo) => p.id === playerId);
      if (player) {
        player.connected = false;
      }

      const connected = room.players.filter((p: PlayerInfo) => p.connected);
      if (connected.length === 0) {
        if (this.turnIntervals.has(roomId)) {
          clearInterval(this.turnIntervals.get(roomId)!);
          this.turnIntervals.delete(roomId);
        }
        this.rooms.delete(roomId);
      } else {
        this.io.to(roomId).emit('ROOM_UPDATE', { room });
      }
    }

    this.socketToPlayer.delete(socketId);
  }
}
