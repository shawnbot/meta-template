'use strict';
const assert = require('assert');
const fs = require('fs');
const yaml = require('js-yaml');
const parse = require('../parse');

const runSpec = (filename, format) => {
  const spec = yaml.safeLoad(fs.readFileSync(filename));

  assert(Array.isArray(spec.sections),
         'YAML spec sections should be an array');

  spec.sections.forEach(section => {
    describe(section.name, function() {
      if (section.tests) {
        testConversions(section.tests, format);
      }
      if (section.invalid) {
        testInvalid(section.invalid, format);
      }
    });
  });
};

const testConversions = (tests, format) => {
  Object.keys(tests).forEach(input => {
    const output = tests[input];
    it([input, output].join(' => '), function() {
      assert.equal(
        format(parse.string(input)),
        output
      );
    });
  });
};

const testInvalid = (exprs, format) => {
  exprs.forEach(expr => {
    assert.throws(() => format(parse.string(expr)));
  });
};

module.exports = runSpec;
