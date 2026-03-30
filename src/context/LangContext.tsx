import { createContext, useContext, useState, ReactNode } from 'react'

type Lang = 'en' | 'rw'

const translations: Record<string, Record<Lang, string>> = {
  'Verify Skills': { en: 'Verify Skills', rw: 'Shyiraho Ubumenyi' },
  'Earn Credentials': { en: 'Earn Credentials', rw: 'Bona Impamyabumenyi' },
  'Land Your Career': { en: 'Land Your Career', rw: 'Shakisha Akazi Kawe' },
  'Browse Skills': { en: 'Browse Skills', rw: 'Reba Ubumenyi' },
  'Start Verifying Skills': { en: 'Start Verifying Skills →', rw: 'Tangira Kwemeza Ubumenyi →' },
  'Dashboard': { en: 'Dashboard', rw: 'Imbonerahamwe' },
  'Skills': { en: 'Skills', rw: 'Ubumenyi' },
  'Jobs': { en: 'Jobs', rw: 'Akazi' },
  'Profile': { en: 'Profile', rw: 'Umwirondoro' },
  'Community': { en: 'Community', rw: 'Umuryango' },
  'Leaderboard': { en: 'Leaderboard', rw: 'Ibarura' },
  'Sign In': { en: 'Sign In', rw: 'Injira' },
  'Get Started': { en: 'Get Started', rw: 'Tangira' },
  'Sign Out': { en: 'Sign Out', rw: 'Sohoka' },
  'Built for Rwanda': { en: "🇷🇼 Built for Rwanda's Future Workforce", rw: "🇷🇼 Yakozwe ku Bakozi bo mu Rwanda ba Ejo Hazaza" },
  'Start Assessment': { en: 'Start Assessment →', rw: 'Tangira Ikizamini →' },
  'Apply Now': { en: 'Apply Now →', rw: 'Saba Ubu →' },
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
