'use strict';

module.exports = {
  isObject,
  clone,
  merge,
  getLocalRef,
  mergeAllOf,
};

function isObject(item) {
  return (
    typeof item === 'object' &&
    item !== null &&
    item.toString() === {}.toString()
  );
}

function clone(source) {
  return JSON.parse(JSON.stringify(source));
}

function merge(target, source) {
  target = clone(target);

  for (const key in source) {
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

  const find = function(path, root) {
    const key = path.shift();
    if (!root[key]) {
      return {};
    } else if (!path.length) {
      return root[key];
    }
    return find(path, root[key]);
  };

  const result = find(path, definitions);

  if (!isObject(result)) {
    return result;
  }
  return clone(result);
}

function mergeAllOf(allOfList, definitions) {
  const length = allOfList.length;
  let index = -1;
  let result = {};

  while (++index < length) {
    let item = allOfList[index];

    item =
      typeof item.$ref !== 'undefined'
        ? getLocalRef(item.$ref, definitions)
        : item;

    result = merge(result, item);
  }

  return result;
}
