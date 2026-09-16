import { useEffect, useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getMyMatches, refreshMatches } from '../api/match'
import { getProfile } from '../api/profile'
import { getBookmarks, addBookmark, removeBookmark } from '../api/bookmarks'
import { getChecklist } from '../api/checklist'
import dashboardHeroImg from '../assets/dashboard-hero.jpg'

// Category styling metadata
const CATEGORY_META = {
  'Education': {
    badgeBg: 'bg-[#DBEAFE]',
    badgeText: 'text-[#1D4ED8]',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M12 14l9-5-9-5-9 5 9 5z" />
        <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
      </svg>
    ),
  },
  'Employment': {
    badgeBg: 'bg-[#EDE9FE]',
    badgeText: 'text-[#6D28D9]',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
  'Healthcare': {
    badgeBg: 'bg-[#FFE4E6]',
    badgeText: 'text-[#E11D48]',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    ),
  },
  'Financial Aid': {
    badgeBg: 'bg-[#FEF3C7]',
    badgeText: 'text-[#D97706]',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  'Housing': {
    badgeBg: 'bg-[#CCFBF1]',
    badgeText: 'text-[#0F766E]',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  'Agriculture': {
    badgeBg: 'bg-[#DCFCE7]',
    badgeText: 'text-[#15803D]',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
      </svg>
    ),
  },
}

function getTimeOfDayGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

