import { apiFetch } from './request';

export function login(username, password) {
  return apiFetch('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
}

export function register(username, email, password, confirmPassword) {
  return apiFetch('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ username, email, password, confirmPassword }),
  });
}

export function getMe() {
  return apiFetch('/api/auth/me');
}

export function sendResetCode(email) {
  return apiFetch('/api/auth/send-reset-code', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

export function verifyResetCode(email, code) {
  return apiFetch('/api/auth/verify-reset-code', {
    method: 'POST',
    body: JSON.stringify({ email, code }),
  });
}

export function resetPassword(email, code, newPassword) {
  return apiFetch('/api/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ email, code, newPassword }),
  });
}
