import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import styles from './Charts.module.css';

const COLORS = ['#6366f1', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4'];

/**
 * Reusable Bar Chart component
 * @param {Object} props
 * @param {Array} props.data - Chart data array
 * @param {string} props.dataKey - Key for the bar value
 * @param {string} props.xAxisKey - Key for the X-axis labels
 * @param {string} props.color - Single bar color
 * @param {boolean} props.colorful - Use multiple colors
 * @param {number} props.height - Chart height
 * @param {boolean} props.horizontal - Horizontal bar chart
 */
const BarChart = ({
    data = [],
    dataKey = 'value',
    xAxisKey = 'name',
    color = '#6366f1',
    colorful = false,
    height = 300,
    horizontal = false,
    showGrid = true,
    formatValue = (val) => `$${val?.toLocaleString() || 0}`,
}) => {
    const layout = horizontal ? 'vertical' : 'horizontal';

    return (
        <div className={styles.chartContainer} style={{ height }}>
            <ResponsiveContainer width="100%" height="100%">
                <RechartsBarChart
                    data={data}
                    layout={layout}
                    margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                    {showGrid && (
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    )}
                    {horizontal ? (
                        <>
                            <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                            <YAxis dataKey={xAxisKey} type="category" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} width={80} />
                        </>
                    ) : (
                        <>
                            <XAxis dataKey={xAxisKey} axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} tickFormatter={formatValue} />
                        </>
                    )}
                    <Tooltip
                        contentStyle={{
                            backgroundColor: '#1a1a24',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '8px',
                            color: '#f8fafc',
                        }}
                        formatter={(value) => [formatValue(value), dataKey]}
                    />
                    <Bar dataKey={dataKey} radius={[4, 4, 0, 0]}>
                        {colorful
                            ? data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))
                            : null}
                    </Bar>
                </RechartsBarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default BarChart;
