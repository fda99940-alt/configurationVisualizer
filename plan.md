# Schema-Driven Configuration UI Plan

## Goal
Given a JSON Schema file (`.json`), the app should dynamically generate a visual configuration UI, let users fill values, and produce a valid JSON configuration file according to that schema.

## Clarification
- Interpreting "jsonp schema" as **JSON Schema**.
- Current implementation targets a practical subset for local usage and iterative expansion.

## Scope (MVP Implemented)
- Load schema from local file input.
- Validate root schema shape (`type: object` + `properties`).
- Dynamically render form controls from schema definitions.
- Support schema subset:
  - `object` (including nested objects)
  - `string`
  - `number`
  - `integer`
  - `boolean`
  - `enum`
- Enforce required fields from `required`.
- Parse typed values and generate JSON output.
- Download generated JSON as `configuration.json`.

## Project Structure
- `index.html`: static structure and semantic regions.
- `styles.css`: visual design and layout.
- `app.js`: schema parsing, dynamic rendering, validation, and export logic.
- `plan.md`: implementation roadmap and constraints.
- `tests/fixtures/simple-schema.json`: baseline schema used for regression tests.
- `tests/schema-output.test.js`: output/validation tests for current supported types.
- `package.json`: local test command.

## Local Run
1. Open `index.html` directly in a browser.
2. Choose a schema file.
3. Click `Load Schema`.
4. Fill generated fields.
5. Click `Generate JSON`.
6. Click `Download JSON`.

## Test Workflow
1. Run `npm test`.
2. The suite verifies:
   - correct JSON output from a schema covering current supported types.
   - required field validation failures.
   - enum validation failures.

## LLM Generation Rules
- Keep HTML, CSS, and JS separated.
- Add new schema capabilities only in `app.js` first.
- Keep rendered field naming stable using schema path-based IDs.
- Preserve these key DOM IDs:
  - `schema-file-input`
  - `load-schema-btn`
  - `dynamic-form`
  - `generate-json-btn`
  - `download-json-btn`
  - `output-json`
  - `error-text`
- Prefer small pure functions for parsing/validation.

## Known MVP Limits
- No `$ref` resolution yet.
- No array item editor yet.
- No advanced schema constraints yet (`oneOf`, `anyOf`, `allOf`, pattern, min/max, etc.).
- No formal validator library integration yet.

## Next Steps
1. Add array support (list editor with add/remove rows).
2. Add `$ref` support for local definitions.
3. Add advanced constraints and inline validation feedback.
4. Add schema examples/default values auto-fill.
5. Add import/edit existing JSON and re-bind into generated form.
6. Add a compatibility layer for multiple JSON Schema drafts.
