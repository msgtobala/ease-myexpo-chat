import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
  requireAuth?: boolean; // true = require auth, false = require no auth (for login/signup)
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  redirectTo = "/home",
  requireAuth = false,
}) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (requireAuth && !user) {
        // Require auth but user is not logged in - redirect to login
        navigate("/login");
      } else if (!requireAuth && user) {
        // Don't require auth but user is logged in - redirect to home
        navigate(redirectTo);
      }
    }
  }, [user, loading, navigate, redirectTo, requireAuth]);

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-[#10B981] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-[#9C9AA5] text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  // If we're still here, show the children
  return <>{children}</>;
};

export default ProtectedRoute;
