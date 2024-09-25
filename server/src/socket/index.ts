import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { Express } from 'express';
import { handleRooms } from './handlers/roomHandler';
import { handleStatus } from './handlers/statusHandler';
import { handleRequest } from './handlers/requestHandler';

export function setupSocketIO(server: HTTPServer, app: Express) {
  const io = new SocketIOServer(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  // Attach io to app
  app.set('io', io);

  io.on('connection', (socket) => {
    console.log(`New connection: ${socket.id}`);

    handleRooms(socket, io);
    handleStatus(socket, io);
    handleRequest(socket);

    socket.on('disconnect', () =>
      console.log(`Connection left (${socket.id})`)
    );
  });

  return io;
}
