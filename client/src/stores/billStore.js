import { create } from 'zustand';
import api from '../lib/api';

export const useBillStore = create((set, get) => ({
    // State
    bills: [],
    summary: null,
    upcoming: [],
    overdue: [],
    isLoading: false,
    error: null,

    // Actions
    fetchBills: async () => {
        try {
            set({ isLoading: true, error: null });
            const response = await api.get('/bills');
            set({
                bills: response.data.data,
                isLoading: false,
            });
            return { success: true };
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to fetch bills';
            set({ error: message, isLoading: false });
            return { success: false, error: message };
        }
    },

    fetchSummary: async () => {
        try {
            const response = await api.get('/bills/summary');
            set({ summary: response.data.data });
            return { success: true };
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to fetch summary';
            return { success: false, error: message };
        }
    },

    fetchUpcoming: async (days = 30) => {
        try {
            const response = await api.get(`/bills/upcoming?days=${days}`);
            set({ upcoming: response.data.data });
            return { success: true };
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to fetch upcoming bills';
            return { success: false, error: message };
        }
    },

    createBill: async (data) => {
        try {
            const response = await api.post('/bills', data);
            const newBill = response.data.data;
            set((state) => ({
                bills: [newBill, ...state.bills],
            }));
            return { success: true, data: newBill };
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to create bill';
            return { success: false, error: message };
        }
    },

    updateBill: async (id, data) => {
        try {
            const response = await api.put(`/bills/${id}`, data);
            const updated = response.data.data;
            set((state) => ({
                bills: state.bills.map((bill) =>
                    bill._id === id ? updated : bill
                ),
            }));
            return { success: true, data: updated };
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to update bill';
            return { success: false, error: message };
        }
    },

    markPaid: async (id) => {
        try {
            const response = await api.post(`/bills/${id}/pay`);
            const updated = response.data.data;
            set((state) => ({
                bills: state.bills.map((bill) =>
                    bill._id === id ? updated : bill
                ),
            }));
            return { success: true, data: updated };
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to mark as paid';
            return { success: false, error: message };
        }
    },

    deleteBill: async (id) => {
        try {
            await api.delete(`/bills/${id}`);
            set((state) => ({
                bills: state.bills.filter((bill) => bill._id !== id),
            }));
            return { success: true };
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to delete bill';
            return { success: false, error: message };
        }
    },
}));
