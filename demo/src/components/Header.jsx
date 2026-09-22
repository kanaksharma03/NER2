import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Logo from "./Logo";
import RegionSelector from "./RegionSelector";

const LINKS = [
  { to: "/", label: "Command Center" },
  { to: "/map", label: "Risk Map" },
  { to: "/roads", label: "Road Impact" },
  { to: "/routes", label: "Safe Routes" },
  { to: "/reports", label: "Field Reports" },
  { to: "/alerts", label: "Alerts" },
  { to: "/simulation", label: "Simulation" },
  { to: "/replay", label: "Historical Replay" },
];

export default function Header() {
  const { user, logout } = useAuth();

  return (
    <>
      <header className="header">
        <div className="brand">
          <Logo />
          <div className="brand-text">
            <span className="brand-name">NER-DRISHTI</span>
            <span className="brand-sub">Highway landslide decision support</span>
          </div>
        </div>
        <div className="header-center">
          <RegionSelector />
          <div className="loop-chip" aria-hidden="true">
            <span>Predict</span>
            <span>Explain</span>
            <span>Verify</span>
            <span>Prioritise</span>
            <span>Act</span>
          </div>
        </div>
        <div className="header-right">
          <span className="user-chip">
            {user?.username} · {user?.role || "Observer"}
          </span>
          <button className="btn ghost" type="button" onClick={logout}>
            Logout
          </button>
        </div>
      </header>
      <nav className="nav">
        {LINKS.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === "/"}
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
    </>
  );
}
