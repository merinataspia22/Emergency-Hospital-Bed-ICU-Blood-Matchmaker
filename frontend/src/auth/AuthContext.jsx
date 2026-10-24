
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const AuthContext = createContext(null);

const API_URL = "http://localhost:5000/api/auth";
const SESSION_KEY = "bc_auth_user_v1";

function readUser() {
  try {
    const token = localStorage.getItem("accessToken");
    const user = JSON.parse(
      localStorage.getItem(SESSION_KEY) || "null"
    );

    return token && user ? user : null;
  } catch {
    return null;
  }
}

function saveSession(user, accessToken) {
  localStorage.setItem("accessToken", accessToken);
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  localStorage.setItem("bc_logged_in", "true");
  return user;
}

async function authRequest(endpoint, body) {
  const response = await fetch(`${API_URL}/${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const result = await response.json().catch(() => ({}));

  if (!response.ok || !result.success) {
    throw new Error(result.message || "Authentication failed");
  }

  return result.data;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readUser);

  useEffect(() => {
    if (user) {
      localStorage.setItem("bc_logged_in", "true");
    } else {
      localStorage.removeItem("bc_logged_in");
    }
  }, [user]);

  const login = async (email, password) => {
    const data = await authRequest("login", {
      email: email.trim(),
      password,
    });

    const session = saveSession(data.user, data.accessToken);
    setUser(session);

    return session;
  };

  const register = async (form) => {
    const data = await authRequest("register", {
      name: form.name,
      email: form.email,
      phone: form.phone,
      password: form.password,
      role: form.role,
      bloodGroup: form.bloodGroup,
      location: form.location,
      lastDonation: form.lastDonation || null,
    });

    return data.user;
  };

  const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem("bc_logged_in");
    setUser(null);
  };

  const value = useMemo(
    () => ({
      user,
      login,
      register,
      logout,
      isAuthenticated: Boolean(user),
    }),
    [user]
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
    throw new Error("useAuth must be used inside AuthProvider.");
  }

  return context;
}
