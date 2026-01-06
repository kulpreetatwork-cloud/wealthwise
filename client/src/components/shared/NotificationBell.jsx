import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import {
    Bell,
    Check,
    CheckCheck,
    X,
    Trash2,
    TrendingUp,
    AlertTriangle,
    Target,
    CreditCard,
    Calendar,
    Info,
    Sparkles,
} from 'lucide-react';
import { useNotificationStore } from '../../stores/notificationStore';
import styles from './NotificationBell.module.css';

const typeIcons = {
    transaction: CreditCard,
    budget_warning: AlertTriangle,
    budget_exceeded: AlertTriangle,
    goal_progress: Target,
    goal_completed: Target,
    bill_reminder: Calendar,
    bill_overdue: Calendar,
    account_update: TrendingUp,
    system: Info,
    ai_insight: Sparkles,
};

const typeColors = {
    transaction: '#6366f1',
    budget_warning: '#f59e0b',
    budget_exceeded: '#ef4444',
    goal_progress: '#22c55e',
    goal_completed: '#10b981',
    bill_reminder: '#f97316',
    bill_overdue: '#ef4444',
    account_update: '#3b82f6',
    system: '#8b5cf6',
    ai_insight: '#a855f7',
};

const NotificationBell = () => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const {
        notifications,
        unreadCount,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        deleteNotification,
    } = useNotificationStore();

    // Close on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Fetch notifications when opened
    useEffect(() => {
        if (isOpen) {
            fetchNotifications();
        }
    }, [isOpen, fetchNotifications]);

    const handleNotificationClick = async (notification) => {
        if (!notification.isRead) {
            await markAsRead(notification._id);
        }
        if (notification.actionUrl) {
            window.location.href = notification.actionUrl;
        }
    };

    const getIcon = (type) => {
        const Icon = typeIcons[type] || Info;
        return <Icon size={16} style={{ color: typeColors[type] || '#6366f1' }} />;
    };

    return (
        <div className={styles.container} ref={dropdownRef}>
            <button
                className={styles.bellBtn}
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Notifications"
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className={styles.badge}>
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        className={styles.dropdown}
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                    >
                        <div className={styles.header}>
                            <h3>Notifications</h3>
                            {unreadCount > 0 && (
                                <button
                                    className={styles.markAllBtn}
                                    onClick={markAllAsRead}
                                    title="Mark all as read"
                                >
                                    <CheckCheck size={16} />
                                </button>
                            )}
                        </div>

                        <div className={styles.list}>
                            {notifications.length === 0 ? (
                                <div className={styles.empty}>
                                    <Bell size={32} />
                                    <p>No notifications yet</p>
                                </div>
                            ) : (
                                notifications.map((notification) => (
                                    <div
                                        key={notification._id}
                                        className={`${styles.item} ${!notification.isRead ? styles.unread : ''}`}
                                        onClick={() => handleNotificationClick(notification)}
                                    >
                                        <div className={styles.itemIcon}>
                                            {getIcon(notification.type)}
                                        </div>
                                        <div className={styles.itemContent}>
                                            <h4>{notification.title}</h4>
                                            <p>{notification.message}</p>
                                            <span className={styles.time}>
                                                {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                            </span>
                                        </div>
                                        <div className={styles.itemActions}>
                                            {!notification.isRead && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        markAsRead(notification._id);
                                                    }}
                                                    title="Mark as read"
                                                >
                                                    <Check size={14} />
                                                </button>
                                            )}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    deleteNotification(notification._id);
                                                }}
                                                title="Delete"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default NotificationBell;
