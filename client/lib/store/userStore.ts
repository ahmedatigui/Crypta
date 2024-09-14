import { create } from 'zustand';

interface UserState {
  username: string;
  id: string | number;
  room: string;
  updateUsername: () => void;
  updateId: () => void;
  updateRoom: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  username: '',
  id: '',
  room: '',
  updateUsername: (newUsername) => set(() => ({ username: newUsername })),
  updateId: (newId) => set(() => ({ id: newId })),
  updateRoom: (newRoom) => set(() => ({ room: newRoom }))
}));

