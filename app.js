const authForm = document.querySelector('#auth-form');
const modeButtons = document.querySelectorAll('[data-mode]');
const nameField = document.querySelector('#name-field');
const fullNameInput = document.querySelector('#full_name');
const passwordInput = document.querySelector('#password');
const passwordToggle = document.querySelector('.password-toggle');
const formTitle = document.querySelector('#form-title');
const formDescription = document.querySelector('#form-description');
const submitLabel = document.querySelector('.submit-label');
const rememberRow = document.querySelector('#remember-row');
const formStatus = document.querySelector('.form-status');
let authMode = 'login';

const authAdapter = {
  async signIn(credentials) {
    return { action: 'signIn', credentials };
  },
  async signUp(credentials) {
    return { action: 'signUp', credentials };
  },
  async resetPassword(email) {
    return { action: 'resetPassword', email };
  },
  async signInWithProvider(provider) {
    return { action: 'signInWithProvider', provider };
  }
};

function setMode(mode) {
  authMode = mode;
  const isRegistering = mode === 'register';
  modeButtons.forEach((button) => {
    const isActive = button.dataset.mode === mode;
    button.classList.toggle('is-active', isActive);
    button.setAttribute('aria-selected', String(isActive));
  });
  nameField.hidden = !isRegistering;
  fullNameInput.required = isRegistering;
  rememberRow.hidden = isRegistering;
  formTitle.textContent = isRegistering ? 'Create your account' : 'Welcome back';
  formDescription.textContent = isRegistering ? 'Start building your space in a few seconds.' : 'Sign in to continue to your space.';
  submitLabel.textContent = isRegistering ? 'Create account' : 'Sign in';
  passwordInput.autocomplete = isRegistering ? 'new-password' : 'current-password';
  clearStatus();
}

function clearStatus() {
  formStatus.textContent = '';
  formStatus.classList.remove('is-error');
}

function showStatus(message, isError = false) {
  formStatus.textContent = message;
  formStatus.classList.toggle('is-error', isError);
}

function validateForm() {
  const fields = [authForm.email, authForm.password];
  if (authMode === 'register') fields.unshift(authForm.full_name);
  let isValid = true;
  fields.forEach((field) => {
    const error = document.querySelector(`[data-error-for="${field.name}"]`);
    error.textContent = '';
    if (!field.validity.valid) {
      error.textContent = field.validity.valueMissing ? 'This field is required.' : field.validationMessage;
      isValid = false;
    }
  });
  return isValid;
}

modeButtons.forEach((button) => button.addEventListener('click', () => setMode(button.dataset.mode)));

passwordToggle.addEventListener('click', () => {
  const isVisible = passwordInput.type === 'text';
  passwordInput.type = isVisible ? 'password' : 'text';
  passwordToggle.textContent = isVisible ? 'Show' : 'Hide';
  passwordToggle.setAttribute('aria-label', isVisible ? 'Show password' : 'Hide password');
  passwordToggle.setAttribute('aria-pressed', String(!isVisible));
});

authForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  clearStatus();
  if (!validateForm()) return;
  const formData = new FormData(authForm);
  const credentials = Object.fromEntries(formData.entries());
  delete credentials.remember;
  try {
    if (authMode === 'register') {
      await authAdapter.signUp(credentials);
      showStatus('Your account is ready to connect.');
    } else {
      await authAdapter.signIn(credentials);
      showStatus('Sign-in is ready to connect.');
    }
  } catch (error) {
    showStatus(error.message || 'Something went wrong. Please try again.', true);
  }
});

document.querySelector('#forgot-password').addEventListener('click', async () => {
  clearStatus();
  const email = authForm.email.value.trim();
  if (!email || !authForm.email.validity.valid) {
    document.querySelector('[data-error-for="email"]').textContent = 'Enter your email first.';
    authForm.email.focus();
    return;
  }
  await authAdapter.resetPassword(email);
  showStatus('Password reset is ready to connect.');
});

document.querySelectorAll('[data-provider]').forEach((button) => {
  button.addEventListener('click', async () => {
    await authAdapter.signInWithProvider(button.dataset.provider);
    showStatus(`${button.textContent.trim()} sign-in is ready to connect.`);
  });
});
