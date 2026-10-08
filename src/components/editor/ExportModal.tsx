import { Download, FileImage, Grid3X3, SlidersHorizontal, Sparkles } from 'lucide-react'
import type { ExportSelection } from '@components/editor/types'
import { Select } from '@components/ui/Select'
import { useLanguage } from '@i18n/useLanguage'

type ExportModalProps = {
  canvasWidth: number
  canvasHeight: number
  sourceDpi: number
  exportDpi: number
  format: 'png' | 'jpg'
  quality: number
  selection: ExportSelection
  onClose: () => void
  onFormatChange: (format: 'png' | 'jpg') => void
  onDpiChange: (dpi: number) => void
  onQualityChange: (quality: number) => void
  onSelectionChange: (selection: ExportSelection) => void
  onExport: (asZip: boolean) => void
}

const exportOptions = [
  { key: 'original', titleKey: 'original', descKey: 'colorImage', icon: FileImage },
  { key: 'filter', titleKey: 'exportFilter', descKey: 'exportFilterDescription', icon: SlidersHorizontal },
  { key: 'grid', titleKey: 'grid', descKey: 'linesOnBackground', icon: Grid3X3 },
  { key: 'filterGrid', titleKey: 'exportFilterGrid', descKey: 'exportFilterGridDescription', icon: Sparkles },
] as const

/**
 * Renders export format, resolution and variant selection controls.
 *
 * @param props - Export configuration and download callbacks.
 * @returns The export modal.
 */
export function ExportModal({
  canvasWidth,
  canvasHeight,
  sourceDpi,
  exportDpi,
  format,
  quality,
  selection,
  onClose,
  onFormatChange,
  onDpiChange,
  onQualityChange,
  onSelectionChange,
  onExport,
}: ExportModalProps) {
  const { t } = useLanguage()
  const outputWidth = Math.round(canvasWidth * exportDpi / sourceDpi)
  const outputHeight = Math.round(canvasHeight * exportDpi / sourceDpi)

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="export-modal" onClick={(event) => event.stopPropagation()}>
        <div className="modal-title"><div><span className="eyebrow">{t('exportReferences')}</span><h2>{t('exportImages')}</h2></div><button className="icon-button" onClick={onClose} aria-label={t('closeExport')}>×</button></div>
        <p>{t('exportDescription', { dpi: exportDpi, width: outputWidth, height: outputHeight })}</p>
        <div className="export-settings">
          <label>{t('format')}<Select ariaLabel={t('format')} value={format} onChange={(value) => onFormatChange(value as 'png' | 'jpg')} options={[{ value: 'png', label: t('pngQuality') }, { value: 'jpg', label: t('jpgLight') }]} /></label>
          <label>{t('resolution')}<Select ariaLabel={t('resolution')} value={String(exportDpi)} onChange={(value) => onDpiChange(Number(value))} options={[{ value: '96', label: `96 DPI · ${t('screenDpi')}` }, { value: '150', label: `150 DPI · ${t('recommendedDpi')}` }, { value: '300', label: `300 DPI · ${t('printDpi')}` }, { value: '600', label: `600 DPI · ${t('detailDpi')}` }]} /></label>
          {format === 'jpg' && <label>{t('quality')} <span>{Math.round(quality * 100)}%</span><input className="range" type="range" min="0.5" max="1" step="0.01" value={quality} onChange={(event) => onQualityChange(Number(event.target.value))} /></label>}
        </div>
        <div className="export-options">
          {exportOptions.map(({ key, titleKey, descKey, icon: Icon }) => (
            <button key={key} className={`export-option ${selection[key] ? 'selected' : ''}`} onClick={() => onSelectionChange({ ...selection, [key]: !selection[key] })}>
              <span className="option-check">{selection[key] ? '✓' : ''}</span><Icon size={18} /><span><b>{t(titleKey)}</b><small>{t(descKey)}</small></span>
            </button>
          ))}
        </div>
        <div className="modal-actions">
          <button className="ghost-button" onClick={() => onExport(false)}><Download size={15} /> {t('downloadSelected')}</button>
          <button className="primary-button" onClick={() => onExport(true)}><Download size={15} /> {t('downloadZip')}</button>
        </div>
      </div>
    </div>
  )
}
