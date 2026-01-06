import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../../stores/authStore';
import styles from './Login.module.css';

const loginSchema = z.object({
    email: z.string().email('Please enter a valid email'),
    password: z.string().min(1, 'Password is required'),
});

const Login = () => {
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuthStore();

    const from = location.state?.from?.pathname || '/dashboard';

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: '',
            password: '',
        },
    });

    const onSubmit = async (data) => {
        const result = await login(data.email, data.password);

        if (result.success) {
            toast.success('Welcome back!');
            navigate(from, { replace: true });
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
                <h2 className={styles.title}>Welcome back</h2>
                <p className={styles.subtitle}>
                    Sign in to continue managing your finances
                </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
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
                </div>

                {/* Forgot password link */}
                <div className={styles.forgotPassword}>
                    <Link to="/forgot-password">Forgot password?</Link>
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
                            Signing in...
                        </>
                    ) : (
                        'Sign in'
                    )}
                </button>
            </form>

            {/* Footer */}
            <div className={styles.footer}>
                <p>
                    Don't have an account?{' '}
                    <Link to="/register" className={styles.link}>
                        Create one
                    </Link>
                </p>
            </div>

            {/* Demo credentials hint */}
            <div className={styles.demoHint}>
                <p>🚀 New here? Register to get started!</p>
            </div>
        </motion.div>
    );
};

export default Login;
