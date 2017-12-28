'use strict';

const { clone, getLocalRef, mergeAllOf } = require('./util');

const convert = function(schema, definitions) {
  if (typeof schema.default !== 'undefined') {
    return schema.default;
  } else if (typeof schema.allOf !== 'undefined') {
    const mergedItem = mergeAllOf(schema.allOf, definitions);
    return convert(mergedItem, definitions);
  } else if (typeof schema.$ref !== 'undefined') {
    const reference = getLocalRef(schema.$ref, definitions);
    return convert(reference, definitions);
  } else if (schema.type === 'object') {
    const { properties } = schema;
    if (!properties) {
      return {};
    }

    for (const key in properties) {
      if (!properties.hasOwnProperty(key)) continue;

      if (properties[key].description) {
        properties[`// ${key}`] = [ null, `// ${properties[key].description}` ];
      }

      properties[key] = convert(properties[key], definitions);
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
        return convert(item, definitions);
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
    const value = convert(schema.items, definitions);
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

function main(schema) {
  return convert(clone(schema));
}

module.exports = main;
