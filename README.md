# Gridline

Gridline is a browser-based image editor for preparing drawing references with
customizable grids. It is designed for artists who want to turn a reference
image into a clean, printable guide without Photoshop, manual measurement, or
an account.

Everything runs locally in the browser. No backend, authentication,
advertising, subscription, or image upload service is required.

## Features

### Canvas setup

- A4, A3, and custom canvas presets.
- Custom dimensions in centimetres, inches, or pixels.
- Portrait and landscape orientation.
- Configurable canvas resolution from 96 to 600 DPI.
- Preset dimensions remain structural: resetting editor settings does not
  change the canvas size, unit, orientation, or DPI.

### Grid editor

- Configurable grid spacing in centimetres, inches, or pixels.
- Editable line colour, line width, opacity, and X/Y offsets.
- Quick spacing presets for common drawing workflows.
- Independent grid layer that can be hidden, locked, reordered, or edited.

### Reference image

- Local image loading through a file picker or drag and drop.
- Contain and cover fitting modes.
- Position, scale, rotation, and horizontal/vertical flip controls.
- Direct manipulation on the canvas with pointer and wheel interactions.
- Keyboard movement and zoom controls.
- The source image remains available at its original dimensions for rendering
  and export; the editor preview is scaled only for interactive performance.

### Layers

- Built-in Canvas, Reference image, and Grid layers.
- Custom user-created layers.
- Visibility and lock controls.
- Layer reordering with drag and drop or directional controls.
- Inline layer renaming.

### Image treatments

- **Original**: keeps the reference image in its natural colour with no extra
  brightness, contrast, saturation, or softness adjustment controls.
- **Black and white**: deterministic grayscale conversion based on pixel
  luminance.
- **Soft tone**: monochromatic colourization using a selected tone and
  adjustable intensity.
- Brightness, contrast, saturation, and softness controls for filtered
  treatments.
- Custom cross-browser colour picker for tone and grid colours.
- Preview and export share the same pixel-processing pipeline.

### Export

Exports can be generated as PNG or JPG with configurable quality and DPI.
Selected compositions can be downloaded individually or as one ZIP package.
The available compositions are:

1. **Original** — the reference image without filters or grid.
2. **Filter** — the active filtered treatment, such as black and white or
   soft tone.
3. **Grid** — the original reference image with the grid applied.
4. **Filter grid** — the active filtered treatment with the grid applied.

Export rendering uses the configured output DPI and high-quality image
smoothing. Large exports depend on browser memory and device capabilities.

## Privacy and persistence

Gridline is frontend-only:

- Images are loaded and processed locally.
- Image files are not sent to a server.
- Project settings are persisted in browser `localStorage`.
- The selected language is persisted in browser `localStorage`.
- Clearing browser storage removes the saved project settings and language
  preference.

## Technology

- React 19
- TypeScript
- Vite
- Tailwind CSS
- i18next, react-i18next, and browser language detection
- Lucide React icons
- JSZip for package exports
- Oxlint for linting
- HTML Canvas APIs for preview, filters, grid rendering, and export

## Project structure

```text
src/
├── components/
│   ├── editor/       Editor header, sidebars, canvas stage, layers, settings
│   └── ui/           Reusable Select and ColorPicker controls
├── domain/
│   ├── constants.ts  Presets and default settings
│   ├── export.ts     Export variants, canvas rendering, and downloads
│   ├── filters.ts    Pixel-based image processing
│   ├── geometry.ts   Unit conversion, sizing, and positioning
│   ├── image.ts      Image placement and transformation state
│   ├── storage.ts    Local settings persistence and migration
│   └── types.ts      Serializable domain contracts
├── hooks/
│   └── useCanvasPreview.ts
├── i18n/
│   ├── config.ts
│   ├── labels/en.json
│   └── labels/es.json
└── rendering/
    ├── grid.ts       Grid drawing primitives
    └── guides.ts     Active-image interaction guides
```

`App.tsx` coordinates application state and domain operations. Visual
surfaces are kept in reusable editor components, while calculations and
rendering rules remain in domain and rendering modules.

## Internationalization

The interface currently supports English and Spanish. The language switcher
is custom-built rather than dependent on the browser's native select styling.
Translation catalogs are stored in:

- `src/i18n/labels/en.json`
- `src/i18n/labels/es.json`

The internal language API is exposed through `useLanguage`, backed by
i18next. TypeScript and Vite use the following aliases:

```text
@/*
@components/*
@domain/*
@hooks/*
@i18n/*
@rendering/*
```

## Getting started

Requirements:

- Node.js 20 or newer is recommended.
- npm.

Install dependencies and start the development server:

```bash
npm install
npm run dev
```

To create a production build:

```bash
npm run build
npm run preview
```

To run the linter:

```bash
npm run lint
```

## Documentation conventions

Public domain utilities and rendering APIs use concise English TSDoc.
Documentation should explain intent and contracts with `@param`, `@returns`,
and relevant constraints without narrating obvious implementation details.

## Current scope

Gridline is intentionally a local, single-user frontend application. There is
no server-side project sharing, account system, cloud storage, or
collaboration layer in the current scope.
