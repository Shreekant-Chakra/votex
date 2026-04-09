import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';

let io: Server;

export const initSocket = (server: HttpServer) => {
  io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('join-election', (electionId: string) => {
      socket.join(electionId);
      console.log(`User ${socket.id} joined election room: ${electionId}`);
    });

    socket.on('leave-election', (electionId: string) => {
      socket.leave(electionId);
      console.log(`User ${socket.id} left election room: ${electionId}`);
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
};
