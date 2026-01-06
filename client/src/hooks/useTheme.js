import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook for managing theme (dark/light mode)
 * Syncs with localStorage and applies to document
 * @param {string} defaultTheme - Default theme if not stored
 * @returns {Object} { theme, setTheme, toggleTheme }
 */
export const useTheme = (defaultTheme = 'dark') => {
    const [theme, setThemeState] = useState(() => {
        // Check localStorage first
        const stored = localStorage.getItem('theme');
        if (stored) return stored;

        // Check system preference
        if (typeof window !== 'undefined' && window.matchMedia) {
            return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
        }

        return defaultTheme;
    });

    // Apply theme to document
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    // Listen for system preference changes
    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: light)');
        const handleChange = (e) => {
            // Only auto-switch if user hasn't explicitly set a preference
            const stored = localStorage.getItem('theme');
            if (!stored) {
                setThemeState(e.matches ? 'light' : 'dark');
            }
        };

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);

    const setTheme = useCallback((newTheme) => {
        setThemeState(newTheme);
    }, []);

    const toggleTheme = useCallback(() => {
        setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark'));
    }, []);

    return { theme, setTheme, toggleTheme };
};

export default useTheme;
