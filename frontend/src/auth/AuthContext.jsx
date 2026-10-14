
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  clearDemoSession,
  loginDemoAccount,
  readDemoSession,
  registerDemoAccount,
  saveDemoSession,
} from "./demoAuth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readDemoSession);

  // Compatibility with the existing FindDonor demo.
  useEffect(() => {
    try {
      if (user) {
        window.localStorage.setItem(
          "bc_logged_in",
          "true"
        );
      } else {
        window.localStorage.removeItem("bc_logged_in");
      }
    } catch {
      // Ignore blocked browser storage.
    }
  }, [user]);

  const login = async (email, password) => {
    const account = await loginDemoAccount(
      email,
      password
    );

    const session = saveDemoSession(account);

    setUser(session);

    return session;
  };

  const register = async (form) => {
    return registerDemoAccount(form);
  };

  const logout = () => {
    clearDemoSession();
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
    throw new Error(
      "useAuth must be used inside AuthProvider."
    );
  }

  return context;
}
