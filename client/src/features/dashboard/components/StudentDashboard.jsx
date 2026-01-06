import { motion } from 'framer-motion';
import { BookOpen, GraduationCap, PiggyBank, Lightbulb, TrendingUp, Target, Clock } from 'lucide-react';
import { useCurrency } from '../../../hooks';
import styles from './RoleDashboards.module.css';

const financialTips = [
    "💡 Set up automatic transfers to your savings account on payday",
    "📚 Track your textbook expenses separately to find cheaper alternatives",
    "🍕 Cooking at home can save you $200+ per month compared to eating out",
    "💰 Student discounts can save you 10-20% on many purchases",
    "🎯 Start an emergency fund with just $20/month",
];

const StudentDashboard = ({ overview, goals = [], onRefresh }) => {
    const { formatLocal } = useCurrency();

    const randomTip = financialTips[Math.floor(Math.random() * financialTips.length)];
    const savingsGoals = goals.filter(g => ['savings', 'purchase', 'emergency'].includes(g.category)).slice(0, 3);

    return (
        <div className={styles.roleSection}>
            {/* Student-specific banner */}
            <motion.div
                className={styles.studentBanner}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className={styles.bannerIcon}>
                    <GraduationCap size={32} />
                </div>
                <div className={styles.bannerContent}>
                    <h3>Student Financial Hub</h3>
                    <p>Track your budget, reach your goals, and build smart money habits</p>
                </div>
            </motion.div>

            {/* Simplified Balance View */}
            <motion.div
                className={styles.simpleBalance}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
            >
                <div className={styles.balanceCard}>
                    <span className={styles.balanceLabel}>Available Balance</span>
                    <span className={styles.balanceAmount}>{formatLocal(overview?.totalBalance)}</span>
                    <div className={styles.balanceMeta}>
                        <span className={styles.incomeTag}>
                            <TrendingUp size={14} />
                            +{formatLocal(overview?.monthlyIncome)} this month
                        </span>
                    </div>
                </div>
            </motion.div>

            {/* Part-time Income Tracker */}
            <motion.div
                className={styles.incomeTracker}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
            >
                <div className={styles.sectionHeader}>
                    <Clock size={18} />
                    <h4>Part-time Income</h4>
                </div>
                <div className={styles.incomeStats}>
                    <div className={styles.incomeStat}>
                        <span className={styles.incomeValue}>{formatLocal(overview?.monthlyIncome)}</span>
                        <span className={styles.incomeLabel}>This Month</span>
                    </div>
                    <div className={styles.incomeStat}>
                        <span className={styles.incomeValue}>{formatLocal(overview?.monthlyExpense)}</span>
                        <span className={styles.incomeLabel}>Spent</span>
                    </div>
                    <div className={styles.incomeStat}>
                        <span className={styles.incomeValue} style={{ color: overview?.monthlyNet >= 0 ? '#10b981' : '#ef4444' }}>
                            {formatLocal(overview?.monthlyNet)}
                        </span>
                        <span className={styles.incomeLabel}>Remaining</span>
                    </div>
                </div>
            </motion.div>

            {/* Savings Goals */}
            <motion.div
                className={styles.goalsSection}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                <div className={styles.sectionHeader}>
                    <Target size={18} />
                    <h4>Savings Goals</h4>
                </div>
                {savingsGoals.length > 0 ? (
                    <div className={styles.goalsList}>
                        {savingsGoals.map((goal) => {
                            const progress = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
                            return (
                                <div key={goal._id} className={styles.goalItem}>
                                    <div className={styles.goalInfo}>
                                        <span className={styles.goalName}>{goal.name}</span>
                                        <span className={styles.goalAmounts}>
                                            {formatLocal(goal.currentAmount)} / {formatLocal(goal.targetAmount)}
                                        </span>
                                    </div>
                                    <div className={styles.goalProgress}>
                                        <div
                                            className={styles.goalBar}
                                            style={{ width: `${Math.min(progress, 100)}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <p className={styles.emptyText}>Set your first savings goal to start tracking!</p>
                )}
            </motion.div>

            {/* Financial Literacy Tip */}
            <motion.div
                className={styles.tipCard}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
            >
                <div className={styles.tipIcon}>
                    <Lightbulb size={24} />
                </div>
                <div className={styles.tipContent}>
                    <h4>Money Tip of the Day</h4>
                    <p>{randomTip}</p>
                </div>
            </motion.div>

            {/* Learning Progress Placeholder */}
            <motion.div
                className={styles.learningSection}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
            >
                <div className={styles.sectionHeader}>
                    <BookOpen size={18} />
                    <h4>Financial Learning</h4>
                </div>
                <div className={styles.learningCards}>
                    <div className={styles.learningCard}>
                        <span className={styles.learningEmoji}>📊</span>
                        <span>Budgeting Basics</span>
                        <span className={styles.learningBadge}>Completed</span>
                    </div>
                    <div className={styles.learningCard}>
                        <span className={styles.learningEmoji}>💳</span>
                        <span>Credit Cards 101</span>
                        <span className={styles.learningBadge}>In Progress</span>
                    </div>
                    <div className={styles.learningCard}>
                        <span className={styles.learningEmoji}>📈</span>
                        <span>Intro to Investing</span>
                        <span className={styles.learningBadge} style={{ opacity: 0.5 }}>Locked</span>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default StudentDashboard;
