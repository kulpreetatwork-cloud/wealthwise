import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    LayoutDashboard,
    ArrowLeftRight,
    PiggyBank,
    Target,
    Receipt,
    Bot,
    TrendingUp,
    FileText,
    Settings,
    LogOut,
    X
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import styles from './Sidebar.module.css';

const Sidebar = ({ collapsed, mobileOpen, onMobileClose }) => {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();

    const navigation = [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Transactions', href: '/transactions', icon: ArrowLeftRight },
        { name: 'Budgets', href: '/budgets', icon: PiggyBank },
        { name: 'Goals', href: '/goals', icon: Target },
        { name: 'Bills', href: '/bills', icon: Receipt },
        { name: 'AI Assistant', href: '/ai-assistant', icon: Bot },
        { name: 'Investments', href: '/investments', icon: TrendingUp, roles: ['individual', 'business'] },
        { name: 'Reports', href: '/reports', icon: FileText, roles: ['individual', 'business'] },
        { name: 'Settings', href: '/settings', icon: Settings },
    ];

    // Filter navigation based on user role
    const filteredNav = navigation.filter(item => {
        if (!item.roles) return true;
        return item.roles.includes(user?.role);
    });

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <>
            <motion.aside
                className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''} ${mobileOpen ? styles.mobileOpen : ''}`}
                animate={{ width: collapsed ? 80 : 280 }}
                transition={{ duration: 0.3 }}
            >
                {/* Mobile close button */}
                <button
                    className={styles.mobileClose}
                    onClick={onMobileClose}
                >
                    <X size={20} />
                </button>

                {/* Logo */}
                <div className={styles.logo}>
                    <span className={styles.logoIcon}>💰</span>
                    {!collapsed && (
                        <motion.span
                            className={styles.logoText}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.1 }}
                        >
                            WealthWise
                        </motion.span>
                    )}
                </div>

                {/* Navigation */}
                <nav className={styles.nav}>
                    {filteredNav.map((item) => (
                        <NavLink
                            key={item.name}
                            to={item.href}
                            className={({ isActive }) =>
                                `${styles.navLink} ${isActive ? styles.active : ''}`
                            }
                        >
                            <item.icon size={20} className={styles.navIcon} />
                            {!collapsed && (
                                <motion.span
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.1 }}
                                >
                                    {item.name}
                                </motion.span>
                            )}
                        </NavLink>
                    ))}
                </nav>

                {/* User section */}
                <div className={styles.userSection}>
                    {/* Role badge */}
                    {!collapsed && user?.role && (
                        <div className={styles.roleBadge}>
                            {user.role === 'individual' && '👤 Individual'}
                            {user.role === 'student' && '🎓 Student'}
                            {user.role === 'business' && '💼 Business'}
                        </div>
                    )}

                    {/* User info */}
                    <div className={styles.userInfo}>
                        <div className={styles.avatar}>
                            {user?.profile?.firstName?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}
                        </div>
                        {!collapsed && (
                            <motion.div
                                className={styles.userDetails}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                            >
                                <span className={styles.userName}>
                                    {user?.profile?.firstName || 'User'}
                                </span>
                                <span className={styles.userEmail}>
                                    {user?.email}
                                </span>
                            </motion.div>
                        )}
                    </div>

                    {/* Logout button */}
                    <button
                        className={styles.logoutBtn}
                        onClick={handleLogout}
                        title="Logout"
                    >
                        <LogOut size={18} />
                        {!collapsed && <span>Logout</span>}
                    </button>
                </div>
            </motion.aside>
        </>
    );
};

export default Sidebar;
