import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import LoginField from './LoginField.jsx';
import LoginLogo from './LoginLogo.jsx';
import LoginSocial from './LoginSocial.jsx';
import { readEmail, saveEmail, validateLogin } from '../../utils/loginValidation.js';
export default function LoginForm({ onNotice, onForgot }) {
  const navigate = useNavigate();
  const [values, setValues] = useState({ email: readEmail(), password: '' });
  const [remember, setRemember] = useState(!!readEmail());
  const [visible, setVisible] = useState(false);
  const [errors, setErrors] = useState({});
  const update = (key, value) => {
    setValues(v => ({ ...v, [key]: value }));
    setErrors(v => ({ ...v, [key]: '' }));
  };
  const blur = key => {
    if (!values[key]) return;
    setErrors(prev => ({ ...prev, [key]: validateLogin(values)[key] || '' }));
  };
  const submit = event => {
    event.preventDefault();
    const nextErrors = validateLogin(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      onNotice({ type: 'error', title: 'Please check your details',
        description: 'Correct the highlighted fields before continuing.' });
      document.getElementById(`login-${Object.keys(nextErrors)[0]}`)?.focus();
      return;
    }
    saveEmail(remember ? values.email.trim() : '');
    navigate('/', { state: { demoLogin: true }, replace: true });
  };
  return <section className="bc-form-panel" aria-labelledby="bc-login-title">
    <LoginLogo />
    <div className="bc-form-content">
      <p className="bc-top-caption"><span className="bc-live-dot" /> Every drop matters</p>
      <h1 id="bc-login-title">Welcome Back</h1>
      <p className="bc-intro">Login to your account to continue<br className="bc-desktop-br" /> making a difference.</p>
      <form onSubmit={submit} noValidate>
        <LoginField name="email" type="email" value={values.email} error={errors.email}
          onChange={update} onBlur={blur} />
        <LoginField name="password" value={values.password} error={errors.password}
          visible={visible} toggle={() => setVisible(v => !v)} onChange={update} onBlur={blur} />
        <div className="bc-form-options">
          <label className="bc-remember"><input type="checkbox" checked={remember} title="Remember email only, not password"
            onChange={e => setRemember(e.target.checked)} /><span>Remember me</span></label>
          <button type="button" className="bc-link" onClick={onForgot}>Forgot Password?</button>
        </div>
        <button type="submit" className="bc-login-submit">Login <ArrowRight size={19} /></button>
      </form>
      <LoginSocial onSocial={name => onNotice({ type: 'info', title: `${name} sign-in is not connected`,
        description: 'OAuth configuration and a backend are required for real social login.' })} />
      <p className="bc-signup-text">Don’t have an account? <Link to="/register">Sign Up</Link></p>
      <p className="bc-demo-caption">Frontend preview only · Real account verification needs a backend.</p>
    </div>
  </section>;
}
