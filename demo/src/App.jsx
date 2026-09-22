import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import LoginPage from "./pages/LoginPage";
import AppLayout from "./pages/AppLayout";
import CommandCenterPanel from "./pages/CommandCenterPanel";
import RiskMapPanel from "./pages/RiskMapPanel";
import RoadImpactPagePanel from "./pages/RoadImpactPagePanel";
import SafeRoutesPanel from "./pages/SafeRoutesPanel";
import FieldReportsPanel from "./pages/FieldReportsPanel";
import AlertsPanel from "./pages/AlertsPanel";
import SimulationPagePanel from "./pages/SimulationPagePanel";
import ReplayPanel from "./pages/ReplayPanel";

export default function App() {
  const { isAuthenticated } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<AppLayout />}>
        <Route index element={<CommandCenterPanel />} />
        <Route path="map" element={<RiskMapPanel />} />
        <Route path="roads" element={<RoadImpactPagePanel />} />
        <Route path="routes" element={<SafeRoutesPanel />} />
        <Route path="reports" element={<FieldReportsPanel />} />
        <Route path="alerts" element={<AlertsPanel />} />
        <Route path="simulation" element={<SimulationPagePanel />} />
        <Route path="replay" element={<ReplayPanel />} />
      </Route>
      <Route path="*" element={<Navigate to={isAuthenticated ? "/" : "/login"} replace />} />
    </Routes>
  );
}
