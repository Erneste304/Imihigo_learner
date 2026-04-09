// i18n Dictionary for Imihigo Learn
// Focus: English (EN) and Kinyarwanda (RW)

export type Language = 'en' | 'rw'

export const translations = {
  en: {
    dashboard: 'Dashboard',
    jobs: 'Jobs',
    skills: 'Skills',
    assessments: 'Assessments',
    community: 'Community',
    profile: 'Profile',
    trust_score: 'Trust Score',
    apply_now: 'Apply Now',
    verified: 'Verified',
    welcome_back: 'Welcome back',
    momo_pay: 'Pay with MoMo',
    search_placeholder: 'Search for opportunities...',
    language_toggle: 'Switch to Kinyarwanda'
  },
  rw: {
    dashboard: 'Ibibera hano',
    jobs: 'Imirimo',
    skills: 'Ubumenyi',
    assessments: 'Ibizamini',
    community: 'Umuryango',
    profile: 'Imyirondoro',
    trust_score: 'Icyizere',
    apply_now: 'Saba akazi',
    verified: 'Byemejwe',
    welcome_back: 'Muraho neza',
    momo_pay: 'Ishyura na MoMo',
    search_placeholder: 'Shaka akazi cyangwa amahirwe...',
    language_toggle: 'Hindura mu Cyongereza'
  }
}

export function useTranslation(lang: Language = 'en') {
  const t = (key: keyof typeof translations['en']) => {
    return translations[lang][key] || translations['en'][key]
  }
  return { t }
}
