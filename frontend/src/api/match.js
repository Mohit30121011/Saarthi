import client from './client'
import { getFallbackMatches, DEMO_PROFILE } from '../data/fallbackData'

function getEffectiveProfile() {
  let profile = DEMO_PROFILE
  try {
    const stored = localStorage.getItem('saarthi_profile')
    if (stored) profile = { ...DEMO_PROFILE, ...JSON.parse(stored) }
  } catch {}
  return profile
}

export function getMyMatches() {
  return client
    .get('/match/my-schemes')
    .then((r) => {
      if (r.data && typeof r.data === 'object' && r.data.byCategory) {
        try {
          localStorage.setItem('saarthi_dashboard_matches', JSON.stringify(r.data))
        } catch {}
        return r.data
      }
      throw new Error('Invalid matches response')
    })
    .catch((err) => {
      console.warn('Backend match API unavailable, using offline fallback:', err?.message)
      const fallback = getFallbackMatches(getEffectiveProfile())
      try {
        localStorage.setItem('saarthi_dashboard_matches', JSON.stringify(fallback))
      } catch {}
      return fallback
    })
}

export function refreshMatches() {
  return client
    .post('/match/refresh')
    .then((r) => {
      if (r.data && typeof r.data === 'object' && r.data.byCategory) {
        try {
          localStorage.setItem('saarthi_dashboard_matches', JSON.stringify(r.data))
        } catch {}
        return r.data
      }
      throw new Error('Invalid matches response')
    })
    .catch((err) => {
      console.warn('Backend refresh API unavailable, using offline fallback:', err?.message)
      const fallback = getFallbackMatches(getEffectiveProfile())
      try {
        localStorage.setItem('saarthi_dashboard_matches', JSON.stringify(fallback))
      } catch {}
      return fallback
    })
}

export function simulateMatches(params = {}) {
  return client
    .get('/match/simulate', { params })
    .then((r) => r.data)
    .catch((err) => {
      console.warn('Backend simulate API unavailable, simulating offline:', err?.message)
      const simulatedIncome = params.annualIncome ? Number(params.annualIncome) : 500000
      const simProfile = { ...getEffectiveProfile(), annualIncome: simulatedIncome }
      const simMatchesRes = getFallbackMatches(simProfile)
      const baseMatchesRes = getFallbackMatches(getEffectiveProfile())

      const flatSim = Object.values(simMatchesRes.byCategory).flat()
      const flatBase = Object.values(baseMatchesRes.byCategory).flat()
      const baseIds = new Set(flatBase.map((m) => m.scheme.schemeId))

      const newlyUnlocked = flatSim.filter((m) => !baseIds.has(m.scheme.schemeId)).map((m) => ({ match: m }))
      const retained = flatSim.filter((m) => baseIds.has(m.scheme.schemeId))
      const lost = flatBase.filter((m) => !flatSim.some((s) => s.scheme.schemeId === m.scheme.schemeId))

      return {
        baselineIncome: getEffectiveProfile().annualIncome,
        simulatedIncome,
        baselineCount: flatBase.length,
        simulatedCount: flatSim.length,
        byCategory: simMatchesRes.byCategory,
        simulatedMatches: flatSim,
        newlyUnlocked,
        retained,
        lost,
      }
    })
}

