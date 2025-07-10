import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";
import BackgroundImage from "../components/BackgroundImage";
import ProfileImage from "../components/ProfileImage";
import JournalList from "../components/JournalList";
import Footer from "../components/Footer";
import EditProfileCard from "../components/EditProfileCard";
import FollowList from "../components/FollowList";

function Profile() {
  const { user: currentUser } = useSelector((state) => state.auth);
  const { userId } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  const [bannerImage, setBannerImage] = useState(null);
  const [journals, setJournals] = useState([]);
  const [error, setError] = useState(null);
  const [showEdit, setShowEdit] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);

  const isOwner = !userId || userId == currentUser?.id;

  useEffect(() => {
    console.log("Profile.jsx: Current User:", currentUser); // Debug log
    fetchProfile();
    if (!isOwner) {
      checkFollowStatus();
    }
  }, [userId, currentUser]);

  const fetchProfile = async () => {
    try {
      const endpoint = isOwner
        ? "/api/Users/profile/"
        : `/api/Users/profile/${userId}/`;
      const res = await axiosInstance.get(endpoint);
      const userData = res.data.user || res.data;
      const fetchedJournals = res.data.journals || [];
      setProfile(userData);
      setProfileImage(userData.profile_image || null);
      setBannerImage(userData.banner_image || null);
      setJournals(fetchedJournals);
      setError(null);
    } catch (err) {
      setError("Failed to load profile data");
      console.error("Profile fetch error:", err.response?.data || err.message);
      if (err.response?.status === 404) {
        navigate("/not-found");
      }
    }
  };

  const checkFollowStatus = async () => {
    try {
      const res = await axiosInstance.get("/api/Users/follow/status", {
        params: { followed: userId },
      });
      setIsFollowing(res.data.is_following);
    } catch (err) {
      setError("Failed to check follow status");
      console.error("Follow status error:", err.response?.data || err.message);
    }
  };

  const handleFollow = async () => {
    try {
      if (isFollowing) {
        await axiosInstance.delete(`/api/Users/follow/${userId}/`);
        setIsFollowing(false);
      } else {
        await axiosInstance.post("/api/Users/follow/", { followed: userId });
        setIsFollowing(true);
      }
    } catch (err) {
      setError(`Failed to ${isFollowing ? "unfollow" : "follow"} user`);
      console.error("Follow error:", err.response?.data || err.message);
    }
  };

  return (
    <>
      <div className="container mx-auto p-4">
        {/* Banner with profile image in bottom-left */}
        <div className="relative w-full overflow-hidden rounded-lg shadow">
          <BackgroundImage
            bannerImage={bannerImage}
            setBannerImage={isOwner ? setBannerImage : null}
            setError={setError}
          />
          <div className="absolute bottom-4 left-4">
            <ProfileImage
              profileImage={profileImage}
              setProfileImage={isOwner ? setProfileImage : null}
              setError={setError}
            />
          </div>
        </div>
        {/* Centered username */}
        <div className="text-center my-8">
          <h1 className="text-blue-600 text-3xl font-bold">
            {profile?.first_name || currentUser?.first_name || "Anonymous"}'s
            Profile
          </h1>
        </div>
        <div className="max-w-xl mx-auto bg-white shadow-lg p-6 rounded-lg mb-6">
          <div className="text-lg mb-4">
            <p>
              <strong>First Name:</strong>{" "}
              {profile?.first_name || currentUser?.first_name || "-"}
            </p>
            <p>
              <strong>Last Name:</strong>{" "}
              {profile?.last_name || currentUser?.last_name || "-"}
            </p>
            <p>
              <strong>Date of Birth:</strong>{" "}
              {profile?.date_of_birth || currentUser?.date_of_birth || "-"}
            </p>
            <p>
              <strong>Country:</strong>{" "}
              {profile?.country_of_birth ||
                currentUser?.country_of_birth ||
                "-"}
            </p>
            <p>
              <strong>Gender:</strong>{" "}
              {profile?.gender || currentUser?.gender || "-"}
            </p>
          </div>
          <div className="flex space-x-4">
            {isOwner ? (
              <>
                <button
                  className="bg-blue-500 text-white font-semibold px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                  onClick={() => setShowEdit(!showEdit)}
                >
                  {showEdit ? "Cancel" : "Edit Your Details"}
                </button>
                <button
                  className="bg-green-500 text-white font-semibold px-4 py-2 rounded hover:bg-green-600 transition"
                  onClick={() => navigate("/create")}
                >
                  Create Journal
                </button>
              </>
            ) : (
              <button
                className={`px-4 py-2 rounded text-white font-semibold transition ${
                  isFollowing
                    ? "bg-gray-800 hover:bg-gray-900"
                    : "bg-blue-500 hover:bg-blue-600"
                }`}
                onClick={handleFollow}
              >
                {isFollowing ? "Unfollow" : "Follow"}
              </button>
            )}
          </div>
        </div>

        {/* Follower and Following Lists */}
        <FollowList
          userId={userId}
          isOwner={isOwner}
          currentUserId={currentUser?.id}
        />

        {showEdit && isOwner && (
          <EditProfileCard
            user={profile || currentUser}
            onSuccess={() => {
              setShowEdit(false);
              fetchProfile();
            }}
          />
        )}

        {/* Journal list */}
        <div className="container mx-auto flex justify-center">
          <JournalList
            journals={journals}
            setJournals={setJournals}
            error={error}
            setError={setError}
            fetchJournals={fetchProfile}
            isOwner={isOwner}
            currentUserId={currentUser?.id}
          />
        </div>
      </div>
      <Footer />
    </>
  );
}

export default Profile;

//Explanantion
//useSelector((state) => state.auth);This fetches the logged-in user info from the Redux store (auth.user).
//This user was set earlier during login or AuthProvider.
// use local state to manage: profile image,banner image, list of journals,any errors from API calls
//useEffect()  Load data from API on page load,Runs once on component mount.Calls two async functions:
//  Fetch profile image banner and fetch list of journals

// Redux	Stores authenticated user across app
// axiosInstance	Talks to backend using access token from cookies
// Login.jsx	Logs in the user, sets Redux state and cookies
// AuthProvider.jsx	Loads Redux state from token on refresh
// Profile.jsx	Uses Redux user + API to load additional data
// NavBar, ProfileImage, BackgroundImage, JournalList	Modular components used inside Profile page
