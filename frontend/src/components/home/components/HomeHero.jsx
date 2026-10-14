import React from "react";
import { Link } from "react-router-dom";
import Icon from "./Icon";
import Reveal from "./Reveal";
import StorySlider from "./StorySlider";
import { BC_PATHS as p } from "../paths";

export default function HomeHero() {
  return (
    <section className="bc-hero" id="bc-top">
      <div className="bc-hero-glow" aria-hidden="true" />
      <div className="bc-container bc-hero-grid">
        <div className="bc-hero-copy">
          <Reveal><span className="bc-eyebrow"><span className="bc-live-dot" /> HUMANITY IN EVERY DROP</span></Reveal>
          <Reveal delay={60}><h1>Donate blood.<br /><span>Be their tomorrow.</span></h1></Reveal>
          <Reveal delay={100}><p className="bc-hero-intro">
            One thoughtful donation can bring hope to a patient and their loved ones.
            Be part of a community that connects compassion with care.
          </p></Reveal>
          <Reveal delay={160}><div className="bc-hero-ctas">
            <Link to={p.findDonor} className="bc-button bc-button--primary">
              <Icon name="search" size={18} /> Find a donor <Icon name="arrow" size={18} />
            </Link>
            <Link to={p.requestBlood} className="bc-button bc-button--outline">
              <Icon name="droplet" size={18} /> Request blood
            </Link>
          </div></Reveal>
          <Reveal delay={210}><div className="bc-hero-promise">
            <div className="bc-avatar-stack" aria-hidden="true"><i>♥</i><i>+</i><i>♥</i></div>
            <p><strong>One donation. A meaningful difference.</strong>
              <span>For donors, patients and the people who love them.</span></p>
          </div></Reveal>
        </div>
        <Reveal className="bc-hero-visual-wrap" delay={130}>
          <StorySlider />
        </Reveal>
      </div>
      <div className="bc-hero-bottom bc-container">
        <span>SCROLL TO DISCOVER BLOODCONNECT</span><span className="bc-scroll-stem" />
      </div>
    </section>
  );
}
