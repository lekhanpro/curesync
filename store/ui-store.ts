import { create } from 'zustand';

interface UIState {
    userName: string;
    isDarkMode: boolean;
    setUserName: (name: string) => void;
    toggleDarkMode: () => void;
}

export const useUIStore = create<UIState>((set) => ({
    userName: 'Friend',
    isDarkMode: false,
    setUserName: (name) => set({ userName: name }),
    toggleDarkMode: () => set((s) => ({ isDarkMode: !s.isDarkMode })),
}));
