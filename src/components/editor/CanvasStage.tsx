import { ImagePlus, LocateFixed, Maximize2, Minus, Move, Plus, Upload } from 'lucide-react'
import type { ChangeEvent, DragEvent, KeyboardEvent, PointerEvent, WheelEvent, RefObject } from 'react'
import { useLanguage } from '@i18n/useLanguage'

type CanvasStageProps = {
  canvasRef: RefObject<HTMLCanvasElement | null>
  fileInputRef: RefObject<HTMLInputElement | null>
  imageLoaded: boolean
  canvasWidth: number
  canvasHeight: number
  zoom: number
  pan: { x: number; y: number }
  canPan: boolean
  onZoomChange: (zoom: number) => void
  onCenterCanvas: () => void
  onViewportPointerDown: (event: PointerEvent<HTMLDivElement>) => void
  onViewportPointerMove: (event: PointerEvent<HTMLDivElement>) => void
  onViewportPointerUp: (event: PointerEvent<HTMLDivElement>) => void
  onPointerDown: (event: PointerEvent<HTMLCanvasElement>) => void
  onPointerMove: (event: PointerEvent<HTMLCanvasElement>) => void
  onPointerUp: () => void
  onWheel: (event: WheelEvent<HTMLCanvasElement>) => void
  onKeyDown: (event: KeyboardEvent<HTMLCanvasElement>) => void
  onDrop: (event: DragEvent<HTMLDivElement>) => void
  onUploadClick: () => void
  onFileChange: (event: ChangeEvent<HTMLInputElement>) => void
}

/**
 * Renders the central preview stage and its canvas interaction surface.
 *
 * @param props - Preview dimensions, zoom state and interaction callbacks.
 * @returns The canvas stage.
 */
export function CanvasStage({
  canvasRef,
  fileInputRef,
  imageLoaded,
  canvasWidth,
  canvasHeight,
  zoom,
  pan,
  canPan,
  onZoomChange,
  onCenterCanvas,
  onViewportPointerDown,
  onViewportPointerMove,
  onViewportPointerUp,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onWheel,
  onKeyDown,
  onDrop,
  onUploadClick,
  onFileChange,
}: CanvasStageProps) {
  const { t } = useLanguage()
  return (
    <section className="canvas-stage">
      <div className="stage-toolbar">
        <div className="toolbar-label"><span className="status-dot" /> {t('preview')} <span className="separator" /> {Math.round(canvasWidth)} × {Math.round(canvasHeight)} px</div>
        <div className="zoom-controls">
          <button onClick={() => onZoomChange(Math.max(30, zoom - 10))} aria-label={t('zoomOut')}><Minus size={15} /></button>
          <span>{zoom}%</span>
          <button onClick={() => onZoomChange(Math.min(150, zoom + 10))} aria-label={t('zoomIn')}><Plus size={15} /></button>
          <button onClick={() => onZoomChange(72)} aria-label={t('resetZoom')}><Maximize2 size={15} /></button>
          <button onClick={onCenterCanvas} aria-label={t('centerCanvas')}><LocateFixed size={15} /></button>
        </div>
      </div>
      <div
        className={`canvas-viewport ${canPan ? 'pannable' : ''}`}
        onPointerDown={onViewportPointerDown}
        onPointerMove={onViewportPointerMove}
        onPointerUp={onViewportPointerUp}
        onPointerCancel={onViewportPointerUp}
      >
        <div className="canvas-wrap" style={{ transform: `translate(calc(-50% + ${pan.x}px), calc(-50% + ${pan.y}px)) scale(${zoom / 72})` }} onDragOver={(event) => event.preventDefault()} onDrop={onDrop}>
          <canvas
            ref={canvasRef}
            tabIndex={0}
            aria-label={t('canvasAria')}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            onWheel={onWheel}
            onKeyDown={onKeyDown}
          />
          {!imageLoaded && (
            <div className="empty-canvas">
              <div className="empty-icon"><ImagePlus size={24} /></div>
              <b>{t('addReference')}</b>
              <span>{t('dropReference')}</span>
              <button className="upload-button" onClick={onUploadClick}><Upload size={15} /> {t('uploadImage')}</button>
            </div>
          )}
        </div>
      </div>
      <input ref={fileInputRef} type="file" accept="image/*" onChange={onFileChange} hidden />
      <div className="stage-footer"><span><Move size={14} /> {t('dragToMove')}</span><span className="ready"><span className="status-dot" /> {t('ready')}</span></div>
    </section>
  )
}
