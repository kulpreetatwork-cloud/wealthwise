import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import styles from './AuthLayout.module.css';

const AuthLayout = () => {
    return (
        <div className={styles.container}>
            {/* Background decoration */}
            <div className={styles.bgDecor}>
                <div className={styles.orb1}></div>
                <div className={styles.orb2}></div>
                <div className={styles.orb3}></div>
            </div>

            {/* Left side - Branding */}
            <motion.div
                className={styles.branding}
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
            >
                <div className={styles.brandContent}>
                    <div className={styles.logo}>
                        <span className={styles.logoIcon}>💰</span>
                        <h1>WealthWise</h1>
                    </div>

                    <h2 className={styles.tagline}>
                        Master Your Finances with
                        <span className="gradient-text"> AI-Powered</span> Intelligence
                    </h2>

                    <p className={styles.description}>
                        Track expenses, set budgets, achieve goals, and get personalized
                        financial insights powered by artificial intelligence.
                    </p>

                    <div className={styles.features}>
                        <div className={styles.feature}>
                            <span className={styles.featureIcon}>📊</span>
                            <span>Smart Analytics</span>
                        </div>
                        <div className={styles.feature}>
                            <span className={styles.featureIcon}>🤖</span>
                            <span>AI Assistant</span>
                        </div>
                        <div className={styles.feature}>
                            <span className={styles.featureIcon}>🎯</span>
                            <span>Goal Tracking</span>
                        </div>
                        <div className={styles.feature}>
                            <span className={styles.featureIcon}>🔒</span>
                            <span>Bank-Level Security</span>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Right side - Form */}
            <motion.div
                className={styles.formSection}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
            >
                <div className={styles.formContainer}>
                    <Outlet />
                </div>
            </motion.div>
        </div>
    );
};

export default AuthLayout;
