import { AreaChart as RechartsAreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import styles from './Charts.module.css';

/**
 * Reusable Area Chart component
 * @param {Object} props
 * @param {Array} props.data - Chart data array
 * @param {string} props.dataKey - Key for the Y-axis value
 * @param {string} props.xAxisKey - Key for the X-axis value
 * @param {string} props.color - Chart color (default: primary gradient)
 * @param {number} props.height - Chart height (default: 300)
 * @param {boolean} props.showGrid - Show grid lines
 * @param {boolean} props.showTooltip - Show tooltip on hover
 */
const AreaChart = ({
    data = [],
    dataKey = 'value',
    xAxisKey = 'name',
    color = '#6366f1',
    gradientColor = '#8b5cf6',
    height = 300,
    showGrid = true,
    showTooltip = true,
    formatValue = (val) => `$${val?.toLocaleString() || 0}`,
}) => {
    const gradientId = `areaGradient-${dataKey}`;

    return (
        <div className={styles.chartContainer} style={{ height }}>
            <ResponsiveContainer width="100%" height="100%">
                <RechartsAreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                            <stop offset="95%" stopColor={gradientColor} stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    {showGrid && (
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                    )}
                    <XAxis
                        dataKey={xAxisKey}
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#94a3b8', fontSize: 12 }}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#94a3b8', fontSize: 12 }}
                        tickFormatter={formatValue}
                    />
                    {showTooltip && (
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#1a1a24',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '8px',
                                color: '#f8fafc',
                            }}
                            formatter={(value) => [formatValue(value), dataKey]}
                        />
                    )}
                    <Area
                        type="monotone"
                        dataKey={dataKey}
                        stroke={color}
                        strokeWidth={2}
                        fillOpacity={1}
                        fill={`url(#${gradientId})`}
                    />
                </RechartsAreaChart>
            </ResponsiveContainer>
        </div>
    );
};

export default AreaChart;
