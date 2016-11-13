'use strict';
const assert = require('assert');
const parse = require('../parse');
const format = require('../format');

const opts = {
  clean: true
};

const assertFormat = (fmt, input, output, reason) => {
  it(input, function() {
    const ast = parse.string(input, opts);
    assert.equal(output, fmt(ast), reason);
  });
};

const assertFormats = (fmt, templates) => {
  templates.forEach(template => {
    assertFormat(fmt, template, template);
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
    assertFormat(
      fmt,
      "{% if z %}yes{% elseif y %}maybe{% else %}no{% endif %}",
      "{% if z %}yes{% else %}{% if y %}maybe{% else %}no{% endif %}{% endif %}"
    );
  });

  describe('operators', function() {
    describe('addition', function() {
      assertFormats(fmt, [
        '{{ foo + bar }}',
        '{{ foo + 1 }}',
        '{{ foo + 1 + bar }}',
        "{{ foo + 'bar' }}"
      ]);
    });
    describe('subtraction', function() {
      assertFormats(fmt, [
        '{{ foo - bar }}',
        "{{ foo - 1 }}",
      ]);
    });
    describe('addition and subtraction', function() {
      assertFormats(fmt, [
        '{{ foo + bar - 1 }}',
      ]);
    });
  });

  describe('include nodes', function() {
    assertFormats(fmt, [
      "{% include 'foo' %}",
      "{% include foo.bar %}",
      "{% include foo + '.html' %}",
    ]);
  });

});
