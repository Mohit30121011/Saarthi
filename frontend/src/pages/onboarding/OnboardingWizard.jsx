import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { updateProfile } from '../../api/profile'
import { STATE_DISTRICTS, getDistrictsForState } from '../../data/indianDistricts'
import onboardingHero from '../../assets/onboarding-hero.png'
import saarthiLogoSvg from '../../assets/saarthi-portal-logo.svg'

const TOTAL_STEPS = 6

const STEP_TITLES = [
  'Personal & Domicile',
  'Location & Jurisdiction',
  'Income & Occupation',
  'Social Category & Education',
  'Special Criteria & Tags',
  'Review & Confirm Snapshot',
]

const GENDERS = ['MALE', 'FEMALE', 'OTHER']
const CATEGORIES = ['GENERAL', 'OBC', 'SC', 'ST', 'EWS']
const EDUCATION_LEVELS = ['Below 10th', '10th', '12th', 'Diploma', 'Graduate', 'Post Graduate', 'Doctorate']
const OCCUPATIONS = ['Student', 'Farmer', 'Self-Employed', 'Salaried', 'Unemployed', 'Homemaker', 'Retired']
const INDIAN_STATES = Object.keys(STATE_DISTRICTS)

function CustomSelect({
  options = [],
  value,
  onChange,
  placeholder = 'Select an option',
  disabled = false,
  direction = 'auto',
}) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [openUpwards, setOpenUpwards] = useState(false)
  const dropdownRef = useRef(null)

  const checkPlacement = useCallback(() => {
    if (direction === 'up') {
      setOpenUpwards(true)
      return
    }
    if (direction === 'down') {
      setOpenUpwards(false)
      return
    }
    if (!dropdownRef.current) return
    const rect = dropdownRef.current.getBoundingClientRect()
    const spaceBelow = window.innerHeight - rect.bottom
    const spaceAbove = rect.top
    // If space below is less than 280px and space above is greater, open upwards
    setOpenUpwards(spaceBelow < 280 && spaceAbove > spaceBelow)
  }, [direction])

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (open) {
      checkPlacement()
      window.addEventListener('resize', checkPlacement)
      window.addEventListener('scroll', checkPlacement, true)
      return () => {
        window.removeEventListener('resize', checkPlacement)
        window.removeEventListener('scroll', checkPlacement, true)
      }
    }
  }, [open, checkPlacement])

  const filtered = options.filter((opt) => opt.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          if (disabled) return
          if (!open) {
            checkPlacement()
          }
          setOpen(!open)
          setSearch('')
        }}
        className={`w-full flex items-center justify-between rounded-xl px-3.5 h-12 border transition-all text-left ${
          disabled
            ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed opacity-75'
            : open
            ? 'border-[#0D2240] ring-2 ring-[#0D2240]/15 bg-white cursor-pointer'
            : 'bg-[#F8FAFC] border-[#E2E8F0] hover:border-[#0D2240]/50 cursor-pointer'
        }`}
      >
        <span className={`text-sm truncate pr-2 ${value ? 'text-[#0D2240] font-bold' : 'text-[#44474E]'}`}>
          {value || placeholder}
        </span>
        <span
          className={`material-symbols-outlined text-[18px] text-[#44474E] transition-transform duration-200 ${
            open ? (openUpwards ? 'text-[#0D2240]' : 'rotate-180 text-[#0D2240]') : ''
          }`}
        >
          {open && openUpwards ? 'expand_less' : 'expand_more'}
        </span>
      </button>

      {open && !disabled && (
        <div
          className={`absolute left-0 right-0 z-50 bg-white rounded-xl border border-[#E2E8F0] p-2 ${
            openUpwards
              ? 'bottom-[calc(100%+6px)] shadow-[0_-10px_25px_-5px_rgba(13,34,64,0.15),0_8px_10px_-6px_rgba(13,34,64,0.05)]'
              : 'top-[calc(100%+6px)] shadow-xl'
          }`}
        >
          {options.length > 6 && (
            <div className="px-1 pb-2 border-b border-[#E2E8F0] mb-1">
              <div className="relative flex items-center bg-[#F8FAFC] rounded-lg px-2.5 h-9 border border-[#E2E8F0]">
                <span className="material-symbols-outlined text-slate-400 text-[18px] mr-2">search</span>
                <input
                  type="text"
                  placeholder="Search options…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  autoFocus
                  className="w-full bg-transparent border-none outline-none text-xs text-[#0D2240] placeholder:text-slate-400 p-0 focus:ring-0 font-medium"
                />
              </div>
            </div>
          )}

          <div className="max-h-52 overflow-y-auto space-y-0.5 pr-1 text-xs">
            {filtered.length === 0 ? (
              <div className="px-3 py-3 text-[#44474E] text-center font-medium">No options match "{search}"</div>
            ) : (
              filtered.map((opt) => {
                const isSelected = value === opt
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => {
                      onChange(opt)
                      setOpen(false)
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg font-medium transition-all text-left cursor-pointer ${
                      isSelected
                        ? 'bg-[#EBF3FC] text-[#0D2240] font-bold'
                        : 'text-[#111C2D] hover:bg-[#F0F3FF]'
                    }`}
                  >
                    <span>{opt}</span>
                    {isSelected && (
                      <span className="material-symbols-outlined text-[#0D2240] text-[18px]">check</span>
                    )}
                  </button>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function ChipGroup({ options, value, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const isSelected = value === opt
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all duration-150 cursor-pointer ${
              isSelected
                ? 'bg-[#0D2240] text-white border-[#0D2240] shadow-xs'
                : 'bg-white text-[#44474E] border-[#E2E8F0] hover:border-[#0D2240]/40 hover:bg-[#F0F3FF]'
            }`}
          >
            {opt}
          </button>
        )
      })}
    </div>
  )
}

