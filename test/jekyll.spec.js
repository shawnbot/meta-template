'use strict';
const assert = require('assert');
const parse = require('../parse');
const format = require('../format');

before(function() {
  const opts = {
    clean: true
  };
  this.parse = str => parse.string(str, opts);
  this.format = format.jekyll;
});

describe('jekyll output', function() {

  // TODO: share tests with liquid?

  describe('block node conversion', function() {
    describe('without {% extends %}', function() {
      assert.formatEquals(
        "{% block x %}hi{% endblock %}",
        "{% if block__x %}{{ block__x }}{% else %}hi{% endif %}"
      );
    });
    describe('with {% extends %}', function() {
      assert.formatEquals(
        "{% extends 'a' %}{% block x %}hi{% endblock %}",
        "{% capture block__x %}hi{% endcapture %}{% include 'a' %}"
      );
    });
  });

  describe('builtin filter name aliases', function() {
    assert.formatEquals(
      '{{ x | dump }}',
      '{{ x | jsonify }}'
    );
  });

});
