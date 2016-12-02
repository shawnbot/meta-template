'use strict';
const format = require('../format');
const path = require('path');
const runSpec = require('./lib/run-spec');

describe('handlebars format', function() {
  runSpec(
    path.join(__dirname, 'handlebars.spec.yml'),
    format.handlebars
  );
});
