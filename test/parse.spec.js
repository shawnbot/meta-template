'use strict';
const assert = require('assert');
const parse = require('../src/parse');

describe('parse.string()', function() {

  it('can parse a string', function() {
    assert.deepEqual(
      parse.string('foo {{ bar }} baz'),
      {
        type: 'Root',
        children: [
          {
            type: 'Output',
            children: [
              {
                type: 'TemplateData',
                value: 'foo '
              }
            ]
          },
          {
            type: 'Output',
            children: [
              {
                type: 'Symbol',
                value: 'bar'
              }
            ]
          },
          {
            type: 'Output',
            children: [
              {
                type: 'TemplateData',
                value: ' baz'
              }
            ]
          }
        ]
      }
    );
  });

});
