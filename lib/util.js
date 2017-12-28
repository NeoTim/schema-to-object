'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

module.exports = {
  isObject: isObject,
  clone: clone,
  merge: merge,
  getLocalRef: getLocalRef,
  mergeAllOf: mergeAllOf
};

function isObject(item) {
  return (typeof item === 'undefined' ? 'undefined' : _typeof(item)) === 'object' && item !== null && item.toString() === {}.toString();
}

function clone(source) {
  return JSON.parse(JSON.stringify(source));
}

function merge(target, source) {
  target = clone(target);

  for (var key in source) {
    if (source.hasOwnProperty(key)) {
      if (isObject(target[key]) && isObject(source[key])) {
        target[key] = merge(target[key], source[key]);
      } else {
        target[key] = source[key];
      }
    }
  }
  return target;
}

function getLocalRef(path, definitions) {
  path = path.replace(/^#\/definitions\//, '').split('/');

  var find = function find(path, root) {
    var key = path.shift();
    if (!root[key]) {
      return {};
    } else if (!path.length) {
      return root[key];
    }
    return find(path, root[key]);
  };

  var result = find(path, definitions);

  if (!isObject(result)) {
    return result;
  }
  return clone(result);
}

function mergeAllOf(allOfList, definitions) {
  var length = allOfList.length;
  var index = -1;
  var result = {};

  while (++index < length) {
    var item = allOfList[index];

    item = typeof item.$ref !== 'undefined' ? getLocalRef(item.$ref, definitions) : item;

    result = merge(result, item);
  }

  return result;
}