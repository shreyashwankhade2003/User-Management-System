import React from "react";
import { useNavigate } from "react-router-dom";

export default function Welcome() {
  const navigate = useNavigate();
  return (
    <div className="welcome-page">
      <h1>User Management System</h1>
      <p>Manage users efficiently with role-based access control</p>
      <div className="welcome-buttons">
        <button className="welcome-btn admin" onClick={() => navigate("/login/admin")}>
          Login as Admin
        </button>
        <button className="welcome-btn user" onClick={() => navigate("/login/user")}>
          Login as User
        </button>
      </div>
    </div>
  );
}