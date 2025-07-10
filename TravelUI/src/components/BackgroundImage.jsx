import { useState } from "react";
import axiosInstance from "../utils/axiosInstance";

const BACKEND_BASE_URL = "http://localhost:8000";

function BackgroundImage({ bannerImage, setBannerImage, setError }) {
  const [showBannerInput, setShowBannerInput] = useState(false);
  const [selectedBannerFile, setSelectedBannerFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleImageUpload = async (file) => {
    if (!file) return;
    setIsUploading(true);
    setError(null);
    const formData = new FormData();
    formData.append("banner_image", file);
    try {
      const res = await axiosInstance.put("/api/Users/profile/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setBannerImage(res.data.banner_image || null);
      setSelectedBannerFile(null);
      setShowBannerInput(false);
    } catch (err) {
      const errorMsg =
        err.response?.data?.banner_image?.[0] ||
        err.response?.data?.non_field_errors?.[0] ||
        "Server error";
      setError(`Failed to upload banner image: ${errorMsg}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancel = () => {
    setShowBannerInput(false);
    setSelectedBannerFile(null);
  };

  return (
    <div className="relative w-full h-[75vh] overflow-hidden">
      <img
        src={
          bannerImage
            ? `${BACKEND_BASE_URL}${bannerImage}`
            : "https://dummyimage.com/1200x600"
        }
        alt="Banner"
        className="w-full h-full object-contain object-center"
        onError={(e) => console.error("Banner Image Error:", e)}
      />

      {setBannerImage && (
        <div className="absolute bottom-4 right-4">
          {!showBannerInput ? (
            <button
              onClick={() => setShowBannerInput(true)}
              className="text-sm px-3 py-1 rounded bg-gray-300 text-black transition-transform transform hover:scale-110 hover:bg-green-500"
              disabled={isUploading}
            >
              Change Background Image
            </button>
          ) : (
            <div className="flex flex-col items-end gap-2 bg-white bg-opacity-80 p-2 rounded">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setSelectedBannerFile(e.target.files[0])}
                className="text-sm rounded cursor-pointer"
                disabled={isUploading}
              />
              <div className="flex gap-2">
                <button
                  onClick={() => handleImageUpload(selectedBannerFile)}
                  disabled={!selectedBannerFile || isUploading}
                  className={`px-3 py-1 text-sm rounded text-white ${
                    selectedBannerFile && !isUploading
                      ? "bg-blue-600 hover:bg-blue-700"
                      : "bg-gray-400 cursor-not-allowed"
                  }`}
                >
                  {isUploading ? "Uploading..." : "Submit"}
                </button>
                <button
                  onClick={handleCancel}
                  className="px-3 py-1 text-sm rounded bg-red-500 text-white hover:bg-red-600"
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

export default BackgroundImage;
