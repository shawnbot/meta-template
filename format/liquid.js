'use strict';
const formatFactory = require('./factory');
const abs = require('./abstract');
const ast = require('../ast');

const Filter = function(node) {
  const args = node.args.children;
  const rest = args.length > 1
    ? ': ' + args.slice(1)
        .map(arg => this.node(arg))
        .join(', ')
    : '';
  return [
    this.node(args[0]), this.WS,
    this.FILTER_DELIM, this.WS,
    this.node(node.name),
    rest
  ].join('');
};

const Operator = (filter) => {
  return function(node) {
    return this.Filter({
      name: {
        type: 'Symbol',
        value: filter
      },
      args: {
        children: [
          node.left,
          node.right
        ]
      }
    });
  };
};

module.exports = formatFactory({
  // whitespace
  WS:           ' ',

  // keywords
  K_ASSIGN:     'assign',
  K_IF:         'if',
  K_ELSE:       'else',
  K_ELSE_IF:    'elif',
  K_END_IF:     'endif',
  K_FOR:        'for',
  K_END_FOR:    'endfor',
  K_FOR_IN:     'in',
  K_INCLUDE:    'include',
  K_CAPTURE:    'capture',
  K_END_CAPTURE: 'endcapture',

  // control structure delimiters
  C_OPEN:       '{%',
  C_CLOSE:      '%}',
  // output delimiters
  O_OPEN:       '{{',
  O_CLOSE:      '}}',

  FILTER_DELIM: '|',

  BLOCK_VAR_PREFIX: 'block__',

  // quote patterns
  P_NUMERIC:    abs.P_NUMERIC,
  P_WORD:       abs.P_WORD,

  quote:        abs.quote,
  accessor:     abs.accessor,

  Add:          Operator('plus'),
  Compare:      abs.Compare,
  Div:          Operator('divided_by'),
  Filter:       Filter,
  For:          abs.For,
  If:           abs.If,
  Literal:      abs.Literal,
  LookupVal:    abs.LookupVal,
  Mul:          Operator('times'),
  NodeList:     abs.NodeList,
  Output:       abs.Output,
  Root:         abs.Root,
  Sub:          Operator('minus'),
  Symbol:       abs.Symbol,
  TemplateData: abs.TemplateData
});
