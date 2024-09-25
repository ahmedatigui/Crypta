import React from 'react';

import { socket } from '@/socket';
import { useUserStore } from '@/lib/store/userStore';
import { CircleUser, Clock } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Status } from '@/lib/types';

const statusOptions = [
  { value: 'available', label: 'Available', icon: CircleUser },
  { value: 'busy', label: 'Busy', icon: Clock },
];

export const StatusChange = ({ initialStatus = 'available' }) => {
  const roomName = useUserStore((state) => state.room);

  const handleValueChange = (newStatus: Status) => {
    socket.emit('changeStatus', {
      user: socket.id,
      status: newStatus,
      roomName,
    });
  };

  return (
    <Select onValueChange={handleValueChange} defaultValue={initialStatus}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Set status" />
      </SelectTrigger>
      <SelectContent>
        {statusOptions.map((status) => (
          <SelectItem key={status.value} value={status.value}>
            <div className="flex items-center">
              <status.icon className="mr-2 h-4 w-4" />
              <span>{status.label}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
