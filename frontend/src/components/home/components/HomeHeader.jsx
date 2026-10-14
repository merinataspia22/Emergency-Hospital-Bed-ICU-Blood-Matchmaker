
import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Brand from './Brand';
import Icon from './Icon';
import { BC_PATHS as p } from '../paths';

const links = [
  { label: 'Home', path: p.home },
  { label: 'About', section: 'bc-about' },
  { label: 'Find Donor', path: p.findDonor },
  { label: 'Request Blood', path: p.requestBlood },
  { label: 'Hospital Beds', path: p.hospitalBeds },
  { label: 'FAQ', section: 'bc-faq' },
  { label: 'Contact', section: 'bc-contact' },
];
const sectionIds = ['bc-about', 'bc-faq', 'bc-contact'];

const scrollToSection = id => {
  const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  document.getElementById(id)?.scrollIntoView({
    behavior: reducedMotion ? 'auto' : 'smooth', block: 'start',
  });
};
export const scrollToHomeSection = scrollToSection;

export default function HomeHeader() {
  const { pathname, hash } = useLocation();
  const navigate = useNavigate();
  const [active, setActive] = useState(p.home);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchHint, setSearchHint] = useState('');

  useEffect(() => {
    if (pathname !== p.home) {
      setActive(pathname);
      return;
    }
    const currentHash = hash.replace('#', '');
    if (sectionIds.includes(currentHash)) setActive(currentHash);
    const updateActive = () => {
      let current = p.home;
      for (const id of sectionIds) {
        const target = document.getElementById(id);
        if (target && target.getBoundingClientRect().top <= 160) current = id;
      }
      setActive(current);
    };
    window.addEventListener('scroll', updateActive, { passive: true });
    const frame = window.requestAnimationFrame(updateActive);
    return () => {
      window.removeEventListener('scroll', updateActive);
      window.cancelAnimationFrame(frame);
    };
  }, [pathname, hash]);

  const openSection = id => {
    setMenuOpen(false);
    setActive(id);
    if (pathname === p.home) scrollToSection(id);
    else navigate({ pathname: p.home, hash: `#${id}` });
  };
  const goHome = () => {
    setMenuOpen(false);
    setActive(p.home);
    if (pathname === p.home) window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const search = event => {
    event.preventDefault();
    const query = searchTerm.trim().toLowerCase();
    let destination = null;
    if (query.includes('hospital') || query.includes('bed')) destination = p.hospitalBeds;
    else if (query.includes('donor')) destination = p.findDonor;
    else if (query.includes('inventory') || query.includes('blood bank')) openSection('bc-about');
    else if (query.includes('request') || query.includes('blood')) destination = p.requestBlood;
    else if (query.includes('faq') || query.includes('question')) openSection('bc-faq');
    else if (query.includes('about')) openSection('bc-about');
    else if (query.includes('contact')) openSection('bc-contact');
    else {
      setSearchHint('Try donor, request, hospital, about, FAQ or contact.');
      return;
    }
    if (destination) navigate(destination);
    setSearchHint('');
    setSearchOpen(false);
    setMenuOpen(false);
  };

  return (
    <header className="bc-site-header" onKeyDown={event => {
      if (event.key === 'Escape') {
        setSearchOpen(false);
        setMenuOpen(false);
        setSearchHint('');
      }
    }}>
      <div className="bc-header-inner bc-container">
        <Link className="bc-logo-link" to={p.home} onClick={goHome}><Brand /></Link>
        <nav id="bc-main-navigation" className={`bc-header-nav ${menuOpen ? 'is-open' : ''}`} aria-label="Main navigation">
          {links.map(item => item.section ? (
            <button type="button" key={item.label}
              className={active === item.section ? 'is-active' : ''}
              aria-current={active === item.section ? 'location' : undefined}
              onClick={() => openSection(item.section)}>{item.label}</button>
          ) : (
            <Link key={item.label} to={item.path}
              className={active === item.path ? 'is-active' : ''}
              aria-current={active === item.path ? 'page' : undefined}
              onClick={item.path === p.home ? goHome : () => setMenuOpen(false)}>{item.label}</Link>
          ))}
          <div className="bc-mobile-auth">
            <Link to={p.login} onClick={() => setMenuOpen(false)}>Log in</Link>
            <Link to={p.register} onClick={() => setMenuOpen(false)}>Sign up</Link>
          </div>
        </nav>
        <div className="bc-header-actions">
          <button type="button" className="bc-icon-button" aria-label="Search site"
            aria-controls="bc-header-search" aria-expanded={searchOpen}
            onClick={() => setSearchOpen(value => !value)}>
            <Icon name={searchOpen ? 'x' : 'search'} size={19} />
          </button>
          <Link className="bc-head-login" to={p.login}>Log in</Link>
          <Link className="bc-button bc-button--small" to={p.register}>
            Sign up <Icon name="arrow" size={15} />
          </Link>
          <button type="button" className="bc-icon-button bc-menu-button"
            aria-expanded={menuOpen} aria-controls="bc-main-navigation" aria-label="Toggle navigation"
            onClick={() => setMenuOpen(value => !value)}>
            <Icon name={menuOpen ? 'x' : 'menu'} />
          </button>
        </div>
      </div>
      {searchOpen && (
        <form id="bc-header-search" className="bc-header-search bc-container" onSubmit={search}>
          <label htmlFor="bc-search-input">Search BloodConnect</label>
          <input id="bc-search-input" autoFocus value={searchTerm}
            onChange={event => setSearchTerm(event.target.value)}
            placeholder="Search FAQ, donors, hospital beds..." />
          <button type="submit" className="bc-button bc-button--small">
            Explore <Icon name="arrow" size={15} />
          </button>
          {searchHint && <span role="status" className="bc-search-hint">{searchHint}</span>}
        </form>
      )}
    </header>
  );
}
