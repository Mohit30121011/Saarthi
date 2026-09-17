import { useState, useEffect, useRef } from 'react'
import { useLanguage } from '../context/LanguageContext'

const INDIAN_LANGUAGES = [
  { code: 'en', name: 'English', native: 'English' },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी' },
  { code: 'mr', name: 'Marathi', native: 'मराठी' },
  { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી' },
  { code: 'bn', name: 'Bengali', native: 'বাংলা' },
  { code: 'ta', name: 'Tamil', native: 'தமிழ்' },
  { code: 'te', name: 'Telugu', native: 'తెలుగు' },
  { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ' },
  { code: 'ml', name: 'Malayalam', native: 'മലയാളം' },
  { code: 'pa', name: 'Punjabi', native: 'ਪੰਜਾਬੀ' },
  { code: 'ur', name: 'Urdu', native: 'اردو' },
  { code: 'or', name: 'Odia', native: 'ଓଡ଼ିଆ' },
  { code: 'as', name: 'Assamese', native: 'অসমীয়া' },
  { code: 'sa', name: 'Sanskrit', native: 'संस्कृतम्' },
  { code: 'ne', name: 'Nepali', native: 'नेपाली' },
  { code: 'sd', name: 'Sindhi', native: 'سنڌي' },
]

export default function LanguageSwitcher() {
  const { setLanguage } = useLanguage()
  const [activeLang, setActiveLang] = useState(() => {
    return localStorage.getItem('saarthi_selected_lang') || 'en'
  })
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Sync active language with localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('saarthi_selected_lang')
    if (saved && saved !== activeLang) {
      setActiveLang(saved)
    }
  }, [])

  function handleSelectLanguage(langCode) {
    setActiveLang(langCode)
    localStorage.setItem('saarthi_selected_lang', langCode)
    localStorage.setItem('saarthi_language', langCode)
    if (setLanguage) {
      setLanguage(langCode)
    }
    setDropdownOpen(false)

    try {
      const hostname = window.location.hostname
      if (langCode === 'en') {
        // Clear translation cookie for English completely
        document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
        document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${hostname}`
        document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${hostname}`
        document.cookie = 'googtrans=/en/en; path=/;'
      } else {
        const targetCookie = `/en/${langCode}`
        document.cookie = `googtrans=${targetCookie}; path=/;`
        if (hostname !== 'localhost') {
          document.cookie = `googtrans=${targetCookie}; path=/; domain=.${hostname}`
          document.cookie = `googtrans=${targetCookie}; path=/; domain=${hostname}`
        }
      }

      // Dispatch to Google Translate select element
      const combo = document.querySelector('.goog-te-combo')
      if (combo) {
        combo.value = langCode === 'en' ? '' : langCode
        combo.dispatchEvent(new Event('change'))
      }

      // Fast reload guarantees 100% pristine translation and full revert back to English
      setTimeout(() => {
        window.location.reload()
      }, 100)
    } catch (err) {
      console.error('Failed to change language:', err)
      window.location.reload()
    }
  }

  const currentLangObj = INDIAN_LANGUAGES.find((l) => l.code === activeLang) || INDIAN_LANGUAGES[0]

  return (
    <div
      className="notranslate relative inline-flex items-center shrink-0"
      translate="no"
      ref={dropdownRef}
    >
      {/* Unified Language Translator Dropdown Button */}
      <button
        type="button"
        id="language-translator-btn"
        onClick={() => setDropdownOpen((prev) => !prev)}
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white hover:bg-[#F0F3FF] border border-[#CBD5E1] hover:border-[#0D2240] shadow-xs text-xs font-bold text-[#0D2240] transition-all cursor-pointer group"
        aria-expanded={dropdownOpen}
        aria-label="Language Translator Dropdown"
      >
        <span className="material-symbols-outlined text-[17px] text-[#E65100] group-hover:scale-110 transition-transform">
          translate
        </span>
        <span className="font-extrabold text-[11.5px] sm:text-xs">
          Language Translator:
        </span>
        <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-[#0D2240] text-white text-[11px] font-black shadow-2xs">
          {currentLangObj.native}
        </span>
        <span
          className={`material-symbols-outlined text-[16px] text-slate-400 group-hover:text-[#0D2240] transition-transform duration-200 ${
            dropdownOpen ? 'rotate-180' : ''
          }`}
        >
          arrow_drop_down
        </span>
      </button>

      {/* Language Selector Popover Panel */}
      {dropdownOpen && (
        <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-[#CBD5E1] p-2.5 z-50 animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="flex items-center justify-between px-2 pb-2 mb-1.5 border-b border-[#E2E8F0]">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-[#0D2240]">
                language
              </span>
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#0D2240]">
                Language Translator
              </span>
            </div>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#EAFBF0] text-[#138808]">
              {INDIAN_LANGUAGES.length} Languages
            </span>
          </div>

          {/* Language Options List */}
          <div className="grid grid-cols-1 gap-1 max-h-72 overflow-y-auto pr-1 scrollbar-thin">
            {INDIAN_LANGUAGES.map((lang) => {
              const isSelected = activeLang === lang.code
              return (
                <button
                  key={lang.code}
                  id={`lang-option-${lang.code}`}
                  type="button"
                  onClick={() => handleSelectLanguage(lang.code)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs transition-all flex items-center justify-between cursor-pointer ${
                    isSelected
                      ? 'bg-[#0D2240] text-white font-extrabold shadow-xs'
                      : 'hover:bg-[#F0F3FF] text-[#111C2D] font-medium'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold">{lang.native}</span>
                    <span
                      className={`text-[11px] ${
                        isSelected ? 'text-white/80' : 'text-slate-400'
                      }`}
                    >
                      ({lang.name})
                    </span>
                  </div>

                  {isSelected && (
                    <span className="material-symbols-outlined text-[16px] text-[#FF9933]">
                      check_circle
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          {/* Footer note */}
          <div className="pt-2 mt-2 border-t border-[#E2E8F0] px-2 flex items-center justify-between text-[10px] text-slate-400">
            <span>Powered by Google Translate</span>
            <span className="font-semibold text-[#0D2240]">Saarthi Portal</span>
          </div>
        </div>
      )}
    </div>
  )
}
