import client from './client'

export function register({ email, password, fullName, phone }) {
  return client.post('/auth/register', { email, password, fullName, phone }).then((r) => r.data)
}

export function login({ email, password }) {
  return client.post('/auth/login', { email, password }).then((r) => r.data)
}
