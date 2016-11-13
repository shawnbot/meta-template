'use strict';
const abs = require('./abstract');
const formatFactory = require('./factory');
const invariant = require('invariant');

const Assign = function(node) {
  return [
    this.C_OPEN, this.WS,
    this.K_ASSIGN, this.WS,
    this.node(node.targets[0]), this.WS,
    '=', this.WS,
    this.node(node.value), this.WS,
    this.C_CLOSE
  ].join('');
};

const Filter = function(node) {
  var name = node.name.value;

  // TODO: decide whether it's okay to use custom filters
  /*
  invariant(name in this.builtinFilters,
            'No such builtin filter: "' + name + '"');
  */

  const builtin = this.builtinFilters[name];
  if (builtin && builtin !== true) {
    name = builtin;
  }

  const args = node.args.children;
  const rest = args.length > 1
    ? ': ' + args.slice(1)
        .map(arg => this.node(arg))
        .join(', ')
    : '';

  return [
    this.node(args[0]), this.WS,
    this.FILTER_DELIM, this.WS,
    name, rest
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

const Set = function(node) {
  invariant(Array.isArray(node.targets), 'Set.targets is not an array');
  invariant(node.targets.length === 1, 'Set.targets.length !== 1');

  if (node.body) {
    return this.Capture({
      targets: node.targets,
      body: node.body.body
    });
  } else {
    return this.Assign(node);
  }
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

  operatorAliases: {
    '===': '==',
  },

  literalAliases: {
    'null': 'nil',
  },

  builtinFilters: {
    'abs': true,
    'append': true,
    'capitalize': true,
    'ceil': true,
    'date': true,
    'default': true,
    'divided_by': true,
    'downcase': true,
    'escape': true,
    'escape_once': true,
    'first': true,
    'floor': true,
    'join': true,
    'last': true,
    'lower': 'downcase',
    'lstrip': true,
    'map': true,
    'minus': true,
    'modulo': true,
    'newline_to_br': true,
    'nl2br': 'newline_to_br',
    'plus': true,
    'prepend': true,
    'remove': true,
    'remove_first': true,
    'replace': true,
    'replace_first': true,
    'reverse': true,
    'round': true,
    'rstrip': true,
    'size': true,
    'slice': true,
    'sort': true,
    'split': true,
    'strip': true,
    'striptags': 'strip_html',
    'strip_html': true,
    'strip_newlines': true,
    'times': true,
    'title': 'capitalize',
    'truncate': true,
    'truncatewords': true,
    'uniq': true,
    'upcase': true,
    'upper': 'upcase',
    'urlencode': 'url_encode',
    'url_encode': true,
  },

  Add:          Operator('plus'),
  Assign:       Assign,
  Capture:      abs.Capture,
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
  Set:          Set,
  Sub:          Operator('minus'),
  Symbol:       abs.Symbol,
  TemplateData: abs.TemplateData
});
