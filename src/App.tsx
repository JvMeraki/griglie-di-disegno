import { useEffect, useMemo, useRef, useState } from 'react'
import type { ChangeEvent, DragEvent, KeyboardEvent, PointerEvent, WheelEvent } from 'react'
import JSZip from 'jszip'
import './App.css'
import { A3, A4, defaultSettings, MAX_PREVIEW } from '@domain/constants'
import { clampImagePosition, convertValue, getCanvasSize, getOrientedDimensions, getPreviewSize, toPixels } from '@domain/geometry'
import { createImageState, fitImageToCanvas, resetImageTransform as resetImageTransformState } from '@domain/image'
import { canvasToBlob, exportVariants, downloadBlob, renderExportVariant } from '@domain/export'
import { loadSettings, saveSettings } from '@domain/storage'
import type { CanvasSettings, FilterAdjustments, ImageState, LayerDefinition, LayerId, Unit } from '@domain/types'
import type { CanvasPreset } from '@components/editor/types'
import { CanvasStage } from '@components/editor/CanvasStage'
import { EditorHeader } from '@components/editor/EditorHeader'
import { EditorSidebar } from '@components/editor/EditorSidebar'
import { ExportModal } from '@components/editor/ExportModal'
import { SettingsPanel } from '@components/editor/SettingsPanel'
import { useCanvasPreview } from '@hooks/useCanvasPreview'
import { useLanguage } from '@i18n/useLanguage'

function getCanvasPreset(settings: CanvasSettings): CanvasPreset {
  if (settings.unit !== 'cm') return 'custom'
  if (settings.width === A3.width && settings.height === A3.height) return 'a3'
  if (settings.width === A4.width && settings.height === A4.height) return 'a4'
  return 'custom'
}

