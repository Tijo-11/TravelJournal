import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";

export default function Register() {
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [countryOfBirth, setCountryOfBirth] = useState("");
  const [gender, setGender] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await axiosInstance.post("/api/Users/register/", {
        email,
        first_name: firstName,
        last_name: lastName,
        date_of_birth: dateOfBirth || null,
        country_of_birth: countryOfBirth,
        gender,
        password,
        password2,
      });
      localStorage.setItem("pending_email", email); //tores a value (email) in the browser’s localStorage under
      // the key "pending_email".
      navigate("/verify-pending");
    } catch (err) {
      if (err.response?.data) {
        const errors = err.response.data;
        if (errors.email) {
          setError(errors.email[0]);
        } else if (errors.password) {
          setError(errors.password[0]);
        } else {
          setError("Registration failed. Please check your inputs.");
        }
        console.error("Registration error:", err);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
          <h2 className="text-2xl font-bold mb-6 text-center">Register</h2>
          {error && <p className="text-red-500 mb-4 text-center">{error}</p>}

          {loading && (
            <div className="flex items-center justify-center mb-4">
              <svg
                className="animate-spin h-5 w-5 text-blue-600 mr-2"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8z"
                />
              </svg>
              <p className="text-blue-600">Creating your account...</p>
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 mb-1" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="Enter email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
                required
                disabled={loading}
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-1" htmlFor="firstName">
                First Name
              </label>
              <input
                id="firstName"
                type="text"
                placeholder="Enter first name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
                disabled={loading}
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-1" htmlFor="lastName">
                Last Name
              </label>
              <input
                id="lastName"
                type="text"
                placeholder="Enter last name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
                disabled={loading}
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-1" htmlFor="dateOfBirth">
                Date of Birth
              </label>
              <input
                id="dateOfBirth"
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
                disabled={loading}
              />
            </div>
            <div className="mb-4">
              <label
                className="block text-gray-700 mb-1"
                htmlFor="countryOfBirth"
              >
                Country of Birth
              </label>
              <input
                id="countryOfBirth"
                type="text"
                placeholder="Enter country of birth"
                value={countryOfBirth}
                onChange={(e) => setCountryOfBirth(e.target.value)}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
                disabled={loading}
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-1" htmlFor="gender">
                Gender
              </label>
              <select
                id="gender"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
                disabled={loading}
              >
                <option value="">Select gender</option>
                <option value="M">Male</option>
                <option value="F">Female</option>
                <option value="C">Custom</option>
              </select>
            </div>
            <div className="mb-4">
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
                disabled={loading}
              />
            </div>
            <div className="mb-6">
              <label className="block text-gray-700 mb-1" htmlFor="password2">
                Confirm Password
              </label>
              <input
                id="password2"
                type="password"
                placeholder="Confirm password"
                value={password2}
                onChange={(e) => setPassword2(e.target.value)}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
                required
                disabled={loading}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className={`w-full text-white p-2 rounded transition duration-200 ${
                loading
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <svg
                    className="animate-spin h-5 w-5 mr-2 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8z"
                    />
                  </svg>
                  Registering...
                </div>
              ) : (
                "Register"
              )}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
