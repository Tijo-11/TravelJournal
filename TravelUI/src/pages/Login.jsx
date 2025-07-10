import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";
import { setUser } from "../redux/authSlice";
import Cookies from "js-cookie";
import Footer from "../components/Footer";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const loginResponse = await axiosInstance.post("/api/Users/login/", {
        email,
        password,
      });
      const { access, refresh } = loginResponse.data;

      Cookies.set("accessToken", access, { expires: 7, sameSite: "Strict" });
      Cookies.set("refreshToken", refresh, { expires: 7, sameSite: "Strict" });

      const profileResponse = await axiosInstance.get("/api/Users/profile/");

      if (profileResponse.data.is_blocked) {
        setError("Your account is blocked, contact administrator");
        Cookies.remove("accessToken");
        Cookies.remove("refreshToken");
        return;
      }

      dispatch(setUser(profileResponse.data));
      navigate("/home");
    } catch (err) {
      console.error("Login error:", err.response?.data || err);
      setError(err.response?.data?.error || "Invalid credentials");
    }
  };

  return (
    <>
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
          <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
          {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 mb-1" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                placeholder="Enter email"
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
                required
              />
            </div>
            <div className="mb-6">
              <label className="block text-gray-700 mb-1" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition duration-200"
            >
              Login
            </button>
          </form>
          <div className="mt-4 flex justify-between">
            <Link
              to="/register"
              className="text-blue-600 hover:underline hover:text-blue-800 transition duration-200"
            >
              Register
            </Link>
            <Link
              to="/password-reset"
              className="text-blue-600 hover:underline hover:text-blue-800 transition duration-200"
            >
              Forgot Password?
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default Login;
