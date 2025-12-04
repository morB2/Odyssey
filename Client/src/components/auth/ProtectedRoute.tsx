import { Navigate } from 'react-router-dom';
import { useUserStore } from '../../store/userStore';

interface ProtectedRouteProps {
    children: React.ReactNode;
    requireAdmin?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
    children,
    requireAdmin = false
}) => {
    const { user, token } = useUserStore();

    // If not logged in, redirect to login
    if (!token || !user) {
        return <Navigate to="/login" replace />;
    }

    // If admin access is required but user is not admin, show 401
    if (requireAdmin && user.role !== 'admin') {
        return <Navigate to="/401" replace />;
    }

    return <>{children}</>;
};
