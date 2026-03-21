import * as vscode from "vscode"
import JSON5 from "json5"

/**
 * @import {PropertySchema} from "./Validator.js"
 */

/**
 * Singleton wrapper around the VS Code workbench-colors schema.
 * Parses the raw JSON schema, resolves `$ref` entries, and exposes
 * the result as a Map keyed by color property name.
 */
export default class VSCodeSchema {
  /**
   * Internal URI used to fetch the workbench-colors schema from VS Code.
   *
   * @type {string}
   * @private
   */
  static #schemaUri = "vscode://schemas/workbench-colors"

  /**
   * Cached singleton instance.
   *
   * @type {VSCodeSchema|null}
   * @private
   */
  static #instance = null

  /**
   * Resolved schema map of color property names to their definitions.
   *
   * @type {Map<string, PropertySchema>}
   * @private
   */
  #schema = new Map()

  /**
   * Map of definition categories to their resolved definitions.
   *
   * @type {Map<string, Map<string, *>>}
   * @private
   */
  #defs = new Map()

  /**
   * Creates a new VSCodeSchema by parsing and resolving raw schema data.
   *
   * @param {string} schemaData - Raw JSON5 schema text from VS Code
   */
  constructor(schemaData) {
    const resolvedSchema = this.#resolveSchema(
      JSON5.parse(schemaData)
    )

    this.#schema = resolvedSchema
  }

  /**
   * Returns the singleton VSCodeSchema instance, creating it on first call
   * by fetching and parsing the workbench-colors schema from VS Code.
   *
   * @returns {Promise<VSCodeSchema>} The singleton instance
   */
  static async new() {
    if(this.#instance)
      return this.#instance

    try {
      // Setup the schema
      const schemaUri = vscode.Uri.parse(this.#schemaUri)
      const schema = await vscode.workspace.openTextDocument(schemaUri)
      const data = schema.getText()
      const instance = new VSCodeSchema(data)

      this.#instance = instance

      return instance
    } catch(error) {
      console.error(error)
      throw error
    }
  }

  /**
   * Resolves `$ref` entries in the raw schema and derives alpha requirements
   * from pattern definitions.
   *
   * @param {{properties: Record<string, unknown>, $defs: Record<string, unknown>}} loaded - Parsed schema object
   * @returns {Map<string, PropertySchema>} Resolved schema map
   * @private
   */
  #resolveSchema(loaded) {
    const refPattern = /^#\/\$(?<cat>\w+)\/(?<def>.*)$/
    const {properties,$defs: defs} = loaded
    const schema = new Map()

    for(const [k,v] of Object.entries(properties)) {
      const work = v

      if(v.$ref) {
        const ref = v.$ref

        delete v.$ref

        const {cat,def,value} = resolveReference.call(this, ref,defs)

        recordDefinition.call(this, {cat,def,value})

        Object.assign(work, value)
      }

      if(v.oneOf) {
        const oneOf = v.oneOf

        oneOf.forEach(el => {
          if(el.$ref) {
            const ref = el.$ref

            delete(el.$ref)
            const {cat,def,value} = resolveReference.call(this, ref,defs)

            recordDefinition.call(this, {cat,def,value})

            Object.assign(el, value)
          }
        })

        work.oneOf = oneOf

        for(const el of oneOf) {
          if(el.deprecationMessage) {
            work.deprecationMessage = el.deprecationMessage
            break
          }
        }
      }

      // Derive alpha requirement by executing patterns rather than brittle
      // string inspection
      try {
        let allows6 = false
        let allows8 = false

        if(Array.isArray(work.oneOf)) {
          for(const opt of work.oneOf) {
            if(!opt || !opt.pattern)
              continue

            try {
              const re = new RegExp(opt.pattern)

              if(re.test("#ffffff"))
                allows6 = true

              if(re.test("#ffffffaa"))
                allows8 = true
            } catch {
              // Ignore malformed pattern entries
            }
          }
        }

        work.alphaRequired = allows8 && !allows6

        if(!Object.prototype.hasOwnProperty.call(work, "sample"))
          work.sample = work.alphaRequired ? "#ffffffaa" : "#ffffff"
      } catch {
        // Ignore derivation issues silently
      }

      schema.set(k,work)
    }

    return schema

    /**
     * Resolve a reference to its definition in the definitions object.
     *
     * @param {string} ref - The reference to resolve
     * @param {Record<string, unknown>} defs - The definitions object.
     * @returns {{cat: string, def: string, value: unknown}} The category, definition name, and the definition.
     */
    function resolveReference(ref, defs) {
      const {cat,def} = refPattern.exec(ref)?.groups ?? {}

      if(!cat || !def)
        throw new Error(`Invalid reference/definition pair for ${JSON.stringify(ref)}.`)

      if(!defs[def])
        throw new Error(`No definition for ${ref}`)

      return {
        cat,
        def,
        value: defs[def]
      }
    }

    /**
     * Record a definition that has been previously resolved in the #defs map.
     *
     * @param {{cat: string, def: string, value: unknown}} args - The arguments.
     * @param {string} args.cat - The category
     * @param {string} args.def - The definition to add
     * @param {unknown} args.value - The value of the definition
     */
    function recordDefinition({cat,def,value}) {
      if(!this.#defs.has(cat))
        this.#defs.set(cat, new Map())

      if(!this.#defs.get(cat).get(def))
        this.#defs.get(cat).set(def, value)
    }
  }

  /**
   * Returns the resolved schema map (for implicit coercion).
   *
   * @returns {Map<string, PropertySchema>} The schema map
   */
  valueOf() {
    return this.#schema
  }

  /**
   * The resolved schema map of color property names to their definitions.
   *
   * @type {Map<string, PropertySchema>}
   */
  get map() {
    return this.#schema
  }

  /**
   * The number of color properties in the schema.
   *
   * @type {number}
   */
  get size() {
    return this.#schema.size
  }
}
