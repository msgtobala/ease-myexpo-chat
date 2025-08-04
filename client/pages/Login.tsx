import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword, signInWithPopup, signInWithRedirect, signOut, GoogleAuthProvider } from "firebase/auth";
import { auth, db } from "../lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import EasemyexpoLogo from "../assets/logo-icon.svg";
import MSMLogo from "../assets/logo.webp";

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Validation functions
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string): boolean => {
    return password.length >= 6;
  };

  const isFormValid = (): boolean => {
    return (
      formData.email.trim() !== "" &&
      validateEmail(formData.email) &&
      formData.password.trim() !== "" &&
      validatePassword(formData.password)
    );
  };

  // Helper function for field validation styling
  const getFieldValidationClass = (isValid: boolean, hasValue: boolean) => {
    if (!hasValue) {
      return "border-[rgba(16,185,129,0.4)]"; // Default border
    }
    return isValid ? "border-[#10B981]" : "border-[#E45270]"; // Green if valid, red if invalid
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleLogin = async () => {
    if (!isFormValid()) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please fill in all required fields correctly.",
      });
      return;
    }

    try {
      setIsLoading(true);

      // Sign in with Firebase Authentication
      const userCredential = await signInWithEmailAndPassword(
        auth,
        formData.email,
        formData.password,
      );
      const user = userCredential.user;

      console.log("Login successful:", user.uid);

      // Show success toast
      toast({
        title: "Login Successful",
        description: "Welcome back! Redirecting to your dashboard...",
      });

      // Navigate to main app after successful login
      setTimeout(() => navigate("/home"), 1000);
    } catch (error: any) {
      console.error("Login error:", error);

      // Handle specific Firebase auth errors with toasts
      let errorMessage = "";
      let errorTitle = "Login Failed";

      switch (error.code) {
        case "auth/user-not-found":
          errorMessage =
            "No account found with this email address. Please check your email or sign up for a new account.";
          break;
        case "auth/wrong-password":
          errorMessage =
            "Incorrect password. Please try again or reset your password.";
          break;
        case "auth/invalid-email":
          errorMessage =
            "Invalid email address format. Please enter a valid email.";
          break;
        case "auth/user-disabled":
          errorMessage =
            "This account has been disabled. Please contact support for assistance.";
          break;
        case "auth/too-many-requests":
          errorMessage =
            "Too many failed login attempts. Please try again later or reset your password.";
          break;
        case "auth/invalid-credential":
          errorMessage =
            "Invalid credentials. Please check your email and password.";
          break;
        default:
          errorMessage =
            "Login failed. Please check your credentials and try again.";
          break;
      }

      toast({
        variant: "destructive",
        title: errorTitle,
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = () => {
    navigate("/");
  };

  const handleForgotPassword = () => {
    // Handle forgot password logic
    console.log("Forgot password clicked");
  };

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      const provider = new GoogleAuthProvider();

      // Try popup first, fallback to redirect if popup fails
      let result;
      try {
        result = await signInWithPopup(auth, provider);
      } catch (popupError: any) {
        if (popupError.code === "auth/popup-blocked" || popupError.code === "auth/unauthorized-domain") {
          // Fallback to redirect method
          await signInWithRedirect(auth, provider);
          return; // Redirect will handle the rest
        }
        throw popupError;
      }

      const user = result.user;

      // Check if user exists in Firestore
      const userDoc = await getDoc(doc(db, "users", user.uid));

      if (!userDoc.exists()) {
        // New user - create user document with isOnboardingComplete: false
        const newUserData = {
          userId: user.uid,
          name: user.displayName || "",
          email: user.email || "",
          phone: "",
          profileType: "", // Will be filled during onboarding
          posts: [],
          joinedExhibitions: [],
          interests: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          description: "",
          websiteUrl: "",
          industry: null,
          profilePictureUrl: user.photoURL || "",
          isOnboardingComplete: false,
          isGoogleAuth: true
        };

        await setDoc(doc(db, "users", user.uid), newUserData);

        toast({
          title: "Welcome to Easemyexpo!",
          description: "Please complete your profile setup...",
        });

        // Set a temporary flag to indicate this user came from Google login
        sessionStorage.setItem('fromGoogleLogin', 'true');

        // Navigate to onboarding
        navigate("/");
      } else {
        // Existing user - check onboarding status
        const userData = userDoc.data();

        if (userData.isOnboardingComplete) {
          // Onboarding complete - go to dashboard
          toast({
            title: "Login Successful",
            description: "Welcome back! Redirecting to your dashboard...",
          });
          setTimeout(() => navigate("/home"), 1000);
        } else {
          // Onboarding incomplete - go to onboarding
          toast({
            title: "Welcome back!",
            description: "Please complete your profile setup...",
          });

          // Set a temporary flag to indicate this user came from Google login
          sessionStorage.setItem('fromGoogleLogin', 'true');

          navigate("/");
        }
      }
    } catch (error: any) {
      console.error("Google login error:", error);

      let errorMessage = "";
      let errorTitle = "Google Login Failed";

      switch (error.code) {
        case "auth/popup-closed-by-user":
          errorMessage = "Login was cancelled. Please try again.";
          break;
        case "auth/popup-blocked":
          errorMessage = "Popup was blocked by browser. Please allow popups and try again.";
          break;
        case "auth/network-request-failed":
          errorMessage = "Network error. Please check your internet connection and try again.";
          break;
        case "auth/unauthorized-domain":
          errorMessage = "This domain is not authorized for Google login. Please contact the administrator to add this domain to Firebase authorized domains, or use email/password login instead.";
          errorTitle = "Domain Not Authorized";
          break;
        default:
          errorMessage = "Google login failed. Please try again.";
          break;
      }

      toast({
        variant: "destructive",
        title: errorTitle,
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen bg-white flex overflow-hidden">
      {/* Main Content */}
      <div className="w-full bg-white flex flex-col relative">
        {/* Header */}
        <div className="flex items-center justify-between px-6 lg:px-[29px] pt-6 lg:pt-[24px]">
          {/* Logo */}
          <div className="flex items-center">
            <img
              src={EasemyexpoLogo}
              alt="Easemyexpo"
              className="h-[37px] w-auto"
            />&nbsp;&nbsp;&nbsp;
            <img
              src={MSMLogo}
              alt="Easmyexpo"
              className="h-[42px] w-auto"
            />
          </div>

          {/* Sign Up Link */}
          <div className="flex items-center gap-2">
            <span className="text-[12px] text-[rgba(0,2,15,0.5)] font-inter">
              Don't have an account?
            </span>
            <button
              onClick={handleSignUp}
              className="text-[13px] text-[#00020F] font-inter font-medium hover:text-[#10B981] transition-colors"
            >
              Sign up
            </button>
          </div>
        </div>

        {/* Login Form */}
        <div className="flex-1 flex flex-col items-center justify-center px-6">
          <div className="w-full max-w-[403px]">
            {/* Title and Description */}
            <div className="text-center mb-[61px]">
              <h1 className="text-[26.5px] font-semibold text-[#3B3D44] font-poppins mb-[34px] leading-normal">
                Log In
              </h1>
              <p className="text-[13.8px] text-[#B4B6B9] font-poppins leading-[21.1px] mx-auto max-w-[417px]">
                Connect with brands, create content, and earn commissions
                automatically based on real ad performance.
              </p>
            </div>

            {/* Form Fields */}
            <div className="space-y-[27px] mb-[32px]">
              {/* Email Field */}
              <div className="w-full">
                <div className="flex items-start gap-[1.824px] mb-[7.294px]">
                  <span className="text-[14.588px] text-[#26203B] font-poppins">
                    Email
                  </span>
                  <span className="text-[14.588px] text-[#E45270] font-dm-sans">
                    *
                  </span>
                </div>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className={`w-full h-[43.765px] px-[14.588px] py-[7.294px] border ${getFieldValidationClass(validateEmail(formData.email), formData.email.length > 0)} rounded-[7.294px] bg-white text-[12.765px] text-[#26203B] outline-none focus:border-[#10B981] focus:shadow-[0_3.647px_7.294px_0_rgba(70,95,241,0.1)]`}
                  placeholder="Enter Email"
                />
                {formData.email.length > 0 &&
                  !validateEmail(formData.email) && (
                    <p className="text-[#E45270] text-[11px] mt-1">
                      Please enter a valid email address
                    </p>
                  )}
              </div>

              {/* Password Field */}
              <div className="w-full">
                <div className="flex items-start gap-[1.824px] mb-[7.294px]">
                  <span className="text-[14.588px] text-[#26203B] font-poppins">
                    Password
                  </span>
                  <span className="text-[14.588px] text-[#E45270] font-dm-sans">
                    *
                  </span>
                </div>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    handleInputChange("password", e.target.value)
                  }
                  className={`w-full h-[43.765px] px-[14.588px] py-[7.294px] border ${getFieldValidationClass(validatePassword(formData.password), formData.password.length > 0)} rounded-[7.294px] bg-white text-[12.765px] text-[#26203B] outline-none focus:border-[#10B981] focus:shadow-[0_3.647px_7.294px_0_rgba(70,95,241,0.1)]`}
                  placeholder="Enter Password"
                />
                {formData.password.length > 0 &&
                  !validatePassword(formData.password) && (
                    <p className="text-[#E45270] text-[11px] mt-1">
                      Password must be at least 6 characters long
                    </p>
                  )}

                {/* Forgot Password Link */}
                <div className="mt-[12px]">
                  <button
                    onClick={handleForgotPassword}
                    className="text-[12.6px] text-[#10B981] font-poppins hover:underline transition-all"
                  >
                    Forgot password?
                  </button>
                </div>
              </div>
            </div>

            {/* Continue Button */}
            <button
              onClick={handleLogin}
              disabled={!isFormValid() || isLoading}
              className="w-full h-[42px] bg-[#10B981] rounded-[7.588px] border border-[#10B981] text-white font-inter text-[14.037px] font-medium transition-all duration-200 hover:bg-[#0ea571] disabled:opacity-50 disabled:cursor-not-allowed mb-[24px]"
            >
              {isLoading ? "Signing In..." : "Continue"}
            </button>

            {/* Divider */}
            <div className="flex items-center my-6">
              <div className="flex-1 h-px bg-[#E6E9EC]"></div>
              <span className="px-4 text-[13px] text-[#B4B6B9] font-poppins">or</span>
              <div className="flex-1 h-px bg-[#E6E9EC]"></div>
            </div>

            {/* Google Login Button */}
            <button
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full h-[42px] bg-white border border-[#E6E9EC] rounded-[7.588px] text-[#26203B] font-inter text-[14.037px] font-medium transition-all duration-200 hover:bg-[#F8F9FA] hover:border-[#10B981] disabled:opacity-50 disabled:cursor-not-allowed mb-[57px] flex items-center justify-center gap-3"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 18 18"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M17.64 9.20454C17.64 8.56636 17.5827 7.95272 17.4764 7.36363H9V10.845H13.8436C13.635 11.97 13.0009 12.9231 12.0477 13.5613V15.8195H14.9564C16.6582 14.2527 17.64 11.9454 17.64 9.20454Z"
                  fill="#4285F4"
                />
                <path
                  d="M9 18C11.43 18 13.4673 17.1941 14.9564 15.8195L12.0477 13.5613C11.2418 14.1013 10.2109 14.4204 9 14.4204C6.65591 14.4204 4.67182 12.8372 3.96409 10.71H0.957275V13.0418C2.43818 15.9831 5.48182 18 9 18Z"
                  fill="#34A853"
                />
                <path
                  d="M3.96409 10.71C3.78409 10.17 3.68182 9.59318 3.68182 9C3.68182 8.40682 3.78409 7.83 3.96409 7.29V4.95818H0.957273C0.347727 6.17318 0 7.54772 0 9C0 10.4523 0.347727 11.8268 0.957273 13.0418L3.96409 10.71Z"
                  fill="#FBBC04"
                />
                <path
                  d="M9 3.57955C10.3214 3.57955 11.5077 4.03364 12.4405 4.92545L15.0218 2.34409C13.4632 0.891818 11.4259 0 9 0C5.48182 0 2.43818 2.01682 0.957275 4.95818L3.96409 7.29C4.67182 5.16273 6.65591 3.57955 9 3.57955Z"
                  fill="#EA4335"
                />
              </svg>
              {isLoading ? "Signing In..." : "Continue with Google"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
