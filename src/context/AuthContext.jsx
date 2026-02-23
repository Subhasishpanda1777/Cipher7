'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { fetchCurrentUser, logoutUser } from "@/lib/authClient";

const AuthContext = createContext({
  status: "loading",
  user: null,
  refreshUser: async () => {},
  setUser: () => {},
  logout: async () => {},
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState("loading");

  const refreshUser = useCallback(async () => {
    setStatus("loading");
    try {
      const response = await fetchCurrentUser();
      const fetchedUser = response?.data || null;
      if (fetchedUser) {
        setUser(fetchedUser);
        setStatus("authenticated");
      } else {
        setUser(null);
        setStatus("unauthenticated");
      }
    } catch (error) {
      setUser(null);
      setStatus("unauthenticated");
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const logout = useCallback(async () => {
    try {
      await logoutUser();
    } finally {
      setUser(null);
      setStatus("unauthenticated");
    }
  }, []);

  const value = useMemo(
    () => ({ status, user, refreshUser, setUser, logout }),
    [status, user, refreshUser, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
