import { create } from 'zustand';
import { io } from 'socket.io-client';
import api from '../lib/api';

let socket = null;

export const useNotificationStore = create((set, get) => ({
    // State
    notifications: [],
    unreadCount: 0,
    isLoading: false,
    isConnected: false,
    error: null,

    // Initialize socket connection
    initSocket: (token) => {
        if (socket?.connected) return;

        const apiUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

        socket = io(apiUrl, {
            auth: { token },
            transports: ['websocket', 'polling'],
        });

        socket.on('connect', () => {
            console.log('Socket connected');
            set({ isConnected: true });
        });

        socket.on('disconnect', () => {
            console.log('Socket disconnected');
            set({ isConnected: false });
        });

        socket.on('connect_error', (error) => {
            console.error('Socket connection error:', error.message);
            set({ isConnected: false });
        });

        // Listen for new notifications
        socket.on('notification:new', (notification) => {
            set((state) => ({
                notifications: [notification, ...state.notifications],
                unreadCount: state.unreadCount + 1,
            }));
        });

        // Listen for read events
        socket.on('notification:read', ({ id }) => {
            set((state) => ({
                notifications: state.notifications.map((n) =>
                    n._id === id ? { ...n, isRead: true } : n
                ),
                unreadCount: Math.max(0, state.unreadCount - 1),
            }));
        });

        // Listen for read all
        socket.on('notification:readAll', () => {
            set((state) => ({
                notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
                unreadCount: 0,
            }));
        });

        // Transaction events
        socket.on('transaction:created', (transaction) => {
            console.log('New transaction:', transaction);
        });

        socket.on('budget:updated', (budget) => {
            console.log('Budget updated:', budget);
        });

        socket.on('goal:contribution', (data) => {
            console.log('Goal contribution:', data);
        });
    },

    // Disconnect socket
    disconnectSocket: () => {
        if (socket) {
            socket.disconnect();
            socket = null;
            set({ isConnected: false });
        }
    },

    // Fetch notifications
    fetchNotifications: async () => {
        try {
            set({ isLoading: true, error: null });
            const response = await api.get('/notifications');
            set({
                notifications: response.data.data.notifications,
                unreadCount: response.data.data.unreadCount,
                isLoading: false,
            });
            return { success: true };
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to fetch notifications';
            set({ error: message, isLoading: false });
            return { success: false, error: message };
        }
    },

    // Fetch unread count only
    fetchUnreadCount: async () => {
        try {
            const response = await api.get('/notifications/unread-count');
            set({ unreadCount: response.data.data.count });
            return { success: true };
        } catch (error) {
            return { success: false };
        }
    },

    // Mark as read
    markAsRead: async (id) => {
        try {
            await api.put(`/notifications/${id}/read`);
            set((state) => ({
                notifications: state.notifications.map((n) =>
                    n._id === id ? { ...n, isRead: true } : n
                ),
                unreadCount: Math.max(0, state.unreadCount - 1),
            }));
            return { success: true };
        } catch (error) {
            return { success: false };
        }
    },

    // Mark all as read
    markAllAsRead: async () => {
        try {
            await api.put('/notifications/read-all');
            set((state) => ({
                notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
                unreadCount: 0,
            }));
            return { success: true };
        } catch (error) {
            return { success: false };
        }
    },

    // Delete notification
    deleteNotification: async (id) => {
        try {
            await api.delete(`/notifications/${id}`);
            set((state) => ({
                notifications: state.notifications.filter((n) => n._id !== id),
            }));
            return { success: true };
        } catch (error) {
            return { success: false };
        }
    },

    // Clear all
    clearNotifications: () => {
        set({ notifications: [], unreadCount: 0, error: null });
    },
}));
