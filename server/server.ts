import express from 'express';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { Server } from 'socket.io';
import cors from 'cors';
import { RoomManager } from '../src/server/roomManager';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DIST_DIR = path.resolve(__dirname, '../dist');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const roomManager = new RoomManager(io);

// Static files serving from dist/ in production
app.use(express.static(DIST_DIR));

// API Info Endpoint
app.get('/api/info', (req, res) => {
  res.json({
    name: 'Vita Mahjong Multiplayer Engine',
    version: '1.0.0',
    status: 'online'
  });
});

// Socket.io Event Handlers
io.on('connection', (socket) => {
  console.log(`[Socket] Client connected: ${socket.id}`);

  socket.on('CREATE_ROOM', (data: { mode: any; profile: any }, callback: (res: any) => void) => {
    try {
      const room = roomManager.createRoom(socket, data.mode, data.profile);
      callback({ success: true, room, playerId: `p_${socket.id.substring(0, 6)}` });
      console.log(`[Room Created] ${room.roomId} (${room.mode}) by ${data.profile.name}`);
    } catch (err: any) {
      callback({ success: false, error: err.message });
    }
  });

  socket.on('JOIN_ROOM', (data: { roomId: string; profile: any }, callback: (res: any) => void) => {
    const result = roomManager.joinRoom(socket, data.roomId, data.profile);
    callback({ ...result, playerId: `p_${socket.id.substring(0, 6)}` });
    if (result.success && result.room) {
      io.to(result.room.roomId).emit('ROOM_UPDATE', { room: result.room });
      console.log(`[Player Joined] ${data.profile.name} -> ${data.roomId}`);
    }
  });

  socket.on('START_GAME', (data: { roomId: string; playerId: string }, callback: (res: any) => void) => {
    const result = roomManager.startGame(data.roomId, data.playerId);
    callback(result);
    if (result.success && result.room) {
      io.to(data.roomId).emit('GAME_START', { room: result.room, board: result.board });
      console.log(`[Game Started] Room ${data.roomId}`);
    }
  });

  socket.on('CLASH_MOVE', (data: { roomId: string; playerId: string; tileId1: string; tileId2: string }) => {
    roomManager.handleClashMove(data.roomId, data.playerId, data.tileId1, data.tileId2);
  });

  socket.on('SPRINT_PROGRESS', (data: { roomId: string; playerId: string; progressData: any }) => {
    roomManager.handleSprintProgress(data.roomId, data.playerId, data.progressData);
  });

  socket.on('disconnect', () => {
    console.log(`[Socket] Client disconnected: ${socket.id}`);
    roomManager.handleDisconnect(socket.id);
  });
});

// Fallback to index.html for client routing
app.get('*', (req, res) => {
  res.sendFile(path.join(DIST_DIR, 'index.html'));
});

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 5050;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`=======================================================`);
  console.log(`🀄 VITA MAHJONG FULL-STACK SERVER IS RUNNING!`);
  console.log(`   Local Server: http://localhost:${PORT}`);
  console.log(`=======================================================`);
});
