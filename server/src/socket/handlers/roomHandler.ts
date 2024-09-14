import { Socket, Server } from 'socket.io';

export function handleRooms(socket: Socket, io: Server) {
  // Join a room
  socket.on('joinRoom', async ({ username, roomName }: { username: string, roomName: string }) => {
    socket.data.username = username;
    socket.join(roomName);
    console.log(`User ${socket.id} joined room ${roomName}`);

    io.to(roomName).emit('userJoined', `${username} has joined ${roomName}`);

    const sockets = await io.in(roomName).fetchSockets();
    const usersInfo = sockets.map(socket => ({ username: socket.data.username, id: socket.id }));
    console.log("SOCKETSIDs: ", usersInfo);
    io.to(roomName).emit('usersList', usersInfo); 
  });

  // Leave a room
  socket.on('leaveRoom', async ({ username, roomName }: { username: string, roomName: string }) => {
    socket.leave(roomName);
    console.log(`User ${socket.id} left room ${roomName}`);

    io.to(roomName).emit('userLeft', `${username} has left ${roomName}`);

    const sockets = await io.in(roomName).fetchSockets();
    const usersInfo = sockets.map(socket => ({ username: socket.data.username, id: socket.id }));
    console.log("SOCKETSIDS: ", usersInfo);
    io.to(roomName).emit('usersList', usersInfo);
  });

  // Send a message to a specific room
  socket.on('sendToRoom', ({ roomName, sender, message }: { roomName: string; sender: string; message: string }) => {
    socket.to(roomName).emit('roomMessage', {
      room: roomName,
      message: message,
      sender: sender
    });
  });
}
