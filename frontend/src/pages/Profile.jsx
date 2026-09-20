import { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { getProfile, updateProfile } from '../api/profile'
import { useAuth } from '../context/AuthContext'
import { ProfileSkeleton } from '../components/Skeletons'
import CustomDropdown from '../components/CustomDropdown'
import headshotImg from '../assets/indian-citizen-headshot.png'

const GENDERS = [
  { value: 'MALE', label: 'Male (पुरुष)' },
  { value: 'FEMALE', label: 'Female (महिला)' },
  { value: 'OTHER', label: 'Other (अन्य)' },
]

const CATEGORIES = [
  { value: 'GENERAL', label: 'General / Open (खुला)' },
  { value: 'OBC', label: 'OBC (इतर मागास वर्ग)' },
  { value: 'SC', label: 'SC (अनुसूचित जाती)' },
  { value: 'ST', label: 'ST (अनुसूचित जमाती)' },
  { value: 'EWS', label: 'EWS (आर्थिक दुर्बल घटक)' },
]

const EDUCATION_LEVELS = [
  { value: 'Below 10th', label: 'Below 10th (१०वी पेक्षा कमी)' },
  { value: '10th Pass', label: '10th Pass / SSC (१०वी उत्तीर्ण)' },
  { value: '12th Pass', label: '12th Pass / HSC (१२वी उत्तीर्ण)' },
  { value: 'Diploma', label: 'Diploma / Polytechnic (डिप्लोमा)' },
  { value: 'Graduate', label: 'Graduate / Bachelor Degree (पदवीधर)' },
  { value: 'Postgraduate', label: 'Postgraduate / Master Degree (पदव्युत्तर)' },
  { value: 'Doctorate', label: 'Doctorate / Research / Ph.D (विद्यावाचस्पती)' },
]

const OCCUPATIONS = [
  { value: 'Student', label: 'Student (विद्यार्थी)' },
  { value: 'Farmer', label: 'Farmer / Agricultural Worker (शेतकरी)' },
  { value: 'Self-Employed', label: 'Self-Employed / Entrepreneur / Artisan (स्वयंरोजगार / व्यवसाय)' },
  { value: 'Salaried', label: 'Salaried Professional (वेतनभोगी कर्मचारी)' },
  { value: 'Unemployed', label: 'Unemployed / Job Seeker (बेरोजगार / नोकरी शोधणारा)' },
  { value: 'Homemaker', label: 'Homemaker (गृहिणी)' },
  { value: 'Retired', label: 'Retired / Senior Citizen (सेवानिवृत्त / ज्येष्ठ नागरिक)' },
]

export default function Profile() {
  const { user } = useAuth()
  const [form, setForm] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    const startTime = Date.now()
    let isSettled = false

    const maxSafetyTimer = setTimeout(() => {
      if (!isSettled) setLoading(false)
    }, 1800)

    getProfile()
      .then((data) =>
        setForm({
          dateOfBirth: data.dateOfBirth || '',
          gender: data.gender || '',
          state: data.state || 'Maharashtra',
          district: data.district || '',
          annualIncome: data.annualIncome ?? '',
          occupation: data.occupation || '',
          category: data.category || '',
          educationLevel: data.educationLevel || '',
          disabilityStatus: !!data.disabilityStatus,
          isBpl: !!data.isBpl,
          isMinority: !!data.isMinority,
        })
      )
      .catch(() =>
        setForm({
          dateOfBirth: '',
          gender: '',
          state: 'Maharashtra',
          district: '',
          annualIncome: '',
          occupation: '',
          category: '',
          educationLevel: '',
          disabilityStatus: false,
          isBpl: false,
          isMinority: false,
        })
      )
      .finally(() => {
        const elapsed = Date.now() - startTime
        const remainingMin = Math.max(0, 1000 - elapsed)
        setTimeout(() => {
          isSettled = true
          clearTimeout(maxSafetyTimer)
          setLoading(false)
        }, remainingMin)
      })

    return () => {
      isSettled = true
      clearTimeout(maxSafetyTimer)
    }
  }, [])

  function setField(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  // Profile Completeness Score
  const profileFidelity = useMemo(() => {
    if (!form) return 50
    const keys = [
      'dateOfBirth',
      'gender',
      'state',
      'district',
      'annualIncome',
      'occupation',
      'category',
      'educationLevel',
    ]
    let filled = 0
    keys.forEach((k) => {
      if (form[k] !== '' && form[k] !== null && form[k] !== undefined) filled++
    })
    return Math.round((filled / keys.length) * 100)
  }, [form])

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    setMessage('')
    setError('')
    try {
      await updateProfile({
        ...form,
        annualIncome: form.annualIncome === '' ? null : Number(form.annualIncome),
      })
      setMessage('Profile credentials successfully updated. Your scheme eligibility matches have been refreshed!')
      setTimeout(() => setMessage(''), 6000)
    } catch (err) {
      setError(err.response?.data?.error || 'Could not save profile changes. Please verify required fields.')
    } finally {
      setSaving(false)
    }
  }

  if (loading || !form) return <ProfileSkeleton />

  const displayName = user?.fullName || 'Mohit Gupta'
  const userEmail = user?.email || 'mohit@saarthi.gov.in'

  return (
    <div className="w-full bg-[#F8FAFC] min-h-screen font-sans text-[#111C2D]">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 py-6 space-y-6">
        
        {/* Breadcrumb Context Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-[#44474E] text-xs font-semibold">
          <div className="flex items-center gap-2">
            <Link to="/dashboard" className="hover:text-[#0D2240] transition-colors flex items-center gap-1 font-bold text-[#0D2240]">
              <span className="material-symbols-outlined text-[16px]">account_balance</span>
              <span>Citizen Home</span>
            </Link>
            <span className="text-[#C4C6CE]">/</span>
            <span className="text-[#111C2D]">Citizen Settings</span>
            <span className="text-[#C4C6CE]">/</span>
            <span className="text-[#44474E]">Demographic Profile</span>
          </div>

          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-[#E2E8F0] shadow-xs text-[11px] font-bold text-[#0D2240]">
            <span className="flex h-2 w-2 rounded-full bg-[#138808]" />
            <span>UIDAI &amp; State Linked</span>
          </div>
        </div>

        {/* Top Citizen Identity Hero Banner */}
        <section className="relative overflow-hidden rounded-2xl bg-white border border-[#E2E8F0] shadow-md p-6 lg:p-8">
          {/* Tiranga Civic Top Strip */}
          <div className="absolute top-0 left-0 right-0 h-1.5 grid grid-cols-3">
            <div className="bg-[#E65100] h-full" />
            <div className="bg-white h-full" />
            <div className="bg-[#138808] h-full" />
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              {/* Avatar with Verified Ring */}
              <div className="relative shrink-0">
                <img
                  src={headshotImg}
                  alt={displayName}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 border-white shadow-md"
                />
                <div
                  className="absolute -bottom-1 -right-1 w-7 h-7 rounded-lg bg-[#138808] text-white flex items-center justify-center shadow-sm"
                  title="UIDAI Aadhaar Verified Citizen"
                >
                  <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    verified
                  </span>
                </div>
              </div>

              {/* Identity Metadata */}
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-[#0D2240] tracking-tight">
                    {displayName}
                  </h1>
                  <span className="inline-flex items-center gap-1 text-[#138808] text-[11px] bg-[#EAFBF0] px-2.5 py-0.5 rounded font-bold border border-[#16A34A]/20">
                    Aadhaar Seeded
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-[#44474E] font-medium">
                  {userEmail} • Registered Citizen Profile
                </p>

                <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                  <span className="px-2.5 py-0.5 rounded bg-[#EBF3FC] text-[#0D2240] font-bold">
                    {form.state || 'Maharashtra'}
                  </span>
                  <span className="px-2.5 py-0.5 rounded bg-[#FFF3EB] text-[#E65100] font-bold">
                    {form.category || 'OBC / General'}
                  </span>
                  <span className="px-2.5 py-0.5 rounded bg-[#F0F3FF] text-[#44474E] font-medium">
                    {form.occupation || 'Student'}
                  </span>
                </div>
              </div>
            </div>

            {/* Profile Fidelity Card */}
            <div className="bg-[#F0F3FF] border border-[#DEE8FF] rounded-xl p-4 sm:p-5 lg:min-w-[280px] shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-[#44474E]">Profile Completeness</span>
                <span className="font-display text-lg font-black text-[#0D2240]">{profileFidelity}%</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-[#DEE8FF] overflow-hidden mb-2">
                <div
                  className="h-full bg-[#0D2240] rounded-full transition-all duration-500"
                  style={{ width: `${profileFidelity}%` }}
                />
              </div>
              <p className="text-[11px] text-[#44474E]">
                {profileFidelity >= 85
                  ? 'High profile fidelity. Maximum welfare schemes unlocked.'
                  : 'Complete missing fields to evaluate eligibility for all welfare schemes.'}
              </p>
            </div>
          </div>
        </section>

        {/* Notifications & Feedback */}
        {message && (
          <div className="p-4 rounded-xl bg-[#EAFBF0] border border-[#16A34A]/30 text-xs sm:text-sm text-[#138808] flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2 font-bold">
              <span className="material-symbols-outlined text-[20px]">check_circle</span>
              <span>{message}</span>
            </div>
            <button
              onClick={() => setMessage('')}
              className="text-[#138808]/70 hover:text-[#138808] font-bold cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {error && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs sm:text-sm text-red-700 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2 font-bold">
              <span className="material-symbols-outlined text-[20px]">error</span>
              <span>{error}</span>
            </div>
            <button
              onClick={() => setError('')}
              className="text-red-400 hover:text-red-700 font-bold cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {/* 12-Column Responsive Workspace Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT: 8 Columns - Demographic Edit Form */}
          <div className="lg:col-span-8 bg-white rounded-2xl border border-[#E2E8F0] shadow-md p-6 sm:p-8">
            <form onSubmit={handleSave} className="space-y-8">
              
              {/* SECTION 1: Personal Demographics & Domicile */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-[#E2E8F0]">
                  <span className="material-symbols-outlined text-[#0D2240] text-[20px]">badge</span>
                  <h2 className="font-display text-base font-bold text-[#0D2240]">
                    1. Personal Demographics &amp; Domicile
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Date of Birth */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-[#0D2240]" htmlFor="dob">
                      Date of Birth (जन्म तारीख)
                    </label>
                    <div className="relative flex items-center">
                      <span className="material-symbols-outlined absolute left-3.5 text-[18px] text-slate-400 pointer-events-none">
                        calendar_month
                      </span>
                      <input
                        id="dob"
                        type="date"
                        value={form.dateOfBirth}
                        onChange={(e) => setField('dateOfBirth', e.target.value)}
                        className="w-full h-11 pl-10 pr-3.5 bg-[#F0F3FF] border border-[#DEE8FF] rounded-xl text-xs sm:text-sm font-medium text-[#111C2D] focus:bg-white focus:border-[#0D2240] focus:ring-2 focus:ring-[#0D2240]/10 focus:outline-none transition-all"
                      />
                    </div>
                  </div>

                  {/* Gender */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-[#0D2240]" htmlFor="gender">
                      Gender (लिंग)
                    </label>
                    <CustomDropdown
                      id="gender"
                      value={form.gender}
                      onChange={(val) => setField('gender', val)}
                      options={GENDERS}
                      placeholder="Select Gender"
                      icon="person"
                      variant="form"
                      clearable
                    />
                  </div>

                  {/* State of Domicile */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-[#0D2240]" htmlFor="state">
                      State of Permanent Domicile (अधिवास राज्य)
                    </label>
                    <div className="relative flex items-center">
                      <span className="material-symbols-outlined absolute left-3.5 text-[18px] text-slate-400 pointer-events-none">
                        location_on
                      </span>
                      <input
                        id="state"
                        type="text"
                        value={form.state}
                        onChange={(e) => setField('state', e.target.value)}
                        placeholder="e.g. Maharashtra"
                        className="w-full h-11 pl-10 pr-3.5 bg-[#F0F3FF] border border-[#DEE8FF] rounded-xl text-xs sm:text-sm font-medium text-[#111C2D] focus:bg-white focus:border-[#0D2240] focus:ring-2 focus:ring-[#0D2240]/10 focus:outline-none transition-all"
                      />
                    </div>
                  </div>

                  {/* District */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-[#0D2240]" htmlFor="district">
                      District (जिल्हा)
                    </label>
                    <div className="relative flex items-center">
                      <span className="material-symbols-outlined absolute left-3.5 text-[18px] text-slate-400 pointer-events-none">
                        apartment
                      </span>
                      <input
                        id="district"
                        type="text"
                        value={form.district}
                        onChange={(e) => setField('district', e.target.value)}
                        placeholder="e.g. Pune, Nagpur, Mumbai"
                        className="w-full h-11 pl-10 pr-3.5 bg-[#F0F3FF] border border-[#DEE8FF] rounded-xl text-xs sm:text-sm font-medium text-[#111C2D] focus:bg-white focus:border-[#0D2240] focus:ring-2 focus:ring-[#0D2240]/10 focus:outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 2: Economic & Social Credentials */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-[#E2E8F0]">
                  <span className="material-symbols-outlined text-[#0D2240] text-[20px]">account_balance_wallet</span>
                  <h2 className="font-display text-base font-bold text-[#0D2240]">
                    2. Economic &amp; Social Credentials
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Annual Household Income */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-[#0D2240]" htmlFor="income">
                      Annual Family Income (वार्षिक उत्पन्न ₹)
                    </label>
                    <div className="relative flex items-center">
                      <span className="material-symbols-outlined absolute left-3.5 text-[18px] text-[#138808] pointer-events-none">
                        currency_rupee
                      </span>
                      <input
                        id="income"
                        type="number"
                        min="0"
                        step="1000"
                        value={form.annualIncome}
                        onChange={(e) => setField('annualIncome', e.target.value)}
                        placeholder="e.g. 180000"
                        className="w-full h-11 pl-10 pr-3.5 bg-[#F0F3FF] border border-[#DEE8FF] rounded-xl text-xs sm:text-sm font-medium text-[#111C2D] focus:bg-white focus:border-[#0D2240] focus:ring-2 focus:ring-[#0D2240]/10 focus:outline-none transition-all"
                      />
                    </div>
                  </div>

                  {/* Occupation */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-[#0D2240]" htmlFor="occupation">
                      Occupation (व्यवसाय)
                    </label>
                    <CustomDropdown
                      id="occupation"
                      value={form.occupation}
                      onChange={(val) => setField('occupation', val)}
                      options={OCCUPATIONS}
                      placeholder="Select Occupation"
                      icon="work"
                      variant="form"
                      clearable
                    />
                  </div>

                  {/* Social Category */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-[#0D2240]" htmlFor="category">
                      Social Category / Caste Group (प्रवर्ग)
                    </label>
                    <CustomDropdown
                      id="category"
                      value={form.category}
                      onChange={(val) => setField('category', val)}
                      options={CATEGORIES}
                      placeholder="Select Category"
                      icon="groups"
                      variant="form"
                      clearable
                    />
                  </div>

                  {/* Education Level */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-[#0D2240]" htmlFor="education">
                      Highest Education Level (शिक्षण पातळी)
                    </label>
                    <CustomDropdown
                      id="education"
                      value={form.educationLevel}
                      onChange={(val) => setField('educationLevel', val)}
                      options={EDUCATION_LEVELS}
                      placeholder="Select Education Level"
                      icon="school"
                      variant="form"
                      clearable
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 3: Welfare Quotas & Entitlement Attributes */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-[#E2E8F0]">
                  <span className="material-symbols-outlined text-[#0D2240] text-[20px]">checklist_rtl</span>
                  <h2 className="font-display text-base font-bold text-[#0D2240]">
                    3. Welfare Quotas &amp; Special Entitlements
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  {/* Disability Status */}
                  <label className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                    form.disabilityStatus
                      ? 'bg-[#FFF3EB] border-[#E65100]/40 shadow-xs'
                      : 'bg-[#F8FAFC] border-[#E2E8F0] hover:bg-[#F0F3FF]'
                  }`}>
                    <div className="flex items-start justify-between">
                      <div className="w-9 h-9 rounded-lg bg-[#EBF3FC] text-[#0D2240] flex items-center justify-center">
                        <span className="material-symbols-outlined text-[20px]">accessible</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={form.disabilityStatus}
                        onChange={(e) => setField('disabilityStatus', e.target.checked)}
                        className="w-4 h-4 rounded text-[#E65100] focus:ring-[#E65100] cursor-pointer"
                      />
                    </div>
                    <div>
                      <span className="block text-xs font-bold text-[#0D2240]">
                        Person with Disability (Divyangjan)
                      </span>
                      <span className="block text-[11px] text-[#44474E] mt-0.5">
                        Qualify for assistive aid and fee concessions
                      </span>
                    </div>
                  </label>

                  {/* Below Poverty Line (BPL) */}
                  <label className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                    form.isBpl
                      ? 'bg-[#FFF3EB] border-[#E65100]/40 shadow-xs'
                      : 'bg-[#F8FAFC] border-[#E2E8F0] hover:bg-[#F0F3FF]'
                  }`}>
                    <div className="flex items-start justify-between">
                      <div className="w-9 h-9 rounded-lg bg-[#EAFBF0] text-[#138808] flex items-center justify-center">
                        <span className="material-symbols-outlined text-[20px]">receipt_long</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={form.isBpl}
                        onChange={(e) => setField('isBpl', e.target.checked)}
                        className="w-4 h-4 rounded text-[#E65100] focus:ring-[#E65100] cursor-pointer"
                      />
                    </div>
                    <div>
                      <span className="block text-xs font-bold text-[#0D2240]">
                        Below Poverty Line (BPL / Yellow Card)
                      </span>
                      <span className="block text-[11px] text-[#44474E] mt-0.5">
                        Priority subsidies and food grain quotas
                      </span>
                    </div>
                  </label>

                  {/* Minority Status */}
                  <label className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                    form.isMinority
                      ? 'bg-[#FFF3EB] border-[#E65100]/40 shadow-xs'
                      : 'bg-[#F8FAFC] border-[#E2E8F0] hover:bg-[#F0F3FF]'
                  }`}>
                    <div className="flex items-start justify-between">
                      <div className="w-9 h-9 rounded-lg bg-[#FFF3EB] text-[#E65100] flex items-center justify-center">
                        <span className="material-symbols-outlined text-[20px]">diversity_3</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={form.isMinority}
                        onChange={(e) => setField('isMinority', e.target.checked)}
                        className="w-4 h-4 rounded text-[#E65100] focus:ring-[#E65100] cursor-pointer"
                      />
                    </div>
                    <div>
                      <span className="block text-xs font-bold text-[#0D2240]">
                        Religious / Linguistic Minority
                      </span>
                      <span className="block text-[11px] text-[#44474E] mt-0.5">
                        Special scholarships and coaching schemes
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Action Submit Button */}
              <div className="pt-4 border-t border-[#E2E8F0] flex flex-col sm:flex-row items-center justify-between gap-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full sm:w-auto px-8 py-3 rounded-xl bg-[#0D2240] hover:bg-[#1A365D] text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  <span className={`material-symbols-outlined text-[18px] ${saving ? 'animate-spin' : ''}`}>
                    {saving ? 'sync' : 'save'}
                  </span>
                  <span>{saving ? 'Saving Credentials...' : 'Save & Refresh Eligibility'}</span>
                </button>

                <Link
                  to="/dashboard"
                  className="text-xs font-bold text-[#0D2240] hover:text-[#E65100] transition-colors flex items-center gap-1"
                >
                  <span>Return to Citizen Dashboard</span>
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </Link>
              </div>
            </form>
          </div>

          {/* RIGHT: 4 Columns - Guidance & Linkage Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            {/* Real-Time Impact Card */}
            <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#EAFBF0] text-[#138808] flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[22px]">hub</span>
                </div>
                <div>
                  <h3 className="font-display text-sm font-bold text-[#0D2240]">
                    Direct Eligibility Impact
                  </h3>
                  <p className="text-[11px] text-[#44474E]">
                    Real-time evaluation against 52+ schemes
                  </p>
                </div>
              </div>

              <p className="text-xs text-[#44474E] leading-relaxed">
                Changes saved to your profile credentials immediately trigger a fresh evaluation run across both Central and Maharashtra welfare catalogs.
              </p>

              <div className="space-y-2.5 pt-2 border-t border-[#E2E8F0] text-xs">
                <div className="flex items-start gap-2 text-[#44474E]">
                  <span className="material-symbols-outlined text-[#138808] text-[16px] shrink-0 mt-0.5">check_circle</span>
                  <span>Higher Education fee waivers &amp; scholarship matching</span>
                </div>
                <div className="flex items-start gap-2 text-[#44474E]">
                  <span className="material-symbols-outlined text-[#138808] text-[16px] shrink-0 mt-0.5">check_circle</span>
                  <span>Direct DBT subsidies &amp; income ceiling clearances</span>
                </div>
                <div className="flex items-start gap-2 text-[#44474E]">
                  <span className="material-symbols-outlined text-[#138808] text-[16px] shrink-0 mt-0.5">check_circle</span>
                  <span>Special category and district quota entitlements</span>
                </div>
              </div>
            </div>

            {/* DigiLocker & Identity Vault */}
            <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#0D2240] text-white flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[22px]">cloud_sync</span>
                </div>
                <div>
                  <h3 className="font-display text-sm font-bold text-[#0D2240]">
                    DigiLocker Integration
                  </h3>
                  <p className="text-[11px] text-[#44474E]">
                    Paperless document verification
                  </p>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]">
                  <span className="font-semibold text-[#0D2240]">Aadhaar Card (UIDAI)</span>
                  <span className="text-[#138808] font-bold text-[11px]">Linked</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]">
                  <span className="font-semibold text-[#0D2240]">Maharashtra Domicile</span>
                  <span className="text-[#138808] font-bold text-[11px]">Verified</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]">
                  <span className="font-semibold text-[#0D2240]">Current FY Income Certificate</span>
                  <span className="text-[#D97706] font-bold text-[11px]">In Review</span>
                </div>
              </div>

              <Link
                to="/checklist"
                className="block text-center w-full py-2.5 rounded-xl bg-[#F0F3FF] hover:bg-[#EBF3FC] text-[#0D2240] text-xs font-bold transition-colors"
              >
                Manage Document Checklist →
              </Link>
            </div>

            {/* Citizen Helpline Advisory */}
            <div className="rounded-2xl bg-[#FFF3EB] border border-[#E65100]/20 p-5 flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#E65100] text-white flex items-center justify-center shrink-0 shadow-xs">
                <span className="material-symbols-outlined text-[22px]">help</span>
              </div>
              <div className="flex flex-col text-xs">
                <span className="font-bold text-[#0D2240]">Need Help Updating Credentials?</span>
                <span className="text-[#44474E] text-[11px] mt-0.5">
                  Call Citizen Support toll-free at <strong>1800-120-8040</strong> or ask the AI Assistant.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
