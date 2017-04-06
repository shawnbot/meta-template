'use strict';
const assert = require('assert');
const path = require('path');
const read = require('fs').readFileSync;
const spawn = require('child_process').spawnSync;

const parse = require('../parse');

const FIXTURES = [
  'symbol',
  'include',
];

const FORMATS = [
  'nunjucks',
  'handlebars',
  'liquid',
  'jekyll',
];

const FILES = {
  template: 'template.njk',
  data:     'data.json',
  expected: 'expected.txt',
};

const run = (fixture, format) => {

  const fmt = require('../format').get(format);

  const fixturePath =  path.join(__dirname, 'fixtures', fixture);
  const paths = Object.keys(FILES).reduce((files, key) => {
    files[key] = path.join(fixturePath, FILES[key]);
    return files;
  }, {});

  return new Promise((resolve, reject) => {
    parse.file(paths.template, {}, (error, node) => {
      const template = fmt(node);
      const data = read(paths.data).toString();
      const prog = path.join(__dirname, 'bin', format);

      const render = spawn(prog, [
        template,
        data
      ], {
        encoding: 'utf-8',
        cwd: fixturePath,
        stdio: ['pipe', 'pipe', process.stderr]
      });
      assert(render.stdout, 'No stdout from: ' + prog);

      const result = render.stdout.toString().trim();
      const expected = read(paths.expected).toString().trim();
      assert(expected, 'No expected file read from: ' + paths.expected);
      assert.equal(result, expected);

      resolve();
    });
  });
};

describe('integration tests', function() {
  FIXTURES.forEach(fixture => {
    describe('fixture: ' + fixture, function() {
      FORMATS.forEach(format => {
        it('format: ' + format, function() {
          return run(fixture, format);
        });
      });
    });
  });
});
