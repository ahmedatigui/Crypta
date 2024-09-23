import { Server } from 'socket.io';

export const getUsersInfo = async (io: Server, roomName: string) => {
  const sockets = await io.in(roomName).fetchSockets();
  const usersInfo = sockets.map((socket) => ({
    username: socket.data.username,
    status: socket.data.status,
    id: socket.id,
  }));
  return usersInfo;
};
