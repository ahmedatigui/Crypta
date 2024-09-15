import { Socket, Server } from 'socket.io';

export function handleRequest(socket: Socket, io: Server) {

  socket.on('sendToRoom', ({ roomName, sender, message }: { roomName: string; sender: string; message: string }) => { 
    socket.to(roomName).emit('roomMessage', {
      roomName,
      message,
      sender
    });
  });

  socket.on('requestToSocket', ({ roomName, sender, receiver, message }: { roomName: string; sender: string; receiver: string; message: string }) => {
    console.log("req to socket: ", { roomName, sender, receiver, message });
    socket.to(roomName).emit('requestMessage', {
      roomName,
      message,
      sender,
      receiver
    });
  });

}
