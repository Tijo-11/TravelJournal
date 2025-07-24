import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";
import { setUser } from "../redux/authSlice";
import Cookies from "js-cookie";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const dispatch = useNavigate();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    // handleSubmit is an asynchronous function triggered when the form is submitted
    e.preventDefault(); // 'e' is the event object; calling preventDefault stops the form from refreshing the page
    setError(null);
    try {
      const loginResponse = await axiosInstance.post("/api/Users/login/", {
        email, //Sends a POST request to the backend login API endpoint with the entered email and password
        password, // 'await' waits for the response before moving to the next line
      });
      const { access, refresh } = loginResponse.data; //loginResponse stores the response returned from the
      //  backend after making the login request.
      Cookies.set("accessToken", access, { expires: 7, sameSite: "Strict" });
      /* the backend will set the actual expiration time for the access token (typically 5 minutes for security 
      reasons), regardless of how long you store it in the cookie. This expiry is encoded inside the token itself.
      Once expired, any request using that token will be rejected with a 401 Unauthorized error.
      The { expires: 7 } option only controls how long the cookie stays on the client, not how long the token 
      is valid. sameSite: set to "Strict" to prevent the cookie from being sent with cross-site requests
       (for security)*/
      Cookies.set("refreshToken", refresh, { expires: 7, samesite: "Strict" });

      const ProfileResponse = await axiosInstance.get("api/Users/profile");

      if (ProfileResponse.data.is_blocked) {
        setError("Your account is blocked, contact administrator");
        Cookies.remove("accessToken");
        Cookies.remove("refreshToken");
        return;
      }

      dispatch(setUser(ProfileResponse.data)); //dispatch that data to Redux:
      /*This calls the setUser reducer in your authSlice. It sets state.user to ProfileResponse.data.
      Now, any component that uses: const { user } = useSelector((state) => state.auth);
      will have access to the user's info globally. */

      navigate("/home"); // navigate to home on success
    } catch (err) {
      console.err("Login error", err.respone?.data || err);
      setError(err.respone?.data?.error || "Invalid Credentials");
    }
  };

  return (
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
              d="password"
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
              required
            />
            <button
              type="submit"
              className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition duration-200"
            >
              Login
            </button>
          </div>
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
  );
}
