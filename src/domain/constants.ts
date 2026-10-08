import type { CanvasSettings } from './types'

/** A4 dimensions in centimetres, using portrait orientation as the base. */
export const A4 = { width: 21, height: 29.7 }

/** A3 dimensions in centimetres, using portrait orientation as the base. */
export const A3 = { width: 29.7, height: 42 }

/** Maximum logical preview dimension before the canvas is scaled down. */
export const MAX_PREVIEW = 1200

/** Default project settings used for new projects and migration fallbacks. */
export const defaultSettings: CanvasSettings = {
  name: 'Mi referencia',
  width: A4.width,
  height: A4.height,
  unit: 'cm',
  orientation: 'portrait',
  dpi: 150,
  gridSpacing: 1,
  gridUnit: 'cm',
  gridColor: '#4e5968',
  gridWidth: 1,
  gridOpacity: 0.72,
  gridOffsetX: 0,
  gridOffsetY: 0,
  filter: 'original',
  opacity: 0.82,
  adjustments: {
    brightness: 100,
    contrast: 100,
    saturation: 100,
    blur: 0,
    toneColor: '#c58b5a',
    toneIntensity: 100,
  },
}
