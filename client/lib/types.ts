export type SocketInitRequest = { 
  roomName: string; 
  sender: { 
    id: string | undefined | null; 
    username: string | undefined | null
  }; 
  receiver: { 
    id: string | undefined | null; 
    username: string | undefined | null 
  }; 
  sdpOffer: any;
  message: string  | undefined | null
};
export type User = {
  id: string;
  name: string;
  status: 'available' | 'busy';
  avatarUrl: string;
};
