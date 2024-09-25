import Peer from 'simple-peer';

export type Status = 'available' | 'busy';

export type SocketInit = {
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
  signal: string | Peer.SignalData;
  file: { 
    name: string, 
    type: string | undefined | null, 
    size: string 
  };
};

export type SocketInitResponse = SocketInit & {
  signal: string | Peer.SignalData;
  accepted: boolean
};

export type User = {
  id: string;
  name: string;
  status: Status;
  avatarUrl: string;
};

export type UsersInfo = {
  username: string;
  status: Status;
  id: string;
}