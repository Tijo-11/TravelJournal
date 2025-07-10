// src/pages/VerifyEmail.jsx
import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";

function VerifyEmail() {
  const { token } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const verify = async () => {
      try {
        await axiosInstance.get(`/api/Users/verify-email/${token}/`);
        navigate("/login?verified=1");
      } catch (err) {
        console.error("Email verification error:", err);
        navigate("/verify-pending?error=1");
      }
    };
    verify();
  }, [token, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <h2 className="text-2xl font-bold">Verifying Email...</h2>
    </div>
  );
}

export default VerifyEmail;
