import React from 'react';
import Icon from './Icon';
export default function Brand({ light = false }) {
  return <div className={`bc-brand ${light ? 'bc-brand--light' : ''}`} aria-label="BloodConnect">
    <span className="bc-brand-mark"><Icon name="droplet" size={28}/><span className="bc-brand-spot"/></span>
    <span><b>Blood</b>Connect</span>
  </div>;
}