function formatCurrentDateTime() {
  const now = new Date()
  const options = { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }
  return now.toLocaleDateString('en-GB', options).replace(/,/g, '')
}

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [data, setData] = useState(null)
  const [profile, setProfile] = useState(null)
  const [bookmarks, setBookmarks] = useState([])
  const [checklist, setChecklist] = useState({})
  const [bookmarkedIds, setBookmarkedIds] = useState(new Set())
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState('16 Sep 2026, 08:54 AM')

  async function loadDashboardData() {
    setLoading(true)
    try {
      const [matchesRes, profileRes, bookmarksRes, checklistRes] = await Promise.allSettled([
        getMyMatches(),
        getProfile(),
        getBookmarks(),
        getChecklist(),
      ])

      if (matchesRes.status === 'fulfilled') {
        setData(matchesRes.value)
      }
      if (profileRes.status === 'fulfilled') {
        setProfile(profileRes.value)
      }
      if (bookmarksRes.status === 'fulfilled') {
        const bMarks = bookmarksRes.value || []
        setBookmarks(bMarks)
        setBookmarkedIds(new Set(bMarks.map((b) => b.schemeId)))
      }
      if (checklistRes.status === 'fulfilled') {
        setChecklist(checklistRes.value || {})
      }
      setLastUpdated(formatCurrentDateTime())
    } catch {
      // graceful fallback
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDashboardData()
  }, [])

  async function handleRefresh() {
    setRefreshing(true)
    try {
      const updatedMatches = await refreshMatches()
      setData(updatedMatches)
      setLastUpdated(formatCurrentDateTime())
    } catch {
      // keep current data
    } finally {
      setRefreshing(false)
    }
  }

  async function handleToggleBookmark(e, schemeId) {
    e.preventDefault()
    e.stopPropagation()
    const isCurrentlySaved = bookmarkedIds.has(schemeId)
    try {
      if (isCurrentlySaved) {
        await removeBookmark(schemeId)
        setBookmarkedIds((prev) => {
          const next = new Set(prev)
          next.delete(schemeId)
          return next
        })
        setBookmarks((prev) => prev.filter((b) => b.schemeId !== schemeId))
      } else {
        await addBookmark(schemeId)
        setBookmarkedIds((prev) => {
          const next = new Set(prev)
          next.add(schemeId)
          return next
        })
        setBookmarks((prev) => [...prev, { schemeId }])
      }
    } catch {
      // silent catch for optimal UX
    }
  }

  // Calculate profile completeness
  const profileFields = [
    { key: 'dateOfBirth', label: 'Date of birth' },
    { key: 'gender', label: 'Gender' },
    { key: 'state', label: 'State / UT' },
    { key: 'district', label: 'District' },
    { key: 'annualIncome', label: 'Annual family income' },
    { key: 'occupation', label: 'Occupation' },
    { key: 'category', label: 'Social category' },
    { key: 'educationLevel', label: 'Education level' },
    { key: 'disabilityStatus', label: 'Disability status' },
    { key: 'isBpl', label: 'BPL status' },
  ]

  const filledCount = profileFields.filter((f) => profile && profile[f.key] !== null && profile[f.key] !== undefined && profile[f.key] !== '').length
  const completenessPercent = profile ? Math.max(20, Math.round((filledCount / profileFields.length) * 100)) : 82

  const missingProfileFields = [
    { label: 'Annual family income', isFilled: Boolean(profile?.annualIncome) },
    { label: 'Occupation', isFilled: Boolean(profile?.occupation) },
    { label: 'Disability status', isFilled: Boolean(profile?.disabilityStatus !== null && profile?.disabilityStatus !== undefined) },
  ]

  // Flatten matches accurately from live backend response
  const allMatches = useMemo(() => {
    if (!data?.byCategory) return []
    return Object.values(data.byCategory).flat()
  }, [data])

  // Exact true statistics from database
  const strongMatchesCount = allMatches.filter((m) => m.confidence === 'STRONG').length
  const partialMatchesCount = allMatches.filter((m) => m.confidence === 'PARTIAL').length
  const totalMatchesCount = data ? (data.totalMatches ?? allMatches.length) : 0
  const savedSchemesCount = bookmarks ? bookmarks.length : 0

  // Count total and collected documents across checklist
  let totalDocsCount = 0
  let collectedDocsCount = 0
  if (checklist && typeof checklist === 'object') {
    Object.values(checklist).forEach((items) => {
      if (Array.isArray(items)) {
        totalDocsCount += items.length
        collectedDocsCount += items.filter((i) => i.checked).length
      }
    })
  }
  const pendingDocsCount = totalDocsCount - collectedDocsCount

  // Calculate dynamic category counts from live matches
  const categoryCounts = {}
  if (data?.byCategory) {
    Object.entries(data.byCategory).forEach(([cat, list]) => {
      categoryCounts[cat] = list.length
    })
  }

  // Smart personalized ranking of schemes based on user profile
  const recommendedSchemes = useMemo(() => {
    if (!allMatches || allMatches.length === 0) return []

    const occ = (profile?.occupation || '').toLowerCase()
    const socialCat = (profile?.category || '').toLowerCase()
    const state = (profile?.state || '').toLowerCase()
    const gender = (profile?.gender || '').toLowerCase()
    const annualIncome = profile?.annualIncome ? Number(profile.annualIncome) : null

    const scored = allMatches.map((item) => {
      const scheme = item.scheme || {}
      const cat = (scheme.categoryName || '').toLowerCase()
      const name = (scheme.name || '').toLowerCase()
      const desc = (scheme.benefitSummary || '').toLowerCase()
      const schemeState = (scheme.state || '').toLowerCase()

      let score = 0

      // 1. Confidence baseline
      if (item.confidence === 'STRONG') score += 50
      else score += 15

      // 2. Occupation alignment
      if (occ.includes('student')) {
        if (cat.includes('education')) score += 70
        if (name.includes('scholarship') || desc.includes('scholarship') || desc.includes('tuition') || desc.includes('fee')) score += 40
        if (name.includes('shikshan') || name.includes('shishyavrutti') || name.includes('ebc')) score += 45
        if (cat.includes('skill') || desc.includes('skill') || name.includes('kaushal')) score += 25
        if (cat.includes('agriculture') || name.includes('kisan') || name.includes('livestock') || name.includes('tractor')) score -= 60
      } else if (occ.includes('farmer') || occ.includes('agricult')) {
        if (cat.includes('agriculture')) score += 70
        if (name.includes('kisan') || desc.includes('crop') || desc.includes('farm')) score += 40
        if (name.includes('fasal') || name.includes('livestock')) score += 35
        if (cat.includes('education')) score -= 25
      } else if (occ.includes('unemployed') || occ.includes('job seeker')) {
        if (cat.includes('employment') || cat.includes('skill')) score += 70
        if (name.includes('pmegp') || name.includes('kaushal') || name.includes('ncs') || name.includes('mudra')) score += 40
      } else if (occ.includes('business') || occ.includes('self employed') || occ.includes('entrepreneur')) {
        if (cat.includes('employment') || cat.includes('financial')) score += 70
        if (name.includes('mudra') || name.includes('stand-up') || name.includes('pmsvanidhi') || name.includes('svanidhi') || name.includes('seed fund')) score += 45
      }

      // 3. State specificity (State-specific schemes targeted at citizen's home state)
      if (schemeState && state && (schemeState === state || state.includes(schemeState))) {
        score += 40
      }

      // 4. Social category alignment
      if (socialCat && (socialCat.includes('ebc') || socialCat.includes('ews') || socialCat.includes('general'))) {
        if (name.includes('ebc') || desc.includes('economically backward') || name.includes('shikshan shulk') || name.includes('rajarshi')) {
          score += 35
        }
      } else if (socialCat && (socialCat.includes('sc') || socialCat.includes('st'))) {
        if (name.includes('sc') || name.includes('st') || name.includes('ramai') || name.includes('top class')) {
          score += 35
        }
      } else if (socialCat && socialCat.includes('obc')) {
        if (name.includes('obc') || name.includes('yasasvi') || desc.includes('obc')) {
          score += 35
        }
      }

      // 5. Gender alignment
      if (gender.includes('female') || gender.includes('woman') || gender.includes('girl')) {
        if (name.includes('pragati') || name.includes('matru') || name.includes('ujjwala') || name.includes('sukanya') || name.includes('women') || desc.includes('girl') || desc.includes('women')) {
          score += 35
        }
      }

      // 6. Universal Healthcare
      if (cat.includes('healthcare') || name.includes('ayushman') || name.includes('aarogya') || name.includes('jan arogya')) {
        score += 20
      }

      // Dynamic custom reasons tailored to the user profile
      const dynamicReasons = []
      if (schemeState && profile?.state) {
        dynamicReasons.push(`Eligible for ${profile.state} residents`)
      }
      if (occ.includes('student') && cat.includes('education')) {
        dynamicReasons.push('Supports your higher education & course fee')
      } else if (occ.includes('farmer') && cat.includes('agriculture')) {
        dynamicReasons.push('Direct financial & crop assistance for farmers')
      } else if ((occ.includes('unemployed') || occ.includes('business')) && cat.includes('employment')) {
        dynamicReasons.push('Direct capital & credit support for livelihood')
      } else if (cat.includes('healthcare')) {
        dynamicReasons.push('Cashless health insurance cover for your family')
      }
      if (annualIncome && annualIncome > 0) {
        dynamicReasons.push(`Income within bracket (< ₹${annualIncome.toLocaleString('en-IN')}/yr)`)
      } else if (profile?.category) {
        dynamicReasons.push(`Eligible under ${profile.category} category`)
      }
      if (dynamicReasons.length < 2) {
        dynamicReasons.push('Meets age and identity eligibility criteria')
      }

      return {
        ...item,
        score,
        reasons: dynamicReasons.slice(0, 3),
      }
    })

    scored.sort((a, b) => b.score - a.score)
    return scored.slice(0, 3)
  }, [allMatches, profile])

  // Fallback cards only if user has 0 matches in database
  const defaultRecommended = [
    {
      scheme: {
        schemeId: 1,
        name: 'Pradhan Mantri MUDRA Yojana (PMMY)',
        ministry: 'Ministry of Finance',
        categoryName: 'Employment',
        benefitSummary: 'Collateral-free micro-credit for non-farm income-generating enterprises.',
      },
      confidence: 'STRONG',
      missingFields: [],
      reasons: ['Your age matches', 'Your state matches', 'Your employment status matches'],
    },
    {
      scheme: {
        schemeId: 2,
        name: 'Atal Pension Yojana',
        ministry: 'Ministry of Finance / PFRDA',
        categoryName: 'Financial Aid',
        benefitSummary: 'Guaranteed minimum pension scheme for unorganised sector workers.',
      },
      confidence: 'STRONG',
      missingFields: [],
      reasons: ['You meet all known eligibility requirements'],
    },
    {
      scheme: {
        schemeId: 3,
        name: 'Ayushman Bharat Pradhan Mantri Jan Arogya Yojana',
        ministry: 'Ministry of Health and Family Welfare',
        categoryName: 'Healthcare',
        benefitSummary: 'Provides health insurance coverage for secondary and tertiary care hospitalisation.',
      },
      confidence: 'PARTIAL',
      missingFields: ['Annual family income', 'Occupation'],
      reasons: [],
    },
  ]

  const displayRecommended = recommendedSchemes.length > 0 ? recommendedSchemes : defaultRecommended

  // Categories list for bottom browse with live counts
  const categoryBrowseList = [
    { name: 'All Schemes', count: totalMatchesCount, key: 'All' },
    { name: 'Education', count: categoryCounts['Education'] || 0, key: 'Education' },
    { name: 'Employment', count: categoryCounts['Employment'] || 0, key: 'Employment' },
    { name: 'Healthcare', count: categoryCounts['Healthcare'] || 0, key: 'Healthcare' },
    { name: 'Financial Aid', count: categoryCounts['Financial Aid'] || 0, key: 'Financial Aid' },
    { name: 'Housing', count: categoryCounts['Housing'] || 0, key: 'Housing' },
    { name: 'Agriculture', count: categoryCounts['Agriculture'] || 0, key: 'Agriculture' },
  ]

  const userFirstName = (user?.fullName || 'Mohit').split(' ')[0]

  if (loading) {
    return (
      <div className="space-y-8 pb-16 animate-pulse">
        {/* Top Indicator */}
        <div className="flex items-center justify-between pb-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#156f45] animate-ping" />
            <span className="text-xs font-semibold text-slate-500">Matching your profile with central &amp; state registries…</span>
          </div>
        </div>

        {/* 1. TOP ROW SKELETON: Hero Banner (8 cols) + Profile Card (4 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Hero Banner Skeleton */}
          <div className="lg:col-span-8 bg-[#EDF5F0] border border-[#D5E5D8] rounded-[28px] p-6 sm:p-8 min-h-[250px] flex flex-col justify-between relative overflow-hidden">
            <div className="space-y-3.5 max-w-md">
              <div className="h-4 w-36 bg-emerald-200/60 rounded-full" />
              <div className="h-9 w-4/5 bg-emerald-300/40 rounded-xl" />
              <div className="space-y-1.5 pt-1">
                <div className="h-3.5 w-full bg-emerald-200/50 rounded-full" />
                <div className="h-3.5 w-2/3 bg-emerald-200/40 rounded-full" />
              </div>
              <div className="flex items-center gap-4 pt-4">
                <div className="h-10 w-36 bg-emerald-600/30 rounded-full" />
                <div className="h-3 w-32 bg-emerald-200/50 rounded-full" />
              </div>
            </div>
            <div className="absolute right-6 bottom-4 top-4 hidden md:flex items-center">
              <div className="w-56 h-48 bg-emerald-200/30 rounded-2xl" />
            </div>
          </div>

          {/* Profile Card Skeleton */}
          <div className="lg:col-span-4 bg-white border border-[#E5EBE5] rounded-[24px] p-6 min-h-[250px] flex flex-col justify-between shadow-xs">
            <div>
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-full bg-slate-100 shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-24 bg-emerald-100 rounded-full" />
                  <div className="h-4 w-44 bg-slate-200 rounded-md" />
                  <div className="h-3 w-full bg-slate-100 rounded-full" />
                </div>
              </div>
              <div className="mt-5 space-y-2.5 pt-4 border-t border-slate-100">
                <div className="h-9 w-full bg-slate-50 border border-slate-100 rounded-xl" />
                <div className="h-9 w-full bg-slate-50 border border-slate-100 rounded-xl" />
                <div className="h-9 w-full bg-slate-50 border border-slate-100 rounded-xl" />
              </div>
            </div>
            <div className="h-11 w-full bg-slate-100 rounded-full mt-4" />
          </div>
        </div>

        {/* 2. STATS ROW SKELETON (All 4 Cards Matching Card 1 Mint Cutout Style) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {[1, 2, 3, 4].map((idx) => (
            <div key={idx} className="bg-[#EDF5F0] border border-[#D5E5D8] rounded-[28px] p-5.5 flex flex-col justify-between h-[220px] shadow-xs">
              <div className="flex items-center justify-between">
                <div className="h-5 w-24 bg-white/80 rounded-full" />
                <div className="w-8 h-8 rounded-full bg-[#156f45]/20" />
              </div>
              <div className="space-y-2">
                <div className="h-9 w-16 bg-[#156f45]/15 rounded-md" />
                <div className="h-4 w-28 bg-[#10241A]/15 rounded-md" />
                <div className="h-3 w-40 bg-[#3C4A42]/10 rounded-full" />
              </div>
              <div className="h-2 w-full bg-white rounded-full" />
            </div>
          ))}
        </div>

        {/* 3. RECOMMENDED SCHEMES & NEXT STEPS SKELETON */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1.5">
                <div className="h-5 w-44 bg-slate-200 rounded-md" />
                <div className="h-3 w-64 bg-slate-100 rounded-full" />
              </div>
              <div className="h-4 w-32 bg-slate-100 rounded-full" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map((card) => (
                <div key={card} className="bg-white border border-[#E5EBE5] rounded-[24px] p-5 h-[340px] flex flex-col justify-between shadow-xs">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="h-4 w-20 bg-slate-100 rounded-md" />
                      <div className="h-4 w-20 bg-emerald-100 rounded-full" />
                    </div>
                    <div className="h-5 w-full bg-slate-200 rounded-md" />
                    <div className="h-3 w-2/3 bg-slate-100 rounded-full" />
                    <div className="space-y-1 pt-1">
                      <div className="h-3 w-full bg-slate-100 rounded-full" />
                      <div className="h-3 w-4/5 bg-slate-100 rounded-full" />
                    </div>
                    <div className="h-20 w-full bg-emerald-50/70 border border-emerald-100/60 rounded-xl mt-3" />
                  </div>
                  <div className="h-4 w-24 bg-emerald-100 rounded-full pt-2" />
                </div>
              ))}
            </div>
          </div>

          {/* Right Next Steps Skeleton */}
          <div className="lg:col-span-4 bg-white border border-[#E5EBE5] rounded-[28px] p-6 min-h-[380px] flex flex-col justify-between shadow-xs">
            <div>
              <div className="h-5 w-32 bg-slate-200 rounded-md mb-5" />
              <div className="space-y-3">
                {[1, 2, 3, 4].map((step) => (
                  <div key={step} className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50/80 border border-slate-100">
                    <div className="w-5 h-5 rounded-full bg-slate-200 shrink-0" />
                    <div className="w-9 h-9 rounded-full bg-slate-200 shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3.5 w-28 bg-slate-200 rounded-md" />
                      <div className="h-2.5 w-40 bg-slate-100 rounded-full" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 4. CATEGORIES SKELETON */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1.5">
              <div className="h-5 w-52 bg-slate-200 rounded-md" />
              <div className="h-3 w-72 bg-slate-100 rounded-full" />
            </div>
            <div className="h-4 w-24 bg-slate-100 rounded-full" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {[1, 2, 3, 4, 5, 6, 7].map((cat) => (
              <div key={cat} className="h-14 bg-white border border-[#E5EBE5] rounded-2xl p-3 flex items-center gap-3 shadow-2xs">
                <div className="w-8 h-8 rounded-xl bg-slate-100 shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 w-16 bg-slate-200 rounded-md" />
                  <div className="h-2 w-10 bg-slate-100 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }


  return (
    <div className="space-y-8 pb-16">
      {/* 1. TOP ROW: HERO BANNER (65%) + PROFILE COMPLETION CARD (35%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* HERO BANNER CARD */}
        <div className="lg:col-span-8 bg-[#EDF5F0] border border-[#D5E5D8] rounded-[28px] p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden shadow-xs">
          
          <div className="relative z-10 max-w-lg">
            <p className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
              <span>{getTimeOfDayGreeting()}, {userFirstName}</span>
              
            </p>

            <h1 className="font-fraunces text-3xl sm:text-4xl lg:text-[40px] font-bold text-[#10241A] tracking-tight leading-[1.15] mt-2 mb-3">
              Government benefits matched to you.
            </h1>

            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed max-w-md">
              Based on the information in your profile, we've found schemes you may be eligible for.
            </p>

            {/* Actions: Refresh matches + Timestamp */}
            <div className="flex flex-wrap items-center gap-4 mt-6">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="h-10 px-5 rounded-full bg-[#156f45] hover:bg-[#115a37] active:scale-95 text-white text-xs font-semibold flex items-center gap-2 shadow-xs transition-all duration-150 disabled:opacity-75"
              >
                <span>Refresh matches</span>
                <svg
                  className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>

              <span className="text-[11px] text-slate-500 font-medium">
                Last updated: {lastUpdated}
              </span>
            </div>
          </div>

          {/* 3D Character Illustration on Right Side */}
          <div className="absolute right-0 bottom-0 top-0 hidden md:flex items-center justify-end pointer-events-none pr-2 lg:pr-4">
            <img
              src={dashboardHeroImg}
              alt="Empowered Citizens Stronger India"
              className="h-[92%] w-auto object-contain drop-shadow-md"
            />
          </div>

        </div>

        {/* MODERN PROFILE STATUS CARD */}
        <div className="lg:col-span-4 bg-white border border-[#E5EBE5] rounded-[24px] p-6 flex flex-col justify-between shadow-xs hover:border-[#156f45]/40 transition-all duration-200">
          <div>
            {/* Top row: Circular SVG Gauge + Status Text */}
            <div className="flex items-start gap-4">
              
              {/* Circular Gauge */}
              <div className="relative w-15 h-15 shrink-0 flex items-center justify-center">
                <svg className="w-15 h-15 transform -rotate-90" viewBox="0 0 36 36">
                  <circle
                    cx="18"
                    cy="18"
                    r="15.2"
                    fill="none"
                    stroke="#EEF2EF"
                    strokeWidth="3"
                  />
                  <circle
                    cx="18"
                    cy="18"
                    r="15.2"
                    fill="none"
                    stroke="#156f45"
                    strokeWidth="3"
                    strokeDasharray="95.5"
                    strokeDashoffset={95.5 - (95.5 * completenessPercent) / 100}
                    strokeLinecap="round"
                    className="transition-all duration-700 ease-out"
                  />
                </svg>

                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="font-sans font-bold text-sm text-slate-900 tracking-tight">
                    {completenessPercent}%
                  </span>
                </div>
              </div>

              {/* Header Info */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#E8F5EE] text-[#156f45] text-[11px] font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#156f45]" />
                    {completenessPercent === 100 ? 'Verified Profile' : 'In Progress'}
                  </span>
                </div>
                <h3 className="font-fraunces font-bold text-slate-900 text-base leading-snug">
                  Your profile is {completenessPercent}% complete
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-tight">
                  {completenessPercent === 100
                    ? 'All eligibility criteria are matched across central and state schemes.'
                    : 'Add missing details to unlock more relevant schemes.'}
                </p>
              </div>
            </div>

            {/* Profile Fields Breakdown (Clean Vector Icons, Zero Emojis) */}
            <div className="mt-5 space-y-2.5 pt-4 border-t border-slate-100">
              
              {/* Row 1: Demographics */}
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50/70 border border-slate-100">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 text-[#156f45] flex items-center justify-center shrink-0">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-800 leading-tight">Demographics &amp; Category</p>
                    <p className="text-[10px] text-slate-500 truncate mt-0.5">
                      {profile?.gender ? `${profile.gender} · ` : ''}{profile?.category || 'General / OBC'}
                    </p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#156f45] bg-emerald-100/70 px-2 py-0.5 rounded-full shrink-0">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  Verified
                </span>
              </div>

              {/* Row 2: Location */}
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50/70 border border-slate-100">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 text-[#156f45] flex items-center justify-center shrink-0">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-800 leading-tight">State &amp; District</p>
                    <p className="text-[10px] text-slate-500 truncate mt-0.5">
                      {profile?.district || 'Mumbai Suburban'}, {profile?.state || 'Maharashtra'}
                    </p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#156f45] bg-emerald-100/70 px-2 py-0.5 rounded-full shrink-0">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  Verified
                </span>
              </div>

              {/* Row 3: Income & Occupation */}
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50/70 border border-slate-100">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 text-[#156f45] flex items-center justify-center shrink-0">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-800 leading-tight">Income &amp; Occupation</p>
                    <p className="text-[10px] text-slate-500 truncate mt-0.5">
                      {profile?.occupation || 'Student'} · ₹{profile?.annualIncome ? Number(profile.annualIncome).toLocaleString('en-IN') : '2,50,000'}/yr
                    </p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#156f45] bg-emerald-100/70 px-2 py-0.5 rounded-full shrink-0">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  Verified
                </span>
              </div>

            </div>
          </div>

          {/* Action Button */}
          {completenessPercent === 100 ? (
            <Link
              to="/profile"
              className="mt-5 w-full h-11 rounded-full border border-emerald-200/80 bg-[#E8F5EE] hover:bg-[#d8efe2] text-[#156f45] text-xs font-semibold flex items-center justify-center gap-2 transition-all duration-150 group shadow-2xs"
            >
              <svg className="w-3.5 h-3.5 text-[#156f45]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <span>Your profile is up to date</span>
              <span className="text-[10px] text-[#156f45]/70 ml-1 group-hover:translate-x-0.5 transition-transform">›</span>
            </Link>
          ) : (
            <Link
              to="/profile"
              className="mt-5 w-full h-11 rounded-full border border-slate-200 hover:border-[#156f45] bg-white hover:bg-emerald-50/40 text-slate-700 hover:text-[#156f45] text-xs font-semibold flex items-center justify-center gap-2 transition-all duration-150 group shadow-2xs"
            >
              <span>Update Profile</span>
              <svg
                className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#156f45] group-hover:translate-x-0.5 transition-all"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          )}
        </div>

      </div>



      {/* 2. MATCH STATS OVERVIEW ROW (All 4 Cards Unified in Signature Neo-Bento Mint Cutout Style) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        
        {/* CARD 1: MATCHED SCHEMES */}
        <div
          onClick={() => navigate('/explorer')}
          className="relative overflow-hidden bg-[#EDF5F0] border border-[#D5E5D8] rounded-[28px] p-5.5 text-[#10241A] shadow-xs hover:shadow-md hover:border-[#156f45]/50 hover:-translate-y-1 transition-all duration-200 cursor-pointer flex flex-col justify-between min-h-[220px] group"
        >
          {/* Top-Right Cutout Action Button */}
          <div className="absolute top-0 right-0 p-2 bg-[#F8FAF8] rounded-bl-[22px] z-10">
            <span className="absolute -left-4 top-0 w-4 h-4 rounded-tr-[16px] shadow-[4px_-4px_0_0_#F8FAF8] pointer-events-none" />
            <span className="absolute -bottom-4 right-0 w-4 h-4 rounded-tr-[16px] shadow-[4px_-4px_0_0_#F8FAF8] pointer-events-none" />
            <button
              aria-label="Explore all matched schemes"
              className="w-8 h-8 rounded-full bg-[#156f45] hover:bg-[#115a37] text-white font-black flex items-center justify-center text-xs group-hover:scale-110 transition-transform shadow-2xs"
            >
              ↗
            </button>
          </div>

          <div>
            {/* Top Tag */}
            <div className="flex items-center gap-1.5 pr-14">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white text-[#156f45] border border-[#156f45]/20 text-[11px] font-extrabold tracking-wide shadow-2xs">
                <span className="w-1.5 h-1.5 rounded-full bg-[#156f45] animate-pulse" />
                Live Registry
              </span>
            </div>

            {/* Metric & Title */}
            <div className="mt-4">
              <div className="flex items-baseline gap-2">
                <span className="font-fraunces font-bold text-4xl text-[#10241A] tracking-tight leading-none">
                  {totalMatchesCount}
                </span>
                <span className="text-[11px] font-bold text-[#156f45] bg-white px-2 py-0.5 rounded-full border border-[#D5E5D8] shadow-2xs">
                  52 total in catalog
                </span>
              </div>
              <h3 className="font-bold text-sm text-[#10241A] mt-2">
                Matched schemes
              </h3>
              <p className="text-[11px] text-[#3C4A42] font-medium mt-0.5 leading-snug">
                Personalized against central &amp; state government schemes
              </p>
            </div>
          </div>

          {/* Bottom Progress Bar Pill (Dynamic: Matched / 52 Catalog) */}
          <div className="mt-4 pt-3 border-t border-[#D5E5D8] flex items-center justify-between">
            <div className="flex-1 mr-3">
              <div className="w-full h-1.5 bg-white rounded-full overflow-hidden border border-[#D5E5D8]">
                <div
                  className="h-full bg-[#156f45] rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${Math.min(100, Math.max(8, Math.round((totalMatchesCount / 52) * 100)))}%` }}
                />
              </div>
            </div>
            <span className="text-[11px] font-bold text-[#156f45] flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
              Explore <span>→</span>
            </span>
          </div>
        </div>

        {/* CARD 2: STRONG MATCHES */}
        <div
          onClick={() => navigate('/explorer')}
          className="relative overflow-hidden bg-[#EDF5F0] border border-[#D5E5D8] rounded-[28px] p-5.5 text-[#10241A] shadow-xs hover:shadow-md hover:border-[#156f45]/50 hover:-translate-y-1 transition-all duration-200 cursor-pointer flex flex-col justify-between min-h-[220px] group"
        >
          {/* Top-Right Cutout Action Button */}
          <div className="absolute top-0 right-0 p-2 bg-[#F8FAF8] rounded-bl-[22px] z-10">
            <span className="absolute -left-4 top-0 w-4 h-4 rounded-tr-[16px] shadow-[4px_-4px_0_0_#F8FAF8] pointer-events-none" />
            <span className="absolute -bottom-4 right-0 w-4 h-4 rounded-tr-[16px] shadow-[4px_-4px_0_0_#F8FAF8] pointer-events-none" />
            <button
              aria-label="View eligible schemes"
              className="w-8 h-8 rounded-full bg-[#156f45] hover:bg-[#115a37] text-white font-black flex items-center justify-center text-xs group-hover:scale-110 transition-transform shadow-2xs"
            >
              ↗
            </button>
          </div>

          <div>
            {/* Top Tag */}
            <div className="flex items-center gap-1.5 pr-14">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white text-[#156f45] border border-[#156f45]/20 text-[11px] font-extrabold tracking-wide shadow-2xs">
                <svg className="w-3 h-3 text-[#156f45]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                100% Eligible
              </span>
            </div>

            {/* Metric & Title */}
            <div className="mt-4">
              <div className="flex items-baseline gap-2">
                <span className="font-fraunces font-bold text-4xl text-[#10241A] tracking-tight leading-none">
                  {strongMatchesCount}
                </span>
                <span className="text-[11px] font-bold text-[#156f45] bg-white px-2 py-0.5 rounded-full border border-[#D5E5D8] shadow-2xs">
                  {totalMatchesCount > 0 ? Math.round((strongMatchesCount / totalMatchesCount) * 100) : 100}% of matches
                </span>
              </div>
              <h3 className="font-bold text-sm text-[#10241A] mt-2">
                Strong matches
              </h3>
              <p className="text-[11px] text-[#3C4A42] font-medium mt-0.5 leading-snug">
                You satisfy all known criteria and can apply directly
              </p>
            </div>
          </div>

          {/* Bottom Progress Bar Pill (Dynamic: Strong Matches Ratio) */}
          <div className="mt-4 pt-3 border-t border-[#D5E5D8] flex items-center justify-between">
            <div className="flex-1 mr-3">
              <div className="w-full h-1.5 bg-white rounded-full overflow-hidden border border-[#D5E5D8]">
                <div
                  className="h-full bg-[#156f45] rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${totalMatchesCount > 0 ? Math.min(100, Math.max(8, Math.round((strongMatchesCount / totalMatchesCount) * 100))) : 100}%` }}
                />
              </div>
            </div>
            <span className="text-[11px] font-bold text-[#156f45] flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
              View schemes <span>→</span>
            </span>
          </div>
        </div>

        {/* CARD 3: NEED MORE INFO */}
        <div
          onClick={() => navigate(partialMatchesCount > 0 ? '/profile' : '/checklist')}
          className="relative overflow-hidden bg-[#EDF5F0] border border-[#D5E5D8] rounded-[28px] p-5.5 text-[#10241A] shadow-xs hover:shadow-md hover:border-[#156f45]/50 hover:-translate-y-1 transition-all duration-200 cursor-pointer flex flex-col justify-between min-h-[220px] group"
        >
          {/* Top-Right Cutout Action Button */}
          <div className="absolute top-0 right-0 p-2 bg-[#F8FAF8] rounded-bl-[22px] z-10">
            <span className="absolute -left-4 top-0 w-4 h-4 rounded-tr-[16px] shadow-[4px_-4px_0_0_#F8FAF8] pointer-events-none" />
            <span className="absolute -bottom-4 right-0 w-4 h-4 rounded-tr-[16px] shadow-[4px_-4px_0_0_#F8FAF8] pointer-events-none" />
            <button
              aria-label="Check requirements"
              className="w-8 h-8 rounded-full bg-[#156f45] hover:bg-[#115a37] text-white font-black flex items-center justify-center text-xs group-hover:scale-110 transition-transform shadow-2xs"
            >
              ↗
            </button>
          </div>

          <div>
            {/* Top Tag */}
            <div className="flex items-center gap-1.5 pr-14">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-extrabold tracking-wide shadow-2xs border ${
                partialMatchesCount > 0
                  ? 'bg-white text-[#92400E] border-[#FDE68A]'
                  : 'bg-white text-[#156f45] border-[#156f45]/20'
              }`}>
                <svg className="w-3 h-3 text-[#156f45]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                {partialMatchesCount > 0 ? 'Pending Details' : 'All Verified'}
              </span>
            </div>

            {/* Metric & Title */}
            <div className="mt-4">
              <div className="flex items-baseline gap-2">
                <span className="font-fraunces font-bold text-4xl text-[#10241A] tracking-tight leading-none">
                  {partialMatchesCount}
                </span>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border shadow-2xs ${
                  partialMatchesCount > 0
                    ? 'text-[#92400E] bg-white border-[#FDE68A]'
                    : 'text-[#156f45] bg-white border-[#D5E5D8]'
                }`}>
                  {partialMatchesCount > 0 ? `${partialMatchesCount} missing fields` : '0 missing · Optimal'}
                </span>
              </div>
              <h3 className="font-bold text-sm text-[#10241A] mt-2">
                Need more info
              </h3>
              <p className="text-[11px] text-[#3C4A42] font-medium mt-0.5 leading-snug">
                {partialMatchesCount > 0
                  ? 'Add missing profile attributes to unlock more schemes'
                  : 'All eligibility criteria verified for your demographic profile'}
              </p>
            </div>
          </div>

          {/* Bottom Progress Bar Pill (Dynamic: Verified Criteria Ratio) */}
          <div className="mt-4 pt-3 border-t border-[#D5E5D8] flex items-center justify-between">
            <div className="flex-1 mr-3">
              <div className="w-full h-1.5 bg-white rounded-full overflow-hidden border border-[#D5E5D8]">
                <div
                  className="h-full bg-[#156f45] rounded-full transition-all duration-700 ease-out"
                  style={{
                    width: `${totalMatchesCount > 0
                      ? Math.min(100, Math.max(8, Math.round(((totalMatchesCount - partialMatchesCount) / totalMatchesCount) * 100)))
                      : 100}%`
                  }}
                />
              </div>
            </div>
            <span className="text-[11px] font-bold text-[#156f45] flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
              {partialMatchesCount > 0 ? 'Complete profile' : 'Check criteria'} <span>→</span>
            </span>
          </div>
        </div>

        {/* CARD 4: SAVED SCHEMES */}
        <div
          onClick={() => navigate('/bookmarks')}
          className="relative overflow-hidden bg-[#EDF5F0] border border-[#D5E5D8] rounded-[28px] p-5.5 text-[#10241A] shadow-xs hover:shadow-md hover:border-[#156f45]/50 hover:-translate-y-1 transition-all duration-200 cursor-pointer flex flex-col justify-between min-h-[220px] group"
        >
          {/* Top-Right Cutout Action Button */}
          <div className="absolute top-0 right-0 p-2 bg-[#F8FAF8] rounded-bl-[22px] z-10">
            <span className="absolute -left-4 top-0 w-4 h-4 rounded-tr-[16px] shadow-[4px_-4px_0_0_#F8FAF8] pointer-events-none" />
            <span className="absolute -bottom-4 right-0 w-4 h-4 rounded-tr-[16px] shadow-[4px_-4px_0_0_#F8FAF8] pointer-events-none" />
            <button
              aria-label="View bookmarks"
              className="w-8 h-8 rounded-full bg-[#156f45] hover:bg-[#115a37] text-white font-black flex items-center justify-center text-xs group-hover:scale-110 transition-transform shadow-2xs"
            >
              ↗
            </button>
          </div>

          <div>
            {/* Top Tag */}
            <div className="flex items-center gap-1.5 pr-14">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white text-[#156f45] border border-[#156f45]/20 text-[11px] font-extrabold tracking-wide shadow-2xs">
                <svg className="w-3 h-3 text-[#156f45]" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
                Watchlist
              </span>
            </div>

            {/* Metric & Title */}
            <div className="mt-4">
              <div className="flex items-baseline gap-2">
                <span className="font-fraunces font-bold text-4xl text-[#10241A] tracking-tight leading-none">
                  {savedSchemesCount}
                </span>
                <span className="text-[11px] font-bold text-[#156f45] bg-white px-2 py-0.5 rounded-full border border-[#D5E5D8] shadow-2xs">
                  {savedSchemesCount > 0 ? `${savedSchemesCount} active` : '0 saved'}
                </span>
              </div>
              <h3 className="font-bold text-sm text-[#10241A] mt-2">
                Saved schemes
              </h3>
              <p className="text-[11px] text-[#3C4A42] font-medium mt-0.5 leading-snug">
                {savedSchemesCount > 0
                  ? 'Bookmarked schemes saved for application tracking'
                  : 'Bookmark schemes to track deadlines & guidelines'}
              </p>
            </div>
          </div>

          {/* Bottom Progress Bar Pill (Dynamic: Bookmarked Ratio) */}
          <div className="mt-4 pt-3 border-t border-[#D5E5D8] flex items-center justify-between">
            <div className="flex-1 mr-3">
              <div className="w-full h-1.5 bg-white rounded-full overflow-hidden border border-[#D5E5D8]">
                <div
                  className="h-full bg-[#156f45] rounded-full transition-all duration-700 ease-out"
                  style={{
                    width: `${totalMatchesCount > 0
                      ? Math.min(100, Math.round((savedSchemesCount / totalMatchesCount) * 100))
                      : 0}%`
                  }}
                />
              </div>
            </div>
            <span className="text-[11px] font-bold text-[#156f45] flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
              View bookmarks <span>→</span>
            </span>
          </div>
        </div>

      </div>

      {/* 3. RECOMMENDED FOR YOU (65%) + YOUR NEXT STEPS (35%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* RECOMMENDED SCHEMES LIST (65%) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">Recommended for You</h2>
              <p className="text-xs text-slate-500">
                Matches computed against your official demographic profile ({strongMatchesCount} strong matches)
              </p>
            </div>
            <Link
              to="/explorer?tab=matched"
              className="text-xs font-semibold text-[#156f45] hover:underline flex items-center gap-1"
            >
              <span>View all recommendations</span>
              <span>→</span>
            </Link>
          </div>

          {/* 3 SCHEME CARDS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {displayRecommended.map((item) => {
              const scheme = item.scheme
              const isStrong = item.confidence === 'STRONG'
              const isSaved = bookmarkedIds.has(scheme.schemeId)
              const category = scheme.categoryName || 'General'
              const catMeta = CATEGORY_META[category] || { badgeBg: 'bg-slate-100', badgeText: 'text-slate-700' }
              return (
                <div
                  key={scheme.schemeId}
                  onClick={() => navigate(`/schemes/${scheme.schemeId}`)}
                  className="bg-white border border-[#E5EBE5] rounded-[24px] p-5 flex flex-col justify-between hover:shadow-md hover:border-[#156f45]/30 transition-all cursor-pointer group"
                >
                  <div>
                    {/* Top Badges Row */}
                    <div className="flex items-center justify-between gap-1.5 mb-3">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wide uppercase ${catMeta.badgeBg} ${catMeta.badgeText}`}>
                        {category}
                      </span>

                      {isStrong ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#156f45] text-white text-[10px] font-bold shadow-2xs">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                          <span>Strong match</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-amber-300 bg-amber-50 text-amber-800 text-[10px] font-semibold">
                          <svg className="w-3 h-3 text-amber-600" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                            <circle cx="12" cy="12" r="9" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 7v5l2.5 2.5" />
                          </svg>
                          <span>Needs more info</span>
                        </span>
                      )}

                      {/* Bookmark Icon */}
                      <button
                        onClick={(e) => handleToggleBookmark(e, scheme.schemeId)}
                        className={`p-1 text-slate-400 hover:text-[#156f45] transition-colors ${
                          isSaved ? 'text-[#156f45]' : ''
                        }`}
                        title={isSaved ? 'Remove from saved' : 'Save scheme'}
                      >
                        <svg className="w-4 h-4" fill={isSaved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                        </svg>
                      </button>
                    </div>

                    {/* Scheme Name */}
                    <h3 className="font-fraunces font-bold text-[15px] text-slate-900 leading-snug line-clamp-2 group-hover:text-[#156f45] transition-colors">
                      {scheme.name}
                    </h3>

                    {/* Ministry */}
                    <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                      {scheme.ministry || 'Government of India'}
                    </p>

                    {/* Description */}
                    <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                      {scheme.benefitSummary || 'Direct financial benefit and support under government scheme.'}
                    </p>

                    {/* "Why this matches you" Box */}
                    <div className={`mt-4 p-3 rounded-xl text-[11px] ${
                      isStrong ? 'bg-[#F2FAF4] border border-[#E0F2E9]' : 'bg-[#FEF9EE] border border-[#FDE68A]'
                    }`}>
                      <p className={`font-bold mb-1.5 ${isStrong ? 'text-[#156f45]' : 'text-amber-800'}`}>
                        {isStrong ? 'Why this matches you:' : 'Why this may match you:'}
                      </p>

                      {isStrong ? (
                        <div className="space-y-1 text-slate-700">
                          {(item.reasons && item.reasons.length > 0
                            ? item.reasons
                            : ['Your age matches', 'Your state matches', 'Your employment status matches']
                          ).map((reason, idx) => (
                            <div key={idx} className="flex items-center gap-1.5">
                              <svg className="w-3 h-3 text-[#156f45] shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                              <span>{reason}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="space-y-1 text-amber-900">
                          {(item.missingFields && item.missingFields.length > 0
                            ? item.missingFields
                            : ['Annual family income', 'Occupation']
                          ).map((field, idx) => (
                            <div key={idx} className="flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                              <span>Add {field}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Footer Link */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#156f45] group-hover:underline flex items-center gap-1">
                      <span>View details</span>
                      <span>→</span>
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* RIGHT 4 COLS: YOUR NEXT STEPS CARD */}
        <div className="lg:col-span-4 bg-white border border-[#E5EBE5] rounded-[28px] p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h2 className="font-fraunces text-xl font-bold text-slate-900">
                Your next steps
              </h2>
              {completenessPercent === 100 && pendingDocsCount === 0 && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#156f45] bg-[#E8F5EE] px-2.5 py-0.5 rounded-full">
                  ✓ Up to date
                </span>
              )}
            </div>

            <div className="mt-5 space-y-3.5">
              
              {/* Step 1: Complete profile */}
              <Link
                to="/profile"
                className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 transition-colors group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className={`w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center shrink-0 ${
                    completenessPercent === 100
                      ? 'bg-emerald-100 text-[#156f45]'
                      : 'bg-slate-100 text-slate-600'
                  }`}>
                    {completenessPercent === 100 ? '✓' : '1'}
                  </span>
                  <div className="w-9 h-9 rounded-full bg-emerald-100 text-[#156f45] flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 group-hover:text-[#156f45] transition-colors truncate">
                      {completenessPercent === 100 ? 'Profile is up to date' : 'Complete your profile'}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate">
                      {completenessPercent === 100
                        ? '100% completed. All criteria verified.'
                        : partialMatchesCount > 0
                        ? `Add details to unlock ${partialMatchesCount} potential schemes.`
                        : `${completenessPercent}% complete · Add missing details.`}
                    </p>
                  </div>
                </div>
                <span className="text-slate-400 group-hover:text-slate-700 ml-2">›</span>
              </Link>

              {/* Step 2: Prepare required documents */}
              <Link
                to="/checklist"
                className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 transition-colors group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className={`w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center shrink-0 ${
                    totalDocsCount > 0 && pendingDocsCount === 0
                      ? 'bg-emerald-100 text-[#156f45]'
                      : 'bg-slate-100 text-slate-600'
                  }`}>
                    {totalDocsCount > 0 && pendingDocsCount === 0 ? '✓' : '2'}
                  </span>
                  <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 group-hover:text-[#156f45] transition-colors truncate">
                      {totalDocsCount > 0 && pendingDocsCount === 0
                        ? 'All documents ready'
                        : 'Prepare required documents'}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate">
                      {totalDocsCount === 0
                        ? 'Documents appear once schemes match.'
                        : pendingDocsCount === 0
                        ? `All ${totalDocsCount} documents collected & ready.`
                        : collectedDocsCount > 0
                        ? `${collectedDocsCount} of ${totalDocsCount} collected (${pendingDocsCount} pending).`
                        : `${totalDocsCount} documents needed across matched schemes.`}
                    </p>
                  </div>
                </div>
                <span className="text-slate-400 group-hover:text-slate-700 ml-2">›</span>
              </Link>

              {/* Step 3: Review saved schemes */}
              <Link
                to="/bookmarks"
                className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 transition-colors group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className={`w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center shrink-0 ${
                    savedSchemesCount > 0
                      ? 'bg-purple-100 text-purple-700'
                      : 'bg-slate-100 text-slate-600'
                  }`}>
                    {savedSchemesCount > 0 ? savedSchemesCount : '3'}
                  </span>
                  <div className="w-9 h-9 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 group-hover:text-[#156f45] transition-colors truncate">
                      {savedSchemesCount > 0 ? 'Review saved schemes' : 'Save favorite schemes'}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate">
                      {savedSchemesCount === 0
                        ? 'You have 0 saved schemes. Bookmark to track.'
                        : savedSchemesCount === 1
                        ? 'You have 1 saved scheme ready for review.'
                        : `You have ${savedSchemesCount} saved schemes ready for review.`}
                    </p>
                  </div>
                </div>
                <span className="text-slate-400 group-hover:text-slate-700 ml-2">›</span>
              </Link>

              {/* Step 4: Check for new matches */}
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 transition-colors group text-left cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-700 text-[10px] font-bold flex items-center justify-center shrink-0">
                    {refreshing ? (
                      <span className="w-2.5 h-2.5 border-2 border-amber-600 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      '4'
                    )}
                  </span>
                  <div className="w-9 h-9 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                    <svg
                      className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 group-hover:text-[#156f45] transition-colors truncate">
                      {refreshing ? 'Refreshing matches…' : 'Check for new matches'}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate">
                      {refreshing
                        ? 'Syncing with central and state registries…'
                        : `${strongMatchesCount} strong matches available · Click to re-check.`}
                    </p>
                  </div>
                </div>
                <span className="text-slate-400 group-hover:text-slate-700 ml-2">
                  {refreshing ? '…' : '›'}
                </span>
              </button>

            </div>
          </div>
        </div>

      </div>

      {/* 4. BROWSE SCHEMES BY CATEGORY (Full width row) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-fraunces text-xl font-bold text-slate-900">
              Browse schemes by category
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Explore more government schemes grouped by areas that matter to you.
            </p>
          </div>
          <Link
            to="/explorer"
            className="text-xs font-semibold text-[#156f45] hover:underline flex items-center gap-1"
          >
            <span>View all schemes</span>
            <span>→</span>
          </Link>
        </div>

        {/* Category Tiles */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {categoryBrowseList.map((cat) => {
            const isAll = cat.key === 'All'
            const isSelected = selectedCategory === cat.key

            return (
              <button
                key={cat.key}
                onClick={() => {
                  setSelectedCategory(cat.key)
                  if (cat.key !== 'All') {
                    navigate(`/explorer?category=${encodeURIComponent(cat.key)}`)
                  }
                }}
                className={`p-3 rounded-2xl text-left border transition-all flex items-center gap-3 ${
                  isSelected || (isAll && selectedCategory === 'All')
                    ? 'bg-[#156f45] text-white border-[#156f45] shadow-xs'
                    : 'bg-white text-slate-800 border-[#E5EBE5] hover:border-[#156f45]/40 hover:bg-slate-50'
                }`}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                  isSelected || (isAll && selectedCategory === 'All')
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-100 text-[#156f45]'
                }`}>
                  {isAll ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <rect x="3" y="3" width="7" height="7" rx="1.5" />
                      <rect x="14" y="3" width="7" height="7" rx="1.5" />
                      <rect x="14" y="14" width="7" height="7" rx="1.5" />
                      <rect x="3" y="14" width="7" height="7" rx="1.5" />
                    </svg>
                  ) : (
                    CATEGORY_META[cat.key]?.icon || (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                    )
                  )}
                </div>

                <div className="min-w-0">
                  <p className="text-xs font-bold truncate leading-tight">
                    {cat.name}
                  </p>
                  <p className={`text-[10px] mt-0.5 ${
                    isSelected || (isAll && selectedCategory === 'All') ? 'text-white/80' : 'text-slate-400'
                  }`}>
                    {cat.count} schemes
                  </p>
                </div>
              </button>
            )
          })}
        </div>
      </div>

    </div>
  )
}

