"use client"

import { useState, useEffect } from 'react';
import { Rocket, Users } from 'lucide-react';


import { socket } from "@/socket";
import { useUserStore } from "@/lib/store/userStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserCard } from "@/components/UserCard";

type User = {
  id: string;
  name: string;
  status: 'available' | 'busy';
  avatarUrl: string;
};

export default function SpacePage({ params }: { params: { id: string } }) {
  const roomId = params.id;
  const [users, setUsers] = useState<User[]>([]);
  const username = useUserStore((state) => state.username);
  const updateRoom = useUserStore((state) => state.updateRoom);
  const updateUserId = useUserStore((state) => state.updateId);
  const userId = useUserStore((state) => state.id);

  console.log(roomId)

  useEffect(() => {
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

    socket.on('requestMessage', ({ roomName, message, sender, receiver }) => {
      if(receiver === socket.id){
        console.log("Request received: ", { roomName, message, sender, receiver });
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
              <UserCard key={user.id} user={user} roomName={roomId} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
