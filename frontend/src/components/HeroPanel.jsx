import TrustStrip from './TrustStrip.jsx';
export default function HeroPanel() {
  return <aside className="hero-panel" aria-label="Blood donation brings hope">
    <div className="hero-art-wrap">
      <img src={`${import.meta.env.BASE_URL}assets/lifesaving-hands.webp`}
        className="hero-image" alt="Hands gently holding a red blood drop with a heart illustration" />
      <span className="hero-glow glow-one" aria-hidden="true" />
      <span className="hero-glow glow-two" aria-hidden="true" />
    </div>
    <TrustStrip />
  </aside>;
}
