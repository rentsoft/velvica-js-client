export default class Options {
  /**
   * Transforms options with camelCase keys into valid snake_case object,
   * additionally performing validations according to schema.
   *
   * @param {Object.<string, any>} [options]
   * @param {Object.<string, AbstractSchema>} [schema]
   */
  static create(options = {}, schema = {}) {
    const result = {};

    for (const [key, propertySchema] of Object.entries(schema)) {
      if (!(key in options) || typeof options[key] === 'undefined') {
        if (!propertySchema.isRequired()) {
          continue;
        }

        throw new Error(`Failed to validate: ${key} is required.`);
      }

      const value = options[key];
      if (!propertySchema.validate(value)) {
        throw new Error(`Failed to validate: ${key} is invalid.`);
      }

      // Converting camelCase to snake_case.
      const resultKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);

      result[resultKey] = value;
    }

    return result;
  }

  /**
   * Helper method to reduce imports and improve readability.
   *
   * @returns {AnySchema}
   */
  static anyValue() {
    return new AnySchema();
  }

  /**
   * Helper method to reduce imports and improve readability.
   *
   * @returns {StringSchema}
   */
  static stringValue() {
    return new StringSchema();
  }

  /**
   * Helper method to reduce imports and improve readability.
   *
   * @returns {NumericSchema}
   */
  static numericValue() {
    return new NumericSchema();
  }

  /**
   * Helper method to reduce imports and improve readability.
   *
   * @param {object} allowedValues
   * @returns {EnumSchema}
   */
  static enumValue(allowedValues) {
    return new EnumSchema(allowedValues);
  }
}

/** @abstract */
export class AbstractSchema {
  constructor() {
    this.required = false;
  }

  /**
   * Validates value according to schema.
   *
   * @param value
   * @returns {boolean}
   */
  validate(value) {
    return true;
  }

  /**
   * Sets if value is required. By default values are not required.
   *
   * @param required
   */
  setRequired(required) {
    this.required = required;
  }

  /**
   * Returns if value is required.
   *
   * @returns {boolean}
   */
  isRequired() {
    return this.required;
  }
}

export class AnySchema extends AbstractSchema {}

export class StringSchema extends AbstractSchema {
  validate(value) {
    return typeof value === 'string';
  }
}

export class NumericSchema extends AbstractSchema {
  validate(value) {
    return value.toString().match(/\d+/) !== null;
  }
}

export class EnumSchema extends AbstractSchema {
  /**
   * @param {object} allowedValues - enum
   */
  constructor(allowedValues) {
    super();
    this.allowedValues = allowedValues;
  }

  validate(value) {
    return Object.values(this.allowedValues).includes(value);
  }
}
