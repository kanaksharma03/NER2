import { apiRequest } from "./client";

export function fetchImpactedRoads(regionId) {
  return apiRequest("/api/v1/roads-impacted", {
    auth: false,
    query: { region_id: regionId },
  });
}