function ToggleRow({ label, why, value, onChange }) {
  return (
    <div className="flex items-center justify-between py-3.5 border-b border-[#E2E8F0] last:border-0">
      <div>
        <p className="text-sm font-bold text-[#0D2240]">{label}</p>
        {why && <p className="text-xs text-[#44474E] mt-0.5">{why}</p>}
      </div>
      <button
        type="button"
        onClick={() => onChange(!value)}
        className={`w-12 h-6 rounded-full relative transition-colors duration-200 shrink-0 cursor-pointer ${
          value ? 'bg-[#138808]' : 'bg-slate-300'
        }`}
      >
        <span
          className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-xs transition-transform duration-200 ${
            value ? 'translate-x-6.5' : 'translate-x-0.5'
          }`}
        />
      </button>
    </div>
  )
}

export default function OnboardingWizard() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    dateOfBirth: '',
    gender: '',
    state: '',
    district: '',
    annualIncome: '',
    occupation: '',
    category: '',
    educationLevel: '',
    disabilityStatus: false,
    isBpl: false,
    isMinority: false,
  })

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  function next() {
    setError('')
    if (step === 1 && (!form.dateOfBirth || !form.gender)) {
      setError('Please provide your date of birth and select your gender.')
      return
    }
    if (step === 2 && !form.state) {
      setError('Please select your state domicile.')
      return
    }
    if (step === 3 && form.annualIncome === '') {
      setError('Please enter your approximate annual family income.')
      return
    }
    if (step === 4 && (!form.category || !form.educationLevel)) {
      setError('Please select your social category and education level.')
      return
    }
    setStep((s) => Math.min(TOTAL_STEPS, s + 1))
  }

  function back() {
    setError('')
    setStep((s) => Math.max(1, s - 1))
  }

  async function handleFinish() {
    setError('')
    setSaving(true)
    try {
      await updateProfile({
        ...form,
        annualIncome: form.annualIncome === '' ? null : Number(form.annualIncome),
      })
      window.dispatchEvent(new CustomEvent('profile-updated', { detail: form }))
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.error || 'Could not save your profile. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  // Calculate age helper
  const ageString = form.dateOfBirth
    ? (() => {
        const birth = new Date(form.dateOfBirth)
        const diff = Date.now() - birth.getTime()
        const ageDate = new Date(diff)
        const years = Math.abs(ageDate.getUTCFullYear() - 1970)
        return !isNaN(years)
          ? `${years} Years • Eligible for youth, student & skill allowances`
          : null
      })()
    : null

  return (
    <div className="min-h-screen w-full flex flex-col font-sans text-[#111C2D]">
      {/* Tricolor Header Ribbon */}
      <div className="h-1.5 w-full grid grid-cols-3 fixed top-0 left-0 right-0 z-50">
        <div className="bg-[#E65100] h-full" />
        <div className="bg-white h-full" />
        <div className="bg-[#138808] h-full" />
      </div>

      <div className="flex-1 w-full flex flex-col lg:flex-row pt-1.5">
        {/* LEFT: Hero Civic Artwork Pane */}
        <div className="relative w-full lg:w-[45%] xl:w-[46%] min-h-[380px] lg:min-h-[calc(100vh-6px)] overflow-hidden bg-[#0D2240] flex flex-col justify-between p-8 lg:p-12 text-white">
          <img
            src={onboardingHero}
            alt="Saarthi Citizen Onboarding"
            className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-luminosity"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0D2240] via-[#0D2240]/80 to-[#0D2240]/40" />

          {/* Top Emblem / Logo */}
          <div className="relative z-10">
            <Link to="/dashboard" className="inline-block bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl">
              <img src={saarthiLogoSvg} alt="SAARTHI Logo" className="h-8 w-auto object-contain" />
            </Link>
          </div>

          {/* Bottom Headline Details */}
          <div className="relative z-10 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E65100] text-white text-[11px] font-bold uppercase tracking-wider shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              <span>Government of India &amp; Maharashtra</span>
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
              Citizen Entitlement &amp; Welfare Gateway
            </h2>
            <p className="text-xs sm:text-sm text-white/80 max-w-md leading-relaxed">
              Complete your profile in 6 simple steps to unlock tailored Central &amp; State welfare schemes directly mapped to your demographic credentials.
            </p>

            <div className="pt-3 flex items-center gap-4 text-xs font-semibold text-white/90">
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-[#16A34A]">verified</span>
                <span>Gazette Grounded</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-[#FF7722]">security</span>
                <span>Privacy Protected</span>
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT: Onboarding Wizard Pane */}
        <div className="w-full lg:w-[55%] xl:w-[54%] min-h-screen bg-white flex flex-col justify-between p-6 sm:p-10 lg:p-12 overflow-y-auto">
          <div className="w-full max-w-xl mx-auto my-auto space-y-6">
            {/* Top Security Context Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#E2E8F0] text-[#44474E] text-xs">
              <div className="flex items-center gap-2 font-bold text-[#0D2240]">
                <span className="w-2 h-2 rounded-full bg-[#138808] animate-pulse" />
                <span>OFFICIAL CITIZEN VERIFICATION ACTIVE</span>
              </div>
              <span className="bg-[#EBF3FC] text-[#0D2240] px-2.5 py-0.5 rounded-full font-bold text-[11px] flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">lock</span>
                <span>256-Bit Encrypted Vault</span>
              </span>
            </div>

            {/* Stepper Header */}
            <div className="bg-[#F8FAFC] p-4 rounded-xl border border-[#E2E8F0] flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-full bg-[#E65100] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                    {step}
                  </span>
                  <span className="font-display font-bold text-base text-[#0D2240]">
                    {STEP_TITLES[step - 1]}
                  </span>
                </div>
                <span className="text-xs text-[#44474E] font-bold">
                  Step {step} of {TOTAL_STEPS}
                </span>
              </div>

              {/* Segmented Track Bar with Tricolor Progression */}
              <div className="w-full bg-[#DEE8FF] h-2 rounded-full overflow-hidden flex gap-1">
                {Array.from({ length: TOTAL_STEPS }, (_, i) => (
                  <div
                    key={i}
                    className={`flex-1 h-full rounded-full transition-all duration-300 ${
                      i + 1 < step
                        ? 'bg-[#138808]'
                        : i + 1 === step
                        ? 'bg-[#E65100]'
                        : 'bg-[#DEE8FF]'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Match Opportunity Banner */}
            <div className="bg-[#0D2240] text-white rounded-xl p-4 shadow-md relative overflow-hidden flex items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-[#FF7722] text-[24px] mt-0.5 shrink-0">
                  auto_awesome
                </span>
                <div>
                  <span className="text-[10.5px] bg-[#E65100] text-white px-2 py-0.5 rounded uppercase font-bold tracking-wider">
                    Eligibility Engine Active
                  </span>
                  <h4 className="font-display font-bold text-sm text-white mt-1">
                    Completing your profile unlocks tailored central and state welfare entitlements!
                  </h4>
                  <p className="text-xs text-white/80 mt-0.5">
                    Direct benefit transfers, fee waivers &amp; statutory grants mapped to your credentials
                  </p>
                </div>
              </div>
            </div>

            {/* Error Notice */}
            {error && (
              <div className="p-3.5 rounded-xl bg-red-50 text-red-700 border border-red-200 flex items-center justify-between text-xs font-semibold">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">error</span>
                  <span>{error}</span>
                </div>
                <button onClick={() => setError('')} className="font-bold text-base cursor-pointer">×</button>
              </div>
            )}

            {/* Step Form Bodies */}
            <div className="min-h-[280px] flex flex-col justify-center">
              {/* Step 1: Personal Details */}
              {step === 1 && (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-display text-lg font-bold text-[#0D2240]">
                      Personal &amp; Demographic Identity
                    </h3>
                    <p className="text-xs text-[#44474E] mt-1">
                      Helps identify age- and gender-specific welfare entitlement criteria.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#0D2240] mb-1.5" htmlFor="dob">
                      Date of Birth (DOB) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative flex items-center bg-[#F8FAFC] rounded-xl px-3.5 h-12 border border-[#E2E8F0] focus-within:border-[#0D2240] focus-within:ring-2 focus-within:ring-[#0D2240]/10 transition-all">
                      <input
                        id="dob"
                        type="date"
                        value={form.dateOfBirth}
                        onChange={(e) => set('dateOfBirth', e.target.value)}
                        className="w-full bg-transparent border-none outline-none text-sm text-[#0D2240] font-medium p-0 focus:ring-0"
                      />
                    </div>
                    {ageString && (
                      <div className="mt-2 flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#EAFBF0] text-[#138808] text-xs font-bold border border-[#16A34A]/20">
                        <span className="material-symbols-outlined text-[16px]">verified</span>
                        <span>{ageString}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#0D2240] mb-2">
                      Gender Identity <span className="text-red-500">*</span>
                    </label>
                    <ChipGroup options={GENDERS} value={form.gender} onChange={(v) => set('gender', v)} />
                  </div>
                </div>
              )}

              {/* Step 2: Location */}
              {step === 2 && (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-display text-lg font-bold text-[#0D2240]">
                      Where is your state domicile?
                    </h3>
                    <p className="text-xs text-[#44474E] mt-1">
                      State domicile unlocks specialized state government resolutions and local welfare funds.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#0D2240] mb-1.5">
                      State / Union Territory <span className="text-red-500">*</span>
                    </label>
                    <CustomSelect
                      options={INDIAN_STATES}
                      value={form.state}
                      onChange={(val) => {
                        set('state', val)
                        const newDistricts = getDistrictsForState(val)
                        if (!newDistricts.includes(form.district)) {
                          set('district', '')
                        }
                      }}
                      placeholder="Select your State or UT"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#0D2240] mb-1.5">
                      District Jurisdiction
                    </label>
                    <CustomSelect
                      options={getDistrictsForState(form.state)}
                      value={form.district}
                      onChange={(val) => set('district', val)}
                      disabled={!form.state}
                      placeholder={form.state ? 'Select official district' : 'Select a state first'}
                    />
                  </div>
                </div>
              )}

              {/* Step 3: Income & Occupation */}
              {step === 3 && (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-display text-lg font-bold text-[#0D2240]">
                      Income &amp; Occupation
                    </h3>
                    <p className="text-xs text-[#44474E] mt-1">
                      Used to determine eligibility against statutory income ceilings.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#0D2240] mb-1.5" htmlFor="income">
                      Annual Gross Family Income (₹) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative flex items-center bg-[#F8FAFC] rounded-xl px-3.5 h-12 border border-[#E2E8F0] focus-within:border-[#0D2240] focus-within:ring-2 focus-within:ring-[#0D2240]/10 transition-all">
                      <span className="font-bold text-[#44474E] mr-2">₹</span>
                      <input
                        id="income"
                        type="number"
                        min="0"
                        placeholder="e.g. 350000"
                        value={form.annualIncome}
                        onChange={(e) => set('annualIncome', e.target.value)}
                        className="w-full bg-transparent border-none outline-none text-sm text-[#0D2240] font-medium p-0 focus:ring-0"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#0D2240] mb-1.5">
                      Primary Occupation
                    </label>
                    <CustomSelect
                      options={OCCUPATIONS}
                      value={form.occupation}
                      onChange={(v) => set('occupation', v)}
                      placeholder="Select occupation category"
                    />
                  </div>
                </div>
              )}

              {/* Step 4: Category & Education */}
              {step === 4 && (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-display text-lg font-bold text-[#0D2240]">
                      Social Category &amp; Highest Education
                    </h3>
                    <p className="text-xs text-[#44474E] mt-1">
                      Required for constitutional reservation benefits and scholarship eligibility.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#0D2240] mb-2">
                      Social Category <span className="text-red-500">*</span>
                    </label>
                    <ChipGroup options={CATEGORIES} value={form.category} onChange={(v) => set('category', v)} />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#0D2240] mb-1.5">
                      Highest Completed Education Level <span className="text-red-500">*</span>
                    </label>
                    <CustomSelect
                      options={EDUCATION_LEVELS}
                      value={form.educationLevel}
                      onChange={(v) => set('educationLevel', v)}
                      placeholder="Select highest education level"
                    />
                  </div>
                </div>
              )}

              {/* Step 5: Special Criteria */}
              {step === 5 && (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-display text-lg font-bold text-[#0D2240]">
                      Special Entitlement Criteria
                    </h3>
                    <p className="text-xs text-[#44474E] mt-1">
                      Optional, but unlocks targeted grants and priority benefits.
                    </p>
                  </div>

                  <div className="bg-[#F8FAFC] rounded-2xl p-4 border border-[#E2E8F0] divide-y divide-[#E2E8F0]">
                    <ToggleRow
                      label="Persons with Disabilities (PwD / UDID)"
                      why="Unlocks specialized disability welfare and assistive equipment grants"
                      value={form.disabilityStatus}
                      onChange={(v) => set('disabilityStatus', v)}
                    />
                    <ToggleRow
                      label="Below Poverty Line (BPL) / Antyodaya Ration"
                      why="Unlocks food security, housing subsidies, and healthcare waivers"
                      value={form.isBpl}
                      onChange={(v) => set('isBpl', v)}
                    />
                    <ToggleRow
                      label="Minority Community Member"
                      why="Unlocks minority development scholarships and entrepreneurship support"
                      value={form.isMinority}
                      onChange={(v) => set('isMinority', v)}
                    />
                  </div>
                </div>
              )}

              {/* Step 6: Review & Confirm */}
              {step === 6 && (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-display text-lg font-bold text-[#0D2240]">
                      Review &amp; Confirm Snapshot
                    </h3>
                    <p className="text-xs text-[#44474E] mt-1">
                      Verify your demographic details before running the matching engine.
                    </p>
                  </div>

                  <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] divide-y divide-[#E2E8F0] overflow-hidden text-xs">
                    {[
                      ['Date of Birth', form.dateOfBirth || '—'],
                      ['Gender', form.gender || '—'],
                      ['State / District', `${form.state || '—'} ${form.district ? `(${form.district})` : ''}`],
                      ['Annual Income', form.annualIncome ? `₹${Number(form.annualIncome).toLocaleString('en-IN')}` : '—'],
                      ['Occupation', form.occupation || '—'],
                      ['Social Category', form.category || '—'],
                      ['Education Level', form.educationLevel || '—'],
                      [
                        'Special Tags',
                        [
                          form.disabilityStatus ? 'PwD' : null,
                          form.isBpl ? 'BPL' : null,
                          form.isMinority ? 'Minority' : null,
                        ].filter(Boolean).join(', ') || 'None',
                      ],
                    ].map(([label, val]) => (
                      <div key={label} className="flex items-center justify-between px-4 py-2.5">
                        <span className="text-[#44474E] font-medium">{label}</span>
                        <span className="font-bold text-[#0D2240]">{val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Navigation Controls */}
            <div className="flex items-center justify-between gap-3 pt-4 border-t border-[#E2E8F0]">
              <button
                type="button"
                onClick={back}
                disabled={step === 1}
                className="px-5 h-11 rounded-xl text-xs font-bold text-[#0D2240] border border-[#E2E8F0] hover:bg-[#F0F3FF] active:scale-95 disabled:opacity-40 disabled:pointer-events-none transition-all cursor-pointer"
              >
                ← Back
              </button>

              {step < TOTAL_STEPS ? (
                <button
                  type="button"
                  onClick={next}
                  className="px-6 h-11 rounded-xl bg-[#0D2240] hover:bg-[#1A365D] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer"
                >
                  <span>Continue</span>
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleFinish}
                  disabled={saving}
                  className="px-6 h-11 rounded-xl bg-[#E65100] hover:bg-[#FF7722] text-white text-xs font-bold flex items-center gap-1.5 shadow-md active:scale-95 transition-all disabled:opacity-60 cursor-pointer"
                >
                  <span>{saving ? 'Saving Profile Snapshot…' : 'Finish & Discover Schemes'}</span>
                  {!saving && <span className="material-symbols-outlined text-[18px]">verified</span>}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
