import { useState, useEffect } from "react";
import axiosInstance from "../api/axios";
import Loader from "../components/Loader";
import { useAuth } from "../context/AuthContext";
import { formatDate } from "../utils/formatCurrency";
import "./Profile.css";

const Profile = () => {
  
  const { user, updateUser } = useAuth();

  const [accountInfo, setAccountInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
  });
  const [profileErrors, setProfileErrors] = useState({});
  const [profileSubmitting, setProfileSubmitting] = useState(false);
  const [profileMessage, setProfileMessage] = useState({ type: "", text: "" });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [passwordSubmitting, setPasswordSubmitting] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        
        const response = await axiosInstance.get("/auth/profile");
        const userData = response.data.user;

        setAccountInfo(userData);

        setProfileData({
          name: userData.name,
          email: userData.email,
        });

      } catch (err) {
        setProfileMessage({ type: "danger", text: "Failed to load profile" });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));

    if (profileErrors[name]) {
      setProfileErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateProfile = () => {
    const newErrors = {};

    if (!profileData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (profileData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    if (!profileData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(profileData.email)) {
      newErrors.email = "Enter a valid email";
    }

    setProfileErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    
    setProfileMessage({ type: "", text: "" });

    if (!validateProfile()) return;

    setProfileSubmitting(true);

    try {
      
      const response = await axiosInstance.put("/auth/profile", profileData);

      const { user: updatedUser, token } = response.data;

      localStorage.setItem("token", token);
      updateUser(updatedUser);

      setAccountInfo((prev) => ({ ...prev, ...updatedUser }));

      setProfileMessage({ type: "success", text: "Profile updated successfully!" });

    } catch (err) {
      const message = err.response?.data?.message || "Failed to update profile";
      setProfileMessage({ type: "danger", text: message });
    } finally {
      setProfileSubmitting(false);
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));

    if (passwordErrors[name]) {
      setPasswordErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validatePassword = () => {
    const newErrors = {};

    if (!passwordData.currentPassword) {
      newErrors.currentPassword = "Current password is required";
    }

    if (!passwordData.newPassword) {
      newErrors.newPassword = "New password is required";
    } else if (passwordData.newPassword.length < 6) {
      newErrors.newPassword = "New password must be at least 6 characters";
    }

    if (passwordData.newPassword !== passwordData.confirmNewPassword) {
      newErrors.confirmNewPassword = "Passwords do not match";
    }

    setPasswordErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordMessage({ type: "", text: "" });

    if (!validatePassword()) return;

    setPasswordSubmitting(true);

    try {
      await axiosInstance.put("/auth/change-password", {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      setPasswordMessage({ type: "success", text: "Password changed successfully!" });

      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: "",
      });

    } catch (err) {
      const message = err.response?.data?.message || "Failed to change password";
      setPasswordMessage({ type: "danger", text: message });
    } finally {
      setPasswordSubmitting(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div>
      <h1 className="page-title">Profile</h1>
      <p className="page-subtitle">Manage your account settings</p>

      {/* ACCOUNT INFORMATION*/}
      <div className="card-box">
        <h3>Account Information</h3>

        <div className="info-grid">
          <div className="info-item">
            <span className="info-label">Account ID</span>
            <span className="info-value">{accountInfo?._id}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Member Since</span>
            <span className="info-value">{formatDate(accountInfo?.createdAt)}</span>
          </div>
        </div>
      </div>

      {/* UPDATE PROFILE */}
      <div className="card-box">
        <h3>Update Profile</h3>

        {profileMessage.text && (
          <div className={`alert alert-${profileMessage.type}`}>
            {profileMessage.text}
          </div>
        )}

        <form onSubmit={handleProfileSubmit}>
          {/* ---- NAME ---- */}
          <div className="form-group">
            <label className="form-label" htmlFor="name">Full Name</label>
            <input
              type="text"
              id="name"
              name="name"
              className={`form-input ${profileErrors.name ? "error" : ""}`}
              value={profileData.name}
              onChange={handleProfileChange}
            />
            {profileErrors.name && <p className="form-error">{profileErrors.name}</p>}
          </div>

          {/* ---- EMAIL ---- */}
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              className={`form-input ${profileErrors.email ? "error" : ""}`}
              value={profileData.email}
              onChange={handleProfileChange}
            />
            {profileErrors.email && <p className="form-error">{profileErrors.email}</p>}
          </div>

          <button type="submit" className="btn btn-primary" disabled={profileSubmitting}>
            {profileSubmitting ? <span className="spinner"></span> : "Update Profile"}
          </button>
        </form>
      </div>

      {/* CHANGE PASSWORD */}
      <div className="card-box">
        <h3>Change Password</h3>

        {passwordMessage.text && (
          <div className={`alert alert-${passwordMessage.type}`}>
            {passwordMessage.text}
          </div>
        )}

        <form onSubmit={handlePasswordSubmit}>
          {/* ---- CURRENT PASSWORD ---- */}
          <div className="form-group">
            <label className="form-label" htmlFor="currentPassword">Current Password</label>
            <input
              type="password"
              id="currentPassword"
              name="currentPassword"
              className={`form-input ${passwordErrors.currentPassword ? "error" : ""}`}
              value={passwordData.currentPassword}
              onChange={handlePasswordChange}
            />
            {passwordErrors.currentPassword && (
              <p className="form-error">{passwordErrors.currentPassword}</p>
            )}
          </div>

          {/* ---- NEW PASSWORD ---- */}
          <div className="form-group">
            <label className="form-label" htmlFor="newPassword">New Password</label>
            <input
              type="password"
              id="newPassword"
              name="newPassword"
              className={`form-input ${passwordErrors.newPassword ? "error" : ""}`}
              placeholder="At least 6 characters"
              value={passwordData.newPassword}
              onChange={handlePasswordChange}
            />
            {passwordErrors.newPassword && (
              <p className="form-error">{passwordErrors.newPassword}</p>
            )}
          </div>

          {/* ---- CONFIRM NEW PASSWORD ---- */}
          <div className="form-group">
            <label className="form-label" htmlFor="confirmNewPassword">Confirm New Password</label>
            <input
              type="password"
              id="confirmNewPassword"
              name="confirmNewPassword"
              className={`form-input ${passwordErrors.confirmNewPassword ? "error" : ""}`}
              value={passwordData.confirmNewPassword}
              onChange={handlePasswordChange}
            />
            {passwordErrors.confirmNewPassword && (
              <p className="form-error">{passwordErrors.confirmNewPassword}</p>
            )}
          </div>

          <button type="submit" className="btn btn-primary" disabled={passwordSubmitting}>
            {passwordSubmitting ? <span className="spinner"></span> : "Change Password"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;