import { Check, ChevronDown } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

type HsvColor = {
  hue: number
  saturation: number
  value: number
}

type ColorPickerProps = {
  value: string
  onChange: (value: string) => void
  ariaLabel: string
  presets?: string[]
}

function hexToHsv(hex: string): HsvColor {
  const normalized = hex.replace('#', '')
  const red = Number.parseInt(normalized.slice(0, 2), 16) / 255
  const green = Number.parseInt(normalized.slice(2, 4), 16) / 255
  const blue = Number.parseInt(normalized.slice(4, 6), 16) / 255
  const max = Math.max(red, green, blue)
  const min = Math.min(red, green, blue)
  const delta = max - min
  let hue = 0

  if (delta > 0) {
    if (max === red) hue = 60 * (((green - blue) / delta) % 6)
    else if (max === green) hue = 60 * ((blue - red) / delta + 2)
    else hue = 60 * ((red - green) / delta + 4)
  }

  return {
    hue: hue < 0 ? hue + 360 : hue,
    saturation: max === 0 ? 0 : delta / max,
    value: max,
  }
}

function hsvToHex({ hue, saturation, value }: HsvColor) {
  const chroma = value * saturation
  const section = hue / 60
  const secondary = chroma * (1 - Math.abs((section % 2) - 1))
  const match = value - chroma
  const [red, green, blue] = section < 1
    ? [chroma, secondary, 0]
    : section < 2
      ? [secondary, chroma, 0]
      : section < 3
        ? [0, chroma, secondary]
        : section < 4
          ? [0, secondary, chroma]
          : section < 5
            ? [secondary, 0, chroma]
            : [chroma, 0, secondary]

  return `#${[red, green, blue].map((channel) => Math.round((channel + match) * 255).toString(16).padStart(2, '0')).join('')}`
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

/**
 * Renders a browser-independent HSV color picker with hex input and presets.
 *
 * @param props - Color value and change callback.
 * @returns A custom color picker control.
 */
export function ColorPicker({ value, onChange, ariaLabel, presets = [] }: ColorPickerProps) {
  const [open, setOpen] = useState(false)
  const [draftValue, setDraftValue] = useState(value)
  const [hsv, setHsv] = useState(() => hexToHsv(value))
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function closeOnOutsideClick(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', closeOnOutsideClick)
    return () => document.removeEventListener('mousedown', closeOnOutsideClick)
  }, [])

  function applyHsv(next: HsvColor) {
    const nextValue = hsvToHex(next)
    setHsv(next)
    setDraftValue(nextValue)
    onChange(nextValue)
  }

  function openPicker() {
    setDraftValue(value)
    setHsv(hexToHsv(value))
    setOpen((current) => !current)
  }

  function updateFromPoint(event: React.PointerEvent<HTMLDivElement>, mode: 'sv' | 'hue') {
    const bounds = event.currentTarget.getBoundingClientRect()
    const position = clamp((event.clientX - bounds.left) / bounds.width, 0, 1)
    if (mode === 'sv') {
      applyHsv({ ...hsv, saturation: position, value: 1 - clamp((event.clientY - bounds.top) / bounds.height, 0, 1) })
    } else {
      applyHsv({ ...hsv, hue: position * 360 })
    }
  }

  return (
    <div className="custom-color-picker" ref={containerRef}>
      <button type="button" className="color-picker-trigger" aria-label={ariaLabel} aria-expanded={open} onClick={openPicker}>
        <span className="color-picker-swatch" style={{ backgroundColor: value }} />
        <span>{value}</span>
        <ChevronDown size={13} />
      </button>
      {open && (
        <div className="color-picker-popover">
          <div
            className="color-picker-saturation"
            style={{ backgroundColor: `hsl(${hsv.hue} 100% 50%)` }}
            onPointerDown={(event) => {
              event.currentTarget.setPointerCapture(event.pointerId)
              updateFromPoint(event, 'sv')
            }}
            onPointerMove={(event) => {
              if (event.currentTarget.hasPointerCapture(event.pointerId)) updateFromPoint(event, 'sv')
            }}
          >
            <span className="color-picker-cursor" style={{ left: `${hsv.saturation * 100}%`, top: `${(1 - hsv.value) * 100}%` }} />
          </div>
          <div
            className="color-picker-hue"
            onPointerDown={(event) => {
              event.currentTarget.setPointerCapture(event.pointerId)
              updateFromPoint(event, 'hue')
            }}
            onPointerMove={(event) => {
              if (event.currentTarget.hasPointerCapture(event.pointerId)) updateFromPoint(event, 'hue')
            }}
          >
            <span className="color-picker-hue-cursor" style={{ left: `${(hsv.hue / 360) * 100}%` }} />
          </div>
          <div className="color-picker-hex">
            <input
              aria-label={ariaLabel}
              value={draftValue}
              maxLength={7}
              onChange={(event) => {
                const nextValue = event.target.value.startsWith('#') ? event.target.value : `#${event.target.value}`
                setDraftValue(nextValue)
                if (/^#[\da-f]{6}$/i.test(nextValue)) {
                  setHsv(hexToHsv(nextValue))
                  onChange(nextValue.toLowerCase())
                }
              }}
            />
          </div>
          {presets.length > 0 && (
            <div className="color-picker-presets">
              {presets.map((preset) => (
                <button key={preset} type="button" style={{ backgroundColor: preset }} className={value === preset ? 'selected' : ''} aria-label={preset} onClick={() => applyHsv(hexToHsv(preset))}>
                  {value === preset && <Check size={11} />}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
