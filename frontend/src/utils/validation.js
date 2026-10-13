export const todayLocal = (date = new Date()) => {
  const pad = value => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};
export const initialForm = {
  role: 'donor', name: '', email: '', phone: '', password: '',
  bloodGroup: '', location: '', lastDonation: '', terms: false
};
export const passwordStrength = password => {
  if (!password) return 0;
  if (password.length >= 8 && /\d/.test(password) && /[a-z]/i.test(password)) return 3;
  return password.length >= 6 ? 2 : 1;
};
export function validateRegistration(form, today = todayLocal()) {
  const errors = {};
  if (form.name.trim().length < 2) errors.name = 'Enter your full name (at least 2 characters).';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) errors.email = 'Enter a valid email address.';
  const normalizedPhone = form.phone.replace(/[\s-]/g, '');
  if (!/^(?:\+?88)?01[3-9]\d{8}$/.test(normalizedPhone)) errors.phone = 'Use a valid Bangladesh mobile number.';
  if (passwordStrength(form.password) < 3) errors.password = 'Use 8+ characters with letters and a number.';
  if (!form.bloodGroup) errors.bloodGroup = 'Select your blood group.';
  if (!form.location) errors.location = 'Select your location.';
  if (form.role === 'donor' && form.lastDonation && form.lastDonation > today) {
    errors.lastDonation = 'This date cannot be in the future.';
  }
  if (!form.terms) errors.terms = 'Please agree before continuing.';
  return errors;
}
