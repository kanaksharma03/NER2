import { useMemo } from "react";
import { useOps } from "../context/OperationalContext";
import { classifyProbability, formatPct, readableFeature } from "../utils/risk";

export default function FeatureDetailDrawer() {
  const { selectedFeature, pointRisk, selectedCell, selectedRoad, selectedReport, selectedAlert, route, closeFeature } = useOps();

  const detail = useMemo(() => {
    if (!selectedFeature) return null;
    return selectedFeature;
  }, [selectedFeature]);

  if (!detail) {
    return null;
  }

  if (detail.type === "risk") {
    return <RiskDrawer detail={detail} pointRisk={pointRisk} selectedCell={selectedCell} closeFeature={closeFeature} />;
  }

  if (detail.type === "road") {
    return <RoadDrawer detail={detail} closeFeature={closeFeature} />;
  }

  if (detail.type === "report") {
    return <ReportDrawer detail={detail} closeFeature={closeFeature} />;
  }

  if (detail.type === "alert") {
    return <AlertDrawer detail={detail} closeFeature={closeFeature} />;
  }

  if (detail.type === "route") {
    return <RouteDrawer detail={detail} route={route} closeFeature={closeFeature} />;
  }

  return null;
}

function RiskDrawer({ detail, pointRisk, selectedCell, closeFeature }) {
  const feature = detail.payload;
  const probability = feature?.properties?.probability ?? pointRisk.data?.probability ?? pointRisk.data?.risk_probability;
  const riskCategory = classifyProbability(probability);
  const coords = feature?.geometry?.coordinates?.[0];
  const cellLatLon = coords && coords.length ? getCellCenter(coords) : null;
  const topDrivers = pointRisk.data?.top_factors || [];

  return (
    <aside className="feature-drawer open" aria-live="polite">
      <div className="drawer-head">
        <div>
          <span className="drawer-kicker">Risk cell</span>
          <h3>Risk assessment</h3>
        </div>
        <button className="drawer-close" type="button" onClick={closeFeature}>×</button>
      </div>

      {pointRisk.loading && (
        <div className="drawer-state">
          <strong>Loading risk assessment...</strong>
        </div>
      )}

      {pointRisk.error && (
        <div className="drawer-state error">
          <strong>Unable to load feature details.</strong>
          <button className="btn secondary" type="button" onClick={() => window.location.reload()}>Retry</button>
        </div>
      )}

      {!pointRisk.loading && !pointRisk.error && (
        <>
          <div className="drawer-stats">
            <div className="drawer-stat">
              <span>Probability</span>
              <strong>{formatPct(probability)}</strong>
            </div>
            <div className="drawer-stat">
              <span>Category</span>
              <strong className={`drawer-tag ${riskCategory.toLowerCase()}`}>{riskCategory}</strong>
            </div>
          </div>

          <div className="drawer-block">
            <h4>Location</h4>
            <p>{cellLatLon ? `${cellLatLon.lat.toFixed(5)}, ${cellLatLon.lon.toFixed(5)}` : "Location unavailable"}</p>
            <p className="dim">Region: {selectedCell?.region_name || "Current corridor"}</p>
          </div>

          <div className="drawer-block">
            <h4>Why this risk?</h4>
            {topDrivers.length ? (
              topDrivers.map((driver) => (
                <div key={`${driver.feature}-${driver.contribution}`} className="driver-row">
                  <div className="driver-meta">
                    <span>{readableFeature(driver.feature)}</span>
                    <strong>{driver.contribution != null ? Number(driver.contribution).toFixed(3) : "—"}</strong>
                  </div>
                  <div className="driver-bar">
                    <span style={{ width: `${Math.min(100, Math.abs(Number(driver.contribution || 0)) * 120)}%` }} />
                  </div>
                </div>
              ))
            ) : (
              <p className="dim">No SHAP drivers returned by the backend for this location.</p>
            )}
          </div>

          <div className="drawer-block">
            <h4>Operational interpretation</h4>
            <p>
              This risk assessment is decision support only. It is not a deterministic landslide prediction and should be used with field inspection and local authority context.
            </p>
          </div>
        </>
      )}
    </aside>
  );
}

