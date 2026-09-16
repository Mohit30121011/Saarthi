import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { updateProfile } from '../../api/profile'
import { STATE_DISTRICTS, getDistrictsForState } from '../../data/indianDistricts'
import onboardingHero from '../../assets/onboarding-hero.png'
import emblemIndia from '../../assets/emblem-india.svg'

const TOTAL_STEPS = 6

const STEP_TITLES = [
  'Personal details',
  'Location',
  'Income & occupation',
  'Category & education',
  'Special criteria',
  'Review & confirm',
]

const GENDERS = ['MALE', 'FEMALE', 'OTHER']
const CATEGORIES = ['GENERAL', 'OBC', 'SC', 'ST', 'EWS']
const EDUCATION_LEVELS = ['Below 10th', '10th', '12th', 'Diploma', 'Graduate', 'Post Graduate', 'Doctorate']
const OCCUPATIONS = ['Student', 'Farmer', 'Self-Employed', 'Salaried', 'Unemployed', 'Homemaker', 'Retired']
const INDIAN_STATES = Object.keys(STATE_DISTRICTS)

function CustomSelect({ options = [], value, onChange, placeholder = 'Select an option', disabled = false }) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const dropdownRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const filtered = options.filter((opt) =>
    opt.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          if (disabled) return
          setOpen(!open)
          setSearch('')
        }}
        className={`w-full flex items-center justify-between rounded-xl px-3.5 h-11.5 border transition-all text-left ${
          disabled
            ? 'bg-slate-100/70 border-slate-200 text-slate-400 cursor-not-allowed opacity-75'
            : open
            ? 'border-[#156f45] ring-2 ring-[#156f45]/20 bg-white cursor-pointer'
            : 'bg-[#EDF3FC] border-transparent hover:border-emerald-300 cursor-pointer'
        }`}
      >
        <span className={`text-sm font-medium truncate pr-2 ${value ? 'text-slate-900' : 'text-slate-400'}`}>
          {value || placeholder}
        </span>
        <svg
          className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ${
            open ? 'rotate-180 text-[#156f45]' : ''
          }`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Floating custom dropdown menu */}
      {open && !disabled && (
        <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 bg-white rounded-2xl shadow-[0_20px_45px_rgba(0,0,0,0.16)] border border-slate-100 p-2">
          {options.length > 7 && (
            <div className="px-1 pb-2 border-b border-slate-100 mb-1">
              <div className="relative flex items-center bg-[#F1F5F9] rounded-lg px-2.5 h-8">
                <svg className="w-3.5 h-3.5 text-slate-400 mr-2 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 105.65 5.65a7.5 7.5 0 0010.7 10.7z" />
                </svg>
                <input
                  type="text"
                  placeholder="Type to search..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  autoFocus
                  className="w-full bg-transparent border-none outline-none text-xs text-slate-800 placeholder-slate-400 p-0 focus:ring-0"
                />
              </div>
            </div>
          )}

          <div className="max-h-52 overflow-y-auto space-y-0.5 pr-1 text-xs">
            {filtered.length === 0 ? (
              <div className="px-3 py-3 text-slate-400 text-center">No options match "{search}"</div>
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
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl font-medium transition-all text-left cursor-pointer ${
                      isSelected
                        ? 'bg-[#ECFDF5] text-[#156f45] font-bold'
                        : 'text-slate-700 hover:bg-[#F8FAFC] hover:text-slate-950'
                    }`}
                  >
                    <span>{opt}</span>
                    {isSelected && (
                      <svg className="w-4 h-4 text-[#156f45] shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
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


function StepProgressBar({ step }) {
  return (
    <div className="mb-5">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[11px] font-bold text-[#156f45] uppercase tracking-wider">
          Step {step} of {TOTAL_STEPS}
        </span>
        <span className="text-[11px] font-semibold text-slate-500">
          {STEP_TITLES[step - 1]}
        </span>
      </div>
      <div className="flex gap-1.5 h-1.5 w-full">
        {Array.from({ length: TOTAL_STEPS }, (_, i) => (
          <div
            key={i}
            className={`flex-1 rounded-full transition-all duration-300 ${
              i + 1 < step
                ? 'bg-[#156f45]'
                : i + 1 === step
                ? 'bg-[#f59e0b]'
                : 'bg-slate-200'
            }`}
          />
        ))}
      </div>
    </div>
  )
}

function ChipGroup({ options, value, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all duration-150 cursor-pointer ${
            value === opt
              ? 'bg-[#156f45] text-white border-[#156f45] shadow-sm'
              : 'bg-[#EDF3FC] text-slate-700 border-transparent hover:border-emerald-300 hover:bg-emerald-50/70'
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  )
}

function ToggleRow({ label, why, value, onChange }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-slate-100 last:border-0">
      <div>
        <p className="text-xs font-semibold text-slate-800">{label}</p>
        {why && <p className="text-[11px] text-slate-400 mt-0.5">{why}</p>}
      </div>
      <button
        type="button"
        onClick={() => onChange(!value)}
        className={`w-11 h-6 rounded-full relative transition-colors duration-200 shrink-0 cursor-pointer ${
          value ? 'bg-[#156f45]' : 'bg-slate-200'
        }`}
      >
        <span
          className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
            value ? 'translate-x-5.5' : 'translate-x-0.5'
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
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.error || 'Could not save your profile. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[#F2F7F2] font-sans selection:bg-[#156f45]/20 selection:text-[#10241A]">
      
      {/* LEFT: Full-Bleed Hero Artwork (Single seamless container, zero padding) */}
      <div className="relative w-full lg:w-[60%] xl:w-[62%] min-h-[420px] sm:min-h-[540px] lg:min-h-screen overflow-hidden bg-[#E9F3EB]">
        <img
          src={onboardingHero}
          alt="Saarthi - A Brighter Tomorrow Together"
          className="w-full h-full object-cover object-left"
        />
      </div>

      {/* RIGHT: 40% Clean Onboarding Wizard Pane */}
      <div className="w-full lg:w-[40%] xl:w-[38%] min-h-screen bg-white flex flex-col justify-center items-center p-6 sm:p-8 xl:p-12 z-10 shadow-[-12px_0_35px_rgba(0,0,0,0.04)] border-l border-slate-100 overflow-y-auto">
        <div className="w-full max-w-[460px] my-auto flex flex-col justify-between py-2">
          
          {/* Top Row: Citizen Portal Badge + Indian Emblem */}
          <div className="flex items-center justify-between gap-3 mb-4">
            {/* Verified Citizen Portal Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ECFDF5] border border-emerald-200/80 text-[11px] font-semibold text-[#047857] shadow-sm">
              <svg className="w-3.5 h-3.5 fill-[#10B981] text-white" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Verified Citizen Portal</span>
            </div>

            {/* State Emblem of India */}
            <div className="flex items-center gap-2 text-right">
              <img
                src={emblemIndia}
                alt="National Emblem"
                className="h-9 w-auto object-contain opacity-85"
              />
              <div className="flex flex-col text-left leading-tight">
                <span className="text-[10px] font-bold text-slate-800 tracking-tight">Government of India</span>
                <span className="text-[9.5px] font-semibold text-slate-500 font-devanagari">भारत सरकार</span>
              </div>
            </div>
          </div>

          {/* Step Progress Bar */}
          <StepProgressBar step={step} />

          {/* Error Notice */}
          {error && (
            <div className="mb-4 rounded-xl bg-red-50 border-l-4 border-red-500 p-3 text-xs text-red-700 flex items-center justify-between" role="alert">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-red-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span>{error}</span>
              </div>
              <button onClick={() => setError('')} className="text-red-400 hover:text-red-600 font-bold ml-2">×</button>
            </div>
          )}

          {/* Wizard Steps Form */}
          <div className="min-h-[260px] flex flex-col justify-center">
            {/* Step 1: Personal Details */}
            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-2xl sm:text-[26px] font-black text-slate-900 tracking-tight">
                    Tell us about you
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Helps us identify age- or gender-specific scheme eligibility.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1.5" htmlFor="dob">
                    Date of birth
                  </label>
                  <div className="relative flex items-center bg-[#EDF3FC] rounded-xl px-3.5 h-11.5 border border-transparent focus-within:border-[#156f45] focus-within:ring-2 focus-within:ring-[#156f45]/20 transition-all">
                    <input
                      id="dob"
                      type="date"
                      value={form.dateOfBirth}
                      onChange={(e) => set('dateOfBirth', e.target.value)}
                      className="w-full bg-transparent border-none outline-none text-sm text-slate-900 font-medium p-0 focus:ring-0"
                    />
                  </div>
                  <p className="text-[10.5px] text-slate-400 mt-1">Used to calculate your age against scheme requirements</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-2">
                    Gender
                  </label>
                  <ChipGroup options={GENDERS} value={form.gender} onChange={(v) => set('gender', v)} />
                </div>
              </div>
            )}

            {/* Step 2: Location */}
            {step === 2 && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-2xl sm:text-[26px] font-black text-slate-900 tracking-tight">
                    Where do you live?
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Many schemes are state-specific — this unlocks regional matches.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                    State / UT
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
                    placeholder="Select your state or UT"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                    District
                  </label>
                  <CustomSelect
                    options={getDistrictsForState(form.state)}
                    value={form.district}
                    onChange={(val) => set('district', val)}
                    disabled={!form.state}
                    placeholder={form.state ? 'Select official district' : 'Select a state first'}
                  />
                  {form.state ? (
                    <p className="text-[10.5px] text-slate-400 mt-1">
                      Showing official districts of {form.state} ({getDistrictsForState(form.state).length} districts)
                    </p>
                  ) : (
                    <p className="text-[10.5px] text-amber-600 mt-1 font-medium">
                      Please select your State / UT first to see official districts
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Step 3: Income & Occupation */}
            {step === 3 && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-2xl sm:text-[26px] font-black text-slate-900 tracking-tight">
                    Income &amp; occupation
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Many schemes have income ceilings — unlocks targeted financial benefits.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1.5" htmlFor="income">
                    Annual family income (₹)
                  </label>
                  <div className="relative flex items-center bg-[#EDF3FC] rounded-xl px-3.5 h-11.5 border border-transparent focus-within:border-[#156f45] focus-within:ring-2 focus-within:ring-[#156f45]/20 transition-all">
                    <span className="text-slate-400 font-bold text-sm mr-2">₹</span>
                    <input
                      id="income"
                      type="number"
                      min="0"
                      placeholder="e.g. 250000"
                      value={form.annualIncome}
                      onChange={(e) => set('annualIncome', e.target.value)}
                      className="w-full bg-transparent border-none outline-none text-sm text-slate-900 placeholder-slate-400 font-medium p-0 focus:ring-0"
                    />
                  </div>
                  <p className="text-[10.5px] text-slate-400 mt-1">Total household income before deductions</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-2">
                    Occupation
                  </label>
                  <ChipGroup options={OCCUPATIONS} value={form.occupation} onChange={(v) => set('occupation', v)} />
                </div>
              </div>
            )}

            {/* Step 4: Category & Education */}
            {step === 4 && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-2xl sm:text-[26px] font-black text-slate-900 tracking-tight">
                    Category &amp; education
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Helps match affirmative action, scholarships, and skill development schemes.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-2">
                    Social category
                  </label>
                  <ChipGroup options={CATEGORIES} value={form.category} onChange={(v) => set('category', v)} />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                    Highest education level
                  </label>
                  <CustomSelect
                    options={EDUCATION_LEVELS}
                    value={form.educationLevel}
                    onChange={(val) => set('educationLevel', val)}
                    placeholder="Select education level"
                  />
                </div>
              </div>
            )}

            {/* Step 5: Special Criteria */}
            {step === 5 && (
              <div className="space-y-3">
                <div>
                  <h2 className="text-2xl sm:text-[26px] font-black text-slate-900 tracking-tight">
                    Special criteria
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Optional, but these unlock high-priority subsidized schemes.
                  </p>
                </div>

                <div className="bg-[#EDF3FC]/50 rounded-2xl p-3 border border-slate-100 divide-y divide-slate-100">
                  <ToggleRow
                    label="Persons with Disabilities (PwD)"
                    why="Unlocks specialized disability welfare and equipment grants"
                    value={form.disabilityStatus}
                    onChange={(v) => set('disabilityStatus', v)}
                  />
                  <ToggleRow
                    label="Below Poverty Line (BPL) / Antyodaya"
                    why="Unlocks ration subsidies, housing, and healthcare aid"
                    value={form.isBpl}
                    onChange={(v) => set('isBpl', v)}
                  />
                  <ToggleRow
                    label="Minority Community"
                    why="Unlocks minority scholarships and entrepreneurship support"
                    value={form.isMinority}
                    onChange={(v) => set('isMinority', v)}
                  />
                </div>
              </div>
            )}

            {/* Step 6: Review & Confirm */}
            {step === 6 && (
              <div className="space-y-3">
                <div>
                  <h2 className="text-2xl sm:text-[26px] font-black text-slate-900 tracking-tight">
                    Review &amp; confirm
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Verify your details before discovering matching schemes.
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-100 bg-[#EDF3FC]/40 divide-y divide-slate-100 overflow-hidden text-xs">
                  {[
                    ['Date of birth', form.dateOfBirth || '—'],
                    ['Gender', form.gender || '—'],
                    ['State / District', `${form.state || '—'} ${form.district ? `(${form.district})` : ''}`],
                    ['Annual income', form.annualIncome ? `₹${Number(form.annualIncome).toLocaleString('en-IN')}` : '—'],
                    ['Occupation', form.occupation || '—'],
                    ['Category', form.category || '—'],
                    ['Education', form.educationLevel || '—'],
                    [
                      'Special tags',
                      [
                        form.disabilityStatus ? 'PwD' : null,
                        form.isBpl ? 'BPL' : null,
                        form.isMinority ? 'Minority' : null,
                      ].filter(Boolean).join(', ') || 'None',
                    ],
                  ].map(([label, val]) => (
                    <div key={label} className="flex items-center justify-between px-3.5 py-2">
                      <span className="text-slate-500">{label}</span>
                      <span className="font-semibold text-slate-800">{val}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between gap-3 mt-6 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={back}
              disabled={step === 1}
              className="px-5 h-11 rounded-full text-xs font-semibold text-slate-600 border border-slate-200 hover:bg-slate-50 active:scale-[0.99] disabled:opacity-40 disabled:pointer-events-none transition-all cursor-pointer"
            >
              ← Back
            </button>

            {step < TOTAL_STEPS ? (
              <button
                type="button"
                onClick={next}
                className="px-6 h-11 rounded-full bg-[#156f45] hover:bg-[#115e3b] active:scale-[0.99] text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-[#156f45]/20 transition-all cursor-pointer"
              >
                <span>Continue</span>
                <span className="text-sm">→</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinish}
                disabled={saving}
                className="px-6 h-11 rounded-full bg-[#156f45] hover:bg-[#115e3b] active:scale-[0.99] text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-[#156f45]/20 transition-all disabled:opacity-60 cursor-pointer"
              >
                <span>{saving ? 'Saving profile…' : 'Finish & see my schemes'}</span>
                {!saving && <span className="text-sm">✓</span>}
              </button>
            )}
          </div>

          {/* Trust Badges Row */}
          <div className="flex items-center justify-between gap-2 mt-5 pt-3.5 border-t border-slate-100 text-[10px] text-slate-500 font-medium">
            <div className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-[#156f45]" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              <span>Secure &amp; Encrypted</span>
            </div>

            <div className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-[#156f45]" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
              <span>Aadhaar Compatible</span>
            </div>

            <div className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-[#156f45]" fill="currentColor" viewBox="0 0 20 20">
                <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h3a1 1 0 100-2H9z" clipRule="evenodd" />
              </svg>
              <span>PAN &amp; Ration Card</span>
            </div>
          </div>

          {/* Decorative Bottom: Monuments Watermark & Tricolor Wave Script */}
          <div className="mt-4 pt-1 flex items-end justify-between relative select-none pointer-events-none">
            {/* Left: Indian Monuments Line Art Silhouette */}
            <div className="opacity-25 text-emerald-800">
              <svg className="h-9 w-auto" viewBox="0 0 240 50" fill="none" stroke="currentColor" strokeWidth="1.2">
                <path d="M10 50 L14 15 L18 50 M12 35 H16 M13 25 H15" />
                <path d="M30 50 V20 H58 V50 M38 50 V32 Q44 26 50 32 V50 M32 17 H56 M36 12 H52 V17" />
                <path d="M70 50 V28 H76 V50 M82 50 V28 H88 V50 M70 28 Q79 20 88 28" />
                <path d="M110 50 V18 L112 50 M111 28 H111.5" />
                <path d="M118 50 V30 H142 V50 M124 50 V38 Q130 32 136 38 V50 M122 30 Q130 14 138 30 M130 14 V8" />
                <path d="M150 50 V18 L148 50 M149 28 H148.5" />
                <path d="M165 50 V32 H172 V28 H178 V32 H185 V28 H191 V32 H198 V50" />
                <path d="M178 28 Q184.5 22 191 28 M184.5 22 V18" />
                <path d="M210 50 Q220 25 225 50 M215 50 Q225 30 235 50" />
              </svg>
            </div>

            {/* Right: Tricolor Wave + Calligraphy */}
            <div className="flex flex-col items-end">
              <span className="font-caveat text-xl sm:text-2xl text-slate-800/90 tracking-wide -mb-1 rotate-[-2deg]">
                A Better Tomorrow Together
              </span>
              
              <svg className="w-28 sm:w-32 h-6" viewBox="0 0 140 24" fill="none">
                <path
                  d="M0 8 C30 18, 70 2, 105 10 C120 14, 135 8, 140 6"
                  stroke="#FF9933"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                <path
                  d="M0 12 C30 22, 70 6, 105 14 C120 18, 135 12, 140 10"
                  stroke="#E2E8F0"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                />
                <path
                  d="M0 16 C30 26, 70 10, 105 18 C120 22, 135 16, 140 14"
                  stroke="#138808"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>

        </div>
      </div>

    </div>
  )
}
