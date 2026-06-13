import { NavLink } from "react-router-dom";
import "./Sidebar.css";
const Sidebar = () => {
  // ---- NAV ITEMS ----
  // array of objects — map() se loop karenge, future mein item add karna easy
  const navItems = [
    { path: "/dashboard", label: "Dashboard", icon: "📊" },
    { path: "/income", label: "Income", icon: "💰" },
    { path: "/expense", label: "Expense", icon: "💳" },
    { path: "/budget", label: "Budget", icon: "🎯" },
    { path: "/analytics", label: "Analytics", icon: "📈" },
    { path: "/reports", label: "Reports", icon: "🧾" },
    { path: "/profile", label: "Profile", icon: "👤" },
  ];

  return (
    <aside className="sidebar">
      {/* ---- LOGO / BRAND ---- */}
      <div className="sidebar-brand">
        <span className="sidebar-logo">💵</span>
        <span className="sidebar-title">ExpenseTracker</span>
      </div>

      {/* ---- NAV LINKS ---- */}
      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "sidebar-link-active" : ""}`
            }
          >
            <span className="sidebar-icon">{item.icon}</span>
            <span className="sidebar-label">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;