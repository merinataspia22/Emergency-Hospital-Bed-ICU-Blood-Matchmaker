
import React from 'react';
import { Link } from 'react-router-dom';
import Icon from './Icon';
import Reveal from './Reveal';
import { BC_PATHS as p } from '../paths';

const features = [
  {
    icon: 'shield', tag: 'DONOR NETWORK', title: 'Find blood donors',
    description: 'Explore donor profiles based on blood group, location and stated availability.',
    highlights: ['Blood group filters', 'Nearby donor profiles'],
    action: 'Find donors', to: p.findDonor,
  },
  {
    icon: 'siren', tag: 'URGENT SUPPORT', title: 'Request blood',
    description: 'Share the hospital, blood group, number of units and urgency of your request.',
    highlights: ['Clear request details', 'Track your requests'],
    action: 'Request blood', to: p.requestBlood,
  },
  {
    icon: 'inventory', tag: 'CARE NETWORK', title: 'Blood bank support',
    description: 'Learn about our goal of connecting patients with blood banks and care providers.',
    highlights: ['Hospital connections', 'Stock updates planned'],
    action: 'Explore our mission', to: { pathname: p.home, hash: '#bc-about' },
  },
  {
    icon: 'hospital', tag: 'HOSPITAL SEARCH', title: 'Hospital bed finder',
    description: 'Explore hospital information and bed categories, including General and ICU beds.',
    highlights: ['Hospital details', 'Bed category filters'],
    action: 'Find hospital beds', to: p.hospitalBeds,
  },
  {
    icon: 'clipboard', tag: 'MY ACCOUNT', title: 'Your activity in one place',
    description: 'Keep blood requests, donor information and account activity organised in your dashboard.',
    highlights: ['Personal profile', 'Request history'],
    action: 'Go to login', to: p.login,
  },
  {
    icon: 'users', tag: 'OUR COMMUNITY', title: 'Make a difference',
    description: 'Join a community built around compassion, responsible donation and mutual support.',
    highlights: ['Join as a donor', 'Join as a recipient'],
    action: 'Create an account', to: p.register,
  },
];

const steps = [
  {
    number: '01', icon: 'users', title: 'Create your account',
    description: 'Sign up as a donor or recipient and complete the information needed for your profile.',
  },
  {
    number: '02', icon: 'search', title: 'Search or request help',
    description: 'Find potential donors, submit a blood request or explore hospital bed information.',
  },
  {
    number: '03', icon: 'heart', title: 'Connect with care',
    description: 'Follow up with the right people and confirm any medical arrangements with a provider.',
  },
];

export default function FeatureShelf() {
  return (
    <>
      <section className="bc-features bc-section" id="bc-features" aria-labelledby="bc-features-heading">
        <div className="bc-container">
          <Reveal>
            <div className="bc-section-kicker"><span /> EVERYTHING IN ONE PLACE</div>
            <div className="bc-section-top">
              <h2 id="bc-features-heading">Help is closer <em>than you think.</em></h2>
              <p>Simple, thoughtful features designed to bring people and vital care information together.</p>
            </div>
          </Reveal>
          <div className="bc-feature-grid">
            {features.map((feature, index) => (
              <Reveal key={feature.title} delay={index * 65}>
                <Link className="bc-feature-card" to={feature.to}>
                  <span className="bc-feature-card-top">
                    <span className="bc-feature-icon"><Icon name={feature.icon} size={26} /></span>
                    <span className="bc-feature-tag">{feature.tag}</span>
                  </span>
                  <strong className="bc-feature-title">{feature.title}</strong>
                  <span className="bc-feature-copy">{feature.description}</span>
                  <span className="bc-feature-highlights">
                    {feature.highlights.map(item => (
                      <span key={item}><Icon name="check" size={14} /> {item}</span>
                    ))}
                  </span>
                  <span className="bc-feature-action">{feature.action}
                    <span className="bc-feature-arrow"><Icon name="arrow" size={17} /></span>
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
          <p className="bc-feature-note"><Icon name="shield" size={15} />
            Donor eligibility, availability and medical decisions must be confirmed by qualified providers.
          </p>
        </div>
      </section>

      <section className="bc-process bc-section" id="bc-how-it-works" aria-labelledby="bc-process-heading">
        <div className="bc-container">
          <Reveal>
            <div className="bc-process-intro">
              <div className="bc-section-kicker"><span /> THREE SIMPLE STEPS</div>
              <h2 id="bc-process-heading">A little help can <em>go a long way.</em></h2>
              <p>Getting started with BloodConnect is simple. Here's how the platform is designed to work.</p>
            </div>
          </Reveal>
          <div className="bc-process-grid">
            {steps.map((step, index) => (
              <Reveal key={step.number} delay={index * 100}>
                <div className="bc-process-card">
                  <span className="bc-process-number">{step.number}</span>
                  <span className="bc-process-icon"><Icon name={step.icon} size={27} /></span>
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <div className="bc-process-cta">
            <span>Ready to be part of something meaningful?</span>
            <Link to={p.register}>Get started <Icon name="arrow" size={17} /></Link>
          </div>
        </div>
      </section>
    </>
  );
}
