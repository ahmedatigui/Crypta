"use client"

import { useState, useEffect } from 'react';

// socket
import { socket } from "../../../socket.ts";

// components
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

// Mock function to fetch users - replace with actual API call
const fetchUsers = async (spaceId: string) => {
  // Simulating API call
  await new Promise(resolve => setTimeout(resolve, 1000));
  return [
    { id: '1', name: 'Alice', status: 'online', avatarUrl: 'https://example.com/alice.jpg' },
    { id: '2', name: 'Bob', status: 'offline', avatarUrl: 'https://example.com/bob.jpg' },
    { id: '3', name: 'Charlie', status: 'away', avatarUrl: 'https://example.com/charlie.jpg' },
  ];
};

type User = {
  id: string;
  name: string;
  status: 'online' | 'offline' | 'away';
  avatarUrl: string;
};

export default function SpacePage({ params }: { params: { id: string } }) {
  const id = params.id;
  const [users, setUsers] = useState<User[]>([]);

  console.log(id)
  useEffect(() => {
    if (id) {
      fetchUsers(id as string).then(setUsers);
    }
  }, [id]);

  useEffect(() => {
    // no-op if the socket is already connected
    console.info("WS: connecting...");
    socket.connect();

    return () => {
      console.info("WS: disconnecting...");
      socket.disconnect();
    };
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Space: {id}</h1>
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
