import React from 'react';
import { Link } from 'react-router-dom';
import Icon from './Icon';
import { BC_PATHS as p } from '../paths';
import Reveal from './Reveal';
export default function FinalCTA() {
  return <section className="bc-final-cta"><div className="bc-container">
    <Reveal><div className="bc-final-cta-panel"><div><span className="bc-final-kicker"><Icon name="spark" size={16}/> MAKE A DIFFERENCE</span>
      <h2>Your kindness could be<br/>someone's next chapter.</h2>
      <p>Be ready to help when your community needs you.</p></div>
      <Link className="bc-button bc-button--light" to={p.register}>Join BloodConnect <Icon name="arrow" size={18}/></Link>
      <div className="bc-final-glow" aria-hidden="true"/>
    </div></Reveal>
  </div></section>;
}
