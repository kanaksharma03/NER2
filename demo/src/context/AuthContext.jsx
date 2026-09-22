import { createContext, useContext, useMemo, useState } from "react";
import { getStoredUser, getToken } from "../api/client";
import { login as loginRequest, logout as logoutRequest } from "../api/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getStoredUser());
  const [token, setToken] = useState(() => getToken());

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token),
      async login(username, password) {
        const data = await loginRequest(username, password);
        setToken(data.access_token);
        setUser({ username, role: data.role, tokenType: data.token_type });
        return data;
      },
      logout() {
        logoutRequest();
        setToken(null);
        setUser(null);
      },
    }),
    [user, token]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
