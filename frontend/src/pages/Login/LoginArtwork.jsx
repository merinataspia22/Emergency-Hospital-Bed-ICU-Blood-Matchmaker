import { useEffect, useState } from 'react';
import { ArrowUpRight, Heart, ShieldPlus, Users } from 'lucide-react';
const slides = [
  { top: 'Together', emphasis: 'We Save Lives', desc: 'Join our community of life-savers and be a part of something meaningful.' },
  { top: 'One Donation', emphasis: 'Brings New Hope', desc: 'Small acts of kindness can make an extraordinary difference.' },
  { top: 'Every Drop', emphasis: 'Makes an Impact', desc: 'Connect with the people who need your care and support.' }
];
export default function LoginArtwork() {
  const [active, setActive] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => setActive(n => (n + 1) % slides.length), 6500);
    return () => window.clearInterval(id);
  }, []);
  const slide = slides[active];
  return <aside className="bc-art-panel" aria-label="Blood donation inspiration">
    <div className="bc-art-orb bc-art-orb-a" aria-hidden="true" />
    <div className="bc-art-orb bc-art-orb-b" aria-hidden="true" />
    <div className="bc-art-picture">
      <img src={`${import.meta.env.BASE_URL}assets/login-blood-bag.webp`}
        alt="A blood donation bag with tubing forming a heart" className="bc-bag-image" />
      <Heart className="bc-float-heart bc-heart-one" fill="currentColor" aria-hidden="true" />
      <Heart className="bc-float-heart bc-heart-two" fill="currentColor" aria-hidden="true" />
    </div>
    <div className="bc-art-bottom">
      <div className="bc-slide" key={active} aria-live="polite" aria-atomic="true">
        <h2>{slide.top}<br /><span>{slide.emphasis}</span></h2>
        <p>{slide.desc}</p>
      </div>
      <div className="bc-micro-badges" aria-label="Community values">
        <span><Users size={15} /> Community</span><span><Heart size={15} /> Care</span>
        <span><ShieldPlus size={15} /> Trust</span>
      </div>
      <div className="bc-slide-controls" aria-label="Inspirational slides">
        {slides.map((_, i) => <button type="button" key={i}
          aria-label={`Show message ${i + 1}`} aria-pressed={active === i}
          className={active === i ? 'bc-dot active' : 'bc-dot'} onClick={() => setActive(i)} />)}
        <ArrowUpRight size={17} className="bc-arrow-deco" aria-hidden="true" />
      </div>
    </div>
  </aside>;
}
