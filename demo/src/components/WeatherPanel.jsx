import { useOps } from "../context/OperationalContext";
import LoadingState, { EmptyState, ErrorState } from "./States";

export default function WeatherPanel() {
  const { weather } = useOps();
  if (weather.loading) return <LoadingState />;
  if (weather.error) return <ErrorState message="Weather telemetry unavailable" />;
  if (!weather.data) return <EmptyState message="Weather telemetry unavailable" />;

  const items = [
    ["Rainfall — 1h", weather.data.rainfall_1h, "mm"],
    ["Rainfall — 24h", weather.data.rainfall_24h, "mm"],
    ["Rainfall — 72h", weather.data.rainfall_72h, "mm"],
    ["Soil moisture", weather.data.soil_moisture, ""],
  ];

  return (
    <div>
      <div className="metric-row">
        {items.map(([label, value, unit]) => (
          <div className="metric" key={label}>
            <div className="label">{label}</div>
            <div className="value">
              {value == null ? "Data unavailable" : formatMetric(value, unit)}
            </div>
          </div>
        ))}
      </div>
      <div className="source-tag">
        <span>Open-Meteo — LIVE</span>
        <span>{weather.data.updated_at || "no timestamp"}</span>
      </div>
    </div>
  );
}

function formatMetric(value, unit) {
  if (typeof value !== "number") return value ?? "Data unavailable";
  const cleaned = Number(value);
  const numeric = Number.isFinite(cleaned) ? cleaned : 0;
  const display = Number.isInteger(numeric) ? numeric.toString() : numeric.toFixed(1);
  return unit ? `${display} ${unit}` : display;
}
