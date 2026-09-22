import { apiRequest } from "./client";

export function setRainSimulation(enable) {
  return apiRequest("/api/v1/simulate/rain", {
    method: "POST",
    query: { enable },
  });
}
