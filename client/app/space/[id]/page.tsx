"use client"

import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { Rocket, Users } from 'lucide-react';
import Peer from 'simple-peer';


import { socket } from "@/socket";
import { useUserStore } from "@/lib/store/userStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserCard } from "@/components/UserCard";
import { IncomingRequestDialog } from "@/components/IncomingRequest";
import { SocketInitRequest, SocketInitResponse, User } from "@/lib/types";


export default function SpacePage({ params }: { params: { id: string } }) {
  const roomId = params.id;
  const peerRef = useRef();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [request, setRequest] = useState<SocketInitRequest>();
  const [response, setResponse] = useState<SocketInitResponse>();
  const [reqAccepted, setReqAccept] = useState(false);
  const username = useUserStore((state) => state.username);
  const updateRoom = useUserStore((state) => state.updateRoom);
  const updateUserId = useUserStore((state) => state.updateId);
  const userId = useUserStore((state) => state.id);

  console.log(roomId)


  const sendRequest = (user) => {
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
      console.log('requestToSocket', { roomName: roomId , sender: { id: socket.id, username: username }, receiver: { id: user.id, username: user.name }, signal: data }); 
      socket.emit('requestToSocket', { roomName: roomId , sender: { id: socket.id, username: username }, receiver: { id: user.id, username: user.name }, signal: data });
    });

    peer.on('connect', () => {
      console.log("Connected!");
    });

    peerRef.current = peer;
    console.log('peerRef.current', peerRef.current);
  }

  const acceptRequest = () => {
    const peer = new Peer({ initiator: false, trickle: false });
    console.log("PEER from acceptRequest: ", peer);
    peer.on('signal', (data) => {
      console.log("Here is dest signal", data);
      console.log('responseToSocket', { roomName: roomId , sender: { id: socket.id, username: username }, receiver: { id: request.sender.id, username: request.sender.username }, signal: data, accepted: true });
      socket.emit('responseToSocket', { roomName: roomId , sender: { id: socket.id, username: username }, receiver: { id: request.sender.id, username: request.sender.username }, signal: data, accepted: true });
    });

    peer.on('connect', () => {
      console.log("Connected!");
    });

    peer.signal(request.signal);

    peerRef.current = peer;
    console.log('peerRef.current', peerRef.current);
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
    socket.emit('responseToSocket', { roomName: roomId , receiver: { id: request.sender.id, username: request.sender.username }, sender: { id: socket.id, username: username }, accepted: false });
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
        setRequest(req);
        setIsOpen(true);
      }
    });

    socket.on('responseToRequest', (res: SocketInitResponse) => {
      if(res.receiver.id === socket.id){
        setResponse(res);
        console.log("Response received: ", response);
        if (res.accepted) {
          console.log("Did it connect?");
          console.log("here is the peerRef", peerRef.current);
          peerRef.current.signal(res.signal);
        }
      }
    });

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
