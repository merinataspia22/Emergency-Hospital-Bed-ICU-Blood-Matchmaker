
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Home, Login and Registration
import HomePage from "./components/home/HomePage";
import LoginPage from "./pages/Login/LoginPage";
import RegistrationPage from "./pages/Registration/RegistrationPage";

// Team Components
import RequestBlood from "./components/RequestBlood";
import RecipientDashboard from "./components/RecipientDashboard";
import AdminDashboard from "./components/AdminDashboard";
import FindDonor from "./components/FindDonor";
import HospitalBeds from "./components/HospitalBeds";
import DonorDashboard from "./components/DonorDashboard";
import BloodBankDashboard from "./components/BloodBankDashboard";

// Login and Registration Styles
import "./styles/bc-auth.css";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Home, Login and Registration */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegistrationPage />} />

        {/* Request Blood */}
        <Route
          path="/request-blood"
          element={<RequestBlood />}
        />

        {/* Dashboards */}
        <Route
          path="/dashboard"
          element={<RecipientDashboard />}
        />
        <Route
          path="/recipient-dashboard"
          element={<RecipientDashboard />}
        />
        <Route
          path="/donor-dashboard"
          element={<DonorDashboard />}
        />
        <Route
          path="/admin-dashboard"
          element={<AdminDashboard />}
        />
        <Route
          path="/bloodbank-dashboard"
          element={<BloodBankDashboard />}
        />

        {/* Other Pages */}
        <Route
          path="/hospital-beds"
          element={<HospitalBeds />}
        />
        <Route
          path="/find-donor"
          element={<FindDonor />}
        />

        {/* Unknown URL */}
        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}
