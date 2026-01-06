import { create } from 'zustand';
import api from '../lib/api';

export const useGoalStore = create((set, get) => ({
    // State
    goals: [],
    summary: null,
    isLoading: false,
    error: null,

    // Actions
    fetchGoals: async () => {
        try {
            set({ isLoading: true, error: null });
            const response = await api.get('/goals');
            set({
                goals: response.data.data,
                isLoading: false,
            });
            return { success: true };
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to fetch goals';
            set({ error: message, isLoading: false });
            return { success: false, error: message };
        }
    },

    fetchSummary: async () => {
        try {
            const response = await api.get('/goals/summary');
            set({ summary: response.data.data });
            return { success: true };
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to fetch summary';
            return { success: false, error: message };
        }
    },

    createGoal: async (goalData) => {
        try {
            const response = await api.post('/goals', goalData);
            const newGoal = response.data.data;
            set((state) => ({
                goals: [newGoal, ...state.goals],
            }));
            return { success: true, data: newGoal };
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to create goal';
            return { success: false, error: message };
        }
    },

    updateGoal: async (id, goalData) => {
        try {
            const response = await api.put(`/goals/${id}`, goalData);
            const updatedGoal = response.data.data;
            set((state) => ({
                goals: state.goals.map((g) =>
                    g._id === id ? updatedGoal : g
                ),
            }));
            return { success: true, data: updatedGoal };
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to update goal';
            return { success: false, error: message };
        }
    },

    contributeToGoal: async (id, amount, note) => {
        try {
            const response = await api.post(`/goals/${id}/contribute`, { amount, note });
            const updatedGoal = response.data.data;
            set((state) => ({
                goals: state.goals.map((g) =>
                    g._id === id ? updatedGoal : g
                ),
            }));
            return { success: true, data: updatedGoal, message: response.data.message };
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to contribute';
            return { success: false, error: message };
        }
    },

    withdrawFromGoal: async (id, amount, reason) => {
        try {
            const response = await api.post(`/goals/${id}/withdraw`, { amount, reason });
            const updatedGoal = response.data.data;
            set((state) => ({
                goals: state.goals.map((g) =>
                    g._id === id ? updatedGoal : g
                ),
            }));
            return { success: true, data: updatedGoal };
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to withdraw';
            return { success: false, error: message };
        }
    },

    deleteGoal: async (id) => {
        try {
            await api.delete(`/goals/${id}`);
            set((state) => ({
                goals: state.goals.filter((g) => g._id !== id),
            }));
            return { success: true };
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to delete goal';
            return { success: false, error: message };
        }
    },

    clearGoals: () => {
        set({ goals: [], summary: null, error: null });
    },
}));
