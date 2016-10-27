'use strict';
const assert = require('assert');
const formatFactory = require('./factory');

const getFormat = function(name, overrides) {
  var fmt;
  try {
    fmt = require('./' + name);
  } catch (error) {
    throw new Error("No such format: '" + name + "'");
  }
  return overrides ? fmt.extend(overrides) : fmt;
};

module.exports = {
  factory: formatFactory,
  defaultFormat: getFormat('nunjucks'),
  get: getFormat
};
