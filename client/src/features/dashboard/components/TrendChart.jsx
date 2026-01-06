import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid
} from 'recharts';
import { format, parseISO } from 'date-fns';
import styles from './TrendChart.module.css';

const TrendChart = ({ data }) => {
    if (!data || data.length === 0) {
        return (
            <div className={styles.empty}>
                <p>No data available</p>
                <span>Add some transactions to see your trends</span>
            </div>
        );
    }

    const formatXAxis = (dateStr) => {
        try {
            return format(parseISO(dateStr), 'MMM d');
        } catch {
            return dateStr;
        }
    };

    const formatTooltipValue = (value) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
        }).format(value);
    };

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className={styles.tooltip}>
                    <p className={styles.tooltipDate}>
                        {format(parseISO(label), 'MMM d, yyyy')}
                    </p>
                    {payload.map((entry, index) => (
                        <div key={index} className={styles.tooltipRow}>
                            <span
                                className={styles.tooltipDot}
                                style={{ background: entry.color }}
                            />
                            <span className={styles.tooltipLabel}>
                                {entry.dataKey === 'income' ? 'Income' : 'Expense'}:
                            </span>
                            <span className={styles.tooltipValue}>
                                {formatTooltipValue(entry.value)}
                            </span>
                        </div>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <div className={styles.container}>
            <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                        <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="rgba(255,255,255,0.05)"
                        vertical={false}
                    />
                    <XAxis
                        dataKey="date"
                        tickFormatter={formatXAxis}
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#64748b', fontSize: 11 }}
                        interval="preserveStartEnd"
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#64748b', fontSize: 11 }}
                        tickFormatter={(value) => `₹${value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value}`}
                        width={50}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                        type="monotone"
                        dataKey="income"
                        stroke="#10b981"
                        strokeWidth={2}
                        fill="url(#incomeGradient)"
                    />
                    <Area
                        type="monotone"
                        dataKey="expense"
                        stroke="#ef4444"
                        strokeWidth={2}
                        fill="url(#expenseGradient)"
                    />
                </AreaChart>
            </ResponsiveContainer>

            {/* Legend */}
            <div className={styles.legend}>
                <div className={styles.legendItem}>
                    <span className={styles.legendDot} style={{ background: '#10b981' }} />
                    <span>Income</span>
                </div>
                <div className={styles.legendItem}>
                    <span className={styles.legendDot} style={{ background: '#ef4444' }} />
                    <span>Expenses</span>
                </div>
            </div>
        </div>
    );
};

export default TrendChart;
