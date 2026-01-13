"use client"

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"

export type Language = "hu" | "en"

interface LanguageContextValue {
  language: Language
  setLanguage: (language: Language) => void
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined)

function getStoredLanguage(): Language | null {
  if (typeof window === "undefined") return null
  const stored = window.localStorage.getItem("language")
  return stored === "hu" || stored === "en" ? stored : null
}

function getPreferredLanguage(): Language {
  if (typeof navigator === "undefined") return "hu"
  const lang = navigator.language.toLowerCase()
  return lang.startsWith("en") ? "en" : "hu"
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>("hu")

  useEffect(() => {
    const stored = getStoredLanguage()
    setLanguage(stored || getPreferredLanguage())
  }, [])

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("language", language)
    }
    if (typeof document !== "undefined") {
      document.documentElement.lang = language
    }
  }, [language])

  const value = useMemo(
    () => ({
      language,
      setLanguage,
    }),
    [language]
  )

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}
