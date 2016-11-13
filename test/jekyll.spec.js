'use strict';
const assert = require('assert');
const parse = require('../parse');
const format = require('../format');

const opts = {
  clean: true
};

const fmt = format.jekyll;

const assertFormats = (input, output, reason) => {
  it(input, function() {
    const ast = parse.string(input, opts);
    assert.equal(output, fmt(ast), reason);
  });
};

describe('jekyll format (nunjucks -> jekyll)', function() {

  // TODO: share tests with liquid?

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

  describe('builtin filter name aliases', function() {
    assertFormats(
      '{{ x | dump }}',
      '{{ x | jsonify }}'
    );
  });

});
