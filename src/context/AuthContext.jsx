import { createContext, useContext, useState, useCallback } from "react";
import api from "../api/axios";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("edugame_user");
    return saved ? JSON.parse(saved) : null;
  });

  const [token, setToken] = useState(() =>
    localStorage.getItem("edugame_token")
  );

  // Lưu user + token vào localStorage
  const persist = (nextUser, nextToken) => {
    setUser(nextUser);
    setToken(nextToken);
    localStorage.setItem("edugame_user", JSON.stringify(nextUser));
    localStorage.setItem("edugame_token", nextToken);
  };

  // ============================
  // LOGIN BẰNG GOOGLE
  // ============================
  const loginWithGoogle = useCallback(async (idToken) => {
    const { data } = await api.post("/auth/google", { idToken });
    persist(data.user, data.token);
    return data.user;
  }, []);

  // ============================
  // LOGOUT
  // ============================
  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("edugame_user");
    localStorage.removeItem("edugame_token");
  }, []);

  // ============================
  // UPDATE USER LOCAL
  // ============================
  const updateUser = useCallback((patch) => {
    setUser((prev) => {
      const next = { ...prev, ...patch };
      localStorage.setItem("edugame_user", JSON.stringify(next));
      return next;
    });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loginWithGoogle,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth phải được dùng bên trong AuthProvider");
  return ctx;
};