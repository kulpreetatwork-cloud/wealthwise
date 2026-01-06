import { create } from 'zustand';
import api from '../lib/api';

export const useBudgetStore = create((set, get) => ({
    // State
    budgets: [],
    summary: null,
    isLoading: false,
    error: null,

    // Actions
    fetchBudgets: async () => {
        try {
            set({ isLoading: true, error: null });
            const response = await api.get('/budgets');
            set({
                budgets: response.data.data,
                isLoading: false,
            });
            return { success: true };
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to fetch budgets';
            set({ error: message, isLoading: false });
            return { success: false, error: message };
        }
    },

    fetchSummary: async () => {
        try {
            const response = await api.get('/budgets/summary');
            set({ summary: response.data.data });
            return { success: true };
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to fetch summary';
            return { success: false, error: message };
        }
    },

    createBudget: async (budgetData) => {
        try {
            const response = await api.post('/budgets', budgetData);
            const newBudget = response.data.data;
            set((state) => ({
                budgets: [newBudget, ...state.budgets],
            }));
            return { success: true, data: newBudget };
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to create budget';
            return { success: false, error: message };
        }
    },

    updateBudget: async (id, budgetData) => {
        try {
            const response = await api.put(`/budgets/${id}`, budgetData);
            const updatedBudget = response.data.data;
            set((state) => ({
                budgets: state.budgets.map((b) =>
                    b._id === id ? { ...b, ...updatedBudget } : b
                ),
            }));
            return { success: true, data: updatedBudget };
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to update budget';
            return { success: false, error: message };
        }
    },

    deleteBudget: async (id) => {
        try {
            await api.delete(`/budgets/${id}`);
            set((state) => ({
                budgets: state.budgets.filter((b) => b._id !== id),
            }));
            return { success: true };
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to delete budget';
            return { success: false, error: message };
        }
    },

    clearBudgets: () => {
        set({ budgets: [], summary: null, error: null });
    },
}));
