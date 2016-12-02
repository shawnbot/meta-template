'use strict';
const assert = require('assert');
const fs = require('fs');
const yaml = require('js-yaml');
const parse = require('../parse');

const opts = {
  clean: true
};

const parseString = str => parse.string(str, opts);

const runSpec = (filename, format) => {
  const spec = yaml.safeLoad(fs.readFileSync(filename));

  assert(Array.isArray(spec.sections),
         'YAML spec sections should be an array');

  testSections(spec.sections, format);
};

const testSections = (sections, format) => {
  sections.forEach(section => {
    const desc = section.pending ? xdescribe : describe;
    desc(section.name, function() {
      if (section.converts) {
        testConversions(section.converts, format);
      }
      if (section.invalid) {
        testInvalid(section.invalid, format);
      }
      if (section.sections) {
        testSections(section.sections, format);
      }
    });
  });
};

const testConversions = (conv, format) => {
  const test = (input, output) => {
    it([input, output].join(' => '), function() {
      assert.equal(
        format(parseString(input)),
        output
      );
    });
  };

  if (Array.isArray(conv)) {
    conv.forEach(io => test(io.input, io.output));
  } else {
    Object.keys(conv).forEach(input => {
      test(input, conv[input]);
    });
  }
};

const testInvalid = (exprs, format) => {
  exprs.forEach(expr => {
    assert.throws(() => format(parseString(expr)));
  });
};

module.exports = runSpec;
