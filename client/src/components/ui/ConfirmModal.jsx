import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Trash2, X, Loader2 } from 'lucide-react';
import { useState } from 'react';
import styles from './ConfirmModal.module.css';

/**
 * Premium confirmation modal for delete and destructive actions
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether modal is visible
 * @param {function} props.onClose - Called when modal is closed/cancelled
 * @param {function} props.onConfirm - Called when action is confirmed
 * @param {string} props.title - Modal title
 * @param {string} props.message - Confirmation message
 * @param {string} props.confirmText - Text for confirm button (default: "Delete")
 * @param {string} props.type - 'danger' | 'warning' | 'info' (default: 'danger')
 */
const ConfirmModal = ({
    isOpen,
    onClose,
    onConfirm,
    title = 'Confirm Action',
    message = 'Are you sure you want to proceed?',
    confirmText = 'Delete',
    type = 'danger',
}) => {
    const [loading, setLoading] = useState(false);

    const handleConfirm = async () => {
        setLoading(true);
        try {
            await onConfirm();
        } finally {
            setLoading(false);
        }
    };

    const getIcon = () => {
        switch (type) {
            case 'danger':
                return <Trash2 size={28} />;
            case 'warning':
                return <AlertTriangle size={28} />;
            default:
                return <AlertTriangle size={28} />;
        }
    };

    const getGradient = () => {
        switch (type) {
            case 'danger':
                return 'linear-gradient(135deg, #ef4444, #f97316)';
            case 'warning':
                return 'linear-gradient(135deg, #f59e0b, #eab308)';
            default:
                return 'linear-gradient(135deg, #6366f1, #8b5cf6)';
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                className={styles.overlay}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
            >
                <motion.div
                    className={styles.modal}
                    onClick={(e) => e.stopPropagation()}
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                >
                    <button className={styles.closeBtn} onClick={onClose}>
                        <X size={18} />
                    </button>

                    <div className={styles.iconWrapper} style={{ background: getGradient() }}>
                        {getIcon()}
                    </div>

                    <h2 className={styles.title}>{title}</h2>
                    <p className={styles.message}>{message}</p>

                    <div className={styles.actions}>
                        <button
                            className={styles.cancelBtn}
                            onClick={onClose}
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            className={`${styles.confirmBtn} ${styles[type]}`}
                            onClick={handleConfirm}
                            disabled={loading}
                        >
                            {loading ? (
                                <Loader2 size={18} className={styles.spinner} />
                            ) : (
                                <>
                                    {type === 'danger' && <Trash2 size={16} />}
                                    {confirmText}
                                </>
                            )}
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default ConfirmModal;
