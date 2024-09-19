"use client"

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Rocket, Users } from 'lucide-react';
import Peer from 'simple-peer';


import { socket } from "@/socket";
import { useUserStore } from "@/lib/store/userStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserCard } from "@/components/UserCard";
import { IncomingRequestDialog } from "@/components/IncomingRequest";
import { SocketInitRequest, User } from "@/lib/types";


export default function SpacePage({ params }: { params: { id: string } }) {
  const roomId = params.id;
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [request, setRequest] = useState<SocketInitRequest>();
  const [peer, setPeer] = useState();
  const [reqAccepted, setReqAccept] = useState(false);
  const username = useUserStore((state) => state.username);
  const updateRoom = useUserStore((state) => state.updateRoom);
  const updateUserId = useUserStore((state) => state.updateId);
  const userId = useUserStore((state) => state.id);

  console.log(roomId)


  const sendRequest = (user) => {
    const peer = new Peer({ initiator: true });
    peer.on('signal', (data) => {
      console.log("Here is offer signal", data);
      socket.emit('requestToSocket', { roomName: roomId , sender: { id: socket.id, username: username }, receiver: { id: user.id, username: user.name }, sdpOffer: data, message: "Wut up" });
    });

    setPeer(peer);
  }

  const onOpenChange = () => {};
  const onAccept = (data) => {
    console.log("Here is receiver signal", data);
    peer.signal(data);

    setReqAccept(true);
    setIsOpen(false);
    console.log("Request Accepted");
  }
  const onReject = () => {
    setReqAccept(false);
    setIsOpen(false);
    console.log("Request Rejected");
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
    }
  }, [socket]);

  useEffect(() => {
    if(!peer){
      const peer = new Peer({ initiator: true });
      setPeer(peer);
    }

    peer?.on('connect', () => {
      console.log('CONNECT');
    });

    peer?.on('data', (data) => {
      console.log('MESSAGE:', data);
    });

    return () => {
      if (peer) {
        peer.destroy();
      }
    };
  })
  

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
