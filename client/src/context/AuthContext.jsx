import { createContext, useContext, useEffect, useState } from "react";
import api from "../services/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("arova_token");

    if (!token) {
      setLoading(false);
      return;
    }

    const getCurrentUser = async () => {
      try {
        const response = await api.get("/v1/auth/me");

        if (response.data.success) {
          console.log("CURRENT AROVA USER:", response.data.user);
          setUser(response.data.user);
          

          localStorage.setItem(
            "arova_user",
            JSON.stringify(response.data.user)
          );
        }
      } catch (error) {
        console.error("Authentication check failed:", error);

        localStorage.removeItem("arova_token");
        localStorage.removeItem("arova_user");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    getCurrentUser();
  }, []);

  const register = async (name, email, password) => {
    const response = await api.post("/v1/auth/register", {
      name,
      email,
      password,
    });

    if (!response.data.success) {
      throw new Error(
        response.data.message || "Registration failed"
      );
    }

    const { token, user } = response.data;

    localStorage.setItem("arova_token", token);
    localStorage.setItem("arova_user", JSON.stringify(user));

    setUser(user);

    return user;
  };

  const login = async (email, password) => {
    const response = await api.post("/v1/auth/login", {
      email,
      password,
    });

    if (!response.data.success) {
      throw new Error(
        response.data.message || "Login failed"
      );
    }

    const { token, user } = response.data;

    localStorage.setItem("arova_token", token);
    localStorage.setItem("arova_user", JSON.stringify(user));

    setUser(user);

    return user;
  };

  const logout = () => {
    localStorage.removeItem("arova_token");
    localStorage.removeItem("arova_user");

    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        register,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};