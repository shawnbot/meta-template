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
