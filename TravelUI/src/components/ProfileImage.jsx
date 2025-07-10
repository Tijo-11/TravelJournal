import { useState } from "react";
import axiosInstance from "../utils/axiosInstance";

const BACKEND_BASE_URL = "http://localhost:8000";

function ProfileImage({ profileImage, setProfileImage, setError }) {
  const [showProfileInput, setShowProfileInput] = useState(false);
  const [selectedProfileFile, setSelectedProfileFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleImageUpload = async (file) => {
    if (!file) return;
    setIsUploading(true);
    setError(null);
    const formData = new FormData();
    formData.append("profile_image", file);
    try {
      const res = await axiosInstance.put("/api/Users/profile/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setProfileImage(res.data.profile_image || null);
      setSelectedProfileFile(null);
      setShowProfileInput(false);
    } catch (err) {
      const errorMsg =
        err.response?.data?.profile_image?.[0] ||
        err.response?.data?.non_field_errors?.[0] ||
        "Server error";
      setError(`Failed to upload profile image: ${errorMsg}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancel = () => {
    setShowProfileInput(false);
    setSelectedProfileFile(null);
  };

  return (
    <div className="flex flex-col items-start mt-4">
      <img
        src={
          profileImage
            ? `${BACKEND_BASE_URL}${profileImage}`
            : "https://dummyimage.com/150x150"
        }
        alt="Profile Image"
        className="w-56 h-56 rounded-full border-4 border-white"
        onError={(e) => console.error("Profile Image Error:", e)}
      />

      {setProfileImage && (
        <div className="flex flex-col items-start mt-2">
          {!showProfileInput ? (
            <button
              onClick={() => setShowProfileInput(true)}
              className="text-sm px-3 py-1 rounded bg-gray-500 text-white transition-transform transform hover:scale-110 hover:bg-green-500"
              disabled={isUploading}
            >
              Change Profile Image
            </button>
          ) : (
            <div className="flex flex-col items-start bg-white bg-opacity-80 p-2 rounded">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setSelectedProfileFile(e.target.files[0])}
                className="text-sm rounded cursor-pointer mb-2"
                disabled={isUploading}
              />
              <div className="flex gap-2">
                <button
                  onClick={() => handleImageUpload(selectedProfileFile)}
                  disabled={!selectedProfileFile || isUploading}
                  className={`px-4 py-2 rounded text-white text-sm ${
                    selectedProfileFile && !isUploading
                      ? "bg-blue-600 hover:bg-blue-700"
                      : "bg-gray-400 cursor-not-allowed"
                  }`}
                >
                  {isUploading ? "Uploading..." : "Submit"}
                </button>
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 rounded text-white text-sm bg-red-500 hover:bg-red-600"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ProfileImage;
