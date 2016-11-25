'use strict';
const abs = require('./abstract');
const invariant = require('invariant');
const formatFactory = require('./factory');

const If = function(node) {
  let K_IF = this.K_IF;

  if (node.cond.type == 'Not') {
    K_IF = this.K_IF_NOT
    this._chomp(node.cond.target);
  }
  else {
    this._chomp(node.cond);
  }


  const parts = [
    this.C_OPEN,
    K_IF, this.WS,
    this.node(node.cond),
    this.C_CLOSE,
    this.node(node.body)
  ];

  this._spit(node.cond);

  if (node.else_) {
    parts.push(
      this.C_OPEN,
      this.K_ELSE,
      this.C_CLOSE,
      this.node(node.else_)
    );
  }

  parts.push(
    this.C_OPEN,
    this.K_END_IF,
    this.C_CLOSE
  );

  return parts.join('');
};

const _chomp = function(node) {
  switch (node.type) {
    case 'Symbol':
      this._context.unshift(node.value);
      break;

    case 'LookupVal':
      var target = node.target;
      var depth = 1;
      while (target.type === 'LookupVal') {
        this._context.unshift(target.val.value);
        target = target.target;
        depth++;
      }
      this._context.unshift(target.value);
      node._lookupDepth = depth;
      break;

    default:
      throw new Error('Expected Symbol or LookupVal, but got "' +
                      node.type + '"');
  }
};

const _spit = function(node) {
  switch (node.type) {
    case 'Symbol':
      this._context.shift();
      break;

    case 'LookupVal':
      invariant(node._lookupDepth, 'Missing _lookupDepth in _spit()');
      this._context.splice(0, node._lookupDepth);
      break;
  }
};

const For = function(node) {

  this._chomp(node.name);

  const parts = [
    '{{#each ',
    this.node(node.arr),
    '}}',
    this.node(node.body)
  ];

  this._spit(node.name);

  parts.push('{{/each}}');

  return parts.join('');
};

const Symbol = function(node) {
  const value = node.value;
  return this.P_IDENTIFIER.test(value)
    ? value
    : '[' + value + ']';
};

const LookupVal = function(node) {

  const stack = [node.val.value];
  var target = node.target;
  while (target.type === 'LookupVal') {
    stack.unshift(target.val.value);
    target = target.target;
  }
  stack.unshift(target.value);

  var i = 0;
  while (this._context[i] && stack[0] === this._context[i]) {
    // console.warn('trimming:', stack[0], '@', i);
    stack.shift();
    i++;
  }

  if (stack.length === 0) {
    return '.';
  } else if (stack.length === 1) {
    return this.Symbol({value: stack[0]});
  } else {
    return stack.reduce((out, symbol) => {
      return out + this.accessor(symbol);
    }, stack.shift());
  }
};

const quote = function(symbol) {
  // symbols are never quoted, even in accessor expressions
  return symbol;
};

const accessor = function(symbol) {
  // any valid JavaScript identifier just gets a leading ".";
  // otherwise, we "escape" the symbol with brackets
  return this.P_IDENTIFIER.test(symbol)
    ? '.' + symbol
    : '.[' + symbol + ']';
};

module.exports = formatFactory({
  WS:           '',

  // note that our control structure open and close delimiters
  // do *not* include the leading #, since some keyword equivalents
  // do not use it ("^" for else, etc.)
  C_OPEN:       '{{',
  C_CLOSE:      '}}',
  // for parity with other templating systems,
  // output should *not* be HTML-escaped (double curlies)
  O_OPEN:       '{{{',
  O_CLOSE:      '}}}',

  K_IF:         '#if ',
  K_IF_NOT:     '^if ',
  K_ELSE:       'else',
  K_END_IF:     '/if',

  K_EACH:       '#each ',
  K_END_EACH:   '/each',

  If:           If,
  For:          For,

  // current symbol context
  _context:     [],

  // regex matching bare words (not requiring quotes)
  P_IDENTIFIER: /^[a-z]\w*$/i,

  quote:        quote,
  accessor:     accessor,
  _chomp:       _chomp,
  _spit:        _spit,

  Literal:      abs.Literal,
  LookupVal:    LookupVal,
  NodeList:     abs.NodeList,
  Not:          abs.Not,
  Output:       abs.Output,
  Root:         abs.Root,
  Symbol:       Symbol,
  TemplateData: abs.TemplateData,

});
