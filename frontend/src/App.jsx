
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Home, Login and Registration
import HomePage from "./components/home/HomePage";
import LoginPage from "./pages/Login/LoginPage";
import RegistrationPage from "./pages/Registration/RegistrationPage";

// Team Pages
import RequestBlood from "./components/RequestBlood";
import RecipientDashboard from "./components/RecipientDashboard";
import BloodBankDashboard from "./components/BloodBankDashboard";
import AdminDashboard from "./components/AdminDashboard";
import FindDonor from "./components/FindDonor";
import HospitalBeds from "./components/HospitalBeds";
import DonorDashboard from "./components/DonorDashboard";

// Login and Registration Styles
import "./styles/bc-auth.css";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegistrationPage />} />

        <Route path="/find-donor" element={<FindDonor />} />
        <Route path="/donor-dashboard" element={<DonorDashboard />} />

        <Route path="/request-blood" element={<RequestBlood />} />
        <Route path="/dashboard" element={<RecipientDashboard />} />
        <Route path="/bloodbank-dashboard" element={<BloodBankDashboard />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/hospital-beds" element={<HospitalBeds />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
