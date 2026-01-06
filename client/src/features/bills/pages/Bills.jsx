import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, formatDistanceToNow } from 'date-fns';
import {
    Plus,
    Receipt,
    Calendar,
    Clock,
    AlertTriangle,
    CheckCircle2,
    MoreVertical,
    Edit2,
    Trash2,
    Loader2,
    DollarSign,
    Bell,
    Zap,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useBillStore } from '../../../stores/billStore';
import { useCurrency } from '../../../hooks';
import BillModal from '../components/BillModal';
import ConfirmModal from '../../../components/ui/ConfirmModal';
import styles from './Bills.module.css';

const categoryIcons = {
    utilities: '💡',
    rent: '🏠',
    mortgage: '🏦',
    insurance: '🛡️',
    subscription: '📺',
    loan: '💳',
    credit_card: '💳',
    other: '📋',
};

const categoryLabels = {
    utilities: 'Utilities',
    rent: 'Rent',
    mortgage: 'Mortgage',
    insurance: 'Insurance',
    subscription: 'Subscription',
    loan: 'Loan',
    credit_card: 'Credit Card',
    other: 'Other',
};

const frequencyLabels = {
    once: 'One-time',
    weekly: 'Weekly',
    biweekly: 'Bi-weekly',
    monthly: 'Monthly',
    quarterly: 'Quarterly',
    yearly: 'Yearly',
};

