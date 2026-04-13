import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api";

export default function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", mobile: "", aadhar: "", password: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setSuccess("");
    try {
      const res = await API.post("/auth/signup", form);
      setSuccess(res.data.message);
      setTimeout(() => navigate("/login/user"), 1500);
    } catch (err) {
      setError(err.response?.data?.error || "Signup failed");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>User Sign Up</h2>
        {error && <div className="error-banner">{error}</div>}
        {success && <div className="success-msg">{success}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group"><label>Full Name</label>
            <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required /></div>
          <div className="form-group"><label>Email</label>
            <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required /></div>
          <div className="form-group"><label>Mobile Number</label>
            <input value={form.mobile} onChange={e => setForm({...form, mobile: e.target.value})} placeholder="10 digits" required /></div>
          <div className="form-group"><label>Aadhar Number</label>
            <input value={form.aadhar} onChange={e => setForm({...form, aadhar: e.target.value})} placeholder="12 digits" required /></div>
          <div className="form-group"><label>Password</label>
            <input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required /></div>
          <button type="submit" className="btn btn-primary" style={{width:"100%"}}>Sign Up</button>
        </form>
        <div className="toggle">
          Already have an account? <Link to="/login/user">Login</Link>
        </div>
        <div className="toggle" style={{marginTop: 8}}><Link to="/">← Back to Home</Link></div>
      </div>
    </div>
  );
}