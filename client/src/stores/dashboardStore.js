import { create } from 'zustand';
import api from '../lib/api';

export const useDashboardStore = create((set, get) => ({
    // State
    dashboardData: null,
    accounts: [],
    isLoading: false,
    error: null,

    // Actions
    fetchDashboardData: async () => {
        try {
            set({ isLoading: true, error: null });
            const response = await api.get('/dashboard');
            set({
                dashboardData: response.data.data,
                isLoading: false,
            });
            return { success: true };
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to fetch dashboard data';
            set({ error: message, isLoading: false });
            return { success: false, error: message };
        }
    },

    fetchAccounts: async () => {
        try {
            const response = await api.get('/accounts');
            set({ accounts: response.data.data });
            return { success: true };
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to fetch accounts';
            return { success: false, error: message };
        }
    },

    createAccount: async (accountData) => {
        try {
            const response = await api.post('/accounts', accountData);
            const newAccount = response.data.data;
            set((state) => ({
                accounts: [newAccount, ...state.accounts],
            }));
            return { success: true, data: newAccount };
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to create account';
            return { success: false, error: message };
        }
    },

    updateAccount: async (id, accountData) => {
        try {
            const response = await api.put(`/accounts/${id}`, accountData);
            const updatedAccount = response.data.data;
            set((state) => ({
                accounts: state.accounts.map((acc) =>
                    acc._id === id ? updatedAccount : acc
                ),
            }));
            return { success: true, data: updatedAccount };
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to update account';
            return { success: false, error: message };
        }
    },

    deleteAccount: async (id) => {
        try {
            await api.delete(`/accounts/${id}`);
            set((state) => ({
                accounts: state.accounts.filter((acc) => acc._id !== id),
            }));
            return { success: true };
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to delete account';
            return { success: false, error: message };
        }
    },

    clearDashboard: () => {
        set({ dashboardData: null, accounts: [], error: null });
    },
}));
