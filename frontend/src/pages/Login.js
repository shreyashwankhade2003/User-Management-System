// import React, { useState } from "react";
// import { useParams, useNavigate, Link } from "react-router-dom";
// import API from "../api";

// export default function Login() {
//   const { role } = useParams();
//   const navigate = useNavigate();
//   const [form, setForm] = useState({ email: "", password: "" });
//   const [error, setError] = useState("");

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError("");
//     try {
//       const res = await API.post("/auth/login", { ...form, role });
//       localStorage.setItem("token", res.data.token);
//       localStorage.setItem("user", JSON.stringify(res.data.user));
//       navigate(role === "admin" ? "/admin" : "/user");
//     } catch (err) {
//       setError(err.response?.data?.error || "Login failed");
//     }
//   };

//   return (
//     <div className="auth-page">
//       <div className="auth-card">
//         <h2>{role === "admin" ? "Admin" : "User"} Login</h2>
//         {error && <div className="error-banner">{error}</div>}
//         <form onSubmit={handleSubmit}>
//           <div className="form-group">
//             <label>Email</label>
//             <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
//           </div>
//           <div className="form-group">
//             <label>Password</label>
//             <input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required />
//           </div>
//           <button type="submit" className="btn btn-primary" style={{width:"100%"}}>Login</button>
//         </form>
//         {role === "user" && (
//           <div className="toggle">
//             Don't have an account? <Link to="/signup">Sign Up</Link>
//           </div>
//         )}
//         <div className="toggle" style={{marginTop: 8}}>
//           <Link to="/">← Back to Home</Link>
//         </div>
//       </div>
//     </div>
//   );
// }

import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import API from "../api";

export default function Login() {
  const { role } = useParams(); // "admin" or "user"
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // 🔥 Handle Input Change
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // 🔥 Handle Login Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await API.post("/auth/login", {
        email: form.email,
        password: form.password,
        role: role || "user", // fallback safety
      });

      // ✅ Store token + user
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      // ✅ Redirect based on role
      if (res.data.user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/user");
      }

    } catch (err) {
      setError(err.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">

        <h2>{role === "admin" ? "Admin" : "User"} Login</h2>

        {error && <div className="error-banner">{error}</div>}

        <form onSubmit={handleSubmit}>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: "100%" }}
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>

        </form>

        {/* 🔥 Forgot Password */}
        <div className="toggle" style={{ marginTop: 10 }}>
          <span
            style={{ color: "blue", cursor: "pointer" }}
            onClick={() => navigate("/forgot-password")}
          >
            Forgot Password?
          </span>
        </div>

        {/* 🔥 Signup for user */}
        {role === "user" && (
          <div className="toggle">
            Don't have an account? <Link to="/signup">Sign Up</Link>
          </div>
        )}

        <div className="toggle" style={{ marginTop: 8 }}>
          <Link to="/">← Back to Home</Link>
        </div>

      </div>
    </div>
  );
}