import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, formatDistanceToNow } from 'date-fns';
import {
    Plus,
    Target,
    TrendingUp,
    Calendar,
    DollarSign,
    MoreVertical,
    Edit2,
    Trash2,
    Loader2,
    CheckCircle2,
    AlertTriangle,
    Clock,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useGoalStore } from '../../../stores/goalStore';
import { useCurrency } from '../../../hooks';
import GoalModal from '../components/GoalModal';
import ContributeModal from '../components/ContributeModal';
import ConfirmModal from '../../../components/ui/ConfirmModal';
import styles from './Goals.module.css';

const categoryIcons = {
    'Emergency Fund': '🛡️',
    'Vacation': '✈️',
    'Home': '🏠',
    'Car': '🚗',
    'Education': '🎓',
    'Retirement': '🏖️',
    'Wedding': '💒',
    'Electronics': '📱',
    'Debt Payoff': '💳',
    'Investment': '📈',
    'Other': '🎯',
};

const Goals = () => {
    const [showModal, setShowModal] = useState(false);
    const [showContributeModal, setShowContributeModal] = useState(false);
    const [editingGoal, setEditingGoal] = useState(null);
    const [selectedGoal, setSelectedGoal] = useState(null);
    const [activeMenu, setActiveMenu] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const hasFetched = useRef(false);
    const { formatLocal } = useCurrency();

    const {
        goals,
        summary,
        isLoading,
        fetchGoals,
        fetchSummary,
        deleteGoal,
    } = useGoalStore();

    useEffect(() => {
        if (hasFetched.current) return;
        hasFetched.current = true;
        fetchGoals();
        fetchSummary();
    }, []);

    const handleAddGoal = () => {
        setEditingGoal(null);
        setShowModal(true);
    };

    const handleEditGoal = (goal) => {
        setEditingGoal(goal);
        setShowModal(true);
        setActiveMenu(null);
    };

    const handleContribute = (goal) => {
        setSelectedGoal(goal);
        setShowContributeModal(true);
        setActiveMenu(null);
    };

    const handleDeleteGoal = async (id) => {
        setDeleteTarget(id);
    };

    const confirmDelete = async () => {
        if (!deleteTarget) return;
        const result = await deleteGoal(deleteTarget);
        if (result.success) {
            toast.success('Goal deleted');
            fetchSummary();
        } else {
            toast.error(result.error);
        }
        setDeleteTarget(null);
        setActiveMenu(null);
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'completed':
                return <CheckCircle2 size={16} className={styles.completedIcon} />;
            case 'on-track':
                return <TrendingUp size={16} className={styles.onTrackIcon} />;
            case 'behind':
                return <Clock size={16} className={styles.behindIcon} />;
            case 'at-risk':
                return <AlertTriangle size={16} className={styles.atRiskIcon} />;
            default:
                return null;
        }
    };

    return (
        <div className={styles.container}>
            {/* Header */}
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Financial Goals</h1>
                    <p className={styles.subtitle}>Track and achieve your savings goals</p>
                </div>
                <button className={styles.addBtn} onClick={handleAddGoal}>
                    <Plus size={18} />
                    Create Goal
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
                        <Target size={24} className={styles.summaryIcon} />
                        <div className={styles.summaryContent}>
                            <span className={styles.summaryValue}>{summary.totalGoals}</span>
                            <span className={styles.summaryLabel}>Total Goals</span>
                        </div>
                    </div>
                    <div className={styles.summaryCard}>
                        <DollarSign size={24} className={styles.summaryIcon} />
                        <div className={styles.summaryContent}>
                            <span className={styles.summaryValue}>{formatLocal(summary.totalSaved)}</span>
                            <span className={styles.summaryLabel}>Total Saved</span>
                        </div>
                    </div>
                    <div className={styles.summaryCard}>
                        <div className={styles.progressCircle}>
                            <svg viewBox="0 0 36 36">
                                <path
                                    className={styles.progressBg}
                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                />
                                <path
                                    className={styles.progressFill}
                                    strokeDasharray={`${summary.overallProgress}, 100`}
                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                />
                            </svg>
                            <span>{summary.overallProgress}%</span>
                        </div>
                        <div className={styles.summaryContent}>
                            <span className={styles.summaryLabel}>Overall Progress</span>
                        </div>
                    </div>
                    <div className={`${styles.summaryCard} ${styles.statusCard}`}>
                        <div className={styles.statusItem}>
                            <span className={styles.onTrack}>{summary.onTrack}</span>
                            <span>On Track</span>
                        </div>
                        <div className={styles.statusItem}>
                            <span className={styles.behind}>{summary.behind}</span>
                            <span>Behind</span>
                        </div>
                        <div className={styles.statusItem}>
                            <span className={styles.completed}>{summary.completed}</span>
                            <span>Done</span>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Goals Grid */}
            <div className={styles.goalsContainer}>
                {isLoading ? (
                    <div className={styles.loading}>
                        <Loader2 size={32} className={styles.spinner} />
                    </div>
                ) : goals.length === 0 ? (
                    <div className={styles.empty}>
                        <Target size={48} className={styles.emptyIcon} />
                        <p>No goals yet</p>
                        <span>Create your first financial goal to start saving</span>
                        <button className={styles.emptyBtn} onClick={handleAddGoal}>
                            <Plus size={16} />
                            Create Goal
                        </button>
                    </div>
                ) : (
                    <div className={styles.grid}>
                        {goals.map((goal) => (
                            <motion.div
                                key={goal._id}
                                className={`${styles.goalCard} ${goal.isCompleted ? styles.completed : ''}`}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                style={{ '--goal-color': goal.color }}
                            >
                                <div className={styles.goalHeader}>
                                    <div className={styles.goalCategory}>
                                        <span className={styles.categoryIcon}>
                                            {categoryIcons[goal.category] || '🎯'}
                                        </span>
                                        <span className={styles.categoryName}>{goal.category}</span>
                                    </div>
                                    <div className={styles.goalActions}>
                                        {getStatusIcon(goal.status)}
                                        <button
                                            className={styles.menuBtn}
                                            onClick={() => setActiveMenu(activeMenu === goal._id ? null : goal._id)}
                                        >
                                            <MoreVertical size={16} />
                                        </button>
                                        <AnimatePresence>
                                            {activeMenu === goal._id && (
                                                <motion.div
                                                    className={styles.menu}
                                                    initial={{ opacity: 0, scale: 0.95 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    exit={{ opacity: 0, scale: 0.95 }}
                                                >
                                                    {!goal.isCompleted && (
                                                        <button onClick={() => handleContribute(goal)}>
                                                            <DollarSign size={14} /> Add Money
                                                        </button>
                                                    )}
                                                    <button onClick={() => handleEditGoal(goal)}>
                                                        <Edit2 size={14} /> Edit
                                                    </button>
                                                    <button
                                                        className={styles.deleteBtn}
                                                        onClick={() => handleDeleteGoal(goal._id)}
                                                    >
                                                        <Trash2 size={14} /> Delete
                                                    </button>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>

                                <h3 className={styles.goalName}>{goal.name}</h3>

                                {goal.description && (
                                    <p className={styles.goalDescription}>{goal.description}</p>
                                )}

                                <div className={styles.goalProgress}>
                                    <div className={styles.goalAmounts}>
                                        <span className={styles.currentAmount}>{formatLocal(goal.currentAmount)}</span>
                                        <span className={styles.targetAmount}>of {formatLocal(goal.targetAmount)}</span>
                                    </div>
                                    <div className={styles.progressBar}>
                                        <div
                                            className={styles.progressFillBar}
                                            style={{ width: `${goal.progress}%` }}
                                        />
                                    </div>
                                    <div className={styles.goalMeta}>
                                        <span className={styles.remaining}>
                                            {formatLocal(goal.remaining)} left
                                        </span>
                                        <span className={styles.percent}>{goal.progress}%</span>
                                    </div>
                                </div>

                                <div className={styles.goalFooter}>
                                    <div className={styles.targetDate}>
                                        <Calendar size={14} />
                                        {goal.daysLeft > 0 ? (
                                            <span>{goal.daysLeft} days left</span>
                                        ) : goal.isCompleted ? (
                                            <span>Completed!</span>
                                        ) : (
                                            <span>Past due</span>
                                        )}
                                    </div>
                                    {!goal.isCompleted && (
                                        <button
                                            className={styles.contributeBtn}
                                            onClick={() => handleContribute(goal)}
                                        >
                                            Add Funds
                                        </button>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* Goal Modal */}
            <GoalModal
                isOpen={showModal}
                onClose={() => {
                    setShowModal(false);
                    setEditingGoal(null);
                }}
                goal={editingGoal}
                onSuccess={() => {
                    fetchGoals();
                    fetchSummary();
                }}
            />

            {/* Contribute Modal */}
            <ContributeModal
                isOpen={showContributeModal}
                onClose={() => {
                    setShowContributeModal(false);
                    setSelectedGoal(null);
                }}
                goal={selectedGoal}
                onSuccess={() => {
                    fetchGoals();
                    fetchSummary();
                }}
            />

            {/* Delete Confirmation Modal */}
            <ConfirmModal
                isOpen={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                onConfirm={confirmDelete}
                title="Delete Goal"
                message="Are you sure you want to delete this goal? All progress will be lost."
                confirmText="Delete"
                type="danger"
            />
        </div>
    );
};

export default Goals;
