import { ArrowLeftRight, ArrowUpDown, FileImage, Maximize2, Move, Palette, RotateCcw, Scan, SlidersHorizontal, Sparkles, Trash2, Upload } from 'lucide-react'
import type { CanvasSettings, FilterAdjustments, ImageState, Unit } from '@domain/types'
import type { EditorTab } from '@components/editor/types'
import { Select } from '@components/ui/Select'
import { ColorPicker } from '@components/ui/ColorPicker'
import { useLanguage } from '@i18n/useLanguage'

type SettingsPanelProps = {
  activeTab: EditorTab
  settings: CanvasSettings
  image: ImageState | null
  onSettingsChange: (patch: Partial<CanvasSettings>) => void
  onAdjustmentChange: (patch: Partial<FilterAdjustments>) => void
  onImageChange: (image: ImageState) => void
  onClearImage: () => void
  onFitImage: (mode: 'contain' | 'cover') => void
  onResetImage: () => void
  onUploadClick: () => void
  onResetSettings: () => void
  locked: boolean
}

/**
 * Renders the active grid, image or filter control panel.
 *
 * @param props - Active editor values and state mutation callbacks.
 * @returns The right-side settings panel.
 */
export function SettingsPanel({
  activeTab,
  settings,
  image,
  onSettingsChange,
  onAdjustmentChange,
  onImageChange,
  onClearImage,
  onFitImage,
  onResetImage,
  onUploadClick,
  onResetSettings,
  locked,
}: SettingsPanelProps) {
  const { t } = useLanguage()
  return (
    <aside className="sidebar right-panel">
      <div className="panel-heading"><span>{activeTab === 'grid' ? t('gridSettings') : activeTab === 'image' ? t('imageSettings') : t('filters')}</span><Palette size={16} /></div>
      {activeTab === 'grid' && (
        <fieldset className="settings-content" disabled={locked} aria-disabled={locked}>
          <div className="setting-block"><label>{t('spacing')}</label><div className="input-with-unit"><input disabled={locked} type="number" value={settings.gridSpacing} min="0.1" step="0.1" onChange={(event) => onSettingsChange({ gridSpacing: Number(event.target.value) })} /><Select ariaLabel={t('unit')} value={settings.gridUnit} onChange={(value) => onSettingsChange({ gridUnit: value as Unit })} options={[{ value: 'cm', label: 'cm' }, { value: 'in', label: 'in' }, { value: 'px', label: 'px' }]} /></div><div className="quick-values">{[1, 2, 3, 5].map((value) => <button key={value} className={settings.gridSpacing === value ? 'active' : ''} onClick={() => onSettingsChange({ gridSpacing: value, gridUnit: 'cm' })}>{value} cm</button>)}</div></div>
          <div className="setting-block"><div className="setting-label"><label>{t('lineWidth')}</label><b>{settings.gridWidth}px</b></div><input className="range" type="range" min="0.5" max="5" step="0.5" value={settings.gridWidth} onChange={(event) => onSettingsChange({ gridWidth: Number(event.target.value) })} /></div>
          <div className="setting-block"><div className="setting-label"><label>{t('gridOpacity')}</label><b>{Math.round(settings.gridOpacity * 100)}%</b></div><input className="range" type="range" min="0.1" max="1" step="0.05" value={settings.gridOpacity} onChange={(event) => onSettingsChange({ gridOpacity: Number(event.target.value) })} /></div>
          <div className="setting-block"><div className="setting-label"><label>{t('lineColor')}</label><ColorPicker ariaLabel={t('lineColor')} value={settings.gridColor} onChange={(gridColor) => onSettingsChange({ gridColor })} presets={['#4e5968', '#1f2937', '#b7a894', '#a855f7', '#e2a84b']} /></div></div>
          <div className="setting-block"><div className="setting-label"><label>{t('offset')}</label><b>{settings.gridOffsetX}px / {settings.gridOffsetY}px</b></div><div className="field-grid"><label>X<input type="number" value={settings.gridOffsetX} onChange={(event) => onSettingsChange({ gridOffsetX: Number(event.target.value) })} /><span>px</span></label><label>Y<input type="number" value={settings.gridOffsetY} onChange={(event) => onSettingsChange({ gridOffsetY: Number(event.target.value) })} /><span>px</span></label></div></div>
          <div className="setting-block"><div className="setting-label"><label>{t('imageOpacity')}</label><b>{Math.round(settings.opacity * 100)}%</b></div><input className="range" type="range" min="0.1" max="1" step="0.05" value={settings.opacity} onChange={(event) => onSettingsChange({ opacity: Number(event.target.value) })} /></div>
        </fieldset>
      )}
      {activeTab === 'image' && (
        <fieldset className="settings-content" disabled={locked} aria-disabled={locked}>
          <div className="dropzone" onClick={onUploadClick}><Upload size={22} /><b>{image ? t('changeImage') : t('uploadImage')}</b><span>{t('fileTypes')}</span></div>
          {image ? (
            <>
              <div className="image-meta"><FileImage size={17} /><span>{image.name}</span><button onClick={onClearImage} aria-label={t('deleteImage')}><Trash2 size={15} /></button></div>
              <div className="setting-block"><div className="setting-label"><label>{t('position')}</label><b>{Math.round(image.x)} / {Math.round(image.y)} px</b></div><div className="field-grid"><label>X<input type="number" value={Math.round(image.x)} onChange={(event) => onImageChange({ ...image, x: Number(event.target.value) })} /><span>px</span></label><label>Y<input type="number" value={Math.round(image.y)} onChange={(event) => onImageChange({ ...image, y: Number(event.target.value) })} /><span>px</span></label></div></div>
              <div className="setting-block"><div className="setting-label"><label>{t('scale')}</label><b>{Math.round(image.scale * 100)}%</b></div><input className="range" type="range" min="0.05" max="4" step="0.01" value={image.scale} onChange={(event) => onImageChange({ ...image, scale: Number(event.target.value) })} /><small className="control-hint">{t('transformHint')}</small></div>
              <div className="setting-block"><div className="setting-label"><label>{t('rotation')}</label><b>{image.rotation}°</b></div><input className="range" type="range" min="-180" max="180" step="1" value={image.rotation} onChange={(event) => onImageChange({ ...image, rotation: Number(event.target.value) })} /><div className="quick-values"><button onClick={() => onImageChange({ ...image, rotation: 0 })}>0°</button><button onClick={() => onImageChange({ ...image, rotation: 90 })}>90°</button><button onClick={() => onImageChange({ ...image, rotation: 180 })}>180°</button><button onClick={() => onImageChange({ ...image, rotation: -90 })}>-90°</button></div></div>
              <div className="fit-actions"><button onClick={() => onFitImage('contain')}><Scan size={15} /> {t('fit')}</button><button onClick={() => onFitImage('cover')}><Maximize2 size={15} /> {t('cover')}</button><button onClick={onResetImage}><RotateCcw size={15} /> {t('reset')}</button></div>
              <div className="flip-actions"><button onClick={() => onImageChange({ ...image, flipX: !image.flipX })} className={image.flipX ? 'active' : ''}><ArrowLeftRight size={15} /> {t('flipX')}</button><button onClick={() => onImageChange({ ...image, flipY: !image.flipY })} className={image.flipY ? 'active' : ''}><ArrowUpDown size={15} /> {t('flipY')}</button></div>
              <div className="tip"><Move size={15} /> {t('imageTip')}</div>
            </>
          ) : <p className="helper-text">{t('imageHelper')}</p>}
        </fieldset>
      )}
      {activeTab === 'filters' && (
        <div className="settings-content">
          <p className="helper-text">{t('nonDestructiveFilters')}</p>
          {([{ key: 'original', title: t('original'), desc: t('naturalColor'), icon: FileImage }, { key: 'bw', title: t('blackAndWhite'), desc: t('drawingContrast'), icon: SlidersHorizontal }, { key: 'tone', title: t('softTone'), desc: t('warmReference'), icon: Sparkles }] as const).map(({ key, title, desc, icon: Icon }) => <button key={key} className={`filter-card ${settings.filter === key ? 'active' : ''}`} onClick={() => onSettingsChange({ filter: key })}><Icon size={18} /><span><b>{title}</b><small>{desc}</small></span>{settings.filter === key && <span className="check">✓</span>}</button>)}
          <div className="filter-controls">
            {settings.filter === 'tone' && (
              <>
                <div className="setting-block"><div className="setting-label"><label>{t('toneColor')}</label><ColorPicker ariaLabel={t('toneColor')} value={settings.adjustments.toneColor} onChange={(toneColor) => onAdjustmentChange({ toneColor })} presets={['#c58b5a', '#6b8fb3', '#7d9b76', '#8d6b9c', '#4e5968']} /></div></div>
                <div className="setting-block"><div className="setting-label"><label>{t('toneIntensity')}</label><b>{settings.adjustments.toneIntensity}%</b></div><input className="range" type="range" min="0" max="100" value={settings.adjustments.toneIntensity} onChange={(event) => onAdjustmentChange({ toneIntensity: Number(event.target.value) })} /></div>
              </>
            )}
            {settings.filter !== 'original' && (
              <>
                <div className="setting-block"><div className="setting-label"><label>{t('brightness')}</label><b>{settings.adjustments.brightness}%</b></div><input className="range" type="range" min="50" max="150" value={settings.adjustments.brightness} onChange={(event) => onAdjustmentChange({ brightness: Number(event.target.value) })} /></div>
                <div className="setting-block"><div className="setting-label"><label>{t('contrast')}</label><b>{settings.adjustments.contrast}%</b></div><input className="range" type="range" min="50" max="180" value={settings.adjustments.contrast} onChange={(event) => onAdjustmentChange({ contrast: Number(event.target.value) })} /></div>
                <div className="setting-block"><div className="setting-label"><label>{t('saturation')}</label><b>{settings.adjustments.saturation}%</b></div><input className="range" type="range" min="0" max="180" value={settings.adjustments.saturation} onChange={(event) => onAdjustmentChange({ saturation: Number(event.target.value) })} /></div>
              <div className="setting-block"><div className="setting-label"><label>{t('blur')}</label><b>{settings.adjustments.blur}px</b></div><input className="range" type="range" min="0" max="4" step="0.5" value={settings.adjustments.blur} onChange={(event) => onAdjustmentChange({ blur: Number(event.target.value) })} /></div>
              <button className="reset-button" onClick={() => onSettingsChange({ adjustments: { brightness: 100, contrast: 100, saturation: 100, blur: 0, toneColor: '#c58b5a', toneIntensity: 100 } })}><RotateCcw size={14} /> {t('resetFilters')}</button>
              </>
            )}
          </div>
        </div>
      )}
      <div className="panel-bottom"><button className="reset-button" onClick={onResetSettings}><RotateCcw size={14} /> {t('resetSettings')}</button></div>
    </aside>
  )
}
