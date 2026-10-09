const form = document.getElementById('account-form');
const loginTab = document.getElementById('login-tab');
const registerTab = document.getElementById('register-tab');
const message = document.getElementById('form-message');
const heading = document.getElementById('form-title');
const submitButton = document.getElementById('submit-button');
const identityFields = document.getElementById('identity-fields');
const medicalFields = document.getElementById('medical-fields');
const donatedField = document.getElementById('donated-field');
const roleSection = document.querySelector('.role-section');
let isLogin = false;

function currentRole() {
  return form.querySelector('input[name="role"]:checked').value;
}
function clearFeedback() {
  message.hidden = true;
  form.querySelectorAll('.invalid').forEach(input => {
    input.classList.remove('invalid');
    input.removeAttribute('aria-invalid');
  });
}
function updateVisibleFields() {
  const role = currentRole();
  roleSection.hidden = isLogin;
  identityFields.hidden = isLogin;
  medicalFields.hidden = isLogin || role === 'hospital';
  donatedField.hidden = isLogin || role !== 'donor';
  document.getElementById('name-label').textContent = role === 'hospital' ? 'Hospital name' : 'Full name';
  medicalFields.classList.toggle('single-field', role === 'patient');
  clearFeedback();
}
function switchTab(login) {
  isLogin = login;
  loginTab.classList.toggle('active', login);
  registerTab.classList.toggle('active', !login);
  loginTab.setAttribute('aria-selected', String(login));
  registerTab.setAttribute('aria-selected', String(!login));
  heading.textContent = login ? 'Welcome back' : 'Create your account';
  submitButton.textContent = login ? 'Log in' : 'Create account';
  form.elements.password.autocomplete = login ? 'current-password' : 'new-password';
  updateVisibleFields();
}
function showMessage(text, isError) {
  message.textContent = text;
  message.className = 'form-message ' + (isError ? 'error' : 'success');
  message.hidden = false;
}
loginTab.addEventListener('click', () => switchTab(true));
registerTab.addEventListener('click', () => switchTab(false));
form.querySelectorAll('input[name="role"]').forEach(radio => {
  radio.addEventListener('change', updateVisibleFields);
});
form.addEventListener('input', event => {
  if (event.target.matches('input')) clearFeedback();
});
form.addEventListener('submit', event => {
  event.preventDefault();
  const error = checkAccountForm(form, isLogin, currentRole());
  if (error) return showMessage(error, true);
  showMessage(isLogin
    ? 'Demo login validated. A backend is needed to sign in.'
    : 'Form validated. A backend is needed to create the account.', false);
});
document.getElementById('last-donated').max = localToday();
updateVisibleFields();
