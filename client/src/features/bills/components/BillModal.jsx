import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Receipt, Calendar, Bell, Zap, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useBillStore } from '../../../stores/billStore';
import styles from './BillModal.module.css';

const categories = [
    { value: 'utilities', label: 'Utilities', icon: '💡' },
    { value: 'rent', label: 'Rent', icon: '🏠' },
    { value: 'mortgage', label: 'Mortgage', icon: '🏦' },
    { value: 'insurance', label: 'Insurance', icon: '🛡️' },
    { value: 'subscription', label: 'Subscription', icon: '📺' },
    { value: 'loan', label: 'Loan', icon: '💳' },
    { value: 'credit_card', label: 'Credit Card', icon: '💳' },
    { value: 'other', label: 'Other', icon: '📋' },
];

const frequencies = [
    { value: 'once', label: 'One-time' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'biweekly', label: 'Bi-weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'quarterly', label: 'Quarterly' },
    { value: 'yearly', label: 'Yearly' },
];

const colors = [
    '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e',
    '#f59e0b', '#10b981', '#06b6d4', '#3b82f6',
];

const BillModal = ({ isOpen, onClose, bill, onSuccess }) => {
    const { createBill, updateBill } = useBillStore();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        amount: '',
        category: 'utilities',
        dueDate: '',
        frequency: 'monthly',
        autoPay: false,
        reminderDays: 3,
        notes: '',
        color: '#f59e0b',
    });

    useEffect(() => {
        if (bill) {
            setFormData({
                name: bill.name,
                amount: bill.amount,
                category: bill.category,
                dueDate: bill.dueDate ? new Date(bill.dueDate).toISOString().split('T')[0] : '',
                frequency: bill.frequency,
                autoPay: bill.autoPay || false,
                reminderDays: bill.reminderDays ?? 3,
                notes: bill.notes || '',
                color: bill.color || '#f59e0b',
            });
        } else {
            // Set default date to tomorrow
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            setFormData({
                name: '',
                amount: '',
                category: 'utilities',
                dueDate: tomorrow.toISOString().split('T')[0],
                frequency: 'monthly',
                autoPay: false,
                reminderDays: 3,
                notes: '',
                color: '#f59e0b',
            });
        }
    }, [bill, isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const data = {
            ...formData,
            amount: parseFloat(formData.amount),
        };

        const result = bill
            ? await updateBill(bill._id, data)
            : await createBill(data);

        setLoading(false);

        if (result.success) {
            toast.success(bill ? 'Bill updated!' : 'Bill created!');
            onSuccess?.();
            onClose();
        } else {
            toast.error(result.error);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className={styles.overlay} onClick={onClose}>
                <motion.div
                    className={styles.modal}
                    onClick={(e) => e.stopPropagation()}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                >
                    <div className={styles.header}>
                        <div className={styles.headerIcon} style={{ background: formData.color }}>
                            <Receipt size={24} />
                        </div>
                        <div>
                            <h2>{bill ? 'Edit Bill' : 'Add New Bill'}</h2>
                            <p>Set up a bill reminder</p>
                        </div>
                        <button className={styles.closeBtn} onClick={onClose}>
                            <X size={20} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className={styles.form}>
                        <div className={styles.formGrid}>
                            <div className={styles.formGroup}>
                                <label>Bill Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g. Electric Bill"
                                    required
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Amount</label>
                                <div className={styles.amountInput}>
                                    <span className={styles.currencyPrefix}>₹</span>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={formData.amount}
                                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                        placeholder="0.00"
                                        required
                                    />
                                </div>
                            </div>
                            <div className={styles.formGroup}>
                                <label>Category</label>
                                <select
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                >
                                    {categories.map(cat => (
                                        <option key={cat.value} value={cat.value}>
                                            {cat.icon} {cat.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className={styles.formGroup}>
                                <label>Due Date</label>
                                <input
                                    type="date"
                                    value={formData.dueDate}
                                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                                    required
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Frequency</label>
                                <select
                                    value={formData.frequency}
                                    onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                                >
                                    {frequencies.map(freq => (
                                        <option key={freq.value} value={freq.value}>
                                            {freq.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className={styles.formGroup}>
                                <label>Remind Me (days before)</label>
                                <select
                                    value={formData.reminderDays}
                                    onChange={(e) => setFormData({ ...formData, reminderDays: parseInt(e.target.value) })}
                                >
                                    <option value={0}>On due date</option>
                                    <option value={1}>1 day before</option>
                                    <option value={3}>3 days before</option>
                                    <option value={7}>1 week before</option>
                                    <option value={14}>2 weeks before</option>
                                </select>
                            </div>
                        </div>

                        <div className={styles.toggleRow}>
                            <div className={styles.toggleItem}>
                                <div className={styles.toggleInfo}>
                                    <Zap size={18} />
                                    <div>
                                        <span>Auto-pay enabled</span>
                                        <p>Mark this bill as automatically paid</p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    className={`${styles.toggle} ${formData.autoPay ? styles.on : ''}`}
                                    onClick={() => setFormData({ ...formData, autoPay: !formData.autoPay })}
                                >
                                    <span className={styles.toggleHandle} />
                                </button>
                            </div>
                        </div>

                        <div className={styles.formGroup}>
                            <label>Color</label>
                            <div className={styles.colorPicker}>
                                {colors.map((color) => (
                                    <button
                                        key={color}
                                        type="button"
                                        className={`${styles.colorBtn} ${formData.color === color ? styles.active : ''}`}
                                        style={{ background: color }}
                                        onClick={() => setFormData({ ...formData, color })}
                                    />
                                ))}
                            </div>
                        </div>

                        <div className={styles.formGroup}>
                            <label>Notes (optional)</label>
                            <textarea
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                placeholder="Add any notes..."
                                rows={2}
                            />
                        </div>

                        <div className={styles.actions}>
                            <button type="button" className={styles.cancelBtn} onClick={onClose}>
                                Cancel
                            </button>
                            <button type="submit" className={styles.submitBtn} disabled={loading}>
                                {loading ? (
                                    <Loader2 size={18} className={styles.spinner} />
                                ) : bill ? (
                                    'Update Bill'
                                ) : (
                                    'Add Bill'
                                )}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default BillModal;
