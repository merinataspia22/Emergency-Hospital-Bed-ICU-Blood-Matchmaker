import React, { useState } from "react";
import {
  LayoutGrid, Droplet, FileText, CalendarCheck, BedDouble, Users, Building2,
  BarChart3, Bell, Settings, LogOut, ChevronDown, Search, Database, CheckCircle2,
  FlaskConical, ClipboardList, Send, X, HeartHandshake,
} from "lucide-react";
import FitToScreen from "./FitToScreen";
import {
  currentUser, inventory as inventoryData, incomingRequests, crossMatch as crossMatchData,
  appointments, bedOccupancy, trends, quickActions,
} from "../data/bloodBankData";

const card = "rounded-xl border border-[#fde2e4] bg-white shadow-sm";

const menu = [
  { label: "Dashboard", icon: LayoutGrid },
  { label: "Blood Inventory", icon: Droplet },
  { label: "Blood Requests", icon: FileText },
  { label: "Donor Appointments", icon: CalendarCheck },
  { label: "Hospital Beds", icon: BedDouble },
  { label: "Donors", icon: Users },
  { label: "Hospitals", icon: Building2 },
  { label: "Reports", icon: BarChart3 },
  { label: "Notifications", icon: Bell },
  { label: "Settings", icon: Settings },
];

const urgencyStyle = {
  Urgent: "bg-[#ffe1e1] text-[#e00000]",
  High: "bg-[#fff1d6] text-[#c27a00]",
  Normal: "bg-[#dbeafe] text-[#1d6fe0]",
};

const statusStyle = {
  Pending: "bg-[#fff1d6] text-[#c27a00]",
  "In Progress": "bg-[#dbeafe] text-[#1d6fe0]",
  Confirmed: "bg-[#dcfce7] text-[#15803d]",
};

const quickIcons = [Database, CheckCircle2, BedDouble, BarChart3, Users, Send];

function Avatar({ name, size = "h-10 w-10", text = "text-sm" }) {
  const initials = name.split(" ").filter((n) => !n.endsWith(".")).map((n) => n[0]).slice(0, 2).join("");
  return (
    <div className={`${size} ${text} flex shrink-0 items-center justify-center rounded-full bg-[#ffd3d6] font-semibold text-[#f30000]`}>
      {initials}
    </div>
  );
}

