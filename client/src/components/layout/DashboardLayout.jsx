import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from './Sidebar';
import Header from './Header';
import styles from './DashboardLayout.module.css';

const DashboardLayout = () => {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const location = useLocation();

    // Close mobile menu on route change
    useEffect(() => {
        setMobileMenuOpen(false);
    }, [location.pathname]);

    return (
        <div className={styles.container}>
            {/* Sidebar */}
            <Sidebar
                collapsed={sidebarCollapsed}
                mobileOpen={mobileMenuOpen}
                onMobileClose={() => setMobileMenuOpen(false)}
            />

            {/* Mobile overlay */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        className={styles.overlay}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setMobileMenuOpen(false)}
                    />
                )}
            </AnimatePresence>

            {/* Main content */}
            <div
                className={`${styles.main} ${sidebarCollapsed ? styles.mainCollapsed : ''}`}
            >
                <Header
                    onMenuClick={() => setMobileMenuOpen(true)}
                    onCollapseClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                    collapsed={sidebarCollapsed}
                />

                <main className={styles.content}>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={location.pathname}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className={styles.pageContainer}
                        >
                            <Outlet />
                        </motion.div>
                    </AnimatePresence>
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
