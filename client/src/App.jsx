import { Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy, useEffect, useRef } from 'react';
import { useAuthStore } from './stores/authStore';
import { useNotificationStore } from './stores/notificationStore';

// Layouts
import AuthLayout from './components/layout/AuthLayout';
import DashboardLayout from './components/layout/DashboardLayout';

// Components
import LoadingScreen from './components/ui/LoadingScreen';
import ProtectedRoute from './components/shared/ProtectedRoute';

// Lazy load pages for code splitting
const Login = lazy(() => import('./features/auth/pages/Login'));
const Register = lazy(() => import('./features/auth/pages/Register'));
const RoleSelect = lazy(() => import('./features/auth/pages/RoleSelect'));

const Dashboard = lazy(() => import('./features/dashboard/pages/Dashboard'));
const Transactions = lazy(() => import('./features/transactions/pages/Transactions'));
const Budgets = lazy(() => import('./features/budgets/pages/Budgets'));
const Goals = lazy(() => import('./features/goals/pages/Goals'));
const Bills = lazy(() => import('./features/bills/pages/Bills'));
const AIAssistant = lazy(() => import('./features/ai-assistant/pages/AIAssistant'));
const Investments = lazy(() => import('./features/investments/pages/Investments'));
const Reports = lazy(() => import('./features/reports/pages/Reports'));
const Settings = lazy(() => import('./features/settings/pages/Settings'));

function App() {
  const { isLoading, accessToken, isAuthenticated } = useAuthStore();
  const { initSocket, disconnectSocket, fetchUnreadCount } = useNotificationStore();
  const hasCheckedAuth = useRef(false);

  // Check authentication ONCE on app mount
  useEffect(() => {
    if (hasCheckedAuth.current) return;
    hasCheckedAuth.current = true;

    const initAuth = async () => {
      if (accessToken) {
        // We have a stored token, verify it
        await useAuthStore.getState().checkAuth();
      } else {
        // No token, just set loading to false
        useAuthStore.setState({ isLoading: false });
      }
    };

    initAuth();
  }, []); // Empty dependency array - run only once

  // Initialize socket when authenticated
  useEffect(() => {
    if (isAuthenticated && accessToken) {
      initSocket(accessToken);
      fetchUnreadCount();
    } else {
      disconnectSocket();
    }

    return () => {
      disconnectSocket();
    };
  }, [isAuthenticated, accessToken]);

  // Show loading screen while checking initial auth
  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        {/* Public Routes - Auth */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/role-select" element={<RoleSelect />} />
        </Route>

        {/* Protected Routes - Dashboard */}
        <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/budgets" element={<Budgets />} />
          <Route path="/goals" element={<Goals />} />
          <Route path="/bills" element={<Bills />} />
          <Route path="/ai-assistant" element={<AIAssistant />} />
          <Route path="/investments" element={<Investments />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/settings" element={<Settings />} />
        </Route>

        {/* Redirects */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Suspense>
  );
}

export default App;
