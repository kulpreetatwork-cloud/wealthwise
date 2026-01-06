import { useCallback } from 'react';
import { formatCurrency, formatCurrencyCompact, getCurrencySymbol } from '../lib/currency';

/**
 * Custom hook for currency formatting (INR only)
 * @returns {Object} Currency utilities
 */
export const useCurrency = () => {
    /**
     * Format an amount in INR
     * @param {number} amount - Amount to format
     * @param {Object} options - Formatting options
     * @returns {string} Formatted currency string
     */
    const format = useCallback((amount, options = {}) => {
        return formatCurrency(amount, options);
    }, []);

    /**
     * Format an amount in compact notation
     * @param {number} amount - Amount to format
     * @returns {string} Compact formatted string
     */
    const formatCompact = useCallback((amount) => {
        return formatCurrencyCompact(amount);
    }, []);

    /**
     * Get the currency symbol (always ₹)
     */
    const symbol = getCurrencySymbol();

    return {
        currency: 'INR',
        symbol,
        format,
        formatLocal: format, // Same as format now (no conversion)
        formatCompact,
    };
};

export default useCurrency;
