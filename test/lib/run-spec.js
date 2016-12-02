'use strict';
const assert = require('assert');
const fs = require('fs');
const yaml = require('js-yaml');
const parse = require('../../parse');

const opts = {
  clean: true
};

const parseString = str => parse.string(str, opts);

const runSpec = (filename, format) => {
  const data = yaml.safeLoad(fs.readFileSync(filename));

  assert(Array.isArray(data.sections),
         'YAML data sections should be an array');

  beforeEach(function() {
    this.format = format;
  });

  testSections(data.sections);
};

const testSections = (sections) => {
  sections.forEach(section => {
    const desc = section.pending ? xdescribe : describe;
    desc(section.name, function() {
      if (section.converts) {
        testConverts(section.converts);
      }
      if (section.invalid) {
        testInvalid(section.invalid);
      }
      if (section.sections) {
        testSections(section.sections);
      }
      if (section.preserves) {
        testPreserves(section.preserves);
      }
    });
  });
};

const testConverts = (conv) => {
  const test = (input, output) => {
    it([input, output].join(' => '), function() {
      assert.equal(
        this.format(parseString(input)),
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

const testPreserves = (exprs) => {
  exprs.forEach(expr => {
    it('preserves: ' + expr, function() {
      assert.equal(this.format(parseString(expr)), expr);
    });
  });
};

const testInvalid = (exprs) => {
  exprs.forEach(expr => {
    it('invalid: ' + expr, function() {
      assert.throws(() => this.format(parseString(expr)));
    });
  });
};

module.exports = runSpec;
