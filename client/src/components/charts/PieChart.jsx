import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import styles from './Charts.module.css';

const COLORS = ['#6366f1', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899', '#84cc16'];

/**
 * Reusable Pie/Donut Chart component
 * @param {Object} props
 * @param {Array} props.data - Chart data array with { name, value }
 * @param {boolean} props.donut - Show as donut chart
 * @param {number} props.height - Chart height
 * @param {boolean} props.showLegend - Show legend
 * @param {boolean} props.showLabels - Show percentage labels
 */
const PieChart = ({
    data = [],
    donut = true,
    height = 300,
    showLegend = true,
    showLabels = false,
    colors = COLORS,
    formatValue = (val) => `$${val?.toLocaleString() || 0}`,
}) => {
    const innerRadius = donut ? '60%' : 0;
    const outerRadius = '80%';

    const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
        if (!showLabels || percent < 0.05) return null;
        const RADIAN = Math.PI / 180;
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);

        return (
            <text
                x={x}
                y={y}
                fill="white"
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={12}
                fontWeight={600}
            >
                {`${(percent * 100).toFixed(0)}%`}
            </text>
        );
    };

    return (
        <div className={styles.chartContainer} style={{ height }}>
            <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={innerRadius}
                        outerRadius={outerRadius}
                        paddingAngle={2}
                        dataKey="value"
                        labelLine={false}
                        label={showLabels ? renderCustomLabel : false}
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                        ))}
                    </Pie>
                    <Tooltip
                        contentStyle={{
                            backgroundColor: '#1a1a24',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '8px',
                            color: '#f8fafc',
                        }}
                        formatter={(value, name) => [formatValue(value), name]}
                    />
                    {showLegend && (
                        <Legend
                            verticalAlign="bottom"
                            height={36}
                            formatter={(value) => <span style={{ color: '#94a3b8' }}>{value}</span>}
                        />
                    )}
                </RechartsPieChart>
            </ResponsiveContainer>
        </div>
    );
};

export default PieChart;
