import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axiosInstance from "../utils/axiosInstance";

function EditJournal() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [journal, setJournal] = useState(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [mediaFiles, setMediaFiles] = useState([]);
  const [existingMedia, setExistingMedia] = useState([]);
  const [deletedMediaIds, setDeletedMediaIds] = useState([]);

  useEffect(() => {
    axiosInstance
      .get(`/api/Journal/journals/my/${id}/`)
      .then((res) => {
        setJournal(res.data);
        setTitle(res.data.title);
        setContent(res.data.content);
        setExistingMedia(res.data.media);
      })
      .catch(() => alert("Failed to fetch journal"));
  }, [id]);

  const handleMediaChange = (e) => {
    setMediaFiles([...e.target.files]);
  };

  const markMediaForDeletion = (mediaId) => {
    setDeletedMediaIds((prev) => [...prev, mediaId]);
    setExistingMedia((prev) => prev.filter((media) => media.id !== mediaId));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("content", content);

      mediaFiles.forEach((file) => formData.append("media_files", file));
      deletedMediaIds.forEach((id) => formData.append("delete_media_ids", id));

      await axiosInstance.put(`/api/Journal/journals/my/${id}/`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      navigate("/profile");
    } catch (err) {
      alert("Update failed");
    }
  };

  if (!journal) return <p>Loading...</p>;

  return (
    <div className="max-w-3xl mx-auto mt-10">
      <h2 className="text-2xl font-bold mb-6">Edit Journal</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border rounded p-2"
          placeholder="Title"
          required
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full border rounded p-2"
          rows="6"
          placeholder="Content"
          required
        />

        <div>
          <p className="font-semibold mb-2">Existing Media</p>
          <div className="grid grid-cols-3 gap-4">
            {existingMedia.map((media) => (
              <div key={media.id} className="relative">
                {media.file.endsWith(".mp4") ? (
                  <video src={media.file} controls className="w-full rounded" />
                ) : (
                  <img
                    src={media.file}
                    alt="media"
                    className="w-full h-32 object-cover rounded"
                  />
                )}
                <button
                  type="button"
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 text-xs"
                  onClick={() => markMediaForDeletion(media.id)}
                >
                  ❌
                </button>
              </div>
            ))}
            <label className="flex items-center justify-center border rounded p-2 cursor-pointer h-32">
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

        <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Update Journal
        </button>
      </form>
    </div>
  );
}

export default EditJournal;
