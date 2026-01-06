import { create } from 'zustand';
import api from '../lib/api';

export const useAIStore = create((set, get) => ({
    // State
    messages: [],
    insights: null,
    isLoading: false,
    isTyping: false,
    error: null,

    // Actions
    sendMessage: async (message) => {
        const userMessage = { role: 'user', content: message, timestamp: new Date() };

        set((state) => ({
            messages: [...state.messages, userMessage],
            isTyping: true,
            error: null,
        }));

        try {
            const conversationHistory = get().messages.map((m) => ({
                role: m.role,
                content: m.content,
            }));

            const response = await api.post('/ai/chat', {
                message,
                conversationHistory,
            });

            const assistantMessage = {
                role: 'assistant',
                content: response.data.data.message,
                timestamp: new Date(),
            };

            set((state) => ({
                messages: [...state.messages, assistantMessage],
                isTyping: false,
            }));

            return { success: true };
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to get response';
            set({ isTyping: false, error: errorMessage });
            return { success: false, error: errorMessage };
        }
    },

    fetchInsights: async () => {
        try {
            set({ isLoading: true, error: null });
            const response = await api.get('/ai/insights');
            set({
                insights: response.data.data,
                isLoading: false,
            });
            return { success: true };
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to fetch insights';
            set({ error: message, isLoading: false });
            return { success: false, error: message };
        }
    },

    analyzeSpending: async (period = 30) => {
        try {
            set({ isLoading: true, error: null });
            const response = await api.get(`/ai/analyze-spending?period=${period}`);
            return { success: true, data: response.data.data };
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to analyze spending';
            set({ error: message, isLoading: false });
            return { success: false, error: message };
        } finally {
            set({ isLoading: false });
        }
    },

    clearMessages: () => {
        set({ messages: [], error: null });
    },

    clearInsights: () => {
        set({ insights: null, error: null });
    },
}));
