import { Droplet } from 'lucide-react';
import { Link } from 'react-router-dom';
export default function LoginLogo() {
  return <Link to="/" className="bc-brand" aria-label="BloodConnect Home">
    <span className="bc-brand-icon"><Droplet size={43} strokeWidth={2.8} fill="currentColor" /></span>
    <span className="bc-brand-blood">Blood</span><span className="bc-brand-connect">Connect</span>
  </Link>;
}