const Bills = () => {
    const [showModal, setShowModal] = useState(false);
    const [editingBill, setEditingBill] = useState(null);
    const [activeMenu, setActiveMenu] = useState(null);
    const [filter, setFilter] = useState('all');
    const [deleteTarget, setDeleteTarget] = useState(null);
    const hasFetched = useRef(false);
    const { formatLocal } = useCurrency();

    const {
        bills,
        summary,
        isLoading,
        fetchBills,
        fetchSummary,
        markPaid,
        deleteBill,
    } = useBillStore();

    useEffect(() => {
        if (hasFetched.current) return;
        hasFetched.current = true;
        fetchBills();
        fetchSummary();
    }, []);

    const handleAddBill = () => {
        setEditingBill(null);
        setShowModal(true);
    };

    const handleEditBill = (bill) => {
        setEditingBill(bill);
        setShowModal(true);
        setActiveMenu(null);
    };

    const handleMarkPaid = async (bill) => {
        const result = await markPaid(bill._id);
        if (result.success) {
            toast.success(`${bill.name} marked as paid!`);
            fetchSummary();
        } else {
            toast.error(result.error);
        }
        setActiveMenu(null);
    };

    const handleDeleteBill = async (id) => {
        setDeleteTarget(id);
    };

    const confirmDelete = async () => {
        if (!deleteTarget) return;
        const result = await deleteBill(deleteTarget);
        if (result.success) {
            toast.success('Bill deleted');
            fetchSummary();
        } else {
            toast.error(result.error);
        }
        setDeleteTarget(null);
        setActiveMenu(null);
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'paid':
                return <span className={`${styles.statusBadge} ${styles.paid}`}><CheckCircle2 size={12} /> Paid</span>;
            case 'overdue':
                return <span className={`${styles.statusBadge} ${styles.overdue}`}><AlertTriangle size={12} /> Overdue</span>;
            case 'upcoming':
                return <span className={`${styles.statusBadge} ${styles.upcoming}`}><Clock size={12} /> Due Soon</span>;
            default:
                return <span className={`${styles.statusBadge} ${styles.scheduled}`}><Calendar size={12} /> Scheduled</span>;
        }
    };

    const filteredBills = bills.filter(bill => {
        if (filter === 'all') return true;
        return bill.status === filter;
    });

    const overdueCount = bills.filter(b => b.status === 'overdue').length;
    const upcomingCount = bills.filter(b => b.status === 'upcoming').length;

    return (
        <div className={styles.container}>
            {/* Header */}
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>
                        <Receipt size={28} />
                        Bill Reminders
                    </h1>
                    <p className={styles.subtitle}>Track and manage your recurring bills</p>
                </div>
                <button className={styles.addBtn} onClick={handleAddBill}>
                    <Plus size={18} />
                    Add Bill
                </button>
            </div>

            {/* Summary Cards */}
            {summary && (
                <motion.div
                    className={styles.summaryGrid}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className={styles.summaryCard}>
                        <div className={styles.summaryIcon} style={{ background: 'linear-gradient(135deg, #f59e0b, #eab308)' }}>
                            <Receipt size={24} />
                        </div>
                        <div className={styles.summaryContent}>
                            <span className={styles.summaryValue}>{formatLocal(summary.unpaidTotal)}</span>
                            <span className={styles.summaryLabel}>Due This Month</span>
                        </div>
                    </div>
                    <div className={styles.summaryCard}>
                        <div className={styles.summaryIcon} style={{ background: 'linear-gradient(135deg, #ef4444, #f97316)' }}>
                            <AlertTriangle size={24} />
                        </div>
                        <div className={styles.summaryContent}>
                            <span className={styles.summaryValue}>{summary.overdueCount}</span>
                            <span className={styles.summaryLabel}>Overdue Bills</span>
                        </div>
                        {summary.overdueCount > 0 && (
                            <span className={styles.alertBadge}>{formatLocal(summary.overdueTotal)}</span>
                        )}
                    </div>
                    <div className={styles.summaryCard}>
                        <div className={styles.summaryIcon} style={{ background: 'linear-gradient(135deg, #10b981, #14b8a6)' }}>
                            <CheckCircle2 size={24} />
                        </div>
                        <div className={styles.summaryContent}>
                            <span className={styles.summaryValue}>{summary.paidCount}</span>
                            <span className={styles.summaryLabel}>Paid This Month</span>
                        </div>
                    </div>
                    <div className={styles.summaryCard}>
                        <div className={styles.summaryIcon} style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                            <DollarSign size={24} />
                        </div>
                        <div className={styles.summaryContent}>
                            <span className={styles.summaryValue}>{formatLocal(summary.totalMonthly)}</span>
                            <span className={styles.summaryLabel}>Total Monthly</span>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Filters */}
            <div className={styles.filters}>
                <button
                    className={`${styles.filterBtn} ${filter === 'all' ? styles.active : ''}`}
                    onClick={() => setFilter('all')}
                >
                    All Bills
                </button>
                <button
                    className={`${styles.filterBtn} ${filter === 'overdue' ? styles.active : ''}`}
                    onClick={() => setFilter('overdue')}
                >
                    Overdue {overdueCount > 0 && <span className={styles.filterBadge}>{overdueCount}</span>}
                </button>
                <button
                    className={`${styles.filterBtn} ${filter === 'upcoming' ? styles.active : ''}`}
                    onClick={() => setFilter('upcoming')}
                >
                    Due Soon {upcomingCount > 0 && <span className={styles.filterBadge}>{upcomingCount}</span>}
                </button>
                <button
                    className={`${styles.filterBtn} ${filter === 'paid' ? styles.active : ''}`}
                    onClick={() => setFilter('paid')}
                >
                    Paid
                </button>
            </div>

            {/* Bills List */}
            <div className={styles.billsContainer}>
                {isLoading ? (
                    <div className={styles.loading}>
                        <Loader2 size={32} className={styles.spinner} />
                    </div>
                ) : filteredBills.length === 0 ? (
                    <div className={styles.empty}>
                        <Receipt size={48} className={styles.emptyIcon} />
                        <p>{filter === 'all' ? 'No bills yet' : `No ${filter} bills`}</p>
                        <span>Add your first bill to start tracking</span>
                        {filter === 'all' && (
                            <button className={styles.emptyBtn} onClick={handleAddBill}>
                                <Plus size={16} />
                                Add Bill
                            </button>
                        )}
                    </div>
                ) : (
                    <div className={styles.billsList}>
                        {filteredBills.map((bill) => (
                            <motion.div
                                key={bill._id}
                                className={`${styles.billCard} ${styles[bill.status]}`}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                style={{ '--bill-color': bill.color }}
                            >
                                <div className={styles.billIcon}>
                                    <span>{categoryIcons[bill.category] || '📋'}</span>
                                </div>

                                <div className={styles.billInfo}>
                                    <div className={styles.billHeader}>
                                        <h3>{bill.name}</h3>
                                        {getStatusBadge(bill.status)}
                                    </div>
                                    <div className={styles.billMeta}>
                                        <span className={styles.category}>{categoryLabels[bill.category]}</span>
                                        <span className={styles.frequency}>{frequencyLabels[bill.frequency]}</span>
                                        {bill.autoPay && (
                                            <span className={styles.autoPay}>
                                                <Zap size={12} /> Auto-pay
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className={styles.billAmount}>
                                    <span className={styles.amount}>{formatLocal(bill.amount)}</span>
                                    <span className={styles.dueDate}>
                                        {bill.status === 'paid'
                                            ? `Paid ${format(new Date(bill.paidDate), 'MMM d')}`
                                            : `Due ${format(new Date(bill.dueDate), 'MMM d')}`
                                        }
                                    </span>
                                </div>

                                <div className={styles.billActions}>
                                    {bill.status !== 'paid' && (
                                        <button
                                            className={styles.payBtn}
                                            onClick={() => handleMarkPaid(bill)}
                                        >
                                            <CheckCircle2 size={16} />
                                            Pay
                                        </button>
                                    )}
                                    <button
                                        className={styles.menuBtn}
                                        onClick={() => setActiveMenu(activeMenu === bill._id ? null : bill._id)}
                                    >
                                        <MoreVertical size={16} />
                                    </button>
                                    <AnimatePresence>
                                        {activeMenu === bill._id && (
                                            <motion.div
                                                className={styles.menu}
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.95 }}
                                            >
                                                <button onClick={() => handleEditBill(bill)}>
                                                    <Edit2 size={14} /> Edit
                                                </button>
                                                <button
                                                    className={styles.deleteBtn}
                                                    onClick={() => handleDeleteBill(bill._id)}
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
                )}
            </div>

            {/* Bill Modal */}
            <BillModal
                isOpen={showModal}
                onClose={() => {
                    setShowModal(false);
                    setEditingBill(null);
                }}
                bill={editingBill}
                onSuccess={() => {
                    fetchBills();
                    fetchSummary();
                }}
            />

            {/* Delete Confirmation Modal */}
            <ConfirmModal
                isOpen={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                onConfirm={confirmDelete}
                title="Delete Bill"
                message="Are you sure you want to delete this bill? This action cannot be undone."
                confirmText="Delete"
                type="danger"
            />
        </div>
    );
};

export default Bills;
