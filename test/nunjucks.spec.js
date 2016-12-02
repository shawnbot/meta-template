'use strict';
const format = require('../format');
const path = require('path');
const runSpec = require('./lib/run-spec');

describe('nunjucks (noop)', function() {
  runSpec(
    path.join(__dirname, 'nunjucks.spec.yml'),
    format.nunjucks
  );
});
