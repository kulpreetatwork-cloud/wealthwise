import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, GraduationCap, Briefcase, Loader2, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../../stores/authStore';
import styles from './RoleSelect.module.css';

const roles = [
    {
        id: 'individual',
        name: 'Individual',
        description: 'Personal finance management for everyday investors',
        icon: User,
        features: [
            'Track personal income & expenses',
            'Investment portfolio tracking',
            'Savings goals & budgets',
            'AI financial assistant',
        ],
        color: '#6366f1',
    },
    {
        id: 'student',
        name: 'Student',
        description: 'Simplified tools for students learning finance',
        icon: GraduationCap,
        features: [
            'Easy expense tracking',
            'Savings goals for tuition & books',
            'Financial literacy resources',
            'Budget-friendly tips',
        ],
        color: '#10b981',
    },
    {
        id: 'business',
        name: 'Business',
        description: 'Comprehensive tools for small business owners',
        icon: Briefcase,
        features: [
            'Business revenue tracking',
            'Expense categorization',
            'Invoice management',
            'Tax estimation & reports',
        ],
        color: '#f59e0b',
    },
];

const RoleSelect = () => {
    const [selectedRole, setSelectedRole] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();
    const { setRole, user } = useAuthStore();

    const handleSubmit = async () => {
        if (!selectedRole) {
            toast.error('Please select a role to continue');
            return;
        }

        setIsSubmitting(true);

        const result = await setRole(selectedRole);

        if (result.success) {
            toast.success(`Welcome aboard! You're set up as ${roles.find(r => r.id === selectedRole)?.name}`);
            navigate('/dashboard');
        } else {
            toast.error(result.error);
        }

        setIsSubmitting(false);
    };

    return (
        <motion.div
            className={styles.container}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
        >
            {/* Header */}
            <div className={styles.header}>
                <h2 className={styles.title}>Choose your profile</h2>
                <p className={styles.subtitle}>
                    Select how you'll use WealthWise. This helps us personalize your experience.
                </p>
            </div>

            {/* Role cards */}
            <div className={styles.roles}>
                {roles.map((role, index) => {
                    const Icon = role.icon;
                    const isSelected = selectedRole === role.id;

                    return (
                        <motion.div
                            key={role.id}
                            className={`${styles.roleCard} ${isSelected ? styles.selected : ''}`}
                            style={{
                                '--role-color': role.color,
                            }}
                            onClick={() => setSelectedRole(role.id)}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: index * 0.1 }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            {/* Selection indicator */}
                            <div className={styles.selectIndicator}>
                                {isSelected && <Check size={14} />}
                            </div>

                            {/* Icon */}
                            <div className={styles.iconWrapper}>
                                <Icon size={28} />
                            </div>

                            {/* Content */}
                            <div className={styles.roleContent}>
                                <h3 className={styles.roleName}>{role.name}</h3>
                                <p className={styles.roleDescription}>{role.description}</p>

                                {/* Features */}
                                <ul className={styles.features}>
                                    {role.features.map((feature, i) => (
                                        <li key={i}>
                                            <Check size={12} />
                                            <span>{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Submit button */}
            <motion.button
                className={styles.submitBtn}
                onClick={handleSubmit}
                disabled={!selectedRole || isSubmitting}
                whileHover={{ scale: !selectedRole || isSubmitting ? 1 : 1.02 }}
                whileTap={{ scale: !selectedRole || isSubmitting ? 1 : 0.98 }}
            >
                {isSubmitting ? (
                    <>
                        <Loader2 size={18} className={styles.spinner} />
                        Setting up your profile...
                    </>
                ) : (
                    'Get started'
                )}
            </motion.button>

            {/* Note */}
            <p className={styles.note}>
                You can change your role later in settings
            </p>
        </motion.div>
    );
};

export default RoleSelect;
