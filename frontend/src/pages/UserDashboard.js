import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";

export default function UserDashboard() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: "", mobile: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchProfile = async () => {
    try {
      const res = await API.get("/user/profile");
      setProfile(res.data);
      setForm({ name: res.data.name, mobile: res.data.mobile });
    } catch { setError("Failed to load profile"); }
  };

  useEffect(() => { fetchProfile(); }, []);

  const logout = () => { localStorage.clear(); navigate("/"); };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError(""); setSuccess("");
    try {
      await API.put("/user/profile", form);
      setSuccess("Profile updated!");
      setEditing(false);
      fetchProfile();
      setTimeout(() => setSuccess(""), 2000);
    } catch (err) {
      setError(err.response?.data?.error || "Update failed");
    }
  };

  if (!profile) return <div className="container"><p>Loading...</p></div>;

  return (
    <div className="dashboard">
      <div className="navbar">
        <h2>User Dashboard</h2>
        <button onClick={logout}>Logout</button>
      </div>
      <div className="container">
        {success && <div className="success-msg">{success}</div>}
        {error && <div className="error-banner">{error}</div>}

        <div className="card">
          <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom: 20}}>
            <h3>My Profile</h3>
            {!editing && <button className="btn btn-primary" onClick={() => setEditing(true)}>Edit Profile</button>}
          </div>

          {editing ? (
            <form onSubmit={handleUpdate}>
              <div className="form-group"><label>Name</label>
                <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required /></div>
              <div className="form-group"><label>Mobile</label>
                <input value={form.mobile} onChange={e => setForm({...form, mobile: e.target.value})} /></div>
              <div style={{display:"flex", gap:12}}>
                <button type="button" className="btn btn-secondary" onClick={() => setEditing(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save</button>
              </div>
            </form>
          ) : (
            <div className="profile-grid">
              <div className="profile-item"><label>Name</label><p>{profile.name}</p></div>
              <div className="profile-item"><label>Email</label><p>{profile.email}</p></div>
              <div className="profile-item"><label>Mobile</label><p>{profile.mobile}</p></div>
              <div className="profile-item"><label>Aadhar</label><p>{profile.aadhar}</p></div>
              <div className="profile-item"><label>Role</label><p>{profile.role}</p></div>
              <div className="profile-item"><label>Joined</label><p>{profile.created_at}</p></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}