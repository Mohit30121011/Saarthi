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
]

export default function LanguageSwitcher() {
  const { setLanguage } = useLanguage()
  const [activeLang, setActiveLang] = useState(() => {
    return localStorage.getItem('saarthi_selected_lang') || 'en'
  })
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)

  // Listen for clicks outside dropdown
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Sync with Google Translate combo if available
  useEffect(() => {
    function checkGoogleTranslate() {
      const select = document.querySelector('.goog-te-combo')
      if (select && select.value && select.value !== activeLang) {
        setActiveLang(select.value)
      }
    }

    const interval = setInterval(checkGoogleTranslate, 1000)
    return () => clearInterval(interval)
  }, [activeLang])

  function switchLanguage(langCode) {
    setActiveLang(langCode)
    localStorage.setItem('saarthi_selected_lang', langCode)
    setLanguage(langCode === 'hi' ? 'hi' : 'en')
    setDropdownOpen(false)

    try {
      const hostname = window.location.hostname
      const targetCookie = langCode === 'en' ? '/en/en' : `/en/${langCode}`

      // Set cookie for current domain and host
      document.cookie = `googtrans=${targetCookie}; path=/;`
      document.cookie = `googtrans=${targetCookie}; path=/; domain=${hostname}`

      // Also dispatch to Google Translate select element
      const select = document.querySelector('.goog-te-combo')
      if (select) {
        select.value = langCode
        select.dispatchEvent(new Event('change'))
      } else {
        // If not initialized yet, give a brief moment or reload to apply cookie
        setTimeout(() => {
          const retrySelect = document.querySelector('.goog-te-combo')
          if (retrySelect) {
            retrySelect.value = langCode
            retrySelect.dispatchEvent(new Event('change'))
          }
        }, 300)
      }
    } catch (e) {
      console.error('Error switching language:', e)
    }
  }

  const currentLangObj = INDIAN_LANGUAGES.find((l) => l.code === activeLang)
  const isCustomLang = activeLang !== 'en' && activeLang !== 'hi' && activeLang !== 'mr'

  return (
    <div className="notranslate flex items-center gap-1.5 shrink-0" translate="no" ref={dropdownRef}>
      {/* Primary Quick Toggle Segment (English | हिन्दी | मराठी) */}
      <div
        className="inline-flex items-center bg-[#E2E8F0]/90 p-0.5 rounded-xl border border-[#CBD5E1] shadow-2xs"
        role="group"
        aria-label="Quick Language Switcher"
      >
        <button
          type="button"
          onClick={() => switchLanguage('en')}
          className={`px-2.5 py-1 rounded-lg text-[11px] sm:text-xs font-black transition-all cursor-pointer flex items-center gap-1 ${
            activeLang === 'en'
              ? 'bg-[#0D2240] text-white shadow-xs scale-102'
              : 'text-[#44474E] hover:text-[#0D2240] hover:bg-white/60'
          }`}
          title="Switch portal to English"
        >
          <span>English</span>
        </button>

        <button
          type="button"
          onClick={() => switchLanguage('hi')}
          className={`px-2.5 py-1 rounded-lg text-[11px] sm:text-xs font-black transition-all cursor-pointer flex items-center gap-1 ${
            activeLang === 'hi'
              ? 'bg-[#E65100] text-white shadow-xs scale-102'
              : 'text-[#44474E] hover:text-[#E65100] hover:bg-white/60'
          }`}
          title="पोर्टल को हिन्दी में बदलें"
        >
          <span>हिन्दी</span>
        </button>

        <button
          type="button"
          onClick={() => switchLanguage('mr')}
          className={`px-2.5 py-1 rounded-lg text-[11px] sm:text-xs font-black transition-all cursor-pointer flex items-center gap-1 ${
            activeLang === 'mr'
              ? 'bg-[#138808] text-white shadow-xs scale-102'
              : 'text-[#44474E] hover:text-[#138808] hover:bg-white/60'
          }`}
          title="पोर्टल मराठीत बदला"
        >
          <span>मराठी</span>
        </button>
      </div>

      {/* Google Translator More Languages Dropdown */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setDropdownOpen((prev) => !prev)}
          className={`px-2.5 py-1 rounded-xl text-[11px] sm:text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs ${
            isCustomLang
              ? 'bg-[#0D2240] text-white border-[#0D2240]'
              : 'bg-white hover:bg-[#F0F3FF] text-[#0D2240] border-[#CBD5E1]'
          }`}
          title="Google Translate: All Indian & Global Languages"
        >
          <span className="material-symbols-outlined text-[15px] text-[#E65100]">translate</span>
          <span className="font-extrabold max-w-[80px] sm:max-w-none truncate">
            {isCustomLang ? currentLangObj?.native || activeLang.toUpperCase() : 'More (अन्य)'}
          </span>
          <span
            className={`material-symbols-outlined text-[14px] text-slate-400 transition-transform duration-150 ${
              dropdownOpen ? 'rotate-180' : ''
            }`}
          >
            expand_more
          </span>
        </button>

        {dropdownOpen && (
          <div className="absolute right-0 top-full mt-1.5 w-60 bg-white rounded-2xl shadow-2xl border border-[#CBD5E1] p-2 z-50 animate-in fade-in zoom-in-95 duration-150 max-h-80 overflow-y-auto">
            <div className="px-2.5 py-1.5 border-b border-[#E2E8F0] mb-1 flex items-center justify-between">
              <span className="text-[10.5px] uppercase tracking-wider font-extrabold text-[#0D2240]">
                Google Translator (सभी भाषाएं)
              </span>
              <span className="text-[10px] text-[#138808] font-bold">22 Languages</span>
            </div>

            <div className="grid grid-cols-1 gap-0.5">
              {INDIAN_LANGUAGES.map((item) => (
                <button
                  key={item.code}
                  type="button"
                  onClick={() => switchLanguage(item.code)}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-bold flex items-center justify-between transition-colors cursor-pointer ${
                    activeLang === item.code
                      ? 'bg-[#EBF3FC] text-[#0D2240] font-black'
                      : 'text-[#44474E] hover:bg-[#F8FAFC] hover:text-[#0D2240]'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className="text-sm font-semibold">{item.native}</span>
                    <span className="text-[10px] text-slate-400 font-normal">({item.name})</span>
                  </span>
                  {activeLang === item.code && (
                    <span className="material-symbols-outlined text-[15px] text-[#138808]">check</span>
                  )}
                </button>
              ))}
            </div>

            {/* Native Google Translate Element Container (Headless/Styled fallback) */}
            <div className="pt-2 mt-1 border-t border-[#E2E8F0] px-2 text-[10px] text-slate-400">
              <span>Powered by Google Translate API</span>
            </div>
          </div>
        )}
      </div>

      {/* Hidden Mount for Google Translate engine */}
      <div id="google_translate_element" className="hidden" style={{ display: 'none' }} />
    </div>
  )
}
