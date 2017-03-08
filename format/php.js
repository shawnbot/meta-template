'use strict';
const invariant = require('invariant');
const formatFactory = require('./factory');
const abs = require('./abstract');
const ast = require('../ast');

const NULL = 'null';

const If = function(node) {
  const parts = [
    this.C_OPEN, this.WS,
    'if (', this.node(node.cond), '):', this.WS,
    this.C_CLOSE,
    this.node(node.body)
  ];
  if (node.else_) {
    // TODO: produce elseif expressions, rather than nested if/else
    parts.push(
      this.C_OPEN, this.WS,
      'else:', this.WS,
      this.C_CLOSE,
      this.node(node.else_)
    );
  }
  return parts.concat([
    this.C_OPEN, this.WS,
    'endif;', this.WS,
    this.C_CLOSE
  ]).join('');
};

const For = function(node) {
  const parts = [
    this.C_OPEN, this.WS,
    'foreach (',
    this.node(node.name),
    this.WS, 'in', this.WS,
    this.node(node.arr),
    '):', this.WS,
    this.C_CLOSE
  ];

  // TODO: node.else_

  return parts.concat([
    this.node(node.body),
    this.C_OPEN, this.WS,
    'endforeach;', this.WS,
    this.C_CLOSE
  ]).join('');
};

const isFunctionName = (node) => {
  const parent = node.parent
  return parent &&
    ast.getNodeType(parent) === 'Filter' &&
    parent.name === node;
};

const Symbol = function(node) {
  const value = node.value;
  return isFunctionName(node) || value === NULL
    ? abs.Symbol.call(this, node)
    : this.VAR_PREFIX + value;
};

const Filter = function(node) {
  // XXX: render as a Call expression?
  const args = node.args.children;

  let name = node.name.value;
  const builtin = this.builtinFilters[name];
  if (builtin && builtin !== true) {
    name = builtin;
  }

  return [
    name,
    '(',
    args.map(arg => this.node(arg)).join(', '),
    ')'
  ].join('');
};

const Set = function(node) {
  invariant(node.targets.length === 1,
            'PHP does not support setting > 1 variable at a time');
  if (node.body) {
    return [
      this.C_OPEN, this.WS,
      'ob_start(PHP_OUTPUT_HANDLER_FLUSHABLE);',
      this.WS, this.C_CLOSE,
      this.node(node.body.body),
      this.C_OPEN, this.WS,
      this.Symbol(node.targets[0]), this.WS,
      '=', this.WS, 'ob_get_flush();', this.WS,
      this.C_CLOSE
    ].join('');
  } else {
    return [
      this.C_OPEN, this.WS,
      this.Symbol(node.targets[0]), this.WS,
      '=', this.WS,
      this.node(node.value), ';', this.WS,
      this.C_CLOSE
    ].join('');
  }
};

const accessor = function(symbol) {
  return '[' + this.quote(symbol, true) + ']';
};

module.exports = formatFactory({
  WS:           ' ',

  C_OPEN:       '<?php',
  C_CLOSE:      '?>',

  O_OPEN:       '<?=',
  O_CLOSE:      '?>',

  VAR_PREFIX:   '$',

  P_NUMERIC:    abs.P_NUMERIC,
  P_WORD:       abs.P_WORD,

  builtinFilters: {
    'striptags':  'strip_tags',
    'urlencode':  true,
    'upper':      'strtoupper',
    'lower':      'strtolower',
    'nl2br':      true,
  },

  literalAliases: {
    'null': 'NULL',
  },

  quote:        abs.quote,
  accessor:     accessor,

  Add:          abs.Operator('+'),
  Compare:      abs.Compare,
  Div:          abs.Operator('/'),
  If:           If,
  Filter:       Filter,
  For:          For,
  Literal:      abs.Literal,
  LookupVal:    abs.LookupVal,
  Mul:          abs.Operator('*'),
  NodeList:     abs.NodeList,
  Output:       abs.Output,
  Root:         abs.NodeList,
  Set:          Set,
  Sub:          abs.Operator('-'),
  Symbol:       Symbol,
  TemplateData: abs.TemplateData
});
