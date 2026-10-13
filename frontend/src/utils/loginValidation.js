export const validateLogin = ({ email = '', password = '' }) => {
  const errors = {};
  const cleanEmail = email.trim();
  if (!cleanEmail) errors.email = 'Please enter your email address.';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail))
    errors.email = 'Please enter a valid email address.';
  if (!password) errors.password = 'Please enter your password.';
  return errors;
};
// Remember only email, never passwords or authentication tokens.
export const readEmail = () => {
  try { return window.localStorage.getItem('bc-remembered-email') || ''; }
  catch { return ''; }
};
export const saveEmail = value => {
  try {
    if (value) window.localStorage.setItem('bc-remembered-email', value);
    else window.localStorage.removeItem('bc-remembered-email');
  } catch { /* storage can be blocked by browser settings */ }
};
