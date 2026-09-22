import { useMemo, useState } from "react";
import { useOps } from "../context/OperationalContext";
import { severityClass } from "../utils/risk";
import LoadingState, { EmptyState, ErrorState } from "./States";

export default function AlertPanel({ compact = false }) {
  const { alerts, openFeature, setSelectedAlert } = useOps();
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState("all");

  const items = alerts.data || [];
  const filtered = useMemo(() => {
    if (filter === "authority") return items.filter((a) => String(a.audience_tier).toLowerCase().includes("auth"));
    if (filter === "public") return items.filter((a) => String(a.audience_tier).toLowerCase().includes("public"));
    return items;
  }, [items, filter]);

  if (alerts.loading) return <LoadingState />;
  if (alerts.error) return <ErrorState message="Unable to retrieve alerts." />;
  if (!items.length) return <EmptyState message="No alerts returned by the backend." />;

  return (
    <div>
      <div className="btn-row" style={{ marginBottom: 10 }}>
        <button className={`btn ${filter === "all" ? "" : "secondary"}`} type="button" onClick={() => setFilter("all")}>
          Active ({items.length})
        </button>
        <button className={`btn ${filter === "authority" ? "" : "secondary"}`} type="button" onClick={() => setFilter("authority")}>
          Authority
        </button>
        <button className={`btn ${filter === "public" ? "" : "secondary"}`} type="button" onClick={() => setFilter("public")}>
          Public
        </button>
      </div>
      {filtered.length === 0 && <EmptyState message="No alerts in this audience." />}
      {filtered.slice(0, compact ? 4 : filtered.length).map((alert) => (
        <div key={alert.id} className="list-item" onClick={() => { setSelected(alert); setSelectedAlert(alert); openFeature({ type: "alert", payload: alert }); }} role="button" tabIndex={0}>
          <h3>
            <span className={`badge ${severityClass(alert.severity_tier)}`}>{alert.severity_tier}</span>{" "}
            {alert.audience_tier} · {alert.channel}
          </h3>
          <p>{alert.message_payload}</p>
          <div className="meta">
            <span className="badge derived">{alert.sent_at || "no timestamp"}</span>
          </div>
        </div>
      ))}
      {selected && (
        <div className="card" style={{ marginTop: 8 }}>
          <strong>Alert {selected.id}</strong>
          <p>{selected.message_payload}</p>
          <p className="disclaimer">
            {selected.audience_tier} · {selected.channel} · {selected.sent_at || "no timestamp"}
          </p>
          <button className="btn secondary" type="button" onClick={() => setSelected(null)}>
            Close
          </button>
        </div>
      )}
    </div>
  );
}
