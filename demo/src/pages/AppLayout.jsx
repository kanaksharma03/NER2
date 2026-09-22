import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { OperationalProvider, useOps } from "../context/OperationalContext";
import Header from "../components/Header";
import StatusBar from "../components/StatusBar";
import RiskMap from "../components/RiskMap";
import FeatureDetailDrawer from "../components/FeatureDetailDrawer";
import { useEffect } from "react";

function AppLayoutContent() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const {
    setSelectedFeature,
    setSelectedCell,
    setSelectedRoad,
    setSelectedCluster,
    setSelectedReport,
    setSelectedAlert,
  } = useOps();

  useEffect(() => {
    setSelectedFeature(null);
    setSelectedCell(null);
    setSelectedRoad(null);
    setSelectedCluster(null);
    setSelectedReport(null);
    setSelectedAlert(null);
  }, [location.pathname, setSelectedFeature, setSelectedCell, setSelectedRoad, setSelectedCluster, setSelectedReport, setSelectedAlert]);

  if (!isAuthenticated) return <Navigate to="/login" replace state={{ from: location }} />;

  return (
    <div className="app-shell">
      <Header />
      <div className="workspace">
        <RiskMap />
        <aside className="side-panel">
          <Outlet />
        </aside>
      </div>
      <FeatureDetailDrawer />
      <StatusBar />
    </div>
  );
}

export default function AppLayout() {
  return (
    <OperationalProvider>
      <AppLayoutContent />
    </OperationalProvider>
  );
}
