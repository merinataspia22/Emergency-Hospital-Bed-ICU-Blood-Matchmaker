import { useEffect } from 'react';
import { AlertCircle, CheckCircle2, X } from 'lucide-react';
export default function Toast({ type, title, description, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 6000);
    return () => clearTimeout(timer);
  }, [onClose]);
  const Icon = type === 'success' ? CheckCircle2 : AlertCircle;
  return <div className={`notice-toast notice-${type}`} role={type === 'error' ? 'alert' : 'status'}>
    <span className="notice-icon"><Icon size={22} aria-hidden="true" /></span>
    <div className="notice-text"><strong>{title}</strong><span>{description}</span></div>
    <button type="button" className="notice-close" onClick={onClose} aria-label="Dismiss notification">
      <X size={18} aria-hidden="true" />
    </button>
  </div>;
}
