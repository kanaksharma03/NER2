import { apiRequest } from "./client";

export function fetchSafeRoute(regionId) {
  return apiRequest("/api/v1/routes/safe", {
    auth: false,
    query: { region_id: regionId },
  });
}
