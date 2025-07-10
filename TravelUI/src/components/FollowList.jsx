import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";

function FollowList({ userId, isOwner, currentUserId }) {
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [followersPage, setFollowersPage] = useState(1);
  const [followingPage, setFollowingPage] = useState(1);
  const [followersMeta, setFollowersMeta] = useState({
    next: null,
    previous: null,
  });
  const [followingMeta, setFollowingMeta] = useState({
    next: null,
    previous: null,
  });
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchFollowers = async (page = 1) => {
    try {
      const endpoint = isOwner
        ? `/api/Users/followers/?page=${page}`
        : `/api/Users/followers/${userId}/?page=${page}`;
      const res = await axiosInstance.get(endpoint);
      setFollowers(res.data.results || []);
      setFollowersMeta({
        next: res.data.next,
        previous: res.data.previous,
      });
      setError(null);
    } catch (err) {
      setError("Failed to load followers");
      console.error(
        "Fetch followers error:",
        err.response?.data || err.message
      );
    }
  };

  const fetchFollowing = async (page = 1) => {
    try {
      const endpoint = isOwner
        ? `/api/Users/following/?page=${page}`
        : `/api/Users/following/${userId}/?page=${page}`;
      const res = await axiosInstance.get(endpoint);
      setFollowing(res.data.results || []);
      setFollowingMeta({
        next: res.data.next,
        previous: res.data.previous,
      });
      setError(null);
    } catch (err) {
      setError("Failed to load following");
      console.error(
        "Fetch following error:",
        err.response?.data || err.message
      );
    }
  };

  const handleFollow = async (userId, isFollowing) => {
    try {
      if (isFollowing) {
        await axiosInstance.delete(`/api/Users/follow/${userId}/`);
      } else {
        await axiosInstance.post("/api/Users/follow/", { followed: userId });
      }
      // Refresh both lists to reflect follow/unfollow changes
      if (showFollowers) fetchFollowers(followersPage);
      if (showFollowing) fetchFollowing(followingPage);
    } catch (err) {
      setError(`Failed to ${isFollowing ? "unfollow" : "follow"} user`);
      console.error("Follow error:", err.response?.data || err.message);
    }
  };

  useEffect(() => {
    if (showFollowers) {
      fetchFollowers(followersPage);
    }
    if (showFollowing) {
      fetchFollowing(followingPage);
    }
  }, [
    followersPage,
    followingPage,
    showFollowers,
    showFollowing,
    userId,
    isOwner,
  ]);

  const handlePageChange = (type, direction) => {
    if (type === "followers") {
      setFollowersPage((prev) => (direction === "next" ? prev + 1 : prev - 1));
    } else {
      setFollowingPage((prev) => (direction === "next" ? prev + 1 : prev - 1));
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-white shadow-lg p-6 rounded-lg mb-6">
      {error && <p className="text-red-500 text-center mb-4">{error}</p>}

      {/* Followers Section */}
      <div className="mb-4">
        <button
          className="w-full bg-blue-500 text-white font-semibold px-4 py-2 rounded hover:bg-blue-600 transition-colors flex justify-between items-center"
          onClick={() => setShowFollowers(!showFollowers)}
        >
          <span>Followers</span>
          <span>{showFollowers ? "▲" : "▼"}</span>
        </button>
        {showFollowers && (
          <div className="mt-4">
            {followers.length === 0 ? (
              <p className="text-gray-500 text-center">No followers found.</p>
            ) : (
              <ul className="space-y-2">
                {followers.map((user) => (
                  <li
                    key={user.id}
                    className="flex items-center p-2 border rounded hover:bg-gray-100"
                  >
                    <img
                      src={
                        user.profile_image ||
                        "https://dummyimage.com/40x40/cccccc/000000&text=User"
                      }
                      alt={`${user.full_name}'s profile`}
                      className="w-10 h-10 rounded-full mr-2"
                      onError={(e) => {
                        e.target.src =
                          "https://dummyimage.com/40x40/cccccc/000000&text=User";
                      }}
                    />
                    <div>
                      <p
                        className="text-blue-600 cursor-pointer"
                        onClick={() => navigate(`/profile/${user.id}`)}
                      >
                        {user.full_name || "Anonymous"}
                      </p>
                      {user.id !== currentUserId && (
                        <button
                          onClick={() =>
                            handleFollow(
                              user.id,
                              following.some((u) => u.id === user.id)
                            )
                          }
                          className="text-blue-600 text-sm hover:text-blue-800"
                        >
                          {following.some((u) => u.id === user.id)
                            ? "Unfollow"
                            : "Follow"}
                        </button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <div className="flex justify-between mt-4">
              <button
                className={`px-4 py-2 rounded text-white font-semibold ${
                  followersMeta.previous
                    ? "bg-blue-500 hover:bg-blue-600"
                    : "bg-gray-300 cursor-not-allowed"
                }`}
                onClick={() => handlePageChange("followers", "previous")}
                disabled={!followersMeta.previous}
              >
                Previous
              </button>
              <button
                className={`px-4 py-2 rounded text-white font-semibold ${
                  followersMeta.next
                    ? "bg-blue-500 hover:bg-blue-600"
                    : "bg-gray-300 cursor-not-allowed"
                }`}
                onClick={() => handlePageChange("followers", "next")}
                disabled={!followersMeta.next}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Following Section */}
      <div>
        <button
          className="w-full bg-blue-500 text-white font-semibold px-4 py-2 rounded hover:bg-blue-600 transition-colors flex justify-between items-center"
          onClick={() => setShowFollowing(!showFollowing)}
        >
          <span>Following</span>
          <span>{showFollowing ? "▲" : "▼"}</span>
        </button>
        {showFollowing && (
          <div className="mt-4">
            {following.length === 0 ? (
              <p className="text-gray-500 text-center">Not following anyone.</p>
            ) : (
              <ul className="space-y-2">
                {following.map((user) => (
                  <li
                    key={user.id}
                    className="flex items-center p-2 border rounded hover:bg-gray-100 Carthik"
                  >
                    <img
                      src={
                        user.profile_image ||
                        "https://dummyimage.com/40x40/cccccc/000000&text=User"
                      }
                      alt={`${user.full_name}'s profile`}
                      className="w-10 h-10 rounded-full mr-2"
                      onError={(e) => {
                        e.target.src =
                          "https://dummyimage.com/40x40/cccccc/000000&text=User";
                      }}
                    />
                    <div>
                      <p
                        className="text-blue-600 cursor-pointer"
                        onClick={() => navigate(`/profile/${user.id}`)}
                      >
                        {user.full_name || "Anonymous"}
                      </p>
                      {user.id !== currentUserId && (
                        <button
                          onClick={() => handleFollow(user.id, true)}
                          className="text-blue-600 text-sm hover:text-blue-800"
                        >
                          Unfollow
                        </button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <div className="flex justify-between mt-4">
              <button
                className={`px-4 py-2 rounded text-white font-semibold ${
                  followingMeta.previous
                    ? "bg-blue-500 hover:bg-blue-600"
                    : "bg-gray-300 cursor-not-allowed"
                }`}
                onClick={() => handlePageChange("following", "previous")}
                disabled={!followingMeta.previous}
              >
                Previous
              </button>
              <button
                className={`px-4 py-2 rounded text-white font-semibold ${
                  followingMeta.next
                    ? "bg-blue-500 hover:bg-blue-600"
                    : "bg-gray-300 cursor-not-allowed"
                }`}
                onClick={() => handlePageChange("following", "next")}
                disabled={!followingMeta.next}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default FollowList;
