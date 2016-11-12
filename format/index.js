'use strict';
const formatFactory = require('./factory');
const aliases = require('./aliases');

const getFormat = function(name, overrides) {
  if (name in aliases) {
    name = aliases[name];
  }

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
