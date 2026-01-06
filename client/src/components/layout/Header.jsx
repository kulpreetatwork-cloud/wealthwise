import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Menu,
    ChevronLeft,
    ChevronRight,
    Search,
    X
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useNotificationStore } from '../../stores/notificationStore';
import NotificationBell from '../shared/NotificationBell';
import styles from './Header.module.css';

const Header = ({ onMenuClick, onCollapseClick, collapsed }) => {
    const [showSearch, setShowSearch] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const location = useLocation();
    const { user } = useAuthStore();

    // Get page title from path
    const getPageTitle = () => {
        const path = location.pathname.slice(1);
        const titles = {
            dashboard: 'Dashboard',
            transactions: 'Transactions',
            budgets: 'Budgets',
            goals: 'Financial Goals',
            'ai-assistant': 'AI Assistant',
            investments: 'Investments',
            reports: 'Reports',
            settings: 'Settings',
        };
        return titles[path] || 'Dashboard';
    };

    // Get greeting based on time
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 17) return 'Good afternoon';
        return 'Good evening';
    };

    return (
        <header className={styles.header}>
            <div className={styles.left}>
                {/* Mobile menu button */}
                <button className={styles.menuBtn} onClick={onMenuClick}>
                    <Menu size={20} />
                </button>

                {/* Collapse button */}
                <button className={styles.collapseBtn} onClick={onCollapseClick}>
                    {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                </button>

                {/* Page info */}
                <div className={styles.pageInfo}>
                    <h1 className={styles.pageTitle}>{getPageTitle()}</h1>
                    <p className={styles.greeting}>
                        {getGreeting()}, {user?.profile?.firstName || 'there'}! 👋
                    </p>
                </div>
            </div>

            <div className={styles.right}>
                {/* Search */}
                <div className={`${styles.searchContainer} ${showSearch ? styles.searchOpen : ''}`}>
                    {showSearch ? (
                        <motion.div
                            className={styles.searchInput}
                            initial={{ width: 0, opacity: 0 }}
                            animate={{ width: 250, opacity: 1 }}
                            exit={{ width: 0, opacity: 0 }}
                        >
                            <Search size={16} className={styles.searchIcon} />
                            <input
                                type="text"
                                placeholder="Search transactions..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                autoFocus
                            />
                            <button onClick={() => { setShowSearch(false); setSearchQuery(''); }}>
                                <X size={16} />
                            </button>
                        </motion.div>
                    ) : (
                        <button
                            className={styles.iconBtn}
                            onClick={() => setShowSearch(true)}
                        >
                            <Search size={20} />
                        </button>
                    )}
                </div>

                {/* Notifications */}
                <NotificationBell />
            </div>
        </header>
    );
};

export default Header;
