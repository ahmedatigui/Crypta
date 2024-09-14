"use client"

import { useState, useEffect } from 'react';


import { socket } from "@/socket.ts";
import { useUserStore } from "@/lib/store/userStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

type User = {
  id: string;
  name: string;
  status: 'online' | 'offline' | 'away';
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

    socket.emit('joinRoom', { roomName: roomId, username });
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

    socket.on('usersList', (usersInfo) => {
      console.log(usersInfo);
      console.log(userId);
      const users = usersInfo.map(user => ({id: user.id, name: socket.id === user.id ? `(You) ${user.username}` : user.username, status: 'online', avatarUrl: `https://robohash.org/${user.username}`}));
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
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Space: {roomId}</h1>
      <Card>
        <CardHeader>
          <CardTitle>Connected Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {users.map((user) => (
              <div key={user.id} className="flex items-center space-x-4">
                <Avatar>
                  <AvatarImage src={user.avatarUrl} alt={user.name} />
                  <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{user.name}</p>
                  <Badge variant={user.status === 'online' ? 'default' : 'secondary'}>
                    {user.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
