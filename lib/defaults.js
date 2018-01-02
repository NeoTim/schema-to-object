'use strict';

function clone(source) {
  return JSON.parse(JSON.stringify(source));
}

var convert = function convert(schema, comment) {
  if (typeof schema.default !== 'undefined') {
    return schema.default;
  } else if (schema.type === 'object') {
    var properties = schema.properties;

    if (!properties) {
      return {};
    }

    for (var key in properties) {
      if (!properties.hasOwnProperty(key)) continue;

      if (comment) {
        if (properties[key].description) {
          properties['// ' + key] = properties[key].description;
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
    var ct = schema.minItems || 0;
    // tuple-typed arrays
    if (schema.items.constructor === Array) {
      var _values = schema.items.map(function (item) {
        return convert(item, comment);
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
    var value = convert(schema.items, comment);
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
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var _options$comment = options.comment,
      comment = _options$comment === undefined ? false : _options$comment;

  return convert(clone(schema), comment);
}

module.exports = main;