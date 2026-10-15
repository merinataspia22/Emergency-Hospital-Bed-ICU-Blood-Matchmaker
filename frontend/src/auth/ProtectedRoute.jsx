
import {
  Navigate,
  useLocation,
} from "react-router-dom";

import { useAuth } from "./AuthContext";
import { ROLE_ROUTES } from "./demoAuth";

export default function ProtectedRoute({
  role,
  children,
}) {
  const { user } = useAuth();
  const location = useLocation();

  // User is not logged in.
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

  // User has a different role.
  if (user.role !== role) {
    const dashboard =
      ROLE_ROUTES[user.role] || "/";

    return (
      <Navigate
        to={dashboard}
        replace
      />
    );
  }

  // Correct role: show dashboard.
  return children;
}
