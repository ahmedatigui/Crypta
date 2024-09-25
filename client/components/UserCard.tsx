import { socket } from '@/socket';

import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { StatusChange } from '@/components/StatusChange';
import { ShareFileButton } from '@/components/ShareFileButton';
import { User } from '@/lib/types';

export const UserCard = ({
  user,
  sendRequest,
  connected,
}: {
  user: User;
  sendRequest: (user: User, file: File) => void;
  connected: boolean;
}) => {
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
        {socket.id !== user.id ? (
          <ShareFileButton user={user} sendRequest={sendRequest} connected={connected} />
        ) : (
          <StatusChange />
        )}
      </CardContent>
    </Card>
  );
};
