import type { ImageState } from './types'
import { clampImagePosition, getCenteredImagePosition, getImageScale, type Size } from './geometry'

/**
 * Creates an editor image state after loading a local image.
 *
 * @param src - Object URL used to render the image.
 * @param name - Original local file name.
 * @param dimensions - Loaded image dimensions.
 * @param canvas - Current canvas dimensions.
 * @returns A centered image state fitted inside the canvas.
 */
export function createImageState(src: string, name: string, dimensions: Size, canvas: Size): ImageState {
  const scale = getImageScale(dimensions, canvas, 'contain')
  return {
    src,
    name,
    width: dimensions.width,
    height: dimensions.height,
    ...getCenteredImagePosition(dimensions, scale, canvas),
    scale,
    rotation: 0,
    flipX: false,
    flipY: false,
  }
}

/**
 * Fits an image inside or over a canvas while preserving its aspect ratio.
 *
 * @param image - Current image state.
 * @param canvas - Current canvas dimensions.
 * @param mode - Contain or cover placement mode.
 * @returns Updated image state with a clamped position.
 */
export function fitImageToCanvas(image: ImageState, canvas: Size, mode: 'contain' | 'cover'): ImageState {
  const scale = getImageScale(image, canvas, mode)
  const position = clampImagePosition(
    getCenteredImagePosition(image, scale, canvas),
    image,
    scale,
    canvas,
  )
  return { ...image, scale, ...position }
}

/**
 * Resets an image to its initial contain placement and orientation.
 *
 * @param image - Current image state.
 * @param canvas - Current canvas dimensions.
 * @returns Reset image state.
 */
export function resetImageTransform(image: ImageState, canvas: Size): ImageState {
  return {
    ...fitImageToCanvas(image, canvas, 'contain'),
    rotation: 0,
    flipX: false,
    flipY: false,
  }
}
