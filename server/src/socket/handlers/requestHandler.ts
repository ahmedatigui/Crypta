import { Socket, Server } from 'socket.io';
import { SocketInitRequest, SocketInitResponse, SignalReqRes, SocketInit } from '../../lib/types';

export function handleRequest(socket: Socket, io: Server) {

  socket.on('sendToRoom', ({ roomName, sender, message }: { roomName: string; sender: string; message: string }) => { 
    socket.to(roomName).emit('roomMessage', {
      roomName,
      message,
      sender
    });
  });

  socket.on('requestToSocket', (socketInitRequest: SocketInitRequest) => {
    console.log("req to socket: ", socketInitRequest);
    socket.to(socketInitRequest.roomName).emit('requestMessage', socketInitRequest);
  });

  socket.on('responseToSocket', (socketInitResponse: SocketInitResponse) => {
    console.log("res to socket: ", socketInitResponse);
    socket.to(socketInitResponse.roomName).emit('responseToRequest', socketInitResponse);
  });

  socket.on('sendSignal', (signalReqRes: SignalReqRes ) => {
    console.log("received signal: ", signalReqRes);
    socket.to(signalReqRes.roomName).emit('receiveSignal', signalReqRes);
  });

  socket.on('cancelSharingEvent', (info: SocketInit) => {
    console.log("Sharing Canceled: ", info);
    socket.to(info.roomName).emit('sharingEventCanceled', info);

  });

}
