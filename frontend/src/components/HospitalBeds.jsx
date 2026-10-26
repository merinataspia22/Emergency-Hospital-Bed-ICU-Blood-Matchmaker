import { useMemo, useState, useEffect } from "react";
import Navbar from "./Navbar";
import {
  Building2,
  MapPin,
  Stethoscope,
  BedDouble,
  Search,
  Phone,
  Check,
  AlertCircle,
  Droplet,
  Clock,
  ShieldCheck,
  CalendarDays,
  Heart,
} from "lucide-react";

const areas = [
  "Chawkbazar",
  "Agrabad",
  "Nasirabad",
  "Pahartali",
  "Halishahar",
];

const departments = [
  "Emergency",
  "General",
  "ICU",
  "Surgery",
  "Maternity",
];

function BloodBadge({ status }) {
  if (status === "Available") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-lg bg-[#e6f7ec] px-3 py-1.5 text-xs font-semibold text-[#16a34a]">
        <span className="grid h-4 w-4 place-items-center rounded-full bg-[#16a34a] text-white">
          <Check size={11} strokeWidth={3} />
        </span>
        Available
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-lg bg-[#fff1d6] px-3 py-1.5 text-xs font-semibold text-[#d97706]">
      <AlertCircle size={16} className="fill-[#f59e0b] text-white" />
      Limited
    </span>
  );
}

function HospImg({ src, alt, className = "" }) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div
        className={"grid shrink-0 place-items-center bg-gradient-to-br from-[#b9d3ee] to-[#5b8fc4] text-white " + className}
      >
        <Building2 size={22} />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      onError={() => setFailed(true)}
      className={`shrink-0 object-cover ${className}`}
    />
  );
}

function FallbackMap() {
  return (
    <div
      className="absolute inset-0 bg-[#e8efe3]"
      style={{
        backgroundImage:
          "linear-gradient(120deg, transparent 48%, #fff 49%, #fff 51%, transparent 52%), linear-gradient(30deg, transparent 58%, #fff 59%, #fff 60.5%, transparent 61.5%), linear-gradient(80deg, transparent 30%, #f6e9c9 31%, #f6e9c9 32.5%, transparent 33.5%)",
      }}
    >
      <div
        className="absolute left-0 top-0 h-full w-[28%] bg-[#bcd9f2]"
        style={{
          clipPath:
            "polygon(0 0, 100% 0, 60% 60%, 80% 100%, 0 100%)",
        }}
      />

      <span
        className="absolute text-[17px] font-bold"
        style={{ top: "38%", left: "36%" }}
      >
        Chattogram
      </span>

      <span
        className="absolute text-[10px] font-medium text-gray-600"
        style={{ top: "30%", left: "14%" }}
      >
        Halishahar
      </span>

      <span
        className="absolute text-[10px] font-medium text-gray-600"
        style={{ top: "58%", left: "32%" }}
      >
        Pahartali
      </span>

      <span
        className="absolute text-[10px] font-medium text-gray-600"
        style={{ top: "66%", left: "56%" }}
      >
        Nasirabad
      </span>

      {[
        ["24%", "18%"],
        ["28%", "50%"],
        ["54%", "70%"],
        ["64%", "26%"],
        ["66%", "50%"],
      ].map(([top, left], i) => (
        <div
          key={i}
          className="absolute grid h-6 w-6 -rotate-45 place-items-center rounded-[50%_50%_50%_0] bg-[#d90f1f] shadow-md"
          style={{ top, left }}
        >
          <span className="rotate-45 text-xs font-bold leading-none text-white">
            +
          </span>
        </div>
      ))}
    </div>
  );
}

const fieldCls = "w-full bg-transparent text-[13px] text-gray-600 outline-none";

