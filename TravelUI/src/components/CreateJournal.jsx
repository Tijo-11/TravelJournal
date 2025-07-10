import { useState } from "react";
import axiosInstance from "../utils/axiosInstance";
import { useNavigate } from "react-router-dom";

function CreateJournal({ setShowCreateJournal, fetchProfile, setError }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [mediaFiles, setMediaFiles] = useState([]);
  const navigate = useNavigate();

  const handleMediaChange = (e) => {
    setMediaFiles([...e.target.files]);
  };

  const removeMedia = (index) => {
    setMediaFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCreateJournal = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("content", content);
      mediaFiles.forEach((file) => formData.append("media_files", file));

      await axiosInstance.post("/api/Journal/journals/my/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // ✅ Show alert before navigation
      alert("Journal created successfully!");

      // Clear form state
      setTitle("");
      setContent("");
      setMediaFiles([]);

      // Redirect to profile
      navigate("/profile");

      // Cleanup UI state after slight delay (to let navigation render)
      setTimeout(() => {
        setShowCreateJournal(false);
        fetchProfile();
      }, 100);
    } catch (err) {
      setError("Failed to create journal");
      console.error("Create journal error:", err.response?.data || err.message);
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white shadow-lg p-6 rounded-lg mb-8">
      <h2 className="text-2xl font-semibold mb-6">Create New Journal</h2>
      <form onSubmit={handleCreateJournal} className="space-y-6">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border rounded p-2 border-gray-300 focus:ring focus:ring-blue-200"
          placeholder="Enter Title"
          required
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full border rounded p-2 border-gray-300 focus:ring focus:ring-blue-200"
          rows="6"
          placeholder="Write your journal content here..."
          required
        />
        <div>
          <p className="font-semibold mb-2">Add Media Files</p>
          <div className="grid grid-cols-3 gap-4">
            {mediaFiles.map((file, index) => (
              <div key={index} className="relative">
                <img
                  src={URL.createObjectURL(file)}
                  alt="Media preview"
                  className="w-full h-32 object-cover rounded border"
                />
                <button
                  type="button"
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 text-xs"
                  onClick={() => removeMedia(index)}
                >
                  ❌
                </button>
              </div>
            ))}
            <label className="flex items-center justify-center border rounded p-2 cursor-pointer h-32 hover:bg-gray-100">
              <span className="text-3xl text-gray-400">➕</span>
              <input
                type="file"
                multiple
                accept="image/*,video/*"
                className="hidden"
                onChange={handleMediaChange}
              />
            </label>
          </div>
        </div>
        <button
          type="submit"
          className="bg-blue-600 text-white font-semibold px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          Create Journal
        </button>
      </form>
    </div>
  );
}

export default CreateJournal;