function App() {
  const { language, t } = useLanguage()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [settings, setSettings] = useState<CanvasSettings>(loadSettings)
  const [canvasPreset, setCanvasPreset] = useState<CanvasPreset>(() => getCanvasPreset(loadSettings()))
  const [image, setImage] = useState<ImageState | null>(null)
  const [layers, setLayers] = useState<Record<LayerId, boolean>>({
    background: true,
    image: true,
    grid: true,
  })
  const [lockedLayers, setLockedLayers] = useState<Record<LayerId, boolean>>({
    background: true,
    image: false,
    grid: false,
  })
  const [activeLayer, setActiveLayer] = useState<LayerId>('grid')
  const [layerOrder, setLayerOrder] = useState<LayerId[]>(['background', 'image', 'grid'])
  const [layerNames, setLayerNames] = useState<Record<LayerId, string>>({
    background: t('layerCanvas'),
    image: t('layerReference'),
    grid: t('layerGrid'),
  })
  const [zoom, setZoom] = useState(72)
  const [canvasPan, setCanvasPan] = useState({ x: 0, y: 0 })
  const [activeTab, setActiveTab] = useState<'grid' | 'image' | 'filters'>('grid')
  const [showExport, setShowExport] = useState(false)
  const [selectedExports, setSelectedExports] = useState({
    original: true,
    filter: true,
    grid: true,
    filterGrid: true,
  })
  const [exportFormat, setExportFormat] = useState<'png' | 'jpg'>('png')
  const [exportQuality, setExportQuality] = useState(0.92)
  const [exportDpi, setExportDpi] = useState(settings.dpi)
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null)
  const panStart = useRef<{ x: number; y: number; panX: number; panY: number } | null>(null)
  const [toast, setToast] = useState('')
  const previousLanguage = useRef(language)

  const canvasSize = useMemo(
    () => {
      const dimensions = getOrientedDimensions(settings.width, settings.height, settings.orientation)
      return getCanvasSize(dimensions.width, dimensions.height, settings.unit, settings.dpi)
    },
    [settings],
  )

  const previewSize = useMemo(() => {
    return getPreviewSize(canvasSize, MAX_PREVIEW)
  }, [canvasSize])

  const gridPx = useMemo(
    () => toPixels(settings.gridSpacing, settings.gridUnit, settings.dpi) * previewSize.ratio,
    [settings.gridSpacing, settings.gridUnit, settings.dpi, previewSize.ratio],
  )

  useEffect(() => {
    saveSettings(settings)
  }, [settings])

  useEffect(() => {
    if (previousLanguage.current === language) return
    const previousDefaults = previousLanguage.current === 'es'
      ? { background: 'Lienzo', image: 'Imagen de referencia', grid: 'Cuadrícula' }
      : { background: 'Canvas', image: 'Reference image', grid: 'Grid' }
    const nextDefaults = {
      background: t('layerCanvas'),
      image: t('layerReference'),
      grid: t('layerGrid'),
    }
    setLayerNames((current) => ({
      background: current.background === previousDefaults.background ? nextDefaults.background : current.background,
      image: current.image === previousDefaults.image ? nextDefaults.image : current.image,
      grid: current.grid === previousDefaults.grid ? nextDefaults.grid : current.grid,
    }))
    previousLanguage.current = language
  }, [language, t])

  useCanvasPreview({
    canvasRef,
    previewSize,
    gridPx,
    image,
    settings,
    layers,
    layerOrder,
    activeLayer,
  })

  function updateSettings(patch: Partial<CanvasSettings>) {
    if (['width', 'height', 'unit', 'dpi', 'orientation'].some((key) => key in patch)) {
      setCanvasPan({ x: 0, y: 0 })
    }
    setSettings((current) => ({ ...current, ...patch }))
  }

  function resetEditableSettings() {
    setSettings((current) => ({
      ...defaultSettings,
      width: current.width,
      height: current.height,
      unit: current.unit,
      orientation: current.orientation,
      dpi: current.dpi,
    }))
  }

  function updateAdjustment(patch: Partial<FilterAdjustments>) {
    updateSettings({ adjustments: { ...settings.adjustments, ...patch } })
  }

  function applyPreset(preset: 'a4' | 'a3' | 'custom') {
    setCanvasPreset(preset)
    if (preset === 'custom') return
    const dimensions = preset === 'a4' ? A4 : A3
    updateSettings({ width: dimensions.width, height: dimensions.height, unit: 'cm' })
  }

  function updateCanvasSettings(patch: Partial<CanvasSettings>) {
    if ('width' in patch || 'height' in patch || 'unit' in patch) setCanvasPreset('custom')
    updateSettings(patch)
  }

  function changeCanvasUnit(unit: Unit) {
    if (unit === settings.unit) return
    updateSettings({
      width: convertValue(settings.width, settings.unit, unit, settings.dpi),
      height: convertValue(settings.height, settings.unit, unit, settings.dpi),
      unit,
    })
  }

  function changeOrientation(orientation: CanvasSettings['orientation']) {
    if (orientation === settings.orientation) return
    updateSettings({ orientation })
  }

  function addImageFile(file?: File) {
    if (!file) return
    const url = URL.createObjectURL(file)
    const picture = new Image()
    picture.onload = () => {
      setImage(createImageState(url, file.name, { width: picture.width, height: picture.height }, canvasSize))
      setToast(t('imageAdded'))
      window.setTimeout(() => setToast(''), 2200)
    }
    picture.src = url
  }

  function handleFile(event: ChangeEvent<HTMLInputElement>) {
    addImageFile(event.target.files?.[0])
    event.target.value = ''
  }

  function handleImageDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault()
    addImageFile(event.dataTransfer.files?.[0])
  }

  function clearImage() {
    if (image) URL.revokeObjectURL(image.src)
    setImage(null)
  }

  function saveProject() {
    saveSettings(settings)
    setToast(t('settingsSaved'))
    window.setTimeout(() => setToast(''), 2200)
  }

  function handleCanvasPointerDown(event: PointerEvent<HTMLCanvasElement>) {
    if (!image || activeLayer !== 'image' || lockedLayers.image) return
    event.currentTarget.setPointerCapture(event.pointerId)
    setDragStart({ x: event.clientX, y: event.clientY })
  }

  function handleViewportPointerDown(event: PointerEvent<HTMLDivElement>) {
    const canPan = !image || activeLayer !== 'image' || lockedLayers.image
    if (!canPan || event.button !== 0 || (event.target as HTMLElement).closest('button')) return
    panStart.current = {
      x: event.clientX,
      y: event.clientY,
      panX: canvasPan.x,
      panY: canvasPan.y,
    }
  }

  function handleViewportPointerMove(event: PointerEvent<HTMLDivElement>) {
    if (!panStart.current) return
    setCanvasPan({
      x: panStart.current.panX + event.clientX - panStart.current.x,
      y: panStart.current.panY + event.clientY - panStart.current.y,
    })
  }

  function handleViewportPointerUp() {
    panStart.current = null
  }

  function handleCanvasWheel(event: WheelEvent<HTMLCanvasElement>) {
    event.preventDefault()
    if (image && activeLayer === 'image' && !lockedLayers.image) {
      const nextScale = Math.min(4, Math.max(0.05, image.scale * (event.deltaY > 0 ? 0.94 : 1.06)))
      setImage({ ...image, scale: nextScale })
      return
    }
    setZoom((current) => Math.min(150, Math.max(30, current + (event.deltaY > 0 ? -5 : 5))))
  }

  function fitImage(mode: 'contain' | 'cover') {
    if (!image || lockedLayers.image) return
    setImage(fitImageToCanvas(image, canvasSize, mode))
  }

  function resetImageTransform() {
    if (!image || lockedLayers.image) return
    setImage(resetImageTransformState(image, canvasSize))
  }

  function handleCanvasPointerMove(event: PointerEvent<HTMLCanvasElement>) {
    if (!dragStart || !image || lockedLayers.image) return
    const deltaX = (event.clientX - dragStart.x) / previewSize.ratio / (zoom / 72)
    const deltaY = (event.clientY - dragStart.y) / previewSize.ratio / (zoom / 72)
    const position = clampImagePosition(
      { x: image.x + deltaX, y: image.y + deltaY },
      { width: image.width, height: image.height },
      image.scale,
      canvasSize,
    )
    setImage({ ...image, ...position })
    setDragStart({ x: event.clientX, y: event.clientY })
  }

  /**
   * Moves or scales the selected image with keyboard controls.
   *
   * @param event - Keyboard event from the preview canvas.
   */
  function handleCanvasKeyDown(event: KeyboardEvent<HTMLCanvasElement>) {
    if (!image || activeLayer !== 'image' || lockedLayers.image) return
    const step = event.shiftKey ? 10 : 2
    let position = { x: image.x, y: image.y }
    if (event.key === 'ArrowLeft') position.x -= step
    if (event.key === 'ArrowRight') position.x += step
    if (event.key === 'ArrowUp') position.y -= step
    if (event.key === 'ArrowDown') position.y += step
    if (event.key === '+' || event.key === '=') {
      event.preventDefault()
      setImage({ ...image, scale: Math.min(4, image.scale * 1.03) })
      return
    }
    if (event.key === '-' || event.key === '_') {
      event.preventDefault()
      setImage({ ...image, scale: Math.max(0.05, image.scale * 0.97) })
      return
    }
    if (position.x !== image.x || position.y !== image.y) {
      event.preventDefault()
      setImage({ ...image, ...clampImagePosition(position, { width: image.width, height: image.height }, image.scale, canvasSize) })
    }
  }

  function toggleLayer(id: LayerId) {
    setLayers((current) => ({ ...current, [id]: !current[id] }))
  }

  function toggleLayerLock(id: LayerId) {
    setLockedLayers((current) => ({ ...current, [id]: !current[id] }))
  }

  function addLayer() {
    const id = `custom-${Date.now()}` as LayerId
    const customLayerCount = layerOrder.filter((layerId) => layerId.startsWith('custom-')).length + 1
    setLayerNames((current) => ({ ...current, [id]: `${t('newLayer')} ${customLayerCount}` }))
    setLayers((current) => ({ ...current, [id]: true }))
    setLockedLayers((current) => ({ ...current, [id]: false }))
    setLayerOrder((current) => [...current, id])
    setActiveLayer(id)
  }

  /**
   * Moves a layer one position within the composition stack.
   *
   * @param id - Layer to move.
   * @param direction - Direction in the visual stack.
   */
  function moveLayer(id: LayerId, direction: 'up' | 'down') {
    setLayerOrder((current) => {
      const index = current.indexOf(id)
      const target = direction === 'up' ? index - 1 : index + 1
      if (index < 0 || target < 0 || target >= current.length) return current
      const next = [...current]
      const [layer] = next.splice(index, 1)
      next.splice(target, 0, layer)
      return next
    })
  }

  function reorderLayers(sourceId: LayerId, targetId: LayerId, placement: 'before' | 'after') {
    setLayerOrder((current) => {
      const sourceIndex = current.indexOf(sourceId)
      const targetIndex = current.indexOf(targetId)
      if (sourceIndex < 0 || targetIndex < 0 || sourceIndex === targetIndex) return current
      const next = [...current]
      next.splice(sourceIndex, 1)
      const adjustedTargetIndex = next.indexOf(targetId)
      next.splice(adjustedTargetIndex + (placement === 'after' ? 1 : 0), 0, sourceId)
      return next
    })
  }

  function updateEditableSettings(patch: Partial<CanvasSettings>) {
    if (lockedLayers.grid && activeTab === 'grid') return
    updateSettings(patch)
  }

  function renameLayer(id: LayerId, name: string) {
    if (name.trim()) setLayerNames((current) => ({ ...current, [id]: name.trim() }))
  }

  async function exportImages(asZip = false) {
    const chosen = exportVariants.filter(({ key }) => selectedExports[key])
    if (!chosen.length) return
    const files = await Promise.all(chosen.map(async ({ key, label }) => ({ output: await renderExportVariant(key, settings, image, canvasSize, exportDpi), label })))
    if (asZip) {
      const zip = new JSZip()
      await Promise.all(
        files.map(
          ({ output, label }) =>
            new Promise<void>((resolve) => {
            output.toBlob((blob: Blob | null) => {
              if (blob) zip.file(`${settings.name} - ${label}.${exportFormat}`, blob)
                resolve()
            }, exportFormat === 'jpg' ? 'image/jpeg' : 'image/png', exportQuality)
            }),
        ),
      )
      const blob = await zip.generateAsync({ type: 'blob' })
      downloadBlob(blob, `${settings.name} - paquete.zip`)
    } else {
      const mimeType = exportFormat === 'jpg' ? 'image/jpeg' : 'image/png'
      for (const { output, label } of files) {
        const blob = await canvasToBlob(output, mimeType, exportQuality)
        if (blob) downloadBlob(blob, `${settings.name} - ${label}.${exportFormat}`)
        await new Promise((resolve) => window.setTimeout(resolve, 180))
      }
    }
    setShowExport(false)
    setToast(asZip ? t('packageExported') : t('exportsReady'))
    window.setTimeout(() => setToast(''), 2600)
  }

  const layerRows: LayerDefinition[] = layerOrder.map((id) => ({
    id,
    name: layerNames[id],
    kind: id,
  }))

  return (
    <div className="app-shell">
      <EditorHeader
        settings={settings}
        onNameChange={(name) => updateSettings({ name })}
        onSave={saveProject}
        onExport={() => setShowExport(true)}
      />

      <main className="workspace">
        <EditorSidebar
          settings={settings}
          canvasPreset={canvasPreset}
          activeTab={activeTab}
          rows={layerRows}
          activeLayer={activeLayer}
          visibility={layers}
          locks={lockedLayers}
          onTabChange={setActiveTab}
          onSettingsChange={updateCanvasSettings}
          onPreset={applyPreset}
          onUnitChange={changeCanvasUnit}
          onOrientationChange={changeOrientation}
          onLayerSelect={setActiveLayer}
          onLayerRename={renameLayer}
          onLayerVisibility={toggleLayer}
          onLayerLock={toggleLayerLock}
          onLayerMove={moveLayer}
          onLayerReorder={reorderLayers}
          onLayerAdd={addLayer}
        />

        <CanvasStage
          canvasRef={canvasRef}
          fileInputRef={fileInputRef}
          imageLoaded={Boolean(image)}
          canvasWidth={canvasSize.width}
          canvasHeight={canvasSize.height}
          zoom={zoom}
          pan={canvasPan}
          canPan={!image || activeLayer !== 'image' || lockedLayers.image}
          onZoomChange={setZoom}
          onCenterCanvas={() => setCanvasPan({ x: 0, y: 0 })}
          onViewportPointerDown={handleViewportPointerDown}
          onViewportPointerMove={handleViewportPointerMove}
          onViewportPointerUp={handleViewportPointerUp}
          onPointerDown={handleCanvasPointerDown}
          onPointerMove={handleCanvasPointerMove}
          onPointerUp={() => setDragStart(null)}
          onWheel={handleCanvasWheel}
          onKeyDown={handleCanvasKeyDown}
          onDrop={handleImageDrop}
          onUploadClick={() => fileInputRef.current?.click()}
          onFileChange={handleFile}
        />

        <SettingsPanel
          activeTab={activeTab}
          settings={settings}
          image={image}
          onSettingsChange={updateEditableSettings}
          onAdjustmentChange={updateAdjustment}
          onImageChange={(nextImage) => {
            if (!lockedLayers.image) setImage(nextImage)
          }}
          onClearImage={() => {
            if (!lockedLayers.image) clearImage()
          }}
          onFitImage={fitImage}
          onResetImage={resetImageTransform}
          onUploadClick={() => fileInputRef.current?.click()}
          onResetSettings={resetEditableSettings}
          locked={activeTab === 'grid' ? lockedLayers.grid : activeTab === 'image' ? lockedLayers.image : false}
        />
      </main>

      {showExport && <ExportModal
        canvasWidth={canvasSize.width}
        canvasHeight={canvasSize.height}
        sourceDpi={settings.dpi}
        exportDpi={exportDpi}
        format={exportFormat}
        quality={exportQuality}
        selection={selectedExports}
        onClose={() => setShowExport(false)}
        onFormatChange={setExportFormat}
        onDpiChange={setExportDpi}
        onQualityChange={setExportQuality}
        onSelectionChange={setSelectedExports}
        onExport={exportImages}
      />}
      {toast && <div className="toast">{toast}</div>}
    </div>
  )
}

export default App
