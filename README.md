# @gesslar/vscode-theme-schema

Utilities for VS Code extensions that need to load the built-in workbench color schema and validate theme color values against it.

## Features

- Loads `vscode://schemas/workbench-colors` in the extension host.
- Resolves local `$ref` entries in property definitions and `oneOf` options.
- Normalizes schema entries into a `Map`.
- Derives helpful metadata:
  - `alphaRequired`: whether a property requires alpha-enabled hex colors.
  - `sample`: example value (`#ffffff` or `#ffffffaa`).
- Validates user color values, including schema pattern constraints and deprecation warnings.

## Installation

```bash
npm install @gesslar/vscode-theme-schema
```

## Quick Start (VS Code Extension Host)

```js
import {VSCodeSchema, Validator} from "@gesslar/vscode-theme-schema"

const schema = await VSCodeSchema.new()

const results = await Validator.validate(schema.map, {
  "editor.background": "#1e1e1e",
  "editor.selectionBackground": "#264f78aa",
  "edgyMemelord": "#000000",
  "statusBar.debuggingBackground": "default"
})

for(const result of results) {
  if(result.status !== "valid")
    console.log(`${result.property}: ${result.message}`)
}
```

## API

### `VSCodeSchema`

- `static async new(): Promise<VSCodeSchema>`
  - Creates (and caches) a singleton schema instance from `vscode://schemas/workbench-colors`.
- `new VSCodeSchema(schemaData: string)`
  - Parses and resolves raw schema text (JSON5).
- `map: Map<string, object>`
  - Resolved property schema map.
- `size: number`
  - Number of color properties in the schema.
- `valueOf(): Map<string, object>`
  - Returns the same internal schema map.

### `Validator`

- `static async validate(schema, userColors): Promise<ValidationResult[]>`
  - Validates each provided color property and returns per-property results.
  - `status` is one of `valid`, `warn`, or `invalid`.
  - Accepts values `default`, `#RGB`, `#RGBA`, `#RRGGBB`, `#RRGGBBAA`.
  - Unknown properties are marked `invalid`.

Result shape:

```ts
type ValidationResult = {
  property: string
  status: "valid" | "warn" | "invalid"
  description: string
  value: string
  message?: string
}
```

## Runtime Notes

- `VSCodeSchema.new()` depends on the `vscode` API and is intended to run inside the VS Code extension host.
- If you already have schema text, you can construct directly:

```js
const schema = new VSCodeSchema(schemaText)
```

## Development

```bash
npm run lint       # lint source files
npm run lint:fix   # lint and auto-fix
npm run types      # regenerate declarations in types/
```

## License

`@gesslar/vscode-theme-schema` is released into the public domain under the
[Unlicense](UNLICENSE.txt).

This package includes or depends on third-party components under their own licenses:

| Dependency | License |
| --- | --- |
| [@gesslar/toolkit](https://github.com/gesslar/toolkit) | Unlicense |
| [json5](https://github.com/json5/json5) | MIT |
