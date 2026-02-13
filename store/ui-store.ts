import { create } from 'zustand';

interface ToastMessage {
    type: 'success' | 'error' | 'info';
    message: string;
}

interface UIState {
    userName: string;
    isDarkMode: boolean;
    toast: ToastMessage | null;
    setUserName: (name: string) => void;
    toggleDarkMode: () => void;
    showToast: (type: ToastMessage['type'], message: string) => void;
    hideToast: () => void;
}

export const useUIStore = create<UIState>((set) => ({
    userName: 'Friend',
    isDarkMode: false,
    toast: null,
    setUserName: (name) => set({ userName: name }),
    toggleDarkMode: () => set((s) => ({ isDarkMode: !s.isDarkMode })),
    showToast: (type, message) => set({ toast: { type, message } }),
    hideToast: () => set({ toast: null }),
}));
