# Schema-Driven Configuration UI Plan

## Goal
Given a JSON Schema file (`.json`), dynamically render a visual configuration UI, let users enter values, and export valid configuration JSON.

## Current Architecture
- Single implementation track: **JSON Forms**.
- Renderer + validation engine: JSON Forms + AJV.
- Runtime: React app served/built with Vite.
- Offline option: single-file bundled HTML build for `file://` usage.

## Implemented
- Schema file upload and parsing.
- Existing configuration JSON import and form re-binding.
- Root schema validation (`type: object`, `properties`).
- Dynamic UI generation from schema (`Generate.uiSchema`).
- Live validation error display.
- Visual highlighting for invalid fields/sections.
- JSON export/download.
- Offline build script producing `jsonforms/offline/index.html`.

## Project Structure
- `jsonforms/index.html`
- `jsonforms/src/main.jsx`
- `jsonforms/src/App.jsx`
- `jsonforms/src/defaultSchema.json`
- `jsonforms/src/styles.css`
- `jsonforms/vite.config.mjs`
- `scripts/build-jsonforms-offline.mjs`
- `plan.md`

## Run
1. `npm install`
2. `npm run dev:jsonforms`

## Build
- Static build: `npm run build:jsonforms`
- Offline single-file build: `npm run build:jsonforms:offline`

## Next Steps
1. Add custom UI schema generation (tabs/groups/ordering rules).
2. Add JSON Forms-focused automated tests.
3. Add schema draft compatibility checks and clearer unsupported-feature messaging.
