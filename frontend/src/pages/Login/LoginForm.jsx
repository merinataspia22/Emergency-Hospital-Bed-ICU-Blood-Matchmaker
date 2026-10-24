
import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import LoginField from './LoginField.jsx';
import LoginLogo from './LoginLogo.jsx';
import LoginSocial from './LoginSocial.jsx';

import {
  readEmail,
  saveEmail,
  validateLogin
} from '../../utils/loginValidation.js';

import { useAuth } from '../../auth/AuthContext.jsx';
import { ROLE_ROUTES } from '../../auth/demoAuth.js';

export default function LoginForm({ onNotice, onForgot }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [values, setValues] = useState({
    email: location.state?.email || readEmail(),
    password: ''
  });

  const [remember, setRemember] = useState(
    Boolean(readEmail())
  );

  const [visible, setVisible] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const update = (key, value) => {
    setValues(previous => ({
      ...previous,
      [key]: value
    }));

    setErrors(previous => ({
      ...previous,
      [key]: ''
    }));
  };

  const blur = key => {
    if (!values[key]) return;

    setErrors(previous => ({
      ...previous,
      [key]: validateLogin(values)[key] || ''
    }));
  };

  const submit = async event => {
    event.preventDefault();

    if (submitting) return;

    // Check empty fields and email format
    const nextErrors = validateLogin(values);

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length) {
      onNotice?.({
        type: 'error',
        title: 'Please check your details',
        description:
          'Correct the highlighted fields before continuing.'
      });

      document.getElementById(
        `login-${Object.keys(nextErrors)[0]}`
      )?.focus();

      return;
    }

    setSubmitting(true);

    try {
      // Common login for all four account roles
      const account = await login(
        values.email.trim(),
        values.password
      );

      // Get the dashboard for the account role
      const dashboard = ROLE_ROUTES[account.role];

      if (!dashboard) {
        throw new Error(
          'This account has no dashboard assigned.'
        );
      }

      // Remember email only, never the password
      saveEmail(
        remember ? values.email.trim() : ''
      );

      // Redirect to the correct dashboard
      navigate(dashboard, {
        replace: true
      });

    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Unable to log in.';

      setErrors(previous => ({
        ...previous,
        password: message
      }));

      setValues(previous => ({
        ...previous,
        password: ''
      }));

      onNotice?.({
        type: 'error',
        title: 'Login unsuccessful',
        description: message
      });

    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section
      className="bc-form-panel"
      aria-labelledby="bc-login-title"
    >
      <LoginLogo />

      <div className="bc-form-content">
        <p className="bc-top-caption">
          <span className="bc-live-dot" />
          Every drop matters
        </p>

        <h1 id="bc-login-title">
          Welcome Back
        </h1>

        <p className="bc-intro">
          Login to your account to continue
          <br className="bc-desktop-br" />
          making a difference.
        </p>

        <form onSubmit={submit} noValidate>

          <LoginField
            name="email"
            type="email"
            value={values.email}
            error={errors.email}
            onChange={update}
            onBlur={blur}
          />

          <LoginField
            name="password"
            value={values.password}
            error={errors.password}
            visible={visible}
            toggle={() => setVisible(current => !current)}
            onChange={update}
            onBlur={blur}
          />

          <div className="bc-form-options">
            <label className="bc-remember">
              <input
                type="checkbox"
                checked={remember}
                title="Remember email only, not password"
                onChange={event =>
                  setRemember(event.target.checked)
                }
              />
              <span>Remember me</span>
            </label>

            <button
              type="button"
              className="bc-link"
              onClick={onForgot}
            >
              Forgot Password?
            </button>
          </div>

          <button
            type="submit"
            className="bc-login-submit"
            disabled={submitting}
            aria-busy={submitting}
          >
            {submitting ? 'Logging in...' : 'Login'}
            <ArrowRight size={19} />
          </button>

        </form>

        <LoginSocial
          onSocial={name => onNotice?.({
            type: 'info',
            title: `${name} sign-in is not connected`,
            description:
              'OAuth configuration and a backend are required for real social login.'
          })}
        />

        <p className="bc-signup-text">
          Don’t have an account?{' '}
          <Link to="/register">
            Sign Up
          </Link>
        </p>

        
      </div>
    </section>
  );
}
