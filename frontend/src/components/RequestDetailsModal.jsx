import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Pencil, XCircle, CheckCircle2, Save } from "lucide-react";
import { updateBloodRequest } from "../api/bloodRequestApi";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const URGENCY = ["Normal", "Urgent", "Emergency"];

const STATUS_STYLE = {
  Pending: "bg-[#dbeafe] text-[#1d6fe0]",
  Matched: "bg-[#dcfce7] text-[#15803d]",
  Completed: "bg-[#dcfce7] text-[#15803d]",
  Cancelled: "bg-gray-200 text-gray-600",
};

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "-";

const toForm = (r) => ({
  patientName: r.patientName || "",
  bloodGroup: r.bloodGroup || "",
  units: r.units || 1,
  urgency: r.urgency || "Normal",
  hospitalName: r.hospitalName || "",
  hospitalLocation: r.hospitalLocation || "",
  contact: r.contact || "",
  dateNeeded: r.dateNeeded ? String(r.dateNeeded).slice(0, 10) : "",
  details: r.details || "",
});

const inputCls =
  "w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-[13px] outline-none focus:border-[#f30000] focus:ring-2 focus:ring-red-100";

function Row({ label, children }) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">{label}</p>
      <p className="mt-0.5 text-sm font-medium text-gray-900">{children || "-"}</p>
    </div>
  );
}

