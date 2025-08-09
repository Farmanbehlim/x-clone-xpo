

import { create } from 'zustand';

interface PushTokenState {
  pushToken: string | null;
  setPushToken: (token: string) => void;
  clearPushToken: () => void;
}

export const usePushTokenStore = create<PushTokenState>((set) => ({
  pushToken: null,
  setPushToken: (token: string) => set({ pushToken: token }),
  clearPushToken: () => set({ pushToken: null }),
}));
