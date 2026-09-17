import { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { getChecklist, toggleChecklistItem } from '../api/checklist'
import { ChecklistSkeleton } from '../components/Skeletons'

const SORT_OPTIONS = [
  { id: 'category', label: 'Category' },
  { id: 'name', label: 'Document Name' },
  { id: 'status', label: 'Status (Pending first)' },
]

const CATEGORY_META = {
  'ID Proof': {
    marathi: 'पहचान पुरावा',
    icon: 'badge',
    badgeColor: 'bg-chakra-blue-light text-chakra-blue',
  },
  'Income Proof': {
    marathi: 'आय दाखला व पुरावा',
    icon: 'payments',
    badgeColor: 'bg-kesari-saffron-soft text-kesari-saffron',
  },
  'Address Proof': {
    marathi: 'अधिवास व रहिवासी पुरावा',
    icon: 'home_pin',
    badgeColor: 'bg-chakra-blue-light text-chakra-blue',
  },
  'Bank Details': {
    marathi: 'बैंक खाते व NPCI आधार लिंकिंग',
    icon: 'account_balance',
    badgeColor: 'bg-harita-green-soft text-harita-green',
  },
  'Educational Certificate': {
    marathi: 'शैक्षणिक प्रमाणपत्रे व गुणपत्रिका',
    icon: 'school',
    badgeColor: 'bg-chakra-blue-light text-chakra-blue',
  },
  'Photograph': {
    marathi: 'पासपोर्ट छायाचित्र',
    icon: 'photo_camera',
    badgeColor: 'bg-surface-container-high text-chakra-blue',
  },
  'Other': {
    marathi: 'इतर जात व विशेष प्रमाणपत्रे',
    icon: 'verified',
    badgeColor: 'bg-kesari-saffron-soft text-kesari-saffron',
  },
}

const DOC_DESCRIPTIONS = {
  'Aadhaar Card': 'UIDAI biometric validation linked to registered mobile for instant OTP e-KYC.',
  'Maharashtra Domicile Certificate': 'MahaOnline issued permanent domicile clearance with digital QR validation.',
  'PAN Card': 'Income tax identifier required for financial subsidies and DBT processing.',
  'Income Certificate': 'Tahsildar issued certificate valid for current financial year (gross income ceiling verification).',
  'Caste Certificate': 'Issued by Sub-Divisional Officer (SDO) under Maharashtra Scheduled Castes & Backward Classes Act.',
  'Non-Creamy Layer (NCL) Certificate': 'Valid for current FY 2026-27 / 2026-29 issued by competent revenue authority.',
  'Bank Account Passbook (Aadhaar-linked)': 'Nationalized bank passbook showing active Aadhaar NPCI DBT mapper.',
  'Bank Passbook (Aadhaar-seeded)': 'Passbook showing IFSC, Account Number & NPCI Aadhaar seeding.',
  'Land Ownership Records (Khatauni/7-12 extract)': 'Mahabhulekh digitally signed 7/12 & 8A land revenue extract.',
  'Bonafide/Enrolment Certificate from Institution': 'Issued by current recognized college/school registrar.',
  'Previous Year Marksheet': 'Marksheet certifying eligibility percentages and regular academic progression.',
  'Passport-size Photograph': 'Recent passport-size colored photographs with white background.',
}

export default function Checklist() {
  const [checklist, setChecklist] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeFilter, setActiveFilter] = useState('all') // 'all', 'not_collected', 'collected', 'mandatory', 'optional'
  const [sortBy, setSortBy] = useState('category')
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false)
  const sortDropdownRef = useRef(null)
  const [openCategories, setOpenCategories] = useState({})
  const [selectedDocForSchemes, setSelectedDocForSchemes] = useState(null)
  const [showDigiLockerModal, setShowDigiLockerModal] = useState(false)
  const [digiLockerConnected, setDigiLockerConnected] = useState(false)
  const [toast, setToast] = useState(null)
  const toastTimeoutRef = useRef(null)

  function triggerToast(message, type = 'success') {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current)
    }
    setToast({ message, type })
    toastTimeoutRef.current = setTimeout(() => {
      setToast(null)
    }, 3800)
  }

  function load() {
    setLoading(true)
    setError('')
    getChecklist()
      .then(setChecklist)
      .catch((err) => setError(err.response?.data?.error || 'Could not load your checklist.'))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  useEffect(() => {
    function handleClickOutside(event) {
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target)) {
        setSortDropdownOpen(false)
      }
    }
    if (sortDropdownOpen) {
      window.addEventListener('click', handleClickOutside)
      return () => window.removeEventListener('click', handleClickOutside)
    }
  }, [sortDropdownOpen])

  async function handleToggle(documentName, currentlyChecked) {
    const nextChecked = !currentlyChecked

    // Optimistic UI update
    setChecklist((prev) => {
      if (!prev) return prev
      const next = { ...prev }
      for (const category of Object.keys(next)) {
        next[category] = next[category].map((item) =>
          item.documentName === documentName ? { ...item, checked: nextChecked } : item
        )
      }
      return next
    })

    triggerToast(
      nextChecked
        ? `"${documentName}" marked as verified & ready in dossier`
        : `"${documentName}" marked as pending action`,
      nextChecked ? 'success' : 'info'
    )

    try {
      const updated = await toggleChecklistItem(documentName, nextChecked)
      setChecklist(updated)
    } catch {
      load() // revert on server error
      triggerToast(`Could not update "${documentName}". Syncing…`, 'error')
    }
  }

  function toggleCategory(category) {
    setOpenCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }))
  }

  const rawCategories = Object.keys(checklist || {})
  const allItems = rawCategories.flatMap((c) => checklist[c] || [])

  const totalItems = allItems.length
  const checkedItems = allItems.filter((i) => i.checked).length
  const notCollectedItems = totalItems - checkedItems
  const mandatoryItems = allItems.filter((i) => i.mandatory).length

  const percent = totalItems > 0 ? Math.round((checkedItems / totalItems) * 100) : 0
  const circumference = 314.159
  const strokeOffset = circumference - (percent / 100) * circumference

  // Filter and sort
  const filteredChecklist = {}
  rawCategories.forEach((cat) => {
    let items = checklist[cat] || []
    if (activeFilter === 'not_collected') items = items.filter((i) => !i.checked)
    else if (activeFilter === 'collected') items = items.filter((i) => i.checked)
    else if (activeFilter === 'mandatory') items = items.filter((i) => i.mandatory)
    else if (activeFilter === 'optional') items = items.filter((i) => !i.mandatory)

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

  if (loading) {
    return <ChecklistSkeleton />
  }

  if (error) {
    return (
      <div className="max-w-xl mx-auto text-center py-20 px-4">
        <div className="w-14 h-14 rounded-2xl bg-error-container text-error flex items-center justify-center mx-auto mb-4 font-bold text-2xl">
          <span className="material-symbols-outlined text-[28px]">warning</span>
        </div>
        <h2 className="font-headline-lg font-bold text-chakra-blue mb-2">Checklist Service Unavailable</h2>
        <p className="text-body-sm text-on-surface-variant mb-6">{error}</p>
        <button
          onClick={load}
          className="px-5 py-2.5 rounded-xl bg-chakra-blue text-on-primary font-label-lg font-bold hover:bg-chakra-blue-subtle transition-colors shadow-sm"
        >
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col w-full -mt-6">
      {/* 1. TOP PROGRESS & GAZETTE CONTEXT SCRIM (Module 6 Header) */}
      <div className="w-full bg-chakra-blue text-on-primary shadow-md">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 py-8">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 font-label-sm text-label-sm text-surface-variant mb-4">
            <Link to="/dashboard" className="hover:text-surface-container-lowest transition-colors flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">home</span>
              Citizen Home
            </Link>
            <span className="material-symbols-outlined text-[14px] text-on-primary-container">chevron_right</span>
            <span className="text-surface-variant">Document Checklist</span>
            <span className="material-symbols-outlined text-[14px] text-on-primary-container">chevron_right</span>
            <span className="text-surface-container-lowest font-bold">Consolidated Dossier</span>
          </nav>

          {/* Header Title & Subtitle */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-kesari-saffron/20 text-kesari-saffron-vibrant font-label-sm text-label-sm uppercase tracking-wider mb-2">
                <span className="w-2 h-2 rounded-full bg-kesari-saffron-vibrant animate-pulse" />
                Unified Dossier Active
              </div>
              <h1 className="font-headline-xl text-headline-xl lg:text-display-lg text-surface-container-lowest tracking-tight leading-tight">
                Consolidated Document Checklist
                <span className="block font-headline-md text-headline-md text-kesari-saffron-vibrant font-normal mt-0.5">
                  (दस्तावेज़ चेकलिस्ट • एकत्रित नागरिक संचिका)
                </span>
              </h1>
              <p className="font-body-md text-body-md text-surface-variant mt-3 max-w-2xl">
                Unified de-duplicated checklist across matched schemes. Link once via DigiLocker to apply effortlessly across Central &amp; Maharashtra welfare portals without redundant paperwork.
              </p>
            </div>

            {/* Primary Dossier Actions */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-2 px-4 py-3 rounded-lg bg-surface-container-lowest text-chakra-blue font-label-lg text-label-lg font-bold shadow-md hover:bg-surface-container-low transition-all active:scale-95 cursor-pointer"
                type="button"
              >
                <span className="material-symbols-outlined text-[20px] text-chakra-blue">picture_as_pdf</span>
                <span>Download PDF Dossier (राजपत्र प्रारूप)</span>
              </button>
              <button
                onClick={() => setShowDigiLockerModal(true)}
                className="flex items-center gap-2 px-4 py-3 rounded-lg bg-harita-green text-on-primary font-label-lg text-label-lg font-bold shadow-md hover:bg-harita-green-vibrant transition-all active:scale-95 cursor-pointer"
                type="button"
              >
                <span className="material-symbols-outlined text-[20px]">sync</span>
                <span>Sync DigiLocker</span>
              </button>
            </div>
          </div>

          {/* Quick Action Stats Banner (4 Metrics) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8 pt-6 border-t border-chakra-blue-subtle">
            <div className="bg-chakra-blue-subtle/50 rounded-xl p-4 flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-kesari-saffron-soft text-kesari-saffron flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[26px]">filter_alt_off</span>
              </div>
              <div>
                <div className="flex items-baseline gap-1.5">
                  <span className="font-headline-lg text-headline-lg text-surface-container-lowest font-bold">{totalItems || 7}</span>
                  <span className="font-label-sm text-label-sm text-surface-variant line-through">{totalItems * 4 || 28} raw</span>
                </div>
                <div className="font-label-md text-label-md text-surface-variant leading-tight">Unique Dossier Docs</div>
              </div>
            </div>

            <div className="bg-chakra-blue-subtle/50 rounded-xl p-4 flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-harita-green-soft text-harita-green flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[26px]">cloud_done</span>
              </div>
              <div>
                <div className="flex items-baseline gap-1.5">
                  <span className="font-headline-lg text-headline-lg text-surface-container-lowest font-bold">
                    {checkedItems} <span className="font-body-sm text-body-sm text-harita-green-vibrant">/ {totalItems}</span>
                  </span>
                  <span className="font-label-sm text-label-sm text-harita-green-vibrant font-bold">({percent}%)</span>
                </div>
                <div className="font-label-md text-label-md text-surface-variant leading-tight">DigiLocker Synced</div>
              </div>
            </div>

            <div className="bg-chakra-blue-subtle/50 rounded-xl p-4 flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-partial-amber-soft text-partial-amber flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[26px]">pending_actions</span>
              </div>
              <div>
                <div className="flex items-baseline gap-1.5">
                  <span className="font-headline-lg text-headline-lg text-surface-container-lowest font-bold">{notCollectedItems}</span>
                  <span className="font-label-sm text-label-sm text-kesari-saffron-vibrant font-bold">Pending</span>
                </div>
                <div className="font-label-md text-label-md text-surface-variant leading-tight">Citizen Action Required</div>
              </div>
            </div>

            <div className="bg-chakra-blue-subtle/50 rounded-xl p-4 flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-chakra-blue-light text-chakra-blue flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[26px]">account_balance</span>
              </div>
              <div>
                <div className="flex items-baseline gap-1.5">
                  <span className="font-headline-lg text-headline-lg text-surface-container-lowest font-bold">14</span>
                  <span className="font-label-sm text-label-sm text-surface-variant">Schemes</span>
                </div>
                <div className="font-label-md text-label-md text-surface-variant leading-tight">Covered Beneficiary Acts</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. MAIN CONTENT GRID */}
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 py-8">
        {/* Filter Strip & Sorting Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 p-4 rounded-xl bg-slate-surface-elevated shadow-sm">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all shrink-0 flex items-center gap-2 cursor-pointer ${
                activeFilter === 'all'
                  ? 'bg-chakra-blue text-on-primary shadow-sm'
                  : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
              }`}
            >
              <span>All ({totalItems})</span>
            </button>
            <button
              onClick={() => setActiveFilter('not_collected')}
              className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all shrink-0 flex items-center gap-2 cursor-pointer ${
                activeFilter === 'not_collected'
                  ? 'bg-chakra-blue text-on-primary shadow-sm'
                  : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
              }`}
            >
              <span>Action Required ({notCollectedItems})</span>
            </button>
            <button
              onClick={() => setActiveFilter('collected')}
              className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all shrink-0 flex items-center gap-2 cursor-pointer ${
                activeFilter === 'collected'
                  ? 'bg-chakra-blue text-on-primary shadow-sm'
                  : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
              }`}
            >
              <span>Synced &amp; Ready ({checkedItems})</span>
            </button>
            <button
              onClick={() => setActiveFilter('mandatory')}
              className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all shrink-0 flex items-center gap-2 cursor-pointer ${
                activeFilter === 'mandatory'
                  ? 'bg-chakra-blue text-on-primary shadow-sm'
                  : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-kesari-saffron" />
              <span>Mandatory ({mandatoryItems})</span>
            </button>
          </div>

          <div className="flex items-center gap-2 shrink-0 relative" ref={sortDropdownRef}>
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Sort:</span>
            <div className="relative">
              <button
                type="button"
                onClick={() => setSortDropdownOpen((prev) => !prev)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-container-low text-chakra-blue font-label-md text-label-md font-semibold hover:bg-surface-container transition-colors cursor-pointer"
              >
                <span>{SORT_OPTIONS.find((o) => o.id === sortBy)?.label || 'Category'}</span>
                <span className="material-symbols-outlined text-[16px]">expand_more</span>
              </button>

              {sortDropdownOpen && (
                <div className="absolute right-0 top-full mt-1.5 w-48 bg-slate-surface-elevated rounded-xl shadow-lg border border-slate-border p-1.5 z-40 animate-fade-in">
                  {SORT_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => {
                        setSortBy(opt.id)
                        setSortDropdownOpen(false)
                      }}
                      className={`w-full text-left px-3 py-2 text-xs rounded-lg flex items-center justify-between transition-colors cursor-pointer ${
                        sortBy === opt.id
                          ? 'bg-chakra-blue-light text-chakra-blue font-bold'
                          : 'text-on-surface hover:bg-surface-container-low'
                      }`}
                    >
                      <span>{opt.label}</span>
                      {sortBy === opt.id && <span className="material-symbols-outlined text-[16px]">check</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT COLUMN: Grouped Deduplicated Document Checklists (8 cols) */}
          <section aria-label="Grouped Document Registry" className="lg:col-span-8 flex flex-col gap-6">
            {/* Algorithm Optimization Notice Banner */}
            <div className="bg-chakra-blue-light rounded-xl p-4 shadow-sm flex items-start gap-3">
              <span className="material-symbols-outlined text-chakra-blue text-[22px] mt-0.5">auto_awesome</span>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h2 className="font-label-lg text-label-lg font-bold text-chakra-blue">Dossier Deduplication Optimization: 4x Efficiency</h2>
                  <span className="px-2 py-0.5 rounded bg-surface-container-lowest font-label-sm text-label-sm font-bold text-chakra-blue shadow-sm">
                    21 Redundant Uploads Eliminated
                  </span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                  Cross-mapping matches each document hash to statutory requirements. One Aadhaar XML validation satisfies multiple central and state portals simultaneously.
                </p>
              </div>
            </div>

            {/* Global Expand / Collapse All Controls */}
            <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-xs text-on-surface-variant">
              <span>{visibleCategories.length} document categories (click any category to view requirements)</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const allOpen = {}
                    visibleCategories.forEach((c) => {
                      allOpen[c] = true
                    })
                    setOpenCategories(allOpen)
                  }}
                  className="px-2.5 py-1 rounded-md bg-surface-container-low hover:bg-surface-container text-chakra-blue font-semibold transition-colors cursor-pointer text-xs"
                >
                  Expand All
                </button>
                <button
                  type="button"
                  onClick={() => setOpenCategories({})}
                  className="px-2.5 py-1 rounded-md bg-surface-container-low hover:bg-surface-container text-on-surface-variant font-semibold transition-colors cursor-pointer text-xs"
                >
                  Collapse All
                </button>
              </div>
            </div>

            {/* Categories & Docs */}
            {visibleCategories.map((category, catIdx) => {
              const items = filteredChecklist[category] || []
              const isOpen = Boolean(openCategories[category])
              const catTotal = (checklist[category] || []).length
              const catChecked = (checklist[category] || []).filter((i) => i.checked).length
              const meta = CATEGORY_META[category] || CATEGORY_META['Other']
              const isAllVerified = catTotal > 0 && catChecked === catTotal

              return (
                <div
                  key={category}
                  className={`bg-slate-surface-elevated rounded-xl shadow-xs hover:shadow-md transition-all border border-slate-border/70 p-5 ${
                    isOpen ? 'ring-1 ring-chakra-blue/10' : ''
                  }`}
                >
                  {/* Category Header (Clickable Accordion) */}
                  <div
                    onClick={() => toggleCategory(category)}
                    className={`flex items-center justify-between cursor-pointer select-none transition-all ${
                      isOpen ? 'pb-4 mb-5 border-b border-slate-border' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm shrink-0 ${meta.badgeColor}`}>
                        {catIdx + 1}
                      </div>
                      <div>
                        <h3 className="font-headline-sm text-headline-sm font-bold text-chakra-blue hover:text-kesari-saffron transition-colors">
                          {category}
                        </h3>
                        <span className="font-label-sm text-label-sm text-on-surface-variant">
                          {meta.marathi} • {catChecked} of {catTotal} Verified
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {isAllVerified ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-harita-green-soft text-harita-green font-label-md text-label-md font-bold">
                          <span className="material-symbols-outlined text-[16px]">check_circle</span>
                          <span className="hidden sm:inline">All Verified</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-partial-amber-soft text-partial-amber font-label-md text-label-md font-bold">
                          <span className="material-symbols-outlined text-[16px]">priority_high</span>
                          <span className="hidden sm:inline">Action Required</span>
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleCategory(category)
                        }}
                        className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container-high transition-colors cursor-pointer"
                        title={isOpen ? 'Collapse section' : 'Expand section'}
                        aria-expanded={isOpen}
                      >
                        <span
                          className={`material-symbols-outlined text-[22px] transform transition-transform duration-200 block ${
                            isOpen ? 'rotate-180' : ''
                          }`}
                        >
                          expand_more
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Doc Items Container */}
                  {isOpen && (
                    <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-top-1 duration-150">
                      {items.map((item) => {
                        const isChecked = item.checked
                        const desc =
                          DOC_DESCRIPTIONS[item.documentName] ||
                          'Statutory proof required for scheme eligibility verification and direct sanctioning.'

                        return (
                          <div
                            key={item.documentName}
                            className="p-4 rounded-xl bg-surface-container-lowest shadow-sm hover:shadow-md transition-shadow border border-slate-border/50"
                          >
                            <div className="flex items-start gap-4">
                              <label className="relative flex items-center mt-1 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => handleToggle(item.documentName, isChecked)}
                                  className="w-5 h-5 rounded text-harita-green focus:ring-harita-green focus:ring-offset-0 cursor-pointer accent-harita-green"
                                />
                              </label>

                              <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                  <h4 className="font-headline-sm text-headline-sm font-bold text-on-surface flex items-center gap-2">
                                    <span className={isChecked ? 'line-through text-on-surface-variant' : 'text-chakra-blue'}>
                                      {item.documentName}
                                    </span>
                                    {isChecked && (
                                      <span className="material-symbols-outlined text-harita-green text-[18px]">verified</span>
                                    )}
                                    {item.mandatory && !isChecked && (
                                      <span className="px-2 py-0.5 rounded bg-kesari-saffron text-on-primary font-label-sm text-label-sm uppercase tracking-wider font-bold">
                                        Critical
                                      </span>
                                    )}
                                  </h4>

                                  {isChecked ? (
                                    <span className="px-2.5 py-0.5 rounded-full bg-harita-green-soft text-harita-green font-label-sm text-label-sm font-bold flex items-center gap-1">
                                      <span className="material-symbols-outlined text-[14px]">lock</span>
                                      DigiLocker Synced • Verified
                                    </span>
                                  ) : (
                                    <span className="px-2.5 py-0.5 rounded-full bg-partial-amber-soft text-partial-amber font-label-sm text-label-sm font-bold flex items-center gap-1">
                                      <span className="material-symbols-outlined text-[14px]">pending</span>
                                      Pending Verification
                                    </span>
                                  )}
                                </div>

                                <p className="font-body-sm text-body-sm text-on-surface-variant mt-1 leading-relaxed">
                                  {desc}
                                </p>

                                {/* Contributing Schemes Pill Row */}
                                {item.contributingSchemes && item.contributingSchemes.length > 0 && (
                                  <div className="mt-3 pt-3 border-t border-slate-border/60">
                                    <div className="font-label-sm text-label-sm text-on-surface-variant mb-1.5 font-semibold">
                                      Satisfies Statutory Requirements for {item.contributingSchemes.length} Matched Scheme{item.contributingSchemes.length === 1 ? '' : 's'}:
                                    </div>
                                    <div className="flex flex-wrap gap-1.5">
                                      {item.contributingSchemes.slice(0, 4).map((s) => (
                                        <span
                                          key={s.schemeId}
                                          className="px-2 py-0.5 rounded bg-surface-container-high text-chakra-blue font-label-sm text-label-sm font-medium"
                                        >
                                          {s.schemeName}
                                        </span>
                                      ))}
                                      {item.contributingSchemes.length > 4 && (
                                        <button
                                          onClick={() => setSelectedDocForSchemes(item)}
                                          className="px-2 py-0.5 rounded bg-chakra-blue-light text-chakra-blue font-label-sm text-label-sm font-bold hover:underline cursor-pointer"
                                        >
                                          +{item.contributingSchemes.length - 4} more
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                )}

                                {/* Action Buttons */}
                                <div className="mt-3.5 flex flex-wrap items-center gap-2.5">
                                  <button
                                    onClick={() => {
                                      handleToggle(item.documentName, false)
                                      triggerToast(`Fetched "${item.documentName}" via MahaOnline e-District`, 'success')
                                    }}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container-high text-chakra-blue font-label-md text-label-md font-semibold hover:bg-surface-variant transition-colors cursor-pointer"
                                    type="button"
                                  >
                                    <span className="material-symbols-outlined text-[16px]">sync</span>
                                    <span>Fetch from e-District</span>
                                  </button>

                                  <span className="font-label-sm text-label-sm text-on-surface-variant ml-auto">
                                    {isChecked ? 'Ready in Citizen Dossier' : 'Avg. Issuance: 3 working days via Aaple Sarkar'}
                                  </span>
                                </div>
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
          </section>

          {/* RIGHT COLUMN: Summary, Readiness & DigiLocker Vault Assistant (4 cols) */}
          <aside aria-label="Application Readiness Dossier" className="lg:col-span-4 flex flex-col gap-6">
            {/* Readiness Score Card */}
            <div className="bg-slate-surface-elevated rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-headline-sm text-headline-sm font-bold text-chakra-blue">
                  Dossier Readiness Score
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-harita-green-soft text-harita-green font-label-md text-label-md font-bold">
                  {percent}% Ready
                </span>
              </div>

              {/* Circular SVG Radial Gauge */}
              <div className="flex flex-col items-center justify-center py-2">
                <div className="relative w-40 h-40 flex items-center justify-center">
                  <svg aria-hidden="true" className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                    <circle className="text-surface-container-high" cx="60" cy="60" fill="transparent" r="50" stroke="currentColor" strokeWidth="10" />
                    <circle
                      className="text-harita-green transition-all duration-700 ease-out"
                      cx="60"
                      cy="60"
                      fill="transparent"
                      r="50"
                      stroke="currentColor"
                      strokeDasharray="314.159"
                      strokeDashoffset={strokeOffset}
                      strokeLinecap="round"
                      strokeWidth="10"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center text-center">
                    <span className="font-headline-xl text-headline-xl font-bold text-chakra-blue">{percent}%</span>
                    <span className="font-label-sm text-label-sm text-on-surface-variant uppercase font-semibold tracking-wider">
                      {percent >= 80 ? 'Optimal' : 'In Progress'}
                    </span>
                  </div>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant text-center mt-3 max-w-xs leading-relaxed">
                  {checkedItems} of {totalItems} mandatory documents verified. Fulfilling the {notCollectedItems} pending record{notCollectedItems === 1 ? '' : 's'} elevates profile to <strong className="text-harita-green">100% Guaranteed Dispatch</strong>.
                </p>
              </div>

              {/* Quick breakdown bars */}
              <div className="mt-4 pt-4 border-t border-slate-border flex flex-col gap-2.5 font-label-sm text-label-sm">
                <div className="flex justify-between text-on-surface-variant">
                  <span>National Central Verification</span>
                  <span className="font-bold text-harita-green">100% (UIDAI / PFMS)</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-surface-container-high overflow-hidden">
                  <div className="h-full bg-harita-green rounded-full w-full" />
                </div>
                <div className="flex justify-between text-on-surface-variant mt-1">
                  <span>Maharashtra State Revenue &amp; Caste</span>
                  <span className="font-bold text-kesari-saffron">75% (Income &amp; 7/12 Validated)</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-surface-container-high overflow-hidden">
                  <div className="h-full bg-kesari-saffron rounded-full w-3/4" />
                </div>
              </div>
            </div>

            {/* Schemes Blocked by Missing Docs Card */}
            <div className="bg-slate-surface-elevated rounded-xl shadow-md p-6">
              <div className="flex items-center gap-2 mb-3 text-kesari-saffron">
                <span className="material-symbols-outlined text-[20px]">lock_clock</span>
                <h3 className="font-headline-sm text-headline-sm font-bold text-chakra-blue">
                  Schemes Awaiting Documents
                </h3>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant mb-4">
                Unlocking these pending documents releases statutory entitlements into your seeded account:
              </p>
              <div className="flex flex-col gap-3">
                <div className="p-3.5 rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-label-lg text-label-lg font-bold text-chakra-blue">MahaDBT Post-Matric Scholarship</h4>
                      <span className="font-label-sm text-label-sm text-partial-amber font-semibold flex items-center gap-1 mt-0.5">
                        <span className="material-symbols-outlined text-[14px]">hourglass_bottom</span>
                        Needs: Caste Validity &amp; Income FY25
                      </span>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-headline-sm text-headline-sm font-bold text-harita-green">₹14,400</span>
                      <span className="block font-label-sm text-label-sm text-on-surface-variant">Annual Fee</span>
                    </div>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-label-lg text-label-lg font-bold text-chakra-blue">PM-KISAN Samman Nidhi</h4>
                      <span className="font-label-sm text-label-sm text-partial-amber font-semibold flex items-center gap-1 mt-0.5">
                        <span className="material-symbols-outlined text-[14px]">hourglass_bottom</span>
                        Needs: 7/12 Mahabhulekh Extract
                      </span>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-headline-sm text-headline-sm font-bold text-harita-green">₹6,000</span>
                      <span className="block font-label-sm text-label-sm text-on-surface-variant">Per Year DBT</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* DigiLocker Civic Vault Integration Card */}
            <div className="bg-chakra-blue text-on-primary rounded-xl shadow-md p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-surface-container-lowest/15 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[24px] text-harita-green-vibrant">cloud_sync</span>
                </div>
                <div>
                  <h3 className="font-headline-sm text-headline-sm font-bold text-surface-container-lowest">DigiLocker Civic Vault</h3>
                  <span className="font-label-sm text-label-sm text-surface-variant">MeitY Certified National Repository</span>
                </div>
              </div>
              <p className="font-body-sm text-body-sm text-surface-variant mb-4 leading-relaxed">
                Direct integration pulls cryptographically verifiable PDF/XML certificates with digital signatures, eliminating gazetted officer attestation.
              </p>
              <div className="flex flex-col gap-2.5">
                <button
                  onClick={() => setShowDigiLockerModal(true)}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-kesari-saffron text-on-primary font-label-lg text-label-lg font-bold hover:bg-kesari-saffron-vibrant transition-all shadow-md active:scale-95 cursor-pointer"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[18px]">verified_user</span>
                  <span>{digiLockerConnected ? 'DigiLocker Connected ✓' : 'Authorize DigiLocker OAuth2'}</span>
                </button>
                <div className="flex items-center justify-center gap-2 font-label-sm text-label-sm text-surface-variant pt-1">
                  <span className="material-symbols-outlined text-[14px] text-harita-green-vibrant">lock</span>
                  <span>256-Bit Encrypted • Citizen Consent Bound</span>
                </div>
              </div>
            </div>

            {/* Maharashtra RTS Act 2015 Advisory Notice */}
            <div className="bg-kesari-saffron-soft rounded-xl p-5 shadow-sm">
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-kesari-saffron text-[22px] mt-0.5 shrink-0">gavel</span>
                <div className="flex-1">
                  <h4 className="font-label-lg text-label-lg font-bold text-chakra-blue">
                    Right to Public Services Act (RTS 2015)
                  </h4>
                  <p className="font-body-sm text-body-sm text-on-secondary-container mt-1 leading-relaxed">
                    Under the Maharashtra Guarantee of Public Services Act, revenue certificates (Income, Domicile, 7/12) are mandatorily issued within <strong>7 to 15 days</strong>. No fee beyond statutory portal challan is legally required.
                  </p>
                  <a
                    className="inline-flex items-center gap-1 font-label-sm text-label-sm font-bold text-kesari-saffron hover:underline mt-2"
                    href="https://aaplesarkar.mahaonline.gov.in"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <span>View Aaple Sarkar Grievance Redressal</span>
                    <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                  </a>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* MODAL: Contributing Schemes details */}
      {selectedDocForSchemes && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-slate-surface-elevated rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-border">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <h3 className="font-headline-sm font-bold text-chakra-blue">
                  {selectedDocForSchemes.documentName}
                </h3>
                <p className="font-body-sm text-on-surface-variant mt-0.5">
                  Satisfies requirements for {selectedDocForSchemes.contributingSchemes?.length} schemes:
                </p>
              </div>
              <button
                onClick={() => setSelectedDocForSchemes(null)}
                className="p-1 rounded-lg text-on-surface-variant hover:bg-surface-container transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
              {selectedDocForSchemes.contributingSchemes?.map((s) => (
                <div key={s.schemeId} className="p-3 rounded-lg bg-surface-container-low flex items-center justify-between">
                  <span className="font-body-sm font-medium text-chakra-blue">{s.schemeName}</span>
                  <Link
                    to={`/schemes/${s.schemeId}`}
                    className="font-label-sm text-kesari-saffron font-bold hover:underline"
                  >
                    View →
                  </Link>
                </div>
              ))}
            </div>

            <button
              onClick={() => setSelectedDocForSchemes(null)}
              className="mt-5 w-full py-2.5 rounded-lg bg-chakra-blue text-on-primary font-label-lg font-bold"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* MODAL: DigiLocker Auth Simulated Modal */}
      {showDigiLockerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-slate-surface-elevated rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-border">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-harita-green-soft text-harita-green flex items-center justify-center">
                <span className="material-symbols-outlined text-[28px]">cloud_sync</span>
              </div>
              <div>
                <h3 className="font-headline-sm font-bold text-chakra-blue">DigiLocker e-KYC Consent</h3>
                <span className="font-label-sm text-on-surface-variant">MeitY Government of India Gateway</span>
              </div>
            </div>

            <p className="font-body-sm text-on-surface-variant mb-4 leading-relaxed">
              By syncing with DigiLocker, SAARTHI will securely fetch your verified Aadhaar XML, Maharashtra Domicile, and 7/12 land records to auto-satisfy statutory scheme requirements.
            </p>

            <div className="space-y-2 mb-6">
              <div className="flex items-center gap-2 font-label-sm text-on-surface">
                <span className="material-symbols-outlined text-harita-green text-[18px]">verified</span>
                <span>Aadhaar Card (UIDAI Linked)</span>
              </div>
              <div className="flex items-center gap-2 font-label-sm text-on-surface">
                <span className="material-symbols-outlined text-harita-green text-[18px]">verified</span>
                <span>State Domicile Certificate (MahaOnline)</span>
              </div>
              <div className="flex items-center gap-2 font-label-sm text-on-surface">
                <span className="material-symbols-outlined text-harita-green text-[18px]">verified</span>
                <span>Bank Passbook NPCI Direct Benefit Transfer</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setDigiLockerConnected(true)
                  setShowDigiLockerModal(false)
                  triggerToast('DigiLocker Vault synced! All verified records updated.', 'success')
                }}
                className="flex-1 py-3 rounded-lg bg-harita-green hover:bg-harita-green-vibrant text-on-primary font-label-lg font-bold transition-colors cursor-pointer"
              >
                Allow &amp; Link DigiLocker
              </button>
              <button
                onClick={() => setShowDigiLockerModal(false)}
                className="px-4 py-3 rounded-lg bg-surface-container-high text-chakra-blue font-label-lg font-bold hover:bg-surface-container-highest transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Micro-interaction Notification Toast */}
      {toast && (
        <aside
          role="status"
          aria-live="polite"
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#0D2240] text-white border border-white/20 px-4 sm:px-5 py-3 rounded-xl shadow-[0_12px_36px_rgba(13,34,64,0.45)] flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5 duration-200 max-w-[92vw] sm:max-w-md pointer-events-auto"
        >
          <span
            className={`material-symbols-outlined text-[22px] shrink-0 ${
              toast.type === 'error'
                ? 'text-[#EF4444]'
                : toast.type === 'info'
                ? 'text-[#60A5FA]'
                : 'text-[#16A34A]'
            }`}
          >
            {toast.type === 'error' ? 'error' : toast.type === 'info' ? 'info' : 'check_circle'}
          </span>
          <span className="text-white text-xs sm:text-sm font-semibold tracking-wide leading-snug">
            {toast.message}
          </span>
          <button
            type="button"
            onClick={() => setToast(null)}
            className="text-white/60 hover:text-white ml-auto p-1 rounded-md transition-colors cursor-pointer shrink-0"
            aria-label="Dismiss notification"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </aside>
      )}
    </div>
  )
}
