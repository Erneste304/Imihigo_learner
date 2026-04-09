import { createContext, useContext, useState, ReactNode } from 'react'

type Lang = 'en' | 'rw'

const translations: Record<string, Record<Lang, string>> = {
  'Verify Skills': { en: 'Verify Skills', rw: 'Shyiraho Ubumenyi' },
  'Earn Credentials': { en: 'Earn Credentials', rw: 'Bona Impamyabumenyi' },
  'Land Your Career': { en: 'Land Your Career', rw: 'Shakisha Akazi Kawe' },
  'Browse Skills': { en: 'Browse Skills', rw: 'Reba Ubumenyi' },
  'Start Verifying Skills': { en: 'Start Verifying Skills →', rw: 'Tangira Kwemeza Ubumenyi →' },
  'Apply Now': { en: 'Apply Now →', rw: 'Saba Ubu →' },
  'Dashboard': { en: 'Dashboard', rw: 'Ibibera hano' },
  'Jobs': { en: 'Jobs', rw: 'Akazi' },
  'Skills': { en: 'Skills', rw: 'Ubumenyi' },
  'Profile': { en: 'Profile', rw: 'Umwirondoro' },
  'Community': { en: 'Community', rw: 'Umuryango' },
  'Leaderboard': { en: 'Leaderboard', rw: 'Ibarura' },
  'Trust Score': { en: 'Trust Score', rw: 'Icyizere' },
  'Verified': { en: 'Verified', rw: 'Byemejwe' },
  'Pay with MoMo': { en: 'Pay with MoMo', rw: 'Ishyura na MoMo' },
  'Welcome back': { en: 'Welcome back', rw: 'Muraho neza' },
  'Search for opportunities...': { en: 'Search for opportunities...', rw: 'Shaka akazi cyangwa amahirwe...' },
  'Bulk Certification': { en: 'Bulk Certification', rw: 'Guhereza Impamyabumenyi icyarimwe' },
  'API & Integration': { en: 'API & Integration', rw: 'Guhuza na System zindi (API)' },
  'Generate New API Key': { en: 'Generate New API Key', rw: 'Kora Key nshya' },
  'Start Generation': { en: 'Start Generation', rw: 'Tangira gukora' },
  'Enterprise Portal': { en: 'Enterprise Portal', rw: 'Ibibera muri Kompanyi' },
  'Verify Credential': { en: 'Verify Credential', rw: 'Kwemeza Impamyabumenyi' },
  'Post a Job': { en: 'Post a Job', rw: 'Shyiraho akazi' },
  'Posted Jobs': { en: 'Posted Jobs', rw: 'Akazi washyizeho' },
}

interface LangContextType {
  lang: Lang
  setLang: (l: Lang) => void
  t: (key: string) => string
}

const LangContext = createContext<LangContextType | null>(null)

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>((localStorage.getItem('lang') as Lang) || 'en')

  function t(key: string): string {
    return translations[key]?.[lang] ?? key
  }

  function changeLang(l: Lang) {
    setLang(l)
    localStorage.setItem('lang', l)
  }

  return <LangContext.Provider value={{ lang, setLang: changeLang, t }}>{children}</LangContext.Provider>
}

export function useLang() {
  const ctx = useContext(LangContext)
  if (!ctx) throw new Error('useLang must be within LangProvider')
  return ctx
}
