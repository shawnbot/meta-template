'use strict';
const format = require('../format');
const path = require('path');
const runSpec = require('./run');

describe('ERB format', function() {
  runSpec(
    path.join(__dirname, 'erb.spec.yml'),
    format.erb
  );
});
