
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// My Home, Login and Registration Pages
import HomePage from "./components/home/HomePage";
import LoginPage from "./pages/Login/LoginPage";
import RegistrationPage from "./pages/Registration/RegistrationPage";

// Teammates' Pages
import RequestBlood from "./components/RequestBlood";
import RecipientDashboard from "./components/RecipientDashboard";
import BloodBankDashboard from "./components/BloodBankDashboard";

// Login and Registration Styles
import "./styles/bc-auth.css";

function ComingSoon({ title }) {
  return (
    <main style={{
      minHeight: "80vh",
      display: "grid",
      placeItems: "center",
      textAlign: "center",
      padding: "30px"
    }}>
      <div>
        <h1>{title}</h1>
        <p>This page is being developed by our team.</p>
      </div>
    </main>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* My Pages */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegistrationPage />} />

        {/* Teammates' Existing Pages */}
        <Route path="/request-blood" element={<RequestBlood />} />
        <Route path="/dashboard" element={<RecipientDashboard />} />
        <Route path="/bloodbank-dashboard" element={<BloodBankDashboard />} />

        {/* Future Team Pages */}
        <Route path="/find-donor"
          element={<ComingSoon title="Find Donor" />} />
        <Route path="/hospital-beds"
          element={<ComingSoon title="Hospital Beds" />} />

        {/* Unknown URL redirects to Home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
