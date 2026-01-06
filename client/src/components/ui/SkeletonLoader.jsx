import styles from './SkeletonLoader.module.css';

/**
 * Skeleton Card - for stat cards and summary boxes
 */
export const SkeletonCard = ({ height = 120 }) => (
    <div className={styles.card} style={{ height }}>
        <div className={styles.shimmer} />
    </div>
);

/**
 * Skeleton Text - for text lines
 */
export const SkeletonText = ({ width = '100%', height = 16 }) => (
    <div className={styles.text} style={{ width, height }}>
        <div className={styles.shimmer} />
    </div>
);

/**
 * Skeleton Circle - for avatars and icons
 */
export const SkeletonCircle = ({ size = 40 }) => (
    <div className={styles.circle} style={{ width: size, height: size }}>
        <div className={styles.shimmer} />
    </div>
);

/**
 * Skeleton List Item - for transaction/list items
 */
export const SkeletonListItem = () => (
    <div className={styles.listItem}>
        <SkeletonCircle size={40} />
        <div className={styles.listContent}>
            <SkeletonText width="60%" height={14} />
            <SkeletonText width="40%" height={12} />
        </div>
        <SkeletonText width={80} height={16} />
    </div>
);

/**
 * Skeleton Chart - for chart placeholders
 */
export const SkeletonChart = ({ height = 250 }) => (
    <div className={styles.chart} style={{ height }}>
        <div className={styles.chartBars}>
            {[...Array(7)].map((_, i) => (
                <div
                    key={i}
                    className={styles.chartBar}
                    style={{ height: `${30 + Math.random() * 60}%` }}
                >
                    <div className={styles.shimmer} />
                </div>
            ))}
        </div>
    </div>
);

/**
 * Dashboard Skeleton - complete dashboard loading state
 */
export const DashboardSkeleton = () => (
    <div className={styles.dashboardSkeleton}>
        {/* Stats Row */}
        <div className={styles.statsGrid}>
            <SkeletonCard height={100} />
            <SkeletonCard height={100} />
            <SkeletonCard height={100} />
            <SkeletonCard height={100} />
        </div>

        {/* Content Grid */}
        <div className={styles.contentGrid}>
            <div className={styles.mainContent}>
                <SkeletonCard height={300} />
            </div>
            <div className={styles.sidebar}>
                <SkeletonCard height={140} />
                <SkeletonCard height={200} />
            </div>
        </div>

        {/* Transactions */}
        <div className={styles.transactionsSkeleton}>
            <SkeletonText width={150} height={20} />
            <div className={styles.listSkeleton}>
                <SkeletonListItem />
                <SkeletonListItem />
                <SkeletonListItem />
                <SkeletonListItem />
            </div>
        </div>
    </div>
);

/**
 * Page Skeleton - generic page loading state
 */
export const PageSkeleton = () => (
    <div className={styles.pageSkeleton}>
        <SkeletonText width={200} height={28} />
        <SkeletonText width={300} height={14} />
        <div className={styles.pageContent}>
            <SkeletonCard height={400} />
        </div>
    </div>
);

export default {
    SkeletonCard,
    SkeletonText,
    SkeletonCircle,
    SkeletonListItem,
    SkeletonChart,
    DashboardSkeleton,
    PageSkeleton,
};
