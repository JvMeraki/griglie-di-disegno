import { ChevronDown, Grid3X3, ImagePlus, Settings2, SlidersHorizontal } from 'lucide-react'
import type { CanvasSettings, LayerDefinition, LayerId, Unit } from '@domain/types'
import { LayerPanel } from '@components/editor/LayerPanel'
import type { CanvasPreset, EditorTab, LayerLocks, LayerVisibility } from '@components/editor/types'
import { Select } from '@components/ui/Select'
import { useLanguage } from '@i18n/useLanguage'

type EditorSidebarProps = {
  settings: CanvasSettings
  activeTab: EditorTab
  canvasPreset: CanvasPreset
  rows: LayerDefinition[]
  activeLayer: LayerId
  visibility: LayerVisibility
  locks: LayerLocks
  onTabChange: (tab: EditorTab) => void
  onSettingsChange: (patch: Partial<CanvasSettings>) => void
  onPreset: (preset: 'a4' | 'a3' | 'custom') => void
  onUnitChange: (unit: Unit) => void
  onOrientationChange: (orientation: CanvasSettings['orientation']) => void
  onLayerSelect: (id: LayerId) => void
  onLayerRename: (id: LayerId, name: string) => void
  onLayerVisibility: (id: LayerId) => void
  onLayerLock: (id: LayerId) => void
  onLayerMove: (id: LayerId, direction: 'up' | 'down') => void
  onLayerReorder: (sourceId: LayerId, targetId: LayerId, placement: 'before' | 'after') => void
  onLayerAdd: () => void
}

/**
 * Renders the tool navigation, canvas controls and layer panel.
 *
 * @param props - Editor state and callbacks for canvas and layer changes.
 * @returns The left editor sidebar.
 */
export function EditorSidebar({
  settings,
  activeTab,
  canvasPreset,
  rows,
  activeLayer,
  visibility,
  locks,
  onTabChange,
  onSettingsChange,
  onPreset,
  onUnitChange,
  onOrientationChange,
  onLayerSelect,
  onLayerRename,
  onLayerVisibility,
  onLayerLock,
  onLayerMove,
  onLayerReorder,
  onLayerAdd,
}: EditorSidebarProps) {
  const { t } = useLanguage()
  return (
    <aside className="sidebar left-panel">
      <div className="panel-heading"><span>{t('tools')}</span><Settings2 size={16} /></div>
      <button className={`tool-card ${activeTab === 'grid' ? 'selected' : ''}`} onClick={() => onTabChange('grid')}><Grid3X3 size={18} /><span><b>{t('grid')}</b><small>{t('gridDescription')}</small></span><ChevronDown size={15} /></button>
      <button className={`tool-card ${activeTab === 'image' ? 'selected' : ''}`} onClick={() => onTabChange('image')}><ImagePlus size={18} /><span><b>{t('image')}</b><small>{t('imageDescription')}</small></span><ChevronDown size={15} /></button>
      <button className={`tool-card ${activeTab === 'filters' ? 'selected' : ''}`} onClick={() => onTabChange('filters')}><SlidersHorizontal size={18} /><span><b>{t('filters')}</b><small>{t('filtersDescription')}</small></span><ChevronDown size={15} /></button>

      <section className="panel-section">
        <div className="section-title"><span>{t('canvas')}</span><span className="muted">{canvasPreset.toUpperCase()}</span></div>
        <div className="preset-row">
          <button className={canvasPreset === 'a4' ? 'preset active' : 'preset'} onClick={() => onPreset('a4')}><b>A4</b><small>21 × 29.7 cm</small></button>
          <button className={canvasPreset === 'a3' ? 'preset active' : 'preset'} onClick={() => onPreset('a3')}><b>A3</b><small>29.7 × 42 cm</small></button>
          <button className={canvasPreset === 'custom' ? 'preset active' : 'preset'} onClick={() => onPreset('custom')}><b>{t('custom')}</b><small>{t('customDescription')}</small></button>
        </div>
        {canvasPreset === 'custom' && <div className="field-grid">
          <label>{t('width')}<input type="number" value={settings.width} min="1" onChange={(event) => onSettingsChange({ width: Number(event.target.value) })} /><span>{settings.unit}</span></label>
          <label>{t('height')}<input type="number" value={settings.height} min="1" onChange={(event) => onSettingsChange({ height: Number(event.target.value) })} /><span>{settings.unit}</span></label>
        </div>}
        <div className="field-row"><label>{t('orientation')}</label><Select ariaLabel={t('orientation')} value={settings.orientation} onChange={(value) => onOrientationChange(value as CanvasSettings['orientation'])} options={[{ value: 'portrait', label: t('portrait') }, { value: 'landscape', label: t('landscape') }]} /></div>
        {canvasPreset === 'custom' && <div className="field-row"><label>{t('unit')}</label><Select ariaLabel={t('unit')} value={settings.unit} onChange={(value) => onUnitChange(value as Unit)} options={[{ value: 'cm', label: t('centimeters') }, { value: 'in', label: t('inches') }, { value: 'px', label: t('pixels') }]} /></div>}
        <div className="field-row"><label>{t('resolution')}</label><Select ariaLabel={t('resolution')} value={String(settings.dpi)} onChange={(value) => onSettingsChange({ dpi: Number(value) })} options={[{ value: '96', label: `96 DPI · ${t('screenDpi')}` }, { value: '150', label: `150 DPI · ${t('recommendedDpi')}` }, { value: '300', label: `300 DPI · ${t('printDpi')}` }]} /></div>
      </section>

      <LayerPanel
        rows={rows}
        activeLayer={activeLayer}
        visibility={visibility}
        locks={locks}
        onSelect={onLayerSelect}
        onRename={onLayerRename}
        onToggleVisibility={onLayerVisibility}
        onToggleLock={onLayerLock}
        onMove={onLayerMove}
        onReorder={onLayerReorder}
        onAdd={onLayerAdd}
      />
    </aside>
  )
}
