import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useInvestmentStore } from '../../../stores/investmentStore';
import { useCurrency } from '../../../hooks';
import styles from './InvestmentModal.module.css';

const investmentSchema = z.object({
    name: z.string().min(1, 'Investment name is required').max(100),
    symbol: z.string().max(10).optional(),
    type: z.string().min(1, 'Type is required'),
    shares: z.number().min(0, 'Shares must be positive'),
    purchasePrice: z.number().min(0.01, 'Purchase price is required'),
    currentPrice: z.number().min(0).optional(),
    purchaseDate: z.string().min(1, 'Purchase date is required'),
    notes: z.string().max(500).optional(),
    color: z.string().default('#8b5cf6'),
});

const types = [
    { value: 'stock', label: 'Stock' },
    { value: 'etf', label: 'ETF' },
    { value: 'mutual_fund', label: 'Mutual Fund' },
    { value: 'bond', label: 'Bond' },
    { value: 'crypto', label: 'Cryptocurrency' },
    { value: 'real_estate', label: 'Real Estate' },
    { value: 'commodity', label: 'Commodity' },
    { value: 'other', label: 'Other' },
];

const colors = [
    '#8b5cf6', '#6366f1', '#a855f7', '#ec4899',
    '#f43f5e', '#ef4444', '#f97316', '#f59e0b',
    '#84cc16', '#22c55e', '#10b981', '#06b6d4',
];

const InvestmentModal = ({ isOpen, onClose, investment, onSuccess }) => {
    const { createInvestment, updateInvestment } = useInvestmentStore();
    const { symbol } = useCurrency();

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        reset,
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: zodResolver(investmentSchema),
        defaultValues: {
            name: '',
            symbol: '',
            type: 'stock',
            shares: '',
            purchasePrice: '',
            currentPrice: '',
            purchaseDate: new Date().toISOString().split('T')[0],
            notes: '',
            color: '#8b5cf6',
        },
    });

    const selectedColor = watch('color');

    useEffect(() => {
        if (isOpen) {
            if (investment) {
                reset({
                    name: investment.name,
                    symbol: investment.symbol || '',
                    type: investment.type,
                    shares: investment.shares,
                    purchasePrice: investment.purchasePrice,
                    currentPrice: investment.currentPrice,
                    purchaseDate: new Date(investment.purchaseDate).toISOString().split('T')[0],
                    notes: investment.notes || '',
                    color: investment.color || '#8b5cf6',
                });
            } else {
                reset({
                    name: '',
                    symbol: '',
                    type: 'stock',
                    shares: '',
                    purchasePrice: '',
                    currentPrice: '',
                    purchaseDate: new Date().toISOString().split('T')[0],
                    notes: '',
                    color: '#8b5cf6',
                });
            }
        }
    }, [isOpen, investment, reset]);

    const onSubmit = async (data) => {
        const investmentData = {
            ...data,
            shares: parseFloat(data.shares),
            purchasePrice: parseFloat(data.purchasePrice),
            currentPrice: data.currentPrice ? parseFloat(data.currentPrice) : parseFloat(data.purchasePrice),
        };

        let result;
        if (investment) {
            result = await updateInvestment(investment._id, investmentData);
        } else {
            result = await createInvestment(investmentData);
        }

        if (result.success) {
            toast.success(investment ? 'Investment updated!' : 'Investment added!');
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
                            <h2>{investment ? 'Edit Investment' : 'Add Investment'}</h2>
                            <button className={styles.closeBtn} onClick={onClose}>
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
                            {/* Name & Symbol */}
                            <div className={styles.row}>
                                <div className={styles.field}>
                                    <label>Investment Name</label>
                                    <input
                                        type="text"
                                        placeholder="e.g., Apple Inc."
                                        {...register('name')}
                                        className={errors.name ? styles.error : ''}
                                    />
                                    {errors.name && <span className={styles.errorText}>{errors.name.message}</span>}
                                </div>
                                <div className={styles.field}>
                                    <label>Symbol <span className={styles.optional}>(optional)</span></label>
                                    <input
                                        type="text"
                                        placeholder="e.g., AAPL"
                                        {...register('symbol')}
                                    />
                                </div>
                            </div>

                            {/* Type */}
                            <div className={styles.field}>
                                <label>Type</label>
                                <select {...register('type')} className={errors.type ? styles.error : ''}>
                                    {types.map((t) => (
                                        <option key={t.value} value={t.value}>{t.label}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Shares & Prices */}
                            <div className={styles.row}>
                                <div className={styles.field}>
                                    <label>Shares/Units</label>
                                    <input
                                        type="number"
                                        step="any"
                                        placeholder="0"
                                        {...register('shares', { valueAsNumber: true })}
                                        className={errors.shares ? styles.error : ''}
                                    />
                                    {errors.shares && <span className={styles.errorText}>{errors.shares.message}</span>}
                                </div>
                                <div className={styles.field}>
                                    <label>Purchase Price</label>
                                    <div className={styles.amountInput}>
                                        <span>{symbol}</span>
                                        <input
                                            type="number"
                                            step="0.01"
                                            placeholder="0.00"
                                            {...register('purchasePrice', { valueAsNumber: true })}
                                            className={errors.purchasePrice ? styles.error : ''}
                                        />
                                    </div>
                                    {errors.purchasePrice && <span className={styles.errorText}>{errors.purchasePrice.message}</span>}
                                </div>
                            </div>

                            {/* Current Price & Date */}
                            <div className={styles.row}>
                                <div className={styles.field}>
                                    <label>Current Price <span className={styles.optional}>(optional)</span></label>
                                    <div className={styles.amountInput}>
                                        <span>{symbol}</span>
                                        <input
                                            type="number"
                                            step="0.01"
                                            placeholder="Same as purchase"
                                            {...register('currentPrice', { valueAsNumber: true })}
                                        />
                                    </div>
                                </div>
                                <div className={styles.field}>
                                    <label>Purchase Date</label>
                                    <input
                                        type="date"
                                        {...register('purchaseDate')}
                                        className={errors.purchaseDate ? styles.error : ''}
                                    />
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

                            {/* Notes */}
                            <div className={styles.field}>
                                <label>Notes <span className={styles.optional}>(optional)</span></label>
                                <textarea
                                    placeholder="Add any notes..."
                                    rows={2}
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
                                        investment ? 'Update Investment' : 'Add Investment'
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

export default InvestmentModal;
