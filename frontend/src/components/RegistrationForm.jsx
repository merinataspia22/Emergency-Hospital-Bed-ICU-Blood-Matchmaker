
import { useState } from 'react';
import {
  Heart, UserRound, Mail, Phone, LockKeyhole,
  Droplet, MapPin, CalendarDays, ArrowRight
} from 'lucide-react';

import RoleSelector from './RoleSelector.jsx';
import FormField from './FormField.jsx';
import { bloodGroups, locations } from '../data/site.js';
import {
  initialForm,
  passwordStrength,
  todayLocal,
  validateRegistration
} from '../utils/validation.js';

const inputDefs = [
  {
    name: 'name',
    label: 'Full Name',
    icon: UserRound,
    placeholder: 'Enter your full name',
    autoComplete: 'name'
  },
  {
    name: 'email',
    label: 'Email Address',
    icon: Mail,
    type: 'email',
    placeholder: 'Enter your email',
    autoComplete: 'email'
  },
  {
    name: 'phone',
    label: 'Phone Number',
    icon: Phone,
    type: 'tel',
    placeholder: 'Enter your phone number',
    autoComplete: 'tel'
  },
  {
    name: 'password',
    label: 'Password',
    icon: LockKeyhole,
    type: 'password',
    placeholder: 'Create a password',
    autoComplete: 'new-password'
  },
  {
    name: 'bloodGroup',
    label: 'Blood Group',
    icon: Droplet,
    type: 'select',
    placeholder: 'Select your blood group',
    options: bloodGroups
  },
  {
    name: 'location',
    label: 'Location',
    icon: MapPin,
    type: 'select',
    placeholder: 'Select your location',
    options: locations
  }
];

export default function RegistrationForm({
  onSuccess,
  onError,
  openPolicy,
  openLogin
}) {
  const [form, setForm] = useState({ ...initialForm });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const update = (name, value) => {
    setForm(previous => ({
      ...previous,
      [name]: value
    }));

    setErrors(previous => ({
      ...previous,
      [name]: ''
    }));

    setSubmitError('');
  };

  const blur = name => {
    if (form[name]) {
      setErrors(previous => ({
        ...previous,
        [name]: validateRegistration(form)[name] || ''
      }));
    }
  };

  const submit = async event => {
    event.preventDefault();

    if (saving) return;

    const result = validateRegistration(form);

    setErrors(result);
    setSubmitError('');

    if (Object.keys(result).length) {
      onError?.();

      document
        .getElementById(Object.keys(result)[0])
        ?.focus();

      return;
    }

    setSaving(true);

    try {
      await onSuccess({
        ...form,
        name: form.name.trim(),
        email: form.email.trim().toLowerCase()
      });

      // Reset only after successful registration
      setForm({ ...initialForm });
      setErrors({});
      setShowPassword(false);

    } catch (error) {
      const message =
        error?.message ||
        'Account could not be created. Please try again.';

      setSubmitError(message);
      onError?.(message);

    } finally {
      setSaving(false);
    }
  };

  const strength = passwordStrength(form.password);

  return (
    <section
      className="register-card"
      id="register"
      aria-labelledby="register-title"
    >
      <div className="eyebrow">
        <Heart size={14} fill="currentColor" />
        Join the Lifesavers
      </div>

      <h1 id="register-title">
        Create Your Account
        <br />
        <span>Be a Part of Change</span>
      </h1>

      <p className="intro">
        Join BloodConnect as a donor or recipient and help us
        <br className="desktop-break" />
        build a safer, healthier community.
      </p>

      <form onSubmit={submit} noValidate>
        <RoleSelector
          value={form.role}
          onChange={value => update('role', value)}
        />

        <div className="fields-grid">
          {inputDefs.map(def => (
            <FormField
              key={def.name}
              {...def}
              value={form[def.name]}
              onChange={update}
              onBlur={blur}
              error={errors[def.name]}
              showPassword={showPassword}
              onTogglePassword={() =>
                setShowPassword(value => !value)
              }
            />
          ))}

          {form.role === 'donor' && (
            <FormField
              label="Last Donation Date (for Donors)"
              name="lastDonation"
              icon={CalendarDays}
              type="date"
              value={form.lastDonation}
              onChange={update}
              onBlur={blur}
              max={todayLocal()}
              error={errors.lastDonation}
            />
          )}
        </div>

        {form.password && (
          <div
            className="password-strength"
            aria-live="polite"
          >
            <div className="strength-bars">
              {[1, 2, 3].map(n => (
                <i
                  key={n}
                  className={
                    strength >= n
                      ? `active level-${strength}`
                      : ''
                  }
                />
              ))}
            </div>

            <span>
              {['', 'Weak', 'Fair', 'Strong'][strength]}
              {' '}password
            </span>
          </div>
        )}

        <div className="terms-row">
          <label className="terms-label">
            <input
              id="terms"
              type="checkbox"
              checked={form.terms}
              onChange={event =>
                update('terms', event.target.checked)
              }
            />
            <span>I agree to the </span>
          </label>

          <button
            type="button"
            className="text-link"
            onClick={() =>
              openPolicy('Terms of Service')
            }
          >
            Terms of Service
          </button>

          <span> and </span>

          <button
            type="button"
            className="text-link"
            onClick={() =>
              openPolicy('Privacy Policy')
            }
          >
            Privacy Policy
          </button>
        </div>

        {errors.terms && (
          <span className="field-error terms-error">
            {errors.terms}
          </span>
        )}

        {Object.values(errors).some(Boolean) && (
          <p className="form-alert" role="alert">
            Please correct the highlighted fields
            before continuing.
          </p>
        )}

        {submitError && (
          <p className="form-alert" role="alert">
            {submitError}
          </p>
        )}

        <button
          className="submit-button"
          type="submit"
          disabled={saving}
          aria-busy={saving}
        >
          {saving
            ? 'Creating Account...'
            : 'Create Account'}

          <ArrowRight size={18} />
        </button>

        <p className="login-hint">
          Already have an account?

          <button
            type="button"
            className="text-link"
            onClick={openLogin}
          >
            Log In
          </button>
        </p>
      </form>
    </section>
  );
}
