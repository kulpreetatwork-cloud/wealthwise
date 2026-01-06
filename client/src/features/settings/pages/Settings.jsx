import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Settings as SettingsIcon, User, Bell, Shield, Palette,
    Globe, Save, Loader2, Camera, Mail, Phone, Check, Sun, Moon
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../../stores/authStore';
import { useTheme } from '../../../hooks';
import api from '../../../lib/api';
import styles from './Settings.module.css';

const Settings = () => {
    const { user, setUser } = useAuthStore();
    const { theme, setTheme } = useTheme();
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('profile');

    const [profile, setProfile] = useState({
        firstName: user?.profile?.firstName || '',
        lastName: user?.profile?.lastName || '',
        phone: user?.profile?.phone || '',
        timezone: user?.profile?.timezone || 'Asia/Kolkata',
    });

    const [preferences, setPreferences] = useState({
        notifications: user?.preferences?.notifications ?? true,
        weeklyReport: user?.preferences?.weeklyReport ?? true,
        theme: user?.preferences?.theme || 'dark',
    });

    const [password, setPassword] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });



    const timezones = [
        'UTC', 'America/New_York', 'America/Los_Angeles', 'America/Chicago',
        'Europe/London', 'Europe/Paris', 'Asia/Tokyo', 'Asia/Kolkata', 'Australia/Sydney'
    ];

    const tabs = [
        { id: 'profile', label: 'Profile', icon: User },
        { id: 'preferences', label: 'Preferences', icon: Bell },
        { id: 'security', label: 'Security', icon: Shield },
    ];

    // Sync form state when user data changes
    useEffect(() => {
        if (user) {
            setProfile({
                firstName: user.profile?.firstName || '',
                lastName: user.profile?.lastName || '',
                phone: user.profile?.phone || '',
                timezone: user.profile?.timezone || 'Asia/Kolkata',
            });
            setPreferences({
                notifications: user.preferences?.notifications ?? true,
                weeklyReport: user.preferences?.weeklyReport ?? true,
                theme: user.preferences?.theme || 'dark',
            });
        }
    }, [user]);

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Wrap profile data in a profile object as backend expects
            const response = await api.put('/users/profile', { profile });
            setUser(response.data.data);
            toast.success('Profile updated successfully!');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const handlePreferencesUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await api.put('/users/preferences', preferences);
            setUser(response.data.data);
            toast.success('Preferences saved!');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update preferences');
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (password.newPassword !== password.confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }
        if (password.newPassword.length < 8) {
            toast.error('Password must be at least 8 characters');
            return;
        }
        setLoading(true);
        try {
            const response = await api.put('/users/change-password', {
                currentPassword: password.currentPassword,
                newPassword: password.newPassword,
            });

            // Update user and token in auth store if returned
            if (response.data.data) {
                const { user: updatedUser, accessToken } = response.data.data;
                if (updatedUser) setUser(updatedUser);
                if (accessToken) {
                    // Store new access token
                    localStorage.setItem('accessToken', accessToken);
                }
            }

            toast.success('Password changed successfully!');
            setPassword({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to change password');
        } finally {
            setLoading(false);
        }
    };

    const togglePreference = (key) => {
        setPreferences(prev => ({ ...prev, [key]: !prev[key] }));
    };

    return (
        <div className={styles.container}>
            {/* Header */}
            <div className={styles.header}>
                <h1 className={styles.title}>
                    <SettingsIcon size={28} />
                    Settings
                </h1>
                <p className={styles.subtitle}>Manage your account and preferences</p>
            </div>

            {/* Content */}
            <div className={styles.content}>
                {/* Tabs */}
                <div className={styles.tabs}>
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            className={`${styles.tab} ${activeTab === tab.id ? styles.tabActive : ''}`}
                            onClick={() => setActiveTab(tab.id)}
                        >
                            <tab.icon size={18} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <motion.div
                    className={styles.tabContent}
                    key={activeTab}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2 }}
                >
                    {/* Profile Tab */}
                    {activeTab === 'profile' && (
                        <form onSubmit={handleProfileUpdate} className={styles.form}>
                            <div className={styles.avatarSection}>
                                <div className={styles.avatar}>
                                    {user?.profile?.firstName?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}
                                </div>
                                <div className={styles.avatarInfo}>
                                    <h3>{user?.profile?.firstName || 'User'} {user?.profile?.lastName || ''}</h3>
                                    <p>{user?.email}</p>
                                    <span className={styles.roleBadge}>{user?.role || 'Individual'}</span>
                                </div>
                            </div>

                            <div className={styles.formGrid}>
                                <div className={styles.formGroup}>
                                    <label>First Name</label>
                                    <input
                                        type="text"
                                        value={profile.firstName}
                                        onChange={(e) => setProfile(p => ({ ...p, firstName: e.target.value }))}
                                        placeholder="Enter first name"
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Last Name</label>
                                    <input
                                        type="text"
                                        value={profile.lastName}
                                        onChange={(e) => setProfile(p => ({ ...p, lastName: e.target.value }))}
                                        placeholder="Enter last name"
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Phone</label>
                                    <input
                                        type="tel"
                                        value={profile.phone}
                                        onChange={(e) => setProfile(p => ({ ...p, phone: e.target.value }))}
                                        placeholder="+1 234 567 8900"
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Timezone</label>
                                    <select
                                        value={profile.timezone}
                                        onChange={(e) => setProfile(p => ({ ...p, timezone: e.target.value }))}
                                    >
                                        {timezones.map(tz => (
                                            <option key={tz} value={tz}>{tz}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <button type="submit" className={styles.saveBtn} disabled={loading}>
                                {loading ? <Loader2 className={styles.spinner} size={18} /> : <Save size={18} />}
                                Save Changes
                            </button>
                        </form>
                    )}

                    {/* Preferences Tab */}
                    {activeTab === 'preferences' && (
                        <form onSubmit={handlePreferencesUpdate} className={styles.form}>
                            <div className={styles.preferencesList}>
                                <div className={styles.preferenceItem}>
                                    <div className={styles.preferenceInfo}>
                                        <Bell size={20} />
                                        <div>
                                            <h4>Push Notifications</h4>
                                            <p>Receive alerts for budget limits, goal milestones, and bills</p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        className={`${styles.toggle} ${preferences.notifications ? styles.toggleOn : ''}`}
                                        onClick={() => togglePreference('notifications')}
                                    >
                                        <span className={styles.toggleHandle} />
                                    </button>
                                </div>

                                <div className={styles.preferenceItem}>
                                    <div className={styles.preferenceInfo}>
                                        <Mail size={20} />
                                        <div>
                                            <h4>Weekly Report</h4>
                                            <p>Get a weekly summary of your finances via email</p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        className={`${styles.toggle} ${preferences.weeklyReport ? styles.toggleOn : ''}`}
                                        onClick={() => togglePreference('weeklyReport')}
                                    >
                                        <span className={styles.toggleHandle} />
                                    </button>
                                </div>

                                <div className={styles.preferenceItem}>
                                    <div className={styles.preferenceInfo}>
                                        <Palette size={20} />
                                        <div>
                                            <h4>Theme</h4>
                                            <p>Choose your preferred color scheme</p>
                                        </div>
                                    </div>
                                    <div className={styles.themeOptions}>
                                        <button
                                            type="button"
                                            className={`${styles.themeBtn} ${theme === 'dark' ? styles.themeBtnActive : ''}`}
                                            onClick={() => {
                                                setTheme('dark');
                                                setPreferences(p => ({ ...p, theme: 'dark' }));
                                            }}
                                        >
                                            <Moon size={16} />
                                            Dark
                                        </button>
                                        <button
                                            type="button"
                                            className={`${styles.themeBtn} ${theme === 'light' ? styles.themeBtnActive : ''}`}
                                            onClick={() => {
                                                setTheme('light');
                                                setPreferences(p => ({ ...p, theme: 'light' }));
                                            }}
                                        >
                                            <Sun size={16} />
                                            Light
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <button type="submit" className={styles.saveBtn} disabled={loading}>
                                {loading ? <Loader2 className={styles.spinner} size={18} /> : <Save size={18} />}
                                Save Preferences
                            </button>
                        </form>
                    )}

                    {/* Security Tab */}
                    {activeTab === 'security' && (
                        <form onSubmit={handlePasswordChange} className={styles.form}>
                            <h3 className={styles.sectionTitle}>Change Password</h3>
                            <p className={styles.sectionDesc}>Ensure your account stays secure by using a strong password</p>

                            <div className={styles.formGrid}>
                                <div className={styles.formGroup} style={{ gridColumn: '1 / -1' }}>
                                    <label>Current Password</label>
                                    <input
                                        type="password"
                                        value={password.currentPassword}
                                        onChange={(e) => setPassword(p => ({ ...p, currentPassword: e.target.value }))}
                                        placeholder="Enter current password"
                                        required
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>New Password</label>
                                    <input
                                        type="password"
                                        value={password.newPassword}
                                        onChange={(e) => setPassword(p => ({ ...p, newPassword: e.target.value }))}
                                        placeholder="Enter new password"
                                        minLength={8}
                                        required
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Confirm New Password</label>
                                    <input
                                        type="password"
                                        value={password.confirmPassword}
                                        onChange={(e) => setPassword(p => ({ ...p, confirmPassword: e.target.value }))}
                                        placeholder="Confirm new password"
                                        minLength={8}
                                        required
                                    />
                                </div>
                            </div>

                            <div className={styles.passwordTips}>
                                <h4>Password Requirements:</h4>
                                <ul>
                                    <li className={password.newPassword.length >= 8 ? styles.tipMet : ''}>
                                        <Check size={14} /> At least 8 characters
                                    </li>
                                    <li className={/[A-Z]/.test(password.newPassword) ? styles.tipMet : ''}>
                                        <Check size={14} /> One uppercase letter
                                    </li>
                                    <li className={/[0-9]/.test(password.newPassword) ? styles.tipMet : ''}>
                                        <Check size={14} /> One number
                                    </li>
                                </ul>
                            </div>

                            <button type="submit" className={styles.saveBtn} disabled={loading}>
                                {loading ? <Loader2 className={styles.spinner} size={18} /> : <Shield size={18} />}
                                Update Password
                            </button>
                        </form>
                    )}
                </motion.div>
            </div>
        </div>
    );
};

export default Settings;
