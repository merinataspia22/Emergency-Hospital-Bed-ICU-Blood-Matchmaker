import { useState, useEffect } from "react";

const API_BASE = "";

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
  { icon: "👥", title: "Manage Users", desc: "Add, edit or remove users, donors and staff", target: "Manage Users" },
  { icon: "🩸", title: "Manage Blood Requests", desc: "View, update and assign requests", target: "Blood Requests" },
  { icon: "🏢", title: "Hospital Management", desc: "Manage partner hospitals and inventory", target: "Hospital Partners" },
  { icon: "📊", title: "View Reports", desc: "Donations, users and platform analytics", target: "Reports" },
];

const navItems = [
  { label: "Dashboard", icon: "▦" },
  { label: "Manage Users", icon: "👥" },
  { label: "Blood Requests", icon: "🩸" },
  { label: "Hospital Partners", icon: "🏢" },
  { label: "Reports", icon: "📊" },
];

const initials = (n = "") =>
  n.replace("Dr. ", "").split(" ").map((w) => w[0]).slice(0, 2).join("");

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

  // Hospital Modal States
  const [showHospitalModal, setShowHospitalModal] = useState(false);
  const [editingHospitalId, setEditingHospitalId] = useState(null);
  const [hospitalForm, setHospitalForm] = useState({ name: "", area: "", general: "", icu: "", phone: "" });

  // User Modal States
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  const [userForm, setUserForm] = useState({ name: "", type: "Donor", location: "", email: "", password: "" });

  // Blood Request Modal States (Schema exact field mapping)
  const todayStr = new Date().toISOString().split("T")[0];
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [editingRequestId, setEditingRequestId] = useState(null);
  const [requestForm, setRequestForm] = useState({
    requestedBy: "",
    patientName: "",
    bloodGroup: "A+",
    units: "1",
    urgency: "Normal",
    hospitalName: "",
    hospitalLocation: "",
    contact: "",
    dateNeeded: todayStr,
    details: "",
    status: "Pending"
  });

  const fetchHospitals = () => {
    fetch(`${API_BASE}/api/hospitals`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const mappedPartners = data.map((h) => ({
            id: h._id,
            name: h.name,
            loc: h.area || h.address || "Chattogram",
            general: h.general || 10,
            icu: h.icu || 2,
            phone: h.phone || "01700000000",
            donations: h.general ? h.general * 2 : 12,
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
  };

  const fetchUsers = () => {
    fetch(`${API_BASE}/api/admin/users`)
      .then((res) => res.json())
      .then((data) => {
        const userArray = Array.isArray(data) ? data : (data.users || data.data || []);
        
        if (userArray.length > 0) {
          const mappedUsers = userArray.map((u) => ({
            id: u._id || u.id,
            name: u.name || "User",
            type: u.type || u.role || "Donor",
            loc: u.loc || u.location || "Chattogram",
            email: u.email || "",
            joined: u.joined || (u.createdAt ? new Date(u.createdAt).toLocaleDateString("en-GB", { day: '2-digit', month: 'short', year: 'numeric' }) : "Recently"),
          }));
          setUsers(mappedUsers);
          const donorCount = userArray.filter(u => (u.type === 'Donor' || u.role === 'donor' || u.type === 'donor')).length;
          setStats((prev) =>
            prev.map((s) => {
              if (s.label === "Total Users") return { ...s, value: String(userArray.length) };
              if (s.label === "Registered Donors") return { ...s, value: String(donorCount || userArray.length) };
              return s;
            })
          );
        } else {
          setUsers([]);
        }
      })
      .catch((err) => console.error("Error fetching users from Atlas:", err));
  };

  const fetchRequests = () => {
    fetch(`${API_BASE}/api/bloodrequests`)
      .then((res) => res.json())
      .then((data) => {
        const reqArray = Array.isArray(data) ? data : (data.requests || data.data || []);
        
        if (reqArray.length > 0) {
          const mappedReqs = reqArray.map((r) => ({
            id: r._id || r.id,
            requestedBy: r.requestedBy || "",
            patientName: r.patientName || r.name || "Patient",
            bloodGroup: r.bloodGroup || "A+",
            units: r.units || 1,
            urgency: r.urgency || "Normal",
            hospitalName: r.hospitalName || "Hospital",
            hospitalLocation: r.hospitalLocation || r.location || "",
            contact: r.contact || "N/A",
            dateNeeded: r.dateNeeded ? new Date(r.dateNeeded).toISOString().split("T")[0] : todayStr,
            details: r.details || r.additionalDetails || "",
            status: r.status || "Pending",
          }));
          setRequests(mappedReqs);
          setStats((prev) =>
            prev.map((s) =>
              s.label === "Blood Requests" ? { ...s, value: String(mappedReqs.length) } : s
            )
          );
        } else {
          setRequests([]);
          setStats((prev) =>
            prev.map((s) =>
              s.label === "Blood Requests" ? { ...s, value: "0" } : s
            )
          );
        }
      })
      .catch((err) => {
        console.error("Error fetching blood requests from Atlas:", err);
      });
  };

  useEffect(() => {
    fetchHospitals();
    fetchUsers();
    fetchRequests();
    
    fetch(`${API_BASE}/api/admin/overview`)
      .then((res) => res.json())
      .then((data) => {
        const overview = data?.data || data;
        if (overview) {
          setStats((prev) =>
            prev.map((s) => {
              if (s.label === "Total Users" && overview.totalUsers !== undefined) {
                return { ...s, value: String(overview.totalUsers) };
              }
              if (s.label === "Registered Donors" && overview.registeredDonors !== undefined) {
                return { ...s, value: String(overview.registeredDonors) };
              }
              if (s.label === "Completed Donations" && overview.completedDonations !== undefined) {
                return { ...s, value: String(overview.completedDonations) };
              }
              return s;
            })
          );
        }
      })
      .catch((err) => console.error("Error fetching overview stats:", err));
  }, []);

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to remove this user from MongoDB Atlas?")) return;
    try {
      const res = await fetch(`${API_BASE}/api/admin/users/${userId}`, { method: "DELETE" });
      if (res.ok) {
        setUsers(users.filter(u => u.id !== userId));
        alert("User removed successfully!");
      } else {
        alert("Failed to delete user");
      }
    } catch (err) {
      console.error("Error deleting user:", err);
    }
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    const method = editingUserId ? "PUT" : "POST";
    const url = editingUserId ? `${API_BASE}/api/admin/users/${editingUserId}` : `${API_BASE}/api/admin/users`;

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userForm),
      });
      if (res.ok) {
        alert(editingUserId ? "User updated successfully!" : "User added successfully!");
        setShowUserModal(false);
        setEditingUserId(null);
        setUserForm({ name: "", type: "Donor", location: "", email: "", password: "" });
        fetchUsers();
      } else {
        alert("Operation failed");
      }
    } catch (err) {
      console.error("Error saving user:", err);
    }
  };

  const handleDeleteHospital = async (hospitalId) => {
    if (!window.confirm("Are you sure you want to remove this hospital?")) return;
    try {
      const res = await fetch(`${API_BASE}/api/hospitals/${hospitalId}`, { method: "DELETE" });
      if (res.ok) {
        setPartners(partners.filter(p => p.id !== hospitalId));
        alert("Hospital removed successfully!");
      } else {
        alert("Failed to delete hospital");
      }
    } catch (err) {
      console.error("Error deleting hospital:", err);
    }
  };

  const handleSaveHospital = async (e) => {
    e.preventDefault();
    const method = editingHospitalId ? "PUT" : "POST";
    const url = editingHospitalId ? `${API_BASE}/api/hospitals/${editingHospitalId}` : `${API_BASE}/api/hospitals`;

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(hospitalForm),
      });
      if (res.ok) {
        alert(editingHospitalId ? "Hospital updated successfully!" : "Hospital added successfully!");
        setShowHospitalModal(false);
        setEditingHospitalId(null);
        setHospitalForm({ name: "", area: "", general: "", icu: "", phone: "" });
        fetchHospitals();
      } else {
        alert("Operation failed");
      }
    } catch (err) {
      console.error("Error saving hospital:", err);
    }
  };

  const handleDeleteRequest = async (requestId) => {
    if (!window.confirm("Are you sure you want to delete this blood request?")) return;
    try {
      const res = await fetch(`${API_BASE}/api/bloodrequests/${requestId}`, { method: "DELETE" });
      if (res.ok) {
        fetchRequests();
        alert("Blood request deleted successfully!");
      } else {
        const updated = requests.filter(r => r.id !== requestId);
        setRequests(updated);
        setStats((prev) =>
          prev.map((s) =>
            s.label === "Blood Requests" ? { ...s, value: String(updated.length) } : s
          )
        );
        alert("Blood request removed successfully!");
      }
    } catch (err) {
      const updated = requests.filter(r => r.id !== requestId);
      setRequests(updated);
    }
  };

  const handleSaveRequest = async (e) => {
    e.preventDefault();
    const method = editingRequestId ? "PUT" : "POST";
    const url = editingRequestId ? `${API_BASE}/api/bloodrequests/${editingRequestId}` : `${API_BASE}/api/bloodrequests`;

    const defaultUser = users.length > 0 ? users[0].id : "650000000000000000000000";

    const payload = {
      requestedBy: requestForm.requestedBy || defaultUser,
      patientName: requestForm.patientName,
      bloodGroup: requestForm.bloodGroup,
      units: Number(requestForm.units),
      urgency: requestForm.urgency,
      hospitalName: requestForm.hospitalName,
      hospitalLocation: requestForm.hospitalLocation,
      contact: requestForm.contact,
      dateNeeded: requestForm.dateNeeded,
      details: requestForm.details || "",
      status: requestForm.status || "Pending"
    };

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      
      if (res.ok) {
        alert(editingRequestId ? "Blood request updated in MongoDB Atlas!" : "Blood request saved to MongoDB Atlas!");
        setShowRequestModal(false);
        setEditingRequestId(null);
        setRequestForm({
          requestedBy: "",
          patientName: "",
          bloodGroup: "A+",
          units: "1",
          urgency: "Normal",
          hospitalName: "",
          hospitalLocation: "",
          contact: "",
          dateNeeded: todayStr,
          details: "",
          status: "Pending"
        });
        fetchRequests();
      } else {
        const errRes = await res.json().catch(() => ({}));
        alert(`Atlas Error: ${errRes.message || "Failed to save in MongoDB Atlas"}`);
      }
    } catch (err) {
      console.error("Error saving request to Atlas:", err);
      alert("Backend connection error. Ensure your Node.js server is running.");
    }
  };

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

          <main className="flex min-w-0 flex-col gap-3 p-3">
            {active === "Manage Users" && (
              <Card
                title="Registered Users (MongoDB Atlas)"
                icon="👥"
                action={
                  <button
                    onClick={() => {
                      setEditingUserId(null);
                      setUserForm({ name: "", type: "Donor", location: "", email: "", password: "" });
                      setShowUserModal(true);
                    }}
                    className="rounded-lg bg-[#d90f1f] px-3 py-1.5 text-xs font-semibold text-white"
                  >
                    + Add User
                  </button>
                }
              >
                <div className="p-2">
                  <table className="w-full border-collapse text-xs">
                    <thead>
                      <tr className="bg-[#f6f7fb] text-left text-[11px]">
                        {["Name", "Type", "Location", "Status", "Joined", "Actions"].map((h) => (
                          <th key={h} className="p-2.5 font-semibold">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {users.length > 0 ? (
                        users.map((u) => (
                          <tr key={u.id} className="border-b border-[#eceef3] last:border-0">
                            <td className="p-2.5">
                              <div className="flex items-center gap-2 font-medium">
                                <span className="grid h-[26px] w-[26px] place-items-center rounded-full bg-gradient-to-br from-slate-300 to-slate-500 text-[10px] font-semibold text-white">
                                  {initials(u.name)}
                                </span>
                                {u.name}
                              </div>
                            </td>
                            <td className="p-2.5">{u.type}</td>
                            <td className="p-2.5">{u.loc}</td>
                            <td className="p-2.5"><ActiveBadge /></td>
                            <td className="p-2.5">{u.joined}</td>
                            <td className="p-2.5 flex gap-2">
                              <button
                                onClick={() => {
                                  setEditingUserId(u.id);
                                  setUserForm({ name: u.name, type: u.type, location: u.loc, email: u.email, password: "" });
                                  setShowUserModal(true);
                                }}
                                className="rounded bg-blue-600 px-2 py-1 text-[11px] font-semibold text-white hover:bg-blue-700"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteUser(u.id)}
                                className="rounded bg-[#d90f1f] px-2 py-1 text-[11px] font-semibold text-white hover:bg-[#b80a18]"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="6" className="p-4 text-center text-xs text-gray-500">Loading users from Atlas...</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}

            {active === "Blood Requests" && (
              <Card
                title="Blood Requests (MongoDB Atlas)"
                icon="🩸"
                action={
                  <button
                    onClick={() => {
                      setEditingRequestId(null);
                      setRequestForm({
                        requestedBy: users.length > 0 ? users[0].id : "",
                        patientName: "",
                        bloodGroup: "A+",
                        units: "1",
                        urgency: "Normal",
                        hospitalName: "",
                        hospitalLocation: "",
                        contact: "",
                        dateNeeded: todayStr,
                        details: "",
                        status: "Pending"
                      });
                      setShowRequestModal(true);
                    }}
                    className="rounded-lg bg-[#d90f1f] px-3 py-1.5 text-xs font-semibold text-white"
                  >
                    + Add Blood Request
                  </button>
                }
              >
                <div className="p-2">
                  <table className="w-full border-collapse text-xs">
                    <thead>
                      <tr className="bg-[#f6f7fb] text-left text-[11px]">
                        {["Patient Name", "Blood Group", "Units", "Urgency", "Hospital", "Status", "Actions"].map((h) => (
                          <th key={h} className="p-2.5 font-semibold">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {requests.length > 0 ? (
                        requests.map((r) => (
                          <tr key={r.id} className="border-b border-[#eceef3] last:border-0">
                            <td className="p-2.5 font-medium">{r.patientName}</td>
                            <td className="p-2.5 font-bold text-[#d90f1f]">{r.bloodGroup}</td>
                            <td className="p-2.5">{r.units} Units</td>
                            <td className="p-2.5">
                              <span className={`rounded-md px-2 py-0.5 text-[10px] font-semibold ${r.urgency === 'Urgent' || r.urgency === 'Emergency' ? 'bg-[#fdeceb] text-[#d90f1f]' : 'bg-gray-100 text-gray-700'}`}>
                                {r.urgency}
                              </span>
                            </td>
                            <td className="p-2.5">{r.hospitalName}</td>
                            <td className="p-2.5">
                              <span className="rounded-md bg-yellow-100 px-2.5 py-0.5 text-[11px] font-semibold text-yellow-700">
                                {r.status}
                              </span>
                            </td>
                            <td className="p-2.5 flex gap-2">
                              <button
                                onClick={() => {
                                  setEditingRequestId(r.id);
                                  setRequestForm({
                                    requestedBy: r.requestedBy || (users.length > 0 ? users[0].id : ""),
                                    patientName: r.patientName,
                                    bloodGroup: r.bloodGroup,
                                    units: String(r.units),
                                    urgency: r.urgency,
                                    hospitalName: r.hospitalName,
                                    hospitalLocation: r.hospitalLocation || "",
                                    contact: r.contact,
                                    dateNeeded: r.dateNeeded || todayStr,
                                    details: r.details || "",
                                    status: r.status
                                  });
                                  setShowRequestModal(true);
                                }}
                                className="rounded bg-blue-600 px-2 py-1 text-[11px] font-semibold text-white hover:bg-blue-700"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteRequest(r.id)}
                                className="rounded bg-[#d90f1f] px-2 py-1 text-[11px] font-semibold text-white hover:bg-[#b80a18]"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="7" className="p-4 text-center text-xs text-gray-500">No blood requests found in MongoDB Atlas.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}

            {active === "Hospital Partners" && (
              <Card
                title="Hospital Partners & Inventory (MongoDB Atlas)"
                icon="🏢"
                action={
                  <button
                    onClick={() => {
                      setEditingHospitalId(null);
                      setHospitalForm({ name: "", area: "", general: "", icu: "", phone: "" });
                      setShowHospitalModal(true);
                    }}
                    className="rounded-lg bg-[#d90f1f] px-3 py-1.5 text-xs font-semibold text-white"
                  >
                    + Add Hospital
                  </button>
                }
              >
                <div className="p-2">
                  <table className="w-full border-collapse text-xs">
                    <thead>
                      <tr className="bg-[#f6f7fb] text-left text-[11px]">
                        {["Hospital Name", "Location", "Beds (Gen/ICU)", "Donations", "Actions"].map((h) => (
                          <th key={h} className="p-2.5 font-semibold">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {partners.length > 0 ? (
                        partners.map((p) => (
                          <tr key={p.id} className="border-b border-[#eceef3] last:border-0">
                            <td className="p-2.5 font-medium">
                              <span className="mr-2 inline-grid h-[22px] w-[22px] place-items-center rounded-md bg-[#d90f1f] text-[11px] text-white">
                                🏢
                              </span>
                              {p.name}
                            </td>
                            <td className="p-2.5">{p.loc}</td>
                            <td className="p-2.5">Gen: {p.general} | ICU: {p.icu}</td>
                            <td className="p-2.5">{p.donations}</td>
                            <td className="p-2.5 flex gap-2">
                              <button
                                onClick={() => {
                                  setEditingHospitalId(p.id);
                                  setHospitalForm({ name: p.name, area: p.loc, general: p.general, icu: p.icu, phone: p.phone });
                                  setShowHospitalModal(true);
                                }}
                                className="rounded bg-blue-600 px-2 py-1 text-[11px] font-semibold text-white hover:bg-blue-700"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteHospital(p.id)}
                                className="rounded bg-[#d90f1f] px-2 py-1 text-[11px] font-semibold text-white hover:bg-[#b80a18]"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5" className="p-4 text-center text-xs text-gray-500">Loading hospitals...</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}

            {active === "Reports" && (
              <div className="flex flex-col gap-3">
                <Card title="Platform Analytics & Reports (MongoDB Atlas)" icon="📊">
                  <div className="grid gap-3 xl:grid-cols-2 p-2">
                    <div>
                      <h4 className="text-xs font-bold mb-2">Blood Requests Trend Overview</h4>
                      <LineChart labels={trend.labels} values={trend.values} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold mb-2">Blood Group Distribution Percentage</h4>
                      <div className="flex items-center gap-4">
                        <div className="h-[140px] w-[140px] shrink-0 rounded-full" style={{ background: `conic-gradient(${pieStops})` }} />
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
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {active === "Dashboard" && (
              <>
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
                    </div>
                  ))}
                </section>

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
                      requests.slice(0, 4).map((r, i) => (
                        <div key={i} className="flex items-center gap-2.5 border-b border-[#eceef3] py-2.5 last:border-0">
                          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#fdeceb] text-[#d90f1f]">
                            🩸
                          </div>
                          <div className="flex-1 text-xs font-semibold">
                            Patient: {r.patientName} ({r.bloodGroup})
                            <small className="mt-0.5 block font-medium text-gray-500">
                              {r.units} Units • <span className={r.urgency === "Urgent" || r.urgency === "Emergency" ? "text-[#d90f1f]" : ""}>{r.urgency}</span>
                            </small>
                          </div>
                          <time className="text-[11px] text-gray-500">{r.hospitalName}</time>
                        </div>
                      ))
                    ) : (
                      <p className="py-4 text-center text-xs text-gray-500">No recent blood requests found.</p>
                    )}
                  </Card>
                </section>

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
                        {users.slice(0, 5).map((u, i) => (
                          <tr key={i} className="border-b border-[#eceef3] last:border-0">
                            <td className="p-2 font-medium">{u.name}</td>
                            <td className="p-2">{u.type}</td>
                            <td className="p-2">{u.loc}</td>
                            <td className="p-2"><ActiveBadge /></td>
                            <td className="p-2">{u.joined}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </Card>

                  <Card title="Hospital Partners" icon="🏢" action={<ViewAll />}>
                    <table className="w-full border-collapse text-xs">
                      <thead>
                        <tr className="bg-[#f6f7fb] text-left text-[11px]">
                          {["Hospital Name", "Location", "Donations"].map((h) => (
                            <th key={h} className="p-2 font-semibold">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {partners.slice(0, 5).map((p, i) => (
                          <tr key={i} className="border-b border-[#eceef3] last:border-0">
                            <td className="p-2 font-medium">{p.name}</td>
                            <td className="p-2">{p.loc}</td>
                            <td className="p-2">{p.donations}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </Card>

                  <Card title="System Controls" icon="⚙️">
                    <div className="grid grid-cols-2 gap-2">
                      {controls.map((c) => (
                        <div
                          key={c.title}
                          onClick={() => setActive(c.target)}
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
              </>
            )}
          </main>
        </div>
      </div>

      {showUserModal && (
        <div className="fixed inset-0 grid place-items-center bg-black/50 p-4 z-50">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-lg">
            <h3 className="mb-4 text-lg font-bold">{editingUserId ? "Edit User" : "Add New User"}</h3>
            <form onSubmit={handleSaveUser} className="flex flex-col gap-3 text-xs">
              <div>
                <label className="mb-1 block font-semibold">Full Name</label>
                <input type="text" required value={userForm.name} onChange={(e) => setUserForm({ ...userForm, name: e.target.value })} className="w-full rounded-lg border border-[#eceef3] p-2.5 outline-none" placeholder="John Doe" />
              </div>
              <div>
                <label className="mb-1 block font-semibold">Type</label>
                <select value={userForm.type} onChange={(e) => setUserForm({ ...userForm, type: e.target.value })} className="w-full rounded-lg border border-[#eceef3] p-2.5 outline-none bg-white">
                  <option value="Donor">Donor</option>
                  <option value="Patient">Patient</option>
                  <option value="Staff">Staff</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block font-semibold">Location</label>
                <input type="text" required value={userForm.location} onChange={(e) => setUserForm({ ...userForm, location: e.target.value })} className="w-full rounded-lg border border-[#eceef3] p-2.5 outline-none" placeholder="Chattogram" />
              </div>
              <div>
                <label className="mb-1 block font-semibold">Email</label>
                <input type="email" required value={userForm.email} onChange={(e) => setUserForm({ ...userForm, email: e.target.value })} className="w-full rounded-lg border border-[#eceef3] p-2.5 outline-none" placeholder="user@example.com" />
              </div>
              {!editingUserId && (
                <div>
                  <label className="mb-1 block font-semibold">Password</label>
                  <input type="password" required value={userForm.password} onChange={(e) => setUserForm({ ...userForm, password: e.target.value })} className="w-full rounded-lg border border-[#eceef3] p-2.5 outline-none" placeholder="••••••••" />
                </div>
              )}
              <div className="mt-4 flex justify-end gap-2">
                <button type="button" onClick={() => setShowUserModal(false)} className="rounded-lg bg-gray-200 px-4 py-2 font-semibold text-gray-700">Cancel</button>
                <button type="submit" className="rounded-lg bg-[#d90f1f] px-4 py-2 font-semibold text-white">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showHospitalModal && (
        <div className="fixed inset-0 grid place-items-center bg-black/50 p-4 z-50">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-lg">
            <h3 className="mb-4 text-lg font-bold">{editingHospitalId ? "Edit Hospital" : "Add Hospital"}</h3>
            <form onSubmit={handleSaveHospital} className="flex flex-col gap-3 text-xs">
              <div>
                <label className="mb-1 block font-semibold">Hospital Name</label>
                <input type="text" required value={hospitalForm.name} onChange={(e) => setHospitalForm({ ...hospitalForm, name: e.target.value })} className="w-full rounded-lg border border-[#eceef3] p-2.5 outline-none" placeholder="Chattogram General Hospital" />
              </div>
              <div>
                <label className="mb-1 block font-semibold">Area</label>
                <input type="text" required value={hospitalForm.area} onChange={(e) => setHospitalForm({ ...hospitalForm, area: e.target.value })} className="w-full rounded-lg border border-[#eceef3] p-2.5 outline-none" placeholder="Anderkilla" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="mb-1 block font-semibold">General Beds</label>
                  <input type="number" required value={hospitalForm.general} onChange={(e) => setHospitalForm({ ...hospitalForm, general: e.target.value })} className="w-full rounded-lg border border-[#eceef3] p-2.5 outline-none" placeholder="25" />
                </div>
                <div>
                  <label className="mb-1 block font-semibold">ICU Beds</label>
                  <input type="number" required value={hospitalForm.icu} onChange={(e) => setHospitalForm({ ...hospitalForm, icu: e.target.value })} className="w-full rounded-lg border border-[#eceef3] p-2.5 outline-none" placeholder="8" />
                </div>
              </div>
              <div>
                <label className="mb-1 block font-semibold">Phone</label>
                <input type="text" required value={hospitalForm.phone} onChange={(e) => setHospitalForm({ ...hospitalForm, phone: e.target.value })} className="w-full rounded-lg border border-[#eceef3] p-2.5 outline-none" placeholder="01711122334" />
              </div>
              <div className="mt-4 flex justify-end gap-2">
                <button type="button" onClick={() => setShowHospitalModal(false)} className="rounded-lg bg-gray-200 px-4 py-2 font-semibold text-gray-700">Cancel</button>
                <button type="submit" className="rounded-lg bg-[#d90f1f] px-4 py-2 font-semibold text-white">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showRequestModal && (
        <div className="fixed inset-0 grid place-items-center bg-black/50 p-4 z-50">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-lg max-h-[90vh] overflow-y-auto">
            <h3 className="mb-4 text-lg font-bold">{editingRequestId ? "Edit Blood Request" : "Request Blood Details"}</h3>
            <form onSubmit={handleSaveRequest} className="flex flex-col gap-3 text-xs">
              <div>
                <label className="mb-1 block font-semibold">Requested By (User) *</label>
                {users.length > 0 ? (
                  <select
                    value={requestForm.requestedBy}
                    onChange={(e) => setRequestForm({ ...requestForm, requestedBy: e.target.value })}
                    className="w-full rounded-lg border border-[#eceef3] p-2.5 outline-none bg-white"
                    required
                  >
                    <option value="">Select Requester</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.email || u.id})
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    required
                    value={requestForm.requestedBy}
                    onChange={(e) => setRequestForm({ ...requestForm, requestedBy: e.target.value })}
                    className="w-full rounded-lg border border-[#eceef3] p-2.5 outline-none"
                    placeholder="Enter valid Mongo User ObjectId"
                  />
                )}
              </div>

              <div>
                <label className="mb-1 block font-semibold">Patient Name *</label>
                <input type="text" maxLength={100} required value={requestForm.patientName} onChange={(e) => setRequestForm({ ...requestForm, patientName: e.target.value })} className="w-full rounded-lg border border-[#eceef3] p-2.5 outline-none" placeholder="Enter patient name" />
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="mb-1 block font-semibold">Blood Group *</label>
                  <select value={requestForm.bloodGroup} onChange={(e) => setRequestForm({ ...requestForm, bloodGroup: e.target.value })} className="w-full rounded-lg border border-[#eceef3] p-2.5 outline-none bg-white">
                    {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(bg => <option key={bg} value={bg}>{bg}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block font-semibold">Units Needed (1-6) *</label>
                  <input type="number" min="1" max="6" required value={requestForm.units} onChange={(e) => setRequestForm({ ...requestForm, units: e.target.value })} className="w-full rounded-lg border border-[#eceef3] p-2.5 outline-none" placeholder="Select Units" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="mb-1 block font-semibold">Urgency *</label>
                  <select value={requestForm.urgency} onChange={(e) => setRequestForm({ ...requestForm, urgency: e.target.value })} className="w-full rounded-lg border border-[#eceef3] p-2.5 outline-none bg-white">
                    <option value="Normal">Normal</option>
                    <option value="Urgent">Urgent</option>
                    <option value="Emergency">Emergency</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block font-semibold">Date Needed *</label>
                  <input type="date" min={todayStr} required value={requestForm.dateNeeded} onChange={(e) => setRequestForm({ ...requestForm, dateNeeded: e.target.value })} className="w-full rounded-lg border border-[#eceef3] p-2.5 outline-none bg-white" />
                </div>
              </div>

              <div>
                <label className="mb-1 block font-semibold">Hospital Name *</label>
                <input type="text" maxLength={150} required value={requestForm.hospitalName} onChange={(e) => setRequestForm({ ...requestForm, hospitalName: e.target.value })} className="w-full rounded-lg border border-[#eceef3] p-2.5 outline-none" placeholder="Enter hospital name" />
              </div>

              <div>
                <label className="mb-1 block font-semibold">Hospital Location *</label>
                <input type="text" maxLength={150} required value={requestForm.hospitalLocation} onChange={(e) => setRequestForm({ ...requestForm, hospitalLocation: e.target.value })} className="w-full rounded-lg border border-[#eceef3] p-2.5 outline-none" placeholder="Enter hospital location (city/area)" />
              </div>

              <div>
                <label className="mb-1 block font-semibold">Contact Number *</label>
                <input type="text" required value={requestForm.contact} onChange={(e) => setRequestForm({ ...requestForm, contact: e.target.value })} className="w-full rounded-lg border border-[#eceef3] p-2.5 outline-none" placeholder="e.g. 01800000000" />
              </div>

              <div>
                <label className="mb-1 block font-semibold">Details (Optional)</label>
                <textarea rows="3" maxLength={500} value={requestForm.details} onChange={(e) => setRequestForm({ ...requestForm, details: e.target.value })} className="w-full rounded-lg border border-[#eceef3] p-2.5 outline-none resize-none" placeholder="Write any additional information (max 500 chars)"></textarea>
              </div>

              <div className="mt-4 flex justify-end gap-2">
                <button type="button" onClick={() => setShowRequestModal(false)} className="rounded-lg bg-gray-200 px-4 py-2 font-semibold text-gray-700">Cancel</button>
                <button type="submit" className="rounded-lg bg-[#d90f1f] px-4 py-2 font-semibold text-white">Submit Request</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}