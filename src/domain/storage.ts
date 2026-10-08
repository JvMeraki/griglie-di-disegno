import { A3, A4, defaultSettings } from './constants'
import type { CanvasSettings } from './types'

const SETTINGS_KEY = 'gridline-settings'

function normalizeSettings(value: Partial<CanvasSettings>): CanvasSettings {
  const settings: CanvasSettings = {
    ...defaultSettings,
    ...value,
    orientation: value.orientation === 'landscape' ? 'landscape' : 'portrait',
    gridOpacity: typeof value.gridOpacity === 'number' ? value.gridOpacity : defaultSettings.gridOpacity,
    gridOffsetX: typeof value.gridOffsetX === 'number' ? value.gridOffsetX : defaultSettings.gridOffsetX,
    gridOffsetY: typeof value.gridOffsetY === 'number' ? value.gridOffsetY : defaultSettings.gridOffsetY,
    adjustments: { ...defaultSettings.adjustments, ...value.adjustments },
  }

  const knownLandscapeSizes = [
    { width: A4.height, height: A4.width },
    { width: A3.height, height: A3.width },
  ]
  const hasLegacySwappedPreset = settings.orientation === 'landscape'
    && settings.unit === 'cm'
    && knownLandscapeSizes.some((size) => settings.width === size.width && settings.height === size.height)

  return hasLegacySwappedPreset
    ? { ...settings, width: settings.height, height: settings.width }
    : settings
}

/**
 * Loads settings from local storage and applies defaults for older saved data.
 *
 * @returns A complete, valid settings object for the current editor version.
 */
export function loadSettings(): CanvasSettings {
  const savedSettings = window.localStorage.getItem(SETTINGS_KEY)
  if (!savedSettings) return defaultSettings
  try {
    return normalizeSettings(JSON.parse(savedSettings) as Partial<CanvasSettings>)
  } catch {
    console.warn('No se pudieron restaurar los ajustes locales de Gridline.')
    return defaultSettings
  }
}

/**
 * Persists the current canvas settings locally.
 *
 * @param settings - Settings to serialize.
 */
export function saveSettings(settings: CanvasSettings) {
  window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
}
