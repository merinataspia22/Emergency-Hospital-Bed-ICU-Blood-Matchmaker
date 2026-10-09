function localToday() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
function invalidField(form, name, text) {
  const input = form.elements[name];
  input.classList.add('invalid');
  input.setAttribute('aria-invalid', 'true');
  input.focus();
  return text;
}
function checkAccountForm(form, isLogin, role) {
  const name = form.elements.fullName.value.trim();
  const phone = form.elements.phone.value.trim();
  const email = form.elements.email.value.trim();
  const password = form.elements.password.value;
  const lastDonated = form.elements.lastDonated.value;
  const required = isLogin ? ['email', 'password'] : ['fullName', 'phone', 'email', 'password'];
  form.querySelectorAll('.invalid').forEach(el => {
    el.classList.remove('invalid');
    el.removeAttribute('aria-invalid');
  });
  for (const key of required) {
    if (!form.elements[key].value.trim()) return invalidField(form, key, 'Please fill in all required fields.');
  }
  if (!isLogin && name.length < 2) return invalidField(form, 'fullName', 'Please enter a valid name.');
  if (!isLogin && !/^01[3-9]\d{8}$/.test(phone)) {
    return invalidField(form, 'phone', 'Enter an 11-digit Bangladeshi phone number.');
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return invalidField(form, 'email', 'Please enter a valid email address.');
  }
  if (!isLogin && password.length < 8) {
    return invalidField(form, 'password', 'Password must contain at least 8 characters.');
  }
  if (!isLogin && role === 'donor' && lastDonated > localToday()) {
    return invalidField(form, 'lastDonated', 'Last donated date cannot be in the future.');
  }
  return '';
}
