// frontend/src/data/curatedSchemes.js
// Curation data and helper utilities for Trending and Seasonal Government Welfare Schemes

export const TRENDING_METADATA = {
  // Flagship Central Schemes
  'Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)': {
    isTrending: true,
    trendingRank: 1,
    badgeText: '🔥 Flagship DBT',
    metric: '110M+ Farmers Enrolled',
    highlight: '₹6,000/year directly to Aadhaar-linked bank account in 3 installments.',
    accentColor: '#E65100', // Saffron
  },
  'Ayushman Bharat Pradhan Mantri Jan Arogya Yojana (PM-JAY)': {
    isTrending: true,
    trendingRank: 2,
    badgeText: '🔥 550M+ Covered',
    metric: 'Cashless Hospitalization',
    highlight: 'Up to ₹5 Lakh cashless treatment per family/year across empaneled hospitals.',
    accentColor: '#138808', // Harita Green
  },
  'Pradhan Mantri Awas Yojana - Urban (PMAY-U 2.0)': {
    isTrending: true,
    trendingRank: 3,
    badgeText: '🔥 High Application Volume',
    metric: 'Housing Subsidy',
    highlight: 'Interest subsidy & central assistance for pucca house construction.',
    accentColor: '#0D2240', // Navy
  },
  'Prime Minister\'s Employment Generation Programme (PMEGP)': {
    isTrending: true,
    trendingRank: 4,
    badgeText: '⚡ Top Entrepreneurship Pick',
    metric: 'Up to 35% Capital Subsidy',
    highlight: 'Credit-linked subsidy for new micro-enterprises up to ₹50 Lakh.',
    accentColor: '#7C3AED',
  },
  'PM Vishwakarma Yojana': {
    isTrending: true,
    trendingRank: 5,
    badgeText: '🔥 Artisans Priority',
    metric: '18 Traditional Trades',
    highlight: '₹15,000 toolkit grant + up to ₹3 Lakh collateral-free loan at 5% interest.',
    accentColor: '#D97706',
  },
  'Sukanya Samriddhi Yojana': {
    isTrending: true,
    trendingRank: 6,
    badgeText: '🌟 Highest Interest Small Savings',
    metric: '8.2% Sovereign Yield',
    highlight: 'Tax-free small savings scheme for girl child with 8.2% annual compounded interest.',
    accentColor: '#BE185D',
  },
  'Pradhan Mantri MUDRA Yojana (PMMY)': {
    isTrending: true,
    trendingRank: 7,
    badgeText: '⚡ Micro-Credit Surge',
    metric: 'Loans Up to ₹20 Lakh',
    highlight: 'Collateral-free micro-credit across Shishu, Kishor, and Tarun categories.',
    accentColor: '#0284C7',
  },

  // Maharashtra State Schemes
  'Mukhyamantri Majhi Ladki Bahin Yojana': {
    isTrending: true,
    trendingRank: 1,
    badgeText: '🔥 Maharashtra Flagship',
    metric: '20M+ Women Registered',
    highlight: 'Monthly financial assistance of ₹1,500 directly transferred to eligible women.',
    accentColor: '#E65100',
  },
  'Namo Shetkari Mahasanman Nidhi Yojana': {
    isTrending: true,
    trendingRank: 2,
    badgeText: '🔥 Maharashtra Double Benefit',
    metric: '₹6,000/yr State Top-Up',
    highlight: 'Additional ₹6,000/year to PM-KISAN registered landholding farmers in Maharashtra.',
    accentColor: '#138808',
  },
  'Mahatma Jyotiba Phule Jan Arogya Yojana (MJPJAY)': {
    isTrending: true,
    trendingRank: 3,
    badgeText: '🔥 Universal State Cover',
    metric: '₹1.5L - ₹5L Coverage',
    highlight: 'Cashless healthcare cover across government and empanelled private hospitals in MH.',
    accentColor: '#0284C7',
  },
  'Lek Ladki Yojana': {
    isTrending: true,
    trendingRank: 4,
    badgeText: '🌟 Girl Child Welfare',
    metric: 'Total ₹1,01,000 Benefit',
    highlight: 'Direct financial assistance in 5 phases from birth until the girl child turns 18.',
    accentColor: '#BE185D',
  },
}

