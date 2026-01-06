import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useGoalStore } from '../../../stores/goalStore';
import { useCurrency } from '../../../hooks';
import styles from './GoalModal.module.css';

const goalSchema = z.object({
    name: z.string().min(1, 'Goal name is required').max(100),
    description: z.string().max(500).optional(),
    category: z.string().min(1, 'Category is required'),
    targetAmount: z.number().min(1, 'Target amount must be at least ₹1'),
    currentAmount: z.number().min(0).default(0),
    targetDate: z.string().min(1, 'Target date is required'),
    priority: z.enum(['low', 'medium', 'high']),
    color: z.string().default('#6366f1'),
});

const categories = [
    'Emergency Fund',
    'Vacation',
    'Home',
    'Car',
    'Education',
    'Retirement',
    'Wedding',
    'Electronics',
    'Debt Payoff',
    'Investment',
    'Other',
];

const colors = [
    '#6366f1', '#8b5cf6', '#a855f7', '#ec4899',
    '#f43f5e', '#ef4444', '#f97316', '#f59e0b',
    '#84cc16', '#22c55e', '#10b981', '#14b8a6',
    '#06b6d4', '#0ea5e9', '#3b82f6',
];

const GoalModal = ({ isOpen, onClose, goal, onSuccess }) => {
    const { createGoal, updateGoal } = useGoalStore();
    const { symbol } = useCurrency();

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        reset,
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: zodResolver(goalSchema),
        defaultValues: {
            name: '',
            description: '',
            category: '',
            targetAmount: '',
            currentAmount: 0,
            targetDate: '',
            priority: 'medium',
            color: '#6366f1',
        },
    });

    const selectedColor = watch('color');

    useEffect(() => {
        if (isOpen) {
            if (goal) {
                reset({
                    name: goal.name,
                    description: goal.description || '',
                    category: goal.category,
                    targetAmount: goal.targetAmount,
                    currentAmount: goal.currentAmount,
                    targetDate: new Date(goal.targetDate).toISOString().split('T')[0],
                    priority: goal.priority,
                    color: goal.color || '#6366f1',
                });
            } else {
                const defaultDate = new Date();
                defaultDate.setMonth(defaultDate.getMonth() + 6);
                reset({
                    name: '',
                    description: '',
                    category: '',
                    targetAmount: '',
                    currentAmount: 0,
                    targetDate: defaultDate.toISOString().split('T')[0],
                    priority: 'medium',
                    color: '#6366f1',
                });
            }
        }
    }, [isOpen, goal, reset]);

    const onSubmit = async (data) => {
        const goalData = {
            ...data,
            targetAmount: parseFloat(data.targetAmount),
            currentAmount: parseFloat(data.currentAmount) || 0,
        };

        let result;
        if (goal) {
            result = await updateGoal(goal._id, goalData);
        } else {
            result = await createGoal(goalData);
        }

        if (result.success) {
            toast.success(goal ? 'Goal updated!' : 'Goal created!');
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
                            <h2>{goal ? 'Edit Goal' : 'Create Goal'}</h2>
                            <button className={styles.closeBtn} onClick={onClose}>
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
                            {/* Name */}
                            <div className={styles.field}>
                                <label>Goal Name</label>
                                <input
                                    type="text"
                                    placeholder="e.g., Emergency Fund"
                                    {...register('name')}
                                    className={errors.name ? styles.error : ''}
                                />
                                {errors.name && <span className={styles.errorText}>{errors.name.message}</span>}
                            </div>

                            {/* Description */}
                            <div className={styles.field}>
                                <label>Description <span className={styles.optional}>(optional)</span></label>
                                <textarea
                                    placeholder="What's this goal for?"
                                    rows={2}
                                    {...register('description')}
                                />
                            </div>

                            {/* Category */}
                            <div className={styles.field}>
                                <label>Category</label>
                                <select
                                    {...register('category')}
                                    className={errors.category ? styles.error : ''}
                                >
                                    <option value="">Select category</option>
                                    {categories.map((cat) => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                                {errors.category && <span className={styles.errorText}>{errors.category.message}</span>}
                            </div>

                            {/* Amounts */}
                            <div className={styles.row}>
                                <div className={styles.field}>
                                    <label>Target Amount</label>
                                    <div className={styles.amountInput}>
                                        <span>{symbol}</span>
                                        <input
                                            type="number"
                                            step="0.01"
                                            placeholder="10000"
                                            {...register('targetAmount', { valueAsNumber: true })}
                                            className={errors.targetAmount ? styles.error : ''}
                                        />
                                    </div>
                                    {errors.targetAmount && <span className={styles.errorText}>{errors.targetAmount.message}</span>}
                                </div>
                                <div className={styles.field}>
                                    <label>Starting Amount</label>
                                    <div className={styles.amountInput}>
                                        <span>{symbol}</span>
                                        <input
                                            type="number"
                                            step="0.01"
                                            placeholder="0"
                                            {...register('currentAmount', { valueAsNumber: true })}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Target Date & Priority */}
                            <div className={styles.row}>
                                <div className={styles.field}>
                                    <label>Target Date</label>
                                    <input
                                        type="date"
                                        {...register('targetDate')}
                                        className={errors.targetDate ? styles.error : ''}
                                    />
                                    {errors.targetDate && <span className={styles.errorText}>{errors.targetDate.message}</span>}
                                </div>
                                <div className={styles.field}>
                                    <label>Priority</label>
                                    <select {...register('priority')}>
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                    </select>
                                </div>
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
                                        goal ? 'Update Goal' : 'Create Goal'
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

export default GoalModal;
