'use strict';

function clone(source) {
  return JSON.parse(JSON.stringify(source));
}

const convert = function(schema, comment) {
  if (typeof schema.default !== 'undefined') {
    return schema.default;
  } else if (schema.type === 'object') {
    const { properties } = schema;
    if (!properties) {
      return {};
    }

    for (const key in properties) {
      if (!properties.hasOwnProperty(key)) continue;

      if (comment) {
        if (properties[key].description) {
          properties[`// ${key}`] = properties[key].description;
        }
      }

      properties[key] = convert(properties[key], comment);
      if (typeof properties[key] === 'undefined') {
        delete properties[key];
      }
    }

    return properties;
  } else if (schema.type === 'array') {
    if (!schema.items) {
      return [];
    }

    // minimum item count
    const ct = schema.minItems || 0;
    // tuple-typed arrays
    if (schema.items.constructor === Array) {
      const values = schema.items.map(function(item) {
        return convert(item, comment);
      });
      // remove undefined items at the end (unless required by minItems)
      for (let i = values.length - 1; i >= 0; i--) {
        if (typeof values[i] !== 'undefined') {
          break;
        }
        if (i + 1 > ct) {
          values.pop();
        }
      }
      return values;
    }
    // object-typed arrays
    const value = convert(schema.items, comment);
    if (typeof value === 'undefined') {
      return [];
    }
    const values = [];
    for (let i = 0; i < Math.max(1, ct); i++) {
      values.push(clone(value));
    }
    return values;
  }
};

function main(schema, options = {}) {
  const { comment = false } = options;
  return convert(clone(schema), comment);
}

module.exports = main;