export const SEASONAL_METADATA = {
  // Agriculture Season (Kharif / Rabi & Monsoons)
  'Pradhan Mantri Fasal Bima Yojana (PMFBY)': {
    isSeasonal: true,
    seasonType: 'agriculture',
    seasonName: 'Kharif Agricultural Season',
    statusTag: '🌾 Crop Insurance Window Active',
    urgencyText: 'Farmer premium capped at 2% for Kharif crops.',
    windowLabel: 'Sowing Window Open',
    themeBg: 'from-emerald-950 via-teal-900 to-[#0D2240]',
    accentColor: '#10B981',
  },
  'PM Krishi Sinchayee Yojana - Per Drop More Crop (PMKSY-PDMC)': {
    isSeasonal: true,
    seasonType: 'agriculture',
    seasonName: 'Kharif Irrigation Window',
    statusTag: '💧 Micro-Irrigation Subsidy Open',
    urgencyText: '55% capital subsidy for small & marginal farmers on drip/sprinkler systems.',
    windowLabel: 'Sanctions Underway',
    themeBg: 'from-cyan-950 via-blue-900 to-[#0D2240]',
    accentColor: '#06B6D4',
  },
  'Kisan Credit Card (KCC) Scheme': {
    isSeasonal: true,
    seasonType: 'agriculture',
    seasonName: 'Seasonal Crop Loan Cycle',
    statusTag: '🌾 Kharif Credit Disbursement',
    urgencyText: 'Interest subvention at effective 4% for timely loan repayment.',
    windowLabel: 'Bank Sanctions Active',
    themeBg: 'from-amber-950 via-emerald-900 to-[#0D2240]',
    accentColor: '#F59E0B',
  },

  // Education / Academic Admission Season
  'Rajarshi Chhatrapati Shahu Maharaj Shikshan Shulk Shishyavrutti Yojana (EBC Scholarship)': {
    isSeasonal: true,
    seasonType: 'education',
    seasonName: 'Academic Year 2026-27',
    statusTag: '🎓 MahaDBT Portal Open',
    urgencyText: '100% Tuition fee reimbursement for professional/technical courses.',
    windowLabel: 'Fresh & Renewal Open',
    themeBg: 'from-indigo-950 via-blue-900 to-[#0D2240]',
    accentColor: '#6366F1',
  },
  'Post-Matric Scholarship for SC Students': {
    isSeasonal: true,
    seasonType: 'education',
    seasonName: 'National Scholarship Portal',
    statusTag: '🎓 NSP Admissions Cycle Active',
    urgencyText: 'Maintenance allowance and institutional fee waiver for Class 11 & above.',
    windowLabel: 'NSP Window Open',
    themeBg: 'from-purple-950 via-indigo-900 to-[#0D2240]',
    accentColor: '#8B5CF6',
  },
  'National Means-cum-Merit Scholarship (NMMS)': {
    isSeasonal: true,
    seasonType: 'education',
    seasonName: 'Secondary School Intake',
    statusTag: '🎓 Class 9-12 Admission Cycle',
    urgencyText: '₹12,000 per annum (₹1,000/month) to meritorious students.',
    windowLabel: 'Fresh Applications Open',
    themeBg: 'from-sky-950 via-indigo-900 to-[#0D2240]',
    accentColor: '#38BDF8',
  },
  'Top Class Education Scheme for SC Students': {
    isSeasonal: true,
    seasonType: 'education',
    seasonName: 'Premier Institute Intake',
    statusTag: '🎓 IIT / IIM / NIT Admission Cycle',
    urgencyText: 'Full tuition reimbursement + ₹86,000 first year academic allowance.',
    windowLabel: 'NSP Admission Window',
    themeBg: 'from-blue-950 via-indigo-900 to-[#0D2240]',
    accentColor: '#60A5FA',
  },
  'AICTE Pragati Scholarship for Girls': {
    isSeasonal: true,
    seasonType: 'education',
    seasonName: 'Technical Admissions 2026-27',
    statusTag: '🎓 AICTE Diploma/Degree Window',
    urgencyText: '₹50,000 per annum for girl students in approved technical courses.',
    windowLabel: 'Portal Active',
    themeBg: 'from-pink-950 via-purple-900 to-[#0D2240]',
    accentColor: '#EC4899',
  },
}

