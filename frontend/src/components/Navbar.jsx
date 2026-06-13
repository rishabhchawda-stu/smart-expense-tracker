import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Navbar.css";

const Navbar = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();           
    navigate("/login");
  };

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")          
      .map((word) => word[0])  
      .join("")             
      .toUpperCase()
      .slice(0, 2);         
  };

  return (
    <header className="navbar">
      
      <button className="navbar-menu-btn" onClick={onMenuClick} aria-label="Toggle menu">
        ☰
      </button>

      {/* PAGE TITLE */}
      <div className="navbar-spacer"></div>

      {/* ---- USER INFO ---- */}
      <div className="navbar-user">
        <div className="navbar-avatar">{getInitials(user?.name)}</div>
        <span className="navbar-username">{user?.name}</span>

        <button className="btn btn-secondary navbar-logout" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </header>
  );
};

export default Navbar;