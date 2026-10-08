import { useEffect, type RefObject } from 'react'
import { drawGrid } from '@rendering/grid'
import { drawGuides } from '@rendering/guides'
import { createProcessedSource, getImageFilter } from '@domain/filters'
import type { CanvasSettings, ImageState, LayerId } from '@domain/types'

type PreviewSize = { width: number; height: number; ratio: number }

type UseCanvasPreviewOptions = {
  canvasRef: RefObject<HTMLCanvasElement | null>
  previewSize: PreviewSize
  gridPx: number
  image: ImageState | null
  settings: CanvasSettings
  layers: Record<LayerId, boolean>
  layerOrder: LayerId[]
  activeLayer: LayerId
}

/**
 * Keeps the preview canvas synchronized with editor state.
 *
 * The hook owns browser canvas setup and composition order while domain
 * calculations remain outside React.
 *
 * @param options - Canvas target and state required for composition.
 */
export function useCanvasPreview({
  canvasRef,
  previewSize,
  gridPx,
  image,
  settings,
  layers,
  layerOrder,
  activeLayer,
}: UseCanvasPreviewOptions) {
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const context = canvas.getContext('2d')
    if (!context) return

    const dpr = window.devicePixelRatio || 1
    const renderScale = Math.max(dpr, 2)
    canvas.width = Math.ceil(previewSize.width * renderScale)
    canvas.height = Math.ceil(previewSize.height * renderScale)
    canvas.style.width = `${previewSize.width}px`
    canvas.style.height = `${previewSize.height}px`
    context.scale(renderScale, renderScale)
    context.imageSmoothingEnabled = true
    context.imageSmoothingQuality = 'high'
    context.clearRect(0, 0, previewSize.width, previewSize.height)

    const renderScene = (picture?: HTMLImageElement) => {
      for (const layerId of layerOrder) {
        if (!layers[layerId]) continue
        if (layerId === 'background') {
          context.fillStyle = '#fbfaf7'
          context.fillRect(0, 0, previewSize.width, previewSize.height)
        }
        if (layerId === 'image' && image && picture) {
          context.save()
          context.globalAlpha = settings.opacity
          const source = createProcessedSource(picture, settings.filter, settings.adjustments)
          context.filter = getImageFilter(settings.filter, settings.adjustments)
          const scaledWidth = image.width * image.scale * previewSize.ratio
          const scaledHeight = image.height * image.scale * previewSize.ratio
          context.translate(
            (image.x + image.width * image.scale / 2) * previewSize.ratio,
            (image.y + image.height * image.scale / 2) * previewSize.ratio,
          )
          context.rotate((image.rotation * Math.PI) / 180)
          context.scale(image.flipX ? -1 : 1, image.flipY ? -1 : 1)
          context.drawImage(source, -scaledWidth / 2, -scaledHeight / 2, scaledWidth, scaledHeight)
          context.restore()
        }
        if (layerId === 'grid') {
          drawGrid(
            context,
            previewSize.width,
            previewSize.height,
            gridPx,
            settings.gridColor,
            settings.gridWidth * previewSize.ratio,
            settings.gridOpacity,
            settings.gridOffsetX * previewSize.ratio,
            settings.gridOffsetY * previewSize.ratio,
          )
        }
      }
      if (activeLayer === 'image' && image && layers.image) {
        drawGuides(context, previewSize.width, previewSize.height)
      }
    }

    if (image && layers.image) {
      const picture = new Image()
      picture.onload = () => renderScene(picture)
      picture.src = image.src
    } else {
      renderScene()
    }
  }, [activeLayer, canvasRef, gridPx, image, layerOrder, layers, previewSize, settings])
}
