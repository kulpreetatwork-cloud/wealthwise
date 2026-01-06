import { Component } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import styles from './ErrorBoundary.module.css';

class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({ errorInfo });
        // Log error to console in development
        console.error('Error caught by boundary:', error, errorInfo);
    }

    handleRetry = () => {
        this.setState({ hasError: false, error: null, errorInfo: null });
        window.location.reload();
    };

    handleGoHome = () => {
        this.setState({ hasError: false, error: null, errorInfo: null });
        window.location.href = '/dashboard';
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className={styles.container}>
                    <motion.div
                        className={styles.content}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                    >
                        <div className={styles.iconWrapper}>
                            <AlertTriangle size={48} />
                        </div>

                        <h1 className={styles.title}>Something went wrong</h1>
                        <p className={styles.description}>
                            We're sorry, but something unexpected happened.
                            Please try refreshing the page or go back to the dashboard.
                        </p>

                        <div className={styles.actions}>
                            <button
                                className={styles.primaryBtn}
                                onClick={this.handleRetry}
                            >
                                <RefreshCw size={18} />
                                Refresh Page
                            </button>
                            <button
                                className={styles.secondaryBtn}
                                onClick={this.handleGoHome}
                            >
                                <Home size={18} />
                                Go to Dashboard
                            </button>
                        </div>

                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <details className={styles.errorDetails}>
                                <summary>Error Details (Dev Only)</summary>
                                <pre>{this.state.error.toString()}</pre>
                                <pre>{this.state.errorInfo?.componentStack}</pre>
                            </details>
                        )}
                    </motion.div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
