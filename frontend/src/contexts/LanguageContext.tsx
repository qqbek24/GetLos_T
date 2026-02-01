import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface Labels {
  [key: string]: any
}

interface LanguageContextType {
  currentLanguage: string
  setLanguage: (lang: string) => void
  labels: Labels
  loading: boolean
  getLabel: (path: string, defaultValue?: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [currentLanguage, setCurrentLanguage] = useState<string>(() => {
    return localStorage.getItem('appLanguage') || 'en'
  })
  const [labels, setLabels] = useState<Labels>({})
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    const loadLabels = async () => {
      try {
        setLoading(true)
        const fileName = `labels-${currentLanguage}.json`
        const response = await fetch(`/${fileName}`)
        
        if (!response.ok) {
          throw new Error(`Failed to load labels: ${response.statusText}`)
        }
        
        const data = await response.json()
        setLabels(data)
      } catch (err) {
        console.error('Error loading labels:', err)
        setLabels({})
      } finally {
        setLoading(false)
      }
    }

    loadLabels()
  }, [currentLanguage])

  const setLanguage = (lang: string) => {
    localStorage.setItem('appLanguage', lang)
    setCurrentLanguage(lang)
  }

  const getLabel = (path: string, defaultValue: string = ''): string => {
    const keys = path.split('.')
    let value: any = labels
    
    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key]
      } else {
        return defaultValue
      }
    }
    
    return value || defaultValue
  }

  return (
    <LanguageContext.Provider value={{ currentLanguage, setLanguage, labels, loading, getLabel }}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useLanguage = () => {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}
