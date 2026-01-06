/**
 * Currency utilities - INR only (simplified)
 */

/**
 * Format amount in INR
 * @param {number} amount - Amount to format
 * @param {Object} options - Additional formatting options
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, options = {}) => {
    const formatter = new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: options.minimumFractionDigits ?? 2,
        maximumFractionDigits: options.maximumFractionDigits ?? 2,
        ...options,
    });

    return formatter.format(amount || 0);
};

/**
 * Format amount with compact notation for large numbers
 * @param {number} amount - Amount to format
 * @returns {string} Compact formatted string
 */
export const formatCurrencyCompact = (amount) => {
    const formatter = new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        notation: 'compact',
        maximumFractionDigits: 1,
    });

    return formatter.format(amount || 0);
};

/**
 * Get currency symbol (always INR)
 * @returns {string} Currency symbol
 */
export const getCurrencySymbol = () => '₹';

export default {
    formatCurrency,
    formatCurrencyCompact,
    getCurrencySymbol,
};
