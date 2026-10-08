import type { Orientation, Unit } from './types'

/** A two-dimensional size expressed in a shared unit. */
export type Size = { width: number; height: number }

/**
 * Converts a value from a physical or pixel unit to pixels.
 *
 * @param value - The numeric value to convert.
 * @param unit - The unit associated with {@link value}.
 * @param dpi - The output density used for physical units.
 * @returns The equivalent pixel value, or `0` for invalid negative input.
 */
export function toPixels(value: number, unit: Unit, dpi: number) {
  if (!Number.isFinite(value) || value < 0) return 0
  if (unit === 'px') return value
  if (unit === 'in') return value * dpi
  return (value / 2.54) * dpi
}

/**
 * Creates a pixel canvas size from user-facing dimensions.
 *
 * @param width - Logical width in `unit`.
 * @param height - Logical height in `unit`.
 * @param unit - Unit used by both dimensions.
 * @param dpi - Output density for physical units.
 * @returns The canvas dimensions in pixels.
 */
export function getCanvasSize(width: number, height: number, unit: Unit, dpi: number): Size {
  return {
    width: toPixels(width, unit, dpi),
    height: toPixels(height, unit, dpi),
  }
}

/**
 * Applies portrait or landscape orientation without changing physical dimensions.
 *
 * @param width - Base width in the selected unit.
 * @param height - Base height in the selected unit.
 * @param orientation - Desired canvas orientation.
 * @returns Dimensions ordered for the requested orientation.
 */
export function getOrientedDimensions(width: number, height: number, orientation: Orientation) {
  return orientation === 'portrait'
    ? { width, height }
    : { width: height, height: width }
}

/**
 * Converts a value between supported units while preserving its physical size.
 *
 * @param value - Value expressed in `from`.
 * @param from - Source unit.
 * @param to - Target unit.
 * @param dpi - Density used for physical conversions.
 * @returns The converted value in `to`.
 */
export function convertValue(value: number, from: Unit, to: Unit, dpi: number) {
  if (from === to) return value
  const pixels = toPixels(value, from, dpi)
  if (to === 'px') return pixels
  if (to === 'in') return pixels / dpi
  return (pixels / dpi) * 2.54
}

/**
 * Calculates a proportional preview size that fits within a maximum dimension.
 *
 * @param canvas - Source canvas dimensions in pixels.
 * @param maxPreview - Maximum width or height for the preview.
 * @returns Preview dimensions and the scale ratio used to render them.
 */
export function getPreviewSize(canvas: Size, maxPreview: number): Size & { ratio: number } {
  const ratio = Math.min(maxPreview / canvas.width, maxPreview / canvas.height)
  return {
    width: canvas.width * ratio,
    height: canvas.height * ratio,
    ratio,
  }
}

/**
 * Centers a scaled image inside a canvas.
 *
 * @param image - Original image dimensions in pixels.
 * @param scale - Image scale multiplier.
 * @param canvas - Canvas dimensions in pixels.
 * @returns The top-left image position in canvas coordinates.
 */
export function getCenteredImagePosition(
  image: Size,
  scale: number,
  canvas: Size,
) {
  return {
    x: (canvas.width - image.width * scale) / 2,
    y: (canvas.height - image.height * scale) / 2,
  }
}

/**
 * Calculates a proportional image scale for contain or cover placement.
 *
 * @param image - Original image dimensions in pixels.
 * @param canvas - Target canvas dimensions in pixels.
 * @param mode - Whether the image must fit inside or cover the canvas.
 * @returns The scale multiplier required by the requested placement.
 */
export function getImageScale(image: Size, canvas: Size, mode: 'contain' | 'cover') {
  return mode === 'contain'
    ? Math.min(canvas.width / image.width, canvas.height / image.height)
    : Math.max(canvas.width / image.width, canvas.height / image.height)
}

/**
 * Keeps an image within a configurable margin of the canvas.
 *
 * @param position - Current image position in canvas coordinates.
 * @param image - Original image dimensions.
 * @param scale - Image scale multiplier.
 * @param canvas - Canvas dimensions.
 * @param margin - Minimum visible margin in pixels.
 * @returns A position adjusted to keep part of the image visible.
 */
export function clampImagePosition(
  position: { x: number; y: number },
  image: Size,
  scale: number,
  canvas: Size,
  margin = 24,
) {
  const width = image.width * scale
  const height = image.height * scale
  return {
    x: Math.min(canvas.width - margin, Math.max(margin - width, position.x)),
    y: Math.min(canvas.height - margin, Math.max(margin - height, position.y)),
  }
}
