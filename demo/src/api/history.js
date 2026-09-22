import { apiRequest } from "./client";

export function fetchHistoryReplay(eventId) {
  return apiRequest("/api/v1/history/replay", {
    auth: false,
    query: eventId ? { event_id: eventId } : undefined,
  });
}
