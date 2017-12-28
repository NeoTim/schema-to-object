'use strict';

var _require = require('./util'),
    clone = _require.clone,
    getLocalRef = _require.getLocalRef,
    mergeAllOf = _require.mergeAllOf;

var convert = function convert(schema, definitions) {
  if (typeof schema.default !== 'undefined') {
    return schema.default;
  } else if (typeof schema.allOf !== 'undefined') {
    var mergedItem = mergeAllOf(schema.allOf, definitions);
    return convert(mergedItem, definitions);
  } else if (typeof schema.$ref !== 'undefined') {
    var reference = getLocalRef(schema.$ref, definitions);
    return convert(reference, definitions);
  } else if (schema.type === 'object') {
    var properties = schema.properties;

    if (!properties) {
      return {};
    }

    for (var key in properties) {
      if (!properties.hasOwnProperty(key)) continue;

      if (properties[key].description) {
        properties['// ' + key] = [null, '// ' + properties[key].description];
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
    var ct = schema.minItems || 0;
    // tuple-typed arrays
    if (schema.items.constructor === Array) {
      var _values = schema.items.map(function (item) {
        return convert(item, definitions);
      });
      // remove undefined items at the end (unless required by minItems)
      for (var i = _values.length - 1; i >= 0; i--) {
        if (typeof _values[i] !== 'undefined') {
          break;
        }
        if (i + 1 > ct) {
          _values.pop();
        }
      }
      return _values;
    }
    // object-typed arrays
    var value = convert(schema.items, definitions);
    if (typeof value === 'undefined') {
      return [];
    }
    var values = [];
    for (var _i = 0; _i < Math.max(1, ct); _i++) {
      values.push(clone(value));
    }
    return values;
  }
};

function main(schema) {
  return convert(clone(schema));
}

module.exports = main;