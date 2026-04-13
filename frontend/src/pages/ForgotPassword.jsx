import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const handleSendOtp = async () => {
    try {
      const res = await API.post("/auth/forgot-password", { email });
      alert(res.data.message);

      // 🔥 Move to reset page
      navigate("/reset-password");

    } catch (err) {
      alert(err.response?.data?.error || "Error sending OTP");
    }
  };

  return (
    <div style={{ padding: "40px", textAlign: "center" }}>
      <h2>Forgot Password</h2>

      <input
        type="email"
        placeholder="Enter your email"
        onChange={(e) => setEmail(e.target.value)}
        style={{ padding: "10px", width: "250px", margin: "10px" }}
      />

      <br />

      <button onClick={handleSendOtp} style={{ padding: "10px 20px" }}>
        Send OTP
      </button>
    </div>
  );
}