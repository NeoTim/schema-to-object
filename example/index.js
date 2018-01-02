'use strict';

const defaults = require('../lib/defaults');
const schema = {
  type: 'object',
  properties: {
    success: {
      description: '',
      type: 'boolean',
      default: 'true',
    },
    code: {
      description: 'business code',
      type: 'number',
      default: 100,
    },
    data: {
      type: 'object',
      properties: {
        foo: {
          description: 'foo',
          type: 'string',
          default: 'fooooo',
        },
        bar: {
          description: 'bar',
          type: 'string',
          default: 'baaaaaaar',
        },
      },
      required: [ 'foo', 'bar' ],
    },
    msg: {
      description: '',
      type: 'string',
      default: 'msg',
    },
  },
  required: [ 'success', 'code', 'data', 'msg' ],
};

const obj = defaults(schema);
// const obj = defaults(schema, { comment: true });
console.log(JSON.stringify(obj, null, 2));
