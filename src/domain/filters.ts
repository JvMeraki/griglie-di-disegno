import type { CanvasSettings, FilterAdjustments } from './types'

function parseHexColor(color: string) {
  const normalized = color.replace('#', '')
  if (!/^[\da-f]{6}$/i.test(normalized)) return null
  return {
    red: Number.parseInt(normalized.slice(0, 2), 16),
    green: Number.parseInt(normalized.slice(2, 4), 16),
    blue: Number.parseInt(normalized.slice(4, 6), 16),
  }
}

/**
 * Creates a processed image source without relying on browser canvas-filter support.
 *
 * @param picture - Decoded source image.
 * @param filter - Active image treatment.
 * @param adjustments - User-controlled tonal adjustments.
 * @returns A canvas containing the processed pixels.
 */
export function createProcessedSource(
  picture: HTMLImageElement,
  filter: CanvasSettings['filter'],
  adjustments: FilterAdjustments,
) {
  const source = document.createElement('canvas')
  source.width = picture.naturalWidth || picture.width
  source.height = picture.naturalHeight || picture.height
  const context = source.getContext('2d')
  if (!context) return source

  context.drawImage(picture, 0, 0)
  if (filter === 'original') return source

  const pixels = context.getImageData(0, 0, source.width, source.height)
  const tone = filter === 'tone' ? parseHexColor(adjustments.toneColor) : null
  const contrastFactor = (259 * (adjustments.contrast + 255)) / (255 * (259 - adjustments.contrast))
  const brightnessOffset = (adjustments.brightness - 100) * 2.55
  const saturation = adjustments.saturation / 100
  for (let index = 0; index < pixels.data.length; index += 4) {
    const luminance =
      pixels.data[index] * 0.299
      + pixels.data[index + 1] * 0.587
      + pixels.data[index + 2] * 0.114
    const isMonochrome = filter === 'bw' || filter === 'tone'
    const baseRed = isMonochrome ? luminance : pixels.data[index]
    const baseGreen = isMonochrome ? luminance : pixels.data[index + 1]
    const baseBlue = isMonochrome ? luminance : pixels.data[index + 2]
    const adjustedLuminance = baseRed * 0.299 + baseGreen * 0.587 + baseBlue * 0.114
    let red = adjustedLuminance + (baseRed - adjustedLuminance) * saturation
    let green = adjustedLuminance + (baseGreen - adjustedLuminance) * saturation
    let blue = adjustedLuminance + (baseBlue - adjustedLuminance) * saturation

    red = contrastFactor * (red + brightnessOffset - 128) + 128
    green = contrastFactor * (green + brightnessOffset - 128) + 128
    blue = contrastFactor * (blue + brightnessOffset - 128) + 128

    if (tone) {
      const amount = adjustments.toneIntensity / 100
      const toneRed = red * tone.red / 255
      const toneGreen = green * tone.green / 255
      const toneBlue = blue * tone.blue / 255
      red = red * (1 - amount) + toneRed * amount
      green = green * (1 - amount) + toneGreen * amount
      blue = blue * (1 - amount) + toneBlue * amount
    }

    pixels.data[index] = Math.max(0, Math.min(255, Math.round(red)))
    pixels.data[index + 1] = Math.max(0, Math.min(255, Math.round(green)))
    pixels.data[index + 2] = Math.max(0, Math.min(255, Math.round(blue)))
  }
  context.putImageData(pixels, 0, 0)
  return source
}

/**
 * Creates a grayscale image source for export and preview compatibility.
 *
 * @param picture - Decoded source image.
 * @returns A canvas containing grayscale pixels.
 */
export function createBlackAndWhiteSource(picture: HTMLImageElement) {
  return createProcessedSource(picture, 'bw', {
    brightness: 100,
    contrast: 100,
    saturation: 100,
    blur: 0,
    toneColor: '#000000',
    toneIntensity: 0,
  })
}

/**
 * Builds the CSS filter expression used by preview and export rendering.
 *
 * @param filter - Active non-destructive filter preset.
 * @param adjustments - User-controlled tonal adjustments.
 * @returns A CSS canvas filter expression.
 */
export function getImageFilter(filter: CanvasSettings['filter'], adjustments: FilterAdjustments) {
  if (filter === 'original') return 'none'
  void adjustments.brightness
  void adjustments.contrast
  void adjustments.saturation
  return adjustments.blur > 0 ? `blur(${adjustments.blur}px)` : 'none'
}

/**
 * Returns the overlay used to tint an image with the selected tone.
 *
 * @param filter - Active non-destructive filter preset.
 * @param adjustments - User-controlled tonal adjustments.
 * @returns Tone overlay settings, or `null` when tone is inactive.
 */
export function getToneOverlay(filter: CanvasSettings['filter'], adjustments: FilterAdjustments) {
  void filter
  void adjustments
  return null
}
