export const RISK_COLORS = {
  LOW: "#3d7a58",
  MODERATE: "#c49a2c",
  HIGH: "#c56a2d",
  CRITICAL: "#b33a32",
};

export function classifyProbability(probability) {
  const p = Number(probability);
  if (!Number.isFinite(p)) return "LOW";
  if (p < 0.2) return "LOW";
  if (p <= 0.5) return "MODERATE";
  if (p <= 0.8) return "HIGH";
  return "CRITICAL";
}

export function formatPct(probability) {
  if (probability == null || Number.isNaN(Number(probability))) return "Data unavailable";
  return `${(Number(probability) * 100).toFixed(1)}%`;
}

export function severityClass(value) {
  const key = String(value || "").toUpperCase();
  if (key.includes("CRIT")) return "critical";
  if (key.includes("HIGH")) return "high";
  if (key.includes("MOD")) return "moderate";
  if (key.includes("LOW")) return "low";
  return "low";
}

export function countRiskCells(features = []) {
  const counts = { LOW: 0, MODERATE: 0, HIGH: 0, CRITICAL: 0 };
  features.forEach((f) => {
    const tier = classifyProbability(f?.properties?.probability);
    counts[tier] += 1;
  });
  return counts;
}

export function explanationSentence(detail) {
  if (!detail?.top_factors?.length) return null;
  const drivers = detail.top_factors
    .filter((f) => f.is_positive_driver)
    .sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution))
    .slice(0, 2)
    .map((f) => readableFeature(f.feature));
  if (!drivers.length) return "Predicted risk is not strongly associated with the returned positive drivers.";
  if (drivers.length === 1) {
    return `Predicted risk is primarily associated with ${drivers[0]}.`;
  }
  return `Predicted risk is primarily associated with ${drivers[0]} and ${drivers[1]}.`;
}

export function readableFeature(name) {
  const map = {
    historical_rain_3d: "72h rainfall",
    rainfall_72h: "72h rainfall",
    rainfall_24h: "24h rainfall",
    slope: "slope",
    elevation: "elevation",
    soil_moisture: "soil moisture",
    distance_to_road: "distance to road",
    twi: "topographic wetness",
  };
  return map[name] || String(name || "").split("_").join(" ");
}
