import { useOps } from "../context/OperationalContext";
import LoadingState, { ErrorState } from "./States";

export default function OperationalSummary() {
  const { grid, counts, roads, alerts, reports } = useOps();
  if (grid.loading) return <LoadingState />;
  if (grid.error) return <ErrorState message="Unable to retrieve risk data." />;

  const high = counts.HIGH;
  const critical = counts.CRITICAL;
  const roadCount = roads.data?.impacted_segments?.length;
  const alertCount = alerts.data?.length;
  const verified = reports.data?.length;

  return (
    <div className="metric-row">
      <div className="metric">
        <div className="label">High-risk cells</div>
        <div className="value" style={{ color: "var(--high)" }}>{grid.data ? high : "Data unavailable"}</div>
      </div>
      <div className="metric">
        <div className="label">Critical cells</div>
        <div className="value" style={{ color: "var(--critical)" }}>{grid.data ? critical : "Data unavailable"}</div>
      </div>
      <div className="metric">
        <div className="label">Impacted roads</div>
        <div className="value">{roads.error ? "Data unavailable" : roadCount ?? (roads.loading ? "…" : 0)}</div>
      </div>
      <div className="metric">
        <div className="label">Alerts returned</div>
        <div className="value">{alerts.error ? "Data unavailable" : alertCount ?? 0}</div>
      </div>
      <div className="metric">
        <div className="label">Field reports</div>
        <div className="value">{reports.error ? "Data unavailable" : verified ?? 0}</div>
        <div className="hint">Backend active clusters only</div>
      </div>
      <div className="metric">
        <div className="label">Grid cells</div>
        <div className="value">{grid.data?.features?.length ?? 0}</div>
        <div className="hint">NER-DRISHTI ML · derived</div>
      </div>
    </div>
  );
}
