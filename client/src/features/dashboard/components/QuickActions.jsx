import { useNavigate } from 'react-router-dom';
import { Plus, ArrowLeftRight, Target, Bot } from 'lucide-react';
import styles from './QuickActions.module.css';

const QuickActions = () => {
    const navigate = useNavigate();

    const actions = [
        {
            label: 'Add Transaction',
            icon: Plus,
            onClick: () => navigate('/transactions?action=add'),
            primary: true,
        },
        {
            label: 'Transfer',
            icon: ArrowLeftRight,
            onClick: () => navigate('/transactions?action=transfer'),
        },
        {
            label: 'Set Goal',
            icon: Target,
            onClick: () => navigate('/goals?action=add'),
        },
        {
            label: 'Ask AI',
            icon: Bot,
            onClick: () => navigate('/ai-assistant'),
        },
    ];

    return (
        <div className={styles.actions}>
            {actions.map((action, index) => (
                <button
                    key={index}
                    className={`${styles.actionBtn} ${action.primary ? styles.primary : ''}`}
                    onClick={action.onClick}
                >
                    <action.icon size={16} />
                    <span>{action.label}</span>
                </button>
            ))}
        </div>
    );
};

export default QuickActions;
