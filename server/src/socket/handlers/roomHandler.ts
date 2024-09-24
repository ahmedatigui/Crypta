import { Socket, Server } from 'socket.io';
import { getUsersInfo } from '../../lib/helpers';

export function handleRooms(socket: Socket, io: Server) {
  // Join a room
  socket.on('joinRoom', async ({ username, status, roomName }: { username: string, status: string, roomName: string }) => {
    socket.data.username = username;
    socket.data.status = status;
    socket.join(roomName);
    console.log(`User ${socket.id}(${username}, ${status}) joined room ${roomName}`);

    io.to(roomName).emit('userJoined', `${username} has joined ${roomName}`);


    const usersInfo = await getUsersInfo(io, roomName);
    console.log("SOCKETSIDs: ", usersInfo);
    io.to(roomName).emit('usersList', usersInfo); 
  });

  // Leave a room
  socket.on('leaveRoom', async ({ username, roomName }: { username: string, roomName: string }) => {
    socket.leave(roomName);
    console.log(`User ${socket.id}(${username})left room ${roomName}`);

    io.to(roomName).emit('userLeft', `${username} has left ${roomName}`);

    const usersInfo = await getUsersInfo(io, roomName);
    console.log("SOCKETSIDS: ", usersInfo);
    io.to(roomName).emit('usersList', usersInfo);
  });

}
