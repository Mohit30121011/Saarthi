import { createContext, useContext, useState, useEffect } from 'react'

export const translations = {
  en: {
    gov_initiative: 'Government of India & Government of Maharashtra Digital Initiative',
    service_gateway: 'Official Citizen Service Gateway',
    dashboard: 'Dashboard',
    explore_schemes: 'Explore Schemes',
    checklist: 'Checklist',
    saved: 'Saved',
    notifications: 'Notifications',
    search_placeholder: 'Search schemes, subsidies, welfare...',
    state_maharashtra: 'State: Maharashtra',
    citizen_home: 'Citizen Home',
    eligibility_engine: 'Eligibility Matching Engine',
    verified_entitlements: 'Verified Entitlements',
    official_dossier: 'OFFICIAL ENTITLEMENT DOSSIER',
    aadhaar_linked: 'Aadhaar & Ration Card Linked',
    namaste: 'Namaste',
    dashboard_subtitle: 'Evaluated your verified demographic credentials against 52 Central and Maharashtra gazetted welfare schemes.',
    auto_sync: 'Auto-Sync Active',
    export_pdf: 'Export Summary PDF',
    last_verification: 'Last Verification',
    eligible_entitlements: 'Eligible Entitlements',
    schemes: 'Schemes',
    strong_match: 'Strong',
    partial_match: 'Partial',
    est_annual_value: 'Est. Annual Value',
    direct_cash_transfer: 'Direct cash transfer & subsidies across qualified schemes',
    expiring_applications: 'Expiring Applications',
    deadline_listed: 'Deadline Listed',
    profile_fidelity: 'Profile Fidelity',
    complete_profile_now: 'Complete Profile Now',
    unlock_high_value: 'Unlock 12 Additional High-Value Schemes',
    unlock_sub: 'Verify occupation in your citizen profile to complete 100% eligibility evaluation.',
    trending_welfare: 'Trending Welfare Schemes',
    trending_sub: 'High-demand citizen programs with massive direct benefit transfer disbursements across Central & Maharashtra registries.',
    official_matched_dossier: 'Official Matched Dossier',
    what_if_horizon: '"What-If" Entitlement Horizon (क्या अगर...?)',
    try_5l_horizon: 'Try ₹5L Horizon',
    all_schemes: 'All Schemes',
    cat_agriculture: 'Agriculture & Farmers',
    cat_education: 'Higher Education & Scholarships',
    cat_healthcare: 'Healthcare & Ayushman',
    cat_women: 'Women & Child Development',
    cat_msme: 'MSME & Livelihood',
    cat_social: 'Social Welfare & Disability',
    showing_schemes: 'Showing matched schemes (2 rows per page)',
    previous: 'Previous',
    next: 'Next',
    view: 'View',
    apply: 'Apply',
    all_notifications: 'All Notifications',
    unread_only: 'Unread Only',
    mark_all_seen: 'Mark All as Seen',
    auto_expires: 'Auto-expires after 2 days',
    no_notifications: 'No notifications right now',
    profile_title: 'Your Verified Citizen Profile',
    sign_out: 'Sign Out',
    close: 'Close',
    clear_all: 'Clear All',
    search: 'Search',
    trending: 'Trending',
    seasonal: 'Seasonal Windows',
    compare_schemes: 'Compare Schemes',
    view_comparison: 'View Comparison',
  },
  hi: {
    gov_initiative: 'भारत सरकार एवं महाराष्ट्र शासन का डिजिटल उपक्रम',
    service_gateway: 'आधिकारिक नागरिक सेवा पोर्टल',
    dashboard: 'डैशबोर्ड',
    explore_schemes: 'योजनाएं खोजें',
    checklist: 'दस्तावेज़ चेकलिस्ट',
    saved: 'सुरक्षित योजनाएं',
    notifications: 'सूचनाएं',
    search_placeholder: 'योजनाएं, सब्सिडी एवं कल्याणकारी सेवाएं खोजें...',
    state_maharashtra: 'राज्य: महाराष्ट्र',
    citizen_home: 'नागरिक मुख्य पृष्ठ',
    eligibility_engine: 'पात्रता मिलान इंजन',
    verified_entitlements: 'सत्यापित पात्रता संचिका',
    official_dossier: 'आधिकारिक नागरिक पात्रता संचिका',
    aadhaar_linked: 'आधार एवं राशन कार्ड सत्यापित',
    namaste: 'नमस्ते',
    dashboard_subtitle: '52 केंद्रीय और महाराष्ट्र राजपत्रित कल्याण योजनाओं के विरुद्ध आपके जनसांख्यिकीय विवरण का मूल्यांकन किया गया।',
    auto_sync: 'ऑटो-सिंक सक्रिय',
    export_pdf: 'संक्षिप्त PDF डाउनलोड करें',
    last_verification: 'अंतिम सत्यापन',
    eligible_entitlements: 'पात्र योजनाएं',
    schemes: 'योजनाएं',
    strong_match: 'पूर्ण पात्र',
    partial_match: 'आंशिक पात्र',
    est_annual_value: 'अनुमानित वार्षिक लाभ',
    direct_cash_transfer: 'पात्र योजनाओं के तहत प्रत्यक्ष लाभ हस्तांतरण (DBT) एवं सब्सिडी',
    expiring_applications: 'अंतिम तिथि निकट',
    deadline_listed: 'समय-सीमा सूचीबद्ध',
    profile_fidelity: 'प्रोफ़ाइल पूर्णता',
    complete_profile_now: 'प्रोफ़ाइल पूरी करें',
    unlock_high_value: '12 अतिरिक्त उच्च-मूल्य योजनाएं अनलॉक करें',
    unlock_sub: '100% पात्रता मूल्यांकन पूरा करने के लिए अपनी नागरिक प्रोफ़ाइल में व्यवसाय सत्यापित करें।',
    trending_welfare: 'लोकप्रिय कल्याणकारी योजनाएं',
    trending_sub: 'केंद्र एवं महाराष्ट्र के प्रमुख पोर्टल से भारी डीबीटी वितरण वाली उच्च-मांग नागरिक योजनाएं।',
    official_matched_dossier: 'आधिकारिक पात्रता संचिका',
    what_if_horizon: '"क्या अगर...?" पात्रता सिम्युलेटर (What-If Horizon)',
    try_5l_horizon: '₹5 लाख विकल्प देखें',
    all_schemes: 'सभी योजनाएं',
    cat_agriculture: 'कृषि एवं किसान कल्याण',
    cat_education: 'उच्च शिक्षा एवं छात्रवृत्ति',
    cat_healthcare: 'स्वास्थ्य एवं आयुष्मान भारत',
    cat_women: 'महिला एवं बाल विकास',
    cat_msme: 'एमएसएमई एवं स्वरोजगार',
    cat_social: 'सामाजिक कल्याण एवं दिव्यांगजन',
    showing_schemes: 'पात्र योजनाएं प्रदर्शित (प्रति पृष्ठ 2 पंक्तियाँ)',
    previous: 'पिछला',
    next: 'अगला',
    view: 'देखें',
    apply: 'आवेदन करें',
    all_notifications: 'सभी सूचनाएं',
    unread_only: 'केवल अपठित',
    mark_all_seen: 'सभी को पढ़ा हुआ चिह्नित करें',
    auto_expires: '2 दिन बाद स्वतः समाप्त',
    no_notifications: 'फिलहाल कोई नई सूचना नहीं है',
    profile_title: 'आपकी सत्यापित नागरिक प्रोफ़ाइल',
    sign_out: 'लॉग आउट',
    close: 'बंद करें',
    clear_all: 'सभी साफ़ करें',
    search: 'खोजें',
    trending: 'लोकप्रिय योजनाएं',
    seasonal: 'मौसमी खिड़कियां',
    compare_schemes: 'योजनाओं की तुलना करें',
    view_comparison: 'तुलना देखें',
  },
}

