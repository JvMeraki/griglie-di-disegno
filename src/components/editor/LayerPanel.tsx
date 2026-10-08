import { useEffect, useRef, useState, type DragEvent } from 'react'
import { ChevronDown, ChevronUp, Eye, EyeOff, FileImage, Grid3X3, GripVertical, Layers3, Lock } from 'lucide-react'
import type { LayerId } from '@domain/types'
import type { LayerPanelProps } from '@components/editor/types'
import { useLanguage } from '@i18n/useLanguage'

const layerIcons: Partial<Record<LayerId, typeof Grid3X3>> = {
  grid: Grid3X3,
  image: FileImage,
  background: Layers3,
}

/**
 * Renders the composition layer list and layer actions.
 *
 * @param props - Layer rows, state and mutation callbacks.
 * @returns The layer panel section.
 */
export function LayerPanel({
  rows,
  activeLayer,
  visibility,
  locks,
  onSelect,
  onRename,
  onToggleVisibility,
  onToggleLock,
  onMove,
  onReorder,
  onAdd,
}: LayerPanelProps) {
  const { t } = useLanguage()
  const [draggedLayer, setDraggedLayer] = useState<LayerId | null>(null)
  const [dropTarget, setDropTarget] = useState<{ id: LayerId; placement: 'before' | 'after' } | null>(null)
  const [editingLayer, setEditingLayer] = useState<LayerId | null>(null)
  const [editingName, setEditingName] = useState('')
  const renameInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editingLayer) renameInputRef.current?.focus()
  }, [editingLayer])

  function startRename(id: LayerId, name: string) {
    setEditingLayer(id)
    setEditingName(name)
  }

  function commitRename() {
    if (!editingLayer) return
    onRename(editingLayer, editingName)
    setEditingLayer(null)
  }

  function getDropPlacement(event: DragEvent<HTMLDivElement>): 'before' | 'after' {
    const bounds = event.currentTarget.getBoundingClientRect()
    return event.clientY < bounds.top + bounds.height / 2 ? 'before' : 'after'
  }

  return (
    <section className="panel-section layers">
      <div className="section-title"><span>{t('layers')}</span><button className="icon-button" onClick={onAdd} aria-label={t('addLayer')}><span>+</span></button></div>
      {rows.map(({ id, name }) => {
        const Icon = layerIcons[id] ?? Layers3
        return (
          <div
            key={id}
            className={`layer-row ${activeLayer === id ? 'active' : ''} ${draggedLayer === id ? 'dragging' : ''} ${dropTarget?.id === id ? `drop-${dropTarget.placement}` : ''}`}
            draggable
            onDragStart={(event) => {
              setDraggedLayer(id)
              setDropTarget(null)
              event.dataTransfer.effectAllowed = 'move'
              event.dataTransfer.setData('text/plain', id)
            }}
            onDragOver={(event) => {
              event.preventDefault()
              if (draggedLayer === id) return
              const placement = getDropPlacement(event)
              setDropTarget({ id, placement })
              event.dataTransfer.dropEffect = 'move'
            }}
            onDrop={(event) => {
              event.preventDefault()
              const sourceId = event.dataTransfer.getData('text/plain') as LayerId
              const placement = getDropPlacement(event)
              if (sourceId && sourceId !== id) onReorder(sourceId, id, placement)
              setDraggedLayer(null)
              setDropTarget(null)
            }}
            onDragEnd={() => {
              setDraggedLayer(null)
              setDropTarget(null)
            }}
          >
            {dropTarget?.id === id && <span className={`drop-indicator ${dropTarget.placement}`} aria-label={t(dropTarget.placement === 'before' ? 'dropBefore' : 'dropAfter', { name })} />}
            {editingLayer === id ? (
              <form
                className="layer-edit"
                onSubmit={(event) => {
                  event.preventDefault()
                  commitRename()
                }}
                onPointerDown={(event) => event.stopPropagation()}
              >
                <input
                  ref={renameInputRef}
                  value={editingName}
                  aria-label={t('renameLayerPrompt')}
                  onChange={(event) => setEditingName(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Escape') setEditingLayer(null)
                  }}
                />
                <button type="submit" aria-label={t('saveRename')}>✓</button>
                <button type="button" onClick={() => setEditingLayer(null)} aria-label={t('cancelRename')}>×</button>
              </form>
            ) : <button className="layer-main" onClick={() => onSelect(id)}>
              <GripVertical size={13} className="layer-grip" />
              <Icon size={16} className={visibility[id] ? undefined : 'layer-icon-hidden'} />
              <span className={`layer-name ${visibility[id] ? '' : 'layer-name-muted'}`}>{name}</span>
            </button>}
            {editingLayer !== id && <button className="layer-actions" onPointerDown={(event) => event.stopPropagation()} onClick={() => startRename(id, name)} title={t('renameLayer')} aria-label={`${t('renameLayer')} ${name}`}>Aa</button>}
            <button className="layer-actions" onPointerDown={(event) => event.stopPropagation()} onClick={() => onToggleVisibility(id)} aria-label={t(visibility[id] ? 'hideLayer' : 'showLayer', { name })}>
              {visibility[id] ? <Eye size={15} /> : <EyeOff size={15} />}
            </button>
            <button className="layer-actions" onPointerDown={(event) => event.stopPropagation()} onClick={() => onToggleLock(id)} aria-label={t(locks[id] ? 'unlockLayer' : 'lockLayer', { name })}>
              {locks[id] ? <Lock size={13} className="lock" /> : <Lock size={13} className="lock unlocked" />}
            </button>
            <span className="layer-actions stack-actions">
              <button onPointerDown={(event) => event.stopPropagation()} onClick={() => onMove(id, 'up')} aria-label={t('moveLayerUp', { name })}><ChevronUp size={13} /></button>
              <button onPointerDown={(event) => event.stopPropagation()} onClick={() => onMove(id, 'down')} aria-label={t('moveLayerDown', { name })}><ChevronDown size={13} /></button>
            </span>
          </div>
        )
      })}
    </section>
  )
}
