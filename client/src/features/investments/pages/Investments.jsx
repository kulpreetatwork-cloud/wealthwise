import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus,
    TrendingUp,
    TrendingDown,
    DollarSign,
    PieChart,
    MoreVertical,
    Edit2,
    Trash2,
    Loader2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useInvestmentStore } from '../../../stores/investmentStore';
import { useCurrency } from '../../../hooks';
import InvestmentModal from '../components/InvestmentModal';
import ConfirmModal from '../../../components/ui/ConfirmModal';
import styles from './Investments.module.css';

const typeLabels = {
    stock: 'Stock',
    etf: 'ETF',
    mutual_fund: 'Mutual Fund',
    bond: 'Bond',
    crypto: 'Crypto',
    real_estate: 'Real Estate',
    commodity: 'Commodity',
    other: 'Other',
};

const Investments = () => {
    const [showModal, setShowModal] = useState(false);
    const [editingInvestment, setEditingInvestment] = useState(null);
    const [activeMenu, setActiveMenu] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const hasFetched = useRef(false);
    const { formatLocal } = useCurrency();

    const {
        investments,
        summary,
        isLoading,
        fetchInvestments,
        fetchSummary,
        deleteInvestment,
    } = useInvestmentStore();

    useEffect(() => {
        if (hasFetched.current) return;
        hasFetched.current = true;
        fetchInvestments();
        fetchSummary();
    }, []);

    const handleAddInvestment = () => {
        setEditingInvestment(null);
        setShowModal(true);
    };

    const handleEditInvestment = (investment) => {
        setEditingInvestment(investment);
        setShowModal(true);
        setActiveMenu(null);
    };

    const handleDeleteInvestment = async (id) => {
        setDeleteTarget(id);
    };

    const confirmDelete = async () => {
        if (!deleteTarget) return;
        const result = await deleteInvestment(deleteTarget);
        if (result.success) {
            toast.success('Investment deleted');
            fetchSummary();
        } else {
            toast.error(result.error);
        }
        setDeleteTarget(null);
        setActiveMenu(null);
    };

    const formatPercent = (value) => {
        const num = parseFloat(value) || 0;
        return `${num >= 0 ? '+' : ''}${num.toFixed(2)}%`;
    };

    return (
        <div className={styles.container}>
            {/* Header */}
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Investments</h1>
                    <p className={styles.subtitle}>Track your investment portfolio</p>
                </div>
                <button className={styles.addBtn} onClick={handleAddInvestment}>
                    <Plus size={18} />
                    Add Investment
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
                        <DollarSign size={24} className={styles.summaryIcon} />
                        <div className={styles.summaryContent}>
                            <span className={styles.summaryValue}>{formatLocal(summary.currentValue)}</span>
                            <span className={styles.summaryLabel}>Current Value</span>
                        </div>
                    </div>
                    <div className={styles.summaryCard}>
                        <PieChart size={24} className={styles.summaryIcon} />
                        <div className={styles.summaryContent}>
                            <span className={styles.summaryValue}>{formatLocal(summary.totalInvested)}</span>
                            <span className={styles.summaryLabel}>Total Invested</span>
                        </div>
                    </div>
                    <div className={`${styles.summaryCard} ${summary.totalGainLoss >= 0 ? styles.positive : styles.negative}`}>
                        {summary.totalGainLoss >= 0 ? (
                            <TrendingUp size={24} className={styles.summaryIcon} />
                        ) : (
                            <TrendingDown size={24} className={styles.summaryIcon} />
                        )}
                        <div className={styles.summaryContent}>
                            <span className={styles.summaryValue}>{formatLocal(summary.totalGainLoss)}</span>
                            <span className={styles.summaryLabel}>Total {summary.totalGainLoss >= 0 ? 'Gain' : 'Loss'}</span>
                        </div>
                    </div>
                    <div className={`${styles.summaryCard} ${parseFloat(summary.totalGainLossPercent) >= 0 ? styles.positive : styles.negative}`}>
                        <div className={styles.percentBadge}>
                            <span>{formatPercent(summary.totalGainLossPercent)}</span>
                        </div>
                        <div className={styles.summaryContent}>
                            <span className={styles.summaryLabel}>Return</span>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Investments Grid */}
            <div className={styles.investmentsContainer}>
                {isLoading ? (
                    <div className={styles.loading}>
                        <Loader2 size={32} className={styles.spinner} />
                    </div>
                ) : investments.length === 0 ? (
                    <div className={styles.empty}>
                        <TrendingUp size={48} className={styles.emptyIcon} />
                        <p>No investments yet</p>
                        <span>Start building your portfolio by adding investments</span>
                        <button className={styles.emptyBtn} onClick={handleAddInvestment}>
                            <Plus size={16} />
                            Add Investment
                        </button>
                    </div>
                ) : (
                    <div className={styles.grid}>
                        {investments.map((investment) => (
                            <motion.div
                                key={investment._id}
                                className={styles.investmentCard}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                style={{ '--investment-color': investment.color }}
                            >
                                <div className={styles.cardHeader}>
                                    <div className={styles.cardInfo}>
                                        <h3>{investment.name}</h3>
                                        {investment.symbol && <span className={styles.symbol}>{investment.symbol}</span>}
                                    </div>
                                    <div className={styles.cardActions}>
                                        <span className={styles.typeBadge}>{typeLabels[investment.type]}</span>
                                        <button
                                            className={styles.menuBtn}
                                            onClick={() => setActiveMenu(activeMenu === investment._id ? null : investment._id)}
                                        >
                                            <MoreVertical size={16} />
                                        </button>
                                        <AnimatePresence>
                                            {activeMenu === investment._id && (
                                                <motion.div
                                                    className={styles.menu}
                                                    initial={{ opacity: 0, scale: 0.95 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    exit={{ opacity: 0, scale: 0.95 }}
                                                >
                                                    <button onClick={() => handleEditInvestment(investment)}>
                                                        <Edit2 size={14} /> Edit
                                                    </button>
                                                    <button
                                                        className={styles.deleteBtn}
                                                        onClick={() => handleDeleteInvestment(investment._id)}
                                                    >
                                                        <Trash2 size={14} /> Delete
                                                    </button>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>

                                <div className={styles.cardValues}>
                                    <div className={styles.valueRow}>
                                        <span>Shares</span>
                                        <span>{investment.shares}</span>
                                    </div>
                                    <div className={styles.valueRow}>
                                        <span>Current Price</span>
                                        <span>${(investment.currentPrice || 0).toFixed(2)}</span>
                                    </div>
                                    <div className={styles.valueRow}>
                                        <span>Current Value</span>
                                        <span className={styles.valueHighlight}>{formatLocal(investment.currentValue)}</span>
                                    </div>
                                </div>

                                <div className={`${styles.cardFooter} ${investment.gainLoss >= 0 ? styles.positive : styles.negative}`}>
                                    <span>{investment.gainLoss >= 0 ? '+' : ''}{formatLocal(investment.gainLoss)}</span>
                                    <span>{formatPercent(investment.gainLossPercent)}</span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* Investment Modal */}
            <InvestmentModal
                isOpen={showModal}
                onClose={() => {
                    setShowModal(false);
                    setEditingInvestment(null);
                }}
                investment={editingInvestment}
                onSuccess={() => {
                    fetchInvestments();
                    fetchSummary();
                }}
            />

            {/* Delete Confirmation Modal */}
            <ConfirmModal
                isOpen={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                onConfirm={confirmDelete}
                title="Delete Investment"
                message="Are you sure you want to delete this investment from your portfolio?"
                confirmText="Delete"
                type="danger"
            />
        </div>
    );
};

export default Investments;
