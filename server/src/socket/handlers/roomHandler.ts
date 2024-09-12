import { Socket, Server } from 'socket.io';

export function handleRooms(socket: Socket, io: Server) {
  // Join a room
  socket.on('joinRoom', async (roomName: string) => {
    socket.join(roomName);
    console.log(`User ${socket.id} joined room ${roomName}`);

    io.to(roomName).emit('userJoined', `A new user has joined ${roomName}`);

    const sockets = await io.in(roomName).fetchSockets();
    const socketIds = sockets.map(socket => socket.id);
    console.log("SOCKETSIDs: ", socketIds);
    io.to(roomName).emit('usersList', { numUsers: sockets.length, users: socketIds }); 
  });

  // Leave a room
  socket.on('leaveRoom', async (roomName: string) => {
    socket.leave(roomName);
    console.log(`User ${socket.id} left room ${roomName}`);

    io.to(roomName).emit('userLeft', `A user has left ${roomName}`);

    const sockets = await io.in(roomName).fetchSockets();
    const socketIds = sockets.map(socket => socket.id);
    console.log("SOCKETSIDS: ", socketIds);
    io.to(roomName).emit('usersList', { numUsers: sockets.length, users: socketIds });
  });

  // Send a message to a specific room
  socket.on('sendToRoom', ({ roomName, message }: { roomName: string; message: string }) => {
    socket.to(roomName).emit('roomMessage', {
      room: roomName,
      message: message,
      sender: socket.id
    });
  });
}
