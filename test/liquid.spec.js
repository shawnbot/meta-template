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
  });

  describe('block node conversion', function() {
    describe('without {% extends %}', function() {
      assertFormats(
        "{% block x %}hi{% endblock %}",
        "{% if block__x %}{{ block__x }}{% else %}hi{% endif %}"
      );
    });
    describe('with {% extends %}', function() {
      assertFormats(
        "{% extends 'a' %}{% block x %}hi{% endblock %}",
        "{% capture block__x %}hi{% endcapture %}{% include 'a' %}"
      );
    });
  });

  /*
  xdescribe('flattens if/elseif/else hierarchies', function() {
    assertFormats(
      "{% if a %}1{% elseif b %}2{% else %}3{% endif %}",
      "{% if a %}1{% elseif b %}2{% else %}3{% endif %}"
    );
    assertFormats(
      "{% if a %}1{% elseif b %}2{% elseif c %}3{% else %}4{% endif %}",
      "{% if a %}1{% elseif b %}2{% elseif c %}3{% else %}4{% endif %}"
    );
  });
  */

});
