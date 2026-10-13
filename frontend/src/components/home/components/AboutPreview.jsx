import React from 'react';
import { Link } from 'react-router-dom';
import Icon from './Icon';
import Reveal from './Reveal';
import { BC_PATHS as p } from '../paths';
export default function AboutPreview() {
  return <section className="bc-about bc-section" id="bc-about">
    <div className="bc-container bc-about-grid">
      <Reveal className="bc-about-art"><div className="bc-about-art-circles"/>
        <span className="bc-about-big-heart"><Icon name="heart" size={105}/></span>
        <span className="bc-about-float bc-about-float--one"><Icon name="heart" size={21}/></span>
        <span className="bc-about-float bc-about-float--two"><Icon name="droplet" size={18}/></span>
        <div className="bc-about-art-caption"><Icon name="heart" size={18}/> HUMANITY FIRST, ALWAYS</div>
      </Reveal>
      <Reveal className="bc-about-copy" delay={100}>
        <div className="bc-section-kicker"><span/> OUR PURPOSE</div>
        <h2>Built around people.<br/><em>Powered by kindness.</em></h2>
        <p>BloodConnect is a platform concept created to help donors, recipients and care providers find each other faster and more clearly.</p>
        <p>We believe that technology should feel human, especially when someone needs help.</p>
        <div className="bc-about-checks"><span><Icon name="check" size={16}/> Community-centred</span>
          <span><Icon name="check" size={16}/> Accessible by design</span></div>
        <Link className="bc-text-link" to={p.register}>Become part of the story <Icon name="arrow" size={19}/></Link>
      </Reveal>
    </div>
  </section>;
}
