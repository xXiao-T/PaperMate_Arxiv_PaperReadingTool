const BASE_URL = 'http://localhost:8080';

export function getToken() {
  return localStorage.getItem('papermate_token');
}

export function setToken(token) {
  if (token) {
    localStorage.setItem('papermate_token', token);
  } else {
    localStorage.removeItem('papermate_token');
  }
}

export async function apiFetch(path, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const body = await response.json();

  if (body.code !== 200 && body.code !== 0) {
    throw new Error(body.message || 'Request failed');
  }

  return body.data;
}
