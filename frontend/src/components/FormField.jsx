import { Eye, EyeOff, ChevronDown } from 'lucide-react';
export default function FormField({ label, name, icon: Icon, type = 'text', value, onChange,
  onBlur, error, placeholder, options, showPassword, onTogglePassword, max, autoComplete }) {
  const realType = type === 'password' && showPassword ? 'text' : type;
  const common = { id: name, name, value, onChange: e => onChange(name, e.target.value),
    onBlur: () => onBlur(name), 'aria-invalid': !!error,
    'aria-describedby': error ? `${name}-error` : undefined };
  return <div className={`field ${error ? 'has-error' : ''}`}>
    <label htmlFor={name}>{label}</label>
    <div className="input-wrap">
      <Icon size={16} strokeWidth={1.9} className="field-icon" aria-hidden="true" />
      {type === 'select' ? <select {...common} required>
        <option value="" disabled>{placeholder}</option>
        {options.map(option => <option key={option} value={option}>{option}</option>)}
      </select> : <input {...common} type={realType} placeholder={placeholder}
        autoComplete={autoComplete} max={max} />}
      {type === 'password' && <button type="button" className="field-action"
        onClick={onTogglePassword} aria-label={showPassword ? 'Hide password' : 'Show password'}>
        {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
      </button>}
      {type === 'select' && <ChevronDown className="select-arrow" size={15} aria-hidden="true" />}
    </div>
    {error && <span className="field-error" id={`${name}-error`}>{error}</span>}
  </div>;
}
