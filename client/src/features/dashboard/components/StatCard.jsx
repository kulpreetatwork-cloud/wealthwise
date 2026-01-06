import { motion } from 'framer-motion';
import styles from './StatCard.module.css';

const StatCard = ({ title, value, icon: Icon, trend, trendLabel, color = 'primary' }) => {
    const isPositiveTrend = trend > 0;
    const showTrend = trend !== null && trend !== undefined;

    return (
        <motion.div
            className={`${styles.card} ${styles[color]}`}
            whileHover={{ scale: 1.02, y: -4 }}
            transition={{ duration: 0.2 }}
        >
            <div className={styles.iconWrapper}>
                <Icon size={22} />
            </div>

            <div className={styles.content}>
                <span className={styles.title}>{title}</span>
                <span className={styles.value}>{value}</span>

                {showTrend && (
                    <div className={`${styles.trend} ${isPositiveTrend ? styles.trendUp : styles.trendDown}`}>
                        <span className={styles.trendValue}>
                            {isPositiveTrend ? '+' : ''}{trend}%
                        </span>
                        {trendLabel && <span className={styles.trendLabel}>{trendLabel}</span>}
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default StatCard;
