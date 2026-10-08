/**
 * Draws temporary alignment guides while the image layer is active.
 *
 * @param context - Preview canvas context.
 * @param width - Preview width in pixels.
 * @param height - Preview height in pixels.
 */
export function drawGuides(context: CanvasRenderingContext2D, width: number, height: number) {
  context.save()
  context.strokeStyle = '#b87c55'
  context.globalAlpha = 0.55
  context.setLineDash([5, 5])
  context.beginPath()
  context.moveTo(width / 2, 0)
  context.lineTo(width / 2, height)
  context.moveTo(0, height / 2)
  context.lineTo(width, height / 2)
  context.stroke()
  context.restore()
}
