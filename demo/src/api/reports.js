import { apiRequest } from "./client";

export function fetchReports(regionId) {
  return apiRequest("/api/v1/reports", {
    auth: false,
    query: { region_id: regionId },
  });
}

export function submitReport(formData) {
  return apiRequest("/api/v1/reports/submit", {
    method: "POST",
    formData,
  });
}
