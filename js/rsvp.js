// RSVP form — native validation + inline error messages, fetch POST to the
// endpoint declared in the form's data-endpoint attribute (Formspree-shaped).
// Success replaces the form with the stamping date lockup.

import { bindCalendarButtons } from './calendar.js';

const form = document.querySelector('[data-rsvp-form]');

const MESSAGES = {
  name: 'Please tell us your name.',
  email: 'Please enter a valid email address.',
  phone: 'Please enter a valid phone number.',
  party: 'Party size must be between 1 and 12.',
};

function showError(field, msg) {
  const wrap = field.closest('.field');
  wrap.classList.toggle('has-error', !!msg);
  wrap.querySelector('.field__error').textContent = msg || '';
  field.setAttribute('aria-invalid', msg ? 'true' : 'false');
}

function validateField(field) {
  if (field.validity.valid) { showError(field, ''); return true; }
  showError(field, MESSAGES[field.name] || 'Please check this field.');
  return false;
}

if (form) {
  form.querySelectorAll('input').forEach((f) => {
    f.addEventListener('blur', () => validateField(f));
    f.addEventListener('input', () => {
      if (f.closest('.field')?.classList.contains('has-error')) validateField(f);
    });
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fields = [...form.querySelectorAll('input')];
    const ok = fields.map(validateField).every(Boolean);
    if (!ok) {
      form.querySelector('.has-error input')?.focus();
      return;
    }

    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.textContent = 'Sending…';

    try {
      const endpoint = form.dataset.endpoint;
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: new FormData(form),
      });
      if (!res.ok) throw new Error(`RSVP endpoint returned ${res.status}`);
      showSuccess();
    } catch (err) {
      console.error(err);
      btn.disabled = false;
      btn.textContent = 'RSVP';
      const status = form.querySelector('[data-form-status]');
      status.textContent = 'Something went wrong sending your RSVP. Please try again, or email us directly.';
    }
  });
}

function showSuccess() {
  const wrap = form.closest('[data-rsvp-wrap]');
  wrap.innerHTML = `
    <div class="rsvp-success" role="status">
      <p class="date-lockup rsvp-success__stamp" aria-label="October 22, 2026">
        <span>10</span><span class="rule" aria-hidden="true"></span><span>22</span><span class="rule" aria-hidden="true"></span><span>26</span>
      </p>
      <p class="rsvp-success__msg">We'll see you there.</p>
      <p>Your RSVP has been received. A confirmation will follow by email.</p>
      <p style="margin-top:1.5rem"><button type="button" class="btn btn--ghost" data-ics>Add to calendar (.ics)</button></p>
    </div>`;
  bindCalendarButtons(wrap);
  requestAnimationFrame(() => wrap.querySelector('.rsvp-success__stamp').classList.add('is-stamped'));
}
