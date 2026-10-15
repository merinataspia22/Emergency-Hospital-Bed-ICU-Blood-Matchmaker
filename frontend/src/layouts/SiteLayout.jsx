
import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";

import HomeHeader from "../components/home/components/HomeHeader";

import "../components/home/styles/base.css";
import "../components/home/styles/header.css";
import "../components/home/styles/responsive.css";
import "../styles/common-navbar.css";

const routeNames = {
  "/": "home",
  "/find-donor": "find",
  "/request-blood": "request",
  "/hospital-beds": "beds",
  "/donor-dashboard": "donor",
  "/recipient-dashboard": "recipient",
  "/dashboard": "recipient",
  "/bloodbank-dashboard": "staff",
  "/admin-dashboard": "admin",
};

export default function SiteLayout() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (!hash) {
      window.scrollTo({
        top: 0,
        behavior: "auto",
      });
    }
  }, [pathname, hash]);

  const pageName = routeNames[pathname] || "general";

  return (
    <>
      {/* One common navbar */}
      <div className="bc-home-root bc-global-nav">
        <HomeHeader />
      </div>

      {/* Current page content */}
      <div
        className={`bc-route-content bc-route-${pageName}`}
      >
        <Outlet />
      </div>
    </>
  );
}
