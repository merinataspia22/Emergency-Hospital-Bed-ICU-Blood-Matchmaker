import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import RequestBlood from "./components/RequestBlood";
import RecipientDashboard from "./components/RecipientDashboard";
import BloodBankDashboard from "./components/BloodBankDashboard";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/request-blood" replace />} />
        <Route path="/request-blood" element={<RequestBlood />} />
        <Route path="/dashboard" element={<RecipientDashboard />} />
        <Route path="/bloodbank-dashboard" element={<BloodBankDashboard />} />
        {/* unknown url hole request-blood e pathabe */}
        <Route path="*" element={<Navigate to="/request-blood" replace />} />
      </Routes>
    </BrowserRouter>
  );
}