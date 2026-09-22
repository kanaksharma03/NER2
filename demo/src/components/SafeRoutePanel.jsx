import { useOps } from "../context/OperationalContext";
import { boundsFromGeoJSON } from "../utils/geo";
import LoadingState, { EmptyState, ErrorState } from "./States";

export default function SafeRoutePanel() {
  const { route, requestFly, openFeature } = useOps();
  if (route.loading) return <LoadingState />;
  if (route.error) return <ErrorState message="Unable to retrieve safe route." />;
  if (!route.data) return <EmptyState message="No route returned for this region." />;

  const data = route.data;
  const bounds = boundsFromGeoJSON({
    type: "FeatureCollection",
    features: [data.primary_route, data.alternate_route].filter(Boolean),
  });

  return (
    <div>
      <div className="metric-row">
        <div className="metric">
          <div className="label">Corridor</div>
          <div className="value" style={{ fontSize: 16 }}>{data.corridor || "Unavailable"}</div>
        </div>
        <div className="metric">
          <div className="label">Primary status</div>
          <div className="value" style={{ fontSize: 15 }}>{data.status}</div>
        </div>
        <div className="metric">
          <div className="label">Distance</div>
          <div className="value">{data.distance_km != null ? `${data.distance_km} km` : "Data unavailable"}</div>
        </div>
        <div className="metric">
          <div className="label">Est. time</div>
          <div className="value">{data.estimated_time_min != null ? `${data.estimated_time_min} min` : "Data unavailable"}</div>
        </div>
      </div>
      <p style={{ fontSize: 13 }}>
        Avoided / hazard segment: <strong>{data.avoided_segment || "Not provided"}</strong>
      </p>
      <p style={{ fontSize: 13 }}>
        Primary blocked: <strong>{data.is_primary_blocked ? "Yes" : "No"}</strong>
      </p>
      <div className="btn-row">
        <button
          className="btn"
          type="button"
          onClick={() => {
            openFeature({ type: "route", payload: data });
            if (bounds) requestFly({ bounds });
            else if (data.center) requestFly({ center: data.center, zoom: 12 });
          }}
        >
          View on Map
        </button>
      </div>
    </div>
  );
}
