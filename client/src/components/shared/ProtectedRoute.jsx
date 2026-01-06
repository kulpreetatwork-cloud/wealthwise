import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import LoadingScreen from '../ui/LoadingScreen';

const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, isLoading, user } = useAuthStore();
    const location = useLocation();

    // Show loading while checking authentication
    if (isLoading) {
        return <LoadingScreen />;
    }

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Check if user has selected a role
    if (!user?.role) {
        return <Navigate to="/role-select" replace />;
    }

    return children;
};

export default ProtectedRoute;