const LanguageContext = createContext({
  language: 'en',
  setLanguage: () => {},
  t: (key, fallback) => fallback || key,
})

export function applyGoogleTranslateEngine(lang) {
  try {
    const hostname = window.location.hostname
    if (lang === 'en') {
      document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
      document.cookie = 'googtrans=/en/en; path=/;'
      if (hostname !== 'localhost') {
        document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${hostname}`
        document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${hostname}`
      }
    } else {
      const targetLang = `/en/${lang}`
      document.cookie = `googtrans=${targetLang}; path=/;`
      if (hostname !== 'localhost') {
        document.cookie = `googtrans=${targetLang}; path=/; domain=${hostname}`
        document.cookie = `googtrans=${targetLang}; path=/; domain=.${hostname}`
      }
    }

    // Repeatedly check for .goog-te-combo until Google Translate script is ready
    let attempts = 0
    const interval = setInterval(() => {
      attempts++
      const select = document.querySelector('.goog-te-combo')
      if (select) {
        const valToSet = lang === 'en' ? '' : lang
        if (select.value !== valToSet) {
          select.value = valToSet
          select.dispatchEvent(new Event('change'))
        }
        clearInterval(interval)
      }
      if (attempts >= 60) {
        clearInterval(interval)
      }
    }, 100)
  } catch (err) {
    console.error('Google Translate dispatch error:', err)
  }
}

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    try {
      return sessionStorage.getItem('saarthi_language') || 'en'
    } catch {
      return 'en'
    }
  })

  function setLanguage(lang) {
    setLanguageState(lang)
    try {
      sessionStorage.setItem('saarthi_language', lang)
      localStorage.removeItem('saarthi_language')
    } catch {}
    applyGoogleTranslateEngine(lang)
  }

  useEffect(() => {
    applyGoogleTranslateEngine(language)
  }, [language])

  const t = (key, fallback) => {
    const dict = translations[language] || translations.en
    return dict[key] || fallback || key
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  return useContext(LanguageContext)
}
