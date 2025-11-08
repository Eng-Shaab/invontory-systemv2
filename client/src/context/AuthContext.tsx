"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

interface AuthUser {
  id: string;
  email: string;
  role: "ADMIN" | "USER";
  name: string | null;
}

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

interface LoginResponse {
  pendingToken: string;
  message: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  status: AuthStatus;
  login: (email: string, password: string) => Promise<LoginResponse>;
  verifyCode: (pendingToken: string, code: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "/api";

const fetchJson = async <T,>(input: RequestInfo, init?: RequestInit): Promise<T> => {
  const response = await fetch(input, init);

  const contentType = response.headers.get("content-type");
  const isJson = contentType?.includes("application/json");
  const payload = isJson ? await response.json() : undefined;

  if (!response.ok) {
    const message = isJson && payload && typeof payload.message === "string" ? payload.message : "Request failed";
    throw new Error(message);
  }

  return (payload ?? {}) as T;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");

  const refreshUser = useCallback(async () => {
    try {
      const data = await fetchJson<{ user: AuthUser }>(`${API_BASE_URL}/auth/me`, {
        method: "GET",
        credentials: "include",
      });
      setUser(data.user);
      setStatus("authenticated");
    } catch (error) {
      setUser(null);
      setStatus("unauthenticated");
    }
  }, []);

  useEffect(() => {
    void refreshUser();
  }, [refreshUser]);

  const login = useCallback(async (email: string, password: string) => {
    const data = await fetchJson<LoginResponse>(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });
    return data;
  }, []);

  const verifyCode = useCallback(async (pendingToken: string, code: string) => {
    const data = await fetchJson<{ user: AuthUser }>(`${API_BASE_URL}/auth/verify-otp`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ pendingToken, code }),
    });

    setUser(data.user);
    setStatus("authenticated");
  }, []);

  const logout = useCallback(async () => {
    await fetchJson(`${API_BASE_URL}/auth/logout`, {
      method: "POST",
      credentials: "include",
    });

    setUser(null);
    setStatus("unauthenticated");
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      status,
      login,
      verifyCode,
      logout,
      refreshUser,
    }),
    [logout, login, refreshUser, status, user, verifyCode],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
