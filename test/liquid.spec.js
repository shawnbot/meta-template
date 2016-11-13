'use strict';
const assert = require('assert');
const parse = require('../parse');
const format = require('../format');

const opts = {
  clean: true
};

const fmt = format.liquid;

const assertFormats = (input, output, reason) => {
  it(input, function() {
    const ast = parse.string(input, opts);
    assert.equal(output, fmt(ast), reason);
  });
};

describe('liquid format (nunjucks -> liquid)', function() {

  describe('formats output expressions', function() {
    assertFormats(
      "foo {{ bar }} baz",
      "foo {{ bar }} baz"
    );
    assertFormats(
      "foo {{ bar }} baz {{ qux[0] }}",
      "foo {{ bar }} baz {{ qux[0] }}"
    );
    assertFormats(
      "foo {{ bar['baz qux'][1].x }}",
      "foo {{ bar['baz qux'][1].x }}"
    );
  });

  describe('formats filter tags', function() {
    assertFormats(
      "foo {{ bar | qux }} baz",
      "foo {{ bar | qux }} baz"
    );
    assertFormats(
      "foo {{ bar | qux(1) }} baz",
      "foo {{ bar | qux: 1 }} baz"
    );
    assertFormats(
      "foo {{ bar | qux(1, 'quux', bar.baz[0]) }} baz",
      "foo {{ bar | qux: 1, 'quux', bar.baz[0] }} baz"
    );
  });

  describe('formats for..in loops', function() {
    assertFormats(
      "{% for x in items %}la {{ x[0] }}{% endfor %}",
      "{% for x in items %}la {{ x[0] }}{% endfor %}"
    );
    assertFormats(
      "{% for x in items.x['foo bar'].qux %}la {{ x[0] }}{% endfor %}",
      "{% for x in items.x['foo bar'].qux %}la {{ x[0] }}{% endfor %}"
    );
  });

  describe('formats if conditionals', function() {
    assertFormats(
      "{% if z %}yes{% endif %}",
      "{% if z %}yes{% endif %}"
    );
    assertFormats(
      "{% if z == 'bar' %}yes{% endif %}",
      "{% if z == 'bar' %}yes{% endif %}"
    );
    assertFormats(
      "{% if z %}yes{% else %}no{% endif %}",
      "{% if z %}yes{% else %}no{% endif %}"
    );
    assertFormats(
      "{% if z %}yes{% elif y %}maybe{% else %}no{% endif %}",
      "{% if z %}yes{% else %}{% if y %}maybe{% else %}no{% endif %}{% endif %}"
    );
  });

  describe('simple operators', function() {
    describe('add', function() {
      assertFormats(
        '{{ x + 1 }}',
        '{{ x | plus: 1 }}'
      );
      assertFormats(
        '{{ x + 1 + y }}',
        '{{ x | plus: 1 | plus: y }}'
      );
    });

    describe('subtract', function() {
      assertFormats(
        '{{ x - 1 }}',
        '{{ x | minus: 1 }}'
      );
      assertFormats(
        '{{ x - y - 1 }}',
        '{{ x | minus: y | minus: 1 }}'
      );
    });

    describe('multiply', function() {
      assertFormats(
        '{{ x * 2 }}',
        '{{ x | times: 2 }}'
      );
      assertFormats(
        '{{ x * y * 2 }}',
        '{{ x | times: y | times: 2 }}'
      );
    });

    describe('divide', function() {
      assertFormats(
        '{{ x / 2 }}',
        '{{ x | divided_by: 2 }}'
      );
      assertFormats(
        '{{ x / y }}',
        '{{ x | divided_by: y }}'
      );
    });

    describe('mixed operators', function() {
      assertFormats(
        '{{ x - 1 + y }}',
        '{{ x | minus: 1 | plus: y }}'
      );
      assertFormats(
        '{{ x / 2 + y }}',
        '{{ x | divided_by: 2 | plus: y }}'
      );
    });

  });

  describe('comparator conversion', function() {
    it('replaces === with ==', function() {
      assertFormats(
        '{{ x === 1 }}',
        '{{ x == 1 }}'
      );
    });
  });

  describe('symbol aliases', function() {
    it('replaces null with nil', function() {
      assertFormats(
        '{{ x == null }}',
        '{{ x == nil }}'
      );
    });
  });

  describe('builtin filter name aliases', function() {
    assertFormats(
      '{{ x | dump }}',
      '{{ x | jsonify }}'
    );
    assertFormats(
      '{{ x | striptags }}',
      '{{ x | strip_html }}'
    );
    assertFormats(
      '{{ x | urlencode }}',
      '{{ x | url_encode }}'
    );
    assertFormats(
      '{{ x | upper }}',
      '{{ x | upcase }}'
    );
    assertFormats(
      '{{ x | lower }}',
      '{{ x | downcase }}'
    );
    assertFormats(
      '{{ x | title }}',
      '{{ x | capitalize }}'
    );
    assertFormats(
      '{{ x | nl2br }}',
      '{{ x | newline_to_br }}'
    );
  });

  describe('set node conversion', function() {
    it('subs set for assign', function() {
      assertFormats(
        '{% set foo = 1 %}',
        '{% assign foo = 1 %}'
      );
      assertFormats(
        '{% set foo = x * 2 %}',
        '{% assign foo = x | times: 2 %}'
      );
    });

    it('uses capture when there is no assignment', function() {
      assertFormats(
        '{% set foo %}1{% endset %}',
        '{% capture foo %}1{% endcapture %}'
      );
      assertFormats(
        '{% set foo %}{{ x * 2 }}{% endset %}',
        '{% capture foo %}{{ x | times: 2 }}{% endcapture %}'
      );
    });
  });

});
