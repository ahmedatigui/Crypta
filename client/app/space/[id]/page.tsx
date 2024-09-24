"use client"

import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { Rocket, Users } from 'lucide-react';
import Peer from 'simple-peer';
import { toast } from "sonner"


import { socket } from "@/socket";
import { useUserStore } from "@/lib/store/userStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserCard } from "@/components/UserCard";
import { IncomingRequestDialog } from "@/components/IncomingRequest";
import { SocketInitRequest, SocketInitResponse, SocketInit, User } from "@/lib/types";


export default function SpacePage({ params }: { params: { id: string } }) {
  const roomId = params.id;
  const peerRef = useRef();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [request, setRequest] = useState<SocketInitRequest>();
  const [response, setResponse] = useState<SocketInitResponse>();
  const [reqAccepted, setReqAccept] = useState(false);
  const [connected, setConnected] = useState(false);

  const username = useUserStore((state) => state.username);
  const updateRoom = useUserStore((state) => state.updateRoom);
  const updateUserId = useUserStore((state) => state.updateId);
  const userId = useUserStore((state) => state.id);

  console.log(roomId)


  const sendRequest = (user, file) => {
    socket.emit("changeStatus", { user: socket.id, status: 'busy', roomName: roomId });
    const peer = new Peer({ 
      initiator: true,
      trickle: false,
      config: {
        iceServers: [
            {urls: 'stun:stun.l.google.com:19302'},
            {urls: 'stun:stun1.l.google.com:19302'},
            {urls: 'stun:stun2.l.google.com:19302'},
            {urls: 'stun:stun3.l.google.com:19302'},
            {urls: 'stun:stun4.l.google.com:19302'},
        ],
      }
    });
    console.log("PEER from sendRequest: ", peer);
    peer.on('signal', (data) => {
      console.log("Here is offer signal", data);
      console.log('requestToSocket', { roomName: roomId , sender: { id: socket.id, username: username }, receiver: { id: user.id, username: user.name }, signal: data, file: { name: file.name, type: file.type, size: file.size } }); 
      socket.emit('requestToSocket', { roomName: roomId , sender: { id: socket.id, username: username }, receiver: { id: user.id, username: user.name }, signal: data, file: { name: file.name, type: file.type, size: file.size } });
      toast.info(`Sent a request to ${user.name}`, { duration: 2000 });
    });


    const chunkSize = 16 * 1024; // 16KB per chunk
    let offset = 0;
    peer.on('connect', () => {
      setConnected(true);
      console.log("Connected!");
      toast.success("Connected!", { duration: 2000 });

      async function sendFile(){
        const chunk = file.slice(offset, offset + chunkSize);
        if (chunk.size === 0){
          peer.send("DONE");
          toast.dismiss(sendingToast);
          toast.success(`${file.name} has been Sent!`, { duration: 5000 });
          stopRTCConnection();
          socket.emit("changeStatus", { user: socket.id, status: 'available', roomName: roomId });
          return;
        }

        try {
          const arrayBuffer = await chunk.arrayBuffer();
          peer.send(arrayBuffer);

          offset += chunkSize;

          setTimeout(sendFile, 10);
        } catch (error) {
          console.error('Error reading chunk:', error);
        }
      }

      sendFile();
      const sendingToast = toast.loading(`Sending "${file.name}"`, {
        action: {
          label: 'Cancel',
          onClick: () => cancelSharingEvent({ roomName: roomId, sender: { id: socket.id, username: username }, receiver: { id: user.id, username: user.name } })
        }
      });


    });




    peerRef.current = peer;
    console.log('peerRef.current', peerRef.current);
  }

  const acceptRequest = () => {
    socket.emit("changeStatus", { user: socket.id, status: 'busy', roomName: roomId });
    const peer = new Peer({ initiator: false, trickle: false });
    console.log("PEER from acceptRequest: ", peer);
    peer.on('signal', (data) => {
      console.log("Here is dest signal", data);
      console.log('responseToSocket', { roomName: roomId , sender: { id: socket.id, username: username }, receiver: { id: request.sender.id, username: request.sender.username }, signal: data, accepted: true });
      socket.emit('responseToSocket', { roomName: roomId , sender: { id: socket.id, username: username }, receiver: { id: request.sender.id, username: request.sender.username }, signal: data, accepted: true });
    });

    let receivingToast;
    peer.on('connect', () => {
      setConnected(true);
      console.log("Connected!");
      toast.success("Connected!", { duration: 2000 });
      receivingToast = toast.loading(`Receiving "${request.file.name}"`, {
        action: { 
          label: 'Cancel', 
          onClick: () => cancelSharingEvent({ roomName: roomId, sender: { id: socket.id, username: username }, receiver: { id: request.sender.id, username: request.sender.username } }) 
        }
      });
    });


    let receivedChunks = [];
    let receivedFileSize = 0;
    peer.on('data', (data) => {
      const decdata = new TextDecoder().decode(data);
      console.log("DATA: ", data);
      //console.log("SIG: ",  decdata);

      if (decdata === "DONE"){
          toast.dismiss(receivingToast);
          stopRTCConnection();
          const receivedBlob = new Blob(receivedChunks);
          const url = URL.createObjectURL(receivedBlob);
          console.log("URL: ", url);
          const a = document.createElement('a');
          a.href = url;
          a.download = request.file.name;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);

          URL.revokeObjectURL(url);
          receivedChunks = [];
          socket.emit("changeStatus", { user: socket.id, status: 'available', roomName: roomId });
      } else {
        receivedChunks.push(data);
        receivedFileSize += data.byteLength;

        console.log(`Received chunk: ${data.byteLength} bytes, Total: ${receivedFileSize} bytes`);
      }
    });

    peer.signal(request.signal);

    peerRef.current = peer;
    console.log('peerRef.current', peerRef.current);
  }

  const stopRTCConnection = () => {
    if (peerRef.current){
      console.log("STOPPING RTC CONNECTION")
      peerRef.current.removeAllListeners();
      peerRef.current.destroy();
      toast.dismiss();
      socket.emit("changeStatus", { user: socket.id, status: 'available', roomName: roomId });
    }
  }

  const cancelSharingEvent = (info) => {
    stopRTCConnection();
    socket.emit('cancelSharingEvent', info);
  }

  const onOpenChange = () => {};
  const onAccept = () => {
    console.log("request: ", request);
    acceptRequest();


    setReqAccept(true);
    setIsOpen(false);
    console.log("Request Accepted");
  }
  const onReject = () => {
    setReqAccept(false);
    setIsOpen(false);
    console.log("Request Rejected");
    socket.emit('responseToSocket', { roomName: roomId , sender: { id: socket.id, username: username }, receiver: { id: request.sender.id, username: request.sender.username }, signal: null, accepted: false }); 
  };


  useEffect(() => {
    if (!username) router.push('/');
    updateRoom(roomId);

    console.info("WS: connecting...");
    socket.connect();

    socket.emit('joinRoom', { roomName: roomId, status: 'available', username });
    socket.emit('sendToRoom', { roomName: roomId, sender: username, message: `Hello, ${roomId} peeps!` });


    return () => {
      console.log("Leaving room...");
      socket.emit('leaveRoom', { roomName: roomId, username });
      stopRTCConnection();
      console.info("WS: disconnecting...");
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    socket.on('connect', () => {
      updateUserId(socket.id);
    })

    socket.on('userJoined', (message) => {
      console.log(message);
    });

    socket.on('userLeft', (message) => {
      console.log(message);
    });

    socket.on('roomMessage', ({ roomName, message, sender }) => {
      console.log(`Message in ${roomName} from ${sender}: ${message}`);
    });

    socket.on('requestMessage', (req: SocketInitRequest) => {
      if(req.receiver.id === socket.id){
        console.log("Request received: ", req);
        toast.info(`Request received from ${req.sender.username}`, { duration: 2000 });
        setRequest(req);
        setIsOpen(true);
      }
    });

    socket.on('responseToRequest', (res: SocketInitResponse) => {
      if(res.receiver.id === socket.id){
        setResponse(res);
        console.log("Response received: ", res);
        if (res.accepted) {
          console.log("Did it connect?");
          console.log("here is the peerRef", peerRef.current);
          toast.success(`Request to ${res.sender.username} is Accepted!`, { duration: 2000 });
          peerRef.current.signal(res.signal);
        } else {
          toast.error(`Request to ${res.sender.username} is Rejected!`, { duration: 2000 });
        }
      }
    });

    socket.on('sharingEventCanceled', (info: SocketInit) => {
      stopRTCConnection();
      toast.error(`Sharing is canceled by ${info.sender.username}`);
    })

    socket.on('usersList', (usersInfo) => {
      console.log(usersInfo);
      console.log(userId);
      const users = usersInfo.map(user => ({id: user.id, name: socket.id === user.id ? `(You) ${user.username}` : user.username, status: user.status, avatarUrl: `https://robohash.org/${user.username}`}));
      console.log(users);
      setUsers([...users]);
    });

    return () => {
      socket.off('connect', () => updateUserId(socket.id))
      socket.off('userJoined', (message) => console.log(message));
      socket.off('userLeft', (message) => console.log(message));
      socket.off('roomMessage', ({ roomName, message, sender }) => {
        console.log(`Message in ${roomName} from ${sender}: ${message}`); 
      });
      socket.off('usersList', (usersInfo) => {
        console.log(usersInfo);
        const mu = usersInfo.map(user => ({id: user.id, name: userId === user.id ? `(You)${user.username}` : user.username, status: 'online', avatarUrl: `https://robohash.org/${user.username}`}));
        console.log(mu);
        //setUsers([...mu]);
      });
      socket.off('responseToRequest', (res: SocketInitResponse) => {
        if(res.receiver.id === socket.id){
          console.log("Response received: ", res);
          //setResponse(res);
          if (res.accepted) {
            //peer.current.signal(res.signal);
          }
        }
      });
      socket.off('sharingEventCanceled', (info: SocketInit) => {
        stopRTCConnection();
        toast.error(`Sharing is canceled by ${info.sender.username}`);
      })
    }
  }, []);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-semibold mb-6 flex items-center text-gray-800">
        <Rocket className="mr-2 h-8 w-8 text-blue-600" /> Space: {roomId}
      </h1>
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-xl flex items-center text-gray-700">
            <Users className="mr-2 h-6 w-6" /> Connected Users
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {users.map((user) => (
              <UserCard key={user.id} user={user} roomName={roomId} sendRequest={sendRequest} />
            ))}
          </div>
        </CardContent>
      </Card>
      <IncomingRequestDialog isOpen={isOpen} onOpenChange={onOpenChange} request={request} onAccept={onAccept} onReject={onReject} />
    </div>
  );
}
