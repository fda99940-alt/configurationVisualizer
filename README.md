# Configuration Visualizer

Given a JSON Schema file (`.json`), this app dynamically generates a visual configuration UI, lets users fill values, and exports a JSON configuration file that matches the schema.

## Features
- Load a local JSON Schema file.
- Render form fields dynamically from schema properties.
- Generate JSON output from user inputs.
- Download output as `configuration.json`.
- Basic validation for required fields and enum/type parsing.

## Supported Schema Types (Current MVP)
- `object` (including nested objects)
- `string`
- `number`
- `integer`
- `boolean`
- `enum`

## Project Structure
- `index.html`: app layout
- `styles.css`: styling
- `app.js`: schema parsing, form generation, validation, export
- `tests/schema-output.test.js`: regression tests for output behavior
- `tests/fixtures/simple-schema.json`: schema fixture used by tests
- `plan.md`: implementation roadmap

## Run Locally
1. Open `index.html` in a browser.
2. Select a JSON Schema file.
3. Click `Load Schema`.
4. Fill the generated fields.
5. Click `Generate JSON`.
6. Click `Download JSON`.

## Tests
Run:

```bash
npm test
```

The test suite checks:
- expected JSON output generation for supported types
- required field validation
- enum validation

## Known Limits
- No `$ref` resolution yet
- No array editor yet
- No advanced constraints (`oneOf`, `anyOf`, `allOf`, pattern, min/max, etc.)

