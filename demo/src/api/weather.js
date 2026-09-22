import { apiRequest } from "./client";

export function fetchWeather(regionId) {
  return apiRequest("/api/v1/weather/current", {
    auth: false,
    query: { region_id: regionId },
  });
}
