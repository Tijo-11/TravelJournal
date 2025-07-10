import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";
import Footer from "../components/Footer";
import UserSuggestions from "../components/UserSuggestions";

const BACKEND_BASE_URL = "http://localhost:8000";

function Explore() {
  const { user: currentUser } = useSelector((state) => state.auth);
  const [journals, setJournals] = useState([]);
  const [error, setError] = useState(null);
  const [mediaIndices, setMediaIndices] = useState({});
  const [commentInputs, setCommentInputs] = useState({});
  const navigate = useNavigate();

  const fetchJournals = async () => {
    try {
      const response = await axiosInstance.get(
        "/api/Journal/journals/explore/"
      );
      setJournals(response.data);
    } catch (err) {
      console.error("Failed to fetch journals:", err.response?.data || err);
      setError("Failed to load journals");
    }
  };

  useEffect(() => {
    console.log("Explore.jsx: Current User:", currentUser); // Debug log
    fetchJournals();
  }, []);

  const handleLike = async (journalId) => {
    try {
      const liked = journals.find((j) => j.id === journalId).is_liked;
      if (liked) {
        const like = await axiosInstance.get(
          `/api/Journal/likes/?journal=${journalId}`
        );
        await axiosInstance.delete(`/api/Journal/likes/${like.data[0].id}/`);
      } else {
        await axiosInstance.post("/api/Journal/likes/", { journal: journalId });
      }
      fetchJournals();
    } catch (err) {
      setError("Failed to toggle like");
    }
  };

  const handleComment = async (journalId) => {
    try {
      await axiosInstance.post("/api/Journal/comments/", {
        journal: journalId,
        content: commentInputs[journalId] || "",
      });
      setCommentInputs({ ...commentInputs, [journalId]: "" });
      fetchJournals();
    } catch (err) {
      setError("Failed to post comment");
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await axiosInstance.delete(`/api/Journal/comments/${commentId}/`);
      fetchJournals();
    } catch (err) {
      setError("Failed to delete comment");
      console.error("Delete comment error:", err.response?.data || err.message);
    }
  };

  const handleShare = async (journalId) => {
    try {
      const shared = journals.find((j) => j.id === journalId).is_shared;
      if (shared) {
        const share = await axiosInstance.get(
          `/api/Journal/shared-journals/?journal=${journalId}`
        );
        await axiosInstance.delete(
          `/api/Journal/shared-journals/${share.data[0].id}/`
        );
      } else {
        await axiosInstance.post("/api/Journal/shared-journals/", {
          journal: journalId,
        });
      }
      fetchJournals();
    } catch (err) {
      setError("Failed to toggle share");
    }
  };

  const handleNextImage = (journalId, mediaLength) => {
    setMediaIndices((prev) => ({
      ...prev,
      [journalId]: ((prev[journalId] || 0) + 1) % mediaLength,
    }));
  };

  const handlePrevImage = (journalId, mediaLength) => {
    setMediaIndices((prev) => ({
      ...prev,
      [journalId]: ((prev[journalId] || 0) - 1 + mediaLength) % mediaLength,
    }));
  };

  const getMediaUrl = (filePath) => {
    if (!filePath) return null;
    return filePath.startsWith("http")
      ? filePath
      : `${BACKEND_BASE_URL}${
          filePath.startsWith("/") ? "" : "/media/"
        }${filePath}`;
  };

  return (
    <>
      <div className="container mx-auto flex p-4">
        <div className="w-3/4 pr-4">
          <h1 className="text-3xl font-bold mb-4">Explore WanderTales</h1>
          {error && <p className="text-red-500 mb-4">{error}</p>}
          {journals.length === 0 && !error && (
            <p className="text-gray-500">No journals available</p>
          )}
          {journals.map((journal) => (
            <div
              key={journal.id}
              className="bg-white p-6 rounded shadow-md mb-4"
            >
              {journal.shared_by && (
                <p className="text-sm text-gray-600 mb-1">
                  Shared by:{" "}
                  <a
                    href={`/profile/${journal.shared_by.id}`}
                    className="text-blue-600"
                  >
                    {journal.shared_by.full_name}
                  </a>
                </p>
              )}
              <p className="text-sm text-gray-600 mb-1">
                Posted by:{" "}
                <a
                  href={`/profile/${journal.user.id}`}
                  className="text-blue-600"
                >
                  {journal.user.full_name}
                </a>
              </p>
              <h3 className="text-xl font-bold">{journal.title}</h3>
              <p className="mt-2">{journal.content}</p>
              <div className="mt-4 relative">
                {journal.media && journal.media.length > 0 ? (
                  <div className="relative">
                    <img
                      src={getMediaUrl(
                        journal.media[mediaIndices[journal.id] || 0].file
                      )}
                      alt="Journal media"
                      className="mx-auto object-contain rounded"
                      style={{
                        maxHeight: "60vh",
                        width: "100%",
                        height: "auto",
                      }}
                      onError={(e) => {
                        e.target.src =
                          "https://dummyimage.com/300x450/cccccc/000000&text=Image+Not+Found";
                      }}
                    />
                    {journal.media.length > 1 && (
                      <>
                        <button
                          onClick={() =>
                            handlePrevImage(journal.id, journal.media.length)
                          }
                          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-blue-600 text-white text-4xl rounded-full w-14 h-14 flex items-center justify-center shadow-md hover:bg-blue-700"
                        >
                          ‹
                        </button>
                        <button
                          onClick={() =>
                            handleNextImage(journal.id, journal.media.length)
                          }
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-blue-600 text-white text-4xl rounded-full w-14 h-14 flex items-center justify-center shadow-md hover:bg-blue-700"
                        >
                          ›
                        </button>
                      </>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500">No media available</p>
                )}
              </div>
              <div className="mt-6 flex justify-between items-center">
                <button
                  onClick={() => handleLike(journal.id)}
                  className={`text-blue-600 hover:text-blue-800 ${
                    journal.is_liked ? "font-bold" : ""
                  }`}
                >
                  {journal.is_liked ? "Unlike" : "Like"}({journal.like_count})
                </button>
                <button className="text-blue-600 hover:text-blue-800">
                  Comment({journal.comment_count})
                </button>
                <button
                  onClick={() => handleShare(journal.id)}
                  className={`text-blue-600 hover:text-blue-800 ${
                    journal.is_shared ? "font-bold" : ""
                  }`}
                >
                  {journal.is_shared ? "Unshare" : "Share"}(
                  {journal.shares.length})
                </button>
              </div>
              <div className="mt-4">
                {journal.comments.map((comment) => {
                  console.log(
                    `Explore.jsx: Comment ID ${comment.id}, User ID ${comment.user?.id}, Current User ID ${currentUser?.id}`
                  ); // Debug log
                  return (
                    <div key={comment.id} className="border-t pt-2 mt-2">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm">
                            <strong>{comment.user.full_name}</strong>:{" "}
                            {comment.content}
                          </p>
                        </div>
                        {comment.user?.id == currentUser?.id && (
                          <button
                            onClick={() => handleDeleteComment(comment.id)}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                      {comment.replies.map((reply) => {
                        console.log(
                          `Explore.jsx: Reply ID ${reply.id}, User ID ${reply.user?.id}, Current User ID ${currentUser?.id}`
                        ); // Debug log
                        return (
                          <div
                            key={reply.id}
                            className="ml-4 border-l pt-1 mt-1"
                          >
                            <div className="flex justify-between items-center">
                              <div>
                                <p className="text-sm">
                                  <strong>{reply.user.full_name}</strong>:{" "}
                                  {reply.content}
                                </p>
                              </div>
                              {reply.user?.id == currentUser?.id && (
                                <button
                                  onClick={() => handleDeleteComment(reply.id)}
                                  className="text-red-600 hover:text-red-800 text-sm"
                                >
                                  Delete
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
                <input
                  value={commentInputs[journal.id] || ""}
                  onChange={(e) =>
                    setCommentInputs({
                      ...commentInputs,
                      [journal.id]: e.target.value,
                    })
                  }
                  placeholder="Add a comment..."
                  className="w-full border rounded p-2 mt-2"
                />
                <button
                  onClick={() => handleComment(journal.id)}
                  className="bg-blue-600 text-white px-4 py-1 rounded mt-2"
                >
                  Post Comment
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="w-1/4">
          <UserSuggestions />
        </div>
      </div>
      <Footer />
    </>
  );
}

export default Explore;
