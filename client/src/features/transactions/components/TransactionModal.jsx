import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useTransactionStore } from '../../../stores/transactionStore';
import { useCurrency } from '../../../hooks';
import styles from './TransactionModal.module.css';

const transactionSchema = z.object({
    type: z.enum(['income', 'expense', 'transfer']),
    accountId: z.string().min(1, 'Please select an account'),
    amount: z.number().min(0.01, 'Amount must be greater than 0'),
    category: z.string().min(1, 'Category is required'),
    description: z.string().optional(),
    merchant: z.string().optional(),
    date: z.string().min(1, 'Date is required'),
    notes: z.string().optional(),
});

const categories = {
    income: ['Salary', 'Freelance', 'Investments', 'Bonus', 'Gift', 'Refund', 'Other'],
    expense: ['Food & Dining', 'Shopping', 'Transportation', 'Bills & Utilities', 'Entertainment', 'Healthcare', 'Education', 'Travel', 'Subscriptions', 'Other'],
    transfer: ['Transfer'],
};

const TransactionModal = ({ isOpen, onClose, transaction, accounts = [] }) => {
    const { createTransaction, updateTransaction, fetchTransactions } = useTransactionStore();
    const { symbol } = useCurrency();

    const safeAccounts = accounts || [];

    const {
        register,
        handleSubmit,
        watch,
        reset,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: zodResolver(transactionSchema),
        defaultValues: {
            type: 'expense',
            accountId: '',
            amount: '',
            category: '',
            description: '',
            merchant: '',
            date: new Date().toISOString().split('T')[0],
            notes: '',
        },
    });

    const selectedType = watch('type');

    // Reset form when modal opens/closes or transaction changes
    useEffect(() => {
        if (isOpen) {
            if (transaction) {
                // Editing mode
                reset({
                    type: transaction.type,
                    accountId: transaction.accountId?._id || transaction.accountId,
                    amount: transaction.amount,
                    category: transaction.category,
                    description: transaction.description || '',
                    merchant: transaction.merchant || '',
                    date: new Date(transaction.date).toISOString().split('T')[0],
                    notes: transaction.notes || '',
                });
            } else {
                // New transaction
                reset({
                    type: 'expense',
                    accountId: safeAccounts[0]?._id || '',
                    amount: '',
                    category: '',
                    description: '',
                    merchant: '',
                    date: new Date().toISOString().split('T')[0],
                    notes: '',
                });
            }
        }
    }, [isOpen, transaction, safeAccounts, reset]);

    const onSubmit = async (data) => {
        const transactionData = {
            ...data,
            amount: parseFloat(data.amount),
        };

        let result;
        if (transaction) {
            result = await updateTransaction(transaction._id, transactionData);
        } else {
            result = await createTransaction(transactionData);
        }

        if (result.success) {
            toast.success(transaction ? 'Transaction updated!' : 'Transaction added!');
            fetchTransactions();
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
                            <h2>{transaction ? 'Edit Transaction' : 'Add Transaction'}</h2>
                            <button className={styles.closeBtn} onClick={onClose}>
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
                            {/* Type Selector */}
                            <div className={styles.typeSelector}>
                                {['income', 'expense', 'transfer'].map((type) => (
                                    <label
                                        key={type}
                                        className={`${styles.typeOption} ${selectedType === type ? styles[type] : ''}`}
                                    >
                                        <input
                                            type="radio"
                                            value={type}
                                            {...register('type')}
                                        />
                                        <span>{type.charAt(0).toUpperCase() + type.slice(1)}</span>
                                    </label>
                                ))}
                            </div>

                            {/* Account */}
                            <div className={styles.field}>
                                <label>Account</label>
                                <select {...register('accountId')} className={errors.accountId ? styles.error : ''}>
                                    <option value="">Select account</option>
                                    {safeAccounts.map((acc) => (
                                        <option key={acc._id} value={acc._id}>{acc.name}</option>
                                    ))}
                                </select>
                                {errors.accountId && <span className={styles.errorText}>{errors.accountId.message}</span>}
                            </div>

                            {/* Amount */}
                            <div className={styles.field}>
                                <label>Amount</label>
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

                            {/* Category */}
                            <div className={styles.field}>
                                <label>Category</label>
                                <select {...register('category')} className={errors.category ? styles.error : ''}>
                                    <option value="">Select category</option>
                                    {categories[selectedType]?.map((cat) => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                                {errors.category && <span className={styles.errorText}>{errors.category.message}</span>}
                            </div>

                            {/* Date */}
                            <div className={styles.field}>
                                <label>Date</label>
                                <input
                                    type="date"
                                    {...register('date')}
                                    className={errors.date ? styles.error : ''}
                                />
                                {errors.date && <span className={styles.errorText}>{errors.date.message}</span>}
                            </div>

                            {/* Description */}
                            <div className={styles.field}>
                                <label>Description <span className={styles.optional}>(optional)</span></label>
                                <input
                                    type="text"
                                    placeholder="What's this transaction for?"
                                    {...register('description')}
                                />
                            </div>

                            {/* Merchant */}
                            {selectedType === 'expense' && (
                                <div className={styles.field}>
                                    <label>Merchant <span className={styles.optional}>(optional)</span></label>
                                    <input
                                        type="text"
                                        placeholder="Where did you spend?"
                                        {...register('merchant')}
                                    />
                                </div>
                            )}

                            {/* Notes */}
                            <div className={styles.field}>
                                <label>Notes <span className={styles.optional}>(optional)</span></label>
                                <textarea
                                    placeholder="Add any notes..."
                                    rows={3}
                                    {...register('notes')}
                                />
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
                                        transaction ? 'Update Transaction' : 'Add Transaction'
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

export default TransactionModal;
