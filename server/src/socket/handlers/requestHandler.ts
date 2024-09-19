import { Socket, Server } from 'socket.io';
import { socketInitRequest } from '../../utils/types';

export function handleRequest(socket: Socket, io: Server) {

  socket.on('sendToRoom', ({ roomName, sender, message }: { roomName: string; sender: string; message: string }) => { 
    socket.to(roomName).emit('roomMessage', {
      roomName,
      message,
      sender
    });
  });

  socket.on('requestToSocket', (socketInitRequest: socketInitRequest) => {
    console.log("req to socket: ", socketInitRequest);
    socket.to(socketInitRequest.roomName).emit('requestMessage', socketInitRequest);
  });

}
