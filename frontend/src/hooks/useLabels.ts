import { useLanguage } from '../contexts/LanguageContext'

export interface Labels {
  [key: string]: any
}

export interface UseLabelsReturn {
  labels: Labels
  loading: boolean
  error: string | null
  getLabel: (path: string, defaultValue?: string) => string
  setLanguage: (lang: string) => void
  currentLanguage: string
}

/**
 * Hook do zarządzania labelami aplikacji z możliwością internacjonalizacji
 * @returns Obiekt z labelami, stanem ładowania i funkcją getLabel
 */
export const useLabels = (): UseLabelsReturn => {
  const { currentLanguage, setLanguage, labels, loading, getLabel } = useLanguage()

  return { 
    labels, 
    loading, 
    error: null, 
    getLabel, 
    setLanguage, 
    currentLanguage 
  }
}

export default useLabels
