import type { CanvasSettings, ImageState } from './types'
import { toPixels, type Size } from './geometry'
import { drawGrid } from '@rendering/grid'
import { createProcessedSource, getImageFilter } from './filters'

/** Supported exported composition variants. */
export type ExportVariant = 'original' | 'filter' | 'grid' | 'filterGrid'

/** Exported variant with the user-facing file label. */
export type ExportVariantDefinition = { key: ExportVariant; label: string }

export const exportVariants: ExportVariantDefinition[] = [
  { key: 'original', label: 'Original' },
  { key: 'filter', label: 'Filtro' },
  { key: 'grid', label: 'Cuadrícula' },
  { key: 'filterGrid', label: 'Filtro cuadrícula' },
]

/**
 * Loads an image element from an object URL or other browser-supported source.
 *
 * @param src - Image source URL.
 * @returns A promise resolved with the decoded image element.
 */
export function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const picture = new Image()
    picture.onload = () => resolve(picture)
    picture.onerror = reject
    picture.src = src
  })
}

/**
 * Renders one export variant using the same image and grid rules as the editor.
 *
 * @param variant - Composition variant to render.
 * @param settings - Current canvas and visual settings.
 * @param image - Optional reference image state.
 * @param canvasSize - Logical canvas dimensions in pixels.
 * @param exportDpi - Output density.
 * @returns A rendered export canvas.
 */
export async function renderExportVariant(
  variant: ExportVariant,
  settings: CanvasSettings,
  image: ImageState | null,
  canvasSize: Size,
  exportDpi: number,
) {
  const exportScale = exportDpi / settings.dpi
  const output = document.createElement('canvas')
  output.width = Math.round(canvasSize.width * exportScale)
  output.height = Math.round(canvasSize.height * exportScale)
  const context = output.getContext('2d')
  if (!context) return output

  context.scale(exportScale, exportScale)
  context.imageSmoothingEnabled = true
  context.imageSmoothingQuality = 'high'
  context.fillStyle = '#fbfaf7'
  context.fillRect(0, 0, output.width, output.height)

  if (image) {
    const picture = await loadImage(image.src)
    context.save()
    const isFiltered = variant === 'filter' || variant === 'filterGrid'
    const imageFilter = isFiltered ? settings.filter : 'original'
    const adjustments = isFiltered
      ? settings.adjustments
      : { ...settings.adjustments, brightness: 100, contrast: 100, saturation: 100, blur: 0, toneIntensity: 0 }
    const source = createProcessedSource(picture, imageFilter, adjustments)
    context.filter = getImageFilter(imageFilter, settings.adjustments)
    context.globalAlpha = settings.opacity
    context.translate(image.x + image.width * image.scale / 2, image.y + image.height * image.scale / 2)
    context.rotate((image.rotation * Math.PI) / 180)
    context.scale(image.flipX ? -1 : 1, image.flipY ? -1 : 1)
    context.drawImage(source, -image.width * image.scale / 2, -image.height * image.scale / 2, image.width * image.scale, image.height * image.scale)
    context.restore()
  }

  if (variant === 'grid' || variant === 'filterGrid') {
    const spacing = toPixels(settings.gridSpacing, settings.gridUnit, settings.dpi)
    drawGrid(context, canvasSize.width, canvasSize.height, spacing, settings.gridColor, settings.gridWidth, settings.gridOpacity, settings.gridOffsetX, settings.gridOffsetY)
  }

  return output
}

/**
 * Downloads a browser blob with a generated filename.
 *
 * @param blob - Content to download.
 * @param name - Suggested filename.
 */
export function downloadBlob(blob: Blob, name: string) {
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.href = url
  link.download = name
  link.click()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}

/**
 * Converts an export canvas to a browser blob.
 *
 * @param canvas - Canvas containing the rendered export.
 * @param mimeType - Requested image MIME type.
 * @param quality - JPEG quality when applicable.
 * @returns A promise resolved with the encoded blob, or `null` if encoding fails.
 */
export function canvasToBlob(canvas: HTMLCanvasElement, mimeType: string, quality: number) {
  return new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, mimeType, quality)
  })
}
