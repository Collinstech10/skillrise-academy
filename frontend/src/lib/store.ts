import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import Cookies from 'js-cookie';
import { User, AuthState } from '@/types';

interface AuthStore extends AuthState {
  setAuth: (user: User, token: string) => void;
  setUser: (user: User) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isLoading: false,
      isAuthenticated: false,

      setAuth: (user, token) => {
        Cookies.set('skillrise_token', token, { expires: 7, sameSite: 'strict' });
        set({ user, token, isAuthenticated: true, isLoading: false });
      },

      setUser: (user) => set({ user }),

      logout: () => {
        Cookies.remove('skillrise_token');
        set({ user: null, token: null, isAuthenticated: false });
        if (typeof window !== 'undefined') window.location.href = '/';
      },

      setLoading: (isLoading) => set({ isLoading }),
    }),
    {
      name: 'skillrise-auth',
      partialize: (state) => ({ user: state.user, token: state.token, isAuthenticated: state.isAuthenticated }),
    }
  )
);
