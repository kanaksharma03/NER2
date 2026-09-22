import {
  MOCK_REGIONS,
  getMockGrid,
  getMockSafeRoute,
  getMockWeather,
  getMockRoads,
  getMockReports,
  getMockAlerts,
  getMockHistory,
  getMockPointRisk,
} from "./mockData";

const TOKEN_KEY = "ner_drishti_token";
const USER_KEY = "ner_drishti_user";

export class ApiError extends Error {
  constructor(message, status, payload) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
  }
}

export function getApiBase() {
  return import.meta.env.VITE_API_BASE_URL || "http://localhost:8001";
}

export function getToken() {
  return sessionStorage.getItem(TOKEN_KEY) || "mock-token-demo";
}

export function getStoredUser() {
  const raw = sessionStorage.getItem(USER_KEY);
  if (!raw) return { username: "admin", role: "operator" };
  try {
    return JSON.parse(raw);
  } catch {
    return { username: "admin", role: "operator" };
  }
}

export function setSession(token, user) {
  if (token) sessionStorage.setItem(TOKEN_KEY, token);
  if (user) sessionStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession() {
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(USER_KEY);
}

function getMockFallback(path, query) {
  if (path.includes("/api/v1/regions")) return MOCK_REGIONS;
  if (path.includes("/api/v1/risk/grid")) {
    return getMockGrid(query?.region_id || 1, Number(query?.rainfall_delta || 0));
  }
  if (path.includes("/api/v1/routes/safe")) {
    return getMockSafeRoute(query?.region_id || 1);
  }
  if (path.includes("/api/v1/weather")) return getMockWeather(query?.region_id || 1);
  if (path.includes("/api/v1/roads-impacted")) return getMockRoads(query?.region_id || 1);
  if (path.includes("/api/v1/reports")) return getMockReports(query?.region_id || 1);
  if (path.includes("/api/v1/alerts")) return getMockAlerts();
  if (path.includes("/api/v1/history")) return getMockHistory();
  if (path.includes("/api/v1/token")) {
    return { access_token: "mock-token-demo", token_type: "bearer", role: "operator" };
  }
  if (path.includes("/api/v1/risk")) return getMockPointRisk(query?.lat, query?.lon);
  if (path.includes("/api/v1/simulation")) return { status: "ok", simulate_rain_spike: true };
  return null;
}

export async function apiRequest(path, options = {}) {
  const {
    method = "GET",
    query,
    body,
    formData,
    auth = true,
    headers = {},
  } = options;

  const baseUrl = getApiBase();
  const url = new URL(path, baseUrl || window.location.origin);
  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.set(key, String(value));
      }
    });
  }

  const token = getToken();
  const nextHeaders = { ...headers };
  if (auth && token) nextHeaders.Authorization = `Bearer ${token}`;
  if (body && !formData) nextHeaders["Content-Type"] = "application/json";

  let response;
  try {
    response = await fetch(url.toString(), {
      method,
      headers: nextHeaders,
      body: formData || (body ? JSON.stringify(body) : undefined),
    });
  } catch {
    const mock = getMockFallback(path, query);
    if (mock !== null) return mock;
    throw new ApiError("Network unavailable", 0, null);
  }

  if (response.status === 401 || response.status === 403) {
    const mock = getMockFallback(path, query);
    if (mock !== null) return mock;
    const err = await safeJson(response);
    throw new ApiError(
      response.status === 403 ? "Access denied" : "Session expired",
      response.status,
      err
    );
  }

  if (!response.ok) {
    const mock = getMockFallback(path, query);
    if (mock !== null) return mock;
    const err = await safeJson(response);
    throw new ApiError(
      err?.detail || err?.message || `Request failed (${response.status})`,
      response.status,
      err
    );
  }

  if (response.status === 204) return null;
  const data = await safeJson(response);
  return unwrapApiPayload(data);
}

function unwrapApiPayload(data) {
  if (!data || typeof data !== "object" || Array.isArray(data)) return data;
  if (Object.prototype.hasOwnProperty.call(data, "value")) {
    const { value, ...rest } = data;
    if (Object.keys(rest).length === 0 || Object.keys(rest).every((key) => ["Count", "count"].includes(key))) {
      return value;
    }
  }
  return data;
}

async function safeJson(response) {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
}

