import React, { useState, useRef, useLayoutEffect } from "react";
import {
  Heart,
  ClipboardList,
  Lightbulb,
  CheckCircle2,
  Siren,
  Phone,
  MessageCircle,
  MapPin,
  Building2,
  CalendarDays,
  Pencil,
  Send,
  ChevronDown,
} from "lucide-react";

const DESIGN_W = 1440; // minimum design width
const MAX_W = 2000; // widest the frame can stretch on very wide screens

const RequestBlood = () => {
  const [formData, setFormData] = useState({
    patientName: "",
    bloodGroup: "",
    units: "",
    urgency: "Normal",
    hospitalName: "",
    hospitalLocation: "",
    contact: "",
    dateNeeded: "",
    details: "",
  });

  // ---- fit whole page into one screen (no scroll) on desktop ----
  const frameRef = useRef(null);
  const [fit, setFit] = useState({ desktop: false, scale: 1, top: 0, w: DESIGN_W });

  useLayoutEffect(() => {
    const el = frameRef.current;
    const calc = () => {
      if (window.innerWidth < 1024) {
        setFit({ desktop: false, scale: 1, top: 0, w: DESIGN_W });
        return;
      }
      const nh = el.offsetHeight;
      const scale = Math.min(window.innerWidth / DESIGN_W, window.innerHeight / nh);
      // fill the full screen width: stretch the frame instead of leaving side gaps
      const w = Math.min(MAX_W, Math.max(DESIGN_W, window.innerWidth / scale));
      const top = Math.max(0, (window.innerHeight - nh * scale) / 2);
      setFit((p) =>
        p.desktop && Math.abs(p.scale - scale) < 0.003 && Math.abs(p.w - w) < 4
          ? p
          : { desktop: true, scale, top, w }
      );
    };
    calc();
    window.addEventListener("resize", calc);
    const ro = new ResizeObserver(calc);
    ro.observe(el);
    return () => {
      window.removeEventListener("resize", calc);
      ro.disconnect();
    };
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Blood request submitted successfully!");
    console.log(formData);
  };

  const banks = [
    { name: "Chattogram Medical College Blood Bank", distance: "2.1 km" },
    { name: "Aga Khan Hospital Blood Bank", distance: "4.3 km" },
    { name: "Chittagong General Hospital", distance: "5.8 km" },
  ];

  const tips = [
    "Provide accurate patient and hospital details",
    "Mention the exact blood group and units needed",
    "Keep your contact number active",
    "Be specific about the urgency and date needed",
    "Add any additional medical information if available",
  ];

  const inputClass =
    "w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2 text-[13px] text-gray-800 placeholder-gray-400 outline-none transition focus:border-[#f30000] focus:ring-2 focus:ring-red-100";

  const labelClass = "mb-1.5 block text-[13px] font-semibold text-gray-900";

  const cardClass =
    "rounded-2xl border border-[#fde2e4] bg-[#fff6f6] p-4 shadow-sm";

  const Star = () => <span className="text-[#f30000]">*</span>;

  return (
    <div
      className={`bg-gradient-to-br from-[#dde5ee] to-[#cbd5e1] text-[#030503] ${
        fit.desktop ? "h-screen w-screen overflow-hidden" : "min-h-screen"
      }`}
    >
      <div
        ref={frameRef}
        className="p-3 lg:p-5"
        style={
          fit.desktop
            ? {
                width: fit.w,
                marginLeft: `calc(50% - ${fit.w / 2}px)`,
                marginTop: fit.top,
                transform: `scale(${fit.scale})`,
                transformOrigin: "top center",
              }
            : undefined
        }
      >
      <div className="overflow-hidden rounded-3xl bg-white shadow-xl">
      <main className="bg-gradient-to-b from-[#fff3f4] to-white p-4 lg:p-5">
        <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[2.2fr_1fr]">
          {/* ================= LEFT SIDE ================= */}
          <section className="min-w-0">
            {/* HERO */}
            <div className="relative min-h-[185px] overflow-hidden rounded-t-2xl bg-gradient-to-r from-[#fefaf9] via-[#fff1f2] to-[#ffe3e4] px-6 pb-10 pt-5 lg:px-8">
              {/* Image from public folder */}
              <img
                src="/blood-heart.png"
                alt="Hands holding a red heart"
                className="pointer-events-none absolute right-[14%] top-0 hidden h-full w-[48%] object-contain object-right [mask-image:linear-gradient(to_right,transparent,black_25%,black_85%,transparent)] md:block"
                onError={(e) => {
                  console.error("Blood heart image could not load:", e.currentTarget.src);
                }}
              />

              <div className="relative z-10">
                <span className="inline-flex items-center gap-2 rounded-full bg-[#ffe3e4] px-4 py-1.5 text-[13px] font-medium text-[#f30000]">
                  <Heart className="h-3.5 w-3.5 fill-[#f30000]" /> Together We Save Lives
                </span>

                <h1 className="mt-4 text-4xl font-extrabold leading-none tracking-tight sm:text-5xl lg:text-[58px]">
                  Request <span className="text-[#f30000]">Blood</span>
                </h1>

                <p className="mt-3 text-sm text-[#4b5563] sm:text-[17px]">
                  Submit a blood request and get help from nearby donors
                </p>
              </div>

              {/* Handwritten text (needs Caveat font in index.html) */}
              <p
                className="absolute right-8 top-1/2 z-10 hidden -translate-y-[58%] -rotate-12 whitespace-nowrap text-[32px] font-semibold leading-[27px] text-[#f30000] lg:block"
                style={{ fontFamily: "'Caveat', cursive" }}
              >
                A Small<br />Request<br />Can Save<br />A Life
              </p>
            </div>

            {/* FORM CARD (overlaps hero) */}
            <div className="relative -mt-6 rounded-2xl border border-slate-100 bg-white p-5 shadow-md">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#ffe3e4]">
                  <ClipboardList className="h-5 w-5 text-[#f30000]" />
                </div>
                <div>
                  <h2 className="text-base font-bold sm:text-lg">Blood Request Details</h2>
                  <p className="mt-0.5 text-xs text-slate-500">
                    Please provide accurate information to help us find the right donors quickly.
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 gap-3.5 md:grid-cols-4 lg:grid-cols-[1.2fr_1fr_1fr_1fr]">
                  {/* Patient Name */}
                  <div>
                    <label className={labelClass}>
                      Patient Name <Star />
                    </label>
                    <input
                      className={inputClass}
                      type="text"
                      name="patientName"
                      placeholder="Enter patient name"
                      value={formData.patientName}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  {/* Blood Group */}
                  <div>
                    <label className={labelClass}>
                      Blood Group <Star />
                    </label>
                    <div className="relative">
                      <select
                        className={`${inputClass} appearance-none pr-9 ${
                          formData.bloodGroup === "" ? "text-gray-400" : ""
                        }`}
                        name="bloodGroup"
                        value={formData.bloodGroup}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Select Blood Group</option>
                        {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((g) => (
                          <option key={g} value={g} className="text-gray-800">
                            {g}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-800" />
                    </div>
                  </div>

                  {/* Units */}
                  <div>
                    <label className={labelClass}>
                      Units Needed <Star />
                    </label>
                    <div className="relative">
                      <select
                        className={`${inputClass} appearance-none pr-9 ${
                          formData.units === "" ? "text-gray-400" : ""
                        }`}
                        name="units"
                        value={formData.units}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Select Units</option>
                        {[1, 2, 3, 4, 5, 6].map((u) => (
                          <option key={u} value={u} className="text-gray-800">
                            {u} {u === 1 ? "Unit" : "Units"}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-800" />
                    </div>
                  </div>

                  {/* Urgency */}
                  <div>
                    <label className={labelClass}>
                      Urgency <Star />
                    </label>
                    <div className="relative">
                      <select
                        className={`${inputClass} appearance-none pr-9`}
                        name="urgency"
                        value={formData.urgency}
                        onChange={handleChange}
                        required
                      >
                        <option>Normal</option>
                        <option>Urgent</option>
                        <option>Emergency</option>
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-800" />
                    </div>
                  </div>

                  {/* Hospital Name */}
                  <div className="md:col-span-2">
                    <label className={labelClass}>
                      Hospital Name <Star />
                    </label>
                    <input
                      className={inputClass}
                      type="text"
                      name="hospitalName"
                      placeholder="Enter hospital name"
                      value={formData.hospitalName}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  {/* Hospital Location */}
                  <div className="md:col-span-2">
                    <label className={labelClass}>
                      Hospital Location <Star />
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#f30000]" />
                      <input
                        className={`${inputClass} pl-10`}
                        type="text"
                        name="hospitalLocation"
                        placeholder="Enter hospital location (city/area)"
                        value={formData.hospitalLocation}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  {/* Contact */}
                  <div className="md:col-span-2">
                    <label className={labelClass}>
                      Contact Number <Star />
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                      <input
                        className={`${inputClass} pl-10`}
                        type="tel"
                        name="contact"
                        placeholder="Enter contact number"
                        value={formData.contact}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  {/* Date Needed */}
                  <div className="md:col-span-2">
                    <label className={labelClass}>
                      Date Needed <Star />
                    </label>
                    <div className="relative">
                      <CalendarDays className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                      <input
                        className={`${inputClass} pl-10`}
                        type="text"
                        name="dateNeeded"
                        placeholder="Select date needed"
                        min={new Date().toISOString().split("T")[0]}
                        value={formData.dateNeeded}
                        onChange={handleChange}
                        onFocus={(e) => {
                          e.target.type = "date";
                          e.target.showPicker?.();
                        }}
                        onBlur={(e) => {
                          if (!e.target.value) e.target.type = "text";
                        }}
                        required
                      />
                    </div>
                  </div>

                  {/* Additional Details */}
                  <div className="md:col-span-4">
                    <label className={labelClass}>Additional Details (Optional)</label>
                    <div className="relative">
                      <Pencil className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-500" />
                      <textarea
                        rows={2}
                        className={`${inputClass} resize-none pb-6 pl-10`}
                        name="details"
                        maxLength={500}
                        placeholder="Write any additional information (e.g. patient condition, special requirements, etc.)"
                        value={formData.details}
                        onChange={handleChange}
                      />
                      <span className="absolute bottom-2 right-3 text-[11px] text-gray-500">
                        {formData.details.length}/500
                      </span>
                    </div>
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-[#f30000] py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-[#d10000] active:scale-[0.99]"
                >
                  <Send className="h-4 w-4" /> Submit Request
                </button>
              </form>
            </div>
          </section>

          {/* ================= SIDEBAR ================= */}
          <aside className="min-w-0 space-y-3.5">
            {/* Request Tips */}
            <div className={cardClass}>
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#ffe3e4]">
                  <Lightbulb className="h-5 w-5 text-[#f30000]" />
                </div>
                <h2 className="text-lg font-bold">Request Tips</h2>
              </div>

              <ul className="space-y-2.5">
                {tips.map((tip) => (
                  <li key={tip} className="flex items-center gap-3 text-[13px] text-gray-700">
                    <CheckCircle2 className="h-5 w-5 shrink-0 fill-[#f30000] text-white" />
                    {tip}
                  </li>
                ))}
              </ul>
            </div>

            {/* Emergency */}
            <div className={cardClass}>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#ffe3e4]">
                  <Siren className="h-6 w-6 text-[#f30000]" />
                </div>
                <div>
                  <h2 className="font-bold">Need Immediate Help?</h2>
                  <p className="text-xs text-gray-500">Our team is here to assist you 24/7.</p>
                </div>
              </div>

              <div className="mt-4 flex gap-3">
                <a
                  href="tel:999"
                  className="flex flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-[#f30000] py-3 text-[13px] font-semibold text-white transition hover:bg-[#d10000]"
                >
                  <Phone className="h-4 w-4 fill-white" /> Call Emergency Support
                </a>
                <button
                  type="button"
                  onClick={() => alert("Live chat will be available soon.")}
                  className="flex items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-[#fde2e4] bg-white px-4 text-[13px] font-medium text-[#f30000] transition hover:bg-[#fff1f2]"
                >
                  <MessageCircle className="h-4 w-4" /> Live Chat
                </button>
              </div>
            </div>

            {/* Nearby Blood Banks */}
            <div className={cardClass}>
              <div className="mb-3 flex items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <MapPin className="h-7 w-7 fill-[#f30000] text-[#fff6f6]" />
                  <h2 className="font-bold">Nearby Blood Banks</h2>
                </div>
                <button
                  type="button"
                  onClick={() => alert("Nearby blood banks list coming soon.")}
                  className="shrink-0 rounded-md border border-[#fde2e4] bg-white px-2.5 py-1 text-[11px] font-medium text-[#f30000] hover:bg-[#fff1f2]"
                >
                  View All
                </button>
              </div>

              <div className="divide-y divide-gray-100">
                {banks.map((bank) => (
                  <div key={bank.name} className="flex items-center gap-3 py-2.5">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100">
                      <Building2 className="h-5 w-5 text-slate-600" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="text-[12px] font-semibold leading-tight">{bank.name}</h3>
                      <p className="mt-0.5 flex items-center gap-1 text-[11px] font-medium">
                        <MapPin className="h-3 w-3 fill-[#f30000] text-[#f30000]" /> {bank.distance}
                      </p>
                      <p className="text-[10px] text-gray-500">Chattogram, Bangladesh</p>
                    </div>

                    <a
                      href="tel:999"
                      className="flex shrink-0 items-center gap-1.5 rounded-lg border border-[#fde2e4] bg-white px-3 py-2 text-[11px] font-medium text-gray-800 transition hover:bg-[#fff1f2]"
                    >
                      <Phone className="h-3.5 w-3.5 fill-[#f30000] text-[#f30000]" /> Contact
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </main>
      </div>
      </div>
    </div>
  );
};

export default RequestBlood;