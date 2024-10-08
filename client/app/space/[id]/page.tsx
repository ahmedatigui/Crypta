'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { Rocket, Users } from 'lucide-react';
import Peer from 'simple-peer';
import { toast } from 'sonner';

import { socket } from '@/socket';
import { useUserStore } from '@/lib/store/userStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserCard } from '@/components/UserCard';
import { IncomingRequestDialog } from '@/components/IncomingRequest';
import {
  SocketInitRequest,
  SocketInitResponse,
  SocketInit,
  User,
  UsersInfo,
} from '@/lib/types';
import { formatFileSize } from '@/lib/utils';
import { getIceServers } from '@/actions/getRemoteServers';

export default function SpacePage({ params }: { params: { id: string } }) {
  const roomId = params.id;
  const peerRef = useRef<Peer.Instance | null>();
  const router = useRouter();

  const [users, setUsers] = useState<User[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [request, setRequest] = useState<SocketInitRequest | null>();
  const [connected, setConnected] = useState(false);
  const [, setResponse] = useState<SocketInitResponse | null>();
  const [, setReqAccept] = useState(false);
  const [remoteIceServers, setRemoteIceServers] = useState<never[]>([]);

  const username = useUserStore((state) => state.username);
  const updateRoom = useUserStore((state) => state.updateRoom);
  const updateUserId = useUserStore((state) => state.updateId);
  const userId = useUserStore((state) => state.id);

  const sendRequest = (user: User, file: File) => {
    socket.emit('changeStatus', {
      user: socket.id,
      status: 'busy',
      roomName: roomId,
    });
    const peer = new Peer({
      initiator: true,
      trickle: false,
      config: {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
          { urls: 'stun:stun2.l.google.com:19302' },
          { urls: 'stun:stun3.l.google.com:19302' },
          { urls: 'stun:stun4.l.google.com:19302' },
          ...remoteIceServers,
        ],
      },
    });
    peer.on('signal', (data) => {
      socket.emit('requestToSocket', {
        roomName: roomId,
        sender: { id: socket.id, username: username },
        receiver: { id: user.id, username: user.name },
        signal: data,
        file: {
          name: file.name,
          type: file.type,
          size: formatFileSize(file.size),
        },
      });
      toast.info(`Sent a request to ${user.name}`, { duration: 2000 });
    });

    const chunkSize = 16 * 1024; // 16KB per chunk
    let offset = 0;
    peer.on('connect', () => {
      setConnected(true);
      console.log('Connected!');
      toast.success('Connected!', { duration: 2000 });

      async function sendFile() {
        const chunk = file.slice(offset, offset + chunkSize);
        if (chunk.size === 0) {
          peer.send('DONE');
          toast.dismiss(sendingToast);
          toast.success(`${file.name} has been Sent!`, { duration: 5000 });
          stopRTCConnection();
          socket.emit('changeStatus', {
            user: socket.id,
            status: 'available',
            roomName: roomId,
          });
          return;
        }

        try {
          const arrayBuffer = await chunk.arrayBuffer();
          peer.send(arrayBuffer);

          offset += chunkSize;

          setTimeout(sendFile, 10);
        } catch (error) {
          console.error('Error reading chunk:', error);
        }
      }

      sendFile();
      const sendingToast = toast.loading(`Sending "${file.name}"`, {
        action: {
          label: 'Cancel',
          onClick: () =>
            cancelSharingEvent({
              roomName: roomId,
              sender: { id: socket.id, username: username },
              receiver: { id: user.id, username: user.name },
            }),
        },
      });
    });

    peerRef.current = peer;
  };

  const acceptRequest = () => {
    socket.emit('changeStatus', {
      user: socket.id,
      status: 'busy',
      roomName: roomId,
    });
    const peer = new Peer({ initiator: false, trickle: false });
    peer.on('signal', (data) => {
      socket.emit('responseToSocket', {
        roomName: roomId,
        sender: { id: socket.id, username: username },
        receiver: {
          id: request?.sender?.id,
          username: request?.sender?.username,
        },
        signal: data,
        accepted: true,
      });
    });

    let receivingToast: string | number;
    peer.on('connect', () => {
      setConnected(true);
      console.log('Connected!');
      toast.success('Connected!', { duration: 2000 });
      receivingToast = toast.loading(`Receiving "${request?.file?.name}"`, {
        action: {
          label: 'Cancel',
          onClick: () =>
            cancelSharingEvent({
              roomName: roomId,
              sender: { id: socket.id, username: username },
              receiver: {
                id: request?.sender.id,
                username: request?.sender.username,
              },
            }),
        },
      });
    });

    let receivedChunks: BlobPart[] = [];
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    let receivedFileSize = 0;
    peer.on('data', (data) => {
      const decdata = new TextDecoder().decode(data);

      if (decdata === 'DONE') {
        toast.dismiss(receivingToast);
        stopRTCConnection();
        const receivedBlob = new Blob(receivedChunks);
        const url = URL.createObjectURL(receivedBlob);
        console.log('URL: ', url);
        const a = document.createElement('a');
        a.href = url;
        a.download = request?.file
          ? request.file.name
          : `file_${new Date().toISOString()}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        URL.revokeObjectURL(url);
        receivedChunks = [];
        setConnected(false);
        socket.emit('changeStatus', {
          user: socket.id,
          status: 'available',
          roomName: roomId,
        });
      } else {
        receivedChunks.push(data);
        receivedFileSize += data.byteLength;
      }
    });

    if (request?.signal) peer.signal(request.signal);

    peerRef.current = peer;
  };

  const stopRTCConnection = () => {
    if (peerRef.current) {
      console.log('STOPPING RTC CONNECTION');
      peerRef.current.removeAllListeners();
      peerRef.current.destroy();
      peerRef.current = null;
      toast.dismiss();
      socket.emit('changeStatus', {
        user: socket.id,
        status: 'available',
        roomName: roomId,
      });
      setResponse(null);
      setRequest(null);
      setReqAccept(false);
      setConnected(false);
    }
  };

  const cancelSharingEvent = (info: SocketInit) => {
    stopRTCConnection();
    socket.emit('cancelSharingEvent', info);
  };

  const onOpenChange = () => {};
  const onAccept = () => {
    acceptRequest();

    setReqAccept(true);
    setIsOpen(false);
  };
  const onReject = () => {
    setReqAccept(false);
    setIsOpen(false);
    socket.emit('responseToSocket', {
      roomName: roomId,
      sender: { id: socket.id, username: username },
      receiver: { id: request?.sender.id, username: request?.sender.username },
      signal: null,
      accepted: false,
    });
  };

  useEffect(() => {
    if (!username) router.push('/');
    updateRoom(roomId);

    console.info('WS: connecting...');
    socket.connect();

    socket.emit('joinRoom', {
      roomName: roomId,
      status: 'available',
      username,
    });

    async function fetchServers() {
      const data = await getIceServers();
      setRemoteIceServers(data);
    }
    fetchServers();

    socket.emit('sendToRoom', {
      roomName: roomId,
      sender: username,
      message: `Hello, ${roomId} peeps!`,
    });

    return () => {
      socket.emit('leaveRoom', { roomName: roomId, username });
      stopRTCConnection();
      console.info('WS: disconnecting...');
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    socket.on('connect', () => {
      updateUserId(socket.id);
    });

    socket.on('userJoined', (message) => {
      console.log(message);
    });

    socket.on('userLeft', (message) => {
      console.log(message);
    });

    socket.on('roomMessage', ({ roomName, message, sender }) => {
      console.log(`Message in ${roomName} from ${sender}: ${message}`);
    });

    socket.on('requestMessage', (req: SocketInitRequest) => {
      if (req.receiver.id === socket.id) {
        toast.info(`Request received from ${req.sender.username}`, {
          duration: 2000,
        });
        setRequest(req);
        setIsOpen(true);
      }
    });

    socket.on('responseToRequest', (res: SocketInitResponse) => {
      if (res.receiver.id === socket.id) {
        setResponse(res);
        if (res.accepted) {
          toast.success(`Request to ${res.sender.username} is Accepted!`, {
            duration: 2000,
          });
          peerRef?.current?.signal(res.signal);
        } else {
          toast.error(`Request to ${res.sender.username} is Rejected!`, {
            duration: 2000,
          });
          stopRTCConnection();
          socket.emit('changeStatus', {
            user: socket.id,
            status: 'available',
            roomName: roomId,
          });
        }
      }
    });

    socket.on('sharingEventCanceled', (info: SocketInit) => {
      stopRTCConnection();
      toast.error(`Sharing is canceled by ${info.sender.username}`);
    });

    socket.on('usersList', (usersInfo: UsersInfo[]) => {
      const users = usersInfo.map((user) => ({
        id: user.id,
        name: socket.id === user.id ? `(You) ${user.username}` : user.username,
        status: user.status,
        avatarUrl: `https://robohash.org/${user.username}`,
      }));
      setUsers([...users]);
    });

    return () => {
      socket.off('connect', () => updateUserId(socket.id));
      socket.off('userJoined', (message) => console.log(message));
      socket.off('userLeft', (message) => console.log(message));
      socket.off('roomMessage', ({ roomName, message, sender }) => {
        console.log(`Message in ${roomName} from ${sender}: ${message}`);
      });
      socket.off('usersList', (usersInfo: UsersInfo[]) => {
        console.log(usersInfo);
        const mu = usersInfo.map((user) => ({
          id: user.id,
          name: userId === user.id ? `(You)${user.username}` : user.username,
          status: 'available',
          avatarUrl: `https://robohash.org/${user.username}`,
        }));
        console.log(mu);
        //setUsers([...mu]);
      });
      socket.off('responseToRequest', (res: SocketInitResponse) => {
        if (res.receiver.id === socket.id) {
          console.log('Response received: ', res);
          //setResponse(res);
          if (res.accepted) {
            //peer.current.signal(res.signal);
          }
        }
      });
      socket.off('sharingEventCanceled', (info: SocketInit) => {
        stopRTCConnection();
        toast.error(`Sharing is canceled by ${info.sender.username}`);
      });
    };
  }, []);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-semibold mb-6 flex items-center text-gray-800">
        <Rocket className="mr-2 h-8 w-8 text-blue-600" /> Space: {roomId}
      </h1>
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-xl flex items-center text-gray-700">
            <Users className="mr-2 h-6 w-6" /> Connected Users
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {users.map((user) => (
              <UserCard
                key={user.id}
                user={user}
                sendRequest={sendRequest}
                connected={connected}
              />
            ))}
          </div>
        </CardContent>
      </Card>
      {request && (
        <IncomingRequestDialog
          isOpen={isOpen}
          onOpenChange={onOpenChange}
          request={request}
          onAccept={onAccept}
          onReject={onReject}
        />
      )}
    </div>
  );
}
