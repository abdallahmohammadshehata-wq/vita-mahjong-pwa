import Peer, { DataConnection } from 'peerjs';
import { GameMode, RoomState, PlayerInfo } from '../types/multiplayer';
import { BoardTile } from '../types/mahjong';
import { generateSolvableBoard } from './generator';

export type P2PEventType = 
  | 'ROOM_UPDATE' 
  | 'GAME_START' 
  | 'CLASH_TURN_CHANGED' 
  | 'CLASH_MOVE_MADE' 
  | 'SPRINT_PROGRESS_UPDATE' 
  | 'GAME_OVER' 
  | 'ERROR';

class P2PMultiplayerManager {
  private peer: Peer | null = null;
  private connections: Map<string, DataConnection> = new Map();
  private hostConnection: DataConnection | null = null;
  private broadcastChannel: BroadcastChannel | null = null;
  
  public isHost: boolean = false;
  public myPlayerId: string = localStorage.getItem('vita_player_id') || `p_${Math.random().toString(36).substring(2, 8)}`;
  public currentRoom: RoomState | null = null;
  private listeners: Map<P2PEventType, Array<(data: any) => void>> = new Map();

  constructor() {
    localStorage.setItem('vita_player_id', this.myPlayerId);
    
    // BroadcastChannel for instant same-browser cross-tab sync
    if (typeof BroadcastChannel !== 'undefined') {
      this.broadcastChannel = new BroadcastChannel('vita_mahjong_p2p_bus');
      this.broadcastChannel.onmessage = (e) => {
        this.handleIncomingMessage(e.data);
      };
    }
  }

