import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useCurrency } from '../../../hooks';
import styles from './SpendingChart.module.css';

const COLORS = [
    '#6366f1', // Primary
    '#8b5cf6', // Purple
    '#10b981', // Green
    '#f59e0b', // Amber
    '#ef4444', // Red
    '#3b82f6', // Blue
    '#14b8a6', // Teal
    '#f97316', // Orange
];

const SpendingChart = ({ data }) => {
    const { formatLocal } = useCurrency();

    if (!data || data.length === 0) {
        return (
            <div className={styles.empty}>
                <p>No spending data</p>
                <span>Add expenses to see your spending breakdown</span>
            </div>
        );
    }

    // Add colors and format for chart
    const chartData = data.map((item, index) => ({
        name: item._id || item.category,
        value: item.total,
        color: COLORS[index % COLORS.length],
    }));

    const total = chartData.reduce((sum, item) => sum + item.value, 0);

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            const percentage = ((data.value / total) * 100).toFixed(1);
            return (
                <div className={styles.tooltip}>
                    <span className={styles.tooltipDot} style={{ background: data.color }} />
                    <div className={styles.tooltipContent}>
                        <span className={styles.tooltipName}>{data.name}</span>
                        <span className={styles.tooltipValue}>
                            {formatLocal(data.value)} ({percentage}%)
                        </span>
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <div className={styles.container}>
            <div className={styles.chartWrapper}>
                <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                        <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={55}
                            outerRadius={80}
                            paddingAngle={2}
                            dataKey="value"
                        >
                            {chartData.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={entry.color}
                                    stroke="transparent"
                                />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                </ResponsiveContainer>

                {/* Center label */}
                <div className={styles.centerLabel}>
                    <span className={styles.centerAmount}>{formatLocal(total)}</span>
                    <span className={styles.centerText}>Total Spent</span>
                </div>
            </div>

            {/* Legend */}
            <div className={styles.legend}>
                {chartData.slice(0, 5).map((item, index) => (
                    <div key={index} className={styles.legendItem}>
                        <span
                            className={styles.legendDot}
                            style={{ background: item.color }}
                        />
                        <span className={styles.legendName}>{item.name}</span>
                        <span className={styles.legendValue}>
                            {((item.value / total) * 100).toFixed(0)}%
                        </span>
                    </div>
                ))}
                {chartData.length > 5 && (
                    <div className={styles.legendMore}>
                        +{chartData.length - 5} more categories
                    </div>
                )}
            </div>
        </div>
    );
};

export default SpendingChart;
