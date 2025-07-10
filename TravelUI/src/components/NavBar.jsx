import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../redux/authSlice";
import Cookies from "js-cookie"; // Import Cookies
import axiosInstance from "../utils/axiosInstance"; // Import axiosInstance

function NavBar() {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      // Call backend logout endpoint to invalidate tokens
      await axiosInstance.post("/api/Users/logout/", {
        refresh: Cookies.get("refreshToken"),
      });
    } catch (err) {
      console.error("Logout API call failed:", err);
    }

    // Clear cookies
    Cookies.remove("accessToken");
    Cookies.remove("refreshToken");

    // Clear Redux state
    dispatch(logout());

    // Redirect to home
    navigate("/");
  };

  const linkStyle = ({ isActive }) =>
    `px-4 py-2 rounded text-white font-medium ${
      isActive ? "bg-green-600 text-black" : "bg-blue-700 hover:bg-blue-600"
    }`;

  const isAuthPage = ["/login", "/register"].includes(location.pathname);

  return (
    <nav className="bg-blue-500 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <NavLink to="/" className="text-white text-lg font-bold">
          WanderTales
        </NavLink>

        {isAuthPage ? (
          <button
            onClick={() => navigate(-1)}
            className="bg-white text-blue-700 px-4 py-2 rounded hover:bg-gray-200 font-medium"
          >
            Back
          </button>
        ) : (
          <div className="space-x-2 text-black">
            {user ? (
              <>
                <NavLink to="/home" className={linkStyle}>
                  Home
                </NavLink>
                <NavLink to="/explore" className={linkStyle}>
                  Explore
                </NavLink>
                <NavLink to="/profile" className={linkStyle}>
                  Profile
                </NavLink>
                {user.is_staff && (
                  <NavLink to="/admin" className={linkStyle}>
                    Admin
                  </NavLink>
                )}
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600 font-medium"
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                <NavLink to="/login" className={linkStyle}>
                  Login
                </NavLink>
                <NavLink to="/register" className={linkStyle}>
                  Register
                </NavLink>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

export default NavBar;
