'use strict';
const assert = require('assert');
const parse = require('../src/parse');
const format = require('../src/format');

const assertFormats = (fmt, templates) => {
  templates.forEach(template => {
    it(template, function() {
      const ast = parse.string(template);
      assert.equal(template, fmt(ast));
    });
  });
};

describe('format()', function() {

  describe('can format an AST back to text', function() {

    describe('formats output expressions', function() {
      assertFormats(format(), [
        "foo {{ bar }} baz",
        "foo {{ bar }} baz {{ qux[0] }}",
        "foo {{ bar['baz qux'][1].x }}",
      ]);
    });

    describe('formats for..in loops', function() {
      assertFormats(format(), [
        "{% for x in items %}la {{ x[0] }}{% endfor %}",
        "{% for x in items.x['foo bar'].qux %}la {{ x[0] }}{% endfor %}",
      ]);
    });

    describe('formats if conditionals', function() {
      assertFormats(format(), [
        "{% if z %}yes{% endif %}",
        "{% if z == 'bar' %}yes{% endif %}",
        "{% if z %}yes{% else %}no{% endif %}",
      ]);
    });

    xdescribe('flattens if/elseif/else hierarchies', function() {
      assertFormats(format(), [
        "{% if a %}1{% elseif b %}2{% else %}3{% endif %}",
        "{% if a %}1{% elseif b %}2{% elseif c %}3{% else %}4{% endif %}",
      ]);
    });

  });

});