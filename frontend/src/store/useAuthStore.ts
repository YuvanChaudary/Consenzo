import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  userId: string | null;
  displayName: string | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (userId: string, displayName: string, token: string) => void;
  logout: () => void;
  setDisplayName: (name: string) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      userId: null,
      displayName: null,
      token: null,
      isAuthenticated: false,
      login: (userId, displayName, token) =>
        set({ userId, displayName, token, isAuthenticated: true }),
      logout: () =>
        set({ userId: null, displayName: null, token: null, isAuthenticated: false }),
      setDisplayName: (name) => set({ displayName: name }),
    }),
    { name: 'shippyfy-auth' }
  )
);
