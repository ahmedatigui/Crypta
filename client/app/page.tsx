'use client';

import { useRouter } from 'next/navigation';
import { useState, MouseEvent } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useUserStore } from '@/lib/store/userStore';

export default function ChatJoinPage() {
  const [username, setUsername] = useState('');
  const [room, setRoom] = useState('');
  const [errors, setErrors] = useState({ username: '', room: '' });
  const updateUsername = useUserStore((state) => state.updateUsername);
  const router = useRouter();

  const generateRandomRoom = () => {
    const randomRoom = Math.random().toString(36).substring(2, 8).toUpperCase();
    setRoom(randomRoom);
    setErrors((prev) => ({ ...prev, room: '' }));
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = { username: '', room: '' };

    if (username.trim() === '' || username.length < 4 || username.length > 10) {
      newErrors.username =
        'Username is required and must be 4-10 characters long';
      isValid = false;
    }

    if (room.trim() === '' || room.length < 4 || room.length > 20) {
      newErrors.room = 'Room name is required and must be 4-10 characters long';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleJoin = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    if (validateForm()) {
      console.log('Joining chat with:', { username, room });
      updateUsername(username);
      router.push(`/space/${room}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Join Chat
          </CardTitle>
          <CardDescription className="text-center">
            Enter your details to join a sharing space
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                if (errors.username)
                  setErrors((prev) => ({ ...prev, username: '' }));
              }}
              required
              maxLength={10}
              minLength={4}
              pattern="[a-zA-Z0-9]+"
              className={errors.username ? 'border-red-500' : ''}
            />
            {errors.username && (
              <p className="text-red-500 text-sm mt-1">{errors.username}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="room">Room</Label>
            <div className="flex space-x-2">
              <Input
                id="room"
                placeholder="Enter room name or generate"
                value={room}
                onChange={(e) => {
                  setRoom(e.target.value);
                  if (errors.room) setErrors((prev) => ({ ...prev, room: '' }));
                }}
                required
                pattern="[a-zA-Z0-9]+"
                className={errors.room ? 'border-red-500' : ''}
              />
              <Button onClick={generateRandomRoom} variant="outline">
                Random
              </Button>
            </div>
            {errors.room && (
              <p className="text-red-500 text-sm mt-1">{errors.room}</p>
            )}
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
