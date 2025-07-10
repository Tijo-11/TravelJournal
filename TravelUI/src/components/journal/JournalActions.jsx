import axiosInstance from "../../utils/axiosInstance";

export const handleDeleteJournal = async (id, fetchJournals, setError) => {
  try {
    await axiosInstance.delete(`/api/Journal/journals/my/${id}/`);
    fetchJournals();
  } catch (err) {
    setError("Failed to delete journal");
    console.error("Delete journal error:", err.response?.data || err.message);
  }
};

export const handleDeleteShare = async (
  journalId,
  currentUserId,
  fetchJournals,
  setError
) => {
  try {
    const share = (
      await axiosInstance.get("/api/Journal/shared-journals/", {
        params: { journal: journalId, user: currentUserId },
      })
    ).data[0];
    if (share) {
      await axiosInstance.delete(`/api/Journal/shared-journals/${share.id}/`);
      fetchJournals();
    }
  } catch (err) {
    setError("Failed to delete shared journal");
    console.error("Delete share error:", err.response?.data || err.message);
  }
};

export const handleEdit = (journal, navigate) => {
  navigate(`/journals/${journal.id}/edit`);
};

export const handleLike = async (
  journalId,
  journals,
  setJournals,
  currentUserId,
  setError
) => {
  try {
    const journalIndex = journals.findIndex((j) => j.id === journalId);
    const journal = journals[journalIndex];
    const isLiked = journal.is_liked;
    if (isLiked) {
      const response = await axiosInstance.get(
        `/api/Journal/likes/?journal=${journalId}`
      );
      const like = response.data.find((l) => l.user.id === currentUserId);
      if (like) {
        await axiosInstance.delete(`/api/Journal/likes/${like.id}/`);
        const updatedJournals = [...journals];
        updatedJournals[journalIndex] = {
          ...journal,
          is_liked: false,
          like_count: journal.like_count - 1,
        };
        setJournals(updatedJournals);
      } else {
        throw new Error("Like not found for user");
      }
    } else {
      const response = await axiosInstance.get(
        `/api/Journal/likes/?journal=${journalId}`
      );
      const existingLike = response.data.find(
        (l) => l.user.id === currentUserId
      );
      if (!existingLike) {
        await axiosInstance.post("/api/Journal/likes/", {
          journal: journalId,
        });
        const updatedJournals = [...journals];
        updatedJournals[journalIndex] = {
          ...journal,
          is_liked: true,
          like_count: journal.like_count + 1,
        };
        setJournals(updatedJournals);
      } else {
        console.warn("Like already exists for journal:", journalId);
        const updatedJournals = [...journals];
        updatedJournals[journalIndex] = {
          ...journal,
          is_liked: true,
          like_count: journal.like_count + (journal.like_count === 0 ? 1 : 0),
        };
        setJournals(updatedJournals);
      }
    }
  } catch (err) {
    setError("Failed to update like");
    console.error("Like error:", err.response?.data || err.message);
  }
};

export const handleShare = async (journalId, fetchJournals, setError) => {
  try {
    await axiosInstance.post("/api/Journal/shared-journals/", {
      journal: journalId,
    });
    fetchJournals();
  } catch (err) {
    setError("Failed to share journal");
    console.error("Share error:", err.response?.data || err.message);
  }
};

function JournalActions({
  journal,
  journals,
  setJournals,
  fetchJournals,
  isOwner,
  currentUserId,
  setError,
  navigate,
}) {
  return (
    <div className="mt-6 flex justify-between items-center">
      <button
        onClick={() =>
          handleLike(journal.id, journals, setJournals, currentUserId, setError)
        }
        className={`text-blue-600 hover:text-blue-800 transition ${
          journal.is_liked ? "font-bold" : ""
        }`}
      >
        {journal.is_liked ? "Unlike" : "Like"} ({journal.like_count})
      </button>
      <button className="text-blue-600 hover:text-blue-800 transition">
        Comment ({journal.comment_count})
      </button>
      <button
        onClick={() => handleShare(journal.id, fetchJournals, setError)}
        className="text-blue-600 hover:text-blue-800 transition"
      >
        Share ({journal.shares?.length || 0})
      </button>
      {isOwner && (
        <div>
          {!journal.is_shared && (
            <>
              <button
                onClick={() => handleEdit(journal, navigate)}
                className="text-green-600 mr-2 hover:underline"
              >
                Edit
              </button>
              <button
                onClick={() =>
                  handleDeleteJournal(journal.id, fetchJournals, setError)
                }
                className="text-red-600 hover:underline"
              >
                Delete
              </button>
            </>
          )}
          {journal.is_shared && journal.shared_by?.id === currentUserId && (
            <button
              onClick={() =>
                handleDeleteShare(
                  journal.id,
                  currentUserId,
                  fetchJournals,
                  setError
                )
              }
              className="text-red-600 hover:underline"
            >
              Delete Share
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default JournalActions;
