'use strict';
const format = require('../format');
const path = require('path');
const runSpec = require('./lib/run-spec');

describe('Jinja2 ("jinja") format', function() {
  runSpec(
    path.join(__dirname, 'jinja.spec.yml'),
    format.jinja
  );
});
