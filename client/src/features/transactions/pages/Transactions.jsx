import { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import {
    Plus,
    Search,
    Filter,
    ArrowUpRight,
    ArrowDownRight,
    ArrowRight,
    MoreVertical,
    Edit2,
    Trash2,
    Loader2,
    X,
    ChevronLeft,
    ChevronRight,
    Download,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useTransactionStore } from '../../../stores/transactionStore';
import { useDashboardStore } from '../../../stores/dashboardStore';
import TransactionModal from '../components/TransactionModal';
import ConfirmModal from '../../../components/ui/ConfirmModal';
import { exportToCSV } from '../../../lib/exportUtils';
import styles from './Transactions.module.css';

const Transactions = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [showModal, setShowModal] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState(null);
    const [showFilters, setShowFilters] = useState(false);
    const [activeMenu, setActiveMenu] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const hasFetched = useRef(false);

    const {
        transactions,
        pagination,
        isLoading,
        filters,
        setFilters,
        clearFilters,
        fetchTransactions,
        deleteTransaction,
    } = useTransactionStore();

    const { accounts, fetchAccounts } = useDashboardStore();

    // Check for action param (from Quick Actions)
    useEffect(() => {
        const action = searchParams.get('action');
        if (action === 'add' || action === 'transfer') {
            setShowModal(true);
            setSearchParams({});
        }
    }, [searchParams, setSearchParams]);

    // Fetch transactions on mount
    useEffect(() => {
        if (hasFetched.current) return;
        hasFetched.current = true;
        fetchTransactions();
        fetchAccounts();
    }, []);

    const handleAddTransaction = () => {
        setEditingTransaction(null);
        setShowModal(true);
    };

    const handleEditTransaction = (transaction) => {
        setEditingTransaction(transaction);
        setShowModal(true);
        setActiveMenu(null);
    };

    const handleDeleteTransaction = async (id) => {
        setDeleteTarget(id);
    };

    const confirmDelete = async () => {
        if (!deleteTarget) return;
        const result = await deleteTransaction(deleteTarget);
        if (result.success) {
            toast.success('Transaction deleted');
        } else {
            toast.error(result.error);
        }
        setDeleteTarget(null);
        setActiveMenu(null);
    };

    const handlePageChange = (newPage) => {
        fetchTransactions(newPage);
    };

    const handleFilterChange = (key, value) => {
        setFilters({ [key]: value });
    };

    const handleApplyFilters = () => {
        fetchTransactions(1);
        setShowFilters(false);
    };

    const handleClearFilters = () => {
        clearFilters();
        fetchTransactions(1);
        setShowFilters(false);
    };

    const getTransactionIcon = (type) => {
        switch (type) {
            case 'income':
                return <ArrowDownRight size={16} className={styles.incomeIcon} />;
            case 'expense':
                return <ArrowUpRight size={16} className={styles.expenseIcon} />;
            default:
                return <ArrowRight size={16} className={styles.transferIcon} />;
        }
    };

    const formatAmount = (amount, type) => {
        const formatted = new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
        }).format(amount);
        return type === 'income' ? `+${formatted}` : `-${formatted}`;
    };

    return (
        <div className={styles.container}>
            {/* Header */}
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Transactions</h1>
                    <p className={styles.subtitle}>Manage your income and expenses</p>
                </div>
                <div className={styles.headerActions}>
                    {transactions.length > 0 && (
                        <button
                            className={styles.exportBtn}
                            onClick={() => {
                                exportToCSV(transactions);
                                toast.success('Transactions exported to CSV');
                            }}
                        >
                            <Download size={18} />
                            Export CSV
                        </button>
                    )}
                    <button className={styles.addBtn} onClick={handleAddTransaction}>
                        <Plus size={18} />
                        Add Transaction
                    </button>
                </div>
            </div>

            {/* Toolbar */}
            <div className={styles.toolbar}>
                <div className={styles.searchBox}>
                    <Search size={18} className={styles.searchIcon} />
                    <input
                        type="text"
                        placeholder="Search transactions..."
                        value={filters.search}
                        onChange={(e) => handleFilterChange('search', e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleApplyFilters()}
                    />
                </div>
                <button
                    className={`${styles.filterBtn} ${showFilters ? styles.active : ''}`}
                    onClick={() => setShowFilters(!showFilters)}
                >
                    <Filter size={18} />
                    Filters
                </button>
            </div>

            {/* Filters panel */}
            <AnimatePresence>
                {showFilters && (
                    <motion.div
                        className={styles.filtersPanel}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                    >
                        <div className={styles.filtersGrid}>
                            <div className={styles.filterGroup}>
                                <label>Type</label>
                                <select
                                    value={filters.type}
                                    onChange={(e) => handleFilterChange('type', e.target.value)}
                                >
                                    <option value="">All Types</option>
                                    <option value="income">Income</option>
                                    <option value="expense">Expense</option>
                                    <option value="transfer">Transfer</option>
                                </select>
                            </div>
                            <div className={styles.filterGroup}>
                                <label>Account</label>
                                <select
                                    value={filters.accountId}
                                    onChange={(e) => handleFilterChange('accountId', e.target.value)}
                                >
                                    <option value="">All Accounts</option>
                                    {accounts.map((acc) => (
                                        <option key={acc._id} value={acc._id}>{acc.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className={styles.filterGroup}>
                                <label>Start Date</label>
                                <input
                                    type="date"
                                    value={filters.startDate}
                                    onChange={(e) => handleFilterChange('startDate', e.target.value)}
                                />
                            </div>
                            <div className={styles.filterGroup}>
                                <label>End Date</label>
                                <input
                                    type="date"
                                    value={filters.endDate}
                                    onChange={(e) => handleFilterChange('endDate', e.target.value)}
                                />
                            </div>
                        </div>
                        <div className={styles.filterActions}>
                            <button className={styles.clearBtn} onClick={handleClearFilters}>
                                Clear
                            </button>
                            <button className={styles.applyBtn} onClick={handleApplyFilters}>
                                Apply Filters
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Transactions List */}
            <div className={styles.listContainer}>
                {isLoading ? (
                    <div className={styles.loading}>
                        <Loader2 size={32} className={styles.spinner} />
                    </div>
                ) : transactions.length === 0 ? (
                    <div className={styles.empty}>
                        <p>No transactions yet</p>
                        <span>Add your first transaction to start tracking</span>
                        <button className={styles.emptyBtn} onClick={handleAddTransaction}>
                            <Plus size={16} />
                            Add Transaction
                        </button>
                    </div>
                ) : (
                    <>
                        <div className={styles.list}>
                            {transactions.map((transaction) => (
                                <motion.div
                                    key={transaction._id}
                                    className={styles.item}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    layout
                                >
                                    <div className={styles.itemIcon}>
                                        {getTransactionIcon(transaction.type)}
                                    </div>
                                    <div className={styles.itemDetails}>
                                        <span className={styles.itemTitle}>
                                            {transaction.description || transaction.category}
                                        </span>
                                        <span className={styles.itemMeta}>
                                            {transaction.category}
                                            {transaction.accountId?.name && ` • ${transaction.accountId.name}`}
                                            {' • '}
                                            {format(new Date(transaction.date), 'MMM d, yyyy')}
                                        </span>
                                    </div>
                                    <span className={`${styles.itemAmount} ${styles[transaction.type]}`}>
                                        {formatAmount(transaction.amount, transaction.type)}
                                    </span>
                                    <div className={styles.itemActions}>
                                        <button
                                            className={styles.menuBtn}
                                            onClick={() => setActiveMenu(activeMenu === transaction._id ? null : transaction._id)}
                                        >
                                            <MoreVertical size={16} />
                                        </button>
                                        <AnimatePresence>
                                            {activeMenu === transaction._id && (
                                                <motion.div
                                                    className={styles.menu}
                                                    initial={{ opacity: 0, scale: 0.95 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    exit={{ opacity: 0, scale: 0.95 }}
                                                >
                                                    <button onClick={() => handleEditTransaction(transaction)}>
                                                        <Edit2 size={14} /> Edit
                                                    </button>
                                                    <button
                                                        className={styles.deleteBtn}
                                                        onClick={() => handleDeleteTransaction(transaction._id)}
                                                    >
                                                        <Trash2 size={14} /> Delete
                                                    </button>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Pagination */}
                        {pagination && pagination.pages > 1 && (
                            <div className={styles.pagination}>
                                <button
                                    disabled={pagination.page === 1}
                                    onClick={() => handlePageChange(pagination.page - 1)}
                                >
                                    <ChevronLeft size={18} />
                                </button>
                                <span>
                                    Page {pagination.page} of {pagination.pages}
                                </span>
                                <button
                                    disabled={pagination.page === pagination.pages}
                                    onClick={() => handlePageChange(pagination.page + 1)}
                                >
                                    <ChevronRight size={18} />
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Transaction Modal */}
            <TransactionModal
                isOpen={showModal}
                onClose={() => {
                    setShowModal(false);
                    setEditingTransaction(null);
                }}
                transaction={editingTransaction}
                accounts={accounts}
            />

            {/* Delete Confirmation Modal */}
            <ConfirmModal
                isOpen={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                onConfirm={confirmDelete}
                title="Delete Transaction"
                message="Are you sure you want to delete this transaction? This action cannot be undone."
                confirmText="Delete"
                type="danger"
            />
        </div>
    );
};

export default Transactions;
