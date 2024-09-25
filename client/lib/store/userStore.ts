import { create } from 'zustand';

interface UserState {
  username: string;
  id: string | undefined;
  room: string;
  updateUsername: (arg: string) => void;
  updateId: (arg: string | undefined) => void;
  updateRoom: (arg: string) => void;
}

export const useUserStore = create<UserState>((set) => ({
  username: '',
  id: '',
  room: '',
  updateUsername: (newUsername: string) => set(() => ({ username: newUsername })),
  updateId: (newId: string | undefined) => set(() => ({ id: newId })),
  updateRoom: (newRoom: string) => set(() => ({ room: newRoom }))
}));

