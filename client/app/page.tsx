"use client";

import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function ChatJoinPage() {
  const [username, setUsername] = useState('');
  const [room, setRoom] = useState('');
  const router = useRouter();

  const generateRandomRoom = () => {
    const randomRoom = Math.random().toString(36).substring(2, 8).toUpperCase();
    setRoom(randomRoom);
  };

  const handleJoin = () => {
    // Handle join logic here
    console.log('Joining chat with:', { username, room });
    if(room) router.push(`/space/${room}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Join Chat</CardTitle>
          <CardDescription className="text-center">Enter your details to join a chat room</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input 
              id="username" 
              placeholder="Enter your username" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="room">Room</Label>
            <div className="flex space-x-2">
              <Input 
                id="room" 
                placeholder="Enter room name or generate" 
                value={room}
                onChange={(e) => setRoom(e.target.value)}
              />
              <Button onClick={generateRandomRoom} variant="outline">
                Random
              </Button>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={handleJoin}>
            Join Chat
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
