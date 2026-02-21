# Configuration Visualizer

Schema-driven configuration UI built with JSON Forms.

The app loads a JSON Schema (`.json`), renders a dynamic form, validates input live, and exports configuration JSON.

## Stack
- React
- JSON Forms (`@jsonforms/core`, `@jsonforms/react`, `@jsonforms/vanilla-renderers`)
- Vite

## Project Structure
- `jsonforms/index.html`: app entry
- `jsonforms/src/App.jsx`: main UI logic (schema load, render, validation, export)
- `jsonforms/src/defaultSchema.json`: built-in sample schema
- `jsonforms/src/styles.css`: app styling
- `jsonforms/src/main.jsx`: React bootstrap
- `jsonforms/vite.config.mjs`: Vite config
- `scripts/build-jsonforms-offline.mjs`: single-file offline bundle builder
- `plan.md`: roadmap

## Run (Dev)
```bash
npm install
npm run dev:jsonforms
```

## Build (Static)
```bash
npm run build:jsonforms
```

## Run Preview Server
```bash
npm run preview:jsonforms
```

## Build Offline Single File (`file://`)
```bash
npm run build:jsonforms:offline
```

Open:
- `jsonforms/offline/index.html`

## Current Capabilities
- Load local JSON Schema file
- Import existing configuration JSON and bind it into the form for editing
- Dynamic form rendering
- Validation feedback and highlighted invalid sections/fields
- Download generated JSON as `configuration.json`

## Known Limits
- No custom UI schema overrides yet (currently auto-generated with `Generate.uiSchema`)
- No dedicated automated test suite for the JSON Forms track yet
