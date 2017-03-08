'use strict';
const format = require('../format');
const path = require('path');
const runSpec = require('./lib/run-spec');

describe('Liquid format', function() {
  runSpec(
    path.join(__dirname, 'liquid.spec.yml'),
    format.liquid
  );
});
