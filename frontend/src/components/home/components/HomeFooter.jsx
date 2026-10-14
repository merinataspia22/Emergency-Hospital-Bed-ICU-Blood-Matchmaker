import React from 'react';
import { Link } from 'react-router-dom';
import Brand from './Brand';
import { BC_PATHS as p } from '../paths';
import { scrollToHomeSection } from './HomeHeader';
import Icon from './Icon';
export default function HomeFooter() {
  return <footer className="bc-footer"><div className="bc-container">
    <div className="bc-footer-main">
      <div className="bc-footer-intro"><Brand light/><p>Connecting people. Inspiring hope.<br/>Helping communities care for each other.</p></div>
      <div className="bc-footer-links"><strong>Explore</strong>
        <Link to={p.findDonor}>Find a donor</Link><Link to={p.requestBlood}>Request blood</Link>
        <Link to={p.hospitalBeds}>Hospital beds</Link></div>
      <div className="bc-footer-links"><strong>Support</strong>
        <button onClick={()=>scrollToHomeSection('bc-about')}>About</button>
        <button onClick={()=>scrollToHomeSection('bc-faq')}>FAQs</button>
        <button onClick={()=>scrollToHomeSection('bc-contact')}>Contact</button></div>
      <div className="bc-footer-thought"><span><Icon name="heart" size={19}/> MADE FOR PEOPLE</span>
        <strong>Give hope.<br/>Make it count.</strong></div>
    </div>
    <div className="bc-footer-bottom"><span>© {new Date().getFullYear()} BloodConnect. A team project.</span>
      <span>Not an emergency service. Seek urgent medical assistance when needed.</span></div>
  </div></footer>;
}
