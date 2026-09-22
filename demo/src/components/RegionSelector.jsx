import { useOps } from "../context/OperationalContext";

export default function RegionSelector() {
  const { regions, regionId, setRegionId } = useOps();
  if (regions.loading) return <span className="user-chip">Loading regions…</span>;
  if (regions.error) return <span className="user-chip">Regions unavailable</span>;
  if (!regions.data?.length) return <span className="user-chip">No regions returned</span>;

  return (
    <select
      className="select"
      style={{ maxWidth: 360, background: "#1e3a2f", color: "#f4f1ea", borderColor: "#5b6f65" }}
      value={regionId ?? ""}
      onChange={(e) => setRegionId(Number(e.target.value))}
      aria-label="Select corridor region"
    >
      {regions.data.map((region) => (
        <option key={region.id} value={region.id}>
          {region.state} — {region.corridor_name}
        </option>
      ))}
    </select>
  );
}
