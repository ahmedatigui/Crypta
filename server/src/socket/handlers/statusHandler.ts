import { Socket, Server } from 'socket.io';
import { getUsersInfo } from '../../lib/helpers';

export function handleStatus(socket: Socket, io: Server) {

  socket.on("changeStatus", async ({ status, roomName }: { status: string; roomName: string }) => {
    socket.data.status = status;

    const usersInfo = await getUsersInfo(io, roomName);
    console.log("SOCKETSIDS: ", usersInfo);
    io.to(roomName).emit('usersList', usersInfo);
  })

}
