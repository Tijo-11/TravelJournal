import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";

function UserSuggestions() {
  const [suggestions, setSuggestions] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchSuggestions = async () => {
    try {
      const response = await axiosInstance.get("/api/Users/suggestions/");
      setSuggestions(response.data.results || []);
    } catch (err) {
      setError("Failed to load suggestions");
    }
  };

  const handleFollow = async (userId) => {
    try {
      await axiosInstance.post("/api/Users/follow/", { followed: userId });
      fetchSuggestions();
    } catch (err) {
      setError("Failed to follow user");
    }
  };

  useEffect(() => {
    fetchSuggestions();
  }, []);

  return (
    <div className="bg-white p-4 rounded shadow-md">
      <h2 className="text-lg font-bold mb-4">Explore Users</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {suggestions.length === 0 && !error && (
        <p className="text-gray-500">No suggestions available</p>
      )}
      {suggestions.map((user) => (
        <div key={user.id} className="flex items-center mb-4">
          <img
            src={
              user.profile_image ||
              "https://dummyimage.com/40x40/cccccc/000000&text=User"
            }
            alt="Profile"
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
              {user.full_name}
            </p>
            <button
              onClick={() => handleFollow(user.id)}
              className="text-blue-600 text-sm hover:text-blue-800"
            >
              Follow
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default UserSuggestions;
