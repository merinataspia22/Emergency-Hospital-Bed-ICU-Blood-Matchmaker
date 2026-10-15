
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

import HomeHeader from "./components/HomeHeader";
import HomeHero from "./components/HomeHero";
import FeatureShelf from "./components/FeatureShelf";
import AboutPreview from "./components/AboutPreview";
import FAQPreview from "./components/FAQPreview";
import ContactPreview from "./components/ContactPreview";
import FinalCTA from "./components/FinalCTA";
import HomeFooter from "./components/HomeFooter";

import "./styles/base.css";
import "./styles/header.css";
import "./styles/hero.css";
import "./styles/features.css";
import "./styles/sections.css";
import "./styles/faq-contact.css";
import "./styles/footer.css";
import "./styles/responsive.css";

export default function HomePage({
  showHeader = true,
  showFooter = true,
}) {
  const { hash } = useLocation();

  useEffect(() => {
    document.title =
      "BloodConnect | Every Drop Gives Hope";
  }, []);

  // Scroll to About, FAQ or Contact
  // when navigating from another page.
  useEffect(() => {
    if (!hash) return;

    const id = decodeURIComponent(hash.slice(1));

    const frame = window.requestAnimationFrame(() => {
      const reduced = window.matchMedia?.(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      document.getElementById(id)?.scrollIntoView({
        behavior: reduced ? "auto" : "smooth",
        block: "start",
      });
    });

    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, [hash]);

  return (
    <div className="bc-home-root">

      <a
        className="bc-skip-link"
        href="#bc-main-content"
      >
        Skip to content
      </a>

      {showHeader && <HomeHeader />}

      <main id="bc-main-content" tabIndex={-1}>
        <HomeHero />
        <FeatureShelf />
        <AboutPreview />
        <FAQPreview />
        <ContactPreview />
        <FinalCTA />
      </main>

      {showFooter && <HomeFooter />}

    </div>
  );
}
