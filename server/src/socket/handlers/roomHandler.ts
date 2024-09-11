import { Socket } from 'socket.io';

export function handleRooms(socket: Socket) {
  // Join a room
  socket.on('joinRoom', async (roomName: string) => {
    socket.join(roomName);
    console.log(`User ${socket.id} joined room ${roomName}`);

    socket.to(roomName).emit('userJoined', `A new user has joined ${roomName}`);

    //const sockets = await socket.in(roomName).fetchSockets();
    //socket.to(roomName).emit('usersList', { numUsers: sockets.length, users: sockets });
  });

  // Leave a room
  socket.on('leaveRoom', async (roomName: string) => {
    socket.leave(roomName);
    console.log(`User ${socket.id} left room ${roomName}`);

    socket.to(roomName).emit('userLeft', `A user has left ${roomName}`);

    //const sockets = await socket.in(roomName).fetchSockets(); console.log("USERS: ", sockets);
    //socket.to(roomName).emit('usersList', { numUsers: sockets.length, users: sockets });
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
