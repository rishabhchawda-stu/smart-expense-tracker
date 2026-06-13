import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./NotFound.css";

const NotFound = () => {
  
  const { isAuthenticated } = useAuth();

  return (
    <div className="notfound-page">
      <div className="notfound-content">
        <h1 className="notfound-code">404</h1>
        <h2 className="notfound-title">Page Not Found</h2>
        <p className="notfound-text">
          The page you're looking for doesn't exist or has been moved.
        </p>

        <Link to={isAuthenticated ? "/dashboard" : "/login"} className="btn btn-primary">
          {isAuthenticated ? "Back to Dashboard" : "Back to Login"}
        </Link>
      </div>
    </div>
  );
};

export default NotFound;