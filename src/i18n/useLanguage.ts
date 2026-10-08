import { useTranslation } from 'react-i18next'
import type { Language } from './index'

/**
 * Reads the active application language and exposes the shared translation API.
 *
 * @returns Active language, language setter and translation helper.
 */
export function useLanguage() {
  const { i18n, t } = useTranslation()
  const language: Language = i18n.resolvedLanguage === 'en' ? 'en' : 'es'

  return {
    language,
    setLanguage: (nextLanguage: Language) => void i18n.changeLanguage(nextLanguage),
    t: (key: string, params?: Record<string, string | number>) => t(key, params),
  }
}
