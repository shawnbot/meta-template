'use strict';
const assert = require('./assert');
const parse = require('../parse');
const format = require('../format');

before(function() {
  const opts = {
    clean: true
  };
  this.parse = str => parse.string(str, opts);
  this.format = format.handlebars;
});

describe('handlebars output', function() {

  describe('output expressions', function() {

    describe('single variable', function() {
      assert.formatEquals('{{ x }}', '{{{x}}}');
    });

    describe('nested properties', function() {
      assert.formatEquals('{{ x.y }}', '{{{x.y}}}');
      assert.formatEquals('{{ x[0] }}', '{{{x.[0]}}}');
      assert.formatEquals('{{ x.y[0].z }}', '{{{x.y.[0].z}}}');
      assert.formatEquals('{{ x["#foo"] }}', '{{{x.[#foo]}}}');
    });

    describe('invalid expressions', function() {
      assert.formatThrows('{{ x + 1 }}');
      assert.formatThrows('{{ x or y }}');
      assert.formatThrows('{{ (x) }}');
    });

  });

});
