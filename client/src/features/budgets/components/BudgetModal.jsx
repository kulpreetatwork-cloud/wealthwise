import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useBudgetStore } from '../../../stores/budgetStore';
import { useCurrency } from '../../../hooks';
import styles from './BudgetModal.module.css';

const budgetSchema = z.object({
    name: z.string().min(1, 'Budget name is required').max(100),
    category: z.string().min(1, 'Category is required'),
    amount: z.number().min(0.01, 'Amount must be greater than 0'),
    period: z.enum(['weekly', 'monthly', 'yearly']),
    alertThreshold: z.number().min(0).max(100).default(80),
    color: z.string().default('#6366f1'),
});

const categories = [
    'Food & Dining',
    'Shopping',
    'Transportation',
    'Bills & Utilities',
    'Entertainment',
    'Healthcare',
    'Education',
    'Travel',
    'Subscriptions',
    'Personal Care',
    'Groceries',
    'Other',
];

const colors = [
    '#6366f1', '#8b5cf6', '#a855f7', '#ec4899',
    '#f43f5e', '#ef4444', '#f97316', '#f59e0b',
    '#84cc16', '#22c55e', '#10b981', '#14b8a6',
    '#06b6d4', '#0ea5e9', '#3b82f6',
];

const BudgetModal = ({ isOpen, onClose, budget, onSuccess }) => {
    const { createBudget, updateBudget } = useBudgetStore();
    const { symbol } = useCurrency();

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        reset,
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: zodResolver(budgetSchema),
        defaultValues: {
            name: '',
            category: '',
            amount: '',
            period: 'monthly',
            alertThreshold: 80,
            color: '#6366f1',
        },
    });

    const selectedColor = watch('color');

    useEffect(() => {
        if (isOpen) {
            if (budget) {
                reset({
                    name: budget.name,
                    category: budget.category,
                    amount: budget.amount,
                    period: budget.period,
                    alertThreshold: budget.alertThreshold,
                    color: budget.color || '#6366f1',
                });
            } else {
                reset({
                    name: '',
                    category: '',
                    amount: '',
                    period: 'monthly',
                    alertThreshold: 80,
                    color: '#6366f1',
                });
            }
        }
    }, [isOpen, budget, reset]);

    const onSubmit = async (data) => {
        const budgetData = {
            ...data,
            amount: parseFloat(data.amount),
        };

        let result;
        if (budget) {
            result = await updateBudget(budget._id, budgetData);
        } else {
            result = await createBudget(budgetData);
        }

        if (result.success) {
            toast.success(budget ? 'Budget updated!' : 'Budget created!');
            onSuccess?.();
            onClose();
        } else {
            toast.error(result.error);
        }
    };

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
                            <h2>{budget ? 'Edit Budget' : 'Create Budget'}</h2>
                            <button className={styles.closeBtn} onClick={onClose}>
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
                            {/* Name */}
                            <div className={styles.field}>
                                <label>Budget Name</label>
                                <input
                                    type="text"
                                    placeholder="e.g., Monthly Groceries"
                                    {...register('name')}
                                    className={errors.name ? styles.error : ''}
                                />
                                {errors.name && <span className={styles.errorText}>{errors.name.message}</span>}
                            </div>

                            {/* Category */}
                            <div className={styles.field}>
                                <label>Category</label>
                                <select
                                    {...register('category')}
                                    className={errors.category ? styles.error : ''}
                                    disabled={!!budget}
                                >
                                    <option value="">Select category</option>
                                    {categories.map((cat) => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                                {errors.category && <span className={styles.errorText}>{errors.category.message}</span>}
                            </div>

                            {/* Amount */}
                            <div className={styles.field}>
                                <label>Budget Amount</label>
                                <div className={styles.amountInput}>
                                    <span className={styles.currency}>{symbol}</span>
                                    <input
                                        type="number"
                                        step="0.01"
                                        placeholder="0.00"
                                        {...register('amount', { valueAsNumber: true })}
                                        className={errors.amount ? styles.error : ''}
                                    />
                                </div>
                                {errors.amount && <span className={styles.errorText}>{errors.amount.message}</span>}
                            </div>

                            {/* Period */}
                            <div className={styles.field}>
                                <label>Period</label>
                                <div className={styles.periodSelector}>
                                    {['weekly', 'monthly', 'yearly'].map((period) => (
                                        <label
                                            key={period}
                                            className={`${styles.periodOption} ${watch('period') === period ? styles.selected : ''}`}
                                        >
                                            <input
                                                type="radio"
                                                value={period}
                                                {...register('period')}
                                            />
                                            <span>{period.charAt(0).toUpperCase() + period.slice(1)}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Alert Threshold */}
                            <div className={styles.field}>
                                <label>Alert at {watch('alertThreshold')}% spent</label>
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    {...register('alertThreshold', { valueAsNumber: true })}
                                    className={styles.rangeInput}
                                />
                            </div>

                            {/* Color Picker */}
                            <div className={styles.field}>
                                <label>Color</label>
                                <div className={styles.colorGrid}>
                                    {colors.map((color) => (
                                        <button
                                            key={color}
                                            type="button"
                                            className={`${styles.colorBtn} ${selectedColor === color ? styles.selectedColor : ''}`}
                                            style={{ background: color }}
                                            onClick={() => setValue('color', color)}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className={styles.actions}>
                                <button type="button" className={styles.cancelBtn} onClick={onClose}>
                                    Cancel
                                </button>
                                <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 size={16} className={styles.spinner} />
                                            Saving...
                                        </>
                                    ) : (
                                        budget ? 'Update Budget' : 'Create Budget'
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

export default BudgetModal;
