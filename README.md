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
- Parses JSON/JSONC into an AST with full source-location mapping for jump-to-property/value navigation.

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

### `JsonSource`

Parses JSON/JSONC source text into an AST and builds a dotted-path → source-location map, enabling jump-to-property and jump-to-value navigation in VS Code extensions.

- `new JsonSource(text: string, filePath?: string)`
  - Parses source text and builds the internal location map.
  - `filePath` is an optional label used in `formatLocation()` output.
- `static async fromFile(file: FileObject, cwd?: DirectoryObject): Promise<JsonSource | null>`
  - Factory for `FileObject` inputs (`.json`, `.jsonc`, `.json5`). Returns `null` for unsupported extensions or parse failures.
- `getLocation(dottedPath: string): SourceLocation | null`
  - Returns the `{line, column}` of the key for a dotted path.
- `getValueLocation(dottedPath: string): SourceLocation | null`
  - Returns the `{line, column}` of the value for a dotted path.
- `formatLocation(dottedPath: string, target?: "key" | "value"): string | null`
  - Returns a formatted `"file:line:column"` or `"line:column"` string.
- `ast: object` — The raw `jsonc-eslint-parser` AST.
- `filePath: string | null` — The label passed at construction.
- `locationMap: Map<string, LocationEntry>` — The full path → location map.

```js
import {JsonSource} from "@gesslar/vscode-theme-schema"

const src = new JsonSource(`{
  "colors": {
    "editor.background": "#1e1e1e"
  }
}`, "theme.json")

src.formatLocation("colors.editor.background")          // "theme.json:3:5"
src.formatLocation("colors.editor.background", "value")  // "theme.json:3:26"
src.getLocation("colors.editor.background")              // { line: 3, column: 4 }
```

Location types:

```ts
type SourceLocation = { line: number; column: number }
type LocationEntry = { key: SourceLocation; value: SourceLocation }
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

`@gesslar/vscode-theme-schema` is released into the public domain under the [0BSD](LICENSE.txt).

This package includes or depends on third-party components under their own
licenses:

| Dependency | License |
| --- | --- |
| [@gesslar/toolkit](https://github.com/gesslar/toolkit) | 0BSD |
| [json5](https://github.com/json5/json5) | MIT |
| [jsonc-eslint-parser](https://github.com/ota-meshi/jsonc-eslint-parser) | MIT |
