import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", mobile: "", aadhar: "", password: "", role: "user" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchUsers = async () => {
    try {
      const res = await API.get("/admin/users");
      setUsers(res.data);
    } catch { setError("Failed to load users"); }
  };

  useEffect(() => { fetchUsers(); }, []);

  const logout = () => {
    localStorage.clear();
    navigate("/");
  };

  const openAdd = () => {
    setEditUser(null);
    setForm({ name: "", email: "", mobile: "", aadhar: "", password: "", role: "user" });
    setError(""); setSuccess("");
    setShowModal(true);
  };

  const openEdit = (u) => {
    setEditUser(u);
    setForm({ name: u.name, email: u.email, mobile: u.mobile, aadhar: u.aadhar, password: "", role: u.role });
    setError(""); setSuccess("");
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setSuccess("");
    try {
      if (editUser) {
        await API.put(`/admin/users/${editUser.id}`, form);
        setSuccess("User updated!");
      } else {
        await API.post("/admin/users", form);
        setSuccess("User added!");
      }
      fetchUsers();
      setTimeout(() => setShowModal(false), 1000);
    } catch (err) {
      setError(err.response?.data?.error || "Operation failed");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await API.delete(`/admin/users/${id}`);
      setSuccess("User deleted!");
      fetchUsers();
      setTimeout(() => setSuccess(""), 2000);
    } catch { setError("Delete failed"); }
  };

  const totalUsers = users.filter(u => u.role === "user").length;
  const totalAdmins = users.filter(u => u.role === "admin").length;

  return (
    <div className="dashboard">
      <div className="navbar">
        <h2>Admin Dashboard</h2>
        <button onClick={logout}>Logout</button>
      </div>
      <div className="container">
        {success && <div className="success-msg">{success}</div>}
        {error && <div className="error-banner">{error}</div>}

        <div className="stats-grid">
          <div className="stat-card"><h3>{users.length}</h3><p>Total Records</p></div>
          <div className="stat-card"><h3>{totalUsers}</h3><p>Users</p></div>
          <div className="stat-card"><h3>{totalAdmins}</h3><p>Admins</p></div>
        </div>

        <div className="card">
          <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom: 20}}>
            <h3>All Users</h3>
            <button className="btn btn-primary" onClick={openAdd}>+ Add User</button>
          </div>
          <table>
            <thead>
              <tr><th>ID</th><th>Name</th><th>Email</th><th>Mobile</th><th>Aadhar</th><th>Role</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td>{u.id}</td><td>{u.name}</td><td>{u.email}</td><td>{u.mobile}</td><td>{u.aadhar}</td><td>{u.role}</td>
                  <td>
                    <button className="btn btn-secondary" style={{marginRight:8, padding:"6px 12px", fontSize:13}} onClick={() => openEdit(u)}>Edit</button>
                    <button className="btn btn-danger" style={{padding:"6px 12px", fontSize:13}} onClick={() => handleDelete(u.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>{editUser ? "Edit User" : "Add New User"}</h3>
            {error && <div className="error-banner">{error}</div>}
            {success && <div className="success-msg">{success}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-group"><label>Name</label>
                <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required /></div>
              <div className="form-group"><label>Email</label>
                <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required /></div>
              <div className="form-group"><label>Mobile</label>
                <input value={form.mobile} onChange={e => setForm({...form, mobile: e.target.value})} required /></div>
              <div className="form-group"><label>Aadhar</label>
                <input value={form.aadhar} onChange={e => setForm({...form, aadhar: e.target.value})} required /></div>
              {!editUser && <div className="form-group"><label>Password</label>
                <input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required /></div>}
              <div className="form-group"><label>Role</label>
                <select value={form.role} onChange={e => setForm({...form, role: e.target.value})}>
                  <option value="user">User</option><option value="admin">Admin</option>
                </select></div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editUser ? "Update" : "Add"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}