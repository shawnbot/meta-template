'use strict';
const assert = require('assert');
const parse = require('../parse');

const opts = {
  clean: true
};

describe('parse.string()', function() {

  it('can parse a string', function() {
    assert.deepEqual(
      parse.string('foo {{ bar }} baz', opts),
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
