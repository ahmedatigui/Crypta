import { Socket, Server } from 'socket.io';
import { getUsersInfo } from '../../utils/helpers';

export function handleStatus(socket: Socket, io: Server) {

  socket.on("changeStatus", async ({ user, status, roomName }: { user: string; status: string; roomName: string }) => {
    socket.data.status = status;

    const usersInfo = await getUsersInfo(io, roomName);
    console.log("SOCKETSIDS: ", usersInfo);
    io.to(roomName).emit('usersList', usersInfo);
  })

}
