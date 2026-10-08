import { Check, ChevronDown, Download, Grid3X3, RotateCcw } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useLanguage } from '@i18n/useLanguage'
import type { EditorHeaderProps } from '@components/editor/types'

/**
 * Renders the project identity and global actions.
 *
 * @param props - Header state and action callbacks.
 * @returns The editor header.
 */
export function EditorHeader({ settings, onNameChange, onSave, onExport }: EditorHeaderProps) {
  const { language, setLanguage, t } = useLanguage()
  const [languageMenuOpen, setLanguageMenuOpen] = useState(false)
  const languageMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function closeLanguageMenu(event: MouseEvent) {
      if (!languageMenuRef.current?.contains(event.target as Node)) setLanguageMenuOpen(false)
    }
    document.addEventListener('mousedown', closeLanguageMenu)
    return () => document.removeEventListener('mousedown', closeLanguageMenu)
  }, [])

  return (
    <header className="topbar">
      <div className="brand">
        <div className="brand-mark"><Grid3X3 size={19} strokeWidth={2.5} /></div>
        <div><strong>Gridline</strong><span>{t('brandSubtitle')}</span></div>
      </div>
      <div className="project-name">
        <span>{t('project')}</span>
        <input aria-label={t('project')} value={settings.name} onChange={(event) => onNameChange(event.target.value)} />
      </div>
      <div className="top-actions">
        <div className="language-switcher" ref={languageMenuRef}>
          <span>{t('language')}</span>
          <button
            className="language-trigger"
            type="button"
            aria-expanded={languageMenuOpen}
            aria-haspopup="menu"
            aria-label={t('language')}
            onClick={() => setLanguageMenuOpen((open) => !open)}
          >
            <span>{language === 'es' ? t('spanish') : t('english')}</span>
            <ChevronDown size={13} />
          </button>
          {languageMenuOpen && <div className="language-menu" role="menu">
            <button type="button" role="menuitem" className={language === 'es' ? 'selected' : ''} onClick={() => { setLanguage('es'); setLanguageMenuOpen(false) }}>
              <span>{t('spanish')}</span>{language === 'es' && <Check size={13} />}
            </button>
            <button type="button" role="menuitem" className={language === 'en' ? 'selected' : ''} onClick={() => { setLanguage('en'); setLanguageMenuOpen(false) }}>
              <span>{t('english')}</span>{language === 'en' && <Check size={13} />}
            </button>
          </div>}
        </div>
        <button className="ghost-button" onClick={onSave}><RotateCcw size={16} /> {t('save')}</button>
        <button className="primary-button" onClick={onExport}><Download size={16} /> {t('export')}</button>
      </div>
    </header>
  )
}
