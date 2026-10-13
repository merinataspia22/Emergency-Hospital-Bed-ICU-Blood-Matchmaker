import React from 'react';
import { useInView } from '../hooks/useInView';
export default function Reveal({ children, className = '', delay = 0 }) {
  const [ref, seen] = useInView();
  return <div ref={ref} className={`bc-reveal ${seen ? 'is-visible' : ''} ${className}`}
    style={{ '--bc-reveal-delay': `${delay}ms` }}>{children}</div>;
}
