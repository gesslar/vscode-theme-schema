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
    private static #schemaUri;
    /**
     * Cached singleton instance.
     *
     * @type {VSCodeSchema|null}
     * @private
     */
    private static #instance;
    /**
     * Returns the singleton VSCodeSchema instance, creating it on first call
     * by fetching and parsing the workbench-colors schema from VS Code.
     *
     * @returns {Promise<VSCodeSchema>} The singleton instance
     */
    static "new"(): Promise<VSCodeSchema>;
    /**
     * Creates a new VSCodeSchema by parsing and resolving raw schema data.
     *
     * @param {string} schemaData - Raw JSON5 schema text from VS Code
     */
    constructor(schemaData: string);
    /**
     * Returns the resolved schema map (for implicit coercion).
     *
     * @returns {Map<string, PropertySchema>} The schema map
     */
    valueOf(): Map<string, PropertySchema>;
    /**
     * The resolved schema map of color property names to their definitions.
     *
     * @type {Map<string, PropertySchema>}
     */
    get map(): Map<string, PropertySchema>;
    /**
     * The number of color properties in the schema.
     *
     * @type {number}
     */
    get size(): number;
    #private;
}
import type { PropertySchema } from "./Validator.js";
//# sourceMappingURL=VSCodeSchema.d.ts.map