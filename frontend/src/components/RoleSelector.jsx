import { UsersRound, HeartHandshake } from 'lucide-react';
const roles = [
  { id: 'donor', title: 'Blood Donor', desc: 'I want to donate blood', Icon: UsersRound },
  { id: 'recipient', title: 'Blood Recipient', desc: 'I need blood support', Icon: HeartHandshake }
];
export default function RoleSelector({ value, onChange }) {
  return <fieldset className="role-area">
    <legend>I want to join as</legend>
    <div className="role-grid">
      {roles.map(({ id, title, desc, Icon }) => <label key={id}
        className={`role-card ${value === id ? 'selected' : ''}`}>
        <input type="radio" name="role" value={id} checked={value === id}
          onChange={() => onChange(id)} />
        <span className="role-check" aria-hidden="true" />
        <span className="role-symbol"><Icon size={23} strokeWidth={2.8} /></span>
        <span className="role-copy"><strong>{title}</strong><small>{desc}</small></span>
      </label>)}
    </div>
  </fieldset>;
}
