import { api } from './client'

export function register(name, email, password) {
  return api('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  })
}

export function login(email, password) {
  return api('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
}

export function loginWithGoogle(idToken) {
  return api('/api/auth/google', {
    method: 'POST',
    body: JSON.stringify({ idToken }),
  })
}

export function getMe() {
  return api('/api/auth/me')
}
