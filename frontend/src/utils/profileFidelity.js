/**
 * Single source of truth for Citizen Profile Completeness & Fidelity calculations.
 * Ensures strict synchronization between Dashboard, Demographic Profile settings, and top AppShell navbar.
 */

export const PROFILE_CORE_FIELDS = [
  { key: 'dateOfBirth', altKeys: ['dob'], label: 'Date of Birth' },
  { key: 'gender', label: 'Gender' },
  { key: 'state', label: 'State' },
  { key: 'district', label: 'District' },
  { key: 'annualIncome', altKeys: ['income'], label: 'Annual Income' },
  { key: 'occupation', label: 'Occupation' },
  { key: 'category', label: 'Category' },
  { key: 'educationLevel', altKeys: ['education'], label: 'Education Level' },
]

/**
 * Calculates dynamic profile completeness (0-100%).
 * @param {Object|null} profile - User's demographic profile object
 * @param {Object|null} user - User authentication object (for fallbacks like user.state)
 * @returns {number} Percentage between 0 and 100
 */
export function calculateProfileFidelity(profile, user = null) {
  if (!profile && !user) return 100
  const p = profile || {}
  const u = user || {}

  let filledCount = 0

  PROFILE_CORE_FIELDS.forEach(({ key, altKeys }) => {
    let val = p[key]

    // Check alternate keys if primary key is missing/empty
    if ((val === undefined || val === null || val === '') && altKeys) {
      for (const alt of altKeys) {
        if (p[alt] !== undefined && p[alt] !== null && p[alt] !== '') {
          val = p[alt]
          break
        }
      }
    }

    // Check user object fallback if still missing
    if ((val === undefined || val === null || val === '') && key === 'state') {
      val = u.state
    }

    if (val !== undefined && val !== null && val !== '') {
      filledCount++
    }
  })

  return Math.round((filledCount / PROFILE_CORE_FIELDS.length) * 100)
}

/**
 * Returns official 2-letter ISO state code or abbreviation for Indian states and UTs.
 * @param {string|null} stateName
 * @returns {string} 2-letter code e.g. 'MH', 'DL', 'UP'
 */
export function getStateCode(stateName) {
  if (!stateName) return 'MH'
  const STATE_CODES = {
    'maharashtra': 'MH',
    'delhi': 'DL',
    'uttar pradesh': 'UP',
    'bihar': 'BR',
    'west bengal': 'WB',
    'rajasthan': 'RJ',
    'madhya pradesh': 'MP',
    'tamil nadu': 'TN',
    'karnataka': 'KA',
    'gujarat': 'GJ',
    'andhra pradesh': 'AP',
    'telangana': 'TG',
    'kerala': 'KL',
    'jharkhand': 'JH',
    'assam': 'AS',
    'punjab': 'PB',
    'chhattisgarh': 'CG',
    'haryana': 'HR',
    'odisha': 'OD',
    'uttarakhand': 'UK',
    'himachal pradesh': 'HP',
    'tripura': 'TR',
    'meghalaya': 'ML',
    'manipur': 'MN',
    'nagaland': 'NL',
    'goa': 'GA',
    'arunachal pradesh': 'AR',
    'mizoram': 'MZ',
    'sikkim': 'SK',
    'ladakh': 'LA',
    'jammu and kashmir': 'JK',
    'puducherry': 'PY',
    'chandigarh': 'CH',
    'dadra and nagar haveli and daman and diu': 'DN',
    'andaman and nicobar islands': 'AN',
    'lakshadweep': 'LD',
  }
  return STATE_CODES[stateName.trim().toLowerCase()] || stateName.slice(0, 2).toUpperCase()
}
