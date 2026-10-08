import type { CanvasSettings, LayerDefinition, LayerId } from '@domain/types'

/** Available settings panels in the editor workspace. */
export type EditorTab = 'grid' | 'image' | 'filters'

/** Canvas size preset currently selected in the editor. */
export type CanvasPreset = 'a4' | 'a3' | 'custom'

/** Export variants selected in the export dialog. */
export type ExportSelection = Record<'original' | 'filter' | 'grid' | 'filterGrid', boolean>

/** Visibility flags for the built-in composition layers. */
export type LayerVisibility = Record<LayerId, boolean>

/** Lock flags for the built-in composition layers. */
export type LayerLocks = Record<LayerId, boolean>

/** Human-readable names assigned to built-in composition layers. */
export type LayerNames = Record<LayerId, string>

/** Props shared by the editor header. */
export type EditorHeaderProps = {
  settings: CanvasSettings
  onNameChange: (name: string) => void
  onSave: () => void
  onExport: () => void
}

/** Layer data rendered by the layer panel. */
export type LayerPanelProps = {
  rows: LayerDefinition[]
  activeLayer: LayerId
  visibility: LayerVisibility
  locks: LayerLocks
  onSelect: (id: LayerId) => void
  onRename: (id: LayerId, name: string) => void
  onToggleVisibility: (id: LayerId) => void
  onToggleLock: (id: LayerId) => void
  onMove: (id: LayerId, direction: 'up' | 'down') => void
  onReorder: (sourceId: LayerId, targetId: LayerId, placement: 'before' | 'after') => void
  onAdd: () => void
}
