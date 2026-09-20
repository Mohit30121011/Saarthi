import client from './client'
import { DEMO_PROFILE } from '../data/fallbackData'

export function getProfile() {
  return client
    .get('/profile')
    .then((r) => {
      if (r.data && typeof r.data === 'object') {
        localStorage.setItem('saarthi_profile', JSON.stringify(r.data))
        return r.data
      }
      throw new Error('Invalid profile data')
    })
    .catch((err) => {
      console.warn('Backend profile API unavailable, using cached/demo profile:', err?.message)
      try {
        const stored = localStorage.getItem('saarthi_profile')
        if (stored) return JSON.parse(stored)
      } catch {}
      return DEMO_PROFILE
    })
}

export function updateProfile(profile) {
  return client
    .put('/profile', profile)
    .then((r) => {
      if (r.data && typeof r.data === 'object') {
        localStorage.setItem('saarthi_profile', JSON.stringify(r.data))
        return r.data
      }
      localStorage.setItem('saarthi_profile', JSON.stringify(profile))
      return profile
    })
    .catch((err) => {
      console.warn('Backend profile update unavailable, updating local cache:', err?.message)
      localStorage.setItem('saarthi_profile', JSON.stringify(profile))
      return profile
    })
}
