import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../lib/firebase";

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
  const [userDataLoading, setUserDataLoading] = useState(true);
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(false);

  useEffect(() => {
    const checkUserOnboardingStatus = async () => {
      if (user && !loading) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setIsOnboardingComplete(userData.isOnboardingComplete || false);
          } else {
            // User exists in auth but not in database - shouldn't happen but handle gracefully
            setIsOnboardingComplete(false);
          }
        } catch (error) {
          console.error("Error checking user onboarding status:", error);
          setIsOnboardingComplete(false);
        }
        setUserDataLoading(false);
      } else if (!loading) {
        setUserDataLoading(false);
      }
    };

    checkUserOnboardingStatus();
  }, [user, loading]);

  useEffect(() => {
    if (!loading && !userDataLoading) {
      if (requireAuth && !user) {
        // Require auth but user is not logged in - redirect to login
        navigate("/login");
      } else if (!requireAuth && user && isOnboardingComplete) {
        // Don't require auth but user is logged in and onboarding complete - redirect to home
        navigate(redirectTo);
      }
    }
  }, [user, loading, userDataLoading, isOnboardingComplete, navigate, redirectTo, requireAuth]);

  // Show loading state while checking auth and user data
  if (loading || userDataLoading) {
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
