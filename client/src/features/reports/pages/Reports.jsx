import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    FileText, Download, Calendar, TrendingUp, TrendingDown,
    DollarSign, PieChart, BarChart3, FileSpreadsheet, Loader2
} from 'lucide-react';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';
import toast from 'react-hot-toast';
import api from '../../../lib/api';
import { useCurrency } from '../../../hooks';
import styles from './Reports.module.css';

const Reports = () => {
    const [loading, setLoading] = useState(false);
    const [exporting, setExporting] = useState(null);
    const [summary, setSummary] = useState(null);
    const { format: formatCurrency, formatLocal } = useCurrency();
    const [dateRange, setDateRange] = useState({
        startDate: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
        endDate: format(endOfMonth(new Date()), 'yyyy-MM-dd'),
    });

    const presetRanges = [
        { label: 'This Month', getValue: () => ({ startDate: format(startOfMonth(new Date()), 'yyyy-MM-dd'), endDate: format(endOfMonth(new Date()), 'yyyy-MM-dd') }) },
        { label: 'Last 30 Days', getValue: () => ({ startDate: format(subDays(new Date(), 30), 'yyyy-MM-dd'), endDate: format(new Date(), 'yyyy-MM-dd') }) },
        { label: 'Last 90 Days', getValue: () => ({ startDate: format(subDays(new Date(), 90), 'yyyy-MM-dd'), endDate: format(new Date(), 'yyyy-MM-dd') }) },
        { label: 'Year to Date', getValue: () => ({ startDate: `${new Date().getFullYear()}-01-01`, endDate: format(new Date(), 'yyyy-MM-dd') }) },
    ];

    useEffect(() => {
        fetchSummary();
    }, [dateRange]);

    const fetchSummary = async () => {
        setLoading(true);
        try {
            const response = await api.get('/export/summary', {
                params: dateRange,
            });
            setSummary(response.data.data);
        } catch (error) {
            toast.error('Failed to load financial summary');
        } finally {
            setLoading(false);
        }
    };

    const handleExport = async (type) => {
        setExporting(type);
        try {
            let endpoint = '';
            let filename = '';
            let responseType = 'blob';

            switch (type) {
                case 'transactions_csv':
                    endpoint = '/export/transactions';
                    filename = `transactions_${dateRange.startDate}_${dateRange.endDate}.csv`;
                    break;
                case 'accounts_csv':
                    endpoint = '/export/accounts';
                    filename = 'accounts.csv';
                    break;
                case 'pdf':
                    endpoint = '/export/pdf';
                    filename = `financial_report_${dateRange.startDate}_${dateRange.endDate}.pdf`;
                    break;
                default:
                    return;
            }

            const response = await api.get(endpoint, {
                params: dateRange,
                responseType,
            });

            // Create download link
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            toast.success(`${type === 'pdf' ? 'PDF' : 'CSV'} exported successfully!`);
        } catch (error) {
            toast.error('Export failed. Please try again.');
        } finally {
            setExporting(null);
        }
    };

    const handlePresetClick = (preset) => {
        setDateRange(preset.getValue());
    };

    return (
        <div className={styles.container}>
            {/* Header */}
            <div className={styles.header}>
                <div className={styles.headerLeft}>
                    <h1 className={styles.title}>
                        <FileText size={28} />
                        Financial Reports
                    </h1>
                    <p className={styles.subtitle}>Export your financial data and generate reports</p>
                </div>
            </div>

            {/* Date Range Selector */}
            <motion.div
                className={styles.dateSection}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <h3 className={styles.sectionTitle}>
                    <Calendar size={18} />
                    Select Date Range
                </h3>
                <div className={styles.dateControls}>
                    <div className={styles.presets}>
                        {presetRanges.map((preset) => (
                            <button
                                key={preset.label}
                                className={styles.presetBtn}
                                onClick={() => handlePresetClick(preset)}
                            >
                                {preset.label}
                            </button>
                        ))}
                    </div>
                    <div className={styles.customRange}>
                        <input
                            type="date"
                            value={dateRange.startDate}
                            onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                            className={styles.dateInput}
                        />
                        <span>to</span>
                        <input
                            type="date"
                            value={dateRange.endDate}
                            onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                            className={styles.dateInput}
                        />
                    </div>
                </div>
            </motion.div>

            {/* Summary Cards */}
            {loading ? (
                <div className={styles.loadingState}>
                    <Loader2 className={styles.spinner} size={32} />
                    <p>Loading summary...</p>
                </div>
            ) : summary && (
                <motion.div
                    className={styles.summaryGrid}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                >
                    <div className={styles.summaryCard}>
                        <div className={styles.cardIcon} style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                            <DollarSign size={24} />
                        </div>
                        <div className={styles.cardContent}>
                            <span className={styles.cardLabel}>Total Balance</span>
                            <span className={styles.cardValue}>{formatLocal(summary.overview?.totalBalance || 0)}</span>
                        </div>
                    </div>

                    <div className={styles.summaryCard}>
                        <div className={styles.cardIcon} style={{ background: 'linear-gradient(135deg, #10b981, #14b8a6)' }}>
                            <TrendingUp size={24} />
                        </div>
                        <div className={styles.cardContent}>
                            <span className={styles.cardLabel}>Total Income</span>
                            <span className={styles.cardValue} style={{ color: '#10b981' }}>
                                +{formatCurrency(summary.overview?.totalIncome || 0)}
                            </span>
                        </div>
                    </div>

                    <div className={styles.summaryCard}>
                        <div className={styles.cardIcon} style={{ background: 'linear-gradient(135deg, #ef4444, #f97316)' }}>
                            <TrendingDown size={24} />
                        </div>
                        <div className={styles.cardContent}>
                            <span className={styles.cardLabel}>Total Expenses</span>
                            <span className={styles.cardValue} style={{ color: '#ef4444' }}>
                                -{formatCurrency(summary.overview?.totalExpenses || 0)}
                            </span>
                        </div>
                    </div>

                    <div className={styles.summaryCard}>
                        <div className={styles.cardIcon} style={{ background: 'linear-gradient(135deg, #f59e0b, #eab308)' }}>
                            <PieChart size={24} />
                        </div>
                        <div className={styles.cardContent}>
                            <span className={styles.cardLabel}>Savings Rate</span>
                            <span className={styles.cardValue}>{summary.overview?.savingsRate || 0}%</span>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Spending Breakdown */}
            {summary?.spendingByCategory?.length > 0 && (
                <motion.div
                    className={styles.breakdownSection}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <h3 className={styles.sectionTitle}>
                        <BarChart3 size={18} />
                        Spending by Category
                    </h3>
                    <div className={styles.categoryList}>
                        {summary.spendingByCategory.slice(0, 8).map((cat, index) => {
                            const total = summary.spendingByCategory.reduce((sum, c) => sum + c.amount, 0);
                            const percentage = total > 0 ? (cat.amount / total) * 100 : 0;
                            return (
                                <div key={cat.category} className={styles.categoryItem}>
                                    <div className={styles.categoryInfo}>
                                        <span className={styles.categoryName}>{cat.category}</span>
                                        <span className={styles.categoryAmount}>${cat.amount.toLocaleString()}</span>
                                    </div>
                                    <div className={styles.categoryBar}>
                                        <motion.div
                                            className={styles.categoryProgress}
                                            initial={{ width: 0 }}
                                            animate={{ width: `${percentage}%` }}
                                            transition={{ delay: 0.3 + index * 0.05 }}
                                        />
                                    </div>
                                    <span className={styles.categoryPercent}>{percentage.toFixed(1)}%</span>
                                </div>
                            );
                        })}
                    </div>
                </motion.div>
            )}

            {/* Export Options */}
            <motion.div
                className={styles.exportSection}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
            >
                <h3 className={styles.sectionTitle}>
                    <Download size={18} />
                    Export Options
                </h3>
                <div className={styles.exportGrid}>
                    <button
                        className={styles.exportCard}
                        onClick={() => handleExport('pdf')}
                        disabled={exporting !== null}
                    >
                        <div className={styles.exportIcon}>
                            {exporting === 'pdf' ? <Loader2 className={styles.spinner} /> : <FileText size={32} />}
                        </div>
                        <div className={styles.exportInfo}>
                            <span className={styles.exportTitle}>PDF Report</span>
                            <span className={styles.exportDesc}>Complete financial report with charts</span>
                        </div>
                    </button>

                    <button
                        className={styles.exportCard}
                        onClick={() => handleExport('transactions_csv')}
                        disabled={exporting !== null}
                    >
                        <div className={styles.exportIcon}>
                            {exporting === 'transactions_csv' ? <Loader2 className={styles.spinner} /> : <FileSpreadsheet size={32} />}
                        </div>
                        <div className={styles.exportInfo}>
                            <span className={styles.exportTitle}>Transactions CSV</span>
                            <span className={styles.exportDesc}>Export all transactions to spreadsheet</span>
                        </div>
                    </button>

                    <button
                        className={styles.exportCard}
                        onClick={() => handleExport('accounts_csv')}
                        disabled={exporting !== null}
                    >
                        <div className={styles.exportIcon}>
                            {exporting === 'accounts_csv' ? <Loader2 className={styles.spinner} /> : <FileSpreadsheet size={32} />}
                        </div>
                        <div className={styles.exportInfo}>
                            <span className={styles.exportTitle}>Accounts CSV</span>
                            <span className={styles.exportDesc}>Export account balances</span>
                        </div>
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default Reports;
