/** Units supported by the canvas and grid controls. */
export type Unit = 'cm' | 'in' | 'px'

/** Orientation used to arrange the logical canvas dimensions. */
export type Orientation = 'portrait' | 'landscape'

/** Non-destructive image treatments available in the editor. */
export type Filter = 'original' | 'bw' | 'tone'

/** Identifiers for built-in and user-created editor layers. */
export type LayerId = 'background' | 'image' | 'grid' | `custom-${string}`

/** Serializable settings that define the canvas and grid appearance. */
export type CanvasSettings = {
  name: string
  width: number
  height: number
  unit: Unit
  orientation: Orientation
  dpi: number
  gridSpacing: number
  gridUnit: Unit
  gridColor: string
  gridWidth: number
  gridOpacity: number
  gridOffsetX: number
  gridOffsetY: number
  filter: Filter
  opacity: number
  adjustments: FilterAdjustments
}

/** Local image metadata and its non-destructive transformation state. */
export type ImageState = {
  src: string
  name: string
  x: number
  y: number
  scale: number
  rotation: number
  flipX: boolean
  flipY: boolean
  width: number
  height: number
}

/** Non-destructive tonal adjustments applied before rendering an image. */
export type FilterAdjustments = {
  brightness: number
  contrast: number
  saturation: number
  blur: number
  toneColor: string
  toneIntensity: number
}

/** Visibility state for the built-in editor layers. */
export type LayerVisibility = Record<LayerId, boolean>

/** Display metadata for one editor layer. */
export type LayerDefinition = {
  id: LayerId
  name: string
  kind: LayerId
}
