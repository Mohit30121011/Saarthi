import { useEffect, useState, useId } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getChecklist, toggleChecklistItem } from '../api/checklist'
import checklistHeroImg from '../assets/checklist-hero.jpg'

// Curated helpful subtitles for categories
const CATEGORY_META = {
  'ID Proof': {
    subtitle: 'Essential identity documents required for most schemes.',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
      </svg>
    ),
  },
  'Income Proof': {
    subtitle: 'Used to verify your annual or family income.',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  'Address Proof': {
    subtitle: 'Valid proof of permanent address or Maharashtra domicile.',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  'Bank Details': {
    subtitle: 'Aadhaar-seeded bank account for direct benefit transfer (DBT).',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
      </svg>
    ),
  },
  'Educational Certificate': {
    subtitle: 'Academic transcripts, marksheets, or college enrollment bonafide.',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
      </svg>
    ),
  },
  'Photograph': {
    subtitle: 'Recent passport-size colored photographs with clear background.',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  'Other': {
    subtitle: 'Caste, category, disability, or scheme-specific undertakings.',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
}

// Curated document descriptions
const DOC_DESCRIPTIONS = {
  'Aadhaar Card': 'Accepted for most government schemes',
  'PAN Card': 'Required for financial schemes and investments',
  'Voter ID Card': 'Any one of these photo identity documents is accepted',
  'Voter ID / Passport / Driving License': 'Any one of these photo identity documents is accepted',
  'Income Certificate': 'Issued by State Government / Tehsildar / Competent Authority',
  'Caste Certificate': 'Issued by Competent Authority / Sub-Divisional Officer (SDO)',
  'Caste/Category Certificate': 'Issued by Competent Authority / SDO / Tehsildar',
  'Non-Creamy Layer (NCL) Certificate': 'Valid for current financial year',
  'Domicile Certificate': 'Proof of residence in Maharashtra state',
  'Bank Account Passbook': 'Passbook showing IFSC, Account Number & NPCI Aadhaar seeding',
  'Bank Account Passbook (Aadhaar-linked)': 'Passbook showing IFSC, Account Number & NPCI Aadhaar seeding',
  'Bank Passbook (Aadhaar-seeded)': 'Passbook showing IFSC, Account Number & NPCI Aadhaar seeding',
  'Bank Statement': 'Recent 6 months account transaction statement',
  'Passport-size Photograph': 'Recent passport photo with light/white background',
  'Passport Size Photograph': 'Recent passport photo with light/white background',
  'Ration Card': 'Yellow / Orange / White ration card or NFSA food security card',
  'BPL Certificate / Ration Card': 'BPL survey card or priority household ration card',
  'Land Ownership Records (Khatauni/7-12 extract)': '7/12 extract or 8A khatauni land record',
  'Bonafide/Enrolment Certificate from Institution': 'Issued by current recognized college/school',
  'Previous Year Marksheet': 'Marksheet showing grades and passing status',
  'Educational Qualification Certificate': 'Highest degree or 10th/12th passing certificate',
  'Detailed Project Report': 'Project business summary for MSME / subsidy approval',
  'Business Proof/Project Report': 'Business plan or Udyam MSME registration',
  'Minority Community Certificate': 'Self-declaration or certificate issued by competent authority',
  'Birth Certificate of Girl Child': 'Issued by Municipal Corporation or Gram Panchayat',
  'Disability Certificate': 'Unique Disability ID (UDID) or civil surgeon certificate',
}

export default function Checklist() {
  const navigate = useNavigate()
  const [checklist, setChecklist] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeFilter, setActiveFilter] = useState('all') // 'all', 'not_collected', 'collected', 'mandatory', 'optional'
  const [sortBy, setSortBy] = useState('category') // 'category', 'name', 'status'
  const [collapsedCategories, setCollapsedCategories] = useState({})
  const [openMenuDoc, setOpenMenuDoc] = useState(null)
  const [uploadedFiles, setUploadedFiles] = useState({})
  const [selectedDocForSchemes, setSelectedDocForSchemes] = useState(null)
  const [showGuidanceModal, setShowGuidanceModal] = useState(false)
  const [showDigiLockerModal, setShowDigiLockerModal] = useState(false)

  function load() {
    setLoading(true)
    setError('')
    getChecklist()
      .then(setChecklist)
      .catch((err) => setError(err.response?.data?.error || 'Could not load your checklist.'))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  // Close 3-dots menu on outside click
  useEffect(() => {
    function handleClickOutside() {
      setOpenMenuDoc(null)
    }
    if (openMenuDoc) {
      window.addEventListener('click', handleClickOutside)
      return () => window.removeEventListener('click', handleClickOutside)
    }
  }, [openMenuDoc])

  async function handleToggle(documentName, currentlyChecked) {
    // optimistic update
    setChecklist((prev) => {
      if (!prev) return prev
      const next = { ...prev }
      for (const category of Object.keys(next)) {
        next[category] = next[category].map((item) =>
          item.documentName === documentName ? { ...item, checked: !currentlyChecked } : item
        )
      }
      return next
    })
    try {
      const updated = await toggleChecklistItem(documentName, !currentlyChecked)
      setChecklist(updated)
    } catch {
      load() // revert to server truth on failure
    }
  }

  function handleFileUpload(documentName, event) {
    const file = event.target.files?.[0]
    if (file) {
      setUploadedFiles((prev) => ({ ...prev, [documentName]: file.name }))
      // Also automatically mark as checked if not already checked
      handleToggle(documentName, false)
    }
  }

  function toggleCategoryCollapse(category) {
    setCollapsedCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }))
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[450px] text-center p-8">
        <div className="w-12 h-12 rounded-full border-3 border-[#156f45] border-t-transparent animate-spin mb-4" />
        <p className="font-fraunces text-xl font-semibold text-[#10241A]">Consolidating your documents…</p>
        <p className="text-sm text-[#8A9A90] mt-1">Cross-checking requirements across all your eligible schemes</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-xl mx-auto text-center py-20 px-4">
        <div className="w-14 h-14 rounded-2xl bg-[#FDF2F1] text-[#C0473B] flex items-center justify-center mx-auto mb-4 font-bold text-2xl">
          !
        </div>
        <h2 className="font-fraunces text-2xl font-bold text-[#10241A] mb-2">Checklist Unavailable</h2>
        <p className="text-sm text-[#8A9A90] mb-6">{error}</p>
        <button
          onClick={load}
          className="px-5 py-2.5 rounded-xl bg-[#156f45] text-white font-medium hover:bg-[#115e3b] transition-colors shadow-sm"
        >
          Try Again
        </button>
      </div>
    )
  }

  const rawCategories = Object.keys(checklist || {})
  const allItems = rawCategories.flatMap((c) => checklist[c] || [])

  const totalItems = allItems.length
  const checkedItems = allItems.filter((i) => i.checked).length
  const notCollectedItems = totalItems - checkedItems
  const mandatoryItems = allItems.filter((i) => i.mandatory).length
  const optionalItems = totalItems - mandatoryItems

  const percent = totalItems > 0 ? Math.round((checkedItems / totalItems) * 100) : 0

  // Filter and sort items per category
  const filteredChecklist = {}
  rawCategories.forEach((cat) => {
    let items = checklist[cat] || []

    // Apply filter
    if (activeFilter === 'not_collected') {
      items = items.filter((i) => !i.checked)
    } else if (activeFilter === 'collected') {
      items = items.filter((i) => i.checked)
    } else if (activeFilter === 'mandatory') {
      items = items.filter((i) => i.mandatory)
    } else if (activeFilter === 'optional') {
      items = items.filter((i) => !i.mandatory)
    }

    // Apply sort
    if (sortBy === 'name') {
      items = [...items].sort((a, b) => a.documentName.localeCompare(b.documentName))
    } else if (sortBy === 'status') {
      items = [...items].sort((a, b) => (a.checked === b.checked ? 0 : a.checked ? 1 : -1))
    }

    if (items.length > 0 || activeFilter === 'all') {
      filteredChecklist[cat] = items
    }
  })

  const visibleCategories = Object.keys(filteredChecklist)

  return (
    <div className="w-full max-w-[1400px] mx-auto pb-16">
      {/* 1. TOP HERO BANNER */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-[20px] bg-gradient-to-r from-[#EBF5EE] via-[#E2F2E7] to-[#D5EDE0] border border-[#D4E8DC] p-6 sm:p-8 mb-6 shadow-xs">
        {/* Left Side Copy */}
        <div className="relative z-10 max-w-xl">
          <Link
            to="/checklist"
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#156f45] hover:text-[#115e3b] transition-colors mb-2.5"
          >
            ← My Checklist
          </Link>

          <h1 className="font-fraunces text-3xl sm:text-[36px] font-bold text-[#10241A] tracking-tight leading-tight mb-2">
            Document Checklist
          </h1>

          <p className="text-sm sm:text-[15px] text-[#2D3E33] font-medium mb-1.5">
            Consolidated across your Strong-confidence matches —{' '}
            <span className="font-bold text-[#156f45]">
              {checkedItems} of {totalItems} collected
            </span>
          </p>

          <p className="text-xs sm:text-[13.5px] text-[#52796F] max-w-lg leading-relaxed">
            These are the documents you may need for the schemes you're eligible for. Upload or mark them as available to keep track of your progress.
          </p>
        </div>

        {/* Right Side 3D Character Artwork */}
        <div className="hidden md:block absolute top-0 right-0 h-full w-[440px] lg:w-[500px] pointer-events-none">
          <img
            src={checklistHeroImg}
            alt="Prepared Today, Brighter Tomorrow"
            className="w-full h-full object-cover object-center"
            style={{
              maskImage: 'linear-gradient(to right, transparent, black 25%)',
              WebkitMaskImage: 'linear-gradient(to right, transparent, black 25%)',
            }}
          />
        </div>
      </div>

      {/* 2. FILTER PILLS & SORTING BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all shrink-0 flex items-center gap-2 ${
              activeFilter === 'all'
                ? 'bg-[#10241A] text-white shadow-sm'
                : 'bg-white text-[#404941] border border-[#E7ECE3] hover:bg-[#F4F9F5]'
            }`}
          >
            <span>All Documents</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[11px] font-bold ${
                activeFilter === 'all' ? 'bg-white/20 text-white' : 'bg-[#EAF2EC] text-[#156f45]'
              }`}
            >
              {totalItems}
            </span>
          </button>

          <button
            onClick={() => setActiveFilter('not_collected')}
            className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all shrink-0 flex items-center gap-2 ${
              activeFilter === 'not_collected'
                ? 'bg-[#10241A] text-white shadow-sm'
                : 'bg-white text-[#404941] border border-[#E7ECE3] hover:bg-[#F4F9F5]'
            }`}
          >
            <span>Not Collected</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[11px] font-bold ${
                activeFilter === 'not_collected' ? 'bg-white/20 text-white' : 'bg-[#F2FAF4] text-[#52796F]'
              }`}
            >
              {notCollectedItems}
            </span>
          </button>

          <button
            onClick={() => setActiveFilter('collected')}
            className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all shrink-0 flex items-center gap-2 ${
              activeFilter === 'collected'
                ? 'bg-[#10241A] text-white shadow-sm'
                : 'bg-white text-[#404941] border border-[#E7ECE3] hover:bg-[#F4F9F5]'
            }`}
          >
            <span>Collected</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[11px] font-bold ${
                activeFilter === 'collected' ? 'bg-white/20 text-white' : 'bg-[#E8F8EC] text-[#156f45]'
              }`}
            >
              {checkedItems}
            </span>
          </button>

          <button
            onClick={() => setActiveFilter('mandatory')}
            className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all shrink-0 flex items-center gap-2 ${
              activeFilter === 'mandatory'
                ? 'bg-[#10241A] text-white shadow-sm'
                : 'bg-white text-[#404941] border border-[#E7ECE3] hover:bg-[#F4F9F5]'
            }`}
          >
            <span className="w-4 h-4 rounded-full bg-[#C0473B] text-white text-[10px] font-bold flex items-center justify-center">
              !
            </span>
            <span>Required</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[11px] font-bold ${
                activeFilter === 'mandatory' ? 'bg-white/20 text-white' : 'bg-[#FDF2F1] text-[#C0473B]'
              }`}
            >
              {mandatoryItems}
            </span>
          </button>

          <button
            onClick={() => setActiveFilter('optional')}
            className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all shrink-0 flex items-center gap-2 ${
              activeFilter === 'optional'
                ? 'bg-[#10241A] text-white shadow-sm'
                : 'bg-white text-[#404941] border border-[#E7ECE3] hover:bg-[#F4F9F5]'
            }`}
          >
            <span>Optional</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[11px] font-bold ${
                activeFilter === 'optional' ? 'bg-white/20 text-white' : 'bg-[#F4F8F5] text-[#52796F]'
              }`}
            >
              {optionalItems}
            </span>
          </button>
        </div>

        {/* Sort By Dropdown */}
        <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
          <span className="text-xs font-medium text-[#707A70]">Sort by</span>
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-xs font-semibold text-[#10241A] bg-white border border-[#E7ECE3] rounded-xl px-3 py-2 pr-8 appearance-none focus:outline-none focus:border-[#156f45] shadow-2xs cursor-pointer"
            >
              <option value="category">Category</option>
              <option value="name">Document Name</option>
              <option value="status">Status (Pending first)</option>
            </select>
            <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-[#707A70]">
              ▾
            </span>
          </div>
        </div>
      </div>

      {/* 3. TWO-COLUMN MAIN CONTENT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: CATEGORY ACCORDIONS (col-span-8) */}
        <div className="lg:col-span-8 space-y-4">
          {totalItems === 0 && (
            <div className="bg-white rounded-2xl border border-[#E7ECE3] p-12 text-center shadow-xs">
              <div className="w-16 h-16 rounded-2xl bg-[#EAF5ED] text-[#156f45] flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h2 className="font-fraunces text-2xl font-bold text-[#10241A] mb-2">No documents needed yet</h2>
              <p className="text-sm text-[#52796F] max-w-md mx-auto mb-6">
                Your checklist automatically populates from schemes that have a Strong Match with your demographic profile.
              </p>
              <Link
                to="/explorer?tab=matched"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#156f45] text-white font-semibold text-sm hover:bg-[#115e3b] transition-colors shadow-sm"
              >
                Explore Matched Schemes →
              </Link>
            </div>
          )}

          {visibleCategories.map((category) => {
            const items = filteredChecklist[category] || []
            const isCollapsed = collapsedCategories[category]
            const catTotal = (checklist[category] || []).length
            const catChecked = (checklist[category] || []).filter((i) => i.checked).length
            const meta = CATEGORY_META[category] || CATEGORY_META['Other']

            return (
              <div
                key={category}
                className="bg-white rounded-2xl border border-[#E2ECE5] shadow-xs overflow-hidden transition-all duration-200"
              >
                {/* Accordion Category Header */}
                <button
                  type="button"
                  onClick={() => toggleCategoryCollapse(category)}
                  className="w-full p-4 sm:p-5 flex items-center justify-between text-left bg-white hover:bg-[#FAFCFA] transition-colors cursor-pointer border-b border-transparent"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-[#EAF5ED] text-[#156f45] flex items-center justify-center shrink-0">
                      {meta.icon}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h2 className="text-base sm:text-[17px] font-bold text-[#10241A] truncate">{category}</h2>
                      </div>
                      <p className="text-xs text-[#52796F] truncate mt-0.5">{meta.subtitle}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 ml-3">
                    <span className="text-xs font-medium text-[#404941] bg-[#F4F9F5] border border-[#E0EBE2] px-3 py-1 rounded-full">
                      {catChecked} of {catTotal} collected
                    </span>
                    <span
                      className={`text-[#8A9A90] text-sm transform transition-transform duration-200 ${
                        isCollapsed ? '' : 'rotate-180'
                      }`}
                    >
                      ▼
                    </span>
                  </div>
                </button>

                {/* Document Items List */}
                {!isCollapsed && items.length > 0 && (
                  <div className="border-t border-[#F0F4F1] divide-y divide-[#F0F4F1]">
                    {items.map((item) => {
                      const isChecked = item.checked
                      const isUploaded = !!uploadedFiles[item.documentName]
                      const subtitle =
                        DOC_DESCRIPTIONS[item.documentName] ||
                        (item.documentCategory === 'Income Proof'
                          ? 'Used to verify your annual or family income eligibility'
                          : 'Accepted government-recognized verification document')

                      return (
                        <div
                          key={item.documentName}
                          className="p-4 sm:p-5 flex items-start justify-between gap-4 hover:bg-[#FAFCFA] transition-colors group"
                        >
                          {/* Checkbox & Details */}
                          <div className="flex items-start gap-3.5 min-w-0 flex-1">
                            {/* Checkbox */}
                            <button
                              type="button"
                              onClick={() => handleToggle(item.documentName, isChecked)}
                              aria-label={isChecked ? 'Mark as not collected' : 'Mark as collected'}
                              className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all shrink-0 mt-1 cursor-pointer ${
                                isChecked
                                  ? 'bg-[#156f45] border-[#156f45] text-white shadow-2xs'
                                  : 'border-[#BFC9BF] bg-white hover:border-[#156f45]'
                              }`}
                            >
                              {isChecked && (
                                <svg className="w-3.5 h-3.5 stroke-current stroke-[3]" fill="none" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </button>

                            {/* Info */}
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span
                                  className={`text-sm sm:text-[15px] font-semibold transition-all ${
                                    isChecked ? 'line-through text-[#8A9A90]' : 'text-[#10241A]'
                                  }`}
                                >
                                  {item.documentName}
                                </span>
                                {item.mandatory && (
                                  <span className="text-[#C0473B] font-bold text-sm leading-none" title="Mandatory document">
                                    *
                                  </span>
                                )}
                              </div>

                              <p className="text-xs text-[#52796F] mt-0.5">{subtitle}</p>

                              {/* Contributing schemes */}
                              {item.contributingSchemes && item.contributingSchemes.length > 0 && (
                                <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                                  {item.contributingSchemes.slice(0, 3).map((s) => (
                                    <span
                                      key={s.schemeId}
                                      className="inline-flex items-center text-[11px] font-medium px-2.5 py-0.5 rounded-md bg-[#F4F8F5] text-[#2C5E3B] border border-[#E2EBE4]"
                                    >
                                      {s.schemeName}
                                    </span>
                                  ))}
                                  {item.contributingSchemes.length > 3 && (
                                    <button
                                      type="button"
                                      onClick={() => setSelectedDocForSchemes(item)}
                                      className="inline-flex items-center text-[11px] font-semibold px-2 py-0.5 rounded-md bg-[#EDF5F0] text-[#156f45] border border-[#D4E8DC] hover:bg-[#E0F2E9] transition-colors cursor-pointer"
                                    >
                                      +{item.contributingSchemes.length - 3} more
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Right: Upload Button & 3 Dots Menu */}
                          <div className="flex items-center gap-2 shrink-0">
                            {/* Hidden file input */}
                            <input
                              type="file"
                              id={`upload-${item.documentName}`}
                              className="hidden"
                              onChange={(e) => handleFileUpload(item.documentName, e)}
                            />

                            {/* Upload Button */}
                            <label
                              htmlFor={`upload-${item.documentName}`}
                              className={`text-xs font-semibold px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs border ${
                                isUploaded || isChecked
                                  ? 'bg-[#E8F8EC] border-[#A5F4BD] text-[#00552E]'
                                  : 'bg-white border-[#D4E8DC] text-[#156f45] hover:bg-[#F2FAF4]'
                              }`}
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                              </svg>
                              <span>{isUploaded ? 'Uploaded' : 'Upload'}</span>
                            </label>

                            {/* 3 Dots Menu */}
                            <div className="relative">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setOpenMenuDoc(openMenuDoc === item.documentName ? null : item.documentName)
                                }}
                                className="w-8 h-8 rounded-lg flex items-center justify-center text-[#707A70] hover:text-[#10241A] hover:bg-[#F2FAF4] transition-colors cursor-pointer"
                                aria-label="More options"
                              >
                                ⋮
                              </button>

                              {openMenuDoc === item.documentName && (
                                <div
                                  onClick={(e) => e.stopPropagation()}
                                  className="absolute right-0 top-full mt-1 w-56 bg-white rounded-xl shadow-lg border border-[#E7ECE3] py-1.5 z-30 text-xs text-[#10241A]"
                                >
                                  <button
                                    onClick={() => {
                                      handleToggle(item.documentName, isChecked)
                                      setOpenMenuDoc(null)
                                    }}
                                    className="w-full text-left px-3.5 py-2 hover:bg-[#F4F9F5] flex items-center gap-2 font-medium"
                                  >
                                    <span>{isChecked ? '✕ Mark as Not Collected' : '✓ Mark as Collected'}</span>
                                  </button>
                                  {item.contributingSchemes && item.contributingSchemes.length > 0 && (
                                    <button
                                      onClick={() => {
                                        setSelectedDocForSchemes(item)
                                        setOpenMenuDoc(null)
                                      }}
                                      className="w-full text-left px-3.5 py-2 hover:bg-[#F4F9F5] flex items-center gap-2"
                                    >
                                      <span>🔍 View Applicable Schemes ({item.contributingSchemes.length})</span>
                                    </button>
                                  )}
                                  <button
                                    onClick={() => {
                                      setShowGuidanceModal(true)
                                      setOpenMenuDoc(null)
                                    }}
                                    className="w-full text-left px-3.5 py-2 hover:bg-[#F4F9F5] flex items-center gap-2"
                                  >
                                    <span>ℹ️ How to get this document</span>
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* RIGHT COLUMN: SIDEBAR CARDS (col-span-4) */}
        <div className="lg:col-span-4 space-y-5">
          {/* CARD 1: YOUR PROGRESS */}
          <div className="bg-white rounded-2xl border border-[#E2ECE5] p-5 sm:p-6 shadow-xs">
            <h2 className="text-base sm:text-[17px] font-bold text-[#10241A] mb-4">Your Progress</h2>

            <div className="flex items-center gap-4">
              {/* Circular Gauge */}
              <div className="relative w-20 h-20 shrink-0">
                <svg className="w-20 h-20 -rotate-90" viewBox="0 0 36 36">
                  {/* Track */}
                  <path
                    className="text-[#E7ECE3]"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  {/* Fill */}
                  <path
                    className="text-[#156f45] transition-all duration-700 ease-out"
                    strokeDasharray={`${percent}, 100`}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-[19px] font-bold text-[#10241A]">{percent}%</span>
                </div>
              </div>

              {/* Counts */}
              <div>
                <p className="text-base sm:text-[17px] font-bold text-[#10241A]">
                  {checkedItems} of {totalItems}
                </p>
                <p className="text-xs text-[#52796F]">documents collected</p>
              </div>
            </div>

            {/* Hint Box */}
            <div className="bg-[#F2FAF4] border border-[#E0F2E9] rounded-xl p-3 mt-4 text-xs text-[#2A5C3D] leading-relaxed">
              Complete your documents to apply faster and avoid last-minute delays.
            </div>
          </div>

          {/* CARD 2: QUICK ACTIONS */}
          <div className="bg-white rounded-2xl border border-[#E2ECE5] p-5 sm:p-6 shadow-xs">
            <h2 className="text-base sm:text-[17px] font-bold text-[#10241A] mb-3">Quick Actions</h2>

            <div className="divide-y divide-[#F0F4F1]">
              {/* Action 1: View applicable schemes */}
              <Link
                to="/explorer?tab=matched"
                className="flex items-center gap-3.5 py-3 group hover:opacity-90 transition-opacity"
              >
                <div className="w-10 h-10 rounded-xl bg-[#FEF6EE] text-[#D97706] flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#10241A] group-hover:text-[#156f45] transition-colors">
                    View applicable schemes
                  </p>
                  <p className="text-xs text-[#52796F]">See schemes that require these documents</p>
                </div>
                <span className="text-[#8A9A90] text-sm group-hover:translate-x-0.5 transition-transform">›</span>
              </Link>

              {/* Action 2: Download checklist (PDF) */}
              <button
                type="button"
                onClick={() => window.print()}
                className="w-full flex items-center gap-3.5 py-3 group hover:opacity-90 transition-opacity text-left cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#10241A] group-hover:text-[#156f45] transition-colors">
                    Download checklist (PDF)
                  </p>
                  <p className="text-xs text-[#52796F]">Get a Printable copy</p>
                </div>
                <span className="text-[#8A9A90] text-sm group-hover:translate-x-0.5 transition-transform">›</span>
              </button>

              {/* Action 3: Learn how to get documents */}
              <button
                type="button"
                onClick={() => setShowGuidanceModal(true)}
                className="w-full flex items-center gap-3.5 py-3 group hover:opacity-90 transition-opacity text-left cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-[#EEF2FF] text-[#4F46E5] flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#10241A] group-hover:text-[#156f45] transition-colors">
                    Learn how to get documents
                  </p>
                  <p className="text-xs text-[#52796F]">Step-by-step guidance</p>
                </div>
                <span className="text-[#8A9A90] text-sm group-hover:translate-x-0.5 transition-transform">›</span>
              </button>
            </div>
          </div>

          {/* CARD 3: TIP */}
          <div className="bg-[#FFFBEB] border border-[#FDE68A] rounded-2xl p-4 sm:p-5 shadow-xs">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-full bg-[#FEF3C7] text-[#D97706] flex items-center justify-center text-xs font-bold shrink-0">
                💡
              </div>
              <span className="text-sm font-bold text-[#92400E]">Tip</span>
            </div>
            <p className="text-xs text-[#78350F] leading-relaxed">
              Many schemes can be applied with a DigiLocker document. Keep your DigiLocker account updated for faster applications.
            </p>
            <button
              type="button"
              onClick={() => setShowDigiLockerModal(true)}
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#B45309] hover:underline mt-3 cursor-pointer"
            >
              Learn about DigiLocker →
            </button>
          </div>
        </div>
      </div>

      {/* MODAL 1: CONTRIBUTING SCHEMES */}
      {selectedDocForSchemes && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl border border-[#E7ECE3] max-w-lg w-full p-6 shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between gap-4 mb-4 pb-3 border-b border-[#E7ECE3]">
              <div>
                <h3 className="font-fraunces text-xl font-bold text-[#10241A]">{selectedDocForSchemes.documentName}</h3>
                <p className="text-xs text-[#52796F]">Required by the following eligible schemes</p>
              </div>
              <button
                onClick={() => setSelectedDocForSchemes(null)}
                className="w-8 h-8 rounded-full bg-[#F4F8F5] text-[#10241A] flex items-center justify-center hover:bg-[#EAF2EC] transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {selectedDocForSchemes.contributingSchemes.map((s) => (
                <div
                  key={s.schemeId}
                  className="flex items-center justify-between p-3 rounded-xl bg-[#F8FAF8] border border-[#E7ECE3] hover:border-[#A5F4BD] transition-colors"
                >
                  <span className="text-xs sm:text-sm font-semibold text-[#10241A]">{s.schemeName}</span>
                  <button
                    onClick={() => {
                      setSelectedDocForSchemes(null)
                      navigate(`/schemes/${s.schemeId}`)
                    }}
                    className="text-xs font-semibold text-[#156f45] hover:underline shrink-0 ml-2"
                  >
                    View Scheme →
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setSelectedDocForSchemes(null)}
                className="px-4 py-2 rounded-xl bg-[#156f45] text-white text-xs font-semibold hover:bg-[#115e3b] transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: STEP-BY-STEP GUIDANCE */}
      {showGuidanceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl border border-[#E7ECE3] max-w-xl w-full p-6 shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between gap-4 mb-4 pb-3 border-b border-[#E7ECE3]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#EEF2FF] text-[#4F46E5] flex items-center justify-center">
                  🛡️
                </div>
                <div>
                  <h3 className="font-fraunces text-xl font-bold text-[#10241A]">How to Get Essential Documents</h3>
                  <p className="text-xs text-[#52796F]">Official government application pathways</p>
                </div>
              </div>
              <button
                onClick={() => setShowGuidanceModal(false)}
                className="w-8 h-8 rounded-full bg-[#F4F8F5] text-[#10241A] flex items-center justify-center hover:bg-[#EAF2EC] transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3.5 max-h-96 overflow-y-auto pr-1 text-xs text-[#3C4A42] leading-relaxed">
              <div className="p-3 rounded-xl bg-[#F8FAF8] border border-[#E7ECE3]">
                <h4 className="font-bold text-[#10241A] text-sm mb-1">1. Aadhaar Card & Mobile/NPCI Seeding</h4>
                <p>
                  Visit your nearest Aadhaar Seva Kendra or Post Office with proof of identity. To link NPCI for DBT schemes, submit the 'Aadhaar-DBT Mandate' form to your bank branch.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-[#F8FAF8] border border-[#E7ECE3]">
                <h4 className="font-bold text-[#10241A] text-sm mb-1">2. Income & Domicile Certificates</h4>
                <p>
                  Apply online through your state's citizen service portal (e.g., <strong>Aaple Sarkar</strong> in Maharashtra) or visit the local Tehsildar office / CSC Kendra with ration card and electricity bill.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-[#F8FAF8] border border-[#E7ECE3]">
                <h4 className="font-bold text-[#10241A] text-sm mb-1">3. Caste & Non-Creamy Layer (NCL)</h4>
                <p>
                  Issued by the Sub-Divisional Officer (SDO) or Revenue Authority. NCL certificates are required for OBC applicants and are valid for the financial year.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-[#F8FAF8] border border-[#E7ECE3]">
                <h4 className="font-bold text-[#10241A] text-sm mb-1">4. College Bonafide & Fee Receipts</h4>
                <p>
                  Issued directly by the registrar or principal office of your registered college or university.
                </p>
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setShowGuidanceModal(false)}
                className="px-4 py-2 rounded-xl bg-[#156f45] text-white text-xs font-semibold hover:bg-[#115e3b] transition-colors"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: DIGILOCKER INFO */}
      {showDigiLockerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl border border-[#E7ECE3] max-w-md w-full p-6 shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between gap-4 mb-4 pb-3 border-b border-[#E7ECE3]">
              <div className="flex items-center gap-2">
                <span className="text-xl">📁</span>
                <h3 className="font-fraunces text-xl font-bold text-[#10241A]">DigiLocker Integration</h3>
              </div>
              <button
                onClick={() => setShowDigiLockerModal(false)}
                className="w-8 h-8 rounded-full bg-[#F4F8F5] text-[#10241A] flex items-center justify-center hover:bg-[#EAF2EC] transition-colors"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-[#3C4A42] leading-relaxed mb-4">
              DigiLocker is the Government of India's flagship cloud platform under Digital India. Documents issued via DigiLocker are treated at par with original physical documents as per Rule 9A of the Information Technology Rules.
            </p>

            <ul className="text-xs text-[#52796F] space-y-2 mb-6 list-disc pl-4">
              <li>Instantly fetch Aadhaar, Driving License, and PAN Card</li>
              <li>Pull 10th & 12th CBSE/State Board marksheets directly</li>
              <li>1-click digital verification on national and state scholarship portals</li>
            </ul>

            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setShowDigiLockerModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-[#707A70] hover:bg-[#F4F9F5] transition-colors"
              >
                Close
              </button>
              <a
                href="https://www.digilocker.gov.in"
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 rounded-xl bg-[#156f45] text-white text-xs font-semibold hover:bg-[#115e3b] transition-colors"
              >
                Visit DigiLocker.gov.in ↗
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
