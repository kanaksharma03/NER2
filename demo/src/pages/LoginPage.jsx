import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Logo from "../components/Logo";

export default function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  if (isAuthenticated) return <Navigate to="/" replace />;

  async function onSubmit(e) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await login(username, password);
    } catch (err) {
      setError(err.message || "Unable to authenticate.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="login-wrap">
      <div className="login-card">
        <div className="login-hero">
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <Logo size={48} />
            <div>
              <div className="brand-name">NER-DRISHTI</div>
              <div className="brand-sub">North Eastern Region · Drishti</div>
            </div>
          </div>
          <p>
            Authority access to the landslide early-warning command center for NH-13, NH-10 and NH-6 corridors.
          </p>
        </div>
        <form className="login-body" onSubmit={onSubmit}>
          <label>
            Username
            <input className="input" value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" required />
          </label>
          <label>
            Password
            <input
              className="input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </label>
          {error && <div className="state">{error}</div>}
          <button className="btn" type="submit" disabled={busy}>
            {busy ? "Signing in…" : "Enter command center"}
          </button>
          <p className="disclaimer">
            Predicted risk is decision support only. NER-DRISHTI is not a replacement for IMD, GSI, or physical inspection.
          </p>
        </form>
      </div>
    </div>
  );
}
