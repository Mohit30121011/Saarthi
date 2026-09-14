import client from './client'

export function getProfile() {
  return client.get('/profile').then((r) => r.data)
}

export function updateProfile(profile) {
  return client.put('/profile', profile).then((r) => r.data)
}
