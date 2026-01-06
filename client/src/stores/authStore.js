import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../lib/api';

export const useAuthStore = create(
    persist(
        (set, get) => ({
            // State
            user: null,
            accessToken: null,
            isAuthenticated: false,
            isLoading: true,

            // Actions
            setUser: (user) => set({ user, isAuthenticated: !!user }),

            setAccessToken: (token) => set({ accessToken: token }),

            setLoading: (loading) => set({ isLoading: loading }),

            // Login
            login: async (email, password) => {
                try {
                    const response = await api.post('/auth/login', { email, password });
                    const { user, accessToken } = response.data.data;

                    set({
                        user,
                        accessToken,
                        isAuthenticated: true,
                        isLoading: false,
                    });

                    return { success: true };
                } catch (error) {
                    const message = error.response?.data?.message || 'Login failed';
                    return { success: false, error: message };
                }
            },

            // Register
            register: async (userData) => {
                try {
                    const response = await api.post('/auth/register', userData);
                    const { user, accessToken } = response.data.data;

                    set({
                        user,
                        accessToken,
                        isAuthenticated: true,
                        isLoading: false,
                    });

                    return { success: true };
                } catch (error) {
                    const message = error.response?.data?.message || 'Registration failed';
                    return { success: false, error: message };
                }
            },

            // Set role
            setRole: async (role) => {
                try {
                    const response = await api.put('/users/profile', { role });
                    const updatedUser = response.data.data;

                    set({ user: updatedUser });

                    return { success: true };
                } catch (error) {
                    const message = error.response?.data?.message || 'Failed to set role';
                    return { success: false, error: message };
                }
            },

            // Logout
            logout: async () => {
                try {
                    await api.post('/auth/logout');
                } catch (error) {
                    console.error('Logout error:', error);
                } finally {
                    set({
                        user: null,
                        accessToken: null,
                        isAuthenticated: false,
                        isLoading: false,
                    });
                }
            },

            // Refresh token
            refreshToken: async () => {
                try {
                    const response = await api.post('/auth/refresh');
                    const { accessToken } = response.data.data;

                    set({ accessToken });
                    return accessToken;
                } catch (error) {
                    get().logout();
                    return null;
                }
            },

            // Check auth on app load
            checkAuth: async () => {
                try {
                    set({ isLoading: true });
                    const response = await api.get('/auth/me');
                    const user = response.data.data;

                    set({
                        user,
                        isAuthenticated: true,
                        isLoading: false,
                    });
                } catch (error) {
                    set({
                        user: null,
                        accessToken: null,
                        isAuthenticated: false,
                        isLoading: false,
                    });
                }
            },
        }),
        {
            name: 'wealthwise-auth',
            partialize: (state) => ({
                accessToken: state.accessToken,
            }),
        }
    )
);
