import { useState } from "react";
import { Radio } from 'lucide-react';

import { socket } from "@/socket";

import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatusChange } from "@/components/StatusChange";


export const UserCard = ({ user, roomName }) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleRequest = () => {
    console.log({ roomName: roomName , sender: socket.id, receiver: user.id, message: "Wut up" })
    socket.emit('requestToSocket', { roomName: roomName , sender: socket.id, receiver: user.id, message: "Wut up" });
  }


  return (
    <Card className="relative overflow-hidden transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg">
      <div className="absolute top-0 right-0 m-2">
        <Badge 
          variant={user.status === 'available' ? 'default' : 'secondary'}
          className="text-xs px-2 py-1 opacity-70"
        >
          {user.status}
        </Badge>
      </div>
      <CardContent className="flex flex-col items-center p-6 space-y-4">
        <Avatar className="h-20 w-20 mb-2">
          <AvatarImage src={user.avatarUrl} alt={user.name} />
          <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="text-center">
          <p className="font-medium text-lg text-gray-700">{user.name}</p>
          <p className="text-sm text-gray-500">Cosmic Explorer</p>
        </div>
        { socket.id !== user.id ?
          <Button
            className={`w-full transition-all duration-300 ease-in-out ${isHovered ? 'bg-gradient-to-r from-indigo-500 to-purple-500' : ''}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={handleRequest}
            disabled={user.status !== 'available'}
          >
            <Radio className={`mr-2 h-4 w-4 text-green-500"`} />
            Request
          </Button>
          :
          <StatusChange />
        }
      </CardContent>
    </Card>
  );
};
