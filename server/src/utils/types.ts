export type socketInitRequest = {
  roomName: string;
  sender: { id: string; username: string };
  receiver: { id: string; username: string };
  message: string;
};
