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
    static fromFile(file: FileObject, cwd?: DirectoryObject): Promise<JsonSource | null>;
    /**
     * Parses JSON/JSONC source text and builds the internal location map.
     *
     * @param {string} text - Raw JSON/JSONC source text
     * @param {string} [filePath] - Optional file path for display in messages
     */
    constructor(text: string, filePath?: string);
    /**
     * Gets the key source location for a dotted key path.
     *
     * @param {string} dottedPath - Dot-separated key path (e.g. "colors.bg")
     * @returns {SourceLocation|null} Location or null if not found
     */
    getLocation(dottedPath: string): SourceLocation | null;
    /**
     * Gets the value source location for a dotted key path.
     *
     * @param {string} dottedPath - Dot-separated key path (e.g. "colors.bg")
     * @returns {SourceLocation|null} Location or null if not found
     */
    getValueLocation(dottedPath: string): SourceLocation | null;
    /**
     * Formats a location as "file:line:column" or "line:column" for display.
     * Both line and column in the output are 1-based (CLI-style).
     *
     * @param {string} dottedPath - Dot-separated key path
     * @param {"key"|"value"} [target="key"] - Whether to locate the key or value
     * @returns {string|null} Formatted location string or null if not found
     */
    formatLocation(dottedPath: string, target?: "key" | "value"): string | null;
    /**
     * Gets the parsed AST.
     *
     * @returns {import("jsonc-eslint-parser").AST.JSONProgram|null} The jsonc-eslint-parser AST
     */
    get ast(): import("jsonc-eslint-parser").AST.JSONProgram | null;
    /**
     * Gets the file path associated with this source.
     *
     * @returns {string|null} The file path or null
     */
    get filePath(): string | null;
    /**
     * Gets the full location map (for debugging or advanced use).
     *
     * @returns {Map<string, LocationEntry>} The complete path→location map
     */
    get locationMap(): Map<string, LocationEntry>;
    #private;
}
export type SourceLocation = {
    /**
     * - 1-based line number
     */
    line: number;
    /**
     * - 0-based column offset
     */
    column: number;
};
export type LocationEntry = {
    /**
     * - Location of the key
     */
    key: SourceLocation;
    /**
     * - Location of the value (falls back to key)
     */
    value: SourceLocation;
};
import type { FileObject } from "@gesslar/toolkit";
import type { DirectoryObject } from "@gesslar/toolkit";
//# sourceMappingURL=JsonSource.d.ts.map