import { ALL_SCHEMES, DEMO_PROFILE, getFallbackMatches, evaluateSchemeRules } from './fallbackData.js'

function getEffectiveProfile() {
  try {
    const stored = localStorage.getItem('saarthi_profile')
    if (stored) return { ...DEMO_PROFILE, ...JSON.parse(stored) }
  } catch {}
  return DEMO_PROFILE
}

function toChatSchemeCard(scheme, verdict = null) {
  return {
    schemeId: scheme.schemeId,
    name: scheme.name,
    ministry: scheme.ministry || 'Government of India / Maharashtra',
    categoryName: scheme.categoryName || 'General',
    state: scheme.state || 'National',
    benefitSummary: scheme.benefitSummary || '',
    benefitAmount: scheme.benefitAmount || '',
    deadline: scheme.deadline || null,
    verifiedAt: scheme.verifiedAt || '2026-09-14',
    eligibilityVerdict: verdict,
  }
}

export function processCivicChat(userMessage, sessionId = null) {
  const q = (userMessage || '').trim().toLowerCase()
  const profile = getEffectiveProfile()
  const matchedData = getFallbackMatches(profile)
  const allMatchesList = Object.values(matchedData.byCategory).flat()

  const strongMatches = allMatchesList.filter((m) => m.confidence === 'STRONG')
  const partialMatches = allMatchesList.filter((m) => m.confidence === 'PARTIAL')

  // Case 1: Eligibility inquiry (e.g., "What schemes do I qualify for?", "Am I eligible?")
  if (
    q.includes('qualify') ||
    q.includes('eligible') ||
    q.includes('my scheme') ||
    q.includes('schemes for me') ||
    q.includes('what can i apply') ||
    q.includes('benefit') && q.includes('i get') ||
    q === 'what schemes do i qualify for?'
  ) {
    const topStrong = strongMatches.slice(0, 4).map((m) => {
      const full = ALL_SCHEMES.find((s) => s.schemeId === m.scheme.schemeId) || m.scheme
      return toChatSchemeCard(full, 'STRONG')
    })
    const topPartial = partialMatches.slice(0, 2).map((m) => {
      const full = ALL_SCHEMES.find((s) => s.schemeId === m.scheme.schemeId) || m.scheme
      return toChatSchemeCard(full, 'PARTIAL')
    })

    const reply = `Namaste ${profile.fullName || 'Citizen'}! Based on your verified civic demographic profile (**${profile.age || 19}-year-old ${profile.occupation || 'Student'} in ${profile.state || 'Maharashtra'}, ${profile.category || 'OBC'} category**, annual family income ₹${(profile.annualIncome || 70000).toLocaleString('en-IN')}):

You qualify for **${allMatchesList.length} welfare and scholarship schemes** (${strongMatches.length} Strong Matches and ${partialMatches.length} Partial Matches).

### Top Recommended Schemes for You:
1. **Central Sector Scheme of Scholarship for College & University Students**: ₹12,000–₹20,000 per annum for higher studies.
2. **PM YASASVI Scholarship**: Up to ₹1,25,000/year for OBC meritorious students.
3. **National Means-cum-Merit Scholarship (NMMS)**: ₹12,000/year financial assistance.
4. **Prime Minister's Employment Generation Programme (PMEGP)**: 15%–35% project subsidy for self-employment & startups.
5. **Rajarshi Chhatrapati Shahu Maharaj Shikshan Shulk (EBC Scholarship)**: Fee reimbursement (Partial match: requires domicile & fee receipt).

You can click any card below to review detailed gazette rules or track required application documents in your Checklist.`

    return {
      sessionId: sessionId || Date.now(),
      reply,
      schemes: [...topStrong, ...topPartial],
      limitReached: false,
    }
  }

  // Case 2: Deadline / Expiry inquiry (e.g., "What is the application deadline for Rajarshi Shahu Maharaj...", "closing soon")
  if (q.includes('deadline') || q.includes('last date') || q.includes('closing') || q.includes('expire') || q.includes('when to apply')) {
    // Specific scheme check: Rajarshi Shahu Maharaj
    if (q.includes('rajarshi') || q.includes('shahu') || q.includes('ebc')) {
      const ebc = ALL_SCHEMES.find((s) => s.schemeId === 18)
      return {
        sessionId: sessionId || Date.now(),
        reply: `The official application deadline for **${ebc.name}** is **September 25, 2026**.\n\nApplications are submitted via the Maharashtra State MahaDBT portal (mahadbt.maharashtra.gov.in). Make sure your Domicile Certificate, Income Certificate (<= ₹8 Lakh), and Cap Allotment letter are uploaded before the cutoff date.`,
        schemes: [toChatSchemeCard(ebc, 'PARTIAL')],
        limitReached: false,
      }
    }

    // General expiring schemes
    const expiring = ALL_SCHEMES.filter((s) => s.deadline).sort((a, b) => a.deadline.localeCompare(b.deadline))
    const cards = expiring.slice(0, 4).map((s) => {
      const evalRes = evaluateSchemeRules(s, profile)
      return toChatSchemeCard(s, evalRes.verdict)
    })

    const reply = `Here are the key upcoming application deadlines for schemes applicable to Maharashtra and Central portals:

- **Rajarshi Chhatrapati Shahu Maharaj Shikshan Shulk (EBC)**: Closes **September 25, 2026**
- **Prime Minister's Employment Generation Programme (PMEGP)**: Closes **September 28, 2026**
- **PM Kisan Samman Nidhi (PM-KISAN)**: Next tranche enrollment window closes **September 29, 2026**
- **AICTE Pragati Scholarship for Girls**: Closes **October 01, 2026**

Ensure all mandatory KYC and caste/income verifications are completed prior to these dates.`

    return {
      sessionId: sessionId || Date.now(),
      reply,
      schemes: cards,
      limitReached: false,
    }
  }

  // Case 3: Document & Checklist inquiry (e.g., "What documents do I need", "checklist", "proof")
  if (q.includes('document') || q.includes('checklist') || q.includes('certificate') || q.includes('proof') || q.includes('paperwork')) {
    return {
      sessionId: sessionId || Date.now(),
      reply: `For most student scholarships, business grants, and Maharashtra welfare schemes, the standard government checklist requires:

1. **Aadhaar Card** (Linked with mobile number & bank account for DBT)
2. **Income Certificate** (Issued by Tahsildar / Sub-Divisional Officer, valid for FY 2026-27)
3. **Domicile / Residence Certificate of Maharashtra** (Issued by competent authority)
4. **Caste / Category Certificate** (e.g. OBC Non-Creamy Layer certificate, if applicable)
5. **Bank Account Passbook / Cancelled Cheque** (With NPCI Aadhaar seeding enabled)
6. **Previous Academic Marksheet & College Fee Receipt**

You can use the **Checklist tab** in the top navigation to track your document readiness step by step.`,
      schemes: strongMatches.slice(0, 2).map((m) => toChatSchemeCard(m.scheme, 'STRONG')),
      limitReached: false,
    }
  }

  // Case 4: Category / Domain specific inquiries (e.g. Education, Health, Agriculture, Business)
  let matchedCategory = null
  if (q.includes('education') || q.includes('scholarship') || q.includes('student') || q.includes('study') || q.includes('college')) {
    matchedCategory = 'Education'
  } else if (q.includes('health') || q.includes('medical') || q.includes('hospital') || q.includes('ayushman') || q.includes('doctor')) {
    matchedCategory = 'Healthcare'
  } else if (q.includes('agri') || q.includes('farmer') || q.includes('kisan') || q.includes('crop')) {
    matchedCategory = 'Agriculture'
  } else if (q.includes('loan') || q.includes('business') || q.includes('startup') || q.includes('mudra') || q.includes('self-employed')) {
    matchedCategory = 'Employment'
  } else if (q.includes('housing') || q.includes('awas') || q.includes('ghar') || q.includes('home')) {
    matchedCategory = 'Housing'
  }

  if (matchedCategory) {
    const domainSchemes = ALL_SCHEMES.filter((s) => s.categoryName === matchedCategory)
    const cards = domainSchemes.slice(0, 4).map((s) => {
      const evalRes = evaluateSchemeRules(s, profile)
      return toChatSchemeCard(s, evalRes.verdict)
    })

    return {
      sessionId: sessionId || Date.now(),
      reply: `Here are the official gazetted schemes under **${matchedCategory}** evaluated against your profile:\n\n` +
        domainSchemes.slice(0, 3).map((s, idx) => `${idx + 1}. **${s.name}**: ${s.benefitSummary} (${s.benefitAmount || 'Direct Aid'})`).join('\n\n') +
        `\n\nClick on any card below to view full eligibility criteria, guidelines, and online application portal.`,
      schemes: cards,
      limitReached: false,
    }
  }

  // Case 5: Direct search by scheme name or keywords
  const matchedSchemes = ALL_SCHEMES.filter(
    (s) =>
      s.name.toLowerCase().includes(q) ||
      s.description.toLowerCase().includes(q) ||
      (s.ministry && s.ministry.toLowerCase().includes(q))
  )

  if (matchedSchemes.length > 0) {
    const top = matchedSchemes.slice(0, 4).map((s) => {
      const evalRes = evaluateSchemeRules(s, profile)
      return toChatSchemeCard(s, evalRes.verdict)
    })
    const s0 = matchedSchemes[0]
    return {
      sessionId: sessionId || Date.now(),
      reply: `Here is the verified information for **${s0.name}**:\n\n- **Ministry / Department**: ${s0.ministry}\n- **Benefit**: ${s0.benefitAmount || s0.benefitSummary}\n- **Application Portal**: [Official Website](${s0.applicationUrl || s0.officialPortal})\n- **Deadline**: ${s0.deadline || 'Ongoing Open Enrollment'}\n\nReview the scheme card below to check your eligibility status and apply directly.`,
      schemes: top,
      limitReached: false,
    }
  }

  // Case 6: Polite conversational fallback
  return {
    sessionId: sessionId || Date.now(),
    reply: `Namaste! I am **Saarthi AI Assistant**, your grounded civic welfare guide for Government of India and Maharashtra gazetted schemes.\n\nYou can ask me:\n- *"What schemes do I qualify for?"*\n- *"What is the application deadline for Rajarshi Shahu Maharaj Scheme?"*\n- *"What documents do I need for scholarships?"*\n- *"Tell me about healthcare or student schemes"*\n\nHow can I help you today?`,
    schemes: strongMatches.slice(0, 3).map((m) => toChatSchemeCard(m.scheme, 'STRONG')),
    limitReached: false,
  }
}
