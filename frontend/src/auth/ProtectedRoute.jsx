
import {
  Navigate,
  useLocation,
} from "react-router-dom";

import { useAuth } from "./AuthContext.jsx";
import { ROLE_ROUTES } from "./demoAuth.js";

export default function ProtectedRoute({
  role,
  children,
}) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <main
        role="status"
        style={{
          minHeight: "60vh",
          display: "grid",
          placeItems: "center",
        }}
      >
        Checking your account...
      </main>
    );
  }

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location.pathname,
        }}
      />
    );
  }

  if (role && user.role !== role) {
    return (
      <Navigate
        to={ROLE_ROUTES[user.role] || "/"}
        replace
      />
    );
  }

  return children;
}
