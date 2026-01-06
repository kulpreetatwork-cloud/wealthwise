import { z } from 'zod';

// Password validation regex
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;

// Register schema
export const registerSchema = z.object({
    email: z
        .string()
        .email('Please provide a valid email')
        .min(1, 'Email is required'),
    password: z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .regex(
            passwordRegex,
            'Password must contain at least one uppercase letter, one lowercase letter, and one number'
        ),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    profile: z.object({
        firstName: z.string().max(50, 'First name cannot exceed 50 characters').optional(),
        lastName: z.string().max(50, 'Last name cannot exceed 50 characters').optional(),
    }).optional(),
}).refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
});

// Login schema
export const loginSchema = z.object({
    email: z
        .string()
        .email('Please provide a valid email')
        .min(1, 'Email is required'),
    password: z.string().min(1, 'Password is required'),
});

// Update profile schema
export const updateProfileSchema = z.object({
    profile: z.object({
        firstName: z.string().max(50).optional(),
        lastName: z.string().max(50).optional(),
        phone: z.string().max(20).optional(),
        currency: z.enum(['USD', 'EUR', 'GBP', 'INR', 'JPY', 'CAD', 'AUD']).optional(),
        timezone: z.string().optional(),
    }).optional(),
    role: z.enum(['individual', 'student', 'business']).optional(),
});

// Update preferences schema
export const updatePreferencesSchema = z.object({
    notifications: z.boolean().optional(),
    weeklyReport: z.boolean().optional(),
    theme: z.enum(['dark', 'light']).optional(),
});

// Change password schema
export const changePasswordSchema = z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .regex(
            passwordRegex,
            'Password must contain at least one uppercase letter, one lowercase letter, and one number'
        ),
    confirmNewPassword: z.string().min(1, 'Please confirm your new password'),
}).refine((data) => data.newPassword === data.confirmNewPassword, {
    message: 'Passwords do not match',
    path: ['confirmNewPassword'],
});

// Reset password schema
export const resetPasswordSchema = z.object({
    password: z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .regex(
            passwordRegex,
            'Password must contain at least one uppercase letter, one lowercase letter, and one number'
        ),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
});
