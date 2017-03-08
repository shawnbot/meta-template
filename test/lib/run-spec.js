'use strict';
const assert = require('assert');
const fs = require('fs');
const yaml = require('js-yaml');
const parse = require('../../parse');

// TODO: explain why we need to do this
const opts = {
  clean: true
};

// strings are always parsed the same way
const parseString = str => parse.string(str, opts);

/**
 * Read the provided YAML file by name, add the mocha beforEach()
 * hook that establishes the format function, then execute the tests
 * in the parsed file.
 *
 * The schema looks something like this:
 *
 * name: string
 * tests:
 *   - name: test name
 *     <test>: <spec>
 *   - name: group name
 *     tests: <tests>
 *
 * where the <test> can be one of 'converts', 'preserves', or
 * 'invalid', and the corresponding <spec> for each can be either an
 * array of specs or a single spec.
 *
 * @param {string} filename the path of the YAML file to load
 * @param {function} format the format function to test
 * @return {void}
 */
const runSpec = (filename, format) => {
  const data = yaml.safeLoad(fs.readFileSync(filename));

  assert(Array.isArray(data.tests),
         'YAML data .tests should be an array');

  beforeEach(function() {
    this.format = format;
  });

  describe(data.name, function() {
    testAll(data.tests);
  });
};

/**
 * Run an array of test groups, in which each has the YAML schema:
 *
 * name: string
 * pending: boolean
 * <test>: <spec>
 * tests: [<groups>]
 *
 * @param {array<object>} tests
 * @return {void}
 */
const testAll = (tests) => {
  tests.forEach(test => {
    const desc = test.pending ? xdescribe : describe;
    desc(test.name, function() {
      testOne(test);
    });
  });
};

/**
 * Run a single test grouping.
 *
 * @param {object} test
 * @return {void}
 */
const testOne = (test) => {
  Object.keys(test).forEach(key => {
    if (key in methods) {
      const method = methods[key];
      let tests = test[key];
      if (!Array.isArray(tests)) {
        tests = [tests];
      }
      tests.forEach(method, this);
    }
  });
};

const methods = {

  /**
   * @param {object|array<object>} conversions
   * @return {void}
   */
  converts: (conv) => {
    const test = (input, output) => {
      it(`converts: "${input}"`, function() {
        assert.equal(
          this.format(parseString(input)),
          output
        );
      });
    };

    if (Array.isArray(conv)) {
      conv.forEach(io => test(io.from, io.to));
    } else {
      Object.keys(conv).forEach(input => {
        test(input, conv[input]);
      });
    }
  },

  preserves: (expr) => {
    it(`preserves: "${expr}"`, function() {
      assert.equal(this.format(parseString(expr)), expr);
    });
  },

  invalid: (expr) => {
    it(`invalid: "${expr}"`, function() {
      assert.throws(() => this.format(parseString(expr)));
    });
  },

  tests: testOne
};

module.exports = runSpec;
