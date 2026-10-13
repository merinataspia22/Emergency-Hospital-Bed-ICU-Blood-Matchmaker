import { ShieldCheck, UsersRound, Heart, Sprout } from 'lucide-react';
const promises = [
  { icon: ShieldCheck, title: 'Safe & Secure', sub: 'Your data is\nalways protected' },
  { icon: UsersRound, title: 'Community Driven', sub: 'Be a hero today' },
  { icon: Heart, title: 'Save Lives', sub: 'A small step\nmakes a big difference' },
  { icon: Sprout, title: 'Trusted Platform', sub: 'Verified and reliable' }
];
export default function TrustStrip() {
  return <div className="trust-strip" aria-label="Our values">
    {promises.map(({ icon: Icon, title, sub }) => <div className="trust-item" key={title}>
      <Icon size={32} fill={title === 'Save Lives' ? 'currentColor' : 'none'} strokeWidth={2.8} />
      <strong>{title}</strong><span>{sub}</span>
    </div>)}
  </div>;
}
