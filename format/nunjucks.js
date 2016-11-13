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
  K_ELSE_IF:    'elif',       // NB: 'elseif' is also allowed
  K_END_IF:     'endif',
  K_FOR:        'for',
  K_END_FOR:    'endfor',
  K_FOR_IN:     'in',
  K_BLOCK:      'block',
  K_END_BLOCK:  'endblock',
  K_EXTENDS:    'extends',
  K_INCLUDE:    'include',

  C_OPEN:       '{%',
  C_CLOSE:      '%}',
  O_OPEN:       '{{',
  O_CLOSE:      '}}',

  P_NUMERIC:    abs.P_NUMERIC,
  P_WORD:       abs.P_WORD,

  FILTER_DELIM: '|',

  quote:        abs.quote,
  accessor:     abs.accessor,

  Add:          abs.Operator('+'),
  Block:        abs.Block,
  Compare:      abs.Compare,
  Div:          abs.Operator('/'),
  Extends:      abs.Extends,
  Filter:       Filter,
  For:          abs.For,
  Group:        abs.Group,
  If:           abs.If,
  Include:      abs.Include,
  Literal:      abs.Literal,
  LookupVal:    abs.LookupVal,
  Mul:          abs.Operator('*'),
  NodeList:     abs.NodeList,
  Output:       abs.Output,
  Root:         abs.NodeList,
  Sub:          abs.Operator('-'),
  Symbol:       abs.Symbol,
  TemplateData: abs.TemplateData
});
