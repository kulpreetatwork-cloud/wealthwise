import { create } from 'zustand';
import api from '../lib/api';

export const useTransactionStore = create((set, get) => ({
    // State
    transactions: [],
    pagination: null,
    isLoading: false,
    error: null,
    filters: {
        type: '',
        category: '',
        accountId: '',
        startDate: '',
        endDate: '',
        search: '',
    },

    // Actions
    setFilters: (newFilters) => {
        set((state) => ({
            filters: { ...state.filters, ...newFilters },
        }));
    },

    clearFilters: () => {
        set({
            filters: {
                type: '',
                category: '',
                accountId: '',
                startDate: '',
                endDate: '',
                search: '',
            },
        });
    },

    fetchTransactions: async (page = 1) => {
        try {
            set({ isLoading: true, error: null });
            const { filters } = get();

            const params = new URLSearchParams();
            params.append('page', page);
            params.append('limit', 20);

            if (filters.type) params.append('type', filters.type);
            if (filters.category) params.append('category', filters.category);
            if (filters.accountId) params.append('accountId', filters.accountId);
            if (filters.startDate) params.append('startDate', filters.startDate);
            if (filters.endDate) params.append('endDate', filters.endDate);
            if (filters.search) params.append('search', filters.search);

            const response = await api.get(`/transactions?${params.toString()}`);
            set({
                transactions: response.data.data.transactions,
                pagination: response.data.data.pagination,
                isLoading: false,
            });
            return { success: true };
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to fetch transactions';
            set({ error: message, isLoading: false });
            return { success: false, error: message };
        }
    },

    createTransaction: async (transactionData) => {
        try {
            const response = await api.post('/transactions', transactionData);
            const newTransaction = response.data.data;
            set((state) => ({
                transactions: [newTransaction, ...state.transactions],
            }));
            return { success: true, data: newTransaction };
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to create transaction';
            return { success: false, error: message };
        }
    },

    updateTransaction: async (id, transactionData) => {
        try {
            const response = await api.put(`/transactions/${id}`, transactionData);
            const updatedTransaction = response.data.data;
            set((state) => ({
                transactions: state.transactions.map((t) =>
                    t._id === id ? updatedTransaction : t
                ),
            }));
            return { success: true, data: updatedTransaction };
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to update transaction';
            return { success: false, error: message };
        }
    },

    deleteTransaction: async (id) => {
        try {
            await api.delete(`/transactions/${id}`);
            set((state) => ({
                transactions: state.transactions.filter((t) => t._id !== id),
            }));
            return { success: true };
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to delete transaction';
            return { success: false, error: message };
        }
    },

    clearTransactions: () => {
        set({ transactions: [], pagination: null, error: null });
    },
}));
