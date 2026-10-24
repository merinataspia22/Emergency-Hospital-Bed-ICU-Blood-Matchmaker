
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  apiRequest,
  readToken,
  saveToken,
  clearToken,
} from "../services/api.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore login from the real backend.
  useEffect(() => {
    let active = true;
    const token = readToken();

    if (!token) {
      setLoading(false);
      return;
    }

    apiRequest("/auth/me", { token })
      .then((data) => {
        if (active) {
          setUser(data.user);
        }
      })
      .catch(() => {
        if (active) {
          clearToken();
          setUser(null);
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  // Compatibility with the existing Find Donor page.
  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem(
          "bc_logged_in",
          "true"
        );
      } else {
        localStorage.removeItem(
          "bc_logged_in"
        );
      }
    } catch {
      // Ignore unavailable browser storage.
    }
  }, [user]);

  // Register new donor or recipient in MongoDB.
  const register = async (form) => {
    const data = await apiRequest("/auth/register", {
      method: "POST",
      body: form,
    });

    return data.user;
  };

  // Login using the MongoDB account.
  const login = async (email, password) => {
    const data = await apiRequest("/auth/login", {
      method: "POST",
      body: {
        email: email.trim(),
        password,
      },
    });

    if (!data?.user || !data?.token) {
      throw new Error(
        "Invalid response from the login server."
      );
    }

    saveToken(data.token);
    setUser(data.user);

    return data.user;
  };

  const logout = () => {
    clearToken();
    setUser(null);
  };

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      register,
      logout,
      isAuthenticated: Boolean(user),
    }),
    [user, loading]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider."
    );
  }

  return context;
}
