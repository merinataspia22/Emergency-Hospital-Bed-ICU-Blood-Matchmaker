import React from 'react';
import { Link } from 'react-router-dom';
import Icon from './Icon';
import Reveal from './Reveal';
import { BC_PATHS as p } from '../paths';

const features = [
  { icon: 'shield', label: 'Verified donors', copy: 'Find donor profiles and reach out with confidence.', to: p.findDonor },
  { icon: 'siren', label: 'Emergency support', copy: 'Start an urgent blood request in moments.', to: p.requestBlood },
  { icon: 'inventory', label: 'Blood bank inventory', copy: 'Explore blood availability as partners join.', to: p.findDonor },
  { icon: 'hospital', label: 'Hospital beds', copy: 'Look for hospitals and available bed details.', to: p.hospitalBeds },
  { icon: 'clipboard', label: 'Secure records', copy: 'Access your account and manage your requests.', to: p.login },
  { icon: 'users', label: 'Community support', copy: 'Be part of a caring, life-saving community.', to: p.register },
];
export default function FeatureShelf() {
  return <section className="bc-features bc-section" id="bc-features">
    <div className="bc-container">
      <Reveal><div className="bc-section-kicker"><span/> EVERYTHING IN ONE PLACE</div>
        <div className="bc-section-top"><h2>Help is closer <em>than you think.</em></h2>
          </div></Reveal>
      <div className="bc-feature-grid">
        {features.map((f,i) => <Reveal key={f.label} delay={i * 65}>
          <Link to={f.to} className="bc-feature-card">
            <span className="bc-feature-icon"><Icon name={f.icon} size={26}/></span>
            <strong>{f.label}</strong><span className="bc-feature-copy">{f.copy}</span>
            <span className="bc-feature-arrow" aria-hidden="true"><Icon name="arrow" size={18}/></span>
          </Link>
        </Reveal>)}
      </div>
      <p className="bc-feature-note"><Icon name="shield" size={15}/> Information and availability are subject to verification by the relevant provider.</p>
    </div>
  </section>;
}
