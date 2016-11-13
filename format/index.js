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

const nunjucks = require('./nunjucks');

module.exports = {
  get: getFormat,
  factory: formatFactory,
  aliases: aliases,
  defaultFormat: nunjucks,
  nunjucks: nunjucks,
  liquid: require('./liquid'),
  jekyll: require('./jekyll'),
  handlebars: require('./handlebars'),
  php: require('./php'),
};
