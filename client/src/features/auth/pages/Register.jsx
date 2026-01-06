import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, User, Loader2, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../../stores/authStore';
import styles from './Register.module.css';

const registerSchema = z.object({
    firstName: z.string().min(1, 'First name is required').max(50),
    lastName: z.string().min(1, 'Last name is required').max(50),
    email: z.string().email('Please enter a valid email'),
    password: z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .regex(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
            'Password must contain uppercase, lowercase, and number'
        ),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
});

const Register = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const navigate = useNavigate();
    const { register: registerUser } = useAuthStore();

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            firstName: '',
            lastName: '',
            email: '',
            password: '',
            confirmPassword: '',
        },
    });

    const password = watch('password', '');

    // Password strength indicators
    const passwordChecks = {
        length: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        number: /\d/.test(password),
    };

    const onSubmit = async (data) => {
        const result = await registerUser({
            email: data.email,
            password: data.password,
            confirmPassword: data.confirmPassword,
            profile: {
                firstName: data.firstName,
                lastName: data.lastName,
            },
        });

        if (result.success) {
            toast.success('Account created successfully!');
            navigate('/role-select');
        } else {
            toast.error(result.error);
        }
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
                <h2 className={styles.title}>Create your account</h2>
                <p className={styles.subtitle}>
                    Start your journey to financial freedom
                </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
                {/* Name fields */}
                <div className={styles.row}>
                    <div className={styles.field}>
                        <label htmlFor="firstName" className={styles.label}>
                            First name
                        </label>
                        <div className={styles.inputWrapper}>
                            <User size={18} className={styles.inputIcon} />
                            <input
                                id="firstName"
                                type="text"
                                className={`${styles.input} ${errors.firstName ? styles.inputError : ''}`}
                                placeholder="John"
                                {...register('firstName')}
                            />
                        </div>
                        {errors.firstName && (
                            <span className={styles.error}>{errors.firstName.message}</span>
                        )}
                    </div>

                    <div className={styles.field}>
                        <label htmlFor="lastName" className={styles.label}>
                            Last name
                        </label>
                        <div className={styles.inputWrapper}>
                            <input
                                id="lastName"
                                type="text"
                                className={`${styles.input} ${styles.inputNoIcon} ${errors.lastName ? styles.inputError : ''}`}
                                placeholder="Doe"
                                {...register('lastName')}
                            />
                        </div>
                        {errors.lastName && (
                            <span className={styles.error}>{errors.lastName.message}</span>
                        )}
                    </div>
                </div>

                {/* Email field */}
                <div className={styles.field}>
                    <label htmlFor="email" className={styles.label}>
                        Email address
                    </label>
                    <div className={styles.inputWrapper}>
                        <Mail size={18} className={styles.inputIcon} />
                        <input
                            id="email"
                            type="email"
                            className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
                            placeholder="you@example.com"
                            {...register('email')}
                        />
                    </div>
                    {errors.email && (
                        <span className={styles.error}>{errors.email.message}</span>
                    )}
                </div>

                {/* Password field */}
                <div className={styles.field}>
                    <label htmlFor="password" className={styles.label}>
                        Password
                    </label>
                    <div className={styles.inputWrapper}>
                        <Lock size={18} className={styles.inputIcon} />
                        <input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            className={`${styles.input} ${errors.password ? styles.inputError : ''}`}
                            placeholder="••••••••"
                            {...register('password')}
                        />
                        <button
                            type="button"
                            className={styles.togglePassword}
                            onClick={() => setShowPassword(!showPassword)}
                            tabIndex={-1}
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                    {errors.password && (
                        <span className={styles.error}>{errors.password.message}</span>
                    )}

                    {/* Password strength */}
                    {password && (
                        <div className={styles.passwordStrength}>
                            <div className={`${styles.check} ${passwordChecks.length ? styles.checkPassed : ''}`}>
                                <Check size={12} />
                                <span>8+ characters</span>
                            </div>
                            <div className={`${styles.check} ${passwordChecks.uppercase ? styles.checkPassed : ''}`}>
                                <Check size={12} />
                                <span>Uppercase</span>
                            </div>
                            <div className={`${styles.check} ${passwordChecks.lowercase ? styles.checkPassed : ''}`}>
                                <Check size={12} />
                                <span>Lowercase</span>
                            </div>
                            <div className={`${styles.check} ${passwordChecks.number ? styles.checkPassed : ''}`}>
                                <Check size={12} />
                                <span>Number</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Confirm password */}
                <div className={styles.field}>
                    <label htmlFor="confirmPassword" className={styles.label}>
                        Confirm password
                    </label>
                    <div className={styles.inputWrapper}>
                        <Lock size={18} className={styles.inputIcon} />
                        <input
                            id="confirmPassword"
                            type={showConfirmPassword ? 'text' : 'password'}
                            className={`${styles.input} ${errors.confirmPassword ? styles.inputError : ''}`}
                            placeholder="••••••••"
                            {...register('confirmPassword')}
                        />
                        <button
                            type="button"
                            className={styles.togglePassword}
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            tabIndex={-1}
                        >
                            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                    {errors.confirmPassword && (
                        <span className={styles.error}>{errors.confirmPassword.message}</span>
                    )}
                </div>

                {/* Submit button */}
                <button
                    type="submit"
                    className={styles.submitBtn}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 size={18} className={styles.spinner} />
                            Creating account...
                        </>
                    ) : (
                        'Create account'
                    )}
                </button>
            </form>

            {/* Footer */}
            <div className={styles.footer}>
                <p>
                    Already have an account?{' '}
                    <Link to="/login" className={styles.link}>
                        Sign in
                    </Link>
                </p>
            </div>
        </motion.div>
    );
};

export default Register;
