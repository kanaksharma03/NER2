import { useState } from "react";
import { submitReport } from "../api/reports";
import { useOps } from "../context/OperationalContext";
import LoadingState, { EmptyState, ErrorState } from "./States";

const TYPES = ["Rockfall", "Mudslide", "Tension Cracks", "Blockage"];

export default function CitizenReportForm() {
  const { regionId, cursor } = useOps();
  const [type, setType] = useState(TYPES[0]);
  const [description, setDescription] = useState("");
  const [lat, setLat] = useState("");
  const [lon, setLon] = useState("");
  const [photo, setPhoto] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  function useMapPoint() {
    if (!cursor) return;
    setLat(cursor.lat.toFixed(6));
    setLon(cursor.lon.toFixed(6));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setResult(null);
    try {
      const form = new FormData();
      form.append("type", type);
      form.append("description", description);
      form.append("lat", lat);
      form.append("lon", lon);
      if (regionId != null) form.append("region_id", String(regionId));
      if (!photo) throw new Error("A photo is required by the backend.");
      form.append("photo", photo);
      const data = await submitReport(form);
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="card" style={{ display: "grid", gap: 10 }}>
      <label>
        Incident type
        <select className="select" value={type} onChange={(e) => setType(e.target.value)}>
          {TYPES.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
      </label>
      <label>
        Description
        <textarea className="textarea" value={description} onChange={(e) => setDescription(e.target.value)} required />
      </label>
      <div className="metric-row">
        <label>
          Latitude
          <input className="input" value={lat} onChange={(e) => setLat(e.target.value)} required />
        </label>
        <label>
          Longitude
          <input className="input" value={lon} onChange={(e) => setLon(e.target.value)} required />
        </label>
      </div>
      <button className="btn secondary" type="button" onClick={useMapPoint}>
        Use map cursor
      </button>
      <label>
        Photo
        <input className="input" type="file" accept="image/*" onChange={(e) => setPhoto(e.target.files?.[0] || null)} />
      </label>
      <button className="btn" type="submit" disabled={busy}>
        {busy ? "Submitting…" : "Submit report"}
      </button>
      {error && <ErrorState message={error} />}
      {result && (
        <div>
          <p>
            Submission {result.status}. Spoof flag: {String(result.is_spoofed)}. Cluster ID:{" "}
            {result.cluster_id ?? "not assigned"}
          </p>
          <p className="disclaimer">Verification performed by NER-DRISHTI backend (EXIF). This interface does not verify images locally.</p>
        </div>
      )}
    </form>
  );
}

export function ReportList() {
  const { reports, setSelectedCluster, clusters, requestFly, openFeature, setSelectedReport } = useOps();
  if (reports.loading) return <LoadingState />;
  if (reports.error) return <ErrorState message="Unable to retrieve field reports." />;
  if (!reports.data?.length) return <EmptyState message="No active incidents in this region." />;

  return (
    <div>
      {reports.data.map((report) => (
        <div className="list-item" key={report.id} onClick={() => { setSelectedReport(report); openFeature({ type: "report", payload: report }); }} role="button" tabIndex={0}>
          <h3>
            {report.report_type} <span className="badge live">{report.status}</span>
          </h3>
          <p>{report.description}</p>
          <div className="meta">
            <span className="badge derived">ID {report.id}</span>
            {report.created_at && <span className="badge hist">{report.created_at}</span>}
          </div>
        </div>
      ))}
      <h3 className="panel-kicker">Derived 300 m groupings</h3>
      <p className="disclaimer">
        Cluster IDs are not returned by GET /reports. These groups are derived from report coordinates using the backend’s 300 m rule.
      </p>
      {clusters.map((cluster) => (
        <div
          className="list-item"
          key={cluster.key}
          onClick={() => {
            setSelectedCluster(cluster);
            requestFly({ center: [cluster.lon, cluster.lat], zoom: 13 });
          }}
          role="button"
          tabIndex={0}
        >
          <h3>
            {cluster.count} report{cluster.count > 1 ? "s" : ""} · {cluster.types.join(", ") || "type unavailable"}
          </h3>
          <p>
            Approx. {cluster.lat.toFixed(4)}, {cluster.lon.toFixed(4)}
          </p>
        </div>
      ))}
    </div>
  );
}
