import { apiRequest } from "./client";

export function fetchRegions() {
  return apiRequest("/api/v1/regions", { auth: false });
}
