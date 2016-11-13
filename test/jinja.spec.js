'use strict';
const assert = require('assert');
const parse = require('../parse');
const format = require('../format');

const opts = {
  clean: true
};

const fmt = format.jinja;

const assertFormat = (input, output, reason) => {
  it(input, function() {
    const ast = parse.string(input, opts);
    assert.equal(output, fmt(ast), reason);
  });
};

describe('jinja compatibility', function() {

  describe('operator substitution', function() {
    assertFormat(
      '{{ foo === 1 }}',
      '{{ foo == 1 }}'
    );
  });

  describe('Python constant substitution', function() {
    assertFormat(
      '{{ foo == true }}',
      '{{ foo == True }}'
    );
    assertFormat(
      '{{ bar == false }}',
      '{{ bar == False }}'
    );
  });

});
