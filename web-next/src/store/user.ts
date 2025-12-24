import { create } from 'zustand';

interface UserState {
  siteInfo: {
    title: string;
    logo: string;
    server_address: string;
    turnstile_check: boolean;
    turnstile_site_key: string;
    [key: string]: any;
  };
  user: any;
  login: (user: any) => void;
  logout: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  siteInfo: {
    title: 'One API',
    logo: '',
    server_address: '',
    turnstile_check: false,
    turnstile_site_key: '',
  },
  user: null,
  login: (user) => set({ user }),
  logout: () => set({ user: null }),
}));
