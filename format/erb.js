'use strict';
const formatFactory = require('./factory');
const abs = require('./abstract');
const ast = require('../ast');

const Include = function(node) {
  return [
    this.O_OPEN, this.WS,
    this.K_INCLUDE, this.WS,
    this.node(node.template), this.WS,
    this.C_CLOSE
  ].join('');
};

const Filter = function(node) {
  const name = this.filterAliasMap[node.name.value] || node.name.value;
  return [
      name,
      '(',
      node.args.children.map(arg => this.node(arg)).join(', '),
      ')'
  ].join('');
};

const For = function(node) {
  const parts = [
    this.C_OPEN, this.WS,
    this.node(node.arr),
    '.each do |',
    this.node(node.name),
    '|', this.WS,
    this.C_CLOSE
  ];

  return parts.concat([
    this.node(node.body),
    this.C_OPEN, this.WS,
    this.K_END_FOR, this.WS,
    this.C_CLOSE
  ]).join('');
};

const Set = function(node) {
  return [
    this.C_OPEN, this.WS,
    this.node(node.targets[0]), this.WS,
    '=', this.WS,
    this.node(node.value), this.WS,
    this.C_CLOSE
  ].join('');
};

module.exports = formatFactory({
  WS:           ' ',

  K_IF:         'if',
  K_ELSE:       'else',
  K_ELSE_IF:    'elsif',       // NB: 'elseif' is also allowed
  K_END_IF:     'end',
  K_NOT:        'not',
  K_END_FOR:     'end',
  K_INCLUDE:    'render partial:',

  C_OPEN:       '<%',
  C_CLOSE:      '%>',
  O_OPEN:       '<%=',
  O_CLOSE:      '%>',

  P_NUMERIC:    abs.P_NUMERIC,
  P_WORD:       abs.P_WORD,

  quote:        abs.quote,
  accessor:     abs.accessor,

  filterAliasMap: {
    'safe': 'raw'
  },

  literalAliases: {
    'null': 'nil',
  },

  Add:          abs.Operator('+'),
  Compare:      abs.Compare,
  Div:          abs.Operator('/'),
  Filter:       Filter,
  For:          For,
  If:           abs.If,
  Include:      Include,
  Group:        abs.Group,
  Literal:      abs.Literal,
  LookupVal:    abs.LookupVal,
  Mul:          abs.Operator('*'),
  NodeList:     abs.NodeList,
  Not:          abs.Not,
  Output:       abs.Output,
  Root:         abs.NodeList,
  Set:          Set,
  Sub:          abs.Operator('-'),
  Symbol:       abs.Symbol,
  TemplateData: abs.TemplateData
});
