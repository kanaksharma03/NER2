import { useOps } from "../context/OperationalContext";
import { severityClass } from "../utils/risk";
import { boundsFromGeoJSON } from "../utils/geo";
import LoadingState, { EmptyState, ErrorState } from "./States";

export default function RoadImpactPanel() {
  const { roads, setSelectedRoad, selectedRoad, requestFly, route, openFeature } = useOps();
  if (roads.loading) return <LoadingState />;
  if (roads.error) return <ErrorState message="Unable to retrieve impacted roads." />;
  const segments = roads.data?.impacted_segments || [];
  if (!segments.length) return <EmptyState message="No impacted road segments returned for this region." />;

  return (
    <div>
      {segments.map((seg) => (
        <div
          key={`${seg.name}-${seg.affected_segment}`}
          className={`list-item ${selectedRoad?.name === seg.name ? "selected" : ""}`}
          onClick={() => {
            setSelectedRoad(seg);
            openFeature({ type: "road", payload: seg });
            const bounds = boundsFromGeoJSON(route.data?.primary_route
              ? { type: "FeatureCollection", features: [route.data.primary_route] }
              : null);
            if (bounds) requestFly({ bounds });
            else if (route.data?.center) requestFly({ center: route.data.center, zoom: 12 });
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") setSelectedRoad(seg);
          }}
          role="button"
          tabIndex={0}
        >
          <h3>
            {seg.name}{" "}
            <span className={`badge ${severityClass(seg.risk_level)}`}>{seg.risk_level}</span>
          </h3>
          <p>{seg.highway_class}</p>
          {seg.affected_segment && <p>{seg.affected_segment}</p>}
        </div>
      ))}
    </div>
  );
}
