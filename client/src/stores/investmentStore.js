import { create } from 'zustand';
import api from '../lib/api';

export const useInvestmentStore = create((set, get) => ({
    // State
    investments: [],
    summary: null,
    isLoading: false,
    error: null,

    // Actions
    fetchInvestments: async () => {
        try {
            set({ isLoading: true, error: null });
            const response = await api.get('/investments');
            set({
                investments: response.data.data,
                isLoading: false,
            });
            return { success: true };
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to fetch investments';
            set({ error: message, isLoading: false });
            return { success: false, error: message };
        }
    },

    fetchSummary: async () => {
        try {
            const response = await api.get('/investments/summary');
            set({ summary: response.data.data });
            return { success: true };
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to fetch summary';
            return { success: false, error: message };
        }
    },

    createInvestment: async (data) => {
        try {
            const response = await api.post('/investments', data);
            const newInvestment = response.data.data;
            set((state) => ({
                investments: [newInvestment, ...state.investments],
            }));
            return { success: true, data: newInvestment };
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to add investment';
            return { success: false, error: message };
        }
    },

    updateInvestment: async (id, data) => {
        try {
            const response = await api.put(`/investments/${id}`, data);
            const updated = response.data.data;
            set((state) => ({
                investments: state.investments.map((inv) =>
                    inv._id === id ? updated : inv
                ),
            }));
            return { success: true, data: updated };
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to update investment';
            return { success: false, error: message };
        }
    },

    deleteInvestment: async (id) => {
        try {
            await api.delete(`/investments/${id}`);
            set((state) => ({
                investments: state.investments.filter((inv) => inv._id !== id),
            }));
            return { success: true };
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to delete investment';
            return { success: false, error: message };
        }
    },
}));
