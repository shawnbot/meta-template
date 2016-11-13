'use strict';
const abs = require('./abstract');
const nunjucks = require('./nunjucks');

/**
 * Nunjucks is supposed to be a drop-in replacement for Jinja2,
 * which is written in Python. In order to produce Jinja-compatible
 * output, we need to alias some JS-specific operators and constants.
 */
module.exports = nunjucks.extend({
  operatorAliases: {
    '===': '==',
  },

  literalAliases: {
    'true':   'True',
    'false':  'False',
    'null':   'None',
  },
});
