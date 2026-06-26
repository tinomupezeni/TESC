// src/components/auth/ProtectedRoute.tsx
import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { accessToken, user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!accessToken) {
    // If the user is not authenticated, redirect them to the login page
    return <Navigate to="/" replace />;
  }

  // If the user must change their password, redirect to the force-change page
  if (user?.must_change_password) {
    return <Navigate to="/change-password" replace />;
  }

  // If the user is authenticated, render the child components
  return <>{children}</>;
};

export default ProtectedRoute;