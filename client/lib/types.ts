type SocketInit = {
  roomName: string;
  sender: {
    id: string | undefined | null;
    username: string | undefined | null
  };
  receiver: {
    id: string | undefined | null;
    username: string | undefined | null
  };
}

export type SocketInitRequest = SocketInit & { 
  signal: any;
  message: string  | undefined | null
};

export type SocketInitResponse = SocketInit & {
  accepted: boolean
};

export type User = {
  id: string;
  name: string;
  status: 'available' | 'busy';
  avatarUrl: string;
};
