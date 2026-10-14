import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
export default function Modal({ title, onClose, children, wide = false }) {
  const box = useRef(null);
  const closer = useRef(onClose);
  closer.current = onClose;
  useEffect(() => {
    const previous = document.activeElement;
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    box.current?.querySelector('button')?.focus();
    const onKey = event => {
      if (event.key === 'Escape') closer.current();
      if (event.key !== 'Tab' || !box.current) return;
      const items = [...box.current.querySelectorAll('button, input, select, a[href], textarea')]
        .filter(item => !item.disabled && item.getClientRects().length);
      if (!items.length) return;
      if (event.shiftKey && document.activeElement === items[0]) {
        event.preventDefault(); items[items.length - 1].focus();
      } else if (!event.shiftKey && document.activeElement === items[items.length - 1]) {
        event.preventDefault(); items[0].focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = oldOverflow;
      document.removeEventListener('keydown', onKey);
      if (previous?.isConnected) previous.focus();
    };
  }, []);
  return <div className="modal-backdrop" onMouseDown={event => {
    if (event.target === event.currentTarget) onClose();
  }}>
    <section ref={box} className={`modal-box ${wide ? 'modal-wide' : ''}`} role="dialog"
      aria-modal="true" aria-label={title}>
      <header className="modal-heading"><h2>{title}</h2>
        <button type="button" onClick={onClose} aria-label="Close dialog"><X size={21} /></button>
      </header>
      {children}
    </section>
  </div>;
}
