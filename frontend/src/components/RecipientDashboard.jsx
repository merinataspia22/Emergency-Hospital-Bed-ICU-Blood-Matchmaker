import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Home, FileText, Users, Building2, MessageSquare, Bell, User, Settings, LogOut,
  Droplet, ChevronDown, Plus, Phone, BedDouble, MapPin, ArrowRight, Mail,
  AlertCircle, Clock, CheckCircle2,
} from "lucide-react";
import FitToScreen from "./FitToScreen";

/* ------------------------------------------------------------------
   MOCK DATA  ->  backend ready hole ei gulo API theke ashbe
------------------------------------------------------------------- */
const currentUser = { name: "Rahim Uddin", role: "Recipient", photo: "" };

const stats = [
  { label: "Active Requests", value: 3, note: "Currently in progress", icon: FileText },
  { label: "Fulfilled Requests", value: 8, note: "Successfully completed", icon: Droplet },
  { label: "Matched Donors", value: 12, note: "Donors ready to help", icon: Users },
  { label: "Nearby Blood Banks", value: 6, note: "Within 10 km", icon: Building2 },
];



const donors = [
  { name: "Nafisa Alam", group: "A+", distance: "2 km away", photo: "" },
  { name: "Tawhid Hasan", group: "O-", distance: "4 km away", photo: "" },
  { name: "Sadia Rahman", group: "B+", distance: "6 km away", photo: "" },
];

const hospitals = [
  { name: "Chattogram Medical College Hospital", distance: "1.2 km away" },
  { name: "Aga Khan Hospital", distance: "3.5 km away" },
  { name: "Chittagong General Hospital", distance: "5.1 km away" },
];

const menu = [
  { label: "Dashboard", icon: Home },
  { label: "My Requests", icon: FileText },
  { label: "Matched Donors", icon: Users },
  { label: "Nearby Hospitals", icon: Building2 },
  { label: "Messages", icon: MessageSquare },
  { label: "Notifications", icon: Bell },
  { label: "Profile", icon: User },
  { label: "Settings", icon: Settings },
];

const statusStyle = {
  Urgent: { cls: "bg-[#ffe1e1] text-[#e00000]", icon: AlertCircle },
  Pending: { cls: "bg-[#dbeafe] text-[#1d6fe0]", icon: Clock },
  Matched: { cls: "bg-[#dcfce7] text-[#15803d]", icon: CheckCircle2 },
  Completed: { cls: "bg-[#dcfce7] text-[#15803d]", icon: CheckCircle2 },
};

const card = "rounded-xl border border-[#fde2e4] bg-white shadow-sm";

/* small avatar: photo thakle photo, na hole initials */
function Avatar({ name, photo, size = "h-10 w-10", text = "text-sm" }) {
  const initials = name.split(" ").map((n) => n[0]).slice(0, 2).join("");
  return photo ? (
    <img src={photo} alt={name} className={`${size} rounded-full object-cover`} />
  ) : (
    <div className={`${size} ${text} flex shrink-0 items-center justify-center rounded-full bg-[#ffd3d6] font-semibold text-[#f30000]`}>
      {initials}
    </div>
  );
}

