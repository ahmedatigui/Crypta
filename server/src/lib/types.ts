export type Status = 'available' | 'busy';


export type SocketInit = {
  roomName: string;
  sender: {
    id: string | undefined | null;
    username: string | undefined | null;
  };
  receiver: {
    id: string | undefined | null;
    username: string | undefined | null;
  };
};

export type SocketInitRequest = SocketInit & {
  signal: unknown;
  info: string | undefined | null;
};

export type SocketInitResponse = SocketInit & {
  signal: unknown;
  accepted: boolean;
};

export type SignalReqRes = SocketInit & {
  signal: string;
};

export type UsersInfo = {
  username: string;
  status: Status;
  id: string;
}