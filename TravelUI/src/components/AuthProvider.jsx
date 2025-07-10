import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import axiosInstance from "../utils/axiosInstance";
import Cookies from "js-cookie";
import { setUser, logout } from "../redux/authSlice";

function AuthProvider({ children }) {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const validateToken = async () => {
      const accessToken = Cookies.get("accessToken");
      const refreshToken = Cookies.get("refreshToken");

      if (accessToken && refreshToken) {
        try {
          const response = await axiosInstance.get("/api/Users/profile/");
          if (response.data.is_blocked) {
            dispatch(logout());
            Cookies.remove("accessToken");
            Cookies.remove("refreshToken");
          } else {
            dispatch(setUser(response.data));
          }
        } catch (err) {
          console.error("Failed to fetch user profile:", err);
          dispatch(logout());
          Cookies.remove("accessToken");
          Cookies.remove("refreshToken");
        }
      } else {
        dispatch(logout()); // Ensure Redux state is cleared if tokens are missing
      }
      setIsLoading(false);
    };

    validateToken();
  }, [dispatch]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return children;
}

export default AuthProvider;
