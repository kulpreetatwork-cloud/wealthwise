import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import {
    Wallet,
    TrendingUp,
    TrendingDown,
    ArrowUpRight,
    ArrowDownRight,
    Plus,
    Loader2,
    RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useDashboardStore } from '../../../stores/dashboardStore';
import { useAuthStore } from '../../../stores/authStore';
import { useCurrency } from '../../../hooks';
import StatCard from '../components/StatCard';
import AccountCard from '../components/AccountCard';
import RecentTransactions from '../components/RecentTransactions';
import SpendingChart from '../components/SpendingChart';
import TrendChart from '../components/TrendChart';
import QuickActions from '../components/QuickActions';
import AccountModal from '../components/AccountModal';
import ConfirmModal from '../../../components/ui/ConfirmModal';
import StudentDashboard from '../components/StudentDashboard';
import BusinessDashboard from '../components/BusinessDashboard';
import styles from './Dashboard.module.css';

const Dashboard = () => {
    const { user } = useAuthStore();
    const { dashboardData, isLoading, error, fetchDashboardData, deleteAccount } = useDashboardStore();
    const { format: formatCurrency, formatLocal } = useCurrency();
    const [hasLoaded, setHasLoaded] = useState(false);
    const [showAccountModal, setShowAccountModal] = useState(false);
    const [editingAccount, setEditingAccount] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const hasFetched = useRef(false);

    // Role check
    const userRole = user?.role || 'individual';

    useEffect(() => {
        if (hasFetched.current) return;
        hasFetched.current = true;

        const loadData = async () => {
            const result = await fetchDashboardData();
            setHasLoaded(true);
            if (!result.success && result.error) {
                console.log('Dashboard load result:', result);
            }
        };
        loadData();
    }, []); // Empty dependency - run only once

    const handleRefresh = async () => {
        const result = await fetchDashboardData();
        if (result.success) {
            toast.success('Dashboard refreshed!');
        }
    };

    const handleEditAccount = (account) => {
        setEditingAccount(account);
        setShowAccountModal(true);
    };

    const handleDeleteAccount = (account) => {
        setDeleteTarget(account);
    };

    const confirmDeleteAccount = async () => {
        if (!deleteTarget) return;
        const result = await deleteAccount(deleteTarget._id);
        if (result.success) {
            toast.success('Account deleted');
            fetchDashboardData();
        } else {
            toast.error(result.error);
        }
        setDeleteTarget(null);
    };

    // Show loading only on initial load
    if (isLoading && !hasLoaded) {
        return (
            <div className={styles.loading}>
                <Loader2 size={40} className={styles.spinner} />
                <p>Loading your financial dashboard...</p>
            </div>
        );
    }

    // Default values if no data
    const overview = dashboardData?.overview || {
        totalBalance: 0,
        monthlyIncome: 0,
        monthlyExpense: 0,
        monthlyNet: 0,
        incomeChange: 0,
        expenseChange: 0,
    };

    return (
        <div className={styles.dashboard}>
            {/* Welcome section */}
            <motion.div
                className={styles.welcome}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
            >
                <div>
                    <h1 className={styles.welcomeTitle}>
                        Welcome back, {user?.profile?.firstName || 'there'}! 👋
                    </h1>
                    <p className={styles.welcomeSubtitle}>
                        Here's what's happening with your finances today.
                    </p>
                </div>
                <div className={styles.welcomeActions}>
                    <button
                        className={styles.refreshBtn}
                        onClick={handleRefresh}
                        disabled={isLoading}
                    >
                        <RefreshCw size={16} className={isLoading ? styles.spinning : ''} />
                    </button>
                    <QuickActions />
                </div>
            </motion.div>

            {/* Stats Grid */}
            <motion.div
                className={styles.statsGrid}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
            >
                <StatCard
                    title="Total Balance"
                    value={formatLocal(overview.totalBalance)}
                    icon={Wallet}
                    trend={null}
                    color="primary"
                />
                <StatCard
                    title="Monthly Income"
                    value={formatCurrency(overview.monthlyIncome)}
                    icon={TrendingUp}
                    trend={overview.incomeChange || null}
                    trendLabel="vs last month"
                    color="success"
                />
                <StatCard
                    title="Monthly Expenses"
                    value={formatCurrency(overview.monthlyExpense)}
                    icon={TrendingDown}
                    trend={overview.expenseChange ? -overview.expenseChange : null}
                    trendLabel="vs last month"
                    color="danger"
                />
                <StatCard
                    title="Net Savings"
                    value={formatCurrency(overview.monthlyNet)}
                    icon={overview.monthlyNet >= 0 ? ArrowUpRight : ArrowDownRight}
                    trend={null}
                    color={overview.monthlyNet >= 0 ? 'success' : 'danger'}
                />
            </motion.div>

            {/* Main Content Grid */}
            <div className={styles.contentGrid}>
                {/* Left Column - Charts */}
                <motion.div
                    className={styles.chartsColumn}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                >
                    {/* Trend Chart */}
                    <div className={styles.chartCard}>
                        <div className={styles.chartHeader}>
                            <h3>Income vs Expenses</h3>
                            <span className={styles.chartPeriod}>Last 30 days</span>
                        </div>
                        <TrendChart data={dashboardData?.trendData || []} />
                    </div>

                    {/* Spending by Category */}
                    <div className={styles.chartCard}>
                        <div className={styles.chartHeader}>
                            <h3>Spending by Category</h3>
                            <span className={styles.chartPeriod}>This month</span>
                        </div>
                        <SpendingChart data={dashboardData?.spendingByCategory || []} />
                    </div>
                </motion.div>

                {/* Right Column - Accounts & Transactions */}
                <motion.div
                    className={styles.sideColumn}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.3 }}
                >
                    {/* Accounts */}
                    <div className={styles.sectionCard}>
                        <div className={styles.sectionHeader}>
                            <h3>Your Accounts</h3>
                            <button className={styles.addBtn} onClick={() => setShowAccountModal(true)}>
                                <Plus size={16} />
                                Add
                            </button>
                        </div>
                        <div className={styles.accountsList}>
                            {dashboardData?.accounts?.length > 0 ? (
                                dashboardData.accounts.map((account) => (
                                    <AccountCard
                                        key={account._id}
                                        account={account}
                                        onEdit={handleEditAccount}
                                        onDelete={handleDeleteAccount}
                                    />
                                ))
                            ) : (
                                <div className={styles.emptyState}>
                                    <p>No accounts yet</p>
                                    <button className={styles.addFirstBtn} onClick={() => setShowAccountModal(true)}>
                                        <Plus size={16} />
                                        Add your first account
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Recent Transactions */}
                    <div className={styles.sectionCard}>
                        <div className={styles.sectionHeader}>
                            <h3>Recent Transactions</h3>
                            <a href="/transactions" className={styles.viewAll}>View all</a>
                        </div>
                        <RecentTransactions transactions={dashboardData?.recentTransactions || []} />
                    </div>
                </motion.div>
            </div>

            {/* Role-Specific Dashboard Sections */}
            {userRole === 'student' && (
                <StudentDashboard
                    overview={overview}
                    goals={dashboardData?.goals || []}
                    onRefresh={handleRefresh}
                />
            )}

            {userRole === 'business' && (
                <BusinessDashboard
                    overview={overview}
                    transactions={dashboardData?.recentTransactions || []}
                    budgets={dashboardData?.budgets || []}
                    onRefresh={handleRefresh}
                />
            )}

            {/* Account Modal */}
            <AccountModal
                isOpen={showAccountModal}
                onClose={() => {
                    setShowAccountModal(false);
                    setEditingAccount(null);
                }}
                account={editingAccount}
                onSuccess={() => fetchDashboardData()}
            />

            {/* Delete Account Confirmation */}
            <ConfirmModal
                isOpen={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                onConfirm={confirmDeleteAccount}
                title="Delete Account"
                message={`Are you sure you want to delete "${deleteTarget?.name}"? This will also remove all associated transactions.`}
                confirmText="Delete"
                type="danger"
            />
        </div>
    );
};

export default Dashboard;
