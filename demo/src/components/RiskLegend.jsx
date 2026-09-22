import { RISK_COLORS } from "../utils/risk";

export default function RiskLegend({ layers, onChange }) {
  const items = [
    ["LOW", "0–20%", RISK_COLORS.LOW],
    ["MODERATE", "20–50%", RISK_COLORS.MODERATE],
    ["HIGH", "50–80%", RISK_COLORS.HIGH],
    ["CRITICAL", "80–100%", RISK_COLORS.CRITICAL],
  ];

  const toggles = [
    ["risk", "Risk cells"],
    ["roads", "Roads"],
    ["impacted", "Impacted roads"],
    ["safeRoute", "Safe route"],
    ["reports", "Field reports"],
    ["clusters", "Incident clusters"],
  ];

  return (
    <aside className="legend" aria-label="Map legend">
      <h3>Predicted risk</h3>
      {items.map(([label, range, color]) => (
        <div className="swatch-row" key={label}>
          <span className="swatch" style={{ background: color }} />
          <span>
            {label} <span style={{ color: "var(--muted)" }}>{range}</span>
          </span>
        </div>
      ))}
      <div className="layer-toggles">
        {toggles.map(([key, label]) => (
          <label key={key}>
            <input
              type="checkbox"
              checked={Boolean(layers[key])}
              onChange={(e) => onChange({ ...layers, [key]: e.target.checked })}
            />
            {label}
          </label>
        ))}
      </div>
    </aside>
  );
}
