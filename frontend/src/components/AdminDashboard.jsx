import { useState, useEffect } from "react";

const trend = {
  labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
  values: [22, 30, 35, 46, 44, 70],
};

const groups = [
  { name: "A+", pct: 32, color: "#e11d2e" },
  { name: "O+", pct: 24, color: "#2f80ed" },
  { name: "B+", pct: 16, color: "#f5a50b" },
  { name: "O-", pct: 10, color: "#e0505e" },
  { name: "A-", pct: 8, color: "#8e5bd9" },
  { name: "B-", pct: 6, color: "#7a8793" },
  { name: "AB+", pct: 4, color: "#4cb782" },
];

const controls = [
  { icon: "👥", title: "Manage Users", desc: "Add, edit or remove users, donors and staff" },
  { icon: "🩸", title: "Manage Blood Requests", desc: "View, update and assign requests" },
  { icon: "📊", title: "View Reports", desc: "Donations, users and platform analytics" },
  { icon: "🔔", title: "Notifications", desc: "Send alerts and manage announcements" },
  { icon: "🏢", title: "Hospital Management", desc: "Manage partner hospitals and inventory" },
  { icon: "⚙️", title: "System Settings", desc: "Platform configuration and preferences" },
];

const navItems = [
  { label: "Dashboard", icon: "▦" },
  { label: "Manage Users", icon: "👥" },
  { label: "Blood Requests", icon: "🩸" },
  { label: "Donations", icon: "📅" },
  { label: "Hospital Partners", icon: "🏢" },
  { label: "Reports", icon: "📊" },
  { label: "Notifications", icon: "🔔" },
  { label: "Settings", icon: "⚙️" },
];

const initials = (n = "") =>
  n.replace("Dr. ", "").split(" ").map((w) => w[0]).slice(0, 2).join("");

/* ---------- Small reusable pieces ---------- */
function Card({ title, icon, action, children }) {
  return (
    <div className="min-w-0 rounded-2xl bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="text-[15px] font-bold">
          <span className="mr-1 text-[#d90f1f]">{icon}</span>
          {title}
        </h3>
        {action}
      </div>
      {children}
    </div>
  );
}

const ViewAll = () => (
  <a href="#" className="text-xs font-semibold text-[#d90f1f]">
    View All
  </a>
);

const ActiveBadge = () => (
  <span className="rounded-md bg-[#e6f7ec] px-2.5 py-0.5 text-[11px] font-semibold text-[#16a34a]">
    Active
  </span>
);

/* ---------- Line chart (SVG, no library) ---------- */
function LineChart({ labels, values }) {
  const W = 420, H = 200, padL = 28, padR = 10, padT = 10, padB = 24, maxV = 80;
  const x = (i) => padL + (i * (W - padL - padR)) / (values.length - 1);
  const y = (v) => padT + (1 - v / maxV) * (H - padT - padB);
  const pts = values.map((v, i) => `${x(i)},${y(v)}`).join(" ");

  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="block h-[190px] w-full">
      <defs>
        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#d90f1f" stopOpacity="0.22" />
          <stop offset="1" stopColor="#d90f1f" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0, 20, 40, 60, 80].map((v) => (
        <g key={v}>
          <line x1={padL} x2={W - padR} y1={y(v)} y2={y(v)} stroke="#eceef3" />
          <text x={padL - 6} y={y(v) + 3} fontSize="9" fill="#6b7280" textAnchor="end">
            {v}
          </text>
        </g>
      ))}
      <polygon
        points={`${x(0)},${y(0)} ${pts} ${x(values.length - 1)},${y(0)}`}
        fill="url(#areaGrad)"
      />
      <polyline points={pts} fill="none" stroke="#d90f1f" strokeWidth="2" />
      {values.map((v, i) => (
        <g key={i}>
          <circle cx={x(i)} cy={y(v)} r="3.5" fill="#d90f1f">
            <title>{`${labels[i]}: ${v}`}</title>
          </circle>
          <text x={x(i)} y={H - 6} fontSize="9" fill="#6b7280" textAnchor="middle">
            {labels[i]}
          </text>
        </g>
      ))}
    </svg>
  );
}

