// Statutory income ceilings for prominent Central & Maharashtra welfare schemes
export const SCHEME_INCOME_CEILINGS = {
  49: 21000,   // Sanjay Gandhi Niradhar Anudan Yojana
  5: 100000,   // Pre-Matric Scholarship for Minorities
  17: 100000,  // Mahatma Jyotiba Phule Jan Arogya Yojana (MJPJAY)
  51: 100000,  // Lek Ladki Yojana
  19: 120000,  // Ramai Awas Yojana
  44: 125000,  // Rashtriya Arogya Nidhi (RAN)
  26: 200000,  // Post-Matric Scholarship for Minorities
  4: 250000,   // Post-Matric Scholarship for SC Students
  21: 250000,  // PM YASASVI Scholarship
  16: 350000,  // National Means-cum-Merit Scholarship (NMMS)
  20: 450000,  // Central Sector Scheme of Scholarship for College and University Students
  25: 600000,  // National Fellowship for OBC Students
  18: 800000,  // Rajarshi Chhatrapati Shahu Maharaj Shikshan Shulk Shishyavrutti Yojana (EBC Scholarship)
  22: 800000,  // AICTE Pragati Scholarship for Girls
  23: 800000,  // AICTE Saksham Scholarship for Specially Abled Students
  24: 800000,  // Top Class Education Scheme for SC Students
  3: 900000,   // Pradhan Mantri Awas Yojana - Urban (PMAY-U 2.0)
}

export function getSimulationTag(item, simIncome, isDisqualified = false) {
  const schemeId = item?.scheme?.schemeId ?? item?.schemeId
  const ceiling = item?.ceilingValue || (schemeId ? SCHEME_INCOME_CEILINGS[schemeId] : null)

  if (isDisqualified || item?.isDisqualified) {
    const excess = ceiling && simIncome > ceiling ? simIncome - ceiling : null
    const capFormatted = ceiling
      ? ceiling >= 100000
        ? `₹${(ceiling / 100000).toFixed(ceiling % 100000 === 0 ? 0 : 1)}L`
        : `₹${ceiling.toLocaleString('en-IN')}`
      : null

    return {
      type: 'disqualified',
      label: capFormatted ? `EXCEEDS ${capFormatted} CAP` : 'DISQUALIFIED',
      ceiling,
      excess,
      reason: ceiling
        ? `Simulated income of ₹${Number(simIncome).toLocaleString('en-IN')} exceeds the statutory ceiling of ₹${Number(ceiling).toLocaleString('en-IN')} by +₹${Number(excess).toLocaleString('en-IN')}.`
        : `Household income of ₹${Number(simIncome).toLocaleString('en-IN')} exceeds statutory eligibility ceiling.`,
    }
  }

  if (item?.isOpportunity) {
    return {
      type: 'opportunity',
      label: 'NEW OPPORTUNITY',
      ceiling,
    }
  }

  if (ceiling && ceiling >= simIncome) {
    const capFormatted = ceiling >= 100000
      ? `${(ceiling / 100000).toFixed(ceiling % 100000 === 0 ? 0 : 1)}L`
      : ceiling.toLocaleString('en-IN')
    return {
      type: 'capped',
      label: `ELIGIBLE (Cap ₹${capFormatted})`,
      ceiling,
      ceilingFormatted: capFormatted,
    }
  }

  return {
    type: 'universal',
    label: 'UNIVERSAL (No Cap)',
  }
}
