import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import {
    Send,
    Sparkles,
    Bot,
    User,
    Loader2,
    Trash2,
    TrendingUp,
    PieChart,
    Lightbulb,
    RefreshCw,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAIStore } from '../../../stores/aiStore';
import styles from './AIAssistant.module.css';

const quickPrompts = [
    { icon: TrendingUp, text: 'How can I improve my savings?' },
    { icon: PieChart, text: 'Analyze my spending patterns' },
    { icon: Lightbulb, text: 'Give me budgeting tips' },
];

const AIAssistant = () => {
    const [inputValue, setInputValue] = useState('');
    const [activeTab, setActiveTab] = useState('chat');
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);
    const hasFetchedInsights = useRef(false);

    const {
        messages,
        insights,
        isLoading,
        isTyping,
        sendMessage,
        fetchInsights,
        clearMessages,
    } = useAIStore();

    // Scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);

    // Fetch insights on tab change
    useEffect(() => {
        if (activeTab === 'insights' && !insights && !hasFetchedInsights.current) {
            hasFetchedInsights.current = true;
            fetchInsights();
        }
    }, [activeTab, insights, fetchInsights]);

    const handleSubmit = async (e) => {
        e?.preventDefault();
        if (!inputValue.trim() || isTyping) return;

        const message = inputValue.trim();
        setInputValue('');
        await sendMessage(message);
    };

    const handleQuickPrompt = (text) => {
        setInputValue(text);
        inputRef.current?.focus();
    };

    const handleClearChat = () => {
        clearMessages();
        toast.success('Chat cleared');
    };

    const handleRefreshInsights = async () => {
        const result = await fetchInsights();
        if (result.success) {
            toast.success('Insights refreshed');
        }
    };

    return (
        <div className={styles.container}>
            {/* Header */}
            <div className={styles.header}>
                <div className={styles.headerContent}>
                    <div className={styles.headerIcon}>
                        <Sparkles size={24} />
                    </div>
                    <div>
                        <h1 className={styles.title}>AI Financial Assistant</h1>
                        <p className={styles.subtitle}>Powered by advanced AI to help manage your finances</p>
                    </div>
                </div>

                {/* Tabs */}
                <div className={styles.tabs}>
                    <button
                        className={`${styles.tab} ${activeTab === 'chat' ? styles.active : ''}`}
                        onClick={() => setActiveTab('chat')}
                    >
                        <Bot size={16} />
                        Chat
                    </button>
                    <button
                        className={`${styles.tab} ${activeTab === 'insights' ? styles.active : ''}`}
                        onClick={() => setActiveTab('insights')}
                    >
                        <Lightbulb size={16} />
                        Insights
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className={styles.content}>
                {activeTab === 'chat' ? (
                    <div className={styles.chatContainer}>
                        {/* Messages */}
                        <div className={styles.messages}>
                            {messages.length === 0 ? (
                                <div className={styles.emptyChat}>
                                    <Bot size={48} className={styles.emptyIcon} />
                                    <h3>How can I help you today?</h3>
                                    <p>Ask me anything about your finances, budgeting, or get personalized advice.</p>

                                    {/* Quick Prompts */}
                                    <div className={styles.quickPrompts}>
                                        {quickPrompts.map((prompt, index) => (
                                            <button
                                                key={index}
                                                className={styles.promptBtn}
                                                onClick={() => handleQuickPrompt(prompt.text)}
                                            >
                                                <prompt.icon size={16} />
                                                {prompt.text}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <AnimatePresence>
                                        {messages.map((message, index) => (
                                            <motion.div
                                                key={index}
                                                className={`${styles.message} ${styles[message.role]}`}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ duration: 0.2 }}
                                            >
                                                <div className={styles.messageAvatar}>
                                                    {message.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                                                </div>
                                                <div className={styles.messageContent}>
                                                    {message.role === 'assistant' ? (
                                                        <ReactMarkdown>{message.content}</ReactMarkdown>
                                                    ) : (
                                                        <p>{message.content}</p>
                                                    )}
                                                </div>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>

                                    {/* Typing indicator */}
                                    {isTyping && (
                                        <motion.div
                                            className={`${styles.message} ${styles.assistant}`}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                        >
                                            <div className={styles.messageAvatar}>
                                                <Bot size={16} />
                                            </div>
                                            <div className={styles.typing}>
                                                <span></span>
                                                <span></span>
                                                <span></span>
                                            </div>
                                        </motion.div>
                                    )}
                                    <div ref={messagesEndRef} />
                                </>
                            )}
                        </div>

                        {/* Input */}
                        <div className={styles.inputContainer}>
                            {messages.length > 0 && (
                                <button
                                    className={styles.clearBtn}
                                    onClick={handleClearChat}
                                    title="Clear chat"
                                >
                                    <Trash2 size={16} />
                                </button>
                            )}
                            <form onSubmit={handleSubmit} className={styles.inputForm}>
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    placeholder="Ask me anything about your finances..."
                                    disabled={isTyping}
                                />
                                <button
                                    type="submit"
                                    className={styles.sendBtn}
                                    disabled={!inputValue.trim() || isTyping}
                                >
                                    {isTyping ? <Loader2 size={18} className={styles.spinner} /> : <Send size={18} />}
                                </button>
                            </form>
                        </div>
                    </div>
                ) : (
                    <div className={styles.insightsContainer}>
                        {isLoading ? (
                            <div className={styles.loading}>
                                <Loader2 size={32} className={styles.spinner} />
                                <p>Analyzing your financial data...</p>
                            </div>
                        ) : insights ? (
                            <>
                                <div className={styles.insightsHeader}>
                                    <h2>Your Financial Insights</h2>
                                    <button onClick={handleRefreshInsights} className={styles.refreshBtn}>
                                        <RefreshCw size={16} />
                                        Refresh
                                    </button>
                                </div>

                                {/* Summary Cards */}
                                {insights.summary && (
                                    <div className={styles.summaryGrid}>
                                        <div className={styles.summaryCard}>
                                            <span className={styles.summaryLabel}>Total Balance</span>
                                            <span className={styles.summaryValue}>
                                                ₹{insights.summary.totalBalance?.toLocaleString('en-IN') || 0}
                                            </span>
                                        </div>
                                        <div className={styles.summaryCard}>
                                            <span className={styles.summaryLabel}>30-Day Income</span>
                                            <span className={`${styles.summaryValue} ${styles.income}`}>
                                                +₹{insights.summary.income?.toLocaleString('en-IN') || 0}
                                            </span>
                                        </div>
                                        <div className={styles.summaryCard}>
                                            <span className={styles.summaryLabel}>30-Day Expenses</span>
                                            <span className={`${styles.summaryValue} ${styles.expense}`}>
                                                -₹{insights.summary.expenses?.toLocaleString('en-IN') || 0}
                                            </span>
                                        </div>
                                        <div className={styles.summaryCard}>
                                            <span className={styles.summaryLabel}>Savings Rate</span>
                                            <span className={styles.summaryValue}>
                                                {insights.summary.savingsRate || 0}%
                                            </span>
                                        </div>
                                    </div>
                                )}

                                {/* AI Insights */}
                                <div className={styles.insightsContent}>
                                    <ReactMarkdown>{insights.insights}</ReactMarkdown>
                                </div>
                            </>
                        ) : (
                            <div className={styles.emptyInsights}>
                                <Lightbulb size={48} />
                                <p>No insights available yet</p>
                                <span>Add some transactions to get personalized insights</span>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AIAssistant;
