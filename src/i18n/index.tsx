import { I18nextProvider } from 'react-i18next'
import type { ReactNode } from 'react'
import { i18nInstance } from './config'

/** Languages currently supported by the editor. */
export type Language = 'es' | 'en'

/**
 * Provides the i18next localization instance to the editor tree.
 *
 * @param props - Provider children.
 * @returns The localized application subtree.
 */
export function LanguageProvider({ children }: { children: ReactNode }) {
  return <I18nextProvider i18n={i18nInstance}>{children}</I18nextProvider>
}
