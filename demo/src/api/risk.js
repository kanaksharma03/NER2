import { apiRequest } from "./client";

export function fetchRiskGrid({ regionId, rainfallDelta } = {}) {
  return apiRequest("/api/v1/risk/grid", {
    auth: false,
    query: {
      region_id: regionId,
      rainfall_delta: rainfallDelta,
    },
  });
}

export function fetchPointRisk(lat, lon) {
  return apiRequest("/api/v1/risk", {
    query: { lat, lon },
  });
}
