'use strict';
const format = require('../format');
const path = require('path');
const runSpec = require('./lib/run-spec');

describe('Jekyll format (Liquid + extensions)', function() {
  runSpec(
    path.join(__dirname, 'liquid.spec.yml'),
    format.jekyll
  );
  runSpec(
    path.join(__dirname, 'jekyll.spec.yml'),
    format.jekyll
  );
});
