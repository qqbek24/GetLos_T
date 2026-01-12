import { useState, useEffect } from 'react'

export interface Labels {
  [key: string]: any
}

export interface UseLabelsReturn {
  labels: Labels
  loading: boolean
  error: string | null
  getLabel: (path: string, defaultValue?: string) => string
}

/**
 * Hook do zarządzania labelami aplikacji z możliwością internacjonalizacji
 * @param language - Kod języka (obecnie wspierane: 'pl')
 * @returns Obiekt z labelami, stanem ładowania i funkcją getLabel
 */
export const useLabels = (language: string = 'pl'): UseLabelsReturn => {
  const [labels, setLabels] = useState<Labels>({})
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadLabels = async () => {
      try {
        setLoading(true)
        // W przyszłości można dodać inne języki: labels-en.json, labels-de.json, etc.
        const fileName = language === 'pl' ? 'labels.json' : `labels-${language}.json`
        const response = await fetch(`/${fileName}`)
        
        if (!response.ok) {
          throw new Error(`Failed to load labels: ${response.statusText}`)
        }
        
        const data = await response.json()
        setLabels(data)
        setError(null)
      } catch (err) {
        console.error('Error loading labels:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')
        // Fallback do pustego obiektu - aplikacja będzie działać bez labeli
        setLabels({})
      } finally {
        setLoading(false)
      }
    }

    loadLabels()
  }, [language])

  /**
   * Pomocnicza funkcja do pobierania zagnieżdżonych wartości
   * @param path - Ścieżka do wartości (np. 'dashboard.title')
   * @param defaultValue - Wartość domyślna jeśli nie znaleziono
   */
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

  return { labels, loading, error, getLabel }
}

export default useLabels
