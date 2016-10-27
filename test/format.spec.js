'use strict';
const assert = require('assert');
const parse = require('../parse');
const format = require('../format');

const assertFormats = (fmt, templates) => {
  templates.forEach(template => {
    it(template, function() {
      const ast = parse.string(template);
      assert.equal(template, fmt(ast));
    });
  });
};

describe('default format (nunjucks -> nunjucks)', function() {

  var fmt = format.defaultFormat;

  describe('formats output expressions', function() {
    assertFormats(fmt, [
      "foo {{ bar }} baz",
      "foo {{ bar }} baz {{ qux[0] }}",
      "foo {{ bar['baz qux'][1].x }}",
    ]);
  });

  describe('formats filter tags', function() {
    assertFormats(fmt, [
      "foo {{ bar | qux }} baz",
      "foo {{ bar | qux(1) }} baz",
      "foo {{ bar | qux(1, 'quux', bar.baz[0]) }} baz",
    ]);
  });

  describe('formats for..in loops', function() {
    assertFormats(fmt, [
      "{% for x in items %}la {{ x[0] }}{% endfor %}",
      "{% for x in items.x['foo bar'].qux %}la {{ x[0] }}{% endfor %}",
    ]);
  });

  describe('formats if conditionals', function() {
    assertFormats(fmt, [
      "{% if z %}yes{% endif %}",
      "{% if z == 'bar' %}yes{% endif %}",
      "{% if z %}yes{% else %}no{% endif %}",
    ]);
  });

  xdescribe('flattens if/elseif/else hierarchies', function() {
    assertFormats(fmt, [
      "{% if a %}1{% elseif b %}2{% else %}3{% endif %}",
      "{% if a %}1{% elseif b %}2{% elseif c %}3{% else %}4{% endif %}",
    ]);
  });

});
