import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { db, storage } from "../lib/firebase";
import {
  collection,
  addDoc,
  serverTimestamp,
  updateDoc,
  arrayUnion,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, getDoc } from "firebase/firestore";
import { useToast } from "../hooks/use-toast";

interface PostCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "photo" | "video" | "both"; // photo = only photo, video = only video, both = show both until one is selected
  exhibitionId?: string; // Optional exhibition ID for exhibition-specific posts
  postedByType?: string; // Optional override for postedByType
}

export default function PostCreationModal({
  isOpen,
  onClose,
  mode,
  exhibitionId,
  postedByType,
}: PostCreationModalProps) {
  const [postText, setPostText] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch user data when modal opens
  useEffect(() => {
    const fetchUserData = async () => {
      if (user && isOpen) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            setUserData(userDoc.data());
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }
    };

    fetchUserData();
  }, [user, isOpen]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handlePost = async () => {
    if (!user) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in to create a post.",
        variant: "destructive",
      });
      return;
    }

    if (!postText.trim() && !selectedFile) {
      toast({
        title: "Invalid Post",
        description: "Please add some text or upload a file.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Get user data from Firestore
      const userDoc = await getDoc(doc(db, "users", user.uid));
      const userData = userDoc.data();

      let postAssetUrl = null;
      let postType = "text";

      // Upload file to Firebase Storage if present
      if (selectedFile) {
        const timestamp = Date.now();
        const fileName = `${timestamp}_${selectedFile.name}`;
        const fileRef = ref(storage, `posts/${user.uid}/${fileName}`);

        const snapshot = await uploadBytes(fileRef, selectedFile);
        postAssetUrl = await getDownloadURL(snapshot.ref);

        // Determine post type based on file
        postType = selectedFile.type.startsWith("image/") ? "image" : "video";
      }

      // Create post data
      const postData = {
        postedById: user.uid,
        postedBy: userData?.name || user.displayName || "Unknown User",
        postedByType: postedByType || userData?.profileType || "visitor",
        postedByProfileImage:
          userData?.profilePictureUrl ||
          userData?.companyLogoUrl ||
          user.photoURL ||
          "",
        postedTime: serverTimestamp(),
        postContent: postText,
        postType,
        postAssetUrl,
        postLikes: 0,
        postComments: {},
        ...(exhibitionId && { exhibitionId }), // Include exhibitionId if provided
      };

      // Save post to Firestore and get document reference
      const docRef = await addDoc(collection(db, "posts"), postData);

      // Update the document with its own ID as postId
      await updateDoc(docRef, {
        postId: docRef.id,
      });

      // Add the post ID to the user's posts array
      const userDocRef = doc(db, "users", user.uid);
      await updateDoc(userDocRef, {
        posts: arrayUnion(docRef.id),
      });

      toast({
        title: "Post Created",
        description: "Your post has been shared successfully!",
      });

      // Reset form
      setPostText("");
      setSelectedFile(null);
      setPreviewUrl(null);
      onClose();
    } catch (error) {
      console.error("Error creating post:", error);
      toast({
        title: "Error",
        description: "Failed to create post. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isPostDisabled = (!postText.trim() && !selectedFile) || isSubmitting;

  const getAcceptedFileTypes = () => {
    if (mode === "photo") return "image/*";
    if (mode === "video") return "video/*";
    if (mode === "both") return "image/*,video/*";
    return "image/*";
  };

  const getFileUploadText = () => {
    if (mode === "photo") return "Add photos to your post";
    if (mode === "video") return "Add videos to your post";
    if (mode === "both") return "Add photos or videos to your post";
    return "Add photos to your post";
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-[16px] w-full max-w-[568px] max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-[20px] font-semibold text-[#000] font-poppins">
            Create post
          </h2>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M18 6L6 18"
                stroke="#666"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M6 6L18 18"
                stroke="#666"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        {/* User Info */}
        <div className="p-6 pb-4">
          <div className="flex items-center gap-3">
            <img
              src={
                userData?.profilePictureUrl ||
                userData?.companyLogoUrl ||
                user?.photoURL ||
                "https://api.builder.io/api/v1/image/assets/TEMP/d064c0d047315af10f082e5ddd186ed5e3ba3001?width=80"
              }
              alt="Profile"
              className="w-10 h-10 rounded-full object-cover"
            />
            <div>
              <div className="text-[14px] font-medium text-[#000] font-poppins">
                {userData?.name || user?.displayName || "User"}
              </div>
              <div className="text-[12px] text-[#666] font-poppins">
                {userData?.profileType === "exhibitor"
                  ? "Exhibitor"
                  : "Visitor"}
              </div>
            </div>
          </div>
        </div>

        {/* Text Editor */}
        <div className="px-6 pb-4">
          <textarea
            value={postText}
            onChange={(e) => setPostText(e.target.value)}
            placeholder="What's on your mind?"
            className="w-full min-h-[120px] text-[16px] text-[#000] placeholder-[#999] font-poppins bg-transparent border-none outline-none resize-none"
            autoFocus
          />
        </div>

        {/* File Preview */}
        {previewUrl && (
          <div className="px-6 pb-4">
            <div className="relative rounded-[12px] overflow-hidden border border-gray-200">
              {selectedFile?.type.startsWith("image/") ? (
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full h-auto max-h-[300px] object-cover"
                />
              ) : (
                <video
                  src={previewUrl}
                  controls
                  className="w-full h-auto max-h-[300px]"
                />
              )}
              <button
                onClick={removeFile}
                className="absolute top-2 right-2 w-8 h-8 bg-black bg-opacity-60 rounded-full flex items-center justify-center hover:bg-opacity-80 transition-all"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M18 6L6 18"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M6 6L18 18"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Add to Post Section */}
        <div className="px-6 pb-4">
          <div className="border border-gray-200 rounded-[12px] p-4">
            <div className="text-[14px] font-medium text-[#000] font-poppins mb-3">
              Add to your post
            </div>
            <div className="flex items-center gap-4">
              {/* Photo Upload - Show if mode is photo, or if mode is both and no video is selected */}
              {(mode === "photo" ||
                (mode === "both" &&
                  (!selectedFile ||
                    selectedFile.type.startsWith("image/")))) && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 px-3 py-2 rounded-[8px] hover:bg-gray-100 transition-colors"
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M14.9156 2C18.0243 2 20.0961 4.42887 20.0961 7.91408V16.0849C20.0961 19.5703 18.0242 22 14.9156 22H6.9983C3.89111 22 1.8269 19.5722 1.8269 16.0849V7.91408C1.8269 4.43059 3.89714 2 6.9983 2H14.9156ZM14.9156 3.50383H6.9983C4.67751 3.50383 3.19984 5.2387 3.19984 7.91408V16.0849C3.19984 18.7647 4.67206 20.4962 6.9983 20.4962H14.9156C17.2442 20.4962 18.7232 18.7618 18.7232 16.0849V7.91408C18.7232 5.23744 17.2444 3.50383 14.9156 3.50383ZM15.5662 12.1835L15.6852 12.3086L17.5854 14.4561C17.8492 14.7543 17.8424 15.2303 17.5702 15.5193C17.3227 15.7821 16.941 15.7998 16.6754 15.5768L16.5995 15.5027L14.6994 13.3553C14.3684 12.9814 13.8303 12.9779 13.4943 13.3269L13.4206 13.4137L11.3807 16.1312C10.6592 17.0939 9.36094 17.1971 8.52097 16.3903L8.40937 16.2747L7.59529 15.3648C7.38145 15.1217 7.04043 15.0987 6.80295 15.2949L6.72794 15.3684L5.32846 16.9855C5.06764 17.2869 4.63314 17.2996 4.35799 17.0139C4.10785 16.7542 4.07551 16.3373 4.26766 16.0372L4.33205 15.9509L5.73123 14.3341C6.46783 13.4819 7.68084 13.4365 8.4655 14.1967L8.57988 14.3167L9.38985 15.222C9.62662 15.4865 10.0061 15.4933 10.2508 15.2553L10.3199 15.1766L12.3599 12.4589C13.1704 11.3782 14.6299 11.2689 15.5662 12.1835ZM7.83076 6.64124C9.09589 6.64124 10.1227 7.76589 10.1227 9.15164C10.1227 10.5374 9.09589 11.662 7.83076 11.662C6.56569 11.662 5.53979 10.5374 5.53979 9.15164C5.53979 7.76583 6.56569 6.64124 7.83076 6.64124ZM7.83076 8.14507C7.32418 8.14507 6.91272 8.59611 6.91272 9.15164C6.91272 9.70716 7.32418 10.1582 7.83076 10.1582C8.33764 10.1582 8.74972 9.70684 8.74972 9.15164C8.74972 8.59643 8.33764 8.14507 7.83076 8.14507Z"
                      fill="#10B981"
                    />
                  </svg>
                  <span className="text-[14px] text-[#000] font-poppins">
                    Photo
                  </span>
                </button>
              )}

              {/* Video Upload - Show if mode is video, or if mode is both and no image is selected */}
              {(mode === "video" ||
                (mode === "both" &&
                  (!selectedFile ||
                    selectedFile.type.startsWith("video/")))) && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 px-3 py-2 rounded-[8px] hover:bg-gray-100 transition-colors"
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M11.4851 4.4998C13.6977 4.4998 15.2381 6.03378 15.4021 8.28414L17.8203 7.20189C18.8665 6.73453 20.0081 7.52861 20.0912 8.73529L20.096 8.8763V15.5153C20.096 16.7525 18.9932 17.6087 17.941 17.2369L17.8199 17.1886L15.4021 16.1062C15.2377 18.3551 13.6942 19.8908 11.4851 19.8908H5.75863C3.4155 19.8908 1.82709 18.1717 1.82709 15.7028V8.6878C1.82709 6.21889 3.4155 4.4998 5.75863 4.4998H11.4851ZM11.4851 5.9998H5.75863C4.16875 5.9998 3.19728 7.05119 3.19728 8.6878V15.7028C3.19728 17.3394 4.16875 18.3908 5.75863 18.3908H11.4851C13.0711 18.3908 14.0465 17.3367 14.0465 15.7028L14.0463 15.0172C14.046 15.0066 14.0459 14.9959 14.0461 14.9852L14.0465 8.6878C14.0465 7.05158 13.0744 5.9998 11.4851 5.9998ZM18.4003 8.57139L18.3383 8.59055L15.4167 9.8968V14.4928L18.338 15.7999C18.5028 15.8735 18.6811 15.7642 18.7187 15.5854L18.7259 15.5153V8.8763C18.7259 8.68151 18.5657 8.54201 18.4003 8.57139Z"
                      fill="#10B981"
                    />
                  </svg>
                  <span className="text-[14px] text-[#000] font-poppins">
                    Video
                  </span>
                </button>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept={getAcceptedFileTypes()}
              onChange={handleFileSelect}
              className="hidden"
            />

            <div className="text-[12px] text-[#666] font-poppins mt-2">
              {getFileUploadText()}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6">
          <button
            onClick={handlePost}
            disabled={isPostDisabled}
            className={`w-full h-[48px] rounded-[8px] font-poppins text-[16px] font-medium transition-all flex items-center justify-center ${
              isPostDisabled
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-[#10B981] text-white hover:bg-[#0ea571]"
            }`}
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Posting...</span>
              </div>
            ) : (
              "Post"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
