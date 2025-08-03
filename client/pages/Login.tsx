import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../lib/firebase";
import { useToast } from "@/hooks/use-toast";
import EasemyexpoLogo from "../assets/easemyexpo-logo.webp";

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
              className="w-full h-[42px] bg-[#10B981] rounded-[7.588px] border border-[#10B981] text-white font-inter text-[14.037px] font-medium transition-all duration-200 hover:bg-[#0ea571] disabled:opacity-50 disabled:cursor-not-allowed mb-[57px]"
            >
              {isLoading ? "Signing In..." : "Continue"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
