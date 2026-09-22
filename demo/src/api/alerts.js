import { apiRequest } from "./client";

export function fetchAlerts() {
  return apiRequest("/api/v1/alerts", { auth: false });
}
