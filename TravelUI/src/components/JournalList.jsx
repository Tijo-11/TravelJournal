import { useNavigate } from "react-router-dom";
import JournalMedia from "./journal/JournalMedia";
import JournalActions from "./journal/JournalActions";
import JournalComments from "./journal/JournalComments";

function JournalList({
  journals,
  setJournals,
  error,
  setError,
  fetchJournals,
  isOwner,
  currentUserId,
}) {
  const navigate = useNavigate();

  return (
    <div className="mt-8 px-4 w-full max-w-3xl mx-auto">
      {error && <p className="text-red-600 mb-4 text-center">{error}</p>}
      {journals.length === 0 && !error && (
        <p className="text-gray-600 text-center">No journals available</p>
      )}
      {journals.map((journal) => (
        <div key={journal.id} className="bg-white p-6 rounded shadow-lg mb-8">
          {journal.is_shared ? (
            <p className="text-sm text-gray-600 mb-1">
              Shared by{" "}
              <span
                className={`text-blue-600 ${
                  journal.shared_by?.id !== currentUserId
                    ? "hover:underline cursor-pointer"
                    : ""
                }`}
                onClick={() =>
                  journal.shared_by?.id !== currentUserId &&
                  navigate(`/profile/${journal.shared_by.id}`)
                }
              >
                {journal.shared_by?.full_name || "Unknown"}
              </span>{" "}
              | Original post by{" "}
              <span
                className={`text-blue-600 ${
                  journal.user?.id !== currentUserId
                    ? "hover:underline cursor-pointer"
                    : ""
                }`}
                onClick={() =>
                  journal.user?.id !== currentUserId &&
                  navigate(`/profile/${journal.user.id}`)
                }
              >
                {journal.user?.full_name || "Unknown"}
              </span>
            </p>
          ) : (
            <p className="text-sm text-gray-600 mb-1">
              Posted by{" "}
              <span
                className={`text-blue-600 ${
                  journal.user?.id !== currentUserId
                    ? "hover:underline cursor-pointer"
                    : ""
                }`}
                onClick={() =>
                  journal.user?.id !== currentUserId &&
                  navigate(`/profile/${journal.user.id}`)
                }
              >
                {journal.user?.full_name || "Unknown"}
              </span>
            </p>
          )}

          <p className="text-sm text-gray-500">
            {new Date(
              journal.display_date || journal.created_at
            ).toLocaleString()}
          </p>

          <h3 className="text-xl font-bold">{journal.title}</h3>
          <p className="mt-2">{journal.content}</p>

          <JournalMedia journal={journal} />

          <JournalActions
            journal={journal}
            journals={journals}
            setJournals={setJournals}
            fetchJournals={fetchJournals}
            isOwner={isOwner}
            currentUserId={currentUserId}
            setError={setError}
            navigate={navigate}
          />

          <JournalComments
            journal={journal}
            fetchJournals={fetchJournals}
            currentUserId={currentUserId}
            setError={setError}
            navigate={navigate}
          />
        </div>
      ))}
    </div>
  );
}

export default JournalList;
