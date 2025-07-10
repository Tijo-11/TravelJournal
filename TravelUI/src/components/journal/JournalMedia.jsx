import { useState } from "react";

const BACKEND_BASE_URL = "http://localhost:8000";

function JournalMedia({ journal }) {
  const [mediaIndices, setMediaIndices] = useState({});

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
    <div className="mt-4 relative">
      {journal.media && journal.media.length > 0 ? (
        <div className="relative">
          <img
            src={getMediaUrl(journal.media[mediaIndices[journal.id] || 0].file)}
            alt="Journal media"
            className="mx-auto object-contain rounded"
            style={{ maxHeight: "60vh", width: "100%", height: "auto" }}
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
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-blue-600 text-white text-4xl rounded-full w-14 h-14 flex items-center justify-center shadow-md hover:bg-blue-700 transition"
              >
                ‹
              </button>
              <button
                onClick={() =>
                  handleNextImage(journal.id, journal.media.length)
                }
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-blue-600 text-white text-4xl rounded-full w-14 h-14 flex items-center justify-center shadow-md hover:bg-blue-700 transition"
              >
                ›
              </button>
            </>
          )}
        </div>
      ) : (
        <p className="text-gray-500 text-center">No media available</p>
      )}
    </div>
  );
}

export default JournalMedia;
