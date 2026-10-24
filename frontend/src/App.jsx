
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from "react-router-dom";

// Home, Login and Registration
import HomePage from "./components/home/HomePage";
import LoginPage from "./pages/Login/LoginPage";
import RegistrationPage from "./pages/Registration/RegistrationPage";

// Existing Team Components
import RequestBlood from "./components/RequestBlood";
import RecipientDashboard from "./components/RecipientDashboard"; 
import MyRequests from "./components/MyRequests";
import AdminDashboard from "./components/AdminDashboard";
import FindDonor from "./components/FindDonor";
import HospitalBeds from "./components/HospitalBeds";
import DonorDashboard from "./components/DonorDashboard";
import BloodBankDashboard from "./components/BloodBankDashboard";

// Shared Authentication
import { AuthProvider } from "./auth/AuthContext";
import ProtectedRoute from "./auth/ProtectedRoute";

// Shared Navbar Layout
import SiteLayout from "./layouts/SiteLayout";

// Existing Login and Registration Styles
import "./styles/bc-auth.css";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>

          {/* Login and Registration - No Navbar */}

          <Route
            path="/login"
            element={<LoginPage />}
          />

          <Route
            path="/register"
            element={<RegistrationPage />}
          />

          {/* Common Navbar Pages */}

          <Route element={<SiteLayout />}>

            {/* Home */}

            <Route
              path="/"
              element={
                <HomePage showHeader={false} />
              }
            />

            {/* Find Donor */}

            <Route
              path="/find-donor"
              element={<FindDonor />}
            />

            {/* Request Blood */}

            <Route
              path="/request-blood"
              element={<RequestBlood />}
            />

            {/* Hospital Beds */}

            <Route
              path="/hospital-beds"
              element={<HospitalBeds />}
            />

            {/* Donor Dashboard */}

            <Route
              path="/donor-dashboard"
              element={
                <ProtectedRoute role="donor">
                  <DonorDashboard />
                </ProtectedRoute>
              }
            />

            {/* Recipient Dashboard */}

            <Route
              path="/recipient-dashboard"
              element={
                <ProtectedRoute role="recipient">
                  <RecipientDashboard />
                </ProtectedRoute>
              }
            />

            {/* Old Recipient Dashboard URL */}

            <Route
              path="/dashboard"
              element={
                <ProtectedRoute role="recipient">
                  <RecipientDashboard />
                </ProtectedRoute>
              } 
              
              
            />  
            <Route path="/my-requests" element={<ProtectedRoute role="recipient"><MyRequests /></ProtectedRoute>} />

            {/* Admin Dashboard */}

            <Route
              path="/admin-dashboard"
              element={
                <ProtectedRoute role="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            {/* Hospital / Blood Bank Dashboard */}

            <Route
              path="/bloodbank-dashboard"
              element={
                <ProtectedRoute role="staff">
                  <BloodBankDashboard />
                </ProtectedRoute>
              }
            />

          </Route>

          {/* Unknown URL */}

          <Route
            path="*"
            element={
              <Navigate to="/" replace />
            }
          />

        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
