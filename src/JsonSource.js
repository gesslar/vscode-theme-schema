/**
 * @file JsonSource.js
 *
 * Parses JSON/JSONC text with jsonc-eslint-parser to produce an AST with full
 * source-location information. Builds a path → location map so that
 * any dotted key path (e.g. "colors.editor.background") can be
 * resolved to a {line, column} in the original file.
 */

import {parseForESLint} from "jsonc-eslint-parser"

/**
 * @typedef {object} SourceLocation
 * @property {number} line - 1-based line number
 * @property {number} column - 0-based column offset
 */

/**
 * @typedef {object} LocationEntry
 * @property {SourceLocation} key - Location of the key
 * @property {SourceLocation} value - Location of the value (falls back to key)
 */

/**
 * Wraps a parsed JSON/JSONC AST and provides fast path-to-location lookups.
 */
/**
 * @import {FileObject} from "@gesslar/toolkit"
 * @import {DirectoryObject} from "@gesslar/toolkit"
 */

export default class JsonSource {
  /**
   * Creates a JsonSource from a file, using the cwd for relative labelling.
   * Returns null for non-JSON files or on parse failure.
   *
   * @param {FileObject} file - The file to parse
   * @param {DirectoryObject} [cwd] - Optional cwd for relative path labels
   * @returns {Promise<JsonSource?>} The parsed JSON source or null
   */
  static async fromFile(file, cwd) {
    const ext = file.extension

    if(ext !== ".json" && ext !== ".jsonc" && ext !== ".json5")
      return null

    try {
      const label = cwd
        ? file.relativeTo(cwd)
        : file.path
      const text = await file.read()

      return new JsonSource(text, label)
    } catch {
      return null
    }
  }

  /** @type {Map<string, LocationEntry>} */
  #locationMap = new Map()

  /** @type {object} */
  #ast = null

  /** @type {string|null} */
  #filePath = null

  /**
   * Parses JSON/JSONC source text and builds the internal location map.
   *
   * @param {string} text - Raw JSON/JSONC source text
   * @param {string} [filePath] - Optional file path for display in messages
   */
  constructor(text, filePath) {
    const {ast} = parseForESLint(text)

    this.#ast = ast
    this.#filePath = filePath ?? null
    this.#buildLocationMap()
  }

  /**
   * Gets the key source location for a dotted key path.
   *
   * @param {string} dottedPath - Dot-separated key path (e.g. "colors.bg")
   * @returns {SourceLocation|null} Location or null if not found
   */
  getLocation(dottedPath) {
    return this.#locationMap.get(dottedPath)?.key ?? null
  }

  /**
   * Gets the value source location for a dotted key path.
   *
   * @param {string} dottedPath - Dot-separated key path (e.g. "colors.bg")
   * @returns {SourceLocation|null} Location or null if not found
   */
  getValueLocation(dottedPath) {
    return this.#locationMap.get(dottedPath)?.value ?? null
  }

  /**
   * Formats a location as "file:line:column" or "line:column" for display.
   *
   * @param {string} dottedPath - Dot-separated key path
   * @param {"key"|"value"} [target="key"] - Whether to locate the key or value
   * @returns {string|null} Formatted location string or null if not found
   */
  formatLocation(dottedPath, target = "key") {
    const loc = target === "value"
      ? this.getValueLocation(dottedPath)
      : this.getLocation(dottedPath)

    if(!loc)
      return null

    const position = `${loc.line}:${loc.column + 1}`

    return this.#filePath
      ? `${this.#filePath}:${position}`
      : position
  }

  /**
   * Gets the parsed AST.
   *
   * @returns {object} The jsonc-eslint-parser AST
   */
  get ast() {
    return this.#ast
  }

  /**
   * Gets the file path associated with this source.
   *
   * @returns {string|null} The file path or null
   */
  get filePath() {
    return this.#filePath
  }

  /**
   * Gets the full location map (for debugging or advanced use).
   *
   * @returns {Map<string, LocationEntry>} The complete path→location map
   */
  get locationMap() {
    return this.#locationMap
  }

  /**
   * Walks the AST and populates the location map.
   *
   * @private
   */
  #buildLocationMap() {
    const root = this.#ast.body[0]?.expression

    if(root?.type === "JSONObjectExpression")
      this.#walkObject(root, [])
  }

  /**
   * Walks a JSONObjectExpression node, recording locations for each key.
   *
   * @param {object} obj - JSONObjectExpression AST node
   * @param {Array<string>} path - Current path segments
   * @private
   */
  #walkObject(obj, path) {
    for(const prop of obj.properties) {
      const key = prop.key?.type === "JSONLiteral"
        ? prop.key.value
        : prop.key?.name

      if(key == null)
        continue

      const fullPath = [...path, String(key)]
      const pathStr = fullPath.join(".")

      const keyLoc = prop.key.loc.start
      const valLoc = prop.value?.loc?.start ?? keyLoc

      this.#locationMap.set(pathStr, {
        key: {line: keyLoc.line, column: keyLoc.column},
        value: {line: valLoc.line, column: valLoc.column},
      })

      if(prop.value?.type === "JSONObjectExpression")
        this.#walkObject(prop.value, fullPath)
      else if(prop.value?.type === "JSONArrayExpression")
        this.#walkArray(prop.value, fullPath)
    }
  }

  /**
   * Walks a JSONArrayExpression node, recording locations for each element.
   *
   * @param {object} arr - JSONArrayExpression AST node
   * @param {Array<string>} path - Current path segments
   * @private
   */
  #walkArray(arr, path) {
    arr.elements.forEach((element, i) => {
      if(!element)
        return

      const fullPath = [...path, String(i)]
      const pathStr = fullPath.join(".")

      if(element.loc) {
        const loc = {
          line: element.loc.start.line,
          column: element.loc.start.column
        }

        this.#locationMap.set(pathStr, {key: loc, value: loc})
      }

      if(element.type === "JSONObjectExpression")
        this.#walkObject(element, fullPath)
      else if(element.type === "JSONArrayExpression")
        this.#walkArray(element, fullPath)
    })
  }
}
