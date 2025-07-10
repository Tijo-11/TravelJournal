import { useState } from "react";
import axiosInstance from "../../utils/axiosInstance";

export const handleComment = async (
  journalId,
  e,
  commentInputs,
  setCommentInputs,
  fetchJournals,
  setError
) => {
  e.preventDefault();
  try {
    await axiosInstance.post("/api/Journal/comments/", {
      journal: journalId,
      content: commentInputs[journalId] || "",
    });
    setCommentInputs((prev) => ({ ...prev, [journalId]: "" }));
    fetchJournals();
  } catch (err) {
    setError("Failed to post comment");
    console.error("Comment error:", err.response?.data || err.message);
  }
};

export const handleDeleteComment = async (
  commentId,
  fetchJournals,
  setError
) => {
  try {
    await axiosInstance.delete(`/api/Journal/comments/${commentId}/`);
    fetchJournals();
  } catch (err) {
    setError("Failed to delete comment");
    console.error("Delete comment error:", err.response?.data || err.message);
  }
};

function JournalComments({
  journal,
  fetchJournals,
  currentUserId,
  setError,
  navigate,
}) {
  const [commentInputs, setCommentInputs] = useState({});

  return (
    <div className="mt-4">
      {journal.comments && journal.comments.length > 0 ? (
        <div className="space-y-2">
          {journal.comments.map((comment) => (
            <div key={comment.id} className="border-t pt-2">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-600">
                    <span
                      className={`text-blue-600 ${
                        comment.user?.id !== currentUserId
                          ? "hover:underline cursor-pointer"
                          : ""
                      }`}
                      onClick={() =>
                        comment.user?.id !== currentUserId &&
                        navigate(`/profile/${comment.user.id}`)
                      }
                    >
                      {comment.user?.full_name || "Unknown"}
                    </span>{" "}
                    commented:
                  </p>
                  <p>{comment.content}</p>
                </div>
                {comment.user?.id === currentUserId && (
                  <button
                    onClick={() =>
                      handleDeleteComment(comment.id, fetchJournals, setError)
                    }
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Delete
                  </button>
                )}
              </div>
              {comment.replies &&
                comment.replies.map((reply) => (
                  <div key={reply.id} className="ml-4 border-l pl-2">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm text-gray-600">
                          <span
                            className={`text-blue-600 ${
                              reply.user?.id !== currentUserId
                                ? "hover:underline cursor-pointer"
                                : ""
                            }`}
                            onClick={() =>
                              reply.user?.id !== currentUserId &&
                              navigate(`/profile/${reply.user.id}`)
                            }
                          >
                            {reply.user?.full_name || "Unknown"}
                          </span>{" "}
                          replied:
                        </p>
                        <p>{reply.content}</p>
                      </div>
                      {reply.user?.id === currentUserId && (
                        <button
                          onClick={() =>
                            handleDeleteComment(
                              reply.id,
                              fetchJournals,
                              setError
                            )
                          }
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 italic text-center">No comments yet</p>
      )}
      <form
        onSubmit={(e) =>
          handleComment(
            journal.id,
            e,
            commentInputs,
            setCommentInputs,
            fetchJournals,
            setError
          )
        }
        className="mt-4"
      >
        <input
          value={commentInputs[journal.id] || ""}
          onChange={(e) =>
            setCommentInputs((prev) => ({
              ...prev,
              [journal.id]: e.target.value,
            }))
          }
          className="w-full border rounded p-2"
          placeholder="Add a comment..."
          required
        />
        <button
          type="submit"
          className="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Post Comment
        </button>
      </form>
    </div>
  );
}

export default JournalComments;
