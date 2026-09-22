import { apiRequest, setSession, clearSession } from "./client";

export async function login(username, password) {
  const form = new URLSearchParams();
  form.set("username", username);
  form.set("password", password);
  form.set("grant_type", "password");
  const data = await apiRequest("/api/v1/token", {
    method: "POST",
    auth: false,
    formData: form,
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });
  setSession(data.access_token, {
    username,
    role: data.role,
    tokenType: data.token_type,
  });
  return data;
}

export function logout() {
  clearSession();
}