/* ---------- Main page ---------- */
export default function AdminDashboard() {
  const [active, setActive] = useState("Dashboard");
  const [range, setRange] = useState(6);
  
  const [stats, setStats] = useState([
    { label: "Total Users", value: "0", change: "12%", icon: "👥", color: "#2f6df6" },
    { label: "Registered Donors", value: "0", change: "8%", icon: "🩸", color: "#d90f1f" },
    { label: "Blood Requests", value: "0", change: "18%", icon: "📄", color: "#f5a50b" },
    { label: "Completed Donations", value: "0", change: "25%", icon: "✔", color: "#16a34a" },
    { label: "Hospital Partners", value: "0", change: "5%", icon: "🏢", color: "#7c4dff" },
  ]);

  const [partners, setPartners] = useState([]);
  const [requests, setRequests] = useState([]);
  const [users, setUsers] = useState([]);

  // Fetching live data directly from MongoDB Atlas backend
  useEffect(() => {
    // 1. Fetch Hospital Partners
    fetch("http://localhost:5000/api/hospitals")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const mappedPartners = data.map((h) => ({
            name: h.name,
            loc: h.area || h.address || "Chattogram",
            donations: h.general ? h.general * 2 : (h.icu ? h.icu * 5 : 12),
          }));
          setPartners(mappedPartners);
          
          setStats((prev) =>
            prev.map((s) =>
              s.label === "Hospital Partners" ? { ...s, value: String(data.length) } : s
            )
          );
        }
      })
      .catch((err) => console.error("Error fetching hospitals:", err));

    // 2. Fetch Users from MongoDB Atlas
    fetch("http://localhost:5000/api/admin/users")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const mappedUsers = data.map((u) => ({
            name: u.name || "User",
            type: u.type || u.role || "Donor",
            loc: u.loc || u.location || "Chattogram",
            joined: u.joined || (u.createdAt ? new Date(u.createdAt).toLocaleDateString("en-GB", { day: '2-digit', month: 'short', year: 'numeric' }) : "Recently"),
          }));
          setUsers(mappedUsers);

          const donorCount = data.filter(u => (u.type === 'Donor' || u.role === 'donor')).length;

          setStats((prev) =>
            prev.map((s) => {
              if (s.label === "Total Users") return { ...s, value: String(data.length) };
              if (s.label === "Registered Donors") return { ...s, value: String(donorCount || data.length) };
              return s;
            })
          );
        }
      })
      .catch((err) => console.error("Error fetching users:", err));

    // 3. Fetch Overview Stats
    fetch("http://localhost:5000/api/admin/overview")
      .then((res) => res.json())
      .then((data) => {
        if (data) {
          setStats((prev) =>
            prev.map((s) => {
              if (s.label === "Blood Requests" && data.bloodRequests !== undefined) return { ...s, value: String(data.bloodRequests) };
              if (s.label === "Completed Donations" && data.completedDonations !== undefined) return { ...s, value: String(data.completedDonations) };
              return s;
            })
          );
        }
      })
      .catch((err) => console.error("Error fetching overview stats:", err));
  }, []);

  const total = groups.reduce((a, g) => a + g.pct, 0);
  let acc = 0;
  const pieStops = groups
    .map((g) => {
      const start = (acc / total) * 100;
      acc += g.pct;
      return `${g.color} ${start}% ${(acc / total) * 100}%`;
    })
    .join(",");

  return (
    <div className="min-h-screen bg-[#e8ebf4] p-3 font-sans text-[#15151f] md:p-6">
      <div className="mx-auto max-w-[1400px] overflow-hidden rounded-2xl bg-white shadow-sm">
        {/* Top bar */}
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-[#eceef3] px-6 py-3.5">
          <div className="flex items-center gap-2 text-2xl font-bold">
            <span className="text-3xl">🩸</span>
            <span>
              Blood<span className="text-[#d90f1f]">Connect</span>
            </span>
          </div>

          <div className="hidden max-w-md flex-1 items-center gap-2 rounded-xl border border-[#eceef3] px-3.5 py-2 md:flex">
            🔍
            <input
              type="text"
              placeholder="Search donors, hospitals, requests..."
              className="w-full bg-transparent text-[13px] outline-none"
            />
          </div>

          <div className="flex items-center gap-3.5">
            <button className="relative grid h-10 w-10 place-items-center rounded-full border border-[#eceef3] bg-white">
              🔔
              <span className="absolute right-2 top-1.5 h-2 w-2 rounded-full border-2 border-white bg-[#d90f1f]" />
            </button>
            <div className="flex items-center gap-2.5">
              <div className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-gray-600 to-gray-900 text-sm font-bold text-white">
                AD
              </div>
              <div className="leading-tight">
                <strong className="block text-[13px]">Admin</strong>
                <small className="text-[11px] text-gray-500">System Administrator</small>
              </div>
            </div>
          </div>
        </header>

        <div className="grid bg-[#f6f7fb] md:grid-cols-[200px_minmax(0,1fr)]">
          {/* Sidebar */}
          <aside className="flex flex-col gap-5 border-r border-[#eceef3] bg-white p-2.5 py-3.5">
            <nav className="flex flex-row flex-wrap gap-1 md:flex-col">
              {navItems.map((n) => (
                <button
                  key={n.label}
                  onClick={() => setActive(n.label)}
                  className={`rounded-lg px-3.5 py-3 text-left text-sm font-medium transition ${
                    active === n.label
                      ? "bg-[#d90f1f] font-semibold text-white"
                      : "text-[#222] hover:bg-[#fdeceb]"
                  }`}
                >
                  {n.icon} {n.label}
                </button>
              ))}
            </nav>

            <div className="mt-auto hidden rounded-xl bg-gradient-to-b from-[#fdeceb] to-white px-2.5 py-4 text-center md:block">
              <div className="mb-2 text-5xl">🩸🤲</div>
              <h4 className="text-[22px] leading-tight text-[#d90f1f]" style={{ fontFamily: "'Brush Script MT','Segoe Script',cursive" }}>
                Together
                <br />
                We Save Lives
              </h4>
              <p className="mt-2 text-[11px] text-gray-600">
                Manage. Support.
                <br />
                Create Greater Impact.
              </p>
            </div>
          </aside>

          {/* Main */}
          <main className="flex min-w-0 flex-col gap-3 p-3">
            {/* Welcome */}
            <section className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-gradient-to-r from-[#fde8e7] to-white px-6 py-5">
              <div>
                <h1 className="text-3xl font-extrabold">Welcome Back, Admin!</h1>
                <p className="mt-1 text-sm text-gray-700">
                  Here's an overview of your BloodConnect platform today.
                </p>
              </div>
              <div className="hidden text-5xl md:block">❤️🩸</div>
              <div className="flex items-center gap-3.5 rounded-xl bg-white px-5 py-3.5 shadow-sm">
                <span className="text-4xl text-[#d90f1f]">👥</span>
                <div>
                  <small className="block text-[11px] text-gray-500">Total Lives Impacted</small>
                  <b className="block text-[26px] leading-tight text-[#d90f1f]">2,850+</b>
                  <small className="block text-[11px] text-gray-500">through donations and support</small>
                </div>
              </div>
            </section>

            {/* Stat cards */}
            <section className="grid grid-cols-2 gap-3 xl:grid-cols-5">
              {stats.map((s) => (
                <div key={s.label} className="relative flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm">
                  <div
                    className="grid h-12 w-12 place-items-center rounded-xl text-[22px] text-white"
                    style={{ background: s.color }}
                  >
                    {s.icon}
                  </div>
                  <div>
                    <small className="block text-xs font-semibold">{s.label}</small>
                    <b className="block text-[28px] leading-tight">{s.value}</b>
                    <span className="text-[11px] font-semibold text-[#16a34a]">↑ {s.change} from last month</span>
                  </div>
                  <span className="absolute right-3 top-3 grid h-5 w-5 place-items-center rounded-full border border-[#eceef3] text-[11px] text-gray-600">
                    ›
                  </span>
                </div>
              ))}
            </section>

            {/* Charts row */}
            <section className="grid gap-3 xl:grid-cols-[1.35fr_1fr_1.2fr]">
              <Card
                title="Blood Requests Trend"
                icon="📈"
                action={
                  <select
                    value={range}
                    onChange={(e) => setRange(Number(e.target.value))}
                    className="rounded-lg border border-[#eceef3] bg-white px-2 py-1 text-[11px]"
                  >
                    <option value={6}>Last 6 Months</option>
                    <option value={3}>Last 3 Months</option>
                  </select>
                }
              >
                <LineChart labels={trend.labels.slice(-range)} values={trend.values.slice(-range)} />
              </Card>

              <Card title="Blood Group Distribution" icon="🩸">
                <div className="flex items-center gap-4">
                  <div
                    className="h-[130px] w-[130px] shrink-0 rounded-full"
                    style={{ background: `conic-gradient(${pieStops})` }}
                  />
                  <ul className="flex flex-1 flex-col gap-1.5 text-xs">
                    {groups.map((g) => (
                      <li key={g.name} className="flex items-center gap-2">
                        <i className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: g.color }} />
                        {g.name}
                        <span className="ml-auto font-semibold">{g.pct}%</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Card>

              <Card title="Recent Blood Requests" icon="🕒" action={<ViewAll />}>
                {requests.length > 0 ? (
                  requests.map((r, i) => (
                    <div key={i} className="flex items-center gap-2.5 border-b border-[#eceef3] py-2.5 last:border-0">
                      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#fdeceb] text-[#d90f1f]">
                        🩸
                      </div>
                      <div className="flex-1 text-xs font-semibold">
                        {r.text}
                        <small className="mt-0.5 block font-medium text-gray-500">
                          {r.units} •{" "}
                          <span className={r.level === "Urgent" ? "text-[#d90f1f]" : ""}>{r.level}</span>
                        </small>
                      </div>
                      <time className="text-[11px] text-gray-500">{r.time}</time>
                      <button className="rounded-lg bg-[#d90f1f] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[#b80a18]">
                        View
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="py-4 text-center text-xs text-gray-500">No recent blood requests found.</p>
                )}
              </Card>
            </section>

            {/* Tables row */}
            <section className="grid gap-3 xl:grid-cols-[1.2fr_1.1fr_1.1fr]">
              <Card title="Recent Registered Users" icon="👥" action={<ViewAll />}>
                <table className="w-full border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#f6f7fb] text-left text-[11px]">
                      {["Name", "Type", "Location", "Status", "Joined"].map((h) => (
                        <th key={h} className="p-2 font-semibold">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {users.length > 0 ? (
                      users.map((u, i) => (
                        <tr key={i} className="border-b border-[#eceef3] last:border-0">
                          <td className="p-2">
                            <div className="flex items-center gap-2 font-medium">
                              <span className="grid h-[26px] w-[26px] place-items-center rounded-full bg-gradient-to-br from-slate-300 to-slate-500 text-[10px] font-semibold text-white">
                                {initials(u.name)}
                              </span>
                              {u.name}
                            </div>
                          </td>
                          <td className="p-2">{u.type}</td>
                          <td className="p-2">{u.loc}</td>
                          <td className="p-2"><ActiveBadge /></td>
                          <td className="p-2">{u.joined}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="p-4 text-center text-xs text-gray-500">Loading users from Atlas...</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </Card>

              <Card title="Hospital Partners" icon="🏢" action={<ViewAll />}>
                <table className="w-full border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#f6f7fb] text-left text-[11px]">
                      {["Hospital Name", "Location", "Donations", "Status"].map((h) => (
                        <th key={h} className="p-2 font-semibold">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {partners.length > 0 ? (
                      partners.map((p, i) => (
                        <tr key={i} className="border-b border-[#eceef3] last:border-0">
                          <td className="p-2">
                            <span className="mr-1.5 inline-grid h-[22px] w-[22px] place-items-center rounded-md bg-[#d90f1f] text-[11px] text-white">
                              🏢
                            </span>
                            {p.name}
                          </td>
                          <td className="p-2">{p.loc}</td>
                          <td className="p-2">{p.donations}</td>
                          <td className="p-2"><ActiveBadge /></td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="p-4 text-center text-xs text-gray-500">Loading hospitals from Atlas...</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </Card>

              <Card title="System Controls" icon="⚙️">
                <div className="grid grid-cols-2 gap-2">
                  {controls.map((c) => (
                    <div
                      key={c.title}
                      className="relative flex cursor-pointer items-start gap-2 rounded-xl border border-[#eceef3] bg-white p-2.5 transition hover:border-[#d90f1f] hover:bg-[#fdeceb]"
                    >
                      <span className="text-xl text-[#d90f1f]">{c.icon}</span>
                      <div>
                        <b className="block text-[11px]">{c.title}</b>
                        <small className="mt-0.5 block text-[10px] text-gray-500">{c.desc}</small>
                      </div>
                      <span className="absolute bottom-1.5 right-2 text-[11px] text-[#d90f1f]">›</span>
                    </div>
                  ))}
                </div>
              </Card>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}