/* ---------- Line chart (plain SVG, kono extra package lagbe na) ---------- */
function TrendChart() {
  const W = 420, H = 190, L = 34, B = 24, T = 10, R = 8;
  const max = 200;
  const n = trends.collected.length;
  const x = (i) => L + (i * (W - L - R)) / (n - 1);
  const y = (v) => T + (1 - v / max) * (H - T - B);
  const path = (arr) => arr.map((v, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
  const area = `${path(trends.collected)} L${x(n - 1)},${y(0)} L${x(0)},${y(0)} Z`;
  const ticks = [0, 50, 100, 150, 200];
  const xLabels = [["1 Jun", 0], ["8 Jun", 7], ["15 Jun", 14], ["22 Jun", 21], ["30 Jun", 29]];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      {ticks.map((t) => (
        <g key={t}>
          <line x1={L} x2={W - R} y1={y(t)} y2={y(t)} stroke="#f1f1f1" />
          <text x={L - 6} y={y(t) + 3} textAnchor="end" fontSize="9" fill="#6b7280">{t}</text>
        </g>
      ))}
      {xLabels.map(([l, i]) => (
        <text key={l} x={x(i)} y={H - 6} textAnchor="middle" fontSize="9" fill="#6b7280">{l}</text>
      ))}
      <path d={area} fill="#ffe3e4" opacity="0.6" />
      <path d={path(trends.used)} fill="none" stroke="#f8a5aa" strokeWidth="2" />
      <path d={path(trends.collected)} fill="none" stroke="#e00000" strokeWidth="2" />
      {trends.collected.map((v, i) => (i % 3 === 0 ? <circle key={i} cx={x(i)} cy={y(v)} r="2.5" fill="#e00000" /> : null))}
    </svg>
  );
}

/* ---------- Donut chart (plain SVG) ---------- */
function BedDonut() {
  const { occupied, total } = bedOccupancy;
  const pct = Math.round((occupied / total) * 100);
  const r = 52, c = 2 * Math.PI * r;
  return (
    <div className="relative mx-auto h-[140px] w-[140px]">
      <svg viewBox="0 0 140 140" className="-rotate-90">
        <circle cx="70" cy="70" r={r} fill="none" stroke="#e5e7eb" strokeWidth="18" />
        <circle
          cx="70" cy="70" r={r} fill="none" stroke="#e00000" strokeWidth="18"
          strokeDasharray={`${(pct / 100) * c} ${c}`}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center leading-tight">
        <span className="text-2xl font-bold">{pct}%</span>
        <span className="text-[11px] text-gray-500">Occupied</span>
      </div>
    </div>
  );
}

/* ---------- Update Stock modal ---------- */
function StockModal({ stock, onClose, onSave }) {
  const [draft, setDraft] = useState(stock);
  const change = (group, val) =>
    setDraft((d) => d.map((s) => (s.group === group ? { ...s, units: Math.max(0, Number(val) || 0) } : s)));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold">Update Blood Stock</h3>
          <button type="button" aria-label="Close" onClick={onClose} className="text-gray-500 hover:text-[#f30000]">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {draft.map((s) => (
            <label key={s.group} className="flex items-center justify-between rounded-lg border border-[#fde2e4] px-3 py-2 text-sm font-semibold">
              {s.group}
              <input
                type="number"
                min="0"
                value={s.units}
                onChange={(e) => change(s.group, e.target.value)}
                className="w-20 rounded-md border border-gray-200 px-2 py-1 text-right font-normal outline-none focus:border-[#f30000]"
              />
            </label>
          ))}
        </div>
        <div className="mt-5 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="rounded-lg border border-[#f9c9cc] px-5 py-2 text-sm font-semibold text-[#f30000] hover:bg-[#fff1f2]">
            Cancel
          </button>
          <button type="button" onClick={() => onSave(draft)} className="rounded-lg bg-[#d9141f] px-5 py-2 text-sm font-semibold text-white shadow-md hover:bg-[#c0101a]">
            Save Stock
          </button>
        </div>
      </div>
    </div>
  );
}

export default function BloodBankDashboard() {
  const [active, setActive] = useState("Dashboard");
  const [stock, setStock] = useState(inventoryData);
  const [requests, setRequests] = useState(incomingRequests);
  const [matches, setMatches] = useState(crossMatchData);
  const [showModal, setShowModal] = useState(false);

  const approve = (id) =>
    setRequests((rs) => rs.map((r) => (r.id === id ? { ...r, approved: true } : r)));

  const processMatch = (id) =>
    setMatches((ms) => ms.map((m) => (m.id === id && m.status === "Pending" ? { ...m, status: "In Progress" } : m)));

  const handleQuick = (label) => {
    if (label === "Update Blood Stock") setShowModal(true);
  };

  const available = bedOccupancy.available;

  return (
    <FitToScreen>
      <div className="overflow-hidden rounded-3xl bg-white shadow-xl">
        {/* ============ TOP BAR ============ */}
        <header className="flex items-center justify-between gap-6 border-b border-gray-100 bg-white px-6 py-3.5">
          <a href="/" className="flex items-center gap-2">
            <Droplet className="h-7 w-7 fill-[#f30000] text-[#f30000]" />
            <span className="text-2xl font-bold tracking-tight">
              <span className="text-[#f30000]">Blood</span>Connect
            </span>
          </a>

          <div className="relative max-w-md flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Search donors, requests, hospitals..."
              className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-[#f30000]"
            />
          </div>

          <div className="flex items-center gap-5">
            <button type="button" aria-label="Notifications" className="relative text-gray-800">
              <Bell className="h-5 w-5" />
              <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-[#f30000] text-[10px] font-bold text-white">3</span>
            </button>
            <span className="h-8 w-px bg-gray-200" />
            <button type="button" className="flex items-center gap-3">
              <Avatar name={currentUser.name} size="h-11 w-11" />
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
            <nav className="space-y-1">
              {menu.map(({ label, icon: Icon }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => setActive(label)}
                  className={`flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-left text-sm font-medium transition ${
                    active === label ? "bg-[#d9141f] text-white shadow-md" : "text-gray-800 hover:bg-[#fff1f2]"
                  }`}
                >
                  <Icon className="h-[18px] w-[18px]" />
                  {label}
                </button>
              ))}
            </nav>

            <div className="mt-4">
              <div className="rounded-xl bg-gradient-to-br from-[#fff1f2] to-[#ffe3e4] p-4">
                <HeartHandshake className="mb-2 h-10 w-10 text-[#f30000]" />
                <p className="text-lg font-extrabold leading-tight">
                  Together<br /><span className="text-[#f30000]">We Save Lives</span>
                </p>
              </div>
              <button type="button" className="mt-3 flex items-center gap-3 px-4 py-2 text-sm font-medium text-gray-800 hover:text-[#f30000]">
                <LogOut className="h-[18px] w-[18px] text-[#f30000]" />
                Logout
              </button>
            </div>
          </aside>

          {/* ============ MAIN ============ */}
          <main className="min-w-0 flex-1 bg-gradient-to-b from-[#fff3f4] to-white p-4 lg:p-5">
            {/* Row 1: Inventory + Trends + Bed occupancy */}
            <div className="grid gap-4 xl:grid-cols-[1.25fr_1fr_0.8fr]">
              {/* Blood Inventory */}
              <div className={`${card} p-4`}>
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="flex items-center gap-2 text-base font-bold">
                    <Droplet className="h-5 w-5 fill-[#f30000] text-[#f30000]" /> Blood Inventory
                  </h2>
                  <button
                    type="button"
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-1.5 rounded-lg border border-[#f9c9cc] bg-[#fff1f2] px-3 py-1.5 text-xs font-semibold text-[#f30000] hover:bg-[#ffe3e4]"
                  >
                    <Database className="h-3.5 w-3.5" /> Update Stock
                  </button>
                </div>
                <div className="grid grid-cols-4 gap-2.5">
                  {stock.map((s) => {
                    const low = s.units < 60;
                    return (
                      <div key={s.group} className={`rounded-xl p-3 ${low ? "bg-[#fff6e5]" : "bg-[#ffecee]"}`}>
                        <Droplet className={`h-6 w-6 ${low ? "fill-[#f59e0b] text-[#f59e0b]" : "fill-[#e00000] text-[#e00000]"}`} />
                        <p className="mt-1 text-sm font-semibold">{s.group}</p>
                        <p className="text-2xl font-bold leading-none">{s.units}</p>
                        <p className="mt-1 text-[11px] text-gray-500">Units</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Inventory Trends */}
              <div className={`${card} p-4`}>
                <div className="mb-1 flex items-center justify-between">
                  <h2 className="text-base font-bold">
                    Inventory Trends <span className="text-xs font-medium text-gray-600">(Last 30 Days)</span>
                  </h2>
                </div>
                <div className="mb-1 flex justify-end gap-4 text-[11px] text-gray-600">
                  <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#e00000]" />Units Collected</span>
                  <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#f8a5aa]" />Units Used</span>
                </div>
                <TrendChart />
              </div>

              {/* Hospital Bed Occupancy */}
              <div className={`${card} p-4`}>
                <h2 className="mb-3 flex items-center gap-2 text-base font-bold">
                  <BedDouble className="h-5 w-5 text-[#f30000]" /> Hospital Bed Occupancy
                </h2>
                <BedDonut />
                <div className="mt-3 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between"><span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-[#e00000]" />Occupied</span><b>{bedOccupancy.occupied}</b></div>
                  <div className="flex items-center justify-between"><span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-[#f8a5aa]" />Available</span><b>{available}</b></div>
                  <div className="flex items-center justify-between"><span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-gray-300" />Total Beds</span><b>{bedOccupancy.total}</b></div>
                </div>
                <button type="button" className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-[#ffe3e4] py-2 text-xs font-semibold text-[#d9141f] hover:bg-[#ffd3d6]">
                  <BedDouble className="h-4 w-4" /> Manage Hospital Beds
                </button>
              </div>
            </div>

            {/* Row 2: Incoming requests + Cross-match */}
            <div className="mt-4 grid items-start gap-4 xl:grid-cols-[1fr_1fr]">
              {/* Incoming Blood Requests */}
              <div className={`${card} p-4`}>
                <div className="mb-2 flex items-center justify-between">
                  <h2 className="flex items-center gap-2 text-base font-bold">
                    <ClipboardList className="h-5 w-5 text-[#f30000]" /> Incoming Blood Requests
                  </h2>
                  <a href="#" className="text-xs font-semibold text-[#f30000] hover:underline">View All</a>
                </div>
                <div className="divide-y divide-gray-100">
                  {requests.map((r) => (
                    <div key={r.id} className="flex items-center gap-3 py-2">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#ffe3e4] text-sm font-bold text-[#e00000]">{r.group}</span>
                      <div className="min-w-0 flex-1 leading-tight">
                        <p className="truncate text-[13px] font-semibold">
                          {r.name} <span className="ml-1 text-[11px] font-normal text-gray-500">{r.hospital}</span>
                        </p>
                        <p className="mt-0.5 text-[11px] text-gray-500">{r.units} Unit{r.units > 1 ? "s" : ""} • {r.reason}</p>
                      </div>
                      <span className={`rounded-md px-2.5 py-1 text-[11px] font-semibold ${urgencyStyle[r.urgency]}`}>{r.urgency}</span>
                      <span className="w-[88px] text-right text-[11px] text-gray-500">{r.time}</span>
                      {r.approved ? (
                        <span className="flex w-[104px] items-center justify-center gap-1.5 rounded-lg bg-[#dcfce7] py-2 text-[12px] font-semibold text-[#15803d]">
                          <CheckCircle2 className="h-4 w-4" /> Approved
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => approve(r.id)}
                          className="flex w-[104px] items-center justify-center gap-1.5 rounded-lg bg-[#d9141f] py-2 text-[12px] font-semibold text-white shadow-sm transition hover:bg-[#c0101a]"
                        >
                          <CheckCircle2 className="h-4 w-4" /> Approve
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Pending Cross-Match */}
              <div className={`${card} p-4`}>
                <div className="mb-2 flex items-center justify-between">
                  <h2 className="flex items-center gap-2 text-base font-bold">
                    <FlaskConical className="h-5 w-5 text-[#f30000]" /> Pending Cross-Match
                  </h2>
                  <a href="#" className="text-xs font-semibold text-[#f30000] hover:underline">View All</a>
                </div>
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50 text-[11px] font-semibold text-gray-700">
                      {["Patient Name", "Blood Group", "Units", "Status", "Action"].map((h) => (
                        <th key={h} className="px-3 py-2 first:rounded-l-lg last:rounded-r-lg">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {matches.map((m) => (
                      <tr key={m.id} className="border-b border-gray-100 last:border-0">
                        <td className="px-3 py-1.5 font-medium">{m.patient}</td>
                        <td className="px-3 py-1.5 font-semibold">{m.group}</td>
                        <td className="px-3 py-1.5">{m.units}</td>
                        <td className="px-3 py-1.5">
                          <span className={`inline-block rounded-md px-2.5 py-1 text-[11px] font-semibold ${statusStyle[m.status]}`}>{m.status}</span>
                        </td>
                        <td className="px-3 py-1.5">
                          {m.status === "Pending" ? (
                            <button type="button" onClick={() => processMatch(m.id)} className="w-[76px] rounded-md bg-[#d9141f] py-1.5 text-[11px] font-semibold text-white hover:bg-[#c0101a]">
                              Process
                            </button>
                          ) : (
                            <button type="button" className="w-[76px] rounded-md border border-gray-300 bg-white py-1.5 text-[11px] font-semibold text-gray-800 hover:bg-gray-50">
                              View
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Row 3: Appointments + Quick actions */}
            <div className="mt-4 grid items-start gap-4 xl:grid-cols-[1.1fr_1fr]">
              <div className={`${card} p-4`}>
                <div className="mb-2 flex items-center justify-between">
                  <h2 className="flex items-center gap-2 text-base font-bold">
                    <CalendarCheck className="h-5 w-5 text-[#f30000]" /> Upcoming Donor Appointments
                  </h2>
                  <a href="#" className="text-xs font-semibold text-[#f30000] hover:underline">View All</a>
                </div>
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="text-[11px] font-semibold text-gray-600">
                      {["Name", "Blood Group", "Date & Time", "Contact", "Status", "Action"].map((h) => (
                        <th key={h} className="px-2 py-1.5">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {appointments.map((a) => (
                      <tr key={a.id} className="border-t border-gray-100">
                        <td className="px-2 py-1.5">
                          <span className="flex items-center gap-2 font-medium"><Avatar name={a.name} size="h-6 w-6" text="text-[10px]" />{a.name}</span>
                        </td>
                        <td className="px-2 py-1.5 font-semibold">{a.group}</td>
                        <td className="px-2 py-1.5 text-gray-700">{a.when}</td>
                        <td className="px-2 py-1.5 text-gray-700">{a.contact}</td>
                        <td className="px-2 py-1.5">
                          <span className={`inline-block rounded-md px-2 py-0.5 text-[10px] font-semibold ${statusStyle[a.status]}`}>{a.status}</span>
                        </td>
                        <td className="px-2 py-1.5">
                          <button type="button" className="rounded-md border border-gray-300 bg-white px-3 py-1 text-[11px] font-semibold text-gray-800 hover:bg-gray-50">
                            {a.status === "Pending" ? "Reschedule" : "View"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className={`${card} p-4`}>
                <h2 className="mb-3 flex items-center gap-2 text-base font-bold">
                  <Settings className="h-5 w-5 text-[#f30000]" /> Quick Actions
                </h2>
                <div className="grid grid-cols-3 gap-3">
                  {quickActions.map((label, i) => {
                    const Icon = quickIcons[i];
                    return (
                      <button
                        key={label}
                        type="button"
                        onClick={() => handleQuick(label)}
                        className="flex flex-col items-center gap-2 rounded-xl bg-[#ffecee] px-2 py-3.5 text-center text-[12px] font-medium transition hover:bg-[#ffe3e4]"
                      >
                        <Icon className="h-5 w-5 text-[#e00000]" />
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>

      {showModal && (
        <StockModal
          stock={stock}
          onClose={() => setShowModal(false)}
          onSave={(next) => {
            setStock(next);
            setShowModal(false);
          }}
        />
      )}
    </FitToScreen>
  );
}