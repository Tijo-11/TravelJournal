import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";

function VerifyPending() {
  const [resendStatus, setResendStatus] = useState(null); // null, 'success', 'already_verified', 'missing_email', 'user_not_found', 'error'
  const [cooldown, setCooldown] = useState(60); // seconds remaining
  const navigate = useNavigate();

  useEffect(() => {
    let interval = null;
    if (cooldown > 0) {
      interval = setInterval(() => {
        setCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [cooldown]);

  const handleResend = async () => {
    try {
      const email = localStorage.getItem("pending_email");
      if (!email) {
        setResendStatus("missing_email");
        return;
      }

      await axiosInstance.post("/api/Users/resend-verification/", {
        email,
      });

      setResendStatus("success");
      setCooldown(60); // Restart cooldown
    } catch (err) {
      console.error("Resend error:", err);
      if (err.response?.data?.code === "already_verified") {
        setResendStatus("already_verified");
        setTimeout(() => navigate("/login?verified=1"), 2000);
      } else if (err.response?.data?.code === "missing_email") {
        setResendStatus("missing_email");
      } else if (err.response?.data?.code === "user_not_found") {
        setResendStatus("user_not_found");
      } else {
        setResendStatus("error");
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white shadow-lg p-6 rounded-md max-w-md w-full text-center">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">
          Verify Your Email
        </h2>
        <p className="text-gray-600 mb-2">
          A verification email has been sent to your inbox.
        </p>
        <p className="text-gray-600 mb-4">
          Please check your email and click the verification link to activate
          your account.
        </p>

        <button
          onClick={handleResend}
          disabled={cooldown > 0}
          className={`mt-2 px-4 py-2 rounded transition ${
            cooldown > 0
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
        >
          Resend Verification Email
        </button>

        {cooldown > 0 && (
          <p className="text-sm text-gray-500 mt-2">
            You can resend in {cooldown} second{cooldown !== 1 ? "s" : ""}
          </p>
        )}

        {resendStatus === "success" && (
          <p className="text-green-600 mt-2">Email resent successfully!</p>
        )}
        {resendStatus === "already_verified" && (
          <p className="text-blue-600 mt-2">
            Your email is already verified. Redirecting to login...
          </p>
        )}
        {resendStatus === "missing_email" && (
          <p className="text-red-600 mt-2">
            No email found. Please register again.
          </p>
        )}
        {resendStatus === "user_not_found" && (
          <p className="text-red-600 mt-2">
            No account found with this email. Please register again.
          </p>
        )}
        {resendStatus === "error" && (
          <p className="text-red-600 mt-2">
            Failed to resend verification email. Please try again later.
          </p>
        )}
      </div>
    </div>
  );
}

export default VerifyPending;
