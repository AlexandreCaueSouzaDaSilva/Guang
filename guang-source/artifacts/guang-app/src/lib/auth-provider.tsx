import { useState, useEffect, ReactNode } from "react";
import { AuthContext } from "./auth";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem("guang_token")
  );

  useEffect(() => {
    if (token) {
      localStorage.setItem("guang_token", token);
    } else {
      localStorage.removeItem("guang_token");
    }
  }, [token]);

  const login = (newToken: string) => {
    localStorage.setItem("guang_token", newToken);
    setToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem("guang_token");
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ token, isAuthenticated: !!token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