function RoadDrawer({ detail, closeFeature }) {
  const road = detail.payload;
  return (
    <aside className="feature-drawer open">
      <div className="drawer-head">
        <div>
          <span className="drawer-kicker">Road segment</span>
          <h3>{road?.name || "Road impact"}</h3>
        </div>
        <button className="drawer-close" type="button" onClick={closeFeature}>×</button>
      </div>
      <div className="drawer-block">
        <p><strong>Risk:</strong> {road?.risk_level || "Not provided"}</p>
        <p><strong>Highway:</strong> {road?.highway_class || "Not provided"}</p>
        <p><strong>Segment:</strong> {road?.affected_segment || "Not provided"}</p>
      </div>
    </aside>
  );
}

function ReportDrawer({ detail, closeFeature }) {
  const report = detail.payload;
  return (
    <aside className="feature-drawer open">
      <div className="drawer-head">
        <div>
          <span className="drawer-kicker">Field report</span>
          <h3>{report?.report_type || "Incident report"}</h3>
        </div>
        <button className="drawer-close" type="button" onClick={closeFeature}>×</button>
      </div>
      <div className="drawer-block">
        <p>{report?.description || "No description provided."}</p>
        <p><strong>Status:</strong> {report?.status || "unknown"}</p>
        <p><strong>Location:</strong> {report?.lat ?? "—"}, {report?.lon ?? "—"}</p>
        <p><strong>Created:</strong> {report?.created_at || "Not recorded"}</p>
      </div>
    </aside>
  );
}

function AlertDrawer({ detail, closeFeature }) {
  const alert = detail.payload;
  return (
    <aside className="feature-drawer open">
      <div className="drawer-head">
        <div>
          <span className="drawer-kicker">Alert</span>
          <h3>{alert?.severity_tier || "Alert"}</h3>
        </div>
        <button className="drawer-close" type="button" onClick={closeFeature}>×</button>
      </div>
      <div className="drawer-block">
        <p>{alert?.message_payload || "No message returned by backend."}</p>
        <p><strong>Audience:</strong> {alert?.audience_tier || "unknown"}</p>
        <p><strong>Channel:</strong> {alert?.channel || "unknown"}</p>
        <p><strong>Sent:</strong> {alert?.sent_at || "Not recorded"}</p>
      </div>
    </aside>
  );
}

function RouteDrawer({ detail, route, closeFeature }) {
  const data = detail.payload || route.data;
  return (
    <aside className="feature-drawer open">
      <div className="drawer-head">
        <div>
          <span className="drawer-kicker">Safe route</span>
          <h3>{data?.corridor || "Safe route"}</h3>
        </div>
        <button className="drawer-close" type="button" onClick={closeFeature}>×</button>
      </div>
      <div className="drawer-block">
        <p><strong>Status:</strong> {data?.status || "Unavailable"}</p>
        <p><strong>Primary blocked:</strong> {data?.is_primary_blocked ? "Yes" : "No"}</p>
        <p><strong>Avoided segment:</strong> {data?.avoided_segment || "Not provided"}</p>
        <p><strong>Distance:</strong> {data?.distance_km != null ? `${data.distance_km} km` : "Unavailable"}</p>
        <p><strong>Estimated time:</strong> {data?.estimated_time_min != null ? `${data.estimated_time_min} min` : "Unavailable"}</p>
      </div>
    </aside>
  );
}

function getCellCenter(coords) {
  if (!Array.isArray(coords) || !coords.length) return null;
  const xs = coords.map((c) => c[0]);
  const ys = coords.map((c) => c[1]);
  return {
    lon: (Math.min(...xs) + Math.max(...xs)) / 2,
    lat: (Math.min(...ys) + Math.max(...ys)) / 2,
  };
}
