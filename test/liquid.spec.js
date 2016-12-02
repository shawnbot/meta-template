'use strict';
const format = require('../format');
const path = require('path');
const runSpec = require('./run');

describe('Liquid format', function() {
  runSpec(
    path.join(__dirname, 'liquid.spec.yml'),
    format.liquid
  );
});