// Helper: Normalize scheme name for flexible matching
function normalizeName(name) {
  if (!name) return ''
  return name.toLowerCase().replace(/[^a-z0-9]/g, '')
}

// Look up trending metadata for a scheme
export function getTrendingMeta(scheme) {
  if (!scheme || !scheme.name) return null
  const direct = TRENDING_METADATA[scheme.name]
  if (direct) return direct

  // Fallback fuzzy match on canonical keywords
  const norm = normalizeName(scheme.name)
  for (const [canonical, meta] of Object.entries(TRENDING_METADATA)) {
    const normCanon = normalizeName(canonical)
    if (norm.includes(normCanon) || normCanon.includes(norm)) {
      return meta
    }
  }

  // Heuristics for trending flagship schemes
  if (norm.includes('pmkisan') || norm.includes('kisansamman')) {
    return TRENDING_METADATA['Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)']
  }
  if (norm.includes('ayushman') || norm.includes('pmjay')) {
    return TRENDING_METADATA['Ayushman Bharat Pradhan Mantri Jan Arogya Yojana (PM-JAY)']
  }
  if (norm.includes('ladkibahin')) {
    return TRENDING_METADATA['Mukhyamantri Majhi Ladki Bahin Yojana']
  }
  if (norm.includes('vishwakarma')) {
    return TRENDING_METADATA['PM Vishwakarma Yojana']
  }
  if (norm.includes('namoshetkari')) {
    return TRENDING_METADATA['Namo Shetkari Mahasanman Nidhi Yojana']
  }

  return null
}

// Look up seasonal metadata for a scheme
export function getSeasonalMeta(scheme) {
  if (!scheme || !scheme.name) return null
  const direct = SEASONAL_METADATA[scheme.name]
  if (direct) return direct

  const norm = normalizeName(scheme.name)
  for (const [canonical, meta] of Object.entries(SEASONAL_METADATA)) {
    const normCanon = normalizeName(canonical)
    if (norm.includes(normCanon) || normCanon.includes(norm)) {
      return meta
    }
  }

  if (norm.includes('fasalbima') || norm.includes('pmfby')) {
    return SEASONAL_METADATA['Pradhan Mantri Fasal Bima Yojana (PMFBY)']
  }
  if (norm.includes('ebcscholarship') || norm.includes('shikshanshulk')) {
    return SEASONAL_METADATA['Rajarshi Chhatrapati Shahu Maharaj Shikshan Shulk Shishyavrutti Yojana (EBC Scholarship)']
  }
  if (norm.includes('postmatric') && norm.includes('sc')) {
    return SEASONAL_METADATA['Post-Matric Scholarship for SC Students']
  }
  if (norm.includes('perdropmorecrop') || norm.includes('pdmc')) {
    return SEASONAL_METADATA['PM Krishi Sinchayee Yojana - Per Drop More Crop (PMKSY-PDMC)']
  }

  return null
}

export function isSchemeTrending(scheme) {
  return !!getTrendingMeta(scheme)
}

export function isSchemeSeasonal(scheme) {
  return !!getSeasonalMeta(scheme)
}

// Filter a list of schemes to trending ones
export function filterTrendingSchemes(schemes = []) {
  return schemes
    .filter((s) => isSchemeTrending(s))
    .sort((a, b) => {
      const metaA = getTrendingMeta(a)
      const metaB = getTrendingMeta(b)
      return (metaA?.trendingRank || 99) - (metaB?.trendingRank || 99)
    })
}

// Filter a list of schemes to seasonal ones
export function filterSeasonalSchemes(schemes = []) {
  return schemes.filter((s) => isSchemeSeasonal(s))
}
