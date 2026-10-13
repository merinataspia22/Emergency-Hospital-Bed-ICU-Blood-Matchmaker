import { Eye, EyeOff, LockKeyhole, Mail } from 'lucide-react';
export default function LoginField({ name, type, value, error, visible, toggle, onChange, onBlur }) {
  const isPassword = name === 'password';
  const Icon = isPassword ? LockKeyhole : Mail;
  return <div className="bc-field">
    <label htmlFor={`login-${name}`}>{isPassword ? 'Password' : 'Email Address'}</label>
    <div className={`bc-input-box ${error ? 'bc-invalid' : ''}`}>
      <Icon size={21} aria-hidden="true" />
      <input id={`login-${name}`} name={name} value={value}
        type={isPassword ? (visible ? 'text' : 'password') : type}
        placeholder={isPassword ? 'Enter your password' : 'Enter your email'}
        autoComplete={isPassword ? 'current-password' : 'email'}
        autoCapitalize="none" spellCheck={false} aria-invalid={!!error}
        aria-describedby={error ? `login-${name}-error` : undefined}
        onChange={e => onChange(name, e.target.value)} onBlur={() => onBlur(name)} />
      {isPassword && <button type="button" className="bc-show-pw" onClick={toggle}
        aria-label={visible ? 'Hide password' : 'Show password'}>
        {visible ? <EyeOff size={21} /> : <Eye size={21} />}
      </button>}
    </div>
    {error && <p id={`login-${name}-error`} className="bc-error" role="alert">{error}</p>}
  </div>;
}