  public on(event: P2PEventType, cb: (data: any) => void) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(cb);
  }

  public off(event: P2PEventType, cb: (data: any) => void) {
    const list = this.listeners.get(event);
    if (!list) return;
    this.listeners.set(event, list.filter(c => c !== cb));
  }

  private emit(event: P2PEventType, data: any) {
    const list = this.listeners.get(event);
    if (list) {
      list.forEach(cb => cb(data));
    }
  }

  private broadcast(type: string, payload: any) {
    const message = { type, payload, senderId: this.myPlayerId };
    
    this.connections.forEach(conn => {
      if (conn.open) {
        conn.send(message);
      }
    });

    if (this.hostConnection && this.hostConnection.open) {
      this.hostConnection.send(message);
    }

    if (this.broadcastChannel) {
      this.broadcastChannel.postMessage(message);
    }
  }

  // Create Room as Host
  public async createRoom(mode: GameMode, hostProfile: { name: string; avatar: string }): Promise<RoomState> {
    this.isHost = true;
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    const hostPlayer: PlayerInfo = {
      id: this.myPlayerId,
      name: hostProfile.name || 'Master Player',
      avatar: hostProfile.avatar || '🀄',
      avatarColor: '#15803D',
      isHost: true,
      score: 0,
      currentCombo: 1,
      maxCombo: 1,
      matchedPairs: 0,
      progressPercent: 0,
      isFinished: false,
      connected: true
    };

    const room: RoomState = {
      roomId: code,
      hostId: this.myPlayerId,
      mode,
      players: [hostPlayer],
      status: 'WAITING',
      isStarted: false,
      isFinished: false,
      levelId: 10,
      seed: Math.floor(Math.random() * 100000),
      activePlayerIndex: 0,
      boardState: []
    };

    this.currentRoom = room;

    try {
      const peerId = `vitamahjong-room-${code.toLowerCase()}`;
      this.peer = new Peer(peerId, {
        config: {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:global.stun.twilio.com:3478' }
          ]
        }
      });

      this.peer.on('open', (id) => {
        console.log('P2P Host registered on PeerJS with ID:', id);
      });

      this.peer.on('connection', (conn) => {
        conn.on('open', () => {
          this.connections.set(conn.peer, conn);
          conn.send({ type: 'ROOM_UPDATE', payload: { room: this.currentRoom } });
        });

        conn.on('data', (data: any) => {
          this.handleIncomingMessage(data);
        });

        conn.on('close', () => {
          this.connections.delete(conn.peer);
        });
      });

      this.peer.on('error', (err) => {
        console.warn('PeerJS Host warning:', err);
      });
    } catch (e) {
      console.warn('P2P signaling fallback to local bus:', e);
    }

    this.emit('ROOM_UPDATE', { room });
    return room;
  }

  // Join Room by 6-character Code
  public async joinRoom(roomCode: string, playerProfile: { name: string; avatar: string }): Promise<RoomState> {
    this.isHost = false;
    const cleanCode = roomCode.trim().toUpperCase();

    const joinPlayer: PlayerInfo = {
      id: this.myPlayerId,
      name: playerProfile.name || 'Challenger',
      avatar: playerProfile.avatar || '🀄',
      avatarColor: '#B45309',
      isHost: false,
      score: 0,
      currentCombo: 1,
      maxCombo: 1,
      matchedPairs: 0,
      progressPercent: 0,
      isFinished: false,
      connected: true
    };

    try {
      const clientPeerId = `vitamahjong-client-${this.myPlayerId}-${Math.random().toString(36).substring(2, 6)}`;
      this.peer = new Peer(clientPeerId, {
        config: {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:global.stun.twilio.com:3478' }
          ]
        }
      });

      this.peer.on('open', () => {
        const targetHostId = `vitamahjong-room-${cleanCode.toLowerCase()}`;
        const conn = this.peer!.connect(targetHostId);
        this.hostConnection = conn;

        conn.on('open', () => {
          console.log('Connected to Host Peer:', targetHostId);
          conn.send({
            type: 'PLAYER_JOIN',
            payload: { player: joinPlayer, roomId: cleanCode }
          });
        });

        conn.on('data', (data: any) => {
          this.handleIncomingMessage(data);
        });

        conn.on('error', (err) => {
          console.warn('Host connection error:', err);
        });
      });
    } catch (e) {
      console.warn('Peer join fallback:', e);
    }

    this.broadcast('PLAYER_JOIN', { player: joinPlayer, roomId: cleanCode });

    const fallbackRoom: RoomState = {
      roomId: cleanCode,
      hostId: 'host-player',
      mode: 'CLASH_SHARED',
      status: 'WAITING',
      isStarted: false,
      isFinished: false,
      levelId: 10,
      seed: 12345,
      players: [
        {
          id: 'host-player',
          name: 'Master Host',
          avatar: '🐉',
          avatarColor: '#B91C1C',
          isHost: true,
          score: 0,
          currentCombo: 1,
          maxCombo: 1,
          matchedPairs: 0,
          progressPercent: 0,
          isFinished: false,
          connected: true
        },
        joinPlayer
      ],
      activePlayerIndex: 0,
      boardState: []
    };

    this.currentRoom = fallbackRoom;
    this.emit('ROOM_UPDATE', { room: fallbackRoom });
    return fallbackRoom;
  }

  // Add AI Bot (Host action)
  public addBot(): RoomState | null {
    if (!this.currentRoom || !this.isHost) return null;
    const BOT_TEMPLATES = [
      { name: 'Master Chen (AI)', avatar: '🐉', color: '#B91C1C' },
      { name: 'Grandmaster Wu (AI)', avatar: '🥋', color: '#D97706' },
      { name: 'Lin (Novice AI)', avatar: '🌸', color: '#059669' },
      { name: 'Jade Phoenix (AI)', avatar: '🦚', color: '#0284C7' }
    ];

    const botIdx = this.currentRoom.players.length - 1;
    const template = BOT_TEMPLATES[botIdx % BOT_TEMPLATES.length];
    const botPlayer: PlayerInfo = {
      id: `bot-${Date.now()}-${botIdx}`,
      name: template.name,
      avatar: template.avatar,
      avatarColor: template.color,
      isHost: false,
      score: 0,
      currentCombo: 1,
      maxCombo: 1,
      matchedPairs: 0,
      progressPercent: 0,
      isFinished: false,
      connected: true
    };

    const updatedRoom: RoomState = {
      ...this.currentRoom,
      players: [...this.currentRoom.players, botPlayer]
    };

    this.currentRoom = updatedRoom;
    this.broadcast('ROOM_UPDATE', { room: updatedRoom });
    this.emit('ROOM_UPDATE', { room: updatedRoom });
    return updatedRoom;
  }

  // Start Game (Host action)
  public startGame(): { room: RoomState; board: BoardTile[] } | null {
    if (!this.currentRoom || !this.isHost) return null;

    const boardResult = generateSolvableBoard(this.currentRoom.levelId || 10);
    const updatedRoom: RoomState = {
      ...this.currentRoom,
      status: 'PLAYING',
      isStarted: true,
      boardState: boardResult.board,
      activePlayerIndex: 0
    };

    this.currentRoom = updatedRoom;
    const payload = { room: updatedRoom, board: boardResult.board };
    this.broadcast('GAME_START', payload);
    this.emit('GAME_START', payload);
    return payload;
  }

  // Make Clash Move
  public sendClashMove(tileId1: string, tileId2: string, newBoard: BoardTile[], pointsEarned: number) {
    if (!this.currentRoom) return;
    const activeIdx = this.currentRoom.activePlayerIndex || 0;
    const nextIdx = (activeIdx + 1) % this.currentRoom.players.length;

    const updatedPlayers = this.currentRoom.players.map((p, idx) => 
      idx === activeIdx ? { ...p, score: p.score + pointsEarned } : p
    );

    const updatedRoom: RoomState = {
      ...this.currentRoom,
      players: updatedPlayers,
      activePlayerIndex: nextIdx,
      boardState: newBoard
    };

    this.currentRoom = updatedRoom;
    this.broadcast('CLASH_MOVE_MADE', { board: newBoard, room: updatedRoom, pointsEarned });
    this.emit('CLASH_MOVE_MADE', { board: newBoard, room: updatedRoom, pointsEarned });
  }

  // Send Speed Sprint Progress
  public sendSprintProgress(matchedPairs: number, progressPercent: number, score: number, currentCombo: number, isFinished: boolean) {
    if (!this.currentRoom) return;
    const updatedPlayers = this.currentRoom.players.map(p => 
      p.id === this.myPlayerId 
        ? { ...p, matchedPairs, progressPercent, score, currentCombo, isFinished } 
        : p
    );

    const updatedRoom = { ...this.currentRoom, players: updatedPlayers };
    this.currentRoom = updatedRoom;
    this.broadcast('SPRINT_PROGRESS_UPDATE', { players: updatedPlayers });
    this.emit('SPRINT_PROGRESS_UPDATE', { players: updatedPlayers });
  }

  // Handle incoming message
  private handleIncomingMessage(msg: any) {
    if (!msg || msg.senderId === this.myPlayerId) return;

    switch (msg.type) {
      case 'PLAYER_JOIN':
        if (this.isHost && this.currentRoom) {
          const newPlayer = msg.payload.player;
          if (!this.currentRoom.players.some(p => p.id === newPlayer.id)) {
            const updatedRoom = {
              ...this.currentRoom,
              players: [...this.currentRoom.players, newPlayer]
            };
            this.currentRoom = updatedRoom;
            this.broadcast('ROOM_UPDATE', { room: updatedRoom });
            this.emit('ROOM_UPDATE', { room: updatedRoom });
          }
        }
        break;

      case 'ROOM_UPDATE':
        this.currentRoom = msg.payload.room;
        this.emit('ROOM_UPDATE', msg.payload);
        break;

      case 'GAME_START':
        this.currentRoom = msg.payload.room;
        this.emit('GAME_START', msg.payload);
        break;

      case 'CLASH_MOVE_MADE':
        this.currentRoom = msg.payload.room;
        this.emit('CLASH_MOVE_MADE', msg.payload);
        break;

      case 'SPRINT_PROGRESS_UPDATE':
        if (this.currentRoom) {
          this.currentRoom = { ...this.currentRoom, players: msg.payload.players };
        }
        this.emit('SPRINT_PROGRESS_UPDATE', msg.payload);
        break;
    }
  }
}

export const p2pManager = new P2PMultiplayerManager();
