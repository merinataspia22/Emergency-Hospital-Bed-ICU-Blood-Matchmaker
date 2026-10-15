
import { useEffect, useState } from "react";
import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

import Brand from "./Brand";
import Icon from "./Icon";
import { BC_PATHS as p } from "../paths";

import { useAuth } from "../../../auth/AuthContext";
import { ROLE_ROUTES } from "../../../auth/demoAuth";

const navItems = [
  { label: "Home", path: p.home },
  { label: "About", section: "bc-about" },
  { label: "Find Donor", path: p.findDonor },
  { label: "Request Blood", path: p.requestBlood },
  { label: "Hospital Beds", path: p.hospitalBeds },
  { label: "FAQ", section: "bc-faq" },
  { label: "Contact", section: "bc-contact" },
];

const sections = [
  "bc-about",
  "bc-faq",
  "bc-contact",
];

// HomeFooter.jsx uses this exported function.
export function scrollToHomeSection(id) {
  const reduced = window.matchMedia?.(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  document.getElementById(id)?.scrollIntoView({
    behavior: reduced ? "auto" : "smooth",
    block: "start",
  });
}

export default function HomeHeader() {
  const { pathname, hash } = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [active, setActive] = useState(p.home);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [hint, setHint] = useState("");

  const dashboard = user
    ? ROLE_ROUTES[user.role]
    : null;

  // Dynamic active navbar underline
  useEffect(() => {
    setMenuOpen(false);

    if (pathname !== p.home) {
      setActive(pathname);
      return;
    }

    const update = () => {
      let current = p.home;

      for (const id of sections) {
        const section = document.getElementById(id);

        if (
          section?.getBoundingClientRect().top <= 160
        ) {
          current = id;
        }
      }

      setActive(current);
    };

    const frame = window.requestAnimationFrame(update);

    window.addEventListener("scroll", update, {
      passive: true,
    });

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", update);
    };
  }, [pathname, hash]);

  const openSection = (id) => {
    setMenuOpen(false);
    setActive(id);

    if (pathname !== p.home) {
      navigate({
        pathname: p.home,
        hash: `#${id}`,
      });
    } else {
      scrollToHomeSection(id);
    }
  };

  const goHome = () => {
    setMenuOpen(false);

    if (pathname === p.home) {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
      setActive(p.home);
    }
  };

  const handleLogout = () => {
    logout();
    setMenuOpen(false);

    navigate(p.home, {
      replace: true,
    });
  };

  // Simple site navigation search
  const submitSearch = (event) => {
    event.preventDefault();

    const query = searchTerm.trim().toLowerCase();
    let path = null;

    if (
      query.includes("hospital") ||
      query.includes("bed")
    ) {
      path = p.hospitalBeds;
    } else if (query.includes("donor")) {
      path = p.findDonor;
    } else if (
      query.includes("request") ||
      query.includes("blood")
    ) {
      path = p.requestBlood;
    } else if (query.includes("about")) {
      openSection("bc-about");
    } else if (
      query.includes("faq") ||
      query.includes("question")
    ) {
      openSection("bc-faq");
    } else if (query.includes("contact")) {
      openSection("bc-contact");
    } else {
      setHint(
        "Try donor, request, hospital, about, FAQ or contact."
      );
      return;
    }

    if (path) navigate(path);

    setHint("");
    setSearchOpen(false);
  };

  return (
    <header
      className="bc-site-header"
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          setMenuOpen(false);
          setSearchOpen(false);
        }
      }}
    >
      <div className="bc-header-inner bc-container">

        {/* Brand logo */}
        <Link
          className="bc-logo-link"
          to={p.home}
          onClick={goHome}
        >
          <Brand />
        </Link>

        {/* Main navbar */}
        <nav
          id="bc-main-navigation"
          className={`bc-header-nav ${
            menuOpen ? "is-open" : ""
          }`}
          aria-label="Main navigation"
        >
          {navItems.map((item) =>
            item.section ? (
              <button
                key={item.label}
                type="button"
                className={
                  active === item.section
                    ? "is-active"
                    : ""
                }
                aria-current={
                  active === item.section
                    ? "location"
                    : undefined
                }
                onClick={() =>
                  openSection(item.section)
                }
              >
                {item.label}
              </button>
            ) : (
              <Link
                key={item.label}
                to={item.path}
                className={
                  active === item.path
                    ? "is-active"
                    : ""
                }
                aria-current={
                  active === item.path
                    ? "page"
                    : undefined
                }
                onClick={
                  item.path === p.home
                    ? goHome
                    : () => setMenuOpen(false)
                }
              >
                {item.label}
              </Link>
            )
          )}

          {/* Mobile account links */}
          <div className="bc-mobile-auth">
            {user ? (
              <>
                <Link
                  to={dashboard}
                  onClick={() => setMenuOpen(false)}
                >
                  My Dashboard
                </Link>

                <button
                  type="button"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to={p.login}
                  onClick={() => setMenuOpen(false)}
                >
                  Log in
                </Link>

                <Link
                  to={p.register}
                  onClick={() => setMenuOpen(false)}
                >
                  Sign up
                </Link>
              </>
            )}
          </div>
        </nav>

        {/* Right navbar controls */}
        <div className="bc-header-actions">

          <button
            type="button"
            className="bc-icon-button"
            aria-label="Search site"
            aria-expanded={searchOpen}
            aria-controls="bc-header-search"
            onClick={() =>
              setSearchOpen(value => !value)
            }
          >
            <Icon
              name={searchOpen ? "x" : "search"}
              size={19}
            />
          </button>

          {user ? (
            <div className="bc-user-menu">

              <Link
                className="bc-dashboard-link"
                to={dashboard}
              >
                My Dashboard
              </Link>

              <button
                type="button"
                className="bc-logout-button"
                onClick={handleLogout}
              >
                Logout
              </button>

            </div>
          ) : (
            <>
              <Link
                className="bc-head-login"
                to={p.login}
              >
                Log in
              </Link>

              <Link
                className="bc-button bc-button--small"
                to={p.register}
              >
                Sign up
                <Icon name="arrow" size={15} />
              </Link>
            </>
          )}

          {/* Mobile menu button */}
          <button
            type="button"
            className="bc-icon-button bc-menu-button"
            aria-label="Toggle navigation"
            aria-controls="bc-main-navigation"
            aria-expanded={menuOpen}
            onClick={() =>
              setMenuOpen(value => !value)
            }
          >
            <Icon
              name={menuOpen ? "x" : "menu"}
            />
          </button>
        </div>
      </div>

      {/* Navigation search */}
      {searchOpen && (
        <form
          id="bc-header-search"
          className="bc-header-search bc-container"
          onSubmit={submitSearch}
        >
          <label htmlFor="bc-search-input">
            Search BloodConnect
          </label>

          <input
            id="bc-search-input"
            autoFocus
            value={searchTerm}
            onChange={(event) => {
              setSearchTerm(event.target.value);
              setHint("");
            }}
            placeholder="Donors, hospital beds, FAQ..."
          />

          <button
            type="submit"
            className="bc-button bc-button--small"
          >
            Explore
            <Icon name="arrow" size={15} />
          </button>

          {hint && (
            <span role="status" className="bc-search-hint">
              {hint}
            </span>
          )}
        </form>
      )}
    </header>
  );
}
