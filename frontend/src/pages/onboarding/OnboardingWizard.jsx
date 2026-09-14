import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { updateProfile } from '../../api/profile'

const TOTAL_STEPS = 6

const GENDERS = ['MALE', 'FEMALE', 'OTHER']
const CATEGORIES = ['GENERAL', 'OBC', 'SC', 'ST', 'EWS']
const EDUCATION_LEVELS = ['Below 10th', '10th', '12th', 'Diploma', 'Graduate', 'Post Graduate', 'Doctorate']
const OCCUPATIONS = ['Student', 'Farmer', 'Self-Employed', 'Salaried', 'Unemployed', 'Homemaker', 'Retired']
const INDIAN_STATES = [
  'Andhra Pradesh', 'Bihar', 'Gujarat', 'Karnataka', 'Kerala', 'Madhya Pradesh',
  'Maharashtra', 'Punjab', 'Rajasthan', 'Tamil Nadu', 'Uttar Pradesh', 'West Bengal',
]

function StepProgress({ step }) {
  return (
    <div className="mb-8">
      <div className="flex gap-2 mb-2">
        {Array.from({ length: TOTAL_STEPS }, (_, i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full ${
              i + 1 < step ? 'bg-saarthi-green' : i + 1 === step ? 'bg-saarthi-saffron' : 'bg-saarthi-border'
            }`}
          />
        ))}
      </div>
      <p className="text-[13px] text-saarthi-muted">Step {step} of {TOTAL_STEPS}</p>
    </div>
  )
}

function FieldLabel({ children, why }) {
  return (
    <div className="mb-1.5">
      <label className="text-sm font-semibold text-saarthi-ink block">{children}</label>
      {why && <p className="text-[12px] text-saarthi-muted mt-0.5">{why}</p>}
    </div>
  )
}

const inputClass =
  'w-full h-[52px] px-4.5 rounded-[16px] bg-saarthi-bg border-[1.5px] border-saarthi-border text-saarthi-ink placeholder-saarthi-muted text-sm sm:text-[15px] transition duration-150 saarthi-input-focus'

function ChipGroup({ options, value, onChange }) {
  return (
    <div className="flex flex-wrap gap-2.5">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          className={`px-4 py-2.5 rounded-full text-sm font-medium border transition-all ${
            value === opt
              ? 'bg-saarthi-green text-white border-saarthi-green'
              : 'bg-white text-saarthi-body border-saarthi-border hover:border-saarthi-green/50'
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
    <div className="flex items-center justify-between py-3 border-b border-saarthi-border last:border-0">
      <div>
        <p className="text-sm font-medium text-saarthi-ink">{label}</p>
        {why && <p className="text-[12px] text-saarthi-muted mt-0.5">{why}</p>}
      </div>
      <button
        type="button"
        onClick={() => onChange(!value)}
        className={`w-12 h-7 rounded-full relative transition-colors shrink-0 ${value ? 'bg-saarthi-green' : 'bg-saarthi-border'}`}
      >
        <span className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-transform ${value ? 'translate-x-6' : 'translate-x-1'}`} />
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
    <div className="min-h-screen bg-saarthi-bg flex items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-xl bg-white rounded-[32px] shadow-saarthi-card p-7 sm:p-10">
        <StepProgress step={step} />

        {error && (
          <div className="mb-6 rounded-2xl bg-saarthi-alert-bg border-l-[4px] border-saarthi-error p-3.5 text-sm text-saarthi-ink">
            {error}
          </div>
        )}

        {step === 1 && (
          <div className="space-y-5">
            <h2 className="font-fraunces text-2xl sm:text-[32px] font-bold text-saarthi-ink">Tell us about you</h2>
            <p className="text-sm text-saarthi-body -mt-3">This helps us find schemes with age- or gender-specific eligibility.</p>
            <div>
              <FieldLabel why="Used to calculate your age against scheme eligibility criteria">Date of birth</FieldLabel>
              <input type="date" className={inputClass} value={form.dateOfBirth} onChange={(e) => set('dateOfBirth', e.target.value)} />
            </div>
            <div>
              <FieldLabel>Gender</FieldLabel>
              <ChipGroup options={GENDERS} value={form.gender} onChange={(v) => set('gender', v)} />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <h2 className="font-fraunces text-2xl sm:text-[32px] font-bold text-saarthi-ink">Where do you live?</h2>
            <p className="text-sm text-saarthi-body -mt-3">Some schemes are state-specific — this unlocks those matches.</p>
            <div>
              <FieldLabel>State</FieldLabel>
              <select className={inputClass} value={form.state} onChange={(e) => set('state', e.target.value)}>
                <option value="">Select state</option>
                {INDIAN_STATES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <FieldLabel>District</FieldLabel>
              <input type="text" className={inputClass} placeholder="e.g. Pune" value={form.district} onChange={(e) => set('district', e.target.value)} />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-5">
            <h2 className="font-fraunces text-2xl sm:text-[32px] font-bold text-saarthi-ink">Income &amp; occupation</h2>
            <p className="text-sm text-saarthi-body -mt-3">Many schemes have an income ceiling — this is what unlocks the most matches.</p>
            <div>
              <FieldLabel why="Annual family income, before deductions">Annual family income (₹)</FieldLabel>
              <input type="number" min="0" className={inputClass} placeholder="e.g. 250000" value={form.annualIncome} onChange={(e) => set('annualIncome', e.target.value)} />
            </div>
            <div>
              <FieldLabel>Occupation</FieldLabel>
              <ChipGroup options={OCCUPATIONS} value={form.occupation} onChange={(v) => set('occupation', v)} />
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-5">
            <h2 className="font-fraunces text-2xl sm:text-[32px] font-bold text-saarthi-ink">Category &amp; education</h2>
            <div>
              <FieldLabel>Social category</FieldLabel>
              <ChipGroup options={CATEGORIES} value={form.category} onChange={(v) => set('category', v)} />
            </div>
            <div>
              <FieldLabel>Highest education level</FieldLabel>
              <select className={inputClass} value={form.educationLevel} onChange={(e) => set('educationLevel', e.target.value)}>
                <option value="">Select level</option>
                {EDUCATION_LEVELS.map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-1">
            <h2 className="font-fraunces text-2xl sm:text-[32px] font-bold text-saarthi-ink mb-1">A few more details</h2>
            <p className="text-sm text-saarthi-body mb-4">Optional, but these unlock more precise matches.</p>
            <ToggleRow label="Disability status" why="Unlocks disability-specific schemes" value={form.disabilityStatus} onChange={(v) => set('disabilityStatus', v)} />
            <ToggleRow label="Below Poverty Line (BPL)" why="Unlocks BPL-restricted schemes" value={form.isBpl} onChange={(v) => set('isBpl', v)} />
            <ToggleRow label="Minority status" why="Unlocks minority-community schemes" value={form.isMinority} onChange={(v) => set('isMinority', v)} />
          </div>
        )}

        {step === 6 && (
          <div className="space-y-4">
            <h2 className="font-fraunces text-2xl sm:text-[32px] font-bold text-saarthi-ink">Review &amp; confirm</h2>
            <dl className="divide-y divide-saarthi-border rounded-2xl border border-saarthi-border overflow-hidden">
              {[
                ['Date of birth', form.dateOfBirth || '—'],
                ['Gender', form.gender || '—'],
                ['State / District', `${form.state || '—'} / ${form.district || '—'}`],
                ['Annual income', form.annualIncome ? `₹${form.annualIncome}` : '—'],
                ['Occupation', form.occupation || '—'],
                ['Category', form.category || '—'],
                ['Education', form.educationLevel || '—'],
                ['Disability / BPL / Minority', `${form.disabilityStatus ? 'Yes' : 'No'} / ${form.isBpl ? 'Yes' : 'No'} / ${form.isMinority ? 'Yes' : 'No'}`],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between px-4 py-3 bg-saarthi-bg/60">
                  <dt className="text-sm text-saarthi-muted">{label}</dt>
                  <dd className="text-sm font-medium text-saarthi-ink">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}

        <div className="flex items-center justify-between mt-8 pt-6 border-t border-saarthi-border">
          <button
            type="button"
            onClick={back}
            disabled={step === 1}
            className="px-5 h-11 rounded-full text-sm font-medium text-saarthi-body border border-saarthi-border disabled:opacity-40 disabled:pointer-events-none hover:border-saarthi-green/50 transition-colors"
          >
            Back
          </button>
          {step < TOTAL_STEPS ? (
            <button
              type="button"
              onClick={next}
              className="px-6 h-11 rounded-full text-sm font-medium bg-saarthi-green text-white shadow-saarthi-btn hover:bg-saarthi-green-hover transition-all"
            >
              Continue
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinish}
              disabled={saving}
              className="px-6 h-11 rounded-full text-sm font-medium bg-saarthi-green text-white shadow-saarthi-btn hover:bg-saarthi-green-hover transition-all disabled:opacity-60"
            >
              {saving ? 'Saving…' : 'Finish & see my schemes'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
