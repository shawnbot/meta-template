'use strict';
const formatFactory = require('./factory');
const abs = require('./abstract');

const Filter = function(node) {
  const args = node.args.children;
  const rest = args.length > 1
    ? '(' + args.slice(1)
        .map(arg => this.node(arg))
        .join(', ') + ')'
    : '';
  return [
    this.node(args[0]), this.WS,
    this.FILTER_DELIM, this.WS,
    this.node(node.name),
    rest
  ].join('');
};

module.exports = formatFactory({
  WS:           ' ',
  K_IF:         'if',
  K_ELSE:       'else',
  K_ELSE_IF:    'elsif',
  K_END_IF:     'endif',
  K_FOR:        'for',
  K_END_FOR:    'endfor',
  K_FOR_IN:     'in',

  C_OPEN:       '{%',
  C_CLOSE:      '%}',
  O_OPEN:       '{{',
  O_CLOSE:      '}}',

  P_NUMERIC:    abs.P_NUMERIC,
  P_WORD:       abs.P_WORD,

  FILTER_DELIM: '|',

  quote:        abs.quote,
  accessor:     abs.accessor,

  Compare:      abs.Compare,
  If:           abs.If,
  Filter:       Filter,
  For:          abs.For,
  Literal:      abs.Literal,
  LookupVal:    abs.LookupVal,
  NodeList:     abs.NodeList,
  Output:       abs.Output,
  Root:         abs.NodeList,
  Symbol:       abs.Symbol,
  TemplateData: abs.TemplateData
});
