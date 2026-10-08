/**
 * Renders a regular grid into a 2D canvas context.
 *
 * The offset is normalized to the spacing so negative and large offsets produce
 * the same visual result as their equivalent position within one grid cell.
 *
 * @param context - Destination canvas context.
 * @param width - Render width in pixels.
 * @param height - Render height in pixels.
 * @param spacing - Distance between lines in pixels.
 * @param color - Grid stroke color.
 * @param lineWidth - Grid stroke width in pixels.
 * @param opacity - Grid alpha value from `0` to `1`.
 * @param offsetX - Horizontal grid offset in pixels.
 * @param offsetY - Vertical grid offset in pixels.
 */
export function drawGrid(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  spacing: number,
  color: string,
  lineWidth: number,
  opacity = 0.72,
  offsetX = 0,
  offsetY = 0,
) {
  if (spacing <= 0) return
  context.save()
  context.strokeStyle = color
  context.lineWidth = Math.max(0.5, lineWidth)
  context.globalAlpha = opacity
  context.beginPath()
  const firstX = ((offsetX % spacing) + spacing) % spacing
  const firstY = ((offsetY % spacing) + spacing) % spacing
  for (let x = firstX; x <= width; x += spacing) {
    context.moveTo(Math.round(x) + 0.5, 0)
    context.lineTo(Math.round(x) + 0.5, height)
  }
  for (let y = firstY; y <= height; y += spacing) {
    context.moveTo(0, Math.round(y) + 0.5)
    context.lineTo(width, Math.round(y) + 0.5)
  }
  context.stroke()
  context.restore()
}
