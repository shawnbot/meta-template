'use strict';
const formatFactory = require('./factory');

const PATTERN_NUMERIC = /^\d+(\.\d+)?$/;
const PATTERN_WORD = /^[a-z]\w*$/i;

const If = function(node) {
  const parts = [
    this.CTRL_START, ' if (', this.node(node.cond), '): ', this.CTRL_END,
    this.node(node.body)
  ];
  if (node.else_) {
    // TODO: produce elseif expressions, rather than nested if/else
    parts.push(
      this.CTRL_START, ' else: ', this.CTRL_END,
      this.node(node.else_)
    );
  }
  return parts.concat([
    this.CTRL_START, ' endif; ', this.CTRL_END
  ]).join('');
};

const For = function(node) {
  const parts = [
    this.CTRL_START, ' for ', this.node(node.name),
    ' in ', this.node(node.arr), ' ', this.CTRL_END
  ];

  // TODO: node.else_

  return parts.concat([
    this.node(node.body),
    this.CTRL_START, ' endfor ', this.CTRL_END
  ]).join('');
};

const LookupVal = function(node) {
  var target = node.target;
  var stack = [node.val.value];
  while (target.type === 'LookupVal') {
    stack.unshift(target.val.value);
    target = target.target;
  }
  return stack.reduce((str, symbol) => {
    var out = this.quote(symbol, true);
    return str + '[' + out + ']';
  }, target.value);
};

const Literal = function(node) {
  return this.quote(node.value, true);
};

const Output = function(node) {
  return node.children.map(child => {
    var out = this.node(child, node);
    return child.type === 'TemplateData'
      ? out
      : [this.VAR_START, ' ', this.VAR_PREFIX, out, ' ', this.VAR_END].join('');
  }).join('');
};

const NodeList = function(node) {
  return node.children.map(child => this.node(child)).join('');
};

const TemplateData = function(node) {
  return node.value;
};

const Symbol = function(node, parent) {
  return node.value;
};

const Compare = function(node) {
  return [
    this.VAR_PREFIX + this.node(node.expr),
    node.ops[0].type,
    this.node(node.ops[0].expr, node)
  ].join(' ');
};

const Filter = function(node) {
  var args = node.args.children;
  return [
    this.node(args[0]),
    ' | ',
    this.node(node.name),
    args.length > 1
      ? '(' + args.slice(1)
          .map(arg => this.node(arg))
          .join(', ') + ')'
      : ''
  ].join('');
};

const quote = function(symbol, force) {
  if (PATTERN_NUMERIC.test(symbol)) {
    return symbol;
  }
  return (!force && PATTERN_WORD.test(symbol))
    ? symbol
    : "'" + symbol.replace(/'/g, "\\'") + "'";
};

module.exports = formatFactory({
  CTRL_START:   '<?php',
  CTRL_END:     '?>',
  VAR_PREFIX:   '$',
  VAR_START:    '<?=',
  VAR_END:      '?>',
  quote:        quote,
  Compare:      Compare,
  If:           If,
  Filter:       Filter,
  For:          For,
  Literal:      Literal,
  LookupVal:    LookupVal,
  NodeList:     NodeList,
  Output:       Output,
  Root:         NodeList,
  Symbol:       Symbol,
  TemplateData: TemplateData
});
