import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword, signInWithCredential, GoogleAuthProvider } from "firebase/auth";
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { auth, db, storage } from "../lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "../contexts/AuthContext";
import OnboardingImage from "../assets/vendor-dashboard.webp";
import EasemyexpoLogo from "../assets/logo-icon.svg";
import MSMLogo from "../assets/logo.webp";

interface UserType {
  id: "exhibitor" | "visitor";
  title: string;
  description: string;
  icon: string;
  selected: boolean;
}

export default function Onboarding() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [selectedUserType, setSelectedUserType] = useState<
    "exhibitor" | "visitor" | null
  >("exhibitor");
  const [currentStep, setCurrentStep] = useState<
    | "selection"
    | "exhibitor-details"
    | "company-profile"
    | "business-verification"
    | "visitor-profile-setup"
  >("selection");
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isGoogleAuth, setIsGoogleAuth] = useState(false);
  const [googleAuthData, setGoogleAuthData] = useState<any>(null);

  // Enhanced form data structure with all required fields
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    // Exhibitor specific fields
    companyLogo: null as File | null,
    companyDescription: "",
    websiteUrl: "",
    industry: "",
    catalogBrochure: null as File | null,
    // Visitor specific fields
    profilePicture: null as File | null,
    shortBio: "",
    linkedinWebsite: "",
    // Additional fields for database
    profileType: selectedUserType || "exhibitor",
    description: "",
    brochure: null as File | null,
    posts: [] as any[],
    joinedExhibitions: [] as any[],
    interests: [] as any[],
  });

  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // File preview states
  const [previews, setPreviews] = useState({
    companyLogo: null as string | null,
    catalogBrochure: null as string | null,
    profilePicture: null as string | null,
  });

  // Check if user came from Google login and load their data
  useEffect(() => {
    const loadUserData = async () => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();

            // If onboarding is already complete, redirect to home
            if (userData.isOnboardingComplete) {
              navigate("/home");
              return;
            }

            // Check if user came from Google login
            const fromGoogleLogin = sessionStorage.getItem('fromGoogleLogin');

            // Only show Google UI and pre-fill if they came from Google login
            if (userData.isGoogleAuth && fromGoogleLogin) {
              // Clear the flag immediately after checking
              sessionStorage.removeItem('fromGoogleLogin');

              setIsGoogleAuth(true);
              setGoogleAuthData({
                uid: user.uid,
                name: userData.name || "",
                email: userData.email || "",
                photoURL: userData.profilePictureUrl || "",
                isGoogleAuth: true
              });

              // Pre-populate form data from database
              setFormData(prev => ({
                ...prev,
                name: userData.name || "",
                email: userData.email || "",
                phone: userData.phone || "",
                // Skip password fields for Google auth
                password: "google-auth-placeholder",
                confirmPassword: "google-auth-placeholder",
              }));

              // If we have a profile picture URL, set it as preview
              if (userData.profilePictureUrl) {
                setPreviews(prev => ({
                  ...prev,
                  profilePicture: userData.profilePictureUrl
                }));
              }

              console.log("Google auth user data loaded from login:", userData);
            } else {
              // Not from Google login or not Google user - show empty form
              setIsGoogleAuth(false);
              setGoogleAuthData(null);

              setFormData(prev => ({
                ...prev,
                name: "",
                email: "",
                phone: "",
                password: "",
                confirmPassword: "",
              }));

              setPreviews({
                companyLogo: null,
                catalogBrochure: null,
                profilePicture: null,
              });

              console.log("Regular user or not from Google login - empty form");
            }
          }
        } catch (error) {
          console.error("Error loading user data:", error);
        }
      }
    };

    loadUserData();
  }, [user, navigate]);

  // Cleanup preview URLs on component unmount
  useEffect(() => {
    return () => {
      Object.values(previews).forEach((url) => {
        if (url) URL.revokeObjectURL(url);
      });
    };
  }, [previews]);

  // Cleanup onboarding flow flag on component unmount (except during form submission)
  useEffect(() => {
    return () => {
      // Only clear if not currently submitting
      if (!isLoading) {
        sessionStorage.removeItem('isOnboardingFlow');
      }
    };
  }, [isLoading]);

  // Validation functions
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string): boolean => {
    return password.length >= 6;
  };

  const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^[\d\s\-\+\(\)]{10,}$/;
    return phoneRegex.test(phone.replace(/\s/g, ""));
  };

  const validateURL = (url: string): boolean => {
    if (!url.trim()) return false;

    // Comprehensive URL regex that handles various formats
    const urlRegex = /^((https?|ftp|smtp):\/\/)?(www.)?[a-z0-9]+(\.[a-z]{2,}){1,3}(#?\/?[a-zA-Z0-9#]+)*\/?(\?[a-zA-Z0-9-_]+=[a-zA-Z0-9-%]+&?)?$/i;

    return urlRegex.test(url.trim());
  };

  // Step validation functions
  const isSelectionStepValid = (): boolean => {
    return selectedUserType !== null;
  };

  const isBasicDetailsStepValid = (): boolean => {
    if (isGoogleAuth) {
      // For Google auth, skip password validation
      return (
        formData.name.trim() !== "" &&
        validateEmail(formData.email) &&
        validatePhone(formData.phone)
      );
    }

    return (
      formData.name.trim() !== "" &&
      validateEmail(formData.email) &&
      validatePassword(formData.password) &&
      formData.password === formData.confirmPassword &&
      validatePhone(formData.phone)
    );
  };

  const isCompanyProfileStepValid = (): boolean => {
    return (
      formData.companyLogo !== null &&
      formData.companyDescription.trim() !== "" &&
      validateURL(formData.websiteUrl) &&
      formData.industry !== ""
    );
  };

  const isBusinessVerificationStepValid = (): boolean => {
    return formData.catalogBrochure !== null;
  };

  const isVisitorProfileStepValid = (): boolean => {
    return (
      formData.profilePicture !== null &&
      formData.shortBio.trim() !== "" &&
      (formData.linkedinWebsite.trim() === "" ||
        validateURL(formData.linkedinWebsite))
    );
  };

  // Get current step validation status
  const getCurrentStepValidation = (): boolean => {
    switch (currentStep) {
      case "selection":
        return isSelectionStepValid();
      case "exhibitor-details":
        return isBasicDetailsStepValid();
      case "company-profile":
        return isCompanyProfileStepValid();
      case "business-verification":
        return isBusinessVerificationStepValid();
      case "visitor-profile-setup":
        return isVisitorProfileStepValid();
      default:
        return false;
    }
  };

  // Helper function to get field validation styling
  const getFieldValidationClass = (isValid: boolean, hasValue: boolean) => {
    if (!hasValue) {
      return "border-[rgba(16,185,129,0.4)]"; // Default border
    }
    return isValid ? "border-[#10B981]" : "border-[#E45270]"; // Green if valid, red if invalid
  };

  // File upload functions
  const uploadProfileImage = async (
    file: File,
    userId: string,
  ): Promise<string> => {
    const fileRef = ref(storage, `profiles/${userId}`);
    const snapshot = await uploadBytes(fileRef, file);
    return await getDownloadURL(snapshot.ref);
  };

  const uploadBrochure = async (
    file: File,
    userId: string,
  ): Promise<string> => {
    const fileRef = ref(storage, `brochures/${userId}/${file.name}`);
    const snapshot = await uploadBytes(fileRef, file);
    return await getDownloadURL(snapshot.ref);
  };

  const userTypes: UserType[] = [
    {
      id: "exhibitor",
      title: "I'm an Exhibitor",
      description: "I'm setting a community and discovering leads",
      icon: "https://api.builder.io/api/v1/image/assets/TEMP/8e182c99496540fb3bb6b0082d29388ae1b7a750?width=96",
      selected: selectedUserType === "exhibitor",
    },
    {
      id: "visitor",
      title: "I'm an Visitor",
      description: "Just exploring communities and discussions",
      icon: "https://api.builder.io/api/v1/image/assets/TEMP/0178bb9446e11baf4de2f10326fb160ebba37ec7?width=96",
      selected: selectedUserType === "visitor",
    },
  ];

  const handleContinue = async () => {
    if (currentStep === "selection" && selectedUserType) {
      setIsTransitioning(true);
      setTimeout(() => {
        // Both exhibitor and visitor go to the same Basic Details step
        setCurrentStep("exhibitor-details");
        setIsTransitioning(false);
      }, 150);
    } else if (currentStep === "exhibitor-details") {
      setIsTransitioning(true);
      setTimeout(() => {
        if (selectedUserType === "exhibitor") {
          setCurrentStep("company-profile");
        } else {
          // Visitor goes to Profile Setup step
          setCurrentStep("visitor-profile-setup");
        }
        setIsTransitioning(false);
      }, 150);
    } else if (currentStep === "visitor-profile-setup") {
      // Handle visitor final form submission
      await handleFinalSubmission("visitor");
    } else if (currentStep === "company-profile") {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentStep("business-verification");
        setIsTransitioning(false);
      }, 150);
    } else if (currentStep === "business-verification") {
      // Handle final exhibitor form submission
      await handleFinalSubmission("exhibitor");
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleFinalSubmission = async (userType: "exhibitor" | "visitor") => {
    try {
      setIsLoading(true);

      let userId: string;

      if (isGoogleAuth && googleAuthData) {
        // Google auth user - use existing Google UID (user is already authenticated)
        userId = googleAuthData.uid;

        // Validation for Google auth (skip password validation)
        if (!formData.email) {
          toast({
            variant: "destructive",
            title: "Validation Error",
            description: "Email is required.",
          });
          return;
        }

        // User is already authenticated via Google, no need to create new auth user
      } else {
        // Regular email/password signup
        if (!formData.email || !formData.password) {
          toast({
            variant: "destructive",
            title: "Validation Error",
            description: "Email and password are required.",
          });
          return;
        }

        if (formData.password !== formData.confirmPassword) {
          toast({
            variant: "destructive",
            title: "Password Mismatch",
            description: "Passwords do not match. Please check and try again.",
          });
          return;
        }

        if (formData.password.length < 6) {
          toast({
            variant: "destructive",
            title: "Weak Password",
            description: "Password should be at least 6 characters long.",
          });
          return;
        }

        // Create user with Firebase Authentication
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          formData.email,
          formData.password,
        );
        userId = userCredential.user.uid;
      }

      // Upload files to Firebase Storage and get download URLs
      let companyLogoUrl = null;
      let brochureUrl = null;
      let profilePictureUrl = null;

      if (userType === "exhibitor") {
        // Upload company logo if provided
        if (formData.companyLogo) {
          companyLogoUrl = await uploadProfileImage(
            formData.companyLogo,
            userId,
          );
        }

        // Upload brochure if provided
        if (formData.catalogBrochure) {
          brochureUrl = await uploadBrochure(
            formData.catalogBrochure,
            userId,
          );
        }
      } else {
        // Upload profile picture for visitor if provided
        if (formData.profilePicture) {
          profilePictureUrl = await uploadProfileImage(
            formData.profilePicture,
            userId,
          );
        } else if (isGoogleAuth && googleAuthData?.photoURL) {
          // Use Google profile picture URL if no custom picture uploaded
          profilePictureUrl = googleAuthData.photoURL;
        }
      }

      // Prepare user data for Firestore
      const userData: any = {
        userId: userId,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        profileType: userType,
        posts: [],
        joinedExhibitions: [],
        interests: [],
        updatedAt: new Date().toISOString(),
        isOnboardingComplete: true,
        isGoogleAuth: isGoogleAuth || false,
      };

      // Only add createdAt for new email/password users (not Google users)
      if (!isGoogleAuth) {
        userData.createdAt = new Date().toISOString();
      }

      // Add type-specific data
      if (userType === "exhibitor") {
        Object.assign(userData, {
          description: formData.companyDescription,
          websiteUrl: formData.websiteUrl,
          industry: formData.industry,
          companyLogoUrl,
          brochureUrl,
        });
      } else {
        Object.assign(userData, {
          description: formData.shortBio,
          websiteUrl: formData.linkedinWebsite,
          industry: null,
          profilePictureUrl,
        });
      }

      // Save user data to Firestore
      if (isGoogleAuth) {
        // Update existing Google user document
        await updateDoc(doc(db, "users", userId), userData);
      } else {
        // Create new document for email/password users
        await setDoc(doc(db, "users", userId), userData);
      }

      console.log("User registration successful:", userData);

      // Show success toast
      toast({
        title: "Account Created Successfully!",
        description: `Welcome aboard! Your ${userType} account has been created.`,
      });

      // Navigate to confirmation screen
      setTimeout(() => navigate("/creation-confirmation"), 1000);
    } catch (error: any) {
      console.error("Registration error:", error);

      // Handle specific Firebase auth errors with toasts
      let errorMessage = "";
      let errorTitle = "Registration Failed";

      switch (error.code) {
        case "auth/email-already-in-use":
          errorTitle = "Account Already Exists";
          errorMessage =
            "An account with this email address already exists. Please try logging in instead.";
          break;
        case "auth/weak-password":
          errorTitle = "Weak Password";
          errorMessage =
            "Password is too weak. Please choose a stronger password.";
          break;
        case "auth/invalid-email":
          errorTitle = "Invalid Email";
          errorMessage = "Please enter a valid email address.";
          break;
        case "auth/operation-not-allowed":
          errorTitle = "Registration Disabled";
          errorMessage =
            "Email/password registration is currently disabled. Please contact support.";
          break;
        case "auth/network-request-failed":
          errorTitle = "Network Error";
          errorMessage =
            "Network connection failed. Please check your internet connection and try again.";
          break;
        default:
          errorMessage =
            error.message || "Registration failed. Please try again.";
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

  const handleFileUpload = (file: File | null) => {
    setFormData((prev) => ({
      ...prev,
      companyLogo: file,
    }));

    // Create preview URL for company logo
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setPreviews((prev) => ({ ...prev, companyLogo: previewUrl }));
    } else {
      setPreviews((prev) => ({ ...prev, companyLogo: null }));
    }
  };

  const handleDocumentUpload = (file: File | null) => {
    setFormData((prev) => ({
      ...prev,
      catalogBrochure: file,
    }));

    // Create preview URL for brochure
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setPreviews((prev) => ({ ...prev, catalogBrochure: previewUrl }));
    } else {
      setPreviews((prev) => ({ ...prev, catalogBrochure: null }));
    }
  };

  const handleProfilePictureUpload = (file: File | null) => {
    setFormData((prev) => ({
      ...prev,
      profilePicture: file,
    }));

    // Create preview URL for profile picture
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setPreviews((prev) => ({ ...prev, profilePicture: previewUrl }));
    } else {
      setPreviews((prev) => ({ ...prev, profilePicture: null }));
    }
  };

  return (
    <div className="h-screen bg-white flex overflow-visible md:overflow-hidden">
      {/* Left Side - Form */}
      <div className="w-full lg:w-[549px] bg-white flex flex-col relative">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 lg:px-[65px] pt-6 lg:pt-[24px]">
          {/* Logo */}
          <div className="flex items-center">
            <img
              src={EasemyexpoLogo}
              alt="Easemyexpo"
              className="h-[37px] w-auto"
            />&nbsp;&nbsp;&nbsp;
            <img
              src={MSMLogo}
              alt="Easemyexpo"
              className="h-[42px] w-auto"
            />
          </div>

          {/* Login Link */}
          <div className="flex items-center gap-2">
            <span className="text-[12px] text-[rgba(0,2,15,0.5)] font-inter">
              Already have an account?
            </span>
            <button
              onClick={() => navigate("/login")}
              className="text-[13px] text-[#00020F] font-inter font-medium hover:text-[#10B981] transition-colors"
            >
              Log in
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div
          className={`flex-1 px-4 sm:px-6 lg:px-[65px] transition-opacity duration-300 ${isTransitioning ? "opacity-0" : "opacity-100"} ${
            currentStep === "exhibitor-details" ||
            currentStep === "company-profile" ||
            currentStep === "business-verification" ||
            currentStep === "visitor-profile-setup"
              ? "pt-8 lg:pt-[45px]"
              : "pt-8 lg:pt-[100px]"
          }`}
        >
          {currentStep === "selection" && (
            <>
              {/* Title and Description */}
              <div className="mb-[61px]">
                <h1 className="text-[26.5px] font-semibold text-[#00020F] font-poppins mb-[34px] leading-normal">
                  Create an account
                </h1>
                <p className="text-[13.8px] text-[rgba(0,2,15,0.5)] font-poppins leading-[21.1px] max-w-[417px] w-full">
                  Connect with brands, create content, and earn commissions
                  automatically based on real ad performance.
                </p>
              </div>

              {/* User Type Selection */}
              <div className="space-y-[27px] mb-[32px]">
                {userTypes.map((userType) => (
                  <div
                    key={userType.id}
                    className={`relative p-4 rounded-[9px] cursor-pointer transition-all duration-200 ${
                      userType.selected
                        ? "border-[3px] border-[#10B981] bg-[#FEFEFE]"
                        : "border-[2px] border-[#F1F0F1] bg-[#FEFEFE] hover:border-[#10B981]"
                    }`}
                    onClick={() => {
                      setSelectedUserType(userType.id);
                      // Update profile type in form data
                      setFormData((prev) => ({
                        ...prev,
                        profileType: userType.id,
                      }));
                    }}
                  >
                    <div className="flex items-center">
                      {/* Icon */}
                      <div className="w-[48px] h-[48px] rounded-[8.25px] overflow-hidden mr-[12px] flex-shrink-0">
                        <img
                          src={userType.icon}
                          alt={userType.title}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Content */}
                      <div className="flex-1">
                        <h3 className="text-[14.5px] text-[#6A6C70] font-poppins mb-[4px] font-normal">
                          {userType.title}
                        </h3>
                        <p className="text-[12.3px] text-[rgba(0,2,15,0.5)] font-poppins font-normal">
                          {userType.description}
                        </p>
                      </div>

                      {/* Selection Indicator */}
                      <div className="w-6 h-6 flex-shrink-0">
                        {userType.selected ? (
                          <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M12 2.25C10.0716 2.25 8.18657 2.82183 6.58319 3.89317C4.97982 4.96452 3.73013 6.48726 2.99218 8.26884C2.25422 10.0504 2.06114 12.0108 2.43735 13.9021C2.81355 15.7934 3.74215 17.5307 5.10571 18.8943C6.46928 20.2579 8.20656 21.1865 10.0979 21.5627C11.9892 21.9389 13.9496 21.7458 15.7312 21.0078C17.5127 20.2699 19.0355 19.0202 20.1068 17.4168C21.1782 15.8134 21.75 13.9284 21.75 12C21.7473 9.41498 20.7192 6.93661 18.8913 5.10872C17.0634 3.28084 14.585 2.25273 12 2.25ZM16.2806 10.2806L11.0306 15.5306C10.961 15.6004 10.8783 15.6557 10.7872 15.6934C10.6962 15.7312 10.5986 15.7506 10.5 15.7506C10.4014 15.7506 10.3038 15.7312 10.2128 15.6934C10.1218 15.6557 10.039 15.6004 9.96938 15.5306L7.71938 13.2806C7.57865 13.1399 7.49959 12.949 7.49959 12.75C7.49959 12.551 7.57865 12.3601 7.71938 12.2194C7.86011 12.0786 8.05098 11.9996 8.25 11.9996C8.44903 11.9996 8.6399 12.0786 8.78063 12.2194L10.5 13.9397L15.2194 9.21937C15.2891 9.14969 15.3718 9.09442 15.4628 9.0567C15.5539 9.01899 15.6515 8.99958 15.75 8.99958C15.8486 8.99958 15.9461 9.01899 16.0372 9.0567C16.1282 9.09442 16.2109 9.14969 16.2806 9.21937C16.3503 9.28906 16.4056 9.37178 16.4433 9.46283C16.481 9.55387 16.5004 9.65145 16.5004 9.75C16.5004 9.84855 16.481 9.94613 16.4433 10.0372C16.4056 10.1282 16.3503 10.2109 16.2806 10.2806Z"
                              fill="#10B981"
                            />
                          </svg>
                        ) : (
                          <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M12 2.25C10.0716 2.25 8.18657 2.82183 6.58319 3.89317C4.97982 4.96452 3.73013 6.48726 2.99218 8.26884C2.25422 10.0504 2.06114 12.0108 2.43735 13.9021C2.81355 15.7934 3.74215 17.5307 5.10571 18.8943C6.46928 20.2579 8.20656 21.1865 10.0979 21.5627C11.9892 21.9389 13.9496 21.7458 15.7312 21.0078C17.5127 20.2699 19.0355 19.0202 20.1068 17.4168C21.1782 15.8134 21.75 13.9284 21.75 12C21.7473 9.41498 20.7192 6.93661 18.8913 5.10872C17.0634 3.28084 14.585 2.25273 12 2.25ZM12 20.25C10.3683 20.25 8.77326 19.7661 7.41655 18.8596C6.05984 17.9531 5.00242 16.6646 4.378 15.1571C3.75358 13.6496 3.5902 11.9908 3.90853 10.3905C4.22685 8.79016 5.01259 7.32015 6.16637 6.16637C7.32016 5.01259 8.79017 4.22685 10.3905 3.90852C11.9909 3.59019 13.6497 3.75357 15.1571 4.37799C16.6646 5.00242 17.9531 6.05984 18.8596 7.41655C19.7662 8.77325 20.25 10.3683 20.25 12C20.2475 14.1873 19.3775 16.2843 17.8309 17.8309C16.2843 19.3775 14.1873 20.2475 12 20.25Z"
                              fill="#F1F0F1"
                            />
                          </svg>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Continue Button */}
              <button
                onClick={handleContinue}
                disabled={!getCurrentStepValidation()}
                className="w-full max-w-[428px] h-[42px] bg-[#10B981] rounded-[7.588px] border border-[#10B981] text-white font-inter text-[14.037px] font-medium transition-all duration-200 hover:bg-[#0ea571] disabled:opacity-50 disabled:cursor-not-allowed mb-[57px]"
              >
                Continue
              </button>
            </>
          )}

          {currentStep === "exhibitor-details" && (
            <>
              {/* Title and Description */}
              <div className="mb-[61px]">
                <h1 className="text-[26.5px] font-semibold text-[#00020F] font-poppins mb-[34px] leading-normal">
                  Basic Details
                </h1>
                {isGoogleAuth && (
                  <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path d="M18 9.20454C18 8.56636 17.9427 7.95272 17.8364 7.36363H10V10.845H14.8436C14.635 11.97 14.0009 12.9231 13.0477 13.5613V15.8195H15.9564C17.6582 14.2527 18 11.9454 18 9.20454Z" fill="#4285F4"/>
                      <path d="M10 19C12.43 19 14.4673 18.1941 15.9564 16.8195L13.0477 14.5613C12.2418 15.1013 11.2109 15.4204 10 15.4204C7.65591 15.4204 5.67182 13.8372 4.96409 11.71H1.95727V14.0418C3.43818 16.9831 6.48182 19 10 19Z" fill="#34A853"/>
                      <path d="M4.96409 11.71C4.78409 11.17 4.68182 10.5932 4.68182 10C4.68182 9.40682 4.78409 8.83 4.96409 8.29V5.95818H1.95727C1.34773 7.17318 1 8.54772 1 10C1 11.4523 1.34773 12.8268 1.95727 14.0418L4.96409 11.71Z" fill="#FBBC04"/>
                      <path d="M10 4.57955C11.3214 4.57955 12.5077 5.03364 13.4405 5.92545L16.0218 3.34409C14.4632 1.89182 12.4259 1 10 1C6.48182 1 3.43818 3.01682 1.95727 5.95818L4.96409 8.29C5.67182 6.16273 7.65591 4.57955 10 4.57955Z" fill="#EA4335"/>
                    </svg>
                    <div>
                      <p className="text-[14px] font-semibold text-green-800">Continuing with Google Account</p>
                      <p className="text-[12px] text-green-600">Please complete your profile information below</p>
                    </div>
                  </div>
                )}
                <p className="text-[13.8px] text-[rgba(0,2,15,0.5)] font-poppins leading-[21.1px] max-w-[417px] w-full">
                  Connect with brands, create content, and earn commissions
                  automatically based on real ad performance.
                </p>
              </div>

              {/* Form Fields */}
              <div className="space-y-[27px] mb-[32px]">
                {/* Name Field */}
                <div className="w-full max-w-[403px]">
                  <div className="flex items-start gap-[1.824px] mb-[7.294px]">
                    <span className="text-[14.588px] text-[#26203B] font-poppins">
                      Name
                    </span>
                    <span className="text-[14.588px] text-[#E45270] font-dm-sans">
                      *
                    </span>
                  </div>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className="w-full h-[43.765px] px-[14.588px] py-[7.294px] border border-[rgba(16,185,129,0.4)] rounded-[7.294px] bg-white text-[12.765px] text-[#26203B] outline-none focus:border-[#10B981] focus:shadow-[0_3.647px_7.294px_0_rgba(70,95,241,0.1)]"
                    placeholder="Enter your full name"
                  />
                </div>

                {/* Email Field */}
                <div className="w-full max-w-[403px]">
                  <div className="flex items-start gap-[1.824px] mb-[7.294px]">
                    <span className="text-[14.588px] text-[#26203B] font-poppins">
                      Email Id
                    </span>
                    <span className="text-[14.588px] text-[#E45270] font-dm-sans">
                      *
                    </span>
                  </div>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    disabled={isGoogleAuth}
                    className={`w-full h-[43.765px] px-[14.588px] py-[7.294px] border ${getFieldValidationClass(validateEmail(formData.email), formData.email.length > 0)} rounded-[7.294px] text-[12.765px] text-[#26203B] outline-none focus:border-[#10B981] focus:shadow-[0_3.647px_7.294px_0_rgba(70,95,241,0.1)] ${isGoogleAuth ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
                    placeholder="Enter your email address"
                  />
                  {isGoogleAuth && (
                    <p className="text-[#10B981] text-[11px] mt-1 flex items-center gap-1">
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M10 3L4.5 8.5L2 6" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Verified via Google Account
                    </p>
                  )}
                </div>

                {/* Password Fields - Hidden for Google Auth */}
                {!isGoogleAuth && (
                <div className="flex flex-col sm:flex-row gap-4 sm:gap-[22px]">
                  <div className="w-full sm:w-[190px]">
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
                      className={`w-full h-[43.765px] px-[14.588px] py-[12.382px] border ${getFieldValidationClass(validatePassword(formData.password), formData.password.length > 0)} rounded-[7.294px] bg-white text-[12.765px] text-[#26203B] outline-none focus:border-[#10B981] focus:shadow-[0_3.647px_7.294px_0_rgba(70,95,241,0.1)]`}
                      placeholder="Enter password"
                    />
                    {formData.password.length > 0 &&
                      !validatePassword(formData.password) && (
                        <p className="text-[#E45270] text-[11px] mt-1">
                          Password must be at least 6 characters long
                        </p>
                      )}
                  </div>
                  <div className="w-full sm:w-[190px]">
                    <div className="flex items-start gap-[1.824px] mb-[7.294px]">
                      <span className="text-[14.588px] text-[#26203B] font-poppins">
                        Confirm Password
                      </span>
                      <span className="text-[14.588px] text-[#E45270] font-dm-sans">
                        *
                      </span>
                    </div>
                    <input
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) =>
                        handleInputChange("confirmPassword", e.target.value)
                      }
                      className={`w-full h-[43.765px] px-[14.588px] py-[12.382px] border ${getFieldValidationClass(formData.password === formData.confirmPassword && formData.confirmPassword.length > 0, formData.confirmPassword.length > 0)} rounded-[7.294px] bg-white text-[12.765px] text-[#26203B] outline-none focus:border-[#10B981] focus:shadow-[0_3.647px_7.294px_0_rgba(70,95,241,0.1)]`}
                      placeholder="Confirm your password"
                    />
                    {formData.confirmPassword.length > 0 &&
                      formData.password !== formData.confirmPassword && (
                        <p className="text-[#E45270] text-[11px] mt-1">
                          Passwords do not match
                        </p>
                      )}
                  </div>
                </div>
                )}

                {/* Phone Number Field */}
                <div className="w-full max-w-[403px]">
                  <div className="flex items-start gap-[1.824px] mb-[7.294px]">
                    <span className="text-[14.588px] text-[#26203B] font-poppins">
                      Phone Number
                    </span>
                    <span className="text-[14.588px] text-[#E45270] font-dm-sans">
                      *
                    </span>
                  </div>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    className={`w-full h-[43.765px] px-[14.588px] py-[7.294px] border ${getFieldValidationClass(validatePhone(formData.phone), formData.phone.length > 0)} rounded-[7.294px] bg-white text-[12.765px] text-[#26203B] outline-none focus:border-[#10B981] focus:shadow-[0_3.647px_7.294px_0_rgba(70,95,241,0.1)]`}
                    placeholder="Enter Phone Number"
                  />
                </div>
              </div>

              {/* Continue Button */}
              <button
                onClick={handleContinue}
                disabled={isLoading || !getCurrentStepValidation()}
                className="w-full max-w-[403px] h-[42px] bg-[#10B981] rounded-[7.588px] border border-[#10B981] text-white font-inter text-[14.037px] font-medium transition-all duration-200 hover:bg-[#0ea571] disabled:opacity-50 disabled:cursor-not-allowed mb-[57px]"
              >
                {isLoading ? "Please wait..." : "Continue"}
              </button>
            </>
          )}

          {currentStep === "company-profile" && (
            <>
              {/* Title and Description */}
              <div className="mb-[35px]">
                <h1 className="text-[26.5px] font-semibold text-[#00020F] font-poppins mb-[20px] leading-normal">
                  Company Profile Setup
                </h1>
                <p className="text-[13.8px] text-[rgba(0,2,15,0.5)] font-poppins leading-[21.1px] max-w-[417px] w-full">
                  Link your social profiles and portfolio to showcase your
                  talent
                </p>
              </div>

              {/* Form Fields */}
              <div className="space-y-[27px] mb-[32px]">
                {/* Company Logo Upload */}
                <div className="w-full max-w-[403px]">
                  <div className="flex items-start gap-[1.824px] mb-[7.294px]">
                    <span className="text-[14.588px] text-[#26203B] font-poppins">
                      Company Logo
                    </span>
                    <span className="text-[14.588px] text-[#E45270] font-dm-sans">
                      *
                    </span>
                  </div>
                  <div className="relative">
                    {previews.companyLogo ? (
                      <div className="relative w-[80px] h-[80px] rounded-xl border-2 border-[#10B981] bg-white p-1 shadow-sm">
                        <img
                          src={previews.companyLogo}
                          alt="Company Logo Preview"
                          className="w-full h-full object-cover rounded-lg"
                        />
                        <button
                          onClick={() => {
                            handleFileUpload(null);
                          }}
                          className="absolute top-0 right-0 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs hover:bg-red-600 transition-colors shadow-md"
                        >
                          ×
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center w-[80px] h-[80px] border-2 border-dashed border-[rgba(16,185,129,0.4)] rounded-full bg-[#F8FDF9] cursor-pointer hover:border-[#10B981] transition-colors">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) =>
                            handleFileUpload(e.target.files?.[0] || null)
                          }
                          className="hidden"
                          id="logo-upload"
                        />
                        <label
                          htmlFor="logo-upload"
                          className="cursor-pointer w-full h-full flex items-center justify-center"
                        >
                          <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15"
                              stroke="#10B981"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M7 10L12 5L17 10"
                              stroke="#10B981"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M12 5V15"
                              stroke="#10B981"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </label>
                      </div>
                    )}
                  </div>
                </div>

                {/* Company Description */}
                <div className="w-full max-w-[403px]">
                  <div className="flex items-start gap-[1.824px] mb-[7.294px]">
                    <span className="text-[14.588px] text-[#26203B] font-poppins">
                      Company Description
                    </span>
                    <span className="text-[14.588px] text-[#E45270] font-dm-sans">
                      *
                    </span>
                  </div>
                  <textarea
                    value={formData.companyDescription}
                    onChange={(e) =>
                      handleInputChange("companyDescription", e.target.value)
                    }
                    className="w-full h-[120px] px-[14.588px] py-[7.294px] border border-[rgba(16,185,129,0.4)] rounded-[7.294px] bg-white text-[12.765px] text-[#26203B] outline-none focus:border-[#10B981] focus:shadow-[0_3.647px_7.294px_0_rgba(70,95,241,0.1)] resize-none"
                    placeholder=""
                  />
                </div>

                {/* Website URL */}
                <div className="w-full max-w-[403px]">
                  <div className="flex items-start gap-[1.824px] mb-[7.294px]">
                    <span className="text-[14.588px] text-[#26203B] font-poppins">
                      Website URL
                    </span>
                    <span className="text-[14.588px] text-[#E45270] font-dm-sans">
                      *
                    </span>
                  </div>
                  <input
                    type="url"
                    value={formData.websiteUrl}
                    onChange={(e) =>
                      handleInputChange("websiteUrl", e.target.value)
                    }
                    className={`w-full h-[43.765px] px-[14.588px] py-[7.294px] border ${getFieldValidationClass(validateURL(formData.websiteUrl), formData.websiteUrl.length > 0)} rounded-[7.294px] bg-white text-[12.765px] text-[#26203B] outline-none focus:border-[#10B981] focus:shadow-[0_3.647px_7.294px_0_rgba(70,95,241,0.1)]`}
                    placeholder="Enter your website URL"
                  />
                </div>

                {/* Select Industry */}
                <div className="w-full max-w-[403px]">
                  <div className="flex items-start gap-[1.824px] mb-[7.294px]">
                    <span className="text-[14.588px] text-[#26203B] font-poppins">
                      Select Industry
                    </span>
                    <span className="text-[14.588px] text-[#E45270] font-dm-sans">
                      *
                    </span>
                  </div>
                  <div className="relative">
                    <select
                      value={formData.industry}
                      onChange={(e) =>
                        handleInputChange("industry", e.target.value)
                      }
                      className="w-full h-[43.765px] px-[14.588px] py-[7.294px] border border-[rgba(16,185,129,0.4)] rounded-[7.294px] bg-white text-[12.765px] text-[#26203B] outline-none focus:border-[#10B981] focus:shadow-[0_3.647px_7.294px_0_rgba(70,95,241,0.1)] appearance-none cursor-pointer"
                    >
                      <option value="" disabled>
                        Select Industry
                      </option>
                      <option value="Technology">Technology</option>
                      <option value="Healthcare">Healthcare</option>
                      <option value="Finance">Finance</option>
                      <option value="Education">Education</option>
                      <option value="Retail">Retail</option>
                      <option value="Manufacturing">Manufacturing</option>
                      <option value="Real Estate">Real Estate</option>
                      <option value="Automotive">Automotive</option>
                      <option value="Food & Beverage">Food & Beverage</option>
                      <option value="Other">Other</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <svg
                        width="12"
                        height="8"
                        viewBox="0 0 12 8"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M1 1.5L6 6.5L11 1.5"
                          stroke="#9C9AA5"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Continue Button */}
              <button
                onClick={handleContinue}
                disabled={isLoading || !getCurrentStepValidation()}
                className="w-full max-w-[403px] h-[42px] bg-[#10B981] rounded-[7.588px] border border-[#10B981] text-white font-inter text-[14.037px] font-medium transition-all duration-200 hover:bg-[#0ea571] disabled:opacity-50 disabled:cursor-not-allowed mb-[57px]"
              >
                {isLoading ? "Please wait..." : "Continue"}
              </button>
            </>
          )}

          {currentStep === "business-verification" && (
            <>
              {/* Title and Description */}
              <div className="mb-[35px]">
                <h1 className="text-[26.5px] font-semibold text-[#00020F] font-poppins mb-[20px] leading-normal">
                  Upload Catalog/Brochure
                </h1>
                <p className="text-[13.8px] text-[rgba(0,2,15,0.5)] font-poppins leading-[21.1px] max-w-[417px] w-full">
                  Upload catalog and brochure for exhibitor
                </p>
              </div>

              {/* Form Fields */}
              <div className="space-y-[40px] mb-[32px]">
                {/* Upload Catalog and Brochure */}
                <div className="w-full max-w-[403px]">
                  <div className="flex items-start gap-[1.824px] mb-[15px]">
                    <span className="text-[14.588px] text-[#26203B] font-poppins">
                      Upload Catalog / Brochure
                    </span>
                    <span className="text-[14.588px] text-[#E45270] font-dm-sans">
                      *
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      type="file"
                      accept=".jpeg,.jpg,.png,.pdf"
                      onChange={(e) =>
                        handleDocumentUpload(e.target.files?.[0] || null)
                      }
                      className="hidden"
                      id="catalog-brochure-upload"
                    />

                    {!formData.catalogBrochure ? (
                      <label
                        htmlFor="catalog-brochure-upload"
                        className="flex flex-col items-center justify-center w-full h-[120px] border-2 border-dashed border-[#10B981] rounded-[8px] bg-white cursor-pointer hover:bg-[#F8FDF9] transition-colors"
                      >
                        <div className="flex flex-col items-center">
                          <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            className="mb-2"
                          >
                            <path
                              d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15"
                              stroke="#9C9AA5"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M7 10L12 5L17 10"
                              stroke="#9C9AA5"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M12 5V15"
                              stroke="#9C9AA5"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                          <span className="text-[14px] text-[#26203B] font-poppins mb-1">
                            Upload a file
                          </span>
                          <span className="text-[12px] text-[#9C9AA5] font-poppins mb-2">
                            JPEG, PNG, PDF formats, up to 50MB
                          </span>
                          <span className="text-[12px] text-[#10B981] font-poppins">
                            + Attach file
                          </span>
                        </div>
                      </label>
                    ) : (
                      <div className="flex items-center justify-between w-full p-4 border-2 border-[#10B981] rounded-[8px] bg-[#F8FDF9]">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-[#10B981] rounded-lg flex items-center justify-center">
                            {formData.catalogBrochure.type.includes("pdf") ? (
                              <svg
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z"
                                  stroke="white"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                                <path
                                  d="M14 2V8H20"
                                  stroke="white"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                                <path
                                  d="M16 13H8"
                                  stroke="white"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                                <path
                                  d="M16 17H8"
                                  stroke="white"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                                <path
                                  d="M10 9H8"
                                  stroke="white"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            ) : (
                              <svg
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M21 19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V19Z"
                                  stroke="white"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                                <path
                                  d="M8.5 10L12 13.5L15.5 10"
                                  stroke="white"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            )}
                          </div>
                          <div>
                            <p className="text-[14px] text-[#26203B] font-poppins font-medium">
                              {formData.catalogBrochure.name}
                            </p>
                            <p className="text-[12px] text-[#9C9AA5] font-poppins">
                              {(
                                formData.catalogBrochure.size /
                                (1024 * 1024)
                              ).toFixed(2)}{" "}
                              MB
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDocumentUpload(null)}
                          className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600 transition-colors"
                        >
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M18 6L6 18"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M6 6L18 18"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Continue Button */}
              <button
                onClick={handleContinue}
                disabled={isLoading || !getCurrentStepValidation()}
                className="w-full max-w-[403px] h-[42px] bg-[#10B981] rounded-[7.588px] border border-[#10B981] text-white font-inter text-[14.037px] font-medium transition-all duration-200 hover:bg-[#0ea571] disabled:opacity-50 disabled:cursor-not-allowed mb-[57px]"
              >
                {isLoading ? "Creating Account..." : "Continue"}
              </button>
            </>
          )}

          {currentStep === "visitor-profile-setup" && (
            <>
              {/* Title and Description */}
              <div className="mb-[35px]">
                <h1 className="text-[26.5px] font-semibold text-[#00020F] font-poppins mb-[20px] leading-normal">
                  Profile Setup
                </h1>
                <p className="text-[13.8px] text-[rgba(0,2,15,0.5)] font-poppins leading-[21.1px] max-w-[417px] w-full">
                  Link your social profiles and portfolio to showcase your
                  talent
                </p>
              </div>

              {/* Form Fields */}
              <div className="space-y-[27px] mb-[32px]">
                {/* Upload Profile Picture */}
                <div className="w-full max-w-[403px]">
                  <div className="flex items-start gap-[1.824px] mb-[7.294px]">
                    <span className="text-[14.588px] text-[#26203B] font-poppins">
                      Upload Profile Picture
                    </span>
                    <span className="text-[14.588px] text-[#E45270] font-dm-sans">
                      *
                    </span>
                  </div>
                  <div className="relative">
                    {previews.profilePicture ? (
                      <div className="relative w-[80px] h-[80px] rounded-full border-2 border-[#10B981] bg-white p-1 shadow-lg">
                        <img
                          src={previews.profilePicture}
                          alt="Profile Picture Preview"
                          className="w-full h-full object-cover rounded-full"
                        />
                        <button
                          onClick={() => {
                            handleProfilePictureUpload(null);
                          }}
                          className="absolute top-0 right-0 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs hover:bg-red-600 transition-colors shadow-md"
                        >
                          ×
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center w-[80px] h-[80px] border-2 border-dashed border-[rgba(16,185,129,0.4)] rounded-full bg-[#F8FDF9] cursor-pointer hover:border-[#10B981] transition-colors">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) =>
                            handleProfilePictureUpload(
                              e.target.files?.[0] || null,
                            )
                          }
                          className="hidden"
                          id="profile-picture-upload"
                        />
                        <label
                          htmlFor="profile-picture-upload"
                          className="cursor-pointer w-full h-full flex items-center justify-center"
                        >
                          <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15"
                              stroke="#10B981"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M7 10L12 5L17 10"
                              stroke="#10B981"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M12 5V15"
                              stroke="#10B981"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </label>
                      </div>
                    )}
                  </div>
                </div>

                {/* Short Bio */}
                <div className="w-full max-w-[403px]">
                  <div className="flex items-start gap-[1.824px] mb-[7.294px]">
                    <span className="text-[14.588px] text-[#26203B] font-poppins">
                      Short bio
                    </span>
                    <span className="text-[14.588px] text-[#E45270] font-dm-sans">
                      *
                    </span>
                  </div>
                  <textarea
                    value={formData.shortBio}
                    onChange={(e) =>
                      handleInputChange("shortBio", e.target.value)
                    }
                    className="w-full h-[80px] px-[14.588px] py-[7.294px] border border-[rgba(16,185,129,0.4)] rounded-[7.294px] bg-white text-[12.765px] text-[#26203B] outline-none focus:border-[#10B981] focus:shadow-[0_3.647px_7.294px_0_rgba(70,95,241,0.1)] resize-none"
                    placeholder=""
                  />
                </div>

                {/* Add LinkedIn or Website */}
                <div className="w-full max-w-[403px]">
                  <div className="flex items-start gap-[1.824px] mb-[7.294px]">
                    <span className="text-[14.588px] text-[#26203B] font-poppins">
                      Add LinkedIn or Website
                    </span>
                    <span className="text-[14.588px] text-[#E45270] font-dm-sans">
                      *
                    </span>
                  </div>
                  <input
                    type="url"
                    value={formData.linkedinWebsite}
                    onChange={(e) =>
                      handleInputChange("linkedinWebsite", e.target.value)
                    }
                    className="w-full h-[43.765px] px-[14.588px] py-[7.294px] border border-[rgba(16,185,129,0.4)] rounded-[7.294px] bg-white text-[12.765px] text-[#26203B] outline-none focus:border-[#10B981] focus:shadow-[0_3.647px_7.294px_0_rgba(70,95,241,0.1)]"
                    placeholder="Enter your website URL"
                  />
                </div>
              </div>

              {/* Continue Button */}
              <button
                onClick={handleContinue}
                disabled={isLoading || !getCurrentStepValidation()}
                className="w-full max-w-[403px] h-[42px] bg-[#10B981] rounded-[7.588px] border border-[#10B981] text-white font-inter text-[14.037px] font-medium transition-all duration-200 hover:bg-[#0ea571] disabled:opacity-50 disabled:cursor-not-allowed mb-[57px]"
              >
                {isLoading ? "Creating Account..." : "Continue"}
              </button>
            </>
          )}
        </div>

        {/* Progress Indicators */}
        <div className="flex items-center gap-[9px] px-4 sm:px-[64px] pb-[46px] justify-center">
          <div
            className={`w-[73px] h-[5px] rounded-[6.251px] ${currentStep === "selection" ? "bg-[#10B981]" : "bg-[#E6E9EC]"}`}
          ></div>
          <div
            className={`w-[73px] h-[5px] rounded-[6.251px] ${currentStep === "exhibitor-details" ? "bg-[#10B981]" : "bg-[#E6E9EC]"}`}
          ></div>
          {selectedUserType === "exhibitor" && (
            <>
              <div
                className={`w-[73px] h-[5px] rounded-[6.251px] ${currentStep === "company-profile" ? "bg-[#10B981]" : "bg-[#E6E9EC]"}`}
              ></div>
              <div
                className={`w-[73px] h-[5px] rounded-[6.251px] ${currentStep === "business-verification" ? "bg-[#10B981]" : "bg-[#E6E9EC]"}`}
              ></div>
            </>
          )}
          {selectedUserType === "visitor" && (
            <div
              className={`w-[73px] h-[5px] rounded-[6.251px] ${currentStep === "visitor-profile-setup" ? "bg-[#10B981]" : "bg-[#E6E9EC]"}`}
            ></div>
          )}
        </div>
      </div>

      {/* Right Side - Image Section */}
      <div className="hidden lg:flex lg:flex-1 relative overflow-hidden">
        <img
          src={OnboardingImage}
          alt="Vendor Dashboard"
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  );
}