export default function RequestDetailsModal({ request, onClose, onUpdated }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(toForm(request));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  // request bodle gele form reset
  useEffect(() => {
    setForm(toForm(request));
    setEditing(false);
    setError("");
  }, [request]);

  // Esc chaple close
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const send = async (changes) => {
    setBusy(true);
    setError("");
    try {
      const updated = await updateBloodRequest(request._id, changes);
      onUpdated(updated);
      setEditing(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    send({ ...form, units: Number(form.units) });
  };

  const handleCancelRequest = () => {
    if (window.confirm("Are you sure you want to cancel this request?")) send({ status: "Cancelled" });
  };

  const handleComplete = () => {
    if (window.confirm("Mark this request as completed?")) send({ status: "Completed" });
  };

  const canEdit = request.status === "Pending";
  const canComplete = request.status === "Matched";
  const canCancel = request.status === "Pending" || request.status === "Matched";

  // Portal: dashboard scale hoye thakleo modal thik size e dekhabe
  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-gray-100 p-5">
          <div>
            <p className="text-xs font-semibold text-gray-500">{request.code}</p>
            <h2 className="text-lg font-bold">Blood Request Details</h2>
            <span
              className={`mt-2 inline-block rounded-md px-2.5 py-1 text-[11px] font-semibold ${
                STATUS_STYLE[request.status] || ""
              }`}
            >
              {request.status}
            </span>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="text-gray-500 hover:text-gray-900">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5">
          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[13px] text-red-700">
              {error}
            </div>
          )}

          {!editing ? (
            <div className="grid grid-cols-2 gap-4">
              <Row label="Patient">{request.patientName}</Row>
              <Row label="Blood Group">{request.bloodGroup}</Row>
              <Row label="Units">{request.units}</Row>
              <Row label="Urgency">{request.urgency}</Row>
              <Row label="Hospital">{request.hospitalName}</Row>
              <Row label="Location">{request.hospitalLocation}</Row>
              <Row label="Contact">{request.contact}</Row>
              <Row label="Date Needed">{fmtDate(request.dateNeeded)}</Row>
              <div className="col-span-2">
                <Row label="Additional Details">{request.details}</Row>
              </div>
            </div>
          ) : (
            <form id="edit-request-form" onSubmit={handleSave} className="grid grid-cols-2 gap-3">
              <label className="col-span-2 text-[12px] font-semibold">
                Patient Name
                <input className={`${inputCls} mt-1`} value={form.patientName} onChange={set("patientName")} required />
              </label>
              <label className="text-[12px] font-semibold">
                Blood Group
                <select className={`${inputCls} mt-1`} value={form.bloodGroup} onChange={set("bloodGroup")} required>
                  {BLOOD_GROUPS.map((g) => (
                    <option key={g}>{g}</option>
                  ))}
                </select>
              </label>
              <label className="text-[12px] font-semibold">
                Units
                <select className={`${inputCls} mt-1`} value={form.units} onChange={set("units")} required>
                  {[1, 2, 3, 4, 5, 6].map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-[12px] font-semibold">
                Urgency
                <select className={`${inputCls} mt-1`} value={form.urgency} onChange={set("urgency")}>
                  {URGENCY.map((u) => (
                    <option key={u}>{u}</option>
                  ))}
                </select>
              </label>
              <label className="text-[12px] font-semibold">
                Date Needed
                <input
                  type="date"
                  className={`${inputCls} mt-1`}
                  min={new Date().toISOString().split("T")[0]}
                  value={form.dateNeeded}
                  onChange={set("dateNeeded")}
                  required
                />
              </label>
              <label className="col-span-2 text-[12px] font-semibold">
                Hospital Name
                <input className={`${inputCls} mt-1`} value={form.hospitalName} onChange={set("hospitalName")} required />
              </label>
              <label className="text-[12px] font-semibold">
                Hospital Location
                <input className={`${inputCls} mt-1`} value={form.hospitalLocation} onChange={set("hospitalLocation")} required />
              </label>
              <label className="text-[12px] font-semibold">
                Contact
                <input className={`${inputCls} mt-1`} value={form.contact} onChange={set("contact")} required />
              </label>
              <label className="col-span-2 text-[12px] font-semibold">
                Additional Details
                <textarea
                  rows={2}
                  maxLength={500}
                  className={`${inputCls} mt-1 resize-none`}
                  value={form.details}
                  onChange={set("details")}
                />
              </label>
            </form>
          )}
        </div>

        {/* Footer buttons */}
        <div className="flex flex-wrap items-center justify-end gap-2 border-t border-gray-100 p-4">
          {editing ? (
            <>
              <button
                type="button"
                disabled={busy}
                onClick={() => {
                  setEditing(false);
                  setForm(toForm(request));
                  setError("");
                }}
                className="rounded-lg border border-gray-200 px-4 py-2 text-[13px] font-medium hover:bg-gray-50 disabled:opacity-50"
              >
                Discard
              </button>
              <button
                type="submit"
                form="edit-request-form"
                disabled={busy}
                className="flex items-center gap-2 rounded-lg bg-[#f30000] px-4 py-2 text-[13px] font-semibold text-white hover:bg-[#d10000] disabled:opacity-50"
              >
                <Save className="h-4 w-4" /> {busy ? "Saving..." : "Save Changes"}
              </button>
            </>
          ) : (
            <>
              {canCancel && (
                <button
                  type="button"
                  disabled={busy}
                  onClick={handleCancelRequest}
                  className="flex items-center gap-2 rounded-lg border border-[#f9c9cc] px-4 py-2 text-[13px] font-semibold text-[#f30000] hover:bg-[#fff1f2] disabled:opacity-50"
                >
                  <XCircle className="h-4 w-4" /> Cancel Request
                </button>
              )}
              {canComplete && (
                <button
                  type="button"
                  disabled={busy}
                  onClick={handleComplete}
                  className="flex items-center gap-2 rounded-lg bg-[#15803d] px-4 py-2 text-[13px] font-semibold text-white hover:bg-[#116c33] disabled:opacity-50"
                >
                  <CheckCircle2 className="h-4 w-4" /> Mark as Completed
                </button>
              )}
              {canEdit && (
                <button
                  type="button"
                  onClick={() => setEditing(true)}
                  className="flex items-center gap-2 rounded-lg bg-[#f30000] px-4 py-2 text-[13px] font-semibold text-white hover:bg-[#d10000]"
                >
                  <Pencil className="h-4 w-4" /> Edit
                </button>
              )}
              {!canEdit && !canComplete && !canCancel && (
                <p className="mr-auto text-[12px] text-gray-500">This request is {request.status.toLowerCase()} and can no longer be changed.</p>
              )}
            </>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}