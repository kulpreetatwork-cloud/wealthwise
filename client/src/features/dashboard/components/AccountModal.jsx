import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Loader2, Wallet, PiggyBank, CreditCard, TrendingUp, Banknote } from 'lucide-react';
import toast from 'react-hot-toast';
import { useDashboardStore } from '../../../stores/dashboardStore';
import { useCurrency } from '../../../hooks';
import styles from './AccountModal.module.css';

const accountSchema = z.object({
    name: z.string().min(1, 'Account name is required').max(100),
    type: z.enum(['checking', 'savings', 'credit', 'investment', 'cash']),
    balance: z.number(),
    currency: z.string().default('INR'),
    institution: z.string().optional(),
    color: z.string().default('#6366f1'),
});

const accountTypes = [
    { value: 'checking', label: 'Checking', icon: Wallet, color: '#6366f1' },
    { value: 'savings', label: 'Savings', icon: PiggyBank, color: '#10b981' },
    { value: 'credit', label: 'Credit Card', icon: CreditCard, color: '#f59e0b' },
    { value: 'investment', label: 'Investment', icon: TrendingUp, color: '#8b5cf6' },
    { value: 'cash', label: 'Cash', icon: Banknote, color: '#14b8a6' },
];

const colors = [
    '#6366f1', '#8b5cf6', '#a855f7', '#d946ef',
    '#ec4899', '#f43f5e', '#ef4444', '#f97316',
    '#f59e0b', '#eab308', '#84cc16', '#22c55e',
    '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9',
    '#3b82f6',
];

const AccountModal = ({ isOpen, onClose, account, onSuccess }) => {
    const { createAccount, updateAccount, fetchAccounts } = useDashboardStore();
    const { symbol } = useCurrency();

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        reset,
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: zodResolver(accountSchema),
        defaultValues: {
            name: '',
            type: 'checking',
            balance: 0,
            currency: 'INR',
            institution: '',
            color: '#6366f1',
        },
    });

    const selectedType = watch('type');
    const selectedColor = watch('color');

    useEffect(() => {
        if (isOpen) {
            if (account) {
                reset({
                    name: account.name,
                    type: account.type,
                    balance: account.balance,
                    currency: account.currency || 'INR',
                    institution: account.institution || '',
                    color: account.color || '#6366f1',
                });
            } else {
                reset({
                    name: '',
                    type: 'checking',
                    balance: 0,
                    currency: 'INR',
                    institution: '',
                    color: '#6366f1',
                });
            }
        }
    }, [isOpen, account, reset]);

    // Update color when type changes
    useEffect(() => {
        if (!account) {
            const typeConfig = accountTypes.find((t) => t.value === selectedType);
            if (typeConfig) {
                setValue('color', typeConfig.color);
            }
        }
    }, [selectedType, account, setValue]);

    const onSubmit = async (data) => {
        let result;
        if (account) {
            result = await updateAccount(account._id, data);
        } else {
            result = await createAccount(data);
        }

        if (result.success) {
            toast.success(account ? 'Account updated!' : 'Account created!');
            fetchAccounts();
            onSuccess?.(result.data);
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
                            <h2>{account ? 'Edit Account' : 'Add Account'}</h2>
                            <button className={styles.closeBtn} onClick={onClose}>
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
                            {/* Account Type Selector */}
                            <div className={styles.typeGrid}>
                                {accountTypes.map((type) => (
                                    <label
                                        key={type.value}
                                        className={`${styles.typeCard} ${selectedType === type.value ? styles.selected : ''}`}
                                        style={{ '--type-color': type.color }}
                                    >
                                        <input
                                            type="radio"
                                            value={type.value}
                                            {...register('type')}
                                        />
                                        <type.icon size={20} />
                                        <span>{type.label}</span>
                                    </label>
                                ))}
                            </div>

                            {/* Account Name */}
                            <div className={styles.field}>
                                <label>Account Name</label>
                                <input
                                    type="text"
                                    placeholder="e.g., Main Checking"
                                    {...register('name')}
                                    className={errors.name ? styles.error : ''}
                                />
                                {errors.name && <span className={styles.errorText}>{errors.name.message}</span>}
                            </div>

                            {/* Balance */}
                            <div className={styles.field}>
                                <label>Current Balance</label>
                                <div className={styles.balanceInput}>
                                    <span className={styles.currency}>{symbol}</span>
                                    <input
                                        type="number"
                                        step="0.01"
                                        placeholder="0.00"
                                        {...register('balance', { valueAsNumber: true })}
                                    />
                                </div>
                            </div>

                            {/* Institution */}
                            <div className={styles.field}>
                                <label>Institution <span className={styles.optional}>(optional)</span></label>
                                <input
                                    type="text"
                                    placeholder="e.g., Chase, Bank of America"
                                    {...register('institution')}
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
                                        account ? 'Update Account' : 'Create Account'
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

export default AccountModal;
