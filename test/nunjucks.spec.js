'use strict';
const assert = require('assert');
const parse = require('../parse');
const format = require('../format');

const opts = {
  clean: true
};

const fmt = format.nunjucks;

const assertFormat = (input, output, reason) => {
  it(input, function() {
    const ast = parse.string(input, opts);
    assert.equal(output, fmt(ast), reason);
  });
};

const assertFormats = (templates) => {
  templates.forEach(template => {
    assertFormat(template, template);
  });
};

describe('default format (nunjucks -> nunjucks)', function() {

  describe('formats output expressions', function() {
    assertFormats([
      "foo {{ bar }} baz",
      "foo {{ bar }} baz {{ qux[0] }}",
      "foo {{ bar['baz qux'][1].x }}",
    ]);
  });

  describe('formats filter tags', function() {
    assertFormats([
      "foo {{ bar | qux }} baz",
      "foo {{ bar | qux(1) }} baz",
      "foo {{ bar | qux(1, 'quux', bar.baz[0]) }} baz",
    ]);
  });

  describe('formats for..in loops', function() {
    assertFormats([
      "{% for x in items %}la {{ x[0] }}{% endfor %}",
      "{% for x in items.x['foo bar'].qux %}la {{ x[0] }}{% endfor %}",
    ]);
  });

  describe('formats if conditionals', function() {
    assertFormats([
      "{% if z %}yes{% endif %}",
      "{% if z == 'bar' %}yes{% endif %}",
      "{% if z %}yes{% else %}no{% endif %}",
    ]);
    assertFormat(
      "{% if z %}yes{% elseif y %}maybe{% else %}no{% endif %}",
      "{% if z %}yes{% else %}{% if y %}maybe{% else %}no{% endif %}{% endif %}"
    );
  });

  describe('literals', function() {
    it('does not quote true, false, or null', function() {
      assertFormats([
        '{{ true }}',
        '{{ false }}',
        '{{ null }}',
      ]);
    });
  });

  describe('operators', function() {
    describe('add', function() {
      assertFormats([
        '{{ foo + bar }}',
        '{{ foo + 1 }}',
        '{{ foo + 1 + bar }}',
        "{{ foo + 'bar' }}"
      ]);
    });

    describe('subtract', function() {
      assertFormats([
        '{{ foo - bar }}',
        "{{ foo - 1 }}",
      ]);
    });

    describe('multiply', function() {
      assertFormats([
        '{{ x * 2 }}',
        '{{ x * y * 2 }}',
      ]);
    });

    describe('divide', function() {
      assertFormats([
        '{{ x / 2 }}',
        '{{ x / y }}',
      ]);
    });

    describe('mixed operators', function() {
      assertFormats([
        '{{ foo + bar - 1 }}',
        '{{ foo / bar + 2 }}',
        '{{ foo / bar * 2 - 1 }}',
      ]);
    });

    describe('parenthesis grouping', function() {
      assertFormats([
        '{{ foo + (bar + 1) }}',
        '{{ foo / (bar + 1) }}',
      ]);
    });
  });

  describe('include nodes', function() {
    assertFormats([
      "{% include 'foo' %}",
      "{% include foo.bar %}",
      "{% include foo + '.html' %}",
    ]);
  });

});
