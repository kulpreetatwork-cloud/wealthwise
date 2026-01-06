import { motion } from 'framer-motion';
import styles from './LoadingScreen.module.css';

const LoadingScreen = () => {
    return (
        <div className={styles.container}>
            <motion.div
                className={styles.content}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
            >
                {/* Logo */}
                <div className={styles.logo}>
                    <motion.div
                        className={styles.logoIcon}
                        animate={{
                            rotate: 360,
                            scale: [1, 1.1, 1],
                        }}
                        transition={{
                            rotate: { duration: 2, repeat: Infinity, ease: 'linear' },
                            scale: { duration: 1, repeat: Infinity, ease: 'easeInOut' }
                        }}
                    >
                        💰
                    </motion.div>
                    <h1 className={styles.logoText}>
                        Wealth<span>Wise</span>
                    </h1>
                </div>

                {/* Loading spinner */}
                <div className={styles.spinner}>
                    <motion.div
                        className={styles.spinnerTrack}
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    />
                </div>

                <p className={styles.loadingText}>Loading your financial dashboard...</p>
            </motion.div>
        </div>
    );
};

export default LoadingScreen;
