import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Global keyboard shortcuts hook
 * @param {Object} options - Configuration options
 * @param {Function} options.onSearch - Callback for search shortcut (Cmd+K)
 * @param {Function} options.onNewTransaction - Callback for new transaction (N)
 * @param {Function} options.onEscape - Callback for escape key
 */
const useKeyboardShortcuts = ({
    onSearch,
    onNewTransaction,
    onEscape,
    enabled = true
} = {}) => {
    const navigate = useNavigate();

    const handleKeyDown = useCallback((e) => {
        if (!enabled) return;

        // Don't trigger shortcuts when typing in inputs
        const isInput = ['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName);
        const isContentEditable = e.target.isContentEditable;

        // Cmd/Ctrl + K - Search
        if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
            e.preventDefault();
            onSearch?.();
            return;
        }

        // Escape - Close modals/panels
        if (e.key === 'Escape') {
            onEscape?.();
            return;
        }

        // Skip letter shortcuts when in input fields
        if (isInput || isContentEditable) return;

        // N - New Transaction
        if (e.key === 'n' || e.key === 'N') {
            e.preventDefault();
            if (onNewTransaction) {
                onNewTransaction();
            } else {
                navigate('/transactions?action=add');
            }
            return;
        }

        // G + D - Go to Dashboard
        if (e.key === 'd' || e.key === 'D') {
            navigate('/dashboard');
            return;
        }

        // G + T - Go to Transactions
        if (e.key === 't' || e.key === 'T') {
            navigate('/transactions');
            return;
        }

        // G + B - Go to Budgets
        if (e.key === 'b' || e.key === 'B') {
            navigate('/budgets');
            return;
        }

        // G + G - Go to Goals
        if (e.key === 'g' || e.key === 'G') {
            navigate('/goals');
            return;
        }

        // ? - Show shortcuts help (optional)
        if (e.key === '?') {
            console.log('Keyboard Shortcuts:');
            console.log('  Cmd+K: Search');
            console.log('  N: New Transaction');
            console.log('  D: Dashboard');
            console.log('  T: Transactions');
            console.log('  B: Budgets');
            console.log('  G: Goals');
            console.log('  Esc: Close modal');
        }
    }, [enabled, onSearch, onNewTransaction, onEscape, navigate]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);
};

export default useKeyboardShortcuts;
