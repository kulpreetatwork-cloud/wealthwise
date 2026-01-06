import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, Target } from 'lucide-react';
import toast from 'react-hot-toast';
import { useGoalStore } from '../../../stores/goalStore';
import { useCurrency } from '../../../hooks';
import styles from './ContributeModal.module.css';

const ContributeModal = ({ isOpen, onClose, goal, onSuccess }) => {
    const [amount, setAmount] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { contributeToGoal } = useGoalStore();
    const { formatLocal, symbol } = useCurrency();

    const quickAmounts = [50, 100, 250, 500];

    const handleSubmit = async (e) => {
        e.preventDefault();
        const value = parseFloat(amount);

        if (!value || value <= 0) {
            toast.error('Please enter a valid amount');
            return;
        }

        setIsSubmitting(true);
        const result = await contributeToGoal(goal._id, value);
        setIsSubmitting(false);

        if (result.success) {
            toast.success(result.message || 'Contribution added!');
            setAmount('');
            onSuccess?.();
            onClose();
        } else {
            toast.error(result.error);
        }
    };

    if (!goal) return null;

    const remaining = goal.targetAmount - goal.currentAmount;

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className={styles.overlay}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                >
                    <motion.div
                        className={styles.modal}
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className={styles.header}>
                            <h2>Add to Goal</h2>
                            <button className={styles.closeBtn} onClick={onClose}>
                                <X size={20} />
                            </button>
                        </div>

                        <div className={styles.goalInfo}>
                            <Target size={24} style={{ color: goal.color }} />
                            <div>
                                <h3>{goal.name}</h3>
                                <p>
                                    {formatLocal(goal.currentAmount)} of {formatLocal(goal.targetAmount)} saved
                                </p>
                            </div>
                            <span className={styles.progress}>{goal.progress}%</span>
                        </div>

                        <form onSubmit={handleSubmit} className={styles.form}>
                            {/* Amount Input */}
                            <div className={styles.amountSection}>
                                <label>How much would you like to add?</label>
                                <div className={styles.amountInput}>
                                    <span className={styles.symbolPrefix}>{symbol}</span>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        placeholder="0.00"
                                        autoFocus
                                    />
                                </div>
                            </div>

                            {/* Quick Amount Buttons */}
                            <div className={styles.quickAmounts}>
                                {quickAmounts.map((val) => (
                                    <button
                                        key={val}
                                        type="button"
                                        className={styles.quickBtn}
                                        onClick={() => setAmount(val.toString())}
                                    >
                                        {symbol}{val}
                                    </button>
                                ))}
                                {remaining > 0 && remaining <= 1000 && (
                                    <button
                                        type="button"
                                        className={`${styles.quickBtn} ${styles.fillBtn}`}
                                        onClick={() => setAmount(remaining.toString())}
                                    >
                                        Fill ({formatLocal(remaining)})
                                    </button>
                                )}
                            </div>

                            {/* Remaining info */}
                            <p className={styles.remainingInfo}>
                                {formatLocal(remaining)} left to reach your goal
                            </p>

                            {/* Actions */}
                            <div className={styles.actions}>
                                <button type="button" className={styles.cancelBtn} onClick={onClose}>
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className={styles.submitBtn}
                                    disabled={isSubmitting || !amount}
                                    style={{ background: goal.color }}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 size={16} className={styles.spinner} />
                                            Adding...
                                        </>
                                    ) : (
                                        'Add Contribution'
                                    )}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default ContributeModal;
