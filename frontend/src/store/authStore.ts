import { create } from 'zustand';
import { authAPI } from '../api/client';

interface User {
    id: number;
    email: string;
    firstName?: string;
    lastName?: string;
    role: string;
}

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;

    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string, firstName?: string, lastName?: string) => Promise<void>;
    logout: () => void;
    loadUser: () => Promise<void>;
    clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    token: localStorage.getItem('authToken'),
    isAuthenticated: !!localStorage.getItem('authToken'),
    isLoading: false,
    error: null,

    login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
            const response = await authAPI.login({ email, password });
            const { token, user } = response.data;

            localStorage.setItem('authToken', token);
            set({
                user,
                token,
                isAuthenticated: true,
                isLoading: false
            });
        } catch (error: any) {
            set({
                error: error.response?.data?.error || 'Login failed',
                isLoading: false
            });
            throw error;
        }
    },

    register: async (email, password, firstName, lastName) => {
        set({ isLoading: true, error: null });
        try {
            const response = await authAPI.register({ email, password, firstName, lastName });
            const { token, user } = response.data;

            localStorage.setItem('authToken', token);
            set({
                user,
                token,
                isAuthenticated: true,
                isLoading: false
            });
        } catch (error: any) {
            set({
                error: error.response?.data?.error || 'Registration failed',
                isLoading: false
            });
            throw error;
        }
    },

    logout: () => {
        localStorage.removeItem('authToken');
        set({
            user: null,
            token: null,
            isAuthenticated: false
        });
    },

    loadUser: async () => {
        const token = localStorage.getItem('authToken');
        if (!token) {
            set({ isAuthenticated: false });
            return;
        }

        set({ isLoading: true });
        try {
            const response = await authAPI.getProfile();
            set({
                user: response.data,
                isAuthenticated: true,
                isLoading: false
            });
        } catch (error) {
            localStorage.removeItem('authToken');
            set({
                user: null,
                token: null,
                isAuthenticated: false,
                isLoading: false
            });
        }
    },

    clearError: () => set({ error: null }),
}));
