import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Brand from './Brand';
import Icon from './Icon';
import { BC_PATHS as p } from '../paths';

const links = [
  { label: 'Home', target: p.home }, { label: 'About', section: 'bc-about' },
  { label: 'Find Donor', target: p.findDonor },
  { label: 'Request Blood', target: p.requestBlood },
  { label: 'Hospital Beds', target: p.hospitalBeds },
  { label: 'FAQ', section: 'bc-faq' }, { label: 'Contact', section: 'bc-contact' },
];
export const scrollToHomeSection = id => {
  const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  document.getElementById(id)?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
};
export default function HomeHeader() {
  const navigate = useNavigate();
  const [menu, setMenu] = useState(false);
  const [searchHint, setSearchHint] = useState('');
  const [search, setSearch] = useState(false);
  const [term, setTerm] = useState('');
  const jump = id => { setMenu(false); scrollToHomeSection(id); };
  const searchNow = event => {
    event.preventDefault();
    const query = term.toLowerCase();
    let next = '';
    if (query.includes('hospital') || query.includes('bed')) next = p.hospitalBeds;
    else if (query.includes('donor')) next = p.findDonor;
    else if (query.includes('request') || query.includes('blood')) next = p.requestBlood;
    else if (query.includes('question') || query.includes('faq')) jump('bc-faq');
    else if (query.includes('contact')) jump('bc-contact');
    else { setSearchHint('Try “donor”, “request”, “hospital”, “FAQ” or “contact”.'); return; }
    if (next) navigate(next);
    setSearchHint('');setSearch(false);
  };
  const onEscape = e => {
    if (e.key === 'Escape') { setSearch(false); setMenu(false); setSearchHint(''); }
  };
  return <header className="bc-site-header" onKeyDown={onEscape}>
    <div className="bc-header-inner bc-container">
      <Link className="bc-logo-link" to={p.home}><Brand/></Link>
      <nav id="bc-main-navigation" className={`bc-header-nav ${menu ? 'is-open' : ''}`} aria-label="Main navigation">
        {links.map(link => link.section
          ? <button key={link.label} onClick={() => jump(link.section)}>{link.label}</button>
          : <Link key={link.label} className={link.target === p.home ? 'is-active' : ''}
              onClick={() => setMenu(false)} to={link.target}>{link.label}</Link>)}
        <div className="bc-mobile-auth"><Link to={p.login}>Log in</Link><Link to={p.register}>Sign up</Link></div>
      </nav>
      <div className="bc-header-actions">
        <button className="bc-icon-button" aria-label="Search site" aria-controls="bc-header-search" aria-expanded={search}
          onClick={() => setSearch(v => !v)}><Icon name={search ? 'x' : 'search'} size={19}/></button>
        <Link className="bc-head-login" to={p.login}>Log in</Link>
        <Link className="bc-button bc-button--small" to={p.register}>Sign up <Icon name="arrow" size={15}/></Link>
        <button className="bc-icon-button bc-menu-button" aria-expanded={menu}
          aria-label="Toggle navigation" aria-controls="bc-main-navigation" onClick={() => setMenu(v => !v)}><Icon name={menu ? 'x' : 'menu'}/></button>
      </div>
    </div>
    {search && <form id="bc-header-search" className="bc-header-search bc-container" onSubmit={searchNow}>
      <label htmlFor="bc-search-input">Search BloodConnect</label>
      <input id="bc-search-input" autoFocus value={term} onChange={e => setTerm(e.target.value)}
        placeholder="Search FAQ, donors, hospital beds..."/>
      <button className="bc-button bc-button--small">Explore <Icon name="arrow" size={15}/></button>
      {searchHint && <span role="status" className="bc-search-hint">{searchHint}</span>}
    </form>}
  </header>;
}
