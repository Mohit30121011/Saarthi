import { useEffect, useState } from 'react'
import { getProfile, updateProfile } from '../api/profile'
import { useAuth } from '../context/AuthContext'

const GENDERS = ['MALE', 'FEMALE', 'OTHER']
const CATEGORIES = ['GENERAL', 'OBC', 'SC', 'ST', 'EWS']
const EDUCATION_LEVELS = ['Below 10th', '10th', '12th', 'Diploma', 'Graduate', 'Post Graduate', 'Doctorate']
const OCCUPATIONS = ['Student', 'Farmer', 'Self-Employed', 'Salaried', 'Unemployed', 'Homemaker', 'Retired']

const inputClass =
  'w-full h-[48px] px-4 rounded-[14px] bg-saarthi-bg border-[1.5px] border-saarthi-border text-saarthi-ink text-sm saarthi-input-focus'

export default function Profile() {
  const { user } = useAuth()
  const [form, setForm] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    getProfile()
      .then((data) =>
        setForm({
          dateOfBirth: data.dateOfBirth || '',
          gender: data.gender || '',
          state: data.state || '',
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
          dateOfBirth: '', gender: '', state: '', district: '', annualIncome: '', occupation: '',
          category: '', educationLevel: '', disabilityStatus: false, isBpl: false, isMinority: false,
        })
      )
      .finally(() => setLoading(false))
  }, [])

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    setMessage('')
    setError('')
    try {
      await updateProfile({ ...form, annualIncome: form.annualIncome === '' ? null : Number(form.annualIncome) })
      setMessage('Profile updated — your matches have been refreshed.')
    } catch (err) {
      setError(err.response?.data?.error || 'Could not save your profile.')
    } finally {
      setSaving(false)
    }
  }

  if (loading || !form) return <div className="text-center py-24 text-saarthi-muted">Loading…</div>

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="font-fraunces text-3xl font-bold text-saarthi-ink mb-1">Your Profile</h1>
      <p className="text-saarthi-body mb-6">{user?.email}</p>

      {message && <div className="mb-5 rounded-2xl bg-[#F5FAF7] border-l-4 border-saarthi-green p-4 text-sm text-saarthi-ink">{message}</div>}
      {error && <div className="mb-5 rounded-2xl bg-saarthi-alert-bg border-l-4 border-saarthi-error p-4 text-sm text-saarthi-ink">{error}</div>}

      <form onSubmit={handleSave} className="bg-white rounded-2xl border border-saarthi-border p-6 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="text-sm font-medium text-saarthi-ink block mb-1.5">Date of birth</label>
            <input type="date" className={inputClass} value={form.dateOfBirth} onChange={(e) => set('dateOfBirth', e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-medium text-saarthi-ink block mb-1.5">Gender</label>
            <select className={inputClass} value={form.gender} onChange={(e) => set('gender', e.target.value)}>
              <option value="">Select</option>
              {GENDERS.map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-saarthi-ink block mb-1.5">State</label>
            <input type="text" className={inputClass} value={form.state} onChange={(e) => set('state', e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-medium text-saarthi-ink block mb-1.5">District</label>
            <input type="text" className={inputClass} value={form.district} onChange={(e) => set('district', e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-medium text-saarthi-ink block mb-1.5">Annual income (₹)</label>
            <input type="number" min="0" className={inputClass} value={form.annualIncome} onChange={(e) => set('annualIncome', e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-medium text-saarthi-ink block mb-1.5">Occupation</label>
            <select className={inputClass} value={form.occupation} onChange={(e) => set('occupation', e.target.value)}>
              <option value="">Select</option>
              {OCCUPATIONS.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-saarthi-ink block mb-1.5">Social category</label>
            <select className={inputClass} value={form.category} onChange={(e) => set('category', e.target.value)}>
              <option value="">Select</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-saarthi-ink block mb-1.5">Education level</label>
            <select className={inputClass} value={form.educationLevel} onChange={(e) => set('educationLevel', e.target.value)}>
              <option value="">Select</option>
              {EDUCATION_LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
        </div>

        <div className="pt-2 border-t border-saarthi-border">
          {[
            ['disabilityStatus', 'Disability status'],
            ['isBpl', 'Below Poverty Line (BPL)'],
            ['isMinority', 'Minority status'],
          ].map(([field, label]) => (
            <label key={field} className="flex items-center justify-between py-2.5 cursor-pointer">
              <span className="text-sm text-saarthi-ink">{label}</span>
              <input type="checkbox" checked={form[field]} onChange={(e) => set(field, e.target.checked)} className="w-4 h-4 rounded text-saarthi-green border-saarthi-border" />
            </label>
          ))}
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full h-[48px] rounded-full bg-saarthi-green hover:bg-saarthi-green-hover text-white font-medium text-sm shadow-saarthi-btn transition-all disabled:opacity-60"
        >
          {saving ? 'Saving…' : 'Save changes'}
        </button>
      </form>
    </div>
  )
}