export default function RecipientDashboard() {
  const [active, setActive] = useState("Dashboard"); 
  const [requests, setRequests] = useState([]);
const [loadingRequests, setLoadingRequests] = useState(true);
const [requestError, setRequestError] = useState("");
  const navigate = useNavigate();
  const firstName = currentUser.name.split(" ")[0];
useEffect(() => {
  const fetchRequests = async () => {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      setRequestError("Please log in first.");
      setLoadingRequests(false);
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:5000/api/blood-requests/me",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to load requests.");
      }

      const data = result.data?.requests ?? [];
setRequests(data);
    } catch (error) {
      setRequestError(error.message || "Unable to load requests.");
    } finally {
      setLoadingRequests(false);
    }
  };

  fetchRequests();
}, []);
  return (
    <FitToScreen>
      <div className="overflow-hidden rounded-3xl bg-white shadow-xl">
        {/* ============ TOP BAR ============ */}
        <header className="flex items-center justify-between border-b border-gray-100 bg-white px-6 py-3.5">
          <a href="/" className="flex items-center gap-2">
            <Droplet className="h-7 w-7 fill-[#f30000] text-[#f30000]" />
            <span className="text-2xl font-bold tracking-tight">
              <span className="text-[#f30000]">Blood</span>Connect
            </span>
          </a>

          <div className="flex items-center gap-5">
            <button type="button" aria-label="Notifications" className="relative text-gray-800">
              <Bell className="h-5 w-5" />
            </button>
            <span className="h-8 w-px bg-gray-200" />
            <button type="button" className="flex items-center gap-3">
              <Avatar name={currentUser.name} photo={currentUser.photo} size="h-11 w-11" />
              <div className="text-left leading-tight">
                <p className="text-sm font-semibold">{currentUser.name}</p>
                <p className="text-xs text-gray-500">{currentUser.role}</p>
              </div>
              <ChevronDown className="h-4 w-4 text-gray-800" />
            </button>
          </div>
        </header>

        <div className="flex">
          {/* ============ SIDEBAR ============ */}
          <aside className="hidden w-[215px] shrink-0 flex-col justify-between border-r border-gray-100 bg-white p-4 lg:flex">
            <nav className="space-y-1.5">
              {menu.map(({ label, icon: Icon }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => setActive(label)}
                  className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-medium transition ${
                    active === label
                      ? "bg-[#d9141f] text-white shadow-md"
                      : "text-gray-800 hover:bg-[#fff1f2]"
                  }`}
                >
                  <Icon className="h-[18px] w-[18px]" />
                  {label}
                </button>
              ))}
            </nav>

            <button
              type="button"
              className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-800 hover:text-[#f30000]"
            >
              <LogOut className="h-[18px] w-[18px] text-[#f30000]" />
              Logout
            </button>
          </aside>

          {/* ============ MAIN ============ */}
          <main className="min-w-0 flex-1 bg-gradient-to-b from-[#fff3f4] to-white p-4 lg:p-5">
            {/* Hero */}
            <div className="relative min-h-[150px] overflow-hidden rounded-2xl bg-gradient-to-r from-[#fefaf9] via-[#fff1f2] to-[#ffe3e4] px-7 py-6">
              <img
                src="/blood-heart.png"
                alt=""
                className="pointer-events-none absolute right-[14%] top-0 hidden h-full w-[48%] object-contain object-right [mask-image:linear-gradient(to_right,transparent,black_25%,black_85%,transparent)] md:block"
              />
              <div className="relative z-10">
                <h1 className="text-[34px] font-extrabold leading-tight tracking-tight">
                  Welcome, {firstName}!
                </h1>
                <p className="mt-1.5 text-sm text-[#4b5563]">
                  Manage your blood requests and get help from our donor community.
                </p>
              </div>
              <p
                className="absolute right-8 top-1/2 z-10 hidden -translate-y-1/2 -rotate-12 whitespace-nowrap text-[30px] font-semibold leading-[26px] text-[#f30000] lg:block"
                style={{ fontFamily: "'Caveat', cursive" }}
              >
                Together<br />We Save Lives
              </p>
            </div>

            {/* Stats */}
            <div className="mt-4 grid grid-cols-2 gap-4 xl:grid-cols-4">
              {stats.map(({ label, value, note, icon: Icon }) => (
                <div key={label} className={`${card} flex items-center gap-4 p-4`}>
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#ffe3e4]">
                    <Icon className="h-6 w-6 text-[#f30000]" />
                  </div>
                  <div className="leading-tight">
                    <p className="text-[13px] font-semibold">{label}</p>
                    <p className="text-[32px] font-bold leading-none">{value}</p>
                    <p className="mt-1 text-xs text-gray-500">{note}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick actions */}
            <div className="mt-4 grid grid-cols-2 gap-4 xl:grid-cols-[1.1fr_1fr_1fr_1fr]">
              <button
                type="button"
                onClick={() => navigate("/request-blood")}
                className="flex items-center justify-between rounded-xl bg-[#d9141f] px-5 py-3.5 text-sm font-semibold text-white shadow-md transition hover:bg-[#c0101a]"
              >
                <span className="flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white">
                    <Plus className="h-4 w-4 text-[#d9141f]" />
                  </span>
                  Create New Request
                </span>
                <ArrowRight className="h-4 w-4" />
              </button>

              {[
                { label: "Contact Donor", icon: Phone },
                { label: "Check Hospital Beds", icon: BedDouble },
                { label: "Find Nearby Blood Banks", icon: MapPin },
              ].map(({ label, icon: Icon }) => (
                <button
                  key={label}
                  type="button"
                  className={`${card} flex items-center justify-between px-4 py-3 text-[13px] font-medium transition hover:bg-[#fff6f6]`}
                >
                  <span className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#ffe3e4]">
                      <Icon className="h-4 w-4 text-[#f30000]" />
                    </span>
                    {label}
                  </span>
                  <ArrowRight className="h-4 w-4 text-[#f30000]" />
                </button>
              ))}
            </div>

            {/* Bottom grid */}
            <div className="mt-4 grid items-start gap-4 xl:grid-cols-[1.5fr_1fr]">
              {/* My Blood Requests */}
              <div className={`${card} p-4`}>
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="flex items-center gap-2 text-base font-bold">
                    <Droplet className="h-5 w-5 fill-[#f30000] text-[#f30000]" />
                    My Blood Requests
                  </h2>
                  <a href="#" className="text-xs font-semibold text-[#f30000] hover:underline">View All</a>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[520px] text-left text-xs">
                    <thead>
                      <tr className="bg-slate-50 text-[11px] font-semibold text-gray-700">
                        {["#", "Date", "Blood Group", "Hospital", "Units", "Status", "Action"].map((h) => (
                          <th key={h} className="px-3 py-2.5 first:rounded-l-lg last:rounded-r-lg">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    
<tbody>
  {loadingRequests ? (
    <tr>
      <td colSpan={7} className="px-3 py-6 text-center text-gray-500">
        Loading your blood requests...
      </td>
    </tr>
  ) : requestError ? (
    <tr>
      <td colSpan={7} className="px-3 py-6 text-center text-red-600">
        {requestError}
      </td>
    </tr>
  ) : requests.length === 0 ? (
    <tr>
      <td colSpan={7} className="px-3 py-6 text-center text-gray-500">
        No blood requests found.
      </td>
    </tr>
  ) : (
    requests.map((r) => {
      const status = r.status || "Pending";
      const s = statusStyle[status] || statusStyle.Pending;
      const SIcon = s.icon;

      return (
        <tr key={r._id || r.id} className="border-b border-gray-100 last:border-0">
          <td className="px-3 py-2.5 font-medium text-gray-700">
            {(r._id || r.id || "").toString().slice(-6)}
          </td>
          <td className="px-3 py-2.5 text-gray-700">
            {r.dateNeeded
              ? new Date(r.dateNeeded).toLocaleDateString()
              : "—"}
          </td>
          <td className="px-3 py-2.5 font-semibold">
            {r.bloodGroup || "—"}
          </td>
          <td className="px-3 py-2.5 text-gray-700">
            {r.hospitalName || "—"}
          </td>
          <td className="px-3 py-2.5 text-gray-700">
            {r.units ?? "—"}
          </td>
          <td className="px-3 py-2.5">
            <span className={`inline-flex w-[88px] items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[11px] font-semibold ${s.cls}`}>
              <SIcon className="h-3.5 w-3.5" />
              {status}
            </span>
          </td>
          <td className="px-3 py-2.5">
            <button
              type="button"
              className="rounded-md border border-[#f9c9cc] bg-white px-5 py-1.5 text-[11px] font-semibold text-[#f30000] transition hover:bg-[#fff1f2]"
              onClick={() => window.alert(JSON.stringify(r, null, 2))}
            >
              View
            </button>
          </td>
        </tr>
      );
    })
  )}
</tbody>

                  </table>
                </div>
              </div>

              {/* Right column */}
              <div className="space-y-4">
                {/* Matched Donors */}
                <div className={`${card} p-4`}>
                  <div className="mb-2 flex items-center justify-between">
                    <h2 className="flex items-center gap-2 text-sm font-bold">
                      <Users className="h-5 w-5 text-[#f30000]" /> Matched Donors
                    </h2>
                    <a href="#" className="text-[11px] font-semibold text-[#f30000] hover:underline">View All</a>
                  </div>

                  <div className="divide-y divide-gray-100">
                    {donors.map((d) => (
                      <div key={d.name} className="flex items-center gap-3 py-2">
                        <Avatar name={d.name} photo={d.photo} size="h-10 w-10" />
                        <div className="min-w-0 flex-1 leading-tight">
                          <div className="flex items-center gap-2">
                            <p className="truncate text-[13px] font-semibold">{d.name}</p>
                            <span className="rounded-full bg-[#ffe3e4] px-2 py-0.5 text-[10px] font-bold text-[#f30000]">{d.group}</span>
                          </div>
                          <p className="mt-0.5 text-[11px] text-gray-500">{d.distance}</p>
                        </div>
                        <button type="button" aria-label="Call" className="flex h-8 w-8 items-center justify-center rounded-full border border-[#f9c9cc] text-[#f30000] hover:bg-[#fff1f2]">
                          <Phone className="h-3.5 w-3.5" />
                        </button>
                        <button type="button" aria-label="Message" className="flex h-8 w-8 items-center justify-center rounded-full border border-[#f9c9cc] text-[#f30000] hover:bg-[#fff1f2]">
                          <Mail className="h-3.5 w-3.5" />
                        </button>
                        <button type="button" className="rounded-lg bg-[#f30000] px-4 py-2 text-[11px] font-semibold text-white shadow-sm transition hover:bg-[#d10000]">
                          Contact
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Nearby Blood Banks & Hospitals */}
                <div className={`${card} p-4`}>
                  <div className="mb-2 flex items-center justify-between">
                    <h2 className="flex items-center gap-2 text-sm font-bold">
                      <MapPin className="h-5 w-5 fill-[#f30000] text-white" /> Nearby Blood Banks &amp; Hospitals
                    </h2>
                    <a href="#" className="text-[11px] font-semibold text-[#f30000] hover:underline">View All</a>
                  </div>

                  <div className="divide-y divide-gray-100">
                    {hospitals.map((h) => (
                      <div key={h.name} className="flex items-center gap-3 py-2">
                        <Building2 className="h-6 w-6 shrink-0 text-[#f30000]" />
                        <div className="min-w-0 flex-1 leading-tight">
                          <p className="truncate text-[12px] font-semibold">{h.name}</p>
                          <p className="text-[11px] text-gray-500">{h.distance}</p>
                        </div>
                        <button type="button" className="flex shrink-0 items-center gap-1.5 rounded-lg border border-[#f9c9cc] bg-white px-3 py-1.5 text-[11px] font-semibold text-[#f30000] transition hover:bg-[#fff1f2]">
                          <MapPin className="h-3.5 w-3.5" /> Get Directions
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </FitToScreen>
  );
}