export default function HospitalBeds() {
  const [hospitals, setHospitals] = useState([]);
  const [name, setName] = useState("");
  const [area, setArea] = useState("");
  const [dept, setDept] = useState("");
  const [bedType, setBedType] = useState("all");
  const [sortBy, setSortBy] = useState("distance");
  const [selectedId, setSelectedId] = useState(null);
  const [heroOk, setHeroOk] = useState(true);
  const [mapOk, setMapOk] = useState(true);

  // Fetching live hospitals data from backend API connected to MongoDB Atlas
  useEffect(() => {
    fetch("http://localhost:5000/api/hospitals")
      .then((res) => res.json())
      .then((data) => {
        setHospitals(data);
        if (data.length > 0) {
          setSelectedId(data[0]._id || data[0].id);
        }
      })
      .catch((err) => console.error("Error fetching hospitals from backend:", err));
  }, []);

  const list = useMemo(() => {
    const q = name.trim().toLowerCase();

    const filtered = hospitals.filter((h) => {
      if (q && !h.name.toLowerCase().includes(q)) return false;
      if (area && h.area !== area) return false;
      if (dept && h.depts && !h.depts.includes(dept)) return false;
      if (bedType === "general" && h.general <= 0) return false;
      if (bedType === "icu" && h.icu <= 0) return false;
      return true;
    });

    return filtered.sort((a, b) => {
      const distA = a.dist || 0;
      const distB = b.dist || 0;
      if (sortBy === "distance") return distA - distB;
      if (sortBy === "general") return b.general - a.general;
      if (sortBy === "icu") return b.icu - a.icu;
      return a.name.localeCompare(b.name);
    });
  }, [hospitals, name, area, dept, bedType, sortBy]);

  const selected =
    list.find((h) => h._id === selectedId || h.id === selectedId) || list[0] || null;

  const gridCols =
    "md:grid-cols-[2.4fr_1.3fr_0.9fr_1.1fr_1.4fr_1fr]";

  return (
    <div className="min-h-screen bg-[#f6f7fb] font-sans text-[#15151f]">
      <Navbar active="Hospital Beds" />

      <div className="grid lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-4">
        <main className="min-w-0 pb-4">
          <section className="flex min-h-[170px] items-center justify-between overflow-hidden bg-gradient-to-r from-white from-35% to-[#fde4e3] pl-6 md:pl-9">
            <div className="py-8">
              <h1 className="text-3xl font-extrabold tracking-tight md:text-[40px]">
                Find Available{" "}
                <span className="text-[#d90f1f]">Hospital Beds</span>
              </h1>

              <p className="mt-2.5 max-w-[520px] text-[15px] text-gray-700">
                Search real-time bed availability in nearby hospitals and get
                the help you need, faster.
              </p>
            </div>

            {heroOk ? (
              <img
                src="/images/hero-art.png"
                alt=""
                onError={() => setHeroOk(false)}
                className="hidden h-[170px] object-contain object-right md:block"
              />
            ) : (
              <div className="mr-9 hidden items-center gap-6 md:flex">
                <div className="grid h-[90px] w-[90px] place-items-center rounded-full bg-white shadow-[0_8px_24px_rgba(217,15,31,0.2)]">
                  <Heart
                    size={40}
                    className="fill-[#d90f1f] text-[#d90f1f]"
                  />
                </div>

                <div
                  className="-rotate-[8deg] text-[22px] leading-[1.1] text-[#d90f1f]"
                  style={{
                    fontFamily: "'Brush Script MT','Segoe Script',cursive",
                  }}
                >
                  Care<br />
                  Today,<br />
                  Stronger<br />
                  Tomorrow
                </div>
              </div>
            )}
          </section>

          <section className="mx-3.5 -mt-1 grid gap-3 rounded-2xl bg-white p-3.5 shadow-sm sm:grid-cols-2 xl:grid-cols-[repeat(4,1fr)_auto] xl:items-center">
            <div className="rounded-xl border border-[#eceef3] px-3 py-2">
              <label className="mb-1 flex items-center gap-2 text-xs font-semibold text-gray-800">
                <Building2 size={15} className="text-gray-700" />
                Hospital / Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Search hospital name"
                className={fieldCls}
              />
            </div>

            <div className="rounded-xl border border-[#eceef3] px-3 py-2">
              <label className="mb-1 flex items-center gap-2 text-xs font-semibold text-gray-800">
                <MapPin size={15} className="text-[#d90f1f]" />
                Area / Location
              </label>
              <select
                value={area}
                onChange={(e) => setArea(e.target.value)}
                className={fieldCls}
              >
                <option value="">Chattogram</option>
                {areas.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>

            <div className="rounded-xl border border-[#eceef3] px-3 py-2">
              <label className="mb-1 flex items-center gap-2 text-xs font-semibold text-gray-800">
                <Stethoscope size={15} className="text-gray-700" />
                Department
              </label>
              <select
                value={dept}
                onChange={(e) => setDept(e.target.value)}
                className={fieldCls}
              >
                <option value="">Select Department</option>
                {departments.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div className="rounded-xl border border-[#eceef3] px-3 py-2">
              <label className="mb-1 flex items-center gap-2 text-xs font-semibold text-gray-800">
                <BedDouble size={15} className="text-gray-700" />
                Bed Type
              </label>
              <select
                value={bedType}
                onChange={(e) => setBedType(e.target.value)}
                className={fieldCls}
              >
                <option value="all">All Bed Types</option>
                <option value="general">General</option>
                <option value="icu">ICU</option>
              </select>
            </div>

            <button
              type="button"
              onClick={() => setSelectedId(list[0]?._id || list[0]?.id || null)}
              className="flex h-[48px] items-center justify-center gap-2 rounded-lg bg-[#d90f1f] px-6 text-sm font-semibold text-white transition hover:bg-[#b80a18] sm:col-span-2 xl:col-span-1"
            >
              <Search size={16} />
              Search Beds
            </button>
          </section>

          <section className="mx-3.5 mt-3.5 rounded-2xl bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <h2 className="text-[17px] font-bold">Available Hospitals</h2>
                <p className="text-xs text-gray-500">
                  Showing bed availability in Chattogram
                </p>
              </div>

              <div className="text-xs font-semibold">
                Sort by:
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="ml-1.5 rounded-lg border border-[#eceef3] bg-white px-2.5 py-1.5 text-xs"
                >
                  <option value="distance">Nearest First</option>
                  <option value="general">Most General Beds</option>
                  <option value="icu">Most ICU Beds</option>
                  <option value="name">Name (A–Z)</option>
                </select>
              </div>
            </div>

            <div
              className={`hidden items-center gap-2.5 rounded-xl bg-[#f6f7fb] px-3 py-2.5 text-xs font-semibold md:grid ${gridCols}`}
            >
              <div>Hospital Name</div>
              <div className="text-center">
                <span>Available Beds</span>
                <div className="mt-0.5 flex justify-around text-[11px]">
                  <small>General</small>
                  <small>ICU</small>
                </div>
              </div>
              <div>Distance</div>
              <div>Blood Support</div>
              <div>Contact</div>
              <div className="text-center">Action</div>
            </div>

            {list.map((h) => {
              const hid = h._id || h.id;
              const isSel = selected && (selected._id === hid || selected.id === hid);

              return (
                <div
                  key={hid}
                  onClick={() => setSelectedId(hid)}
                  className={`grid cursor-pointer items-center gap-2.5 rounded-xl border px-3 py-2.5 text-[13px] transition ${gridCols} ${
                    isSel
                      ? "border-[#f7c4c4] bg-[#fdeceb]"
                      : "border-transparent border-b-[#eceef3] hover:bg-[#fafafd]"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <HospImg
                      src={h.img}
                      alt={h.name}
                      className="h-12 w-16 rounded-lg"
                    />
                    <div>
                      <strong className="block text-[13px]">{h.name}</strong>
                      <small className="flex items-center gap-1 text-[11px] text-gray-500">
                        <MapPin size={12} className="text-[#d90f1f]" />
                        {h.area}, Chattogram
                      </small>
                    </div>
                  </div>

                  <div className="flex justify-around">
                    <div className="w-14 rounded-lg bg-[#e6f7ec] py-1.5 text-center text-base font-bold text-[#16a34a]">
                      {h.general}
                      <small className="block text-[10px] font-medium">
                        General
                      </small>
                    </div>
                    <div className="w-14 rounded-lg bg-[#fdeceb] py-1.5 text-center text-base font-bold text-[#d90f1f]">
                      {h.icu}
                      <small className="block text-[10px] font-medium">
                        ICU
                      </small>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <MapPin size={15} className="text-[#d90f1f]" />
                    {h.dist || 0} km
                  </div>

                  <div>
                    <BloodBadge status={h.blood} />
                  </div>

                  <div className="flex items-center gap-2.5">
                    <span className="grid h-9 w-9 place-items-center rounded-full border border-[#eceef3] bg-white text-[#d90f1f] shadow-sm">
                      <Phone size={16} className="fill-[#d90f1f]" />
                    </span>
                    <div>
                      {h.phone}
                      <small className="block text-[11px] text-gray-500">
                        24/7 Support
                      </small>
                    </div>
                  </div>

                  <div className="text-center">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedId(hid);
                      }}
                      className={`rounded-lg border border-[#d90f1f] px-4 py-2.5 text-[13px] font-semibold transition ${
                        isSel
                          ? "bg-[#d90f1f] text-white"
                          : "bg-white text-[#d90f1f] hover:bg-[#fdeceb]"
                      }`}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              );
            })}

            {list.length === 0 && (
              <p className="p-6 text-center text-gray-500">
                No hospitals match your search.
              </p>
            )}
          </section>
        </main>

        <aside className="flex flex-col gap-3 px-3.5 pb-4 lg:px-0 lg:pr-3 lg:pt-3">
          <div className="relative h-[270px] overflow-hidden rounded-2xl bg-[#e8efe3] shadow-sm">
            {mapOk ? (
              <img
                src="/images/map.png"
                alt="Map"
                onError={() => setMapOk(false)}
                className="h-full w-full object-cover"
              />
            ) : (
              <FallbackMap />
            )}

            {selected && (
              <div className="absolute left-[28%] top-3 flex max-w-[70%] items-center gap-2 rounded-xl bg-white px-2.5 py-2 text-[10px] shadow-lg">
                <HospImg
                  src={selected.img}
                  alt=""
                  className="h-[30px] w-[38px] rounded"
                />
                <div>
                  <strong className="block text-[10px]">
                    {selected.name}
                  </strong>
                  <div>
                    {selected.general} General
                    <span className="mx-1.5 text-gray-300">|</span>
                    <span className="font-semibold text-[#d90f1f]">
                      {selected.icu} ICU beds
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {selected && (
            <div className="rounded-2xl bg-white p-3.5 shadow-sm">
              <div className="mb-2 flex items-start justify-between">
                <HospImg
                  src={selected.img}
                  alt={selected.name}
                  className="h-[62px] w-[90px] rounded-lg"
                />

                <span className="inline-flex items-center gap-1.5 rounded-lg bg-[#e6f7ec] px-3 py-1.5 text-xs font-semibold text-[#16a34a]">
                  <span className="grid h-4 w-4 place-items-center rounded-full bg-[#16a34a] text-white">
                    <Check size={11} strokeWidth={3} />
                  </span>
                  Beds Available
                </span>
              </div>

              <h3 className="mb-1 text-base font-bold">{selected.name}</h3>

              <div className="flex justify-between text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <MapPin size={13} className="text-[#d90f1f]" />
                  {selected.area}, Chattogram
                </span>
                <span>{selected.dist || 0} km away</span>
              </div>

              <div className="my-3.5 grid grid-cols-3 gap-1.5 rounded-xl border border-[#eceef3] p-2.5">
                <div className="flex items-center gap-1.5">
                  <BedDouble size={22} className="text-[#d90f1f]" />
                  <div>
                    <b className="block text-[17px]">{selected.general}</b>
                    <small className="text-[10px] text-gray-500">
                      General Beds
                    </small>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <Building2 size={22} className="text-[#d90f1f]" />
                  <div>
                    <b className="block text-[17px]">{selected.icu}</b>
                    <small className="text-[10px] text-gray-500">
                      ICU Beds
                    </small>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <Droplet
                    size={22}
                    className="fill-[#16a34a] text-[#16a34a]"
                  />
                  <div>
                    <b
                      className={`block text-sm ${
                        selected.blood === "Available"
                          ? "text-[#16a34a]"
                          : "text-[#d97706]"
                      }`}
                    >
                      {selected.blood}
                    </b>
                    <small className="text-[10px] text-gray-500">
                      Blood Support
                    </small>
                  </div>
                </div>
              </div>

              <ul className="mb-3.5 flex flex-col gap-2.5 text-xs">
                <li className="flex items-center gap-2.5">
                  <Phone size={15} />
                  {selected.phone} (24/7 Support)
                </li>
                <li className="flex items-center gap-2.5">
                  <Clock size={15} />
                  24 Hours Open
                </li>
                <li className="flex items-center gap-2.5">
                  <Building2 size={15} />
                  {selected.depts ? selected.depts.join(", ") : "General, ICU"}
                </li>
                <li className="flex items-center gap-2.5">
                  <ShieldCheck size={15} />
                  {selected.type || "Hospital Partner"}
                </li>
                <li className="flex items-center gap-2.5">
                  <MapPin size={15} />
                  {selected.address || selected.area + ", Chattogram"}
                </li>
              </ul>

              <button
                type="button"
                onClick={() =>
                  alert(
                    `Enquiry sent to ${selected.name}.\nThey will contact you shortly on ${selected.phone}.`
                  )
                }
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#d90f1f] py-3.5 text-sm font-semibold text-white transition hover:bg-[#b80a18]"
              >
                <CalendarDays size={16} />
                Reserve / Enquire Bed
              </button>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}