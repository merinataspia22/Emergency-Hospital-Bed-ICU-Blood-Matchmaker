import { Droplet, Search, Menu } from "lucide-react";
import { useState } from "react";

const links = [
  "Home",
  "About",
  "Find Donor",
  "Request Blood",
  "Hospital Beds",
  "Contact",
];

export default function Navbar({ active = "Request Blood" }) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(active); // Request Blood starts active

  return (
    <header className="bg-white">
      <div className="relative flex items-center justify-between px-5 py-4 lg:px-8">
        {/* Logo */}
        <a href="/" className="flex shrink-0 items-center gap-2">
          <Droplet className="h-8 w-8 fill-[#f30000] text-[#f30000]" />

          <span className="text-2xl font-bold tracking-tight">
            <span className="text-[#f30000]">Blood</span>
            <span className="text-black">Connect</span>
          </span>
        </a>

        {/* Desktop Navigation - Center */}
        <nav className="hidden items-center gap-8 lg:absolute lg:left-1/2 lg:flex lg:-translate-x-1/2">
          {links.map((link) => (
            <a
              key={link}
              href={`#${link.toLowerCase().replaceAll(" ", "-")}`}
              onClick={() => setSelected(link)}
              className={`whitespace-nowrap border-b-2 py-1.5 text-[15px] font-medium transition-all duration-200 ${
                selected === link
                  ? "!border-[#f30000] !text-[#f30000]"
                  : "border-transparent !text-gray-900 hover:!text-[#f30000]"
              }`}
            >
              {link}
            </a>
          ))}
        </nav>

        {/* Right Side Buttons */}
        <div className="flex shrink-0 items-center gap-3">
          <button
            type="button"
            aria-label="Search"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white shadow-sm hover:bg-[#fff1f2]"
          >
            <Search className="h-4 w-4 text-gray-900" />
          </button>

          <button className="hidden rounded-lg border border-[#f9d6d8] bg-white px-6 py-2.5 text-sm font-medium text-[#f30000] shadow-sm hover:bg-[#fff1f2] sm:block">
            Login
          </button>

          <button className="hidden rounded-lg bg-[#f30000] px-6 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-[#d10000] sm:block">
            Sign Up
          </button>

          <button
            type="button"
            className="text-[#f30000] lg:hidden"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            <Menu size={25} />
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {open && (
        <nav className="flex flex-col gap-1 border-t border-gray-100 px-5 py-4 lg:hidden">
          {links.map((link) => (
            <a
              key={link}
              href="#"
              onClick={() => {
                setSelected(link);
                setOpen(false);
              }}
              className={`border-b-2 px-2 py-3 text-base font-medium transition-all duration-200 ${
                selected === link
                  ? "!border-[#f30000] !text-[#f30000]"
                  : "border-transparent !text-gray-800 hover:!text-[#f30000]"
              }`}
            >
              {link}
            </a>
          ))}
        </nav>
      )}
    </header>
  );
}
