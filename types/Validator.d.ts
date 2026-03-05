/**
 * Color validation module for Hex extension.
 *
 * @module Validator
 * @example
 * // In another file, reference these types in JSDoc:
 * // import('./Validator.js').ValidationResult
 * // import('./Validator.js').PropertySchema
 */
/**
 * Result of validating a single color property.
 *
 * @typedef {object} ValidationResult
 * @property {string} property - The property key that was validated
 * @property {"valid"|"warn"|"invalid"} status - Whether the property passed validation
 * @property {string} description - Schema description of the color property
 * @property {string} value - The color value that was validated
 * @property {string} [message] - Error or deprecation message when status is not "valid"
 */
/**
 * Internal validation result from property check.
 *
 * @typedef {object} PropertyValidationResult
 * @property {boolean} isValid - Whether the property is valid
 * @property {string} [error] - Error message if invalid
 */
/**
 * A pattern option within a property schema.
 *
 * @typedef {object} SchemaPatternOption
 * @property {string} [pattern] - Regex pattern to match
 * @property {string} [patternErrorMessage] - Error message when pattern fails
 */
/**
 * Schema definition for a color property.
 *
 * @typedef {object} PropertySchema
 * @property {string} [description] - Description of the color property
 * @property {SchemaPatternOption[]} [oneOf] - Array of pattern options to validate against
 * @property {string} [deprecationMessage] - Deprecation message if property is deprecated
 */
/**
 * Validates user color configurations against a schema.
 *
 * @class
 */
export default class Validator {
    /**
     * Validates user colors against a schema definition.
     *
     * @param {Map<string, PropertySchema>} schema - Map of property names to their schema definitions
     * @param {Record<string, string>} userColors - Object of color property names to color values
     * @returns {Promise<ValidationResult[]>} Array of validation results for each property
     */
    static validate(schema: Map<string, PropertySchema>, userColors: Record<string, string>): Promise<ValidationResult[]>;
    /**
     * Regular expression for validating hex color formats.
     * Matches #RGB, #RGBA, #RRGGBB, and #RRGGBBAA.
     *
     * @type {RegExp}
     * @private
     */
    private static "__#private@#colourHex";
    /**
     * Validates a single color property against its schema.
     *
     * @param {string} _key - The property key (unused, for potential future logging)
     * @param {string} value - The color value to validate
     * @param {PropertySchema} propertySchema - The schema definition for this property
     * @returns {PropertyValidationResult} Validation result with isValid flag and optional error
     * @private
     */
    private static "__#private@#validateColorProperty";
}
/**
 * Result of validating a single color property.
 */
export type ValidationResult = {
    /**
     * - The property key that was validated
     */
    property: string;
    /**
     * - Whether the property passed validation
     */
    status: "valid" | "warn" | "invalid";
    /**
     * - Schema description of the color property
     */
    description: string;
    /**
     * - The color value that was validated
     */
    value: string;
    /**
     * - Error or deprecation message when status is not "valid"
     */
    message?: string;
};
/**
 * Internal validation result from property check.
 */
export type PropertyValidationResult = {
    /**
     * - Whether the property is valid
     */
    isValid: boolean;
    /**
     * - Error message if invalid
     */
    error?: string;
};
/**
 * A pattern option within a property schema.
 */
export type SchemaPatternOption = {
    /**
     * - Regex pattern to match
     */
    pattern?: string;
    /**
     * - Error message when pattern fails
     */
    patternErrorMessage?: string;
};
/**
 * Schema definition for a color property.
 */
export type PropertySchema = {
    /**
     * - Description of the color property
     */
    description?: string;
    /**
     * - Array of pattern options to validate against
     */
    oneOf?: SchemaPatternOption[];
    /**
     * - Deprecation message if property is deprecated
     */
    deprecationMessage?: string;
};
//# sourceMappingURL=Validator.d.ts